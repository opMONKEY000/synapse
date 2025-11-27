import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const progressSchema = z.object({
  currentNodeIndex: z.number(),
  currentPhase: z.enum(["teaching", "recall", "complete"]),
  currentCycleNumber: z.number(),
  completedCycles: z.number(),
  recallCycle: z.number().optional(),
  recallStep: z.number().optional(),
  resumeIndex: z.number().nullable().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lessonId } = await params;
    const body = await req.json();
    const { 
      currentNodeIndex, 
      currentPhase, 
      currentCycleNumber, 
      completedCycles,
      recallCycle,
      recallStep,
      resumeIndex
    } = progressSchema.parse(body);

    // Verify ownership
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, userId: session.user.id },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    // Update lesson progress
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        currentNodeIndex,
        currentPhase,
        currentCycleNumber,
        completedCycles,
        recallCycle: recallCycle ?? 0,
        recallStep: recallStep ?? 0,
        resumeIndex: resumeIndex,
        // If complete, set completedAt
        completedAt: currentPhase === "complete" ? new Date() : undefined,
      },
    });

    return NextResponse.json(updatedLesson);

  } catch (error) {
    console.error("Progress update error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
