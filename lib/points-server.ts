import 'server-only';
import { prisma } from '@/lib/db';
import {
  CHECKIN_REWARDS,
  FIRST_LOGIN_BONUS,
  addUtcDays,
  checkinRewardForStreak,
  nextCheckinReward,
  utcDateString
} from '@/lib/points-rules';

export type CheckInState = {
  claimedToday: boolean;
  streak: number;
  todayReward: number;
  nextReward: number;
};

export async function checkinStateForUser(userId: string): Promise<CheckInState> {
  const bonus = await prisma.dailyBonus.findUnique({ where: { userId } });
  const today = utcDateString();
  const streak = Math.max(1, bonus?.streak ?? 1);
  const last = bonus?.lastClaimDate ? utcDateString(bonus.lastClaimDate) : null;
  const claimedToday = last === today;
  const displayStreak = claimedToday
    ? streak
    : last === addUtcDays(today, -1)
      ? streak
      : 1;
  return {
    claimedToday,
    streak: displayStreak,
    todayReward: checkinRewardForStreak(displayStreak),
    nextReward: nextCheckinReward(displayStreak)
  };
}

export async function grantFirstLoginIfNeeded(userId: string) {
  const existing = await prisma.pointTransaction.findFirst({
    where: { userId, reason: 'first_login' },
    select: { id: true }
  });
  if (existing) return;

  await prisma.$transaction(async (tx) => {
    const again = await tx.pointTransaction.findFirst({
      where: { userId, reason: 'first_login' },
      select: { id: true }
    });
    if (again) return;
    await tx.userPoint.upsert({
      where: { userId },
      create: { userId, total: FIRST_LOGIN_BONUS },
      update: { total: { increment: FIRST_LOGIN_BONUS } }
    });
    await tx.pointTransaction.create({
      data: { userId, amount: FIRST_LOGIN_BONUS, reason: 'first_login' }
    });
  });
}

export { CHECKIN_REWARDS };
