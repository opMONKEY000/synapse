import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeskMat } from "@/components/dashboard/desk-mat";
import { NewLessonForm } from "@/components/dashboard/new-lesson-form";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StickyNote } from "@/components/whiteboard/sticky-note";
import { getSubjectById } from "@/app/actions/subject";

interface NewLessonPageProps {
  params: Promise<{
    subject: string; // This is actually the subject ID
  }>;
}

const learningMethodLabels = {
  MEMORY_DRIVEN: "Memory-Driven",
  SKILL_DRIVEN: "Skill-Driven",
  CREATIVE_ANALYTICAL: "Creative-Analytical",
};

export default async function NewLessonPage({ params }: NewLessonPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { subject: subjectId } = await params;

  // Fetch subject to display name
  const subject = await getSubjectById(subjectId);
  
  if (!subject) {
    redirect("/dashboard");
  }

  return (
    <DeskMat user={session.user}>
      <div className="col-span-12 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/dashboard/${subjectId}`}>
            <MarkerButton variant="secondary" className="!px-4 !py-2">
              <ArrowLeft className="w-6 h-6" />
            </MarkerButton>
          </Link>
          <div>
            <h1 className="text-4xl font-chalk font-bold text-gray-900">
              Create New Lesson
            </h1>
            <p className="text-gray-600 font-sans mt-1">
              in {subject.name} • {learningMethodLabels[subject.learningMethod]}
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Decorative Sticky Note */}
          <div className="absolute -top-6 -right-20 hidden lg:block transform rotate-6">
            <StickyNote color="yellow">
              <span className="text-lg">What will you master today?</span>
            </StickyNote>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <NewLessonForm subjectId={subjectId} subjectName={subject.name} />
          </div>
        </div>
      </div>
    </DeskMat>
  );
}
