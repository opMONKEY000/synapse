import { useState, useCallback, useEffect } from "react";
import { KnowledgeNode, Lesson } from "@prisma/client";
import { generateRecallQueue, RecallTask } from "@/lib/recall-logic";

export interface LessonProgressState {
  currentNodeIndex: number;
  currentPhase: "teaching" | "recall" | "complete";
  currentCycleNumber: number;
  completedCycles: number;
}

interface UseLessonProgressProps {
  lesson: Lesson;
  nodes: KnowledgeNode[];
  onComplete?: () => void;
}

export function useLessonProgress({ lesson, nodes, onComplete }: UseLessonProgressProps) {
  // Initialize state from lesson prop
  const [progress, setProgress] = useState<LessonProgressState>({
    currentNodeIndex: lesson.currentNodeIndex,
    currentPhase: lesson.currentPhase as "teaching" | "recall" | "complete",
    currentCycleNumber: lesson.currentCycleNumber,
    completedCycles: lesson.completedCycles,
  });

  const [recallQueue, setRecallQueue] = useState<RecallTask[]>([]);
  const [currentRecallIndex, setCurrentRecallIndex] = useState(0);

  // Sync state to server
  const syncProgress = useCallback(async (newProgress: LessonProgressState) => {
    try {
      await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProgress),
      });
    } catch (error) {
      console.error("Failed to sync progress:", error);
    }
  }, [lesson.id]);

  // Initialize recall queue if we load into a recall phase
  useEffect(() => {
    if (progress.currentPhase === "recall" && recallQueue.length === 0) {
      const isFinal = (progress.currentCycleNumber * 3) >= nodes.length;
      const queue = generateRecallQueue(progress.currentCycleNumber, nodes, isFinal);
      setRecallQueue(queue);
      // We assume we start at 0 if reloading. 
      // TODO: Ideally we'd persist recall index too, but for now restarting the cycle is acceptable.
      setCurrentRecallIndex(0);
    }
  }, [progress.currentPhase, progress.currentCycleNumber, nodes, recallQueue.length]);

  const advance = useCallback(() => {
    setProgress(prev => {
      let next = { ...prev };

      if (prev.currentPhase === "teaching") {
        // Advance node index
        const nextIndex = prev.currentNodeIndex + 1;
        
        // Check if we finished a block of 3 (indices 2, 5, 8...)
        // (nextIndex) is the count of completed nodes.
        // If we just finished node index 2 (count 3), we should trigger cycle 1.
        // If we just finished node index 5 (count 6), we should trigger cycle 2.
        
        // Current node index is the one we are VIEWING.
        // If we click "Continue" on node 2, we are done with 0, 1, 2.
        // So if (prev.currentNodeIndex + 1) % 3 === 0
        
        const nodesCompleted = prev.currentNodeIndex + 1;
        const isBlockComplete = nodesCompleted % 3 === 0;
        const isLessonComplete = nodesCompleted >= nodes.length;

        if (isBlockComplete) {
          // Enter Recall Phase
          next.currentPhase = "recall";
          next.currentCycleNumber = prev.currentCycleNumber + 1;
          
          // Generate queue immediately for local state
          const isFinal = nodesCompleted >= nodes.length;
          const queue = generateRecallQueue(next.currentCycleNumber, nodes, isFinal);
          setRecallQueue(queue);
          setCurrentRecallIndex(0);
          
          // Don't increment node index yet, we want to stay "at" the end of the block visually?
          // Or maybe we just hide the teaching UI.
        } else if (isLessonComplete) {
           // Should have been caught by block complete if divisible by 3.
           // If lesson size is not divisible by 3? Spec says "5-25 nodes".
           // Spec implies "After every 3 nodes".
           // If we have 5 nodes: 
           // Teach 0, 1, 2 -> Recall Cycle 1
           // Teach 3, 4 -> End?
           // Spec: "Last Cycle Special Case: When the lesson ends on a cycle"
           // It implies lessons are multiples of 3? Or we just trigger recall at end.
           
           // Let's assume for now we trigger recall if we hit the end, even if not % 3?
           // "After every 3 nodes, a recall cycle begins"
           // If we have 5 nodes, we do 0,1,2 -> Recall. Then 3,4 -> End.
           // Should we do a partial recall for 3,4?
           // The spec doesn't explicitly handle "partial blocks" at the end.
           // Let's assume standard behavior: only trigger on % 3.
           // If we finish node 4 (5th node) and it's the last one, just finish?
           
           next.currentPhase = "complete";
           if (onComplete) onComplete();
        } else {
          // Just next node
          next.currentNodeIndex = nextIndex;
        }
      } else if (prev.currentPhase === "recall") {
        // Advance recall queue
        const nextRecallIndex = currentRecallIndex + 1;
        
        if (nextRecallIndex >= recallQueue.length) {
          // Cycle Complete
          next.currentPhase = "teaching";
          next.completedCycles = prev.completedCycles + 1;
          
          // Move to next teaching node (start of next block)
          // We were at index 2 (end of block 1). Next is 3.
          // Wait, in teaching phase we didn't increment index when entering recall.
          // So prev.currentNodeIndex is still 2.
          next.currentNodeIndex = prev.currentNodeIndex + 1;
          
          // Check if we are actually done with all nodes
          if (next.currentNodeIndex >= nodes.length) {
            next.currentPhase = "complete";
            if (onComplete) onComplete();
          }
        } else {
          setCurrentRecallIndex(nextRecallIndex);
          // State doesn't change, just local index
          return prev; 
        }
      }

      syncProgress(next);
      return next;
    });
  }, [nodes, currentRecallIndex, recallQueue.length, onComplete, syncProgress]);

  const currentRecallTask = progress.currentPhase === "recall" ? recallQueue[currentRecallIndex] : null;

  return {
    progress,
    currentRecallTask,
    advance,
  };
}
