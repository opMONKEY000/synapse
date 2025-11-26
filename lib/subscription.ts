import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const DAY_IN_MS = 86_400_000;
const FREE_TIER_DAILY_LIMIT = 1; // 1 lesson per day for free tier

export const checkSubscription = async () => {
  const session = await auth();
  if (!session?.user?.id) return false;

  const userSubscription = await prisma.userSubscription.findUnique({
    where: { userId: session.user.id },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!userSubscription) return false;

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isValid;
};

export const checkLessonLimit = async () => {
  const session = await auth();
  if (!session?.user?.id) return false;

  const isPro = await checkSubscription();
  if (isPro) return true;

  const userUsage = await prisma.userUsage.findUnique({
    where: { userId: session.user.id },
  });

  if (!userUsage) return true; // First time use

  // Reset if new day
  const today = new Date();
  const lastReset = new Date(userUsage.lastResetDate);
  
  if (
    today.getDate() !== lastReset.getDate() ||
    today.getMonth() !== lastReset.getMonth() ||
    today.getFullYear() !== lastReset.getFullYear()
  ) {
    await prisma.userUsage.update({
      where: { userId: session.user.id },
      data: { dailyLessonCount: 0, lastResetDate: new Date() },
    });
    return true;
  }

  return userUsage.dailyLessonCount < FREE_TIER_DAILY_LIMIT;
};

export const incrementLessonUsage = async () => {
  const session = await auth();
  if (!session?.user?.id) return;

  const isPro = await checkSubscription();
  if (isPro) return;

  const userUsage = await prisma.userUsage.findUnique({
    where: { userId: session.user.id },
  });

  if (!userUsage) {
    await prisma.userUsage.create({
      data: {
        userId: session.user.id,
        dailyLessonCount: 1,
      },
    });
  } else {
    await prisma.userUsage.update({
      where: { userId: session.user.id },
      data: {
        dailyLessonCount: userUsage.dailyLessonCount + 1,
      },
    });
  }
};
