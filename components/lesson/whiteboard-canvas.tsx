import { motion, useMotionValue, animate } from "framer-motion";
import { useState, useEffect, useRef, WheelEvent } from "react";
import { WhiteboardBackground } from "@/components/whiteboard/whiteboard-background";


export interface DemoState {
  phase: "teaching" | "prediction" | "recall" | "quiz";
  subPhase?: "content" | "user-question" | "ai-answer" | "continue" | "question" | "user-thinking-response";
  recallType?: "partial" | "full-forward" | "full-backward";
  erasedNodeId?: string;
  simulatedInput?: string;
  feedback?: "correct" | "incorrect" | null;
  grade?: string;
  quizQuestion?: string;
  contextMessage?: string;
  cameraMode?: "default" | "context-back" | "context-forward" | "overview";
  aiResponse?: string;
  userQuestion?: string;
  userThinkingResponse?: string;
  thinkingFeedback?: string;
  userResponse?: string; // For recall
}

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
  onRecallSubmit?: (response: string, type: "partial" | "full-forward" | "full-backward") => Promise<void>;
}

export function WhiteboardCanvas({ nodes, currentIndex, demoState, onContinue, onAskQuestion, onThinkingSubmit, onRecallSubmit }: WhiteboardCanvasProps) {
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [textComplete, setTextComplete] = useState<Record<string, boolean>>({});
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
    x: idx * 1200,
    y: idx % 2 === 0 ? 0 : 50, // Slight vertical offset for visual variety
  }));

  const currentPosition = nodePositions[currentIndex] || { x: 0, y: 0 };
  
  // Locking Logic: Lock camera during recall, quiz, or transitions (handled by useEffect override)
  const isLocked = demoState.phase === 'recall' || demoState.phase === 'quiz';
  const isFullRecall = demoState.phase === 'recall' && (demoState.recallType === 'full-forward' || demoState.recallType === 'full-backward');

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
          const isVisible = idx <= currentIndex || (demoState.phase === 'quiz') || (demoState.cameraMode === 'context-forward' && idx === currentIndex + 1); 
          // Recall Logic
          const isErasedNode = demoState.erasedNodeId === node.id;
          const isFullRecall = isErasedNode && (demoState.recallType === 'full-forward' || demoState.recallType === 'full-backward');
          const isPartialRecall = isErasedNode && demoState.recallType === 'partial';

          return (
            <motion.div 
              key={node.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.5 }}
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
                  <motion.div 
                    className="min-w-[500px] max-w-[800px] bg-transparent p-4 sm:p-6 relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <h3 className="text-2xl font-chalk text-gray-900 mb-4 text-center">
                        <span className="underline decoration-wavy decoration-amber-400 decoration-2">
                          {demoState.contextMessage}
                        </span>
                    </h3>
                    
                    <div className="w-full min-h-[150px] font-chalk text-2xl text-gray-900 relative px-2 py-3">
                        {demoState.grade ? (
                            // Show result if graded
                            <div className="relative">
                                <p className="whitespace-pre-wrap">{demoState.userResponse || recallInput}</p>
                                <span className="absolute -top-8 right-0 text-4xl text-green-600 font-chalk font-bold">
                                  {demoState.grade}
                                </span>
                            </div>
                        ) : (
                            // Input mode
                            <div className="relative">
                                <textarea
                                    value={recallInput}
                                    onChange={(e) => setRecallInput(e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-chalk text-2xl resize-none p-0"
                                    rows={4}
                                    disabled={isRecallSubmitting}
                                    autoFocus
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={async () => {
                                            if (!recallInput.trim() || isRecallSubmitting || !onRecallSubmit) return;
                                            setIsRecallSubmitting(true);
                                            await onRecallSubmit(recallInput, demoState.recallType || "full-forward");
                                            setIsRecallSubmitting(false);
                                        }}
                                        disabled={!recallInput.trim() || isRecallSubmitting}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-full font-sans text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isRecallSubmitting ? "Evaluating..." : "Submit Answer"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Response below user input - positioned absolutely to prevent pushing content up */}
                    {demoState.aiResponse && demoState.feedback === 'correct' && (
                      <motion.div 
                        className="absolute top-full left-0 right-0 mt-8 flex items-start gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <span className="h-4 w-4 rounded-full bg-green-500 inline-block shrink-0 mt-2" />
                        <p className="text-2xl font-chalk text-gray-800 leading-relaxed">
                          <TypewriterText text={demoState.aiResponse} />
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  /* Standard Node Card (Teaching / Partial Recall) */
                  <div className="min-w-[500px] max-w-[800px] w-max relative">
                    <div className="relative inline-block mb-12">
                      <motion.h2 
                        className="text-4xl font-chalk font-bold text-gray-900 leading-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
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
                        startDelay={0.5}
                        isActive={isVisible}
                        isErased={isPartialRecall}
                        simulatedInput={isPartialRecall ? demoState.simulatedInput : undefined}
                        feedback={isPartialRecall ? demoState.feedback : undefined}
                        onComplete={() => {
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
                      />
                    </div>

                    {/* Vocabulary List with Definitions - Hidden during Partial Recall */}
                    {!isPartialRecall && isVisible && (
                        <div className="mt-12 flex flex-col gap-3 text-2xl font-chalk text-gray-900">
                          {node.vocabulary.map((vocab, vocabIdx) => (
                            <motion.li 
                              key={vocab.term}
                              className="list-none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 2.5 + vocabIdx * 0.3 }}
                            >
                              <span className="font-bold inline-flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-orange-400 inline-block" />
                                <span className="underline decoration-2 decoration-sky-500">
                                  <TypewriterText text={vocab.term} />
                                </span>
                              </span>
                              <motion.span 
                                className="block text-xl leading-snug ml-5 text-gray-700"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.5 + vocabIdx * 0.3 + 0.5 }}
                              >
                                <TypewriterText text={vocab.definition} />
                              </motion.span>
                            </motion.li>
                          ))}
                        </div>
                    )}

                    {/* Phase-Specific Interactions (Teaching) */}
                    {isCurrent && (
                      <div className="mt-8">
                        {demoState.phase === "teaching" && (
                          <div className="space-y-3">
                            {/* Sub-Phase: Content (Do you understand?) */}
                            {(demoState.subPhase === "content" || demoState.subPhase === "user-question" || demoState.subPhase === "ai-answer" || demoState.subPhase === "continue") && (
                              <motion.div 
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2.5 + (node.vocabulary.length * 0.3) + 1.5 }}
                              >
                                <p className="text-2xl font-chalk text-gray-900 leading-snug underline decoration-wavy decoration-2 decoration-amber-400">
                                  Do you understand?
                                </p>
                                {demoState.subPhase === "content" && (
                                  <div className="relative px-2 py-1">
                                    <button 
                                      onClick={onContinue}
                                      className="text-xl font-chalk text-gray-900 relative z-10 px-2 py-1"
                                    >
                                      Yes, continue
                                    </button>
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 2.5 + (node.vocabulary.length * 0.3) + 1.7, duration: 0.3 }}
                                    >
                                      <SmallHandDrawnBox delay={0} />
                                    </motion.div>
                                  </div>
                                )}
                              </motion.div>
                            )}

                            {/* User Question (blue dot) - positioned absolutely below node */}
                            {demoState.userQuestion && (demoState.subPhase === "user-question" || demoState.subPhase === "ai-answer" || demoState.subPhase === "continue") && (
                              <motion.div 
                                className="absolute top-full left-0 right-0 mt-8 flex items-start gap-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <span className="h-4 w-4 rounded-full bg-blue-500 inline-block shrink-0 mt-2" />
                                <p className="text-2xl font-chalk text-gray-900 leading-snug">
                                  <TypewriterText text={demoState.userQuestion} />
                                </p>
                              </motion.div>
                            )}

                            {/* AI Answer (green dot) - positioned absolutely below user question */}
                            {demoState.aiResponse && (demoState.subPhase === "ai-answer" || demoState.subPhase === "continue") && (
                              <motion.div 
                                className="absolute top-full left-0 right-0 mt-24 flex items-start gap-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                              >
                                <span className="h-4 w-4 rounded-full bg-green-500 inline-block shrink-0 mt-2" />
                                <p className="text-2xl font-chalk text-gray-800 leading-snug">
                                  <TypewriterText text={demoState.aiResponse} />
                                </p>
                              </motion.div>
                            )}

                            {/* Continue button appears again after AI answer */}
                            {demoState.subPhase === "continue" && (
                              <motion.div 
                                className="mt-4 space-y-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0 }}
                              >
                                <p className="text-2xl font-chalk text-gray-900 leading-snug underline decoration-wavy decoration-2 decoration-amber-400">
                                  Do you understand?
                                </p>
                                
                                <div className="flex items-center gap-4">
                                  <div className="relative px-2 py-1">
                                    <button 
                                      onClick={onContinue}
                                      className="text-xl font-chalk text-gray-900 relative z-10 px-2 py-1"
                                    >
                                      Yes, continue
                                    </button>
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 1.2, duration: 0.3 }}
                                    >
                                      <SmallHandDrawnBox delay={0} />
                                    </motion.div>
                                  </div>
                                  
                                  <button
                                    onClick={() => {
                                      // Show inline question input
                                      const input = document.getElementById('inline-question-input');
                                      if (input) {
                                        input.style.display = 'block';
                                        (input.querySelector('input') as HTMLInputElement)?.focus();
                                      }
                                    }}
                                    className="text-lg font-chalk text-blue-600 underline hover:text-blue-700 transition-colors"
                                  >
                                    Ask a question
                                  </button>
                                </div>
                                
                                {/* Inline Question Input */}
                                <div id="inline-question-input" style={{ display: 'none' }} className="mt-4">
                                  <form 
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      if (!chatInput.trim() || isChatSubmitting || !onAskQuestion) return;
                                      setIsChatSubmitting(true);
                                      await onAskQuestion(chatInput);
                                      setChatInput("");
                                      setIsChatSubmitting(false);
                                      // Hide input after submission
                                      const input = document.getElementById('inline-question-input');
                                      if (input) input.style.display = 'none';
                                    }}
                                    className="flex items-center gap-2 bg-white rounded-lg border-2 border-gray-300 p-2"
                                  >
                                    <input 
                                      type="text" 
                                      value={chatInput}
                                      onChange={(e) => setChatInput(e.target.value)}
                                      placeholder="Type your question..."
                                      disabled={isChatSubmitting}
                                      className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-chalk text-xl"
                                    />
                                    <button 
                                      type="submit"
                                      disabled={!chatInput.trim() || isChatSubmitting}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-full font-sans text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                      {isChatSubmitting ? "Asking..." : "Ask"}
                                    </button>
                                  </form>
                                </div>
                              </motion.div>
                            )}

                            {/* Sub-Phase: Thinking Question */}
                            {(demoState.subPhase === "question" || demoState.subPhase === "user-thinking-response") && (
                              <motion.div 
                                className="max-w-[600px] mt-6"
                                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                              >
                                <p className="text-2xl font-chalk text-gray-900 leading-snug">
                                  <span className="underline decoration-rose-400 decoration-2 mr-2">Think:</span>
                                  {node.thinkingQuestion || "What do you think happened next?"}
                                </p>
                              </motion.div>
                            )}

                            {/* User's Thinking Response Input */}
                            {demoState.subPhase === "question" && !demoState.userThinkingResponse && (
                              <motion.div 
                                className="max-w-[600px] mt-4 ml-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                <div className="relative">
                                    <textarea
                                        value={thinkingInput}
                                        onChange={(e) => setThinkingInput(e.target.value)}
                                        placeholder="Type your thoughts..."
                                        className="w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none text-xl font-chalk text-gray-700 leading-snug italic resize-none py-2"
                                        rows={2}
                                        disabled={isThinkingSubmitting}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={async () => {
                                                if (!thinkingInput.trim() || isThinkingSubmitting || !onThinkingSubmit) return;
                                                setIsThinkingSubmitting(true);
                                                await onThinkingSubmit(thinkingInput);
                                                setThinkingInput("");
                                                setIsThinkingSubmitting(false);
                                            }}
                                            disabled={!thinkingInput.trim() || isThinkingSubmitting}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-full font-sans text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            {isThinkingSubmitting ? "Sharing..." : "Share Thoughts"}
                                        </button>
                                    </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Display Submitted Thinking Response */}
                            {demoState.userThinkingResponse && (
                              <motion.div 
                                className="max-w-[600px] mt-4 ml-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <p className="text-xl font-chalk text-gray-700 leading-snug italic">
                                  {demoState.userThinkingResponse}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Feedback on Thinking Question - Above Node Title */}
                    {demoState.thinkingFeedback && isCurrent && demoState.subPhase === "content" && (
                      <motion.div 
                        className="absolute bottom-full left-0 right-0 mb-8 flex items-start gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="h-4 w-4 rounded-full bg-green-500 inline-block shrink-0 mt-2" />
                        <p className="text-2xl font-chalk text-gray-800 leading-relaxed">
                          <TypewriterText text={demoState.thinkingFeedback} />
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quiz Overlay */}
      {demoState.phase === 'quiz' && (
          <div className="absolute inset-0 z-50 flex items-start justify-center pt-16 bg-white">
              <motion.div 
                className="max-w-2xl w-full px-6"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
              >
                  <div className="mb-4">
                      <h2 className="text-3xl font-chalk text-gray-900">Quick Check</h2>
                  </div>

                  <h3 className="text-2xl font-chalk text-gray-900 mb-4 leading-relaxed underline decoration-sky-400 decoration-2">
                      {demoState.quizQuestion}
                  </h3>
                  
                  <div className="space-y-2">
                      {["1770", "1773", "1775", "1776"].map((opt, idx) => (
                          <button 
                            key={opt} 
                            className="w-full text-left font-chalk text-xl text-gray-900 flex items-center gap-3"
                          >
                              <span className="font-bold">{String.fromCharCode(65 + idx)}.</span>
                              <span className="underline decoration-amber-400 decoration-2">{opt}</span>
                              {demoState.simulatedInput === opt && (
                                  <span className="text-green-600 font-mono text-sm">OK</span>
                              )}
                          </button>
                      ))}
                  </div>
              </motion.div>
          </div>
      )}



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

function HandDrawnBox({ delay = 0 }: { delay?: number }) {
  // Create wobbly hand-drawn paths for each side
  const wobble = 1; // Amount of wobble
  
  return (
    <svg
      className="absolute pointer-events-none"
      viewBox="-5 -5 110 110"
      preserveAspectRatio="none"
      style={{
        top: "-50px",
        left: "-50px",
        width: "calc(100% + 100px)",
        height: "calc(100% + 100px)",
        zIndex: 0,
        overflow: "visible"
      }}
    >
      {/* Top side - drawn first */}
      <motion.path
        d={`M 0,0 Q 25,${wobble} 50,${-wobble} T 100,0`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay }}
      />
      
      {/* Right side - drawn second */}
      <motion.path
        d={`M 100,0 Q ${100 - wobble},25 ${100 + wobble},50 T 100,100`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: delay + 0.3 }}
      />
      
      {/* Bottom side - drawn third */}
      <motion.path
        d={`M 100,100 Q 75,${100 - wobble} 50,${100 + wobble} T 0,100`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: delay + 0.6 }}
      />
      
      {/* Left side - drawn last */}
      <motion.path
        d={`M 0,100 Q ${wobble},75 ${-wobble},50 T 0,0`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: delay + 0.9 }}
      />
    </svg>
  );
}

