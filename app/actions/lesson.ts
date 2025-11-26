"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createLesson(data: {
  subjectId: string;
  title: string;
  topic?: string;
  documentId?: string; // If PDF was uploaded
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify subject belongs to user
  const subject = await prisma.subject.findFirst({
    where: {
      id: data.subjectId,
      userId: session.user.id,
    },
  });

  if (!subject) {
    throw new Error("Subject not found");
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      title: data.title,
      subjectId: data.subjectId,
      documentId: data.documentId,
      subject: subject.name, // Legacy field
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${data.subjectId}`);
  redirect(`/lesson/${conversation.id}`); // Redirect to whiteboard
}

