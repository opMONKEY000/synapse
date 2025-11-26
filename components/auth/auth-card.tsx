"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Doodle } from "@/components/whiteboard/doodle";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthCard({ children, title, subtitle, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full",
        "border-2 border-gray-100",
        className
      )}
    >
      {/* Decorative doodles */}
      <div className="absolute -top-8 -right-8 w-16 h-16 opacity-30">
        <Doodle variant="bulb" color="blue" />
      </div>
      <div className="absolute -bottom-6 -left-6 w-12 h-12 opacity-20">
        <Doodle variant="star" color="green" />
      </div>

      {/* Hand-drawn border effect */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="8"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
          strokeLinecap="round"
          className="opacity-30"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>

      <div className="relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-chalk font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 font-sans">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </motion.div>
  );
}
