import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LessonView } from "@/components/lesson/lesson-view";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subjectId: string; lessonId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { subjectId, lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, userId: session.user.id },
    include: {
      nodes: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!lesson) {
    redirect(`/subjects/${subjectId}`);
  }

  return (
    <LessonView 
      lessonId={lesson.id} 
      initialNodes={lesson.nodes} 
      subjectId={subjectId} 
    />
  );
}
