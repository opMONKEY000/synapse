"use client";

import { motion } from "framer-motion";

interface DeskMatProps {
  children: React.ReactNode;
  user?: { name?: string | null };
}

export function DeskMat({ children, user }: DeskMatProps) {
  const date = new Date();
  const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-4"
      >
        <div>
          <h1 className="text-4xl font-chalk font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-gray-500 font-sans mt-1">Ready to reconstruct some knowledge?</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xl font-chalk text-gray-600">{dateString}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {children}
      </div>
    </div>
  );
}
