import 'server-only';
import { prisma } from '@/lib/db';
import { evaluateCheckInAchievements } from '@/lib/achievements-server';
import { checkinPlan, utcDateString, utcNoon } from '@/lib/points-rules';

export type CheckInState = {
  claimedToday: boolean;
  streak: number;
  cycleDay: number;
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
  checkIn: CheckInState;
  newAchievements?: string[];
}> {
  const today = utcDateString();
  const bonus = await prisma.dailyBonus.findUnique({ where: { userId } });
  const plan = checkinPlan(
    bonus?.lastClaimDate ? utcDateString(bonus.lastClaimDate) : null,
    bonus?.streak ?? 1,
    today
  );

  if (plan.claimedToday) {
    return {
      granted: false,
      alreadyClaimed: true,
      checkIn: plan
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const again = await tx.dailyBonus.findUnique({ where: { userId } });
    const againPlan = checkinPlan(
      again?.lastClaimDate ? utcDateString(again.lastClaimDate) : null,
      again?.streak ?? 1,
      today
    );
    if (againPlan.claimedToday) {
      return { alreadyClaimed: true as const };
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

    await tx.actionLog.create({
      data: {
        userId,
        value: 0,
        action: 'daily_checkin'
      }
    });

    return { alreadyClaimed: false as const };
  });

  const checkIn = await checkinStateForUser(userId);
  let newAchievements: string[] | undefined;
  if (!updated.alreadyClaimed) {
    try {
      newAchievements = await evaluateCheckInAchievements(userId, checkIn.streak);
    } catch (err) {
      console.error('[points] check-in achievements failed', err);
    }
  }

  return {
    granted: !updated.alreadyClaimed,
    alreadyClaimed: updated.alreadyClaimed,
    checkIn,
    ...(newAchievements?.length ? { newAchievements } : {})
  };
}

/** Snapshot for GET /api/points — streak + check-in only (no balance). */
export async function pointsSnapshotForUser(userId: string): Promise<{
  checkIn: CheckInState;
  streak: number;
}> {
  const checkIn = await checkinStateForUser(userId).catch(() => ({
    claimedToday: false,
    streak: 1,
    cycleDay: 1
  }));
  return { checkIn, streak: checkIn.streak };
}