function SmallHandDrawnBox({ delay = 0 }: { delay?: number }) {
  // Create wobbly hand-drawn paths for each side (smaller variant for buttons)
  const wobble = 1;
  
  return (
    <svg
      className="absolute pointer-events-none"
      viewBox="-5 -5 110 110"
      preserveAspectRatio="none"
      style={{
        top: "-5px",
        left: "-5px",
        width: "calc(100% + 10px)",
        height: "calc(100% + 10px)",
        zIndex: 0,
        overflow: "visible"
      }}
    >
      {/* Top side */}
      <motion.path
        d={`M 0,0 Q 25,${wobble} 50,${-wobble} T 100,0`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay }}
      />
      
      {/* Right side */}
      <motion.path
        d={`M 100,0 Q ${100 - wobble},25 ${100 + wobble},50 T 100,100`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: delay + 0.3 }}
      />
      
      {/* Bottom side */}
      <motion.path
        d={`M 100,100 Q 75,${100 - wobble} 50,${100 + wobble} T 0,100`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: delay + 0.6 }}
      />
      
      {/* Left side */}
      <motion.path
        d={`M 0,100 Q ${wobble},75 ${-wobble},50 T 0,0`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: delay + 0.9 }}
      />
    </svg>
  );
}


function DoodleArrow({ start, end, delay = 0 }: { start: { x: number; y: number }; end: { x: number; y: number }; delay?: number }) {
  // Position arrow in the horizontal space BETWEEN the nodes
  const arrowY = (start.y + end.y) / 2; // Vertical center between nodes
  const startX = start.x + 480; // Right edge of start node
  const endX = end.x - 480; // Left edge of end node
  const arrowLength = endX - startX;

  // Create a wobbly hand-drawn path
  const midX = arrowLength / 2;
  const wobble1 = arrowLength * 0.25;
  const wobble2 = arrowLength * 0.75;
  
  return (
    <motion.svg
      className="absolute pointer-events-none"
      style={{
        left: `${startX}px`,
        top: `${arrowY}px`,
        width: `${arrowLength}px`,
        height: "80px",
        zIndex: 5,
        overflow: "visible"
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay }}
    >
      {/* Hand-drawn wobbly arrow path */}
      <motion.path
        d={`M 0,40 Q ${wobble1},25 ${midX},40 T ${arrowLength},40`}
        stroke="#1e293b"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay }}
      />
      
      {/* Hand-drawn arrowhead */}
      <motion.path
        d={`M ${arrowLength - 15},28 L ${arrowLength},40 L ${arrowLength - 15},52`}
        stroke="#1e293b"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, delay: delay + 0.6 }}
      />
    </motion.svg>
  );
}

