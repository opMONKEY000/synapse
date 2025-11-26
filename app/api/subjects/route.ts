import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LearningMethod } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, learningMethod, icon, color } = body;

    if (!name || !learningMethod) {
      return NextResponse.json(
        { error: "Name and learning method are required" },
        { status: 400 }
      );
    }

    // Validate learning method
    if (!Object.values(LearningMethod).includes(learningMethod)) {
      return NextResponse.json(
        { error: "Invalid learning method" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        userId: session.user.id,
        name,
        learningMethod,
        icon,
        color,
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjects = await prisma.subject.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const subjectsWithCounts = subjects.map((subject) => ({
      ...subject,
      lessonCount: subject._count.lessons,
    }));

    return NextResponse.json(subjectsWithCounts);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
