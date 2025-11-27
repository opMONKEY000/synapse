import { Lesson, KnowledgeNode, NodeMastery } from "@prisma/client";

export function exportLessonToMarkdown(
  lesson: Lesson & { nodes: KnowledgeNode[] },
  masteryRecords: NodeMastery[]
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${lesson.topic}`);
  lines.push(`**Difficulty:** ${lesson.difficultyLevel}`);
  lines.push(`**Completed:** ${lesson.completedAt?.toLocaleDateString() || "In Progress"}`);
  lines.push("");

  // Overall Stats
  const avgScore = masteryRecords.length > 0
    ? masteryRecords.reduce((sum, m) => sum + m.masteryScore, 0) / masteryRecords.length
    : 0;
  
  lines.push(`## Summary`);
  lines.push(`- **Nodes:** ${lesson.nodes.length}`);
  lines.push(`- **Cycles Completed:** ${lesson.completedCycles}`);
  lines.push(`- **Average Score:** ${Math.round(avgScore * 100)}%`);
  lines.push("");

  // Nodes
  lines.push(`## Lesson Content`);
  lines.push("");

  lesson.nodes.forEach((node, idx) => {
    lines.push(`### ${idx + 1}. ${node.title}`);
    lines.push("");

    if (node.summary) {
      lines.push(node.summary);
      lines.push("");
    }

    // Vocabulary
    if (node.vocabulary && Array.isArray(node.vocabulary)) {
      lines.push(`**Key Terms:**`);
      lines.push("");
      (node.vocabulary as any[]).forEach((vocab) => {
        lines.push(`- **${vocab.term}:** ${vocab.definition}`);
      });
      lines.push("");
    }

    // Thinking Question
    if (node.thinkingQuestion) {
      lines.push(`**Reflection:** ${node.thinkingQuestion}`);
      lines.push("");
    }

    // Performance
    const nodeRecords = masteryRecords.filter(m => m.nodeId === node.id);
    if (nodeRecords.length > 0) {
      const nodeAvg = nodeRecords.reduce((sum, m) => sum + m.masteryScore, 0) / nodeRecords.length;
      const grades = nodeRecords.filter(m => m.grade).map(m => m.grade);
      
      lines.push(`**Your Performance:**`);
      lines.push(`- Average Score: ${Math.round(nodeAvg * 100)}%`);
      if (grades.length > 0) {
        lines.push(`- Grades: ${grades.join(", ")}`);
      }
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  });

  // Struggled Vocabulary
  const partialRecalls = masteryRecords.filter(m => m.recallType === "partial");
  const struggledTerms = partialRecalls
    .filter(m => m.masteryScore < 0.7)
    .map(m => {
      const node = lesson.nodes.find(n => n.id === m.nodeId);
      return {
        term: m.userResponse || "Unknown",
        score: m.masteryScore,
        nodeTitle: node?.title || "Unknown"
      };
    });

  if (struggledTerms.length > 0) {
    lines.push(`## Vocabulary to Review`);
    lines.push("");
    struggledTerms.forEach(item => {
      lines.push(`- **${item.term}** (${item.nodeTitle}) - ${Math.round(item.score * 100)}%`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
