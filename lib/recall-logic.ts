import { KnowledgeNode } from "@prisma/client";

export type RecallType = "partial" | "full-forward" | "full-backward" | "full-comprehensive";

export interface RecallTask {
  nodeId: string;
  nodeIndex: number;
  type: RecallType;
  hintNodeIds: string[];
  hintNodeIndices: number[];
}

/**
 * Generates the queue of recall tasks for a specific cycle.
 * 
 * @param cycleNumber 1-indexed cycle number
 * @param nodes All nodes in the lesson (must be sorted by order)
 * @param isFinalCycle Whether this is the last cycle of the lesson
 * @returns Array of RecallTasks to be performed in order
 */
export function generateRecallQueue(
  cycleNumber: number, 
  nodes: KnowledgeNode[], 
  isFinalCycle: boolean
): RecallTask[] {
  const queue: RecallTask[] = [];
  
  // Calculate indices for the current batch of 3 nodes
  // Cycle 1: 0, 1, 2
  // Cycle 2: 3, 4, 5
  // etc.
  const startIndex = (cycleNumber - 1) * 3;
  const middleIndex = startIndex + 1;
  const endIndex = startIndex + 2;

  // Validate we have enough nodes for this cycle
  if (endIndex >= nodes.length) {
    console.warn(`Cycle ${cycleNumber} requires nodes up to index ${endIndex}, but only ${nodes.length} nodes exist.`);
    return [];
  }

  const startNode = nodes[startIndex];
  const middleNode = nodes[middleIndex];
  const endNode = nodes[endIndex];

  // 1. Retest previous cycle's middle node (if applicable)
  // For Cycle 2, we retest Cycle 1's middle node (index 1)
  if (cycleNumber > 1) {
    const prevCycleMiddleIndex = ((cycleNumber - 2) * 3) + 1;
    const prevMiddleNode = nodes[prevCycleMiddleIndex];
    const prevStartNode = nodes[prevCycleMiddleIndex - 1];
    const prevEndNode = nodes[prevCycleMiddleIndex + 1];

    if (prevMiddleNode && prevStartNode && prevEndNode) {
      queue.push({
        nodeId: prevMiddleNode.id,
        nodeIndex: prevCycleMiddleIndex,
        type: "full-comprehensive", // Or just standard full recall? Spec implies full context.
        hintNodeIds: [prevStartNode.id, prevEndNode.id],
        hintNodeIndices: [prevCycleMiddleIndex - 1, prevCycleMiddleIndex + 1]
      });
    }
  }

  // 2. Partial Recall of current middle node
  queue.push({
    nodeId: middleNode.id,
    nodeIndex: middleIndex,
    type: "partial",
    hintNodeIds: [],
    hintNodeIndices: []
  });

  // 3. Full Recall of first node (Hint: middle)
  // "Full-backward" because we look forward to the hint? 
  // Actually, "full-forward" usually means "predict next", "full-backward" means "recall previous".
  // Here we are recalling A (previous) using B (next) as hint.
  queue.push({
    nodeId: startNode.id,
    nodeIndex: startIndex,
    type: "full-backward", // Recalling a past node
    hintNodeIds: [middleNode.id],
    hintNodeIndices: [middleIndex]
  });

  // 4. Full Recall of last node (Hint: middle)
  // Recalling C (current/next) using B (previous) as hint.
  queue.push({
    nodeId: endNode.id,
    nodeIndex: endIndex,
    type: "full-forward", // Recalling a forward/current node
    hintNodeIds: [middleNode.id],
    hintNodeIndices: [middleIndex]
  });

  // 5. Final Cycle Special Case: Comprehensive test of middle node
  if (isFinalCycle) {
    queue.push({
      nodeId: middleNode.id,
      nodeIndex: middleIndex,
      type: "full-comprehensive",
      hintNodeIds: [startNode.id, endNode.id], // Show neighbors as context
      hintNodeIndices: [startIndex, endIndex]
    });
  }

  return queue;
}
