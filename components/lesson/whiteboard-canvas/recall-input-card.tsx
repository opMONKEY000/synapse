import { motion } from "framer-motion";
import { useState } from "react";
import type { DemoState } from "./types";
import { HandwrittenText } from "./handwritten-text";

interface RecallInputCardProps {
  demoState: DemoState;
  recallInput: string;
  setRecallInput: (input: string) => void;
  isRecallSubmitting: boolean;
  setIsRecallSubmitting: (submitting: boolean) => void;
  onRecallSubmit?: (response: string, type: "partial" | "full-forward" | "full-backward" | "full-comprehensive") => Promise<void>;
  onContinue?: () => void;
}

export function RecallInputCard({
  demoState,
  recallInput,
  setRecallInput,
  isRecallSubmitting,
  setIsRecallSubmitting,
  onRecallSubmit,
  onContinue
}: RecallInputCardProps) {
  return (
    <motion.div 
      className="min-w-[500px] max-w-[1000px] bg-transparent p-4 sm:p-6 relative"
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
      {demoState.aiResponse && (
        <motion.div 
          className="absolute top-full left-0 right-0 mt-8 flex flex-col items-start gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <span className="h-4 w-4 rounded-full bg-green-500 inline-block shrink-0 mt-2" />
            <p className="text-2xl font-chalk text-gray-800 leading-relaxed">
              <HandwrittenText text={demoState.aiResponse} />
            </p>
          </div>
          
          {/* Continue Button for Recall - Show after AI feedback */}
          <div className="w-full flex justify-end">
            <button
              onClick={onContinue}
              className="px-6 py-2 bg-gray-900 text-white rounded-full font-sans text-lg font-medium hover:bg-gray-800 transition-colors shadow-lg"
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
