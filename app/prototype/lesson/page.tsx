"use client";

import { useState } from "react";
import { WhiteboardCanvas } from "@/components/lesson/whiteboard-canvas";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import { WhiteboardBackground } from "@/components/whiteboard/whiteboard-background";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Mock knowledge graph for prototyping
const mockNodes = [
  {
    id: "1",
    title: "Bleeding Kansas",
    summary: "It all started when they let Kansas decide on slavery by popular vote. Pro-slavery and anti-slavery settlers rushed in, and it turned into a literal war zone. This proved that compromise was basically dead.",
    vocabulary: [
      { term: "popular sovereignty", definition: "Letting the people in a territory vote on whether to allow slavery." }
    ],
    thinkingQuestion: "How did the violence in Kansas set the stage for the South's reaction to John Brown?",
    metadata: { badge: "1856", location: "Kansas" },
  },
  {
    id: "2",
    title: "The Union Shakes",
    summary: "After Kansas, Dred Scott, and the Democratic split, the South felt surrounded. Fire-eaters toured the South warning that the North was trying to destroy slavery. Then, John Brown raided Harpers Ferry to start a slave uprising. Northerners didn't support the violence, but respected his courage—and the South saw that as proof the North wanted to kill them.",
    vocabulary: [
      { term: "Fire-eaters", definition: "Southern radicals pushing for secession." },
      { term: "Harpers Ferry", definition: "John Brown's failed attempt to spark a slave rebellion." }
    ],
    thinkingQuestion: "With the Democrats split and trust gone, what makes the Election of 1860 the inevitable breaking point?",
    metadata: { badge: "1859", location: "Virginia" },
  },
  {
    id: "3",
    title: "The Election of 1860",
    summary: "The Democrats completely fell apart. Northern Democrats picked Douglas, Southern Democrats picked Breckinridge, and Moderates formed their own party. This split allowed Lincoln to win without a single Southern vote, which was the final straw for the South.",
    vocabulary: [
      { term: "sectionalism", definition: "Loyalty to one's own region or section of the country, rather than to the country as a whole." }
    ],
    thinkingQuestion: "How did the split in the Democratic party make Lincoln's victory inevitable?",
    metadata: { badge: "1860" },
  },
];

// Define the step type explicitly to avoid union inference issues
interface DemoStep {
  index: number;
  phase: "teaching" | "prediction" | "recall" | "quiz";
  subPhase?: "content" | "user-question" | "ai-answer" | "continue" | "question" | "user-thinking-response"; 
  desc: string;
  recallType?: "partial" | "full"; // partial = inline words, full = entire node
  erasedNodeId?: string;
  simulatedInput?: string;
  feedback?: "correct" | "incorrect" | null;
  grade?: string; // Grade from F to A+ for recall answers
  quizQuestion?: string;
  contextMessage?: string; // "What happened next?" or "What caused this?"
  cameraMode?: "default" | "context-back" | "context-forward" | "overview";
  aiResponse?: string;
  userQuestion?: string; // User asks a question during "Do you understand?"
  userThinkingResponse?: string; // User's response to thinking question
  thinkingFeedback?: string; // AI feedback on thinking question (shown above next node)
}

