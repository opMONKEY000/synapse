"use client";

import { motion } from "framer-motion";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import { Clock, ArrowRight, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface LessonCardProps {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  progress?: number;
  type?: "conversation" | "document" | "lesson";
  onDelete?: () => void;
}

export function LessonCard({ id, subjectId, title, date, progress = 0, type = "conversation", onDelete }: LessonCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      onDelete?.();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Failed to delete lesson. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all relative overflow-hidden group"
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 group-hover:bg-blue-500 transition-colors" />

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Delete lesson"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-blue-500 transition-colors">
          <FileText className="w-6 h-6" />
        </div>
        {progress > 0 && (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
            {progress}% Complete
          </span>
        )}
      </div>

      <h3 className="font-chalk text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
        {title}
      </h3>

      <div className="flex items-center gap-2 text-sm text-gray-500 font-sans mb-6">
        <Clock className="w-4 h-4" />
        <span>{date}</span>
      </div>

      <Link href={`/subjects/${subjectId}/lessons/${id}`} className="block">
        <MarkerButton variant="secondary" className="w-full text-base py-2 flex items-center justify-center gap-2">
          Resume <ArrowRight className="w-4 h-4" />
        </MarkerButton>
      </Link>
    </motion.div>
  );
}
