import { DeskMat } from "@/components/dashboard/desk-mat";
import { SubjectFolder } from "@/components/dashboard/subject-folder";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { UsageIndicator } from "@/components/subscription/usage-indicator";
import { auth } from "@/auth";
import { getDashboardStats, getRecentActivity } from "@/lib/dashboard";
import { getSubjects } from "@/app/actions/subject";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [stats, activities, subjects] = await Promise.all([
    getDashboardStats(session.user.id),
    getRecentActivity(session.user.id),
    getSubjects(session.user.id),
  ]);

  return (
    <DeskMat user={session.user}>
      {/* Left Column: Subjects & Activity (8 cols) */}
      <div className="md:col-span-8 space-y-8">
        
        {/* Subject Folders */}
        <section>
          <h2 className="text-xl font-chalk font-bold text-gray-400 mb-4 ml-2">Your Subjects</h2>
          
          {subjects.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-xl text-gray-500 font-sans mb-4">
                No subjects yet. Create your first subject to get started!
              </p>
              <Link href="/dashboard/subjects/new">
                <button className="px-6 py-3 bg-blue-500 text-white font-chalk font-bold rounded-lg hover:bg-blue-600 transition-colors">
                  Create New Subject
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Link key={subject.id} href={`/dashboard/${subject.id}`}>
                  <SubjectFolder 
                    subject={subject.name}
                    icon="bulb" // TODO: Use subject.icon when available
                    color="blue" // TODO: Use subject.color when available
                    count={subject.lessonCount}
                  />
                </Link>
              ))}
              <Link href="/dashboard/subjects/new">
                <SubjectFolder subject="New Subject" icon="bulb" color="yellow" />
              </Link>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <RecentActivity activities={activities} />
        </section>
      </div>

      {/* Right Column: Progress & Stats (4 cols) */}
      <div className="md:col-span-4 space-y-8">
        <UsageIndicator />
        <ProgressCard stats={stats} />
      </div>
    </DeskMat>
  );
}

