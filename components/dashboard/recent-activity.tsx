"use client";

import { motion } from "framer-motion";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import { Clock, ArrowRight } from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  subject: string;
  date: string;
  progress: number; // 0-100
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
      {/* Lined Paper Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
           style={{ backgroundImage: 'linear-gradient(#999 1px, transparent 1px)', backgroundSize: '100% 2rem', marginTop: '2rem' }}
      />
      
      <h2 className="text-2xl font-chalk font-bold text-gray-900 mb-6 relative z-10">Recent Lessons</h2>

      <div className="space-y-4 relative z-10">
        {activities.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">No recent activity. Time to learn!</p>
        ) : (
          activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{activity.subject}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activity.date}
                  </span>
                </div>
                <h3 className="text-lg font-sans font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {activity.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Mini Progress Circle */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="#eee" strokeWidth="3" fill="none" />
                    <circle cx="20" cy="20" r="16" stroke={activity.progress === 100 ? "#22c55e" : "#3b82f6"} strokeWidth="3" fill="none" strokeDasharray="100" strokeDashoffset={100 - activity.progress} />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-gray-600">{activity.progress}%</span>
                </div>
                
                <MarkerButton variant="secondary" className="!p-2">
                  <ArrowRight className="w-4 h-4" />
                </MarkerButton>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 text-center relative z-10">
        <button className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
          View All History
        </button>
      </div>
    </div>
  );
}
