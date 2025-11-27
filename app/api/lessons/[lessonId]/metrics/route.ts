import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateLessonMetrics } from "@/lib/lesson-metrics";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lessonId } = await params;

    // Fetch lesson with all related data
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, userId: session.user.id },
      include: {
        nodes: {
          orderBy: { order: "asc" },
        },
        subject: true,
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    // Fetch mastery records
    const masteryRecords = await prisma.nodeMastery.findMany({
      where: {
        userId: session.user.id,
        nodeId: { in: lesson.nodes.map(n => n.id) },
      },
      orderBy: { attemptedAt: "asc" },
    });

    // Calculate metrics
    const metrics = calculateLessonMetrics(lesson, masteryRecords);

    return NextResponse.json({
      lesson,
      masteryRecords,
      metrics,
    });

  } catch (error) {
    console.error("Metrics fetch error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
