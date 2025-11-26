import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeskMat } from "@/components/dashboard/desk-mat";
import { NewSubjectForm } from "@/components/dashboard/new-subject-form";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StickyNote } from "@/components/whiteboard/sticky-note";

export default async function NewSubjectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <DeskMat user={session.user}>
      <div className="col-span-12 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <MarkerButton variant="secondary" className="!px-4 !py-2">
              <ArrowLeft className="w-6 h-6" />
            </MarkerButton>
          </Link>
          <h1 className="text-4xl font-chalk font-bold text-gray-900">
            Create New Subject
          </h1>
        </div>

        <div className="relative">
          {/* Decorative Sticky Note */}
          <div className="absolute -top-6 -right-20 hidden lg:block transform rotate-6">
            <StickyNote color="blue">
              <span className="text-lg">What do you want to learn?</span>
            </StickyNote>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <NewSubjectForm />
          </div>
        </div>
      </div>
    </DeskMat>
  );
}
