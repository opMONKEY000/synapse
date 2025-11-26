"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WhiteboardCanvas, DemoState } from "@/components/lesson/whiteboard-canvas";
import { Loader2, ArrowLeft } from "lucide-react";

interface LessonViewProps {
  lessonId: string;
  initialNodes: any[]; // We'll define a proper type
  subjectId: string;
}

export function LessonView({ lessonId, initialNodes, subjectId }: LessonViewProps) {
  const router = useRouter();
  const [nodes, setNodes] = useState(initialNodes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lessonState, setLessonState] = useState<DemoState>({
    phase: "teaching",
    subPhase: "content",
  });

  // Pre-loading logic
  const generateContent = useCallback(async (index: number) => {
    if (index >= nodes.length) return;
    const node = nodes[index];
    
    // If already complete or generating, skip
    if (node.status === "COMPLETE" || node.isGenerating) return;

    // Mark as generating locally
    setNodes(prev => prev.map((n, i) => i === index ? { ...n, isGenerating: true } : n));

    try {
      const res = await fetch(`/api/lessons/${lessonId}/nodes/${node.id}/generate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Generation failed");
      
      const updatedNode = await res.json();
      
      // Update node with full content
      setNodes(prev => prev.map((n, i) => i === index ? { ...n, ...updatedNode, status: "COMPLETE", isGenerating: false } : n));
    } catch (error) {
      console.error("Error generating node content:", error);
      setNodes(prev => prev.map((n, i) => i === index ? { ...n, isGenerating: false } : n));
    }
  }, [lessonId, nodes]);

  // Effect to trigger generation for current and next node
  useEffect(() => {
    generateContent(currentIndex);
    generateContent(currentIndex + 1);
  }, [currentIndex, generateContent]);

  const handleContinue = () => {
    // Progress through subPhases: content → continue → question → next node
    if (lessonState.subPhase === "content") {
      setLessonState(prev => ({ 
        ...prev, 
        subPhase: "continue",
        thinkingFeedback: undefined, // Clear feedback after it's been shown
      }));
    } else if (lessonState.subPhase === "continue") {
      setLessonState(prev => ({ ...prev, subPhase: "question" }));
    } else if (lessonState.subPhase === "question" || lessonState.subPhase === "user-thinking-response") {
      // Move to next node, preserving thinkingFeedback
      if (currentIndex < nodes.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setLessonState(prev => ({ 
          phase: "teaching", 
          subPhase: "content",
          thinkingFeedback: prev.thinkingFeedback, // Preserve feedback for next node
        }));
      } else {
        // End of lesson
        alert("Lesson Complete!");
      }
    }
  };

  const handleAskQuestion = async (question: string) => {
    const currentNode = nodes[currentIndex];
    
    // Update UI to show user question immediately
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
      
      // Show AI answer
      setLessonState(prev => ({
        ...prev,
        subPhase: "ai-answer",
        aiResponse: answer,
      }));

      // After a delay, show continue button again
      setTimeout(() => {
        setLessonState(prev => ({ ...prev, subPhase: "continue" }));
      }, 5000);

    } catch (error) {
      console.error("Q&A Error:", error);
      // Revert or show error
    }
  };

  const handleThinkingSubmit = async (response: string) => {
    const currentNode = nodes[currentIndex];
    
    // Show user response
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

      // Save feedback to show on next node
      setLessonState(prev => ({
        ...prev,
        thinkingFeedback: feedback,
      }));
      
    } catch (error) {
      console.error("Thinking Feedback Error:", error);
    }
  };

  const handleRecallSubmit = async (response: string, type: "partial" | "full-forward" | "full-backward") => {
    const currentNode = nodes[currentIndex]; // Or the erased node?
    // In recall mode, currentIndex might be different or we track erasedNodeId.
    // Let's assume we are recalling the erased node.
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
        feedback: "correct", // or based on score?
        grade,
        aiResponse: aiEvaluation,
      }));

    } catch (error) {
      console.error("Recall Error:", error);
    }
  };

  // Map nodes to WhiteboardCanvas format
  // WhiteboardCanvas expects: { id, title, summary, vocabulary: [{term, definition}], thinkingQuestion, metadata }
  // Our DB nodes have: { ..., vocabularyTerms: string[], vocabulary: JSON }
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
      {/* Back Button */}
      <button
        onClick={() => router.push(`/dashboard/${subjectId}`)}
        className="absolute top-6 left-6 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
        title="Exit lesson"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
      </button>

      <WhiteboardCanvas
        nodes={canvasNodes}
        currentIndex={currentIndex}
        demoState={lessonState}
        onContinue={handleContinue}
        onAskQuestion={handleAskQuestion}
        onThinkingSubmit={handleThinkingSubmit}
        onRecallSubmit={handleRecallSubmit}
      />
      
      {/* Loading Indicator for current node */}
      {nodes[currentIndex]?.isGenerating && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2 z-50">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-gray-600">Generating content...</span>
        </div>
      )}
    </div>
  );
}
