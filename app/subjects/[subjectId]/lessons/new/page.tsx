"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { WhiteboardBackground } from "@/components/whiteboard/whiteboard-background";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import { BrainCircuit, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewLessonPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectId = params.subjectId as string;

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-fill topic from URL if present
  useEffect(() => {
    const topicParam = searchParams.get("topic");
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [searchParams]);

  const getNodeCountRange = (level: string) => {
    switch (level) {
      case "beginner": return "5-8 nodes";
      case "intermediate": return "10-15 nodes";
      case "advanced": return "18-25 nodes";
      default: return "";
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/lessons/generate-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          topic,
          difficultyLevel: difficulty,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate lesson");

      const lesson = await response.json();
      router.push(`/subjects/${subjectId}/lessons/${lesson.id}`);
    } catch (error) {
      console.error("Generation error:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans">
      <WhiteboardBackground />
      
      {/* Header */}
      <div className="relative z-10 px-6 py-4 flex items-center gap-4">
        <Link href={`/subjects/${subjectId}`}>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
        </Link>
        <h1 className="text-2xl font-chalk font-bold text-gray-900">New Lesson</h1>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="w-full max-w-2xl">
          {/* Card Container */}
          <div className="relative">
            {/* Hand-drawn border effect */}
            <div className="absolute inset-0 border-2 border-gray-800 rounded-lg transform rotate-1 translate-x-1 translate-y-1 bg-gray-50 pointer-events-none" />
            <div className="relative bg-white border-2 border-gray-800 rounded-lg p-8 shadow-sm">
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200 transform -rotate-3">
                  <BrainCircuit className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-chalk font-bold text-gray-900">What do you want to learn?</h2>
                  <p className="text-gray-500 font-chalk text-lg">I'll create a custom lesson plan for you.</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Topic Input */}
                <div className="space-y-2">
                  <label className="block text-xl font-chalk text-gray-900">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The French Revolution, Classical Conditioning..."
                    className="w-full text-2xl font-chalk p-4 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent transition-colors placeholder:text-gray-300"
                    autoFocus
                  />
                </div>

                {/* Difficulty Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="block text-xl font-chalk text-gray-900">Depth Level</label>
                    <span className="text-blue-600 font-chalk text-lg font-bold">
                      {getNodeCountRange(difficulty)}
                    </span>
                  </div>
                  
                  <div className="relative h-12 flex items-center justify-between px-2">
                    {/* Track */}
                    <div className="absolute left-0 right-0 h-2 bg-gray-100 rounded-full z-0" />
                    
                    {/* Options */}
                    {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`relative z-10 flex flex-col items-center gap-2 transition-all duration-300 ${
                          difficulty === level ? "scale-110" : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          difficulty === level 
                            ? "bg-blue-500 border-blue-600 shadow-md" 
                            : "bg-white border-gray-300"
                        }`} />
                        <span className="text-sm font-chalk font-bold capitalize text-gray-700">
                          {level}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-4 flex justify-end">
                  <MarkerButton
                    variant="primary"
                    onClick={handleGenerate}
                    disabled={!topic.trim() || isGenerating}
                    className="!text-xl !px-8 !py-3 min-w-[200px] flex justify-center"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      "Generate Lesson"
                    )}
                  </MarkerButton>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
