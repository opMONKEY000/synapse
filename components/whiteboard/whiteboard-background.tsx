"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function WhiteboardBackground() {
  // Random animated strokes that appear and disappear like sketching
  const [strokes, setStrokes] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    delay: number;
    type: string;
  }>>([]);

  useEffect(() => {
    // Generate strokes only on client side to avoid hydration mismatch
    setStrokes(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        delay: Math.random() * 5,
        type: ['line', 'curve', 'squiggle'][Math.floor(Math.random() * 3)]
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.125]">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {strokes.map((stroke) => {
          const paths = {
            line: `M ${stroke.x - 5},${stroke.y} L ${stroke.x + 5},${stroke.y}`,
            curve: `M ${stroke.x},${stroke.y} Q ${stroke.x + 3},${stroke.y - 2} ${stroke.x + 6},${stroke.y}`,
            squiggle: `M ${stroke.x},${stroke.y} Q ${stroke.x + 2},${stroke.y - 1} ${stroke.x + 4},${stroke.y} Q ${stroke.x + 6},${stroke.y + 1} ${stroke.x + 8},${stroke.y}`
          };

          return (
            <motion.path
              key={stroke.id}
              d={paths[stroke.type as keyof typeof paths]}
              stroke="#1f2937"
              strokeWidth="0.3"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1, 0],
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 6,
                delay: stroke.delay,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
              style={{ transform: `rotate(${stroke.rotation}deg)`, transformOrigin: `${stroke.x}% ${stroke.y}%` }}
            />
          );
        })}
      </svg>

      {/* Subtle animated gradient overlay for depth */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/20 to-transparent"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
