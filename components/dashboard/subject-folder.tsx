"use client";

import { motion } from "framer-motion";
import { Doodle } from "@/components/whiteboard/doodle";

interface SubjectFolderProps {
  subject: string;
  icon: "history" | "math" | "physics" | "bulb";
  color: "blue" | "red" | "green" | "yellow";
  count?: number;
  onClick?: () => void;
  isActive?: boolean;
}

export function SubjectFolder({ subject, icon, color, count = 0, onClick, isActive = false }: SubjectFolderProps) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    red: "bg-red-50 border-red-200 hover:bg-red-100",
    green: "bg-green-50 border-green-200 hover:bg-green-100",
    yellow: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  };

  const activeClass = isActive ? "ring-2 ring-offset-2 ring-gray-400 transform -translate-y-1" : "";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full aspect-[4/3] rounded-lg border-2 p-4 flex flex-col justify-between transition-all cursor-pointer ${colorMap[color]} ${activeClass}`}
    >
      {/* Folder Tab Visual */}
      <div className={`absolute -top-3 left-0 w-1/3 h-4 rounded-t-md border-t-2 border-x-2 border-inherit bg-inherit`} />

      <div className="flex justify-between items-start w-full">
        <Doodle variant={icon} className={`w-8 h-8 text-${color}-500`} />
        {count > 0 && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white text-${color}-600 border border-${color}-200`}>
            {count}
          </span>
        )}
      </div>

      <div className="text-left">
        <h3 className="font-chalk text-xl font-bold text-gray-800">{subject}</h3>
        <p className="text-xs text-gray-500 font-sans">{count} lessons</p>
      </div>
    </motion.div>
  );
}
