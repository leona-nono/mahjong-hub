import 'server-only';
import { prisma } from '@/lib/db';
import {
  CHECKIN_REWARDS,
  FIRST_LOGIN_BONUS,
  checkinPlan,
  utcDateString,
  utcNoon
} from '@/lib/points-rules';

export type CheckInState = {
  claimedToday: boolean;
  streak: number;
  todayReward: number;
  nextReward: number;
};

export async function checkinStateForUser(userId: string): Promise<CheckInState> {
  const bonus = await prisma.dailyBonus.findUnique({ where: { userId } });
  return checkinPlan(
    bonus?.lastClaimDate ? utcDateString(bonus.lastClaimDate) : null,
    bonus?.streak ?? 1
  );
}

export async function claimDailyCheckInForUser(userId: string): Promise<{
  granted: boolean;
  alreadyClaimed: boolean;
  amount: number;
  total: number;
  checkIn: CheckInState;
}> {
  await grantFirstLoginIfNeeded(userId);

  const today = utcDateString();
  const bonus = await prisma.dailyBonus.findUnique({ where: { userId } });
  const plan = checkinPlan(
    bonus?.lastClaimDate ? utcDateString(bonus.lastClaimDate) : null,
    bonus?.streak ?? 1,
    today
  );

  if (plan.claimedToday) {
    const row = await prisma.userPoint.findUnique({ where: { userId } });
    return {
      granted: false,
      alreadyClaimed: true,
      amount: 0,
      total: row?.total ?? 0,
      checkIn: plan
    };
  }

  const amount = plan.todayReward;
  const updated = await prisma.$transaction(async (tx) => {
    const again = await tx.dailyBonus.findUnique({ where: { userId } });
    const againPlan = checkinPlan(
      again?.lastClaimDate ? utcDateString(again.lastClaimDate) : null,
      again?.streak ?? 1,
      today
    );
    if (againPlan.claimedToday) {
      const row = await tx.userPoint.findUnique({ where: { userId } });
      return { alreadyClaimed: true as const, total: row?.total ?? 0 };
    }

    await tx.dailyBonus.upsert({
      where: { userId },
      create: {
        userId,
        lastClaimDate: utcNoon(today),
        streak: plan.streak
      },
      update: {
        lastClaimDate: utcNoon(today),
        streak: plan.streak
      }
    });
    const pointRow = await tx.userPoint.upsert({
      where: { userId },
      create: { userId, total: amount },
      update: { total: { increment: amount } }
    });
    await tx.pointTransaction.create({
      data: {
        userId,
        amount,
        reason: 'daily_checkin'
      }
    });
    return { alreadyClaimed: false as const, total: pointRow.total };
  });

  const checkIn = await checkinStateForUser(userId);
  return {
    granted: !updated.alreadyClaimed,
    alreadyClaimed: updated.alreadyClaimed,
    amount: updated.alreadyClaimed ? 0 : amount,
    total: updated.total,
    checkIn
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
