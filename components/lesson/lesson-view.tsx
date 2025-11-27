"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WhiteboardCanvas, DemoState } from "@/components/lesson/whiteboard-canvas";
import { Loader2, ArrowLeft } from "lucide-react";

interface LessonViewProps {
  lessonId: string;
  initialNodes: any[];
  subjectId: string;
  initialIndex?: number;
  initialRecallCycle?: number;
  initialRecallStep?: number;
  initialResumeIndex?: number | null;
  initialPhase?: "teaching" | "recall";
}

export function LessonView({ 
  lessonId, 
  initialNodes, 
  subjectId,
  initialIndex = 0,
  initialRecallCycle = 0,
  initialRecallStep = 0,
  initialResumeIndex = null,
  initialPhase = "teaching"
}: LessonViewProps) {
  const router = useRouter();
  const [nodes, setNodes] = useState(initialNodes);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [resumeIndex, setResumeIndex] = useState<number | null>(initialResumeIndex);
  const [lessonState, setLessonState] = useState<DemoState>({
    phase: initialPhase,
    subPhase: "content",
  });
  const [recallCycle, setRecallCycle] = useState(initialRecallCycle);
  const [recallStep, setRecallStep] = useState(initialRecallStep);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Pre-loading logic
  const generateContent = useCallback(async (index: number) => {
    if (index >= nodes.length) return;
    const node = nodes[index];
    
    if (node.status === "COMPLETE" || node.isGenerating) return;

    setNodes(prev => prev.map((n, i) => i === index ? { ...n, isGenerating: true } : n));

    try {
      const res = await fetch(`/api/lessons/${lessonId}/nodes/${node.id}/generate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Generation failed");
      
      const updatedNode = await res.json();
      
      setNodes(prev => prev.map((n, i) => i === index ? { ...n, ...updatedNode, status: "COMPLETE", isGenerating: false } : n));
    } catch (error) {
      console.error("Error generating node content:", error);
      setNodes(prev => prev.map((n, i) => i === index ? { ...n, isGenerating: false } : n));
    }
  }, [lessonId, nodes]);

  useEffect(() => {
    generateContent(currentIndex);
    generateContent(currentIndex + 1);
  }, [currentIndex, generateContent]);

  // Check if initial loading is complete (first 2 nodes loaded)
  useEffect(() => {
    if (isInitialLoading) {
      const firstNodeLoaded = nodes[0]?.status === "COMPLETE";
      const secondNodeLoaded = nodes.length < 2 || nodes[1]?.status === "COMPLETE";
      
      if (firstNodeLoaded && secondNodeLoaded) {
        // Add a small delay for smooth transition
        const timer = setTimeout(() => {
          setIsInitialLoading(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [nodes, isInitialLoading]);

  // Helper to determine recall target based on cycle and step
  const getRecallTarget = (cycle: number, step: number) => {
    let targetIndex = -1;
    let type: "partial" | "full-forward" | "full-backward" | "full-comprehensive" = "full-forward";
    let contextMessage = "";

    switch (step) {
      case 0:
        targetIndex = (cycle - 1) * 3 + 1;
        type = "full-comprehensive";
        contextMessage = "Let's review the previous topic...";
        break;
      case 1:
        targetIndex = cycle * 3 + 1;
        type = "partial";
        contextMessage = "Fill in the blanks...";
        break;
      case 2:
        targetIndex = cycle * 3;
        type = "full-forward";
        contextMessage = "Recall the start of this section...";
        break;
      case 3:
        targetIndex = cycle * 3 + 2;
        type = "full-backward";
        contextMessage = "Recall the end of this section...";
        break;
      case 4:
        targetIndex = cycle * 3 + 1;
        type = "full-comprehensive";
        contextMessage = "Final review of this section...";
        break;
    }

    return { targetIndex, type, contextMessage };
  };

  // Initialize recall state if starting in recall phase
  useEffect(() => {
    if (initialPhase === "recall" && initialRecallCycle >= 0 && initialRecallStep >= 0) {
      const { targetIndex, type, contextMessage } = getRecallTarget(initialRecallCycle, initialRecallStep);
      if (targetIndex >= 0 && targetIndex < nodes.length) {
        setLessonState(prev => ({
          ...prev,
          phase: "recall",
          recallType: type,
          erasedNodeId: nodes[targetIndex]?.id,
          contextMessage: contextMessage,
        }));
      }
    }
  }, []);

  // Save progress whenever relevant state changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await fetch(`/api/lessons/${lessonId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentNodeIndex: currentIndex,
            currentPhase: lessonState.phase,
            currentCycleNumber: 0,
            completedCycles: 0,
            recallCycle,
            recallStep,
            resumeIndex
          }),
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    };
    
    const timer = setTimeout(saveProgress, 500);
    return () => clearTimeout(timer);
  }, [currentIndex, lessonId, lessonState.phase, recallCycle, recallStep, resumeIndex]);

  const handleContinue = () => {
    // Handle Recall Phase Progression
    if (lessonState.phase === "recall") {
      if (lessonState.grade) {
        const nextStep = recallStep + 1;
        
        const totalNodes = nodes.length;
        const isLastCycle = (recallCycle + 1) * 3 >= totalNodes;
        const maxStep = isLastCycle ? 4 : 3;

        if (nextStep > maxStep) {
          if (resumeIndex !== null) {
            setCurrentIndex(resumeIndex);
            setResumeIndex(null);
          }
          
          setLessonState(prev => ({
            phase: "teaching",
            subPhase: "question",
            thinkingFeedback: undefined,
            erasedNodeId: undefined,
            recallType: undefined,
            grade: undefined,
            aiResponse: undefined,
            userResponse: undefined,
            feedback: undefined
          }));
          return;
        }

        setRecallStep(nextStep);
        
        const { targetIndex, type, contextMessage } = getRecallTarget(recallCycle, nextStep);
        
        if (targetIndex < 0) {
           if (nextStep === 0) {
             setRecallStep(1);
             const step1 = getRecallTarget(recallCycle, 1);
             setCurrentIndex(step1.targetIndex);
             setLessonState(prev => ({
                ...prev,
                phase: "recall",
                recallType: step1.type,
                erasedNodeId: nodes[step1.targetIndex].id,
                contextMessage: step1.contextMessage,
                feedback: null,
                grade: undefined,
                aiResponse: undefined,
                userResponse: undefined
             }));
             return;
           }
        }

        setCurrentIndex(targetIndex);
        setLessonState(prev => ({
          ...prev,
          phase: "recall",
          recallType: type,
          erasedNodeId: nodes[targetIndex].id,
          contextMessage: contextMessage,
          feedback: null,
          grade: undefined,
          aiResponse: undefined,
          userResponse: undefined
        }));
        return;
      }
    }

    // Progress through subPhases: content → continue → question → next node
    if (lessonState.subPhase === "content") {
      setLessonState(prev => ({ 
        ...prev, 
        subPhase: "continue",
        thinkingFeedback: undefined,
      }));
    } else if (lessonState.subPhase === "continue") {
      // Check for Recall Trigger (every 3 nodes)
      const isRecallTrigger = (currentIndex + 1) % 3 === 0;
      
      if (isRecallTrigger && lessonState.phase === "teaching") {
        const currentCycle = Math.floor((currentIndex + 1) / 3) - 1;
        setRecallCycle(currentCycle);
        setResumeIndex(currentIndex);
        
        let startStep = 0;
        let { targetIndex, type, contextMessage } = getRecallTarget(currentCycle, 0);
        
        if (targetIndex < 0) {
          startStep = 1;
          const step1 = getRecallTarget(currentCycle, 1);
          targetIndex = step1.targetIndex;
          type = step1.type;
          contextMessage = step1.contextMessage;
        }
        
        setRecallStep(startStep);
        setCurrentIndex(targetIndex);
        
        setLessonState(prev => ({
          ...prev,
          phase: "recall",
          recallType: type,
          erasedNodeId: nodes[targetIndex].id,
          contextMessage: contextMessage,
          feedback: null,
          grade: undefined,
          aiResponse: undefined
        }));
        return;
      }

      setLessonState(prev => ({ ...prev, subPhase: "question" }));
    } else if (lessonState.subPhase === "question" || lessonState.subPhase === "user-thinking-response") {
      if (currentIndex < nodes.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setLessonState(prev => ({ 
          phase: "teaching", 
          subPhase: "content",
          thinkingFeedback: prev.thinkingFeedback,
        }));
      } else {
        alert("Lesson Complete!");
      }
    }
  };

  const handleAskQuestion = async (question: string) => {
    const currentNode = nodes[currentIndex];
    
    setLessonState(prev => ({
      ...prev,
      subPhase: "user-question",
      userQuestion: question,
    }));

    try {
      const res = await fetch(`/api/lessons/${lessonId}/nodes/${currentNode.id}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      
      if (!res.ok) throw new Error("Failed to get answer");
      
      const { answer } = await res.json();
      
      setLessonState(prev => ({
        ...prev,
        subPhase: "ai-answer",
        aiResponse: answer,
      }));

      setTimeout(() => {
        setLessonState(prev => ({ ...prev, subPhase: "continue" }));
      }, 5000);

    } catch (error) {
      console.error("Q&A Error:", error);
    }
  };

  const handleThinkingSubmit = async (response: string) => {
    const currentNode = nodes[currentIndex];
    
    setLessonState(prev => ({
      ...prev,
      subPhase: "user-thinking-response",
      userThinkingResponse: response,
    }));

    try {
      const res = await fetch(`/api/lessons/${lessonId}/nodes/${currentNode.id}/thinking-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userResponse: response }),
      });

      if (!res.ok) throw new Error("Failed to get feedback");

      const { feedback } = await res.json();

      setLessonState(prev => ({
        ...prev,
        thinkingFeedback: feedback,
      }));
      
    } catch (error) {
      console.error("Thinking Feedback Error:", error);
    }
  };

  const handleRecallSubmit = async (response: string, type: "partial" | "full-forward" | "full-backward" | "full-comprehensive") => {
    const currentNode = nodes[currentIndex];
    const targetNodeId = lessonState.erasedNodeId || currentNode.id;

    try {
      const res = await fetch(`/api/lessons/${lessonId}/nodes/${targetNodeId}/recall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recallType: type, userResponse: response }),
      });

      if (!res.ok) throw new Error("Failed to submit recall");

      const { grade, masteryScore, feedback, aiEvaluation } = await res.json();

      setLessonState(prev => ({
        ...prev,
        feedback: "correct",
        grade,
        aiResponse: aiEvaluation,
        userResponse: response
      }));

    } catch (error) {
      console.error("Recall Error:", error);
    }
  };

  const canvasNodes = nodes.map(node => ({
    id: node.id,
    title: node.title,
    summary: node.summary || (node.isGenerating ? "Generating content..." : "Pending generation..."),
    vocabulary: Array.isArray(node.vocabulary) ? node.vocabulary : node.vocabularyTerms.map((t: string) => ({ term: t, definition: "Loading..." })),
    thinkingQuestion: node.thinkingQuestion,
    metadata: node.metadata || { badge: node.metadataHint },
  }));

  return (
    <div className="h-screen w-full bg-white relative">
      <button
        onClick={() => router.push(`/dashboard/${subjectId}`)}
        className="absolute top-6 left-6 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
        title="Exit lesson"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
      </button>

      {isInitialLoading ? (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Preparing Your Lesson
              </h2>
              <p className="text-gray-600">
                Loading the first nodes...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <WhiteboardCanvas
            nodes={canvasNodes}
            currentIndex={currentIndex}
            demoState={lessonState}
            onContinue={handleContinue}
            onAskQuestion={handleAskQuestion}
            onThinkingSubmit={handleThinkingSubmit}
            onRecallSubmit={handleRecallSubmit}
          />
          
          {nodes[currentIndex]?.isGenerating && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2 z-50">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Generating content...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
