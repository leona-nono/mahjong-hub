import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  addUtcDays,
  checkinRewardForStreak,
  utcDateString
} from '@/lib/points-rules';
import { checkinStateForUser } from '@/lib/points-server';

export async function POST() {
  const session = await auth();
  const userId = session?.user && (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const today = utcDateString();
  const yesterday = addUtcDays(today, -1);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const bonus = await tx.dailyBonus.findUnique({ where: { userId } });
      const last = bonus?.lastClaimDate ? utcDateString(bonus.lastClaimDate) : null;
      if (last === today) {
        return { already: true as const };
      }

      const newStreak = last === yesterday ? Math.max(1, bonus?.streak ?? 1) + 1 : 1;
      const amount = checkinRewardForStreak(newStreak);
      const claimAt = new Date(`${today}T00:00:00.000Z`);

      await tx.dailyBonus.upsert({
        where: { userId },
        create: { userId, lastClaimDate: claimAt, streak: newStreak },
        update: { lastClaimDate: claimAt, streak: newStreak }
      });

      const row = await tx.userPoint.upsert({
        where: { userId },
        create: { userId, total: amount },
        update: { total: { increment: amount } }
      });
      await tx.pointTransaction.create({
        data: { userId, amount, reason: 'daily_checkin' }
      });

      return { already: false as const, total: row.total, amount, streak: newStreak };
    });

    if (result.already) {
      const checkIn = await checkinStateForUser(userId);
      const row = await prisma.userPoint.findUnique({ where: { userId } });
      return NextResponse.json({
        granted: false,
        alreadyClaimed: true,
        total: row?.total ?? 0,
        checkIn
      });
    }

    return NextResponse.json({
      granted: true,
      alreadyClaimed: false,
      total: result.total,
      amount: result.amount,
      checkIn: {
        claimedToday: true,
        streak: result.streak,
        todayReward: result.amount,
        nextReward: checkinRewardForStreak(result.streak + 1)
      }
    });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
