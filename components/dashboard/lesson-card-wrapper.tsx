"use client";

import { useRouter } from "next/navigation";
import { LessonCard } from "@/components/dashboard/lesson-card";

interface LessonCardWrapperProps {
  subjectId: string;
  lessons: Array<{
    id: string;
    title: string;
    updatedAt: Date;
  }>;
}

export function LessonCardWrapper({ subjectId, lessons }: LessonCardWrapperProps) {
  const router = useRouter();

  const handleDelete = () => {
    router.refresh();
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          id={lesson.id}
          subjectId={subjectId}
          title={lesson.title}
          date={lesson.updatedAt.toLocaleDateString()}
          progress={0} // Placeholder
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
