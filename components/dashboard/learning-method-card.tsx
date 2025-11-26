"use client";

import { motion } from "framer-motion";
import { Brain, Calculator, Lightbulb } from "lucide-react";

type LearningMethodType = "MEMORY_DRIVEN" | "SKILL_DRIVEN" | "CREATIVE_ANALYTICAL";

interface LearningMethodCardProps {
  method: LearningMethodType;
  selected: boolean;
  onClick: () => void;
}

const methodConfig = {
  MEMORY_DRIVEN: {
    title: "Memory-Driven",
    icon: Brain,
    description: "Focus on memorization and recall through repetition",
    examples: "History, Psychology, Environmental Science",
    color: "blue",
  },
  SKILL_DRIVEN: {
    title: "Skill-Driven",
    icon: Calculator,
    description: "Step-by-step problem-solving and skill mastery",
    examples: "Math, Physics, Chemistry",
    color: "green",
  },
  CREATIVE_ANALYTICAL: {
    title: "Creative-Analytical",
    icon: Lightbulb,
    description: "Interpretation, analysis, and creative thinking",
    examples: "English, Literature, Philosophy",
    color: "yellow",
  },
};

export function LearningMethodCard({
  method,
  selected,
  onClick,
}: LearningMethodCardProps) {
  const config = methodConfig[method];
  const Icon = config.icon;

  const colorClasses = {
    blue: selected
      ? "border-blue-500 bg-blue-50"
      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50",
    green: selected
      ? "border-green-500 bg-green-50"
      : "border-gray-200 hover:border-green-300 hover:bg-green-50/50",
    yellow: selected
      ? "border-yellow-500 bg-yellow-50"
      : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50",
  };

  const iconColorClasses = {
    blue: selected ? "text-blue-600" : "text-gray-400",
    green: selected ? "text-green-600" : "text-gray-400",
    yellow: selected ? "text-yellow-600" : "text-gray-400",
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full p-6 rounded-xl border-2 transition-all text-left ${
        colorClasses[config.color as keyof typeof colorClasses]
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              selected ? `bg-${config.color}-100` : "bg-gray-100"
            }`}
          >
            <Icon
              className={`w-6 h-6 ${
                iconColorClasses[config.color as keyof typeof iconColorClasses]
              }`}
            />
          </div>
          <h3 className="text-xl font-chalk font-bold text-gray-900">
            {config.title}
          </h3>
        </div>

        <p className="text-gray-700 font-sans text-sm">{config.description}</p>

        <p className="text-gray-500 font-sans text-xs italic">
          Examples: {config.examples}
        </p>
      </div>

      {selected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
      )}
    </motion.button>
  );
}
