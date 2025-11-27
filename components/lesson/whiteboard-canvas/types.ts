// Type definitions for whiteboard canvas components

export interface DemoState {
  phase: "teaching" | "prediction" | "recall" | "quiz";
  subPhase?: "content" | "user-question" | "ai-answer" | "continue" | "question" | "user-thinking-response";
  recallType?: "partial" | "full-forward" | "full-backward" | "full-comprehensive";
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
  aiThinking?: boolean; // Loading state for AI feedback
}
