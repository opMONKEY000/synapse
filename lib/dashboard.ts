import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  // 1. Calculate Mastery (Average of recent review items)
  const recentReviews = await prisma.reviewItem.findMany({
    where: { userId, isCorrect: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const mastery = recentReviews.length > 0
    ? Math.round((recentReviews.filter(r => r.isCorrect).length / recentReviews.length) * 100)
    : 0;

  // 2. Calculate Streak (Consecutive days with a RecallSession)
  // Simplified implementation for prototype
  const sessions = await prisma.recallSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  
  // TODO: Implement real streak logic
  const streak = sessions.length > 0 ? 1 : 0; 

  // 3. Reviews Due
  const reviewsDue = await prisma.reviewItem.count({
    where: {
      userId,
      nextReviewAt: { lte: new Date() },
    },
  });

  return { mastery, streak, reviewsDue };
}

export async function getRecentActivity(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      subject: true,
      updatedAt: true,
    },
  });

  return conversations.map(c => ({
    id: c.id,
    title: c.title,
    subject: c.subject || "General",
    date: c.updatedAt.toLocaleDateString(), // Format as needed
    progress: 0, // Placeholder for now
  }));
}

export async function getSubjectCounts(userId: string) {
  const conversations = await prisma.conversation.groupBy({
    by: ['subject'],
    where: { userId },
    _count: {
      id: true,
    },
  });

  // Transform to map for easy lookup
  const counts: Record<string, number> = {};
  conversations.forEach(c => {
    if (c.subject) {
      counts[c.subject] = c._count.id;
    }
  });

  return counts;
}
