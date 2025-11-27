"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, BookOpen, Target, RotateCcw, Download, Loader2 } from "lucide-react";
import { LessonMetrics } from "@/lib/lesson-metrics";

interface ReviewDashboardProps {
  metrics: LessonMetrics;
  lessonTitle: string;
  onRetry: (nodeId: string) => void;
  onExport: () => void;
  onClose: () => void;
  isExporting?: boolean;
}

export function ReviewDashboard({ 
  metrics, 
  lessonTitle, 
  onRetry, 
  onExport, 
  onClose,
  isExporting = false
}: ReviewDashboardProps) {
  const gradeColor = (score: number) => {
    if (score >= 3.7) return "text-green-600";
    if (score >= 3.0) return "text-blue-600";
    if (score >= 2.0) return "text-yellow-600";
    return "text-red-600";
  };

  const scoreToGrade = (score: number): string => {
    if (score >= 4.0) return "A";
    if (score >= 3.7) return "A-";
    if (score >= 3.3) return "B+";
    if (score >= 3.0) return "B";
    if (score >= 2.7) return "B-";
    if (score >= 2.3) return "C+";
    if (score >= 2.0) return "C";
    if (score >= 1.7) return "C-";
    if (score >= 1.0) return "D";
    return "F";
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-5xl font-chalk font-bold text-gray-900 mb-2">
            Lesson Complete!
          </h1>
          <p className="text-2xl font-chalk text-gray-600">{lessonTitle}</p>
        </motion.div>

        {/* Overall Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Nodes Mastered"
            value={`${metrics.totalNodes}`}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Cycles Completed"
            value={`${metrics.totalCycles}`}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Overall Grade"
            value={scoreToGrade(metrics.averageGrade)}
            color={`bg-green-100 ${gradeColor(metrics.averageGrade)}`}
          />
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label="Vocabulary"
            value={`${Math.round(metrics.vocabularyMastery * 100)}%`}
            color="bg-yellow-100 text-yellow-600"
          />
        </motion.div>

        {/* Cycle Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-chalk font-bold text-gray-900 mb-6">
            Cycle Performance
          </h2>
          <div className="space-y-3">
            {metrics.cycleBreakdown.map((cycle) => (
              <div
                key={cycle.cycleNumber}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-chalk font-bold text-xl">
                  {cycle.cycleNumber}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-chalk text-lg text-gray-700">
                      Cycle {cycle.cycleNumber}
                    </span>
                    <span className={`font-chalk text-xl font-bold ${gradeColor(cycle.averageScore * 4)}`}>
                      {scoreToGrade(cycle.averageScore * 4)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${cycle.averageScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weak Nodes */}
        {metrics.weakNodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-chalk font-bold text-gray-900 mb-6">
              Nodes to Review
            </h2>
            <div className="space-y-3">
              {metrics.weakNodes.map((node) => (
                <div
                  key={node.nodeId}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div>
                    <h3 className="font-chalk text-xl text-gray-900 font-bold">
                      {node.title}
                    </h3>
                    <p className="font-sans text-sm text-gray-600">
                      Average: {Math.round(node.averageScore * 100)}% • {node.attempts} attempts
                    </p>
                  </div>
                  <button
                    onClick={() => onRetry(node.nodeId)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-sans font-medium hover:bg-blue-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retry
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-sans font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Notes
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-900 rounded-full font-sans font-medium border-2 border-gray-900 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="font-sans text-sm text-gray-600 mb-1">{label}</div>
      <div className="font-chalk text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
