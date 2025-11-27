import { Lesson, KnowledgeNode, NodeMastery } from "@prisma/client";

export interface LessonMetrics {
  totalNodes: number;
  totalCycles: number;
  averageGrade: number;
  vocabularyMastery: number;
  weakNodes: Array<{
    nodeId: string;
    title: string;
    averageScore: number;
    attempts: number;
  }>;
  cycleBreakdown: Array<{
    cycleNumber: number;
    averageScore: number;
    completedAt: Date;
  }>;
}

export function calculateLessonMetrics(
  lesson: Lesson & { nodes: KnowledgeNode[] },
  masteryRecords: NodeMastery[]
): LessonMetrics {
  const totalNodes = lesson.nodes.length;
  const totalCycles = lesson.completedCycles;

  // Calculate average grade (convert letter grades to numeric)
  const gradeToNumber = (grade: string): number => {
    const gradeMap: Record<string, number> = {
      "A+": 4.3, "A": 4.0, "A-": 3.7,
      "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7,
      "D": 1.0, "F": 0.0
    };
    return gradeMap[grade] || 0;
  };

  const grades = masteryRecords
    .filter(m => m.grade)
    .map(m => gradeToNumber(m.grade!));
  
  const averageGrade = grades.length > 0 
    ? grades.reduce((sum, g) => sum + g, 0) / grades.length 
    : 0;

  // Calculate vocabulary mastery (average of partial recall scores)
  const partialRecalls = masteryRecords.filter(m => m.recallType === "partial");
  const vocabularyMastery = partialRecalls.length > 0
    ? partialRecalls.reduce((sum, m) => sum + m.masteryScore, 0) / partialRecalls.length
    : 0;

  // Identify weak nodes (average score < 0.7)
  const nodeScores = new Map<string, { scores: number[]; title: string }>();
  
  masteryRecords.forEach(record => {
    const node = lesson.nodes.find(n => n.id === record.nodeId);
    if (!node) return;
    
    if (!nodeScores.has(record.nodeId)) {
      nodeScores.set(record.nodeId, { scores: [], title: node.title });
    }
    nodeScores.get(record.nodeId)!.scores.push(record.masteryScore);
  });

  const weakNodes = Array.from(nodeScores.entries())
    .map(([nodeId, data]) => ({
      nodeId,
      title: data.title,
      averageScore: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
      attempts: data.scores.length
    }))
    .filter(node => node.averageScore < 0.7)
    .sort((a, b) => a.averageScore - b.averageScore);

  // Cycle breakdown
  const cycleScores = new Map<number, { scores: number[]; completedAt: Date }>();
  
  masteryRecords.forEach(record => {
    if (!record.cycleNumber) return;
    
    if (!cycleScores.has(record.cycleNumber)) {
      cycleScores.set(record.cycleNumber, { 
        scores: [], 
        completedAt: record.attemptedAt 
      });
    }
    cycleScores.get(record.cycleNumber)!.scores.push(record.masteryScore);
  });

  const cycleBreakdown = Array.from(cycleScores.entries())
    .map(([cycleNumber, data]) => ({
      cycleNumber,
      averageScore: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
      completedAt: data.completedAt
    }))
    .sort((a, b) => a.cycleNumber - b.cycleNumber);

  return {
    totalNodes,
    totalCycles,
    averageGrade,
    vocabularyMastery,
    weakNodes,
    cycleBreakdown
  };
}
