import { motion } from "framer-motion";
import type { DemoState } from "./types";

interface QuizOverlayProps {
  demoState: DemoState;
}

export function QuizOverlay({ demoState }: QuizOverlayProps) {
  if (demoState.phase !== 'quiz') return null;

  return (
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
  );
}
