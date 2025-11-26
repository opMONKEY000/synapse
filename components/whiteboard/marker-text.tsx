"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarkerTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  color?: "black" | "blue" | "red";
}

export function MarkerText({ text, className, delay = 0, duration = 0.05, color = "black" }: MarkerTextProps) {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: duration, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 5,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const colorClasses = {
    black: "text-gray-900",
    blue: "text-blue-600",
    red: "text-red-600",
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "inline-block" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn("font-chalk", colorClasses[color], className)}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} className="inline-block relative">
          {letter === " " ? "\u00A0" : letter}
          {/* Removed dust effect for cleaner whiteboard look */}
        </motion.span>
      ))}
    </motion.div>
  );
}
