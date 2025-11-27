import { motion, useMotionValue, animate } from "framer-motion";
import { useState, useEffect, useRef, WheelEvent } from "react";
import { WhiteboardBackground } from "@/components/whiteboard/whiteboard-background";
import {
  type DemoState,
  DoodleArrow,
  HandwrittenText,
  AnimatedText,
  QuizOverlay,
  RecallInputCard,
  TeachingControls,
  SmallHandDrawnBox
} from "./whiteboard-canvas/index";

export type { DemoState };

interface WhiteboardCanvasProps {
  nodes: Array<{
    id: string;
    title: string;
    summary: string;
    vocabulary: Array<{ term: string; definition: string }>;
    thinkingQuestion?: string;
    metadata: Record<string, any>;
  }>;
  currentIndex: number;
  demoState: DemoState;
  onContinue?: () => void;
  onAskQuestion?: (question: string) => Promise<void>;
  onThinkingSubmit?: (response: string) => Promise<void>;
  onRecallSubmit?: (response: string, type: "partial" | "full-forward" | "full-backward" | "full-comprehensive") => Promise<void>;
  isChatSubmitting?: boolean;
  isThinkingSubmitting?: boolean;
  isRecallSubmitting?: boolean;
}

export function WhiteboardCanvas({ nodes, currentIndex, demoState, onContinue, onAskQuestion, onThinkingSubmit, onRecallSubmit }: WhiteboardCanvasProps) {
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [textComplete, setTextComplete] = useState<Record<string, boolean>>({});
  const [titleComplete, setTitleComplete] = useState<Record<string, boolean>>({});
  const [summaryComplete, setSummaryComplete] = useState<Record<string, boolean>>({});
  const [chatInput, setChatInput] = useState("");
  const [isChatSubmitting, setIsChatSubmitting] = useState(false);
  const [thinkingInput, setThinkingInput] = useState("");
  const [isThinkingSubmitting, setIsThinkingSubmitting] = useState(false);
  const [recallInput, setRecallInput] = useState("");
  const [isRecallSubmitting, setIsRecallSubmitting] = useState(false);
  const [boxDrawKey, setBoxDrawKey] = useState<Record<string, number>>({});
  const [drawnArrows, setDrawnArrows] = useState<Array<{ start: { x: number; y: number }; end: { x: number; y: number }; key: number }>>([]);
  const prevIndexRef = useRef(currentIndex);
  
  // Motion Values for robust drag/animation handling
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Node positions - increased spacing for arrow
  // Dynamically generate positions based on number of nodes
  const nodePositions = nodes.map((_, idx) => ({
    x: idx * 1600,
    y: idx % 2 === 0 ? 0 : 50, // Slight vertical offset for visual variety
  }));

  const currentPosition = nodePositions[currentIndex] || { x: 0, y: 0 };
  
  // Locking Logic: Lock camera during recall, quiz, or transitions (handled by useEffect override)
  const isLocked = demoState.phase === 'recall' || demoState.phase === 'quiz';
  const isFullRecall = demoState.phase === 'recall' && (demoState.recallType === 'full-forward' || demoState.recallType === 'full-backward' || demoState.recallType === 'full-comprehensive');

  useEffect(() => {
    // Mark node as completed after delay
    const timer = setTimeout(() => {
      setCompletedNodes(prev => new Set([...prev, nodes[currentIndex].id]));
    }, 2000);

    // Camera Logic - Only auto-center when locked (recall/quiz)
    if (isLocked) {
      let targetX = -currentPosition.x;
      let targetY = -currentPosition.y;
      let targetScale = 1;

      if (demoState.cameraMode === 'context-back' && currentIndex > 0) {
          // Show current and previous node
          const prevPos = nodePositions[currentIndex - 1];
          const midX = (currentPosition.x + prevPos.x) / 2;
          const midY = (currentPosition.y + prevPos.y) / 2;
          targetX = -midX;
          targetY = -midY;
          targetScale = 0.75; // Less aggressive zoom
      } else if (demoState.cameraMode === 'context-forward' && currentIndex < nodes.length - 1) {
          // Show current and next node
          const nextPos = nodePositions[currentIndex + 1];
          const midX = (currentPosition.x + nextPos.x) / 2;
          const midY = (currentPosition.y + nextPos.y) / 2;
          targetX = -midX;
          targetY = -midY;
          targetScale = 0.75; // Less aggressive zoom
      } else if (demoState.phase === 'quiz') {
          // Overview mode for quiz
          targetScale = 0.6;
          targetX = -1000; // Center roughly
          targetY = 0;
      } else if (demoState.recallType === 'full-comprehensive') {
          // Show erased node + both neighbors (Center on current, zoom out)
          targetX = -currentPosition.x;
          targetY = -currentPosition.y;
          targetScale = 0.6; 
      } else if (demoState.recallType === 'full-forward' && currentIndex < nodes.length - 1) {
          // Show current + next (Center between them)
          const nextPos = nodePositions[currentIndex + 1];
          const midX = (currentPosition.x + nextPos.x) / 2;
          const midY = (currentPosition.y + nextPos.y) / 2;
          targetX = -midX;
          targetY = -midY;
          targetScale = 0.75;
      } else if (demoState.recallType === 'full-backward' && currentIndex > 0) {
          // Show prev + current (Center between them)
          const prevPos = nodePositions[currentIndex - 1];
          const midX = (currentPosition.x + prevPos.x) / 2;
          const midY = (currentPosition.y + prevPos.y) / 2;
          targetX = -midX;
          targetY = -midY;
          targetScale = 0.75;
      }

      // Animate to target only when locked
      animate(x, targetX, { duration: 1.2, ease: "easeInOut" });
      animate(y, targetY, { duration: 1.2, ease: "easeInOut" });
      animate(scale, targetScale, { duration: 1.2, ease: "easeInOut" });
    }

    return () => clearTimeout(timer);
  }, [currentIndex, nodes, currentPosition, x, y, scale, demoState.cameraMode, demoState.phase, isLocked, nodePositions]);

  useEffect(() => {
    const prev = prevIndexRef.current;
    // Only draw arrows when moving FORWARD, not backward (recall)
    if (currentIndex > prev && prev >= 0 && prev < nodes.length) {
      const start = nodePositions[prev];
      const end = nodePositions[currentIndex];
      setDrawnArrows(existing => [...existing, { start, end, key: Date.now() }]);
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex, nodes.length, nodePositions]);

  // Wheel Zoom Handler
  const handleWheel = (e: WheelEvent) => {
    if (isLocked) return;
    
    const currentScale = scale.get();
    const newScale = Math.min(Math.max(currentScale + e.deltaY * -0.001, 0.2), 3);
    
    animate(scale, newScale, { duration: 0.1 });
  };

  return (
    <div 
      className={`absolute inset-0 bg-white overflow-hidden flex items-center justify-center ${isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
      onWheel={handleWheel}
    >
      {/* Background Elements */}
      <WhiteboardBackground />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
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
        {drawnArrows.map((arrow) => (
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
          const isCompleted = completedNodes.has(node.id);
          const isVisible = idx <= currentIndex || (demoState.phase === 'quiz') || 
            (demoState.cameraMode === 'context-forward' && idx === currentIndex + 1) ||
            (demoState.recallType === 'full-comprehensive' && Math.abs(idx - currentIndex) <= 1) ||
            (demoState.recallType === 'full-forward' && idx === currentIndex + 1); 
          // Recall Logic
          const isErasedNode = demoState.erasedNodeId === node.id;
          const isFullRecall = isErasedNode && (demoState.recallType === 'full-forward' || demoState.recallType === 'full-backward' || demoState.recallType === 'full-comprehensive');
          const isPartialRecall = isErasedNode && demoState.recallType === 'partial';

          return (
            <motion.div 
              key={node.id}
              initial={{ opacity: isCompleted ? 1 : 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: isCompleted ? 0 : 0.5 }}
            >
              {/* Node Content Card */}
              <div
                className={`absolute transition-all duration-500 ${isCurrent ? 'opacity-100 scale-100' : (demoState.phase === 'teaching' ? 'opacity-100 scale-100' : 'opacity-40 scale-95')}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
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
                    {demoState.phase === 'recall' && !isErasedNode && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 px-4 py-1 rounded-full font-sans font-bold text-sm uppercase tracking-wider shadow-sm border border-amber-200">
                            Context Hint
                        </div>
                    )}
                    <div className="relative inline-block mb-12">
                      {/* Thinking Feedback from previous node - shows above title */}
                      {/* Thinking Feedback - Green Dot (Moved from bottom and made relative) */}
                      {demoState.thinkingFeedback && isCurrent && demoState.subPhase === "content" && (
                        <motion.div 
                          className="flex items-start gap-3 mb-8 max-w-2xl"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="h-4 w-4 rounded-full bg-green-500 inline-block shrink-0 mt-2" />
                          <p className="text-2xl font-chalk text-gray-800 leading-relaxed text-left">
                            <HandwrittenText text={demoState.thinkingFeedback} />
                          </p>
                        </motion.div>
                      )}
                      
                      <motion.h2 
                        className="text-4xl font-chalk font-bold text-gray-900 leading-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onAnimationComplete={() => setTitleComplete(prev => ({ ...prev, [node.id]: true }))}
                      >
                        {node.title}
                      </motion.h2>
                      
                      {/* Hand-drawn underline */}
                      <motion.svg
                        className="absolute -bottom-6 left-0 w-full h-6 pointer-events-none"
                        viewBox="0 0 100 10"
                        preserveAspectRatio="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <motion.path
                          d="M 0,5 Q 25,3 50,5 T 100,5"
                          stroke="#1e293b"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6, ease: "easeInOut", delay: 0.5 }}
                        />
                      </motion.svg>
                    </div>

                    {/* Summary Section */}
                    <div 
                      className="relative px-3 py-2"
                      style={{ zIndex: 1 }}
                    >
                      <AnimatedText 
                        text={node.summary} 
                        vocabulary={node.vocabulary.map(v => v.term)}
                        startDelay={titleComplete[node.id] ? 1.0 : 1.2}
                        isActive={isVisible}
                        isErased={isPartialRecall}
                        simulatedInput={isPartialRecall ? demoState.simulatedInput : undefined}
                        feedback={isPartialRecall ? demoState.feedback : undefined}
                        onComplete={() => {
                          setSummaryComplete(prev => ({ ...prev, [node.id]: true }));
                          setTextComplete(prev => ({ ...prev, [node.id]: true }));
                          setBoxDrawKey(prev => ({ ...prev, [node.id]: (prev[node.id] || 0) + 1 }));
                        }}
                        onReset={() => {
                          setTextComplete(prev => {
                            if (!prev[node.id]) return prev;
                            const next = { ...prev };
                            delete next[node.id];
                            return next;
                          });
                          setBoxDrawKey(prev => {
                            if (!prev[node.id]) return prev;
                            const next = { ...prev };
                            delete next[node.id];
                            return next;
                          });
                        }}
                        onPartialSubmit={async (term, input) => {
                            if (onRecallSubmit) {
                                await onRecallSubmit(input, "partial");
                            }
                        }}
                      />
                    </div>

                    {/* Vocabulary List with Definitions - Hidden during Partial Recall */}
                    {!isPartialRecall && isVisible && (
                        <div className="mt-12 flex flex-col gap-3 text-2xl font-chalk text-gray-900">
                          {node.vocabulary.map((vocab, vocabIdx) => {
                            // Calculate dynamic delays based on content length
                            const summaryDuration = node.summary.length * 0.04; // ~40ms per char to be safe
                            const baseVocabDelay = 1.2 + summaryDuration + 0.3;
                            const vocabDelay = baseVocabDelay + (vocabIdx * 0.6);

                            return (
                              <motion.li 
                                key={vocab.term}
                                className="list-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: vocabDelay }}
                              >
                                <span className="font-bold inline-flex items-center gap-2">
                                  <span className="h-3 w-3 rounded-full bg-orange-400 inline-block" />
                                  <span className="underline decoration-2 decoration-sky-500">
                                    <HandwrittenText text={vocab.term} delay={0} />
                                  </span>
                                </span>
                                <motion.span 
                                  className="block text-xl leading-snug ml-5 text-gray-700"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: vocabDelay + 0.3 }}
                                >
                                  <HandwrittenText text={vocab.definition} delay={0} />
                                </motion.span>
                              </motion.li>
                            );
                          })}
                        </div>
                    )}

                    {/* Phase-Specific Interactions (Teaching) */}
                    {isCurrent && (
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
                        onContinue={onContinue}
                        onAskQuestion={onAskQuestion}
                        onThinkingSubmit={onThinkingSubmit}
                      />
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
            animate(x, -currentPosition.x, { duration: 0.8, ease: "easeInOut" });
            animate(y, -currentPosition.y, { duration: 0.8, ease: "easeInOut" });
            animate(scale, 1, { duration: 0.8, ease: "easeInOut" });
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
      )}
    </div>
  );
}
