"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LearningMethod } from "@prisma/client";

export async function createSubject(data: {
  name: string;
  learningMethod: LearningMethod;
  icon?: string;
  color?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const subject = await prisma.subject.create({
    data: {
      userId: session.user.id,
      name: data.name,
      learningMethod: data.learningMethod,
      icon: data.icon,
      color: data.color,
    },
  });

  revalidatePath("/dashboard");
  return subject;
}

export async function getSubjects(userId: string) {
  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: {
      _count: {
        select: { lessons: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return subjects.map((subject) => ({
    ...subject,
    lessonCount: subject._count.lessons,
  }));
}

export async function getSubjectById(id: string) {
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { updatedAt: "desc" },
      },
      generatedLessons: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!subject) return null;

  // Normalize and combine lessons
  const normalizedLessons = [
    ...subject.lessons.map(l => ({
      id: l.id,
      title: l.title,
      updatedAt: l.updatedAt,
      type: 'conversation' as const
    })),
    ...subject.generatedLessons.map(l => ({
      id: l.id,
      title: l.topic, // Map topic to title
      updatedAt: l.updatedAt,
      type: 'lesson' as const
    }))
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return {
    ...subject,
    lessons: normalizedLessons,
  };
}
