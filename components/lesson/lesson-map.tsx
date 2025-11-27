"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Download } from "lucide-react";
import { KnowledgeNode } from "@prisma/client";

interface LessonMapProps {
  nodes: Array<KnowledgeNode & { averageGrade?: string }>;
  currentNodeId: string;
  onNodeClick: (nodeId: string) => void;
  onExport: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function LessonMap({ 
  nodes, 
  currentNodeId, 
  onNodeClick, 
  onExport, 
  onClose, 
  isOpen 
}: LessonMapProps) {
  const gradeColor = (grade?: string) => {
    if (!grade) return "bg-gray-200 text-gray-600";
    if (grade.startsWith("A")) return "bg-green-500 text-white";
    if (grade.startsWith("B")) return "bg-blue-500 text-white";
    if (grade.startsWith("C")) return "bg-yellow-500 text-white";
    if (grade.startsWith("D")) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-chalk font-bold text-gray-900">
                Lesson Map
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Node List */}
            <div className="p-6 space-y-3">
              {nodes.map((node, idx) => {
                const isCurrent = node.id === currentNodeId;
                const isCompleted = !!node.averageGrade;

                return (
                  <motion.button
                    key={node.id}
                    onClick={() => onNodeClick(node.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isCurrent
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Node Number */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-chalk font-bold text-sm ${
                        isCurrent ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Node Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-chalk text-lg font-bold text-gray-900 mb-1">
                          {node.title}
                        </h3>
                        
                        {/* Vocabulary Preview */}
                        {node.vocabularyTerms && node.vocabularyTerms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {node.vocabularyTerms.slice(0, 3).map((term, i) => (
                              <span
                                key={i}
                                className="text-xs font-sans bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {term}
                              </span>
                            ))}
                            {node.vocabularyTerms.length > 3 && (
                              <span className="text-xs font-sans text-gray-500">
                                +{node.vocabularyTerms.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Grade Badge */}
                        {isCompleted && (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-sans font-bold ${gradeColor(node.averageGrade)}`}>
                            {node.averageGrade}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      {isCurrent && (
                        <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Export Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <button
                onClick={onExport}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-sans font-medium hover:bg-gray-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export Lesson Notes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
