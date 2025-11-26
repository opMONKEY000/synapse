import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeskMat } from "@/components/dashboard/desk-mat";
import { Doodle } from "@/components/whiteboard/doodle";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSubjectById } from "@/app/actions/subject";
import { LessonCardWrapper } from "@/components/dashboard/lesson-card-wrapper";

interface SubjectPageProps {
  params: Promise<{
    subject: string; // This is actually the subject ID
  }>;
}

const learningMethodLabels = {
  MEMORY_DRIVEN: "Memory-Driven",
  SKILL_DRIVEN: "Skill-Driven",
  CREATIVE_ANALYTICAL: "Creative-Analytical",
};

export default async function SubjectPage({ params }: SubjectPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Await params in Next.js 15+
  const { subject: subjectId } = await params;

  // Fetch subject by ID
  const subject = await getSubjectById(subjectId);

  if (!subject) {
    redirect("/dashboard");
  }

  const icon = "bulb"; // TODO: Use subject.icon when available
  const colorClass = "text-blue-500"; // TODO: Map from subject.color

  return (
    <DeskMat user={session.user}>
      <div className="col-span-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <MarkerButton variant="secondary" className="!px-4 !py-2">
              <ArrowLeft className="w-6 h-6" />
            </MarkerButton>
          </Link>
          
          <div className="flex items-center gap-3">
            <Doodle variant={icon as any} className={`w-12 h-12 ${colorClass}`} />
            <div>
              <h1 className="text-5xl font-chalk font-bold text-gray-900">{subject.name}</h1>
              <p className="text-sm text-gray-500 font-sans mt-1">
                {learningMethodLabels[subject.learningMethod]}
              </p>
            </div>
          </div>
        </div>

        {/* Lesson Grid */}
        {subject.lessons.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-xl text-gray-500 font-sans mb-4">No lessons yet in {subject.name}.</p>
            <Link href={`/dashboard/${subjectId}/new`}>
              <MarkerButton variant="primary">Create Your First Lesson</MarkerButton>
            </Link>
          </div>
        ) : (
          <>
            <LessonCardWrapper subjectId={subjectId} lessons={subject.lessons} />
            <div className="mt-6 flex justify-center">
              <Link href={`/dashboard/${subjectId}/new`}>
                <MarkerButton variant="secondary">Create New Lesson</MarkerButton>
              </Link>
            </div>
          </>
        )}
      </div>
    </DeskMat>
  );
}
