import { motion, useMotionValue, animate, easeInOut } from "framer-motion";
import type { MotionProps } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, WheelEvent } from "react";
import { WhiteboardBackground } from "@/components/whiteboard/whiteboard-background";
import {
  type DemoState,
  DoodleArrow,
  HandwrittenText,
  AnimatedText,
  QuizOverlay,
  RecallInputCard,
  TeachingControls,
  SmallHandDrawnBox,
} from "./whiteboard-canvas/index";

export type { DemoState };

const OVERLAY_AREA_HEIGHT = 220;
const DEFAULT_UNLOCKED_SCALE = 0.75;
const NODE_BASE_Y = 220;
const NODE_VERTICAL_OFFSET = 80;
const NODE_HORIZONTAL_GAP = 1600;

interface WhiteboardCanvasProps {
  nodes: Array<{
    id: string;
    title: string;
    summary: string;
    vocabulary: Array<{ term: string; definition: string }>;
    thinkingQuestion?: string;
    metadata: Record<string, unknown>;
  }>;
  currentIndex: number;
  demoState: DemoState;
  onContinue?: () => void;
  onAskQuestion?: (question: string) => Promise<void>;
  onThinkingSubmit?: (response: string) => Promise<void>;
  onRecallSubmit?: (
    response: string,
    type: "partial" | "full-forward" | "full-backward" | "full-comprehensive"
  ) => Promise<void>;
  isChatSubmitting?: boolean;
  isThinkingSubmitting?: boolean;
  isRecallSubmitting?: boolean;
}

