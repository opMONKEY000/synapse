"use client";

import { motion } from "framer-motion";
import { StickyNote } from "@/components/whiteboard/sticky-note";
import { Doodle } from "@/components/whiteboard/doodle";
import { Trophy, Flame, Calendar } from "lucide-react";

interface ProgressStats {
  mastery: number;
  streak: number;
  reviewsDue: number;
}

interface ProgressCardProps {
  stats: ProgressStats;
}

export function ProgressCard({ stats }: ProgressCardProps) {
  return (
    <div className="space-y-6">
      {/* Main Report Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Doodle variant="star" className="w-24 h-24 text-yellow-500" />
        </div>

        <h2 className="text-2xl font-chalk font-bold text-gray-900 mb-6">Progress Report</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
            <Trophy className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-3xl font-chalk font-bold text-blue-600">{stats.mastery}%</span>
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Mastery</span>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 flex flex-col items-center justify-center text-center">
            <Flame className="w-8 h-8 text-orange-500 mb-2" />
            <span className="text-3xl font-chalk font-bold text-orange-600">{stats.streak}</span>
            <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Day Streak</span>
          </div>
        </div>
      </motion.div>

      {/* Reviews Due Sticky Note */}
      <div className="flex justify-center transform rotate-2 hover:rotate-0 transition-transform duration-300">
        <StickyNote color="yellow" className="w-full">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-red-600">
              <Calendar className="w-5 h-5" />
              <span className="font-chalk font-bold text-lg">Reviews Due</span>
            </div>
            <span className="text-5xl font-chalk font-bold text-gray-900">{stats.reviewsDue}</span>
            <p className="text-sm text-gray-600 text-center font-sans">
              {stats.reviewsDue > 0 
                ? "Items are fading from memory! Review them now." 
                : "All caught up! Great job."}
            </p>
          </div>
        </StickyNote>
      </div>
    </div>
  );
}
