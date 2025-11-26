"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface MarkerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}

export function MarkerButton({ children, className, variant = "primary", ...props }: MarkerButtonProps) {
  const variantStyles = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    danger: "text-red-600",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, rotate: -1 }}
      whileTap={{ scale: 0.95, rotate: 1 }}
      className={cn(
        "relative group px-8 py-3 font-chalk text-2xl font-bold tracking-wide transition-colors focus:outline-none",
        variantStyles[variant],
        className
      )}
      {...props as any}
    >
      {/* Border SVG to look like marker ink */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M3,3 L97,5 L95,95 L5,93 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90 group-hover:opacity-100 transition-opacity"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
          {/* Second pass for ink thickness variation */}
          <motion.path
            d="M4,6 L96,4 L94,96 L6,94 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeInOut" }}
          />
        </svg>
      </div>
      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
  );
}