export function WhiteboardCanvas({
  nodes,
  currentIndex,
  demoState,
  onContinue,
  onAskQuestion,
  onThinkingSubmit,
  onRecallSubmit,
}: WhiteboardCanvasProps) {
  const [manualCompletedNodes, setManualCompletedNodes] = useState<Set<string>>(
    new Set()
  );
  const [textComplete, setTextComplete] = useState<Record<string, boolean>>({});
  const [titleComplete, setTitleComplete] = useState<Record<string, boolean>>(
    {}
  );
  const [summaryComplete, setSummaryComplete] = useState<
    Record<string, boolean>
  >({});
  const [chatInput, setChatInput] = useState("");
  const [isChatSubmitting, setIsChatSubmitting] = useState(false);
  const [thinkingInputs, setThinkingInputs] = useState<Record<string, string>>(
    {}
  );
  const [isThinkingSubmitting, setIsThinkingSubmitting] = useState(false);
  const [recallInput, setRecallInput] = useState("");
  const [isRecallSubmitting, setIsRecallSubmitting] = useState(false);
  const [boxDrawKey, setBoxDrawKey] = useState<Record<string, number>>({});
  const [nodeAnswers, setNodeAnswers] = useState<Record<string, string>>({});
  const [vocabComplete, setVocabComplete] = useState<Record<string, boolean>>(
    {}
  );
  const currentNodeId = nodes[currentIndex]?.id;
  const thinkingInput = currentNodeId
    ? thinkingInputs[currentNodeId] ?? ""
    : "";
  const setThinkingInput = useCallback(
    (value: string) => {
      if (!currentNodeId) return;
      setThinkingInputs((prev) => ({ ...prev, [currentNodeId]: value }));
    },
    [currentNodeId]
  );

  const handleThinkingSubmitWrapper = useCallback(
    async (response: string) => {
      if (!response.trim() || !currentNodeId) return;

      setNodeAnswers((prev) => ({ ...prev, [currentNodeId]: response }));
      setThinkingInputs((prev) => ({ ...prev, [currentNodeId]: "" }));

      if (!onThinkingSubmit) return;

      try {
        await onThinkingSubmit(response);
      } catch (error) {
        console.error("Thinking submit failed:", error);
        setNodeAnswers((prev) => {
          const next = { ...prev };
          delete next[currentNodeId];
          return next;
        });
      }
    },
    [currentNodeId, onThinkingSubmit]
  );

  // Motion Values for robust drag/animation handling
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const derivedCompletedNodes = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < currentIndex; i++) {
      const node = nodes[i];
      if (node) set.add(node.id);
    }
    return set;
  }, [nodes, currentIndex]);

  const visibleCompletedNodes = useMemo(() => {
    const union = new Set(derivedCompletedNodes);
    manualCompletedNodes.forEach((id) => union.add(id));
    return union;
  }, [derivedCompletedNodes, manualCompletedNodes]);

  // Node positions - evenly spaced along X, slight vertical variance, anchored to baseline
  const nodePositions = useMemo(
    () =>
      nodes.map((_, idx) => ({
        x: idx * NODE_HORIZONTAL_GAP,
        y: NODE_BASE_Y + (idx % 2 === 0 ? 0 : NODE_VERTICAL_OFFSET),
      })),
    [nodes]
  );

  const highestCompletedIndex = useMemo(() => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (visibleCompletedNodes.has(nodes[i].id)) {
        return i;
      }
    }
    return -1;
  }, [nodes, visibleCompletedNodes]);

  const historicalArrows = useMemo(() => {
    if (nodePositions.length < 2) return [];
    const limit = Math.min(highestCompletedIndex, nodePositions.length - 1);
    if (limit < 0) return [];
    return Array.from({ length: limit }, (_, idx) => {
      const start = nodePositions[idx];
      const end = nodePositions[idx + 1];
      if (!start || !end) return null;
      return { start, end, key: `history-${idx}` };
    }).filter(Boolean) as Array<{
      start: { x: number; y: number };
      end: { x: number; y: number };
      key: string;
    }>;
  }, [highestCompletedIndex, nodePositions]);

  const currentArrow =
    currentIndex > 0 &&
    currentIndex > highestCompletedIndex &&
    nodePositions[currentIndex - 1] &&
    nodePositions[currentIndex]
      ? {
          start: nodePositions[currentIndex - 1],
          end: nodePositions[currentIndex],
          key: `current-${currentIndex}`,
        }
      : null;

  const renderedArrows = currentArrow
    ? [currentArrow, ...historicalArrows]
    : historicalArrows;

  const currentPosition = nodePositions[currentIndex] || { x: 0, y: 0 };

  // Locking Logic: Lock camera during recall, quiz, or transitions (handled by useEffect override)
  const isLocked = demoState.phase === "recall" || demoState.phase === "quiz";
  const isFullRecall =
    demoState.phase === "recall" &&
    (demoState.recallType === "full-forward" ||
      demoState.recallType === "full-backward" ||
      demoState.recallType === "full-comprehensive");

  useEffect(() => {
    if (demoState.aiThinking) return;
    const nodeId = nodes[currentIndex]?.id;
    if (!nodeId || derivedCompletedNodes.has(nodeId)) return;

    const timer = setTimeout(() => {
      setManualCompletedNodes((prev) => {
        if (prev.has(nodeId)) return prev;
        const next = new Set(prev);
        next.add(nodeId);
        return next;
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentIndex, nodes, demoState.aiThinking, derivedCompletedNodes]);

  // Camera Logic Effect
  useEffect(() => {
    // Only auto-center when locked (recall/quiz)
    if (isLocked) {
      let targetX = -currentPosition.x;
      let targetY = -currentPosition.y;
      let targetScale = 1;

      if (demoState.cameraMode === "context-back" && currentIndex > 0) {
        // Show current and previous node
        const prevPos = nodePositions[currentIndex - 1];
        const midX = (currentPosition.x + prevPos.x) / 2;
        const midY = (currentPosition.y + prevPos.y) / 2;
        targetX = -midX;
        targetY = -midY;
        targetScale = 0.75; // Less aggressive zoom
      } else if (
        demoState.cameraMode === "context-forward" &&
        currentIndex < nodes.length - 1
      ) {
        // Show current and next node
        const nextPos = nodePositions[currentIndex + 1];
        const midX = (currentPosition.x + nextPos.x) / 2;
        const midY = (currentPosition.y + nextPos.y) / 2;
        targetX = -midX;
        targetY = -midY;
        targetScale = 0.75; // Less aggressive zoom
      } else if (demoState.phase === "quiz") {
        // Overview mode for quiz
        targetScale = 0.6;
        targetX = -1000; // Center roughly
        targetY = 0;
      } else if (demoState.recallType === "full-comprehensive") {
        // Show erased node + both neighbors (Center on current, zoom out)
        targetX = -currentPosition.x;
        targetY = -currentPosition.y;
        targetScale = 0.6;
      } else if (
        demoState.recallType === "full-forward" &&
        currentIndex < nodes.length - 1
      ) {
        // Show current + next (Center between them)
        const nextPos = nodePositions[currentIndex + 1];
        const midX = (currentPosition.x + nextPos.x) / 2;
        const midY = (currentPosition.y + nextPos.y) / 2;
        targetX = -midX;
        targetY = -midY;
        targetScale = 0.75;
      } else if (demoState.recallType === "full-backward" && currentIndex > 0) {
        // Show prev + current (Center between them)
        const prevPos = nodePositions[currentIndex - 1];
        const midX = (currentPosition.x + prevPos.x) / 2;
        const midY = (currentPosition.y + prevPos.y) / 2;
        targetX = -midX;
        targetY = -midY;
        targetScale = 0.75;
      }

      // Animate to target only when locked
      animate(x, targetX, { duration: 1.2, ease: easeInOut });
      animate(y, targetY, { duration: 1.2, ease: easeInOut });
      animate(scale, targetScale, { duration: 1.2, ease: easeInOut });
    }
  }, [
    currentIndex,
    nodes,
    currentPosition,
    x,
    y,
    scale,
    demoState.cameraMode,
    demoState.phase,
    isLocked,
    nodePositions,
  ]);

  useEffect(() => {
    if (isLocked) return;
    x.set(-currentPosition.x);
    y.set(-currentPosition.y);
    scale.set(DEFAULT_UNLOCKED_SCALE);
  }, [
    currentIndex,
    currentPosition.x,
    currentPosition.y,
    isLocked,
    scale,
    x,
    y,
  ]);

  // Wheel Zoom Handler
  const handleWheel = (e: WheelEvent) => {
    if (isLocked) return;

    const currentScale = scale.get();
    const zoomIntensity = e.ctrlKey || Math.abs(e.deltaY) < 1 ? 0.0025 : 0.0015;
    const zoomDelta = e.deltaY * -zoomIntensity;
    const newScale = Math.min(Math.max(currentScale + zoomDelta, 0.2), 3);

    animate(scale, newScale, { duration: 0.1 });
  };

  return (
    <div
      className={`absolute inset-0 bg-white overflow-hidden flex items-center justify-center ${
        isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      }`}
      onWheel={handleWheel}
    >
      {/* Background Elements */}
      <WhiteboardBackground />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Canvas Container */}
      <motion.div
        className="relative"
        style={{ x, y, scale }}
        drag={!isLocked}
        dragMomentum={false}
      >
        {/* Hit Area for Dragging - Huge transparent box centered on origin */}
        <div className="absolute -top-[5000px] -left-[5000px] w-[10000px] h-[10000px] bg-transparent z-0" />

        {/* Persistent Arrows between nodes */}
        {renderedArrows.map((arrow) => (
          <DoodleArrow
            key={arrow.key}
            start={arrow.start}
            end={arrow.end}
            delay={0.05}
          />
        ))}
        {nodes.map((node, idx) => {
          const pos = nodePositions[idx];
          const isCurrent = idx === currentIndex;
          const isCompleted = visibleCompletedNodes.has(node.id);
          const hasBeenVisited = isCompleted || idx < currentIndex;
          const disableAnimations = hasBeenVisited;
          const getInitial = <T extends MotionProps["initial"]>(value: T) =>
            disableAnimations ? undefined : value;
          const getTransition = <T extends MotionProps["transition"]>(
            value: T
          ) => (disableAnimations ? { duration: 0 } : value);
          const feedbackKey = `feedback-${node.id}`;
          const isFeedbackPhase = isCurrent && demoState.subPhase === "content";
          const hasFeedbackText =
            isFeedbackPhase && Boolean(demoState.thinkingFeedback);
          const isAITyping = isFeedbackPhase && Boolean(demoState.aiThinking);
          const isVisible =
            idx <= currentIndex ||
            demoState.phase === "quiz" ||
            (demoState.cameraMode === "context-forward" &&
              idx === currentIndex + 1) ||
            (demoState.recallType === "full-comprehensive" &&
              Math.abs(idx - currentIndex) <= 1) ||
            (demoState.recallType === "full-forward" &&
              idx === currentIndex + 1);
          // Recall Logic
          const isErasedNode = demoState.erasedNodeId === node.id;
          const isFullRecall =
            isErasedNode &&
            (demoState.recallType === "full-forward" ||
              demoState.recallType === "full-backward" ||
              demoState.recallType === "full-comprehensive");
          const isPartialRecall =
            isErasedNode && demoState.recallType === "partial";
          const feedbackReady =
            disableAnimations ||
            !isCurrent ||
            !isFeedbackPhase ||
            (!isAITyping && (!hasFeedbackText || titleComplete[feedbackKey]));
          const titleReady =
            disableAnimations || !isCurrent || titleComplete[node.id];
          const contentReady = feedbackReady && titleReady;
          const summaryFinished = disableAnimations || summaryComplete[node.id];
          const vocabFinished =
            disableAnimations ||
            isPartialRecall ||
            node.vocabulary.length === 0 ||
            vocabComplete[node.id];
          const controlsReady =
            contentReady && summaryFinished && vocabFinished;

          return (
            <motion.div
              key={node.id}
              initial={getInitial({ opacity: isCompleted ? 1 : 0 })}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={getTransition({ duration: isCompleted ? 0 : 0.5 })}
            >
              {/* Node Content Card */}
              <div
                className={`absolute transition-all duration-500 ${
                  isCurrent
                    ? "opacity-100 scale-100"
                    : demoState.phase === "teaching"
                    ? "opacity-100 scale-100"
                    : "opacity-40 scale-95"
                }`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: "translateX(-50%)",
                  zIndex: 10,
                }}
              >
                {/* Full Recall Mode: Replace Card with Recall Input */}
                {isFullRecall ? (
                  <RecallInputCard
                    demoState={demoState}
                    recallInput={recallInput}
                    setRecallInput={setRecallInput}
                    isRecallSubmitting={isRecallSubmitting}
                    setIsRecallSubmitting={setIsRecallSubmitting}
                    onRecallSubmit={onRecallSubmit}
                    onContinue={onContinue}
                  />
                ) : (
                  /* Standard Node Card (Teaching / Partial Recall) */
                  <div className="min-w-[500px] max-w-[1000px] w-max relative">
                    {/* Context/Hint Label for non-erased nodes during recall */}
                    {demoState.phase === "recall" && !isErasedNode && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 px-4 py-1 rounded-full font-sans font-bold text-sm uppercase tracking-wider shadow-sm border border-amber-200">
                        Context Hint
                      </div>
                    )}
                    <div
                      className="relative inline-block w-full mb-12"
                      style={{ paddingTop: OVERLAY_AREA_HEIGHT }}
                    >
                      <div
                        className="absolute left-0 right-0 top-0"
                        style={{ height: OVERLAY_AREA_HEIGHT }}
                      >
                        <div className="h-full flex flex-col justify-end gap-4">
                          <div className="flex items-start gap-3 max-w-4xl w-full">
                            <span className="h-4 w-4 rounded-full bg-green-500 inline-block shrink-0 mt-2" />
                            <div className="flex-1" style={{ minHeight: 110 }}>
                              {demoState.aiThinking &&
                                isCurrent &&
                                demoState.subPhase === "content" && (
                                  <motion.div
                                    className="text-2xl font-chalk text-gray-800 leading-relaxed text-left italic"
                                    initial={getInitial({ opacity: 0, y: -10 })}
                                    animate={{ opacity: 1, y: 0 }}
                                  >
                                    Thinking...
                                  </motion.div>
                                )}

                              {demoState.thinkingFeedback &&
                                isCurrent &&
                                demoState.subPhase === "content" && (
                                  <motion.div
                                    className="text-2xl font-chalk text-gray-800 leading-relaxed text-left"
                                    initial={getInitial(
                                      isCompleted
                                        ? { opacity: 1, y: 0 }
                                        : { opacity: 0, y: -10 }
                                    )}
                                    animate={{ opacity: 1, y: 0 }}
                                  >
                                    <HandwrittenText
                                      text={demoState.thinkingFeedback}
                                      instant={disableAnimations}
                                      onComplete={() =>
                                        setTitleComplete((prev) => ({
                                          ...prev,
                                          [feedbackKey]: true,
                                        }))
                                      }
                                    />
                                  </motion.div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {feedbackReady && (
                        <div className="relative">
                          <motion.h2
                            className="text-4xl font-chalk font-bold text-gray-900 leading-tight"
                            initial={getInitial({ opacity: 0 })}
                            animate={{ opacity: 1 }}
                            transition={getTransition({
                              delay: demoState.thinkingFeedback ? 0.5 : 0.2,
                            })}
                            onAnimationComplete={() =>
                              setTitleComplete((prev) => ({
                                ...prev,
                                [node.id]: true,
                              }))
                            }
                          >
                            {node.title}
                          </motion.h2>

                          <motion.svg
                            className="absolute -bottom-6 left-0 w-full h-6 pointer-events-none"
                            viewBox="0 0 100 10"
                            preserveAspectRatio="none"
                            initial={getInitial({ opacity: 0 })}
                            animate={{ opacity: 1 }}
                            transition={getTransition({
                              delay: demoState.thinkingFeedback ? 0.7 : 0.4,
                            })}
                          >
                            <motion.path
                              d="M 0,5 Q 25,3 50,5 T 100,5"
                              stroke="#1e293b"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              fill="none"
                              initial={getInitial({ pathLength: 0 })}
                              animate={{ pathLength: 1 }}
                              transition={getTransition({
                                duration: 0.6,
                                ease: easeInOut,
                                delay: demoState.thinkingFeedback ? 0.8 : 0.5,
                              })}
                            />
                          </motion.svg>
                        </div>
                      )}
                    </div>

                    {/* Summary Section - Only show after AI feedback & title are ready */}
                    {contentReady && (
                      <>
                        <div
                          className="relative px-3 py-2"
                          style={{ zIndex: 1 }}
                        >
                          <AnimatedText
                            text={node.summary}
                            vocabulary={node.vocabulary.map((v) => v.term)}
                            startDelay={
                              titleComplete[node.id]
                                ? demoState.thinkingFeedback
                                  ? 1.5
                                  : 1.0
                                : demoState.thinkingFeedback
                                ? 1.7
                                : 1.2
                            }
                            isActive={isVisible && contentReady}
                            isErased={isPartialRecall}
                            simulatedInput={
                              isPartialRecall
                                ? demoState.simulatedInput
                                : undefined
                            }
                            feedback={
                              isPartialRecall ? demoState.feedback : undefined
                            }
                            skipAnimation={disableAnimations || isCompleted}
                            onComplete={() => {
                              setSummaryComplete((prev) => ({
                                ...prev,
                                [node.id]: true,
                              }));
                              setTextComplete((prev) => ({
                                ...prev,
                                [node.id]: true,
                              }));
                              setBoxDrawKey((prev) => ({
                                ...prev,
                                [node.id]: (prev[node.id] || 0) + 1,
                              }));
                            }}
                            onReset={() => {
                              setSummaryComplete((prev) => {
                                if (!prev[node.id]) return prev;
                                const next = { ...prev };
                                delete next[node.id];
                                return next;
                              });
                              setTextComplete((prev) => {
                                if (!prev[node.id]) return prev;
                                const next = { ...prev };
                                delete next[node.id];
                                return next;
                              });
                              setBoxDrawKey((prev) => {
                                if (!prev[node.id]) return prev;
                                const next = { ...prev };
                                delete next[node.id];
                                return next;
                              });
                              setVocabComplete((prev) => {
                                if (!prev[node.id]) return prev;
                                const next = { ...prev };
                                delete next[node.id];
                                return next;
                              });
                            }}
                            onPartialSubmit={async (term, input) => {
                              // Check if the answer is correct (case-insensitive)
                              const correct =
                                term.toLowerCase() ===
                                input.toLowerCase().trim();
                              return { correct };
                            }}
                            onAllTermsSubmitted={() => {
                              // All terms submitted, move to next recall step
                              onContinue?.();
                            }}
                          />
                        </div>

                        {/* Partial Recall Notice */}
                        {isPartialRecall && isCurrent && summaryFinished && (
                          <motion.div
                            className="mt-6 text-center"
                            initial={getInitial({ opacity: 0, y: 10 })}
                            animate={{ opacity: 1, y: 0 }}
                            transition={getTransition({ delay: 1.5 })}
                          >
                            <p className="text-lg font-chalk text-gray-600 italic">
                              💡 Press{" "}
                              <span className="font-bold text-blue-600">
                                Enter
                              </span>{" "}
                              after typing to submit each answer
                            </p>
                          </motion.div>
                        )}

                        {/* Vocabulary List with Definitions - Hidden during Partial Recall */}
                        {!isPartialRecall && isVisible && summaryFinished && (
                          <div className="mt-12 flex flex-col gap-3 text-2xl font-chalk text-gray-900">
                            {node.vocabulary.map((vocab, vocabIdx) => {
                              // Calculate dynamic delays based on content length
                              const summaryDuration =
                                node.summary.length * 0.04; // ~40ms per char to be safe
                              const feedbackDelay = demoState.thinkingFeedback
                                ? 0.5
                                : 0;
                              const baseVocabDelay =
                                1.2 + summaryDuration + 0.3 + feedbackDelay;
                              const vocabDelay = isCompleted
                                ? 0
                                : baseVocabDelay + vocabIdx * 0.6;

                              return (
                                <motion.li
                                  key={vocab.term}
                                  className="list-none"
                                  initial={getInitial({ opacity: 0 })}
                                  animate={{ opacity: 1 }}
                                  transition={getTransition({
                                    delay: vocabDelay,
                                  })}
                                >
                                  <span className="font-bold inline-flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-orange-400 inline-block" />
                                    <span className="underline decoration-2 decoration-sky-500">
                                      <HandwrittenText
                                        text={vocab.term}
                                        delay={0}
                                        instant={
                                          disableAnimations || isCompleted
                                        }
                                      />
                                    </span>
                                  </span>
                                  <motion.span
                                    className="block text-xl leading-snug ml-5 text-gray-700"
                                    initial={getInitial({ opacity: 0 })}
                                    animate={{ opacity: 1 }}
                                    transition={getTransition({
                                      delay: vocabDelay + 0.3,
                                    })}
                                    onAnimationComplete={() => {
                                      if (
                                        !disableAnimations &&
                                        vocabIdx === node.vocabulary.length - 1
                                      ) {
                                        setVocabComplete((prev) =>
                                          prev[node.id]
                                            ? prev
                                            : { ...prev, [node.id]: true }
                                        );
                                      }
                                    }}
                                  >
                                    <HandwrittenText
                                      text={vocab.definition}
                                      delay={0}
                                      instant={disableAnimations || isCompleted}
                                    />
                                  </motion.span>
                                </motion.li>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}

                    {/* Phase-Specific Interactions (Teaching) */}
                    {/* Phase-Specific Interactions (Teaching) */}
                    {isCurrent ? (
                      <TeachingControls
                        demoState={demoState}
                        node={node}
                        chatInput={chatInput}
                        setChatInput={setChatInput}
                        isChatSubmitting={isChatSubmitting}
                        setIsChatSubmitting={setIsChatSubmitting}
                        thinkingInput={thinkingInput}
                        setThinkingInput={setThinkingInput}
                        isThinkingSubmitting={isThinkingSubmitting}
                        setIsThinkingSubmitting={setIsThinkingSubmitting}
                        contentReady={controlsReady}
                        onContinue={onContinue}
                        onAskQuestion={onAskQuestion}
                        onThinkingSubmit={handleThinkingSubmitWrapper}
                      />
                    ) : (
                      /* Show past answer if exists */
                      nodeAnswers[node.id] && (
                        <div className="mt-8 border-t-2 border-dashed border-gray-300 pt-4">
                          <p className="text-xl font-chalk text-gray-600 italic mb-2">
                            <HandwrittenText
                              text={
                                node.thinkingQuestion || "Thinking Question"
                              }
                              instant
                            />
                          </p>
                          <p className="text-2xl font-chalk text-blue-600">
                            <HandwrittenText
                              text={nodeAnswers[node.id]}
                              instant
                            />
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quiz Overlay */}
      <QuizOverlay demoState={demoState} />

      {/* Recenter Button (Only visible when camera is unlocked) */}
      {!isLocked && (
        <button
          onClick={() => {
            animate(x, -currentPosition.x, { duration: 0.8, ease: easeInOut });
            animate(y, -currentPosition.y, {
              duration: 0.8,
              ease: easeInOut,
            });
            animate(scale, DEFAULT_UNLOCKED_SCALE, {
              duration: 0.8,
              ease: easeInOut,
            });
          }}
          className="absolute bottom-6 right-6 z-40 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          title="Recenter camera"
        >
          <svg
            className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
