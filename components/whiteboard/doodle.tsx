"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DoodleProps {
  className?: string;
  variant?: "face" | "arrow" | "circle" | "underline" | "star" | "math" | "physics" | "history" | "bulb" | "clock";
  color?: "black" | "blue" | "red" | "green";
}

export function Doodle({ className, variant = "face", color = "black" }: DoodleProps) {
  const colors = {
    black: "text-gray-900",
    blue: "text-blue-600",
    red: "text-red-600",
    green: "text-green-600",
  };

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5, bounce: 0 },
        opacity: { duration: 0.01 }
      }
    }
  };

  return (
    <div className={cn(colors[color], "opacity-90", className)}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {variant === "face" && (
          <>
            <motion.path
              d="M30,40 C30,20 70,20 70,40 C70,60 30,60 30,40 Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              variants={draw}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            />
            <motion.path
              d="M40,38 L40,42 M60,38 L60,42"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              variants={draw}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            />
            <motion.path
              d="M40,50 Q50,55 60,50"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              variants={draw}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            />
          </>
        )}

        {variant === "arrow" && (
          <motion.path
            d="M10,50 Q50,20 90,50 M70,45 L90,50 L75,65"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          />
        )}

        {variant === "circle" && (
          <motion.path
            d="M50,10 C20,10 10,40 10,50 C10,80 40,90 50,90 C80,90 90,60 90,50 C90,20 60,10 50,12"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            variants={draw}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          />
        )}

        {variant === "underline" && (
          <motion.path
            d="M5,50 Q50,60 95,50"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            variants={draw}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          />
        )}

        {variant === "star" && (
          <motion.path
            d="M50,5 L65,35 L95,35 L70,55 L80,85 L50,65 L20,85 L30,55 L5,35 L35,35 Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          />
        )}

        {variant === "math" && (
          <>
            {/* E = mc^2ish doodle */}
            <motion.path d="M10,20 L30,20 M10,35 L25,35 M10,50 L30,50 M10,20 L10,50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
            <motion.path d="M40,30 L50,30 M40,40 L50,40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
            <motion.path d="M60,50 L60,35 Q60,20 70,20 Q80,20 80,35 L80,50 M60,20 L60,50 M70,20 L75,30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
            <motion.path d="M85,20 L95,20 L85,35 L95,35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
          </>
        )}

        {variant === "physics" && (
          <>
            {/* Projectile motion */}
            <motion.path d="M10,80 Q50,10 90,80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" variants={draw} initial="hidden" whileInView="visible" />
            <motion.path d="M10,80 L20,60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
            <motion.path d="M15,65 L25,65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
            <motion.circle cx="90" cy="80" r="3" fill="currentColor" variants={draw} initial="hidden" whileInView="visible" />
          </>
        )}

        {variant === "history" && (
          <>
            {/* Crown */}
            <motion.path d="M10,70 L10,30 L30,50 L50,10 L70,50 L90,30 L90,70 Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" variants={draw} initial="hidden" whileInView="visible" />
            <motion.circle cx="50" cy="80" r="2" fill="currentColor" variants={draw} initial="hidden" whileInView="visible" />
          </>
        )}

        {variant === "bulb" && (
          <>
            <motion.path d="M30,50 C30,20 70,20 70,50 C70,65 60,70 60,80 L40,80 C40,70 30,65 30,50 Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
            <motion.path d="M40,85 L60,85 M42,90 L58,90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
            <motion.path d="M20,20 L25,25 M80,20 L75,25 M50,5 L50,12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
          </>
        )}

        {variant === "clock" && (
          <>
            <motion.circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" variants={draw} initial="hidden" whileInView="visible" />
            <motion.path d="M50,50 L50,20 M50,50 L70,60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" variants={draw} initial="hidden" whileInView="visible" />
          </>
        )}
      </svg>
    </div>
  );
}
