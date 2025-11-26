import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId } = await params;

    // Verify lesson belongs to user
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, userId: session.user.id },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Delete all nodes first (cascade should handle this, but being explicit)
    await prisma.knowledgeNode.deleteMany({
      where: { lessonId },
    });

    // Delete the lesson
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
