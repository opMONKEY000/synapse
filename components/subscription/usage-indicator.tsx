import { checkSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Zap } from "lucide-react";

const FREE_TIER_DAILY_LIMIT = 1; // 1 lesson per day

export async function UsageIndicator() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const isPro = await checkSubscription();
  
  let usage = 0;
  
  if (!isPro) {
    const userUsage = await prisma.userUsage.findUnique({
      where: { userId: session.user.id },
    });
    usage = userUsage?.dailyLessonCount || 0;
  }

  const percentage = Math.min((usage / FREE_TIER_DAILY_LIMIT) * 100, 100);

  return (
    <div className="px-4 py-3 bg-white/50 rounded-lg border border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isPro ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} />
          <span className="text-sm font-chalk font-bold text-gray-700">
            {isPro ? "Pro Plan" : "Free Plan"}
          </span>
        </div>
        <span className="text-xs font-sans text-gray-500">
          {isPro ? "Unlimited" : `${usage} / ${FREE_TIER_DAILY_LIMIT} lesson${FREE_TIER_DAILY_LIMIT > 1 ? 's' : ''} today`}
        </span>
      </div>
      
      {!isPro && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              percentage >= 100 ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