export default function LessonPrototype() {
  const [stepIndex, setStepIndex] = useState(0);

  // The Script
  const demoSteps: DemoStep[] = [
    // 1. Teaching Phase - Bleeding Kansas (Full conversation flow)
    { index: 0, phase: "teaching", subPhase: "content", desc: "Teaching: Kansas Content" },
    { index: 0, phase: "teaching", subPhase: "user-question", userQuestion: "Wait, what does 'popular sovereignty' actually mean in practice?", desc: "User: Asks Question" },
    { index: 0, phase: "teaching", subPhase: "ai-answer", userQuestion: "Wait, what does 'popular sovereignty' actually mean in practice?", aiResponse: "Great question! It meant settlers themselves voted whether to allow slavery when applying for statehood. Sounds democratic, right? But in Kansas, it led to both sides flooding in to influence the vote, sparking violence.", desc: "AI: Answers Question" },
    { index: 0, phase: "teaching", subPhase: "continue", userQuestion: "Wait, what does 'popular sovereignty' actually mean in practice?", aiResponse: "Great question! It meant settlers themselves voted whether to allow slavery when applying for statehood. Sounds democratic, right? But in Kansas, it led to both sides flooding in to influence the vote, sparking violence.", desc: "Continue Button" },
    { index: 0, phase: "teaching", subPhase: "question", desc: "Teaching: Kansas Thinking Question" },
    { index: 0, phase: "teaching", subPhase: "user-thinking-response", userThinkingResponse: "The violence proved compromise was dead and made Southerners more radical and defensive.", desc: "User: Thinking Response" },
    
    // 2. Teaching Phase - Union Shakes (with feedback from previous thinking question)
    { index: 1, phase: "teaching", subPhase: "content", thinkingFeedback: "Exactly! The violence in Kansas showed both sides that peaceful resolution was impossible. This radicalization set the stage for what comes next.", desc: "Teaching: Union Content (with feedback)" },
    { index: 1, phase: "teaching", subPhase: "user-question", userQuestion: "Why did the North respect John Brown if they didn't support violence?", desc: "User: Asks Question" },
    { index: 1, phase: "teaching", subPhase: "ai-answer", userQuestion: "Why did the North respect John Brown if they didn't support violence?", aiResponse: "They saw him as a martyr for the anti-slavery cause—someone willing to die for his beliefs. The South saw this admiration as proof the North wanted them dead.", desc: "AI: Answers Question" },
    { index: 1, phase: "teaching", subPhase: "continue", userQuestion: "Why did the North respect John Brown if they didn't support violence?", aiResponse: "They saw him as a martyr for the anti-slavery cause—someone willing to die for his beliefs. The South saw this admiration as proof the North wanted them dead.", desc: "Continue Button" },
    { index: 1, phase: "teaching", subPhase: "question", desc: "Teaching: Union Thinking Question" },
    { index: 1, phase: "teaching", subPhase: "user-thinking-response", userThinkingResponse: "The Democrats were already fractured over slavery, and the raid made compromise impossible.", desc: "User: Thinking Response" },
    
    // 3. Teaching Phase - Election 1860 (with feedback from previous thinking question)
    { index: 2, phase: "teaching", subPhase: "content", thinkingFeedback: "Perfect! John Brown's raid was the final catalyst. The Democrats couldn't agree on how to respond, which split them permanently.", desc: "Teaching: Election Content (with feedback)" },
    { index: 2, phase: "teaching", subPhase: "user-question", userQuestion: "Could Lincoln have done anything to prevent secession?", desc: "User: Asks Question" },
    { index: 2, phase: "teaching", subPhase: "ai-answer", userQuestion: "Could Lincoln have done anything to prevent secession?", aiResponse: "Not really. By 1860, the South had already decided that a Republican president—any Republican—was an existential threat. Lincoln's victory without a single Southern vote proved their worst fears.", desc: "AI: Answers Question" },
    { index: 2, phase: "teaching", subPhase: "continue", userQuestion: "Could Lincoln have done anything to prevent secession?", aiResponse: "Not really. By 1860, the South had already decided that a Republican president—any Republican—was an existential threat. Lincoln's victory without a single Southern vote proved their worst fears.", desc: "Continue Button" },
    { index: 2, phase: "teaching", subPhase: "question", desc: "Teaching: Election Thinking Question" },
    { index: 2, phase: "teaching", subPhase: "user-thinking-response", userThinkingResponse: "With Northern and Southern Democrats split, Lincoln won with just Northern votes, which terrified the South.", desc: "User: Thinking Response" },
    
    // 4. Partial Recall (Inline) - Focus on Node 2 (Union Shakes)
    { index: 1, phase: "recall", recallType: "partial", erasedNodeId: "2", desc: "Partial Recall: Blank Words" },
    { index: 1, phase: "recall", recallType: "partial", erasedNodeId: "2", simulatedInput: "Fire-eaters", desc: "Partial Recall: Typing" },
    { index: 1, phase: "recall", recallType: "partial", erasedNodeId: "2", simulatedInput: "Fire-eaters", feedback: "correct", grade: "A+", desc: "Partial Recall: Success" },
    
    // 5. Forward Recall (Full Node) - Erase Node 2, Context from Node 1
    { index: 1, phase: "recall", recallType: "full", erasedNodeId: "2", cameraMode: "context-back", contextMessage: "How did Bleeding Kansas lead to the rise of Southern radicals?", desc: "Forward Recall: Context View" },
    { index: 1, phase: "recall", recallType: "full", erasedNodeId: "2", cameraMode: "context-back", contextMessage: "How did Bleeding Kansas lead to the rise of Southern radicals?", simulatedInput: "It radicalized the South, leading Fire-eaters to demand protection...", desc: "Forward Recall: Typing" },
    { index: 1, phase: "recall", recallType: "full", erasedNodeId: "2", cameraMode: "context-back", contextMessage: "How did Bleeding Kansas lead to the rise of Southern radicals?", simulatedInput: "It radicalized the South, leading Fire-eaters to demand protection...", feedback: "correct", grade: "A", desc: "Forward Recall: Success" },
    { index: 1, phase: "recall", recallType: "full", erasedNodeId: "2", cameraMode: "context-back", contextMessage: "How did Bleeding Kansas lead to the rise of Southern radicals?", simulatedInput: "It radicalized the South, leading Fire-eaters to demand protection...", feedback: "correct", grade: "A", aiResponse: "Spot on! You nailed the connection. The violence in Kansas didn't just stay there—it showed the South that 'popular sovereignty' was a failure, directly fueling the rise of the Fire-eaters who demanded federal protection for slavery.", desc: "AI Feedback: Forward" },

    // 6. Backward Recall (Full Node) - Erase Node 2, Context from Node 3
    { index: 1, phase: "recall", recallType: "full", erasedNodeId: "2", cameraMode: "context-forward", contextMessage: "What events in 1859 made the Democratic split inevitable?", desc: "Backward Recall: Context View" },
    { index: 1, phase: "recall", recallType: "full", erasedNodeId: "2", cameraMode: "context-forward", contextMessage: "What events in 1859 made the Democratic split inevitable?", simulatedInput: "John Brown's raid terrified the South...", desc: "Backward Recall: Typing" },
    { index: 1, phase: "recall", recallType: "full", erasedNodeId: "2", cameraMode: "context-forward", contextMessage: "What events in 1859 made the Democratic split inevitable?", simulatedInput: "John Brown's raid terrified the South...", feedback: "correct", grade: "A-", desc: "Backward Recall: Success" },
    { index: 1, phase: "recall", recallType: "full", erasedNodeId: "2", cameraMode: "context-forward", contextMessage: "What events in 1859 made the Democratic split inevitable?", simulatedInput: "John Brown's raid terrified the South...", feedback: "correct", grade: "A-", aiResponse: "Exactly. You correctly identified the catalyst. John Brown's raid was the final straw that convinced Southerners they couldn't live safely in the Union, making the Democratic split—and Lincoln's victory—inevitable.", desc: "AI Feedback: Backward" },

    // 7. Quiz Phase - Checkpoint Overlay
    { index: 2, phase: "quiz", quizQuestion: "Who raided Harpers Ferry?", desc: "Quiz: Checkpoint Question" },
    { index: 2, phase: "quiz", quizQuestion: "Who raided Harpers Ferry?", simulatedInput: "John Brown", desc: "Quiz: Answer Selected" },
  ];

  const currentStep = demoSteps[stepIndex];
  const progress = ((stepIndex + 1) / demoSteps.length) * 100;

  const handleNext = () => {
    if (stepIndex < demoSteps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Compact Header */}
      <div className="px-6 py-3 z-50 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-chalk font-bold text-gray-900">
            American Revolution <span className="text-gray-500 text-sm font-sans ml-2">(Demo Mode)</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-xs text-gray-600 font-mono uppercase tracking-wider">
                  {currentStep.desc}
                </span>
                <div className="w-32 h-1 bg-gray-200 mt-1 overflow-hidden">
                    <div 
                        className="h-full bg-gray-800 transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Whiteboard */}
      <div className="flex-1 relative h-full min-h-[600px] bg-white">
        <WhiteboardCanvas
          nodes={mockNodes}
          currentIndex={currentStep.index}
          onContinue={handleNext}
          demoState={{
              phase: currentStep.phase,
              subPhase: currentStep.subPhase,
              erasedNodeId: currentStep.erasedNodeId,
              simulatedInput: currentStep.simulatedInput,
              feedback: currentStep.feedback,
              grade: currentStep.grade,
              quizQuestion: currentStep.quizQuestion,
              recallType: currentStep.recallType,
              contextMessage: currentStep.contextMessage,
              cameraMode: currentStep.cameraMode,
              aiResponse: currentStep.aiResponse,
              userQuestion: currentStep.userQuestion,
              userThinkingResponse: currentStep.userThinkingResponse,
              thinkingFeedback: currentStep.thinkingFeedback
          }}
        />
      </div>

      {/* Demo Controls (Top Right) */}
      <div className="absolute top-24 right-6 flex flex-col items-end gap-2 z-50">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Demo Controls</span>
        <div className="flex items-center gap-2 p-2">
            <MarkerButton
            variant="secondary"
            onClick={handleBack}
            disabled={stepIndex === 0}
            className="!p-2 !rounded-none !bg-transparent !text-gray-900 !border !border-gray-800"
            >
            <ArrowLeft className="w-4 h-4" />
            </MarkerButton>

            <div className="w-px h-4 bg-gray-400" />

            <MarkerButton
            variant="primary"
            onClick={handleNext}
            disabled={stepIndex === demoSteps.length - 1}
            className="!p-2 !rounded-none !bg-transparent !text-gray-900 !border !border-gray-800"
            >
            <ArrowRight className="w-4 h-4" />
            </MarkerButton>
        </div>
      </div>
    </div>
  );
}