function TypewriterText({ text }: { text: string }) {
    const [displayed, setDisplayed] = useState("");
    
    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 30); // Faster typing
        return () => clearInterval(timer);
    }, [text]);

    return <span>{displayed}<span className="inline-block w-2 text-gray-400 animate-pulse">|</span></span>;
}

function AnimatedText({ 
  text, 
  vocabulary, 
  startDelay,
  isActive,
  isErased,
  simulatedInput,
  feedback,
  onComplete,
  onReset
}: { 
  text: string; 
  vocabulary: string[]; 
  startDelay: number;
  isActive: boolean;
  isErased?: boolean;
  simulatedInput?: string;
  feedback?: "correct" | "incorrect" | null;
  onComplete?: () => void;
  onReset?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const vocabPalette = ["#0ea5e9", "#f97316", "#22c55e", "#ef4444"];

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(""); 
      onReset?.();
      return;
    }

    let currentLength = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        currentLength += 3;
        if (currentLength >= text.length) {
          setDisplayedText(text);
          if (interval) {
            clearInterval(interval);
          }
          onComplete?.();
        } else {
          setDisplayedText(text.slice(0, currentLength));
        }
      }, 20);
    }, startDelay * 1000);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [text, isActive, startDelay]);

  if (!isActive) return null;

  // Build a map of which words are part of vocabulary terms
  const textLower = displayedText.toLowerCase();
  const vocabMatches: Map<number, { color: string; term: string }> = new Map();
  
  vocabulary.forEach((vocabTerm, termIndex) => {
    const termLower = vocabTerm.toLowerCase();
    const color = vocabPalette[termIndex % vocabPalette.length];
    
    // Find all occurrences of this vocab term in the text
    let startIndex = 0;
    while ((startIndex = textLower.indexOf(termLower, startIndex)) !== -1) {
      // Count which word index this starts at
      const beforeText = displayedText.slice(0, startIndex);
      const wordsBefore = beforeText.split(/\s+/).filter(w => w.length > 0);
      const startWordIndex = wordsBefore.length;
      
      // Count how many words this term spans
      const termWords = vocabTerm.split(/\s+/).filter(w => w.length > 0);
      
      // Mark all words in this range as vocab
      for (let i = 0; i < termWords.length; i++) {
        vocabMatches.set(startWordIndex + i, { color, term: vocabTerm });
      }
      
      startIndex += termLower.length;
    }
  });

  return (
    <div className="text-3xl font-chalk text-gray-900 leading-relaxed relative">
      {displayedText.split(/\s+/).filter(w => w.length > 0).map((word, idx) => {
        const vocabMatch = vocabMatches.get(idx);
        const isVocab = !!vocabMatch;
        const vocabColor = vocabMatch?.color || vocabPalette[0];
        
        // Erasure Logic
        const isErasedWord = isErased && isVocab;

        return (
          <span key={idx} className="inline-block mr-3 relative">
            {isErasedWord ? (
              <span className="relative">
                {/* If we have simulated input and feedback is correct, show the word revealed */}
                {feedback === 'correct' ? (
                    <motion.span 
                        initial={{ opacity: 0, color: 'green' }} 
                        animate={{ opacity: 1 }}
                        className="text-green-600 font-bold"
                    >
                        {word}
                    </motion.span>
                ) : (
                    <>
                        <span className="opacity-0 select-none">{word}</span>
                        <span className="absolute inset-0 border-b-2 border-dashed border-gray-400 top-1/2"></span>
                        {/* If simulated input exists, show it being typed over the blank */}
                        {simulatedInput && (
                             <span className="absolute -top-6 left-0 right-0 text-sm text-gray-800">
                                 <TypewriterText text={simulatedInput} />
                             </span>
                        )}
                    </>
                )}
              </span>
            ) : isVocab ? (
              <span 
                className="font-bold" 
                style={{ color: vocabColor, textDecoration: "underline", textDecorationColor: vocabColor }}
              >
                {word}
              </span>
            ) : (
              word
            )}
          </span>
        );
      })}
    </div>
  );
}




