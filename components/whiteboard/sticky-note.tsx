"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StickyNoteProps {
  children: React.ReactNode;
  className?: string;
  color?: "yellow" | "pink" | "blue" | "green";
  rotate?: number;
  delay?: number;
}

export function StickyNote({ 
  children, 
  className, 
  color = "yellow", 
  rotate = 0,
  delay = 0
}: StickyNoteProps) {
  const colors = {
    yellow: "bg-yellow-100 text-yellow-900 border-yellow-200",
    pink: "bg-pink-100 text-pink-900 border-pink-200",
    blue: "bg-blue-100 text-blue-900 border-blue-200",
    green: "bg-green-100 text-green-900 border-green-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotate - 5 }}
      whileInView={{ opacity: 1, scale: 1, rotate: rotate }}
      viewport={{ once: true }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: delay 
      }}
      whileHover={{ scale: 1.05, rotate: rotate + 2, zIndex: 10 }}
      className={cn(
        "relative p-6 w-64 aspect-square shadow-md hover:shadow-xl transition-shadow cursor-default",
        "font-chalk text-xl leading-relaxed flex items-center justify-center text-center",
        colors[color],
        className
      )}
    >
      {/* Tape effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-sm rotate-1 shadow-sm" />
      
      {children}
    </motion.div>
  );
}
