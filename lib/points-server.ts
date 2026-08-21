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

export async function grantFirstLoginIfNeeded(userId: string): Promise<boolean> {
  const existing = await prisma.pointTransaction.findFirst({
    where: { userId, reason: 'first_login' },
    select: { id: true }
  });
  if (existing) return false;

  try {
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
    return true;
  } catch (err) {
    const raced = await prisma.pointTransaction.findFirst({
      where: { userId, reason: 'first_login' },
      select: { id: true }
    });
    if (raced) return false;
    throw err;
  }
}

export async function pointsSnapshotForUser(userId: string): Promise<{
  total: number;
  firstLoginGranted: boolean;
  checkIn: CheckInState;
  ledger: Array<{ amount: number; reason: string; createdAt: string }>;
}> {
  let firstLoginGranted = false;
  try {
    firstLoginGranted = await grantFirstLoginIfNeeded(userId);
  } catch (err) {
    console.error('[points] first_login grant failed', err);
  }

  const [sum, checkIn, txs] = await Promise.all([
    prisma.pointTransaction.aggregate({
      where: { userId },
      _sum: { amount: true }
    }),
    checkinStateForUser(userId).catch(() => ({
      claimedToday: false,
      streak: 1,
      todayReward: CHECKIN_REWARDS[0],
      nextReward: CHECKIN_REWARDS[1]
    })),
    prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { amount: true, reason: true, createdAt: true }
    })
  ]);

  const total = sum._sum.amount ?? 0;
  try {
    await prisma.userPoint.upsert({
      where: { userId },
      create: { userId, total },
      update: { total }
    });
  } catch {
    /* cache row is optional */
  }

  return {
    total,
    firstLoginGranted,
    checkIn,
    ledger: txs.map((tx) => ({
      amount: tx.amount,
      reason: tx.reason,
      createdAt: tx.createdAt.toISOString()
    }))
  };
}
