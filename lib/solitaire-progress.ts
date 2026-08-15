import 'server-only';

import { prisma } from '@/lib/db';
import { utcDateString } from '@/lib/points-rules';
import { parseCampaignLevel } from '@/lib/mahjong-solitaire/levels';
import {
  DAILY_CLEAR_POINTS,
  levelKind,
  parseDailyLevelId,
  planDailyStreak,
  streakCycleBonus,
  validateSolitaireComplete,
  type CompleteInput,
  type SolitaireDeal
} from '@/lib/mahjong-solitaire/progress-rules';
import { resolveDailyDeal, resolveDeal } from '@/lib/solitaire-catalog';

export type DailyPublicState = {
  utcDay: string;
  deal: SolitaireDeal;
  cleared: boolean;
  streak: number;
  freezeAvailable: boolean;
  reward: number;
  streakBonus: number;
};

export async function dailyStateForUser(
  userId: string | null,
  today = utcDateString()
): Promise<DailyPublicState | null> {
  const deal = resolveDailyDeal(today);
  if (!deal) return null;

  if (!userId) {
    const plan = planDailyStreak({
      lastClearDate: null,
      streak: 0,
      freezeWeekKey: null,
      today
    });
    return {
      utcDay: today,
      deal,
      cleared: false,
      streak: 0,
      freezeAvailable: plan.freezeAvailable,
      reward: DAILY_CLEAR_POINTS,
      streakBonus: 0
    };
  }

  const [row, meta] = await Promise.all([
    prisma.solitaireDaily.findUnique({
      where: { userId_utcDate: { userId, utcDate: today } }
    }),
    prisma.solitaireStreak.findUnique({ where: { userId } })
  ]);
  const plan = planDailyStreak({
    lastClearDate: meta?.lastDailyDate ?? null,
    streak: meta?.dailyStreak ?? 0,
    freezeWeekKey: meta?.freezeWeekKey ?? null,
    today
  });
  return {
    utcDay: today,
    deal,
    cleared: !!row?.cleared,
    streak: plan.alreadyClearedToday ? plan.streak : Math.max(0, meta?.dailyStreak ?? 0),
    freezeAvailable: plan.freezeAvailable && !plan.alreadyClearedToday,
    reward: DAILY_CLEAR_POINTS,
    streakBonus: plan.alreadyClearedToday ? 0 : streakCycleBonus(plan.streak)
  };
}

export async function progressForUser(userId: string) {
  const meta = await prisma.solitaireStreak.findUnique({ where: { userId } });
  return {
    highestLevel: meta?.highestLevel ?? 0,
    lessonsCleared: meta?.lessonsCleared ?? 0,
    dailyStreak: meta?.dailyStreak ?? 0,
    lastDailyDate: meta?.lastDailyDate ?? null,
    freezeWeekKey: meta?.freezeWeekKey ?? null
  };
}

export type CompleteResult = {
  ok: boolean;
  error?: string;
  awarded: boolean;
  alreadyCleared: boolean;
  amount: number;
  total: number;
  stars: number;
  streak?: number;
  usedFreeze?: boolean;
};

export async function completeSolitaireForUser(
  userId: string,
  input: CompleteInput,
  today = utcDateString()
): Promise<CompleteResult> {
  const expected = resolveDeal(input.levelId, today);
  if (!expected) {
    return {
      ok: false,
      error: 'unknown_level',
      awarded: false,
      alreadyCleared: false,
      amount: 0,
      total: 0,
      stars: 0
    };
  }

  const check = validateSolitaireComplete(input, expected, today);
  if (!check.ok) {
    const row = await prisma.userPoint.findUnique({ where: { userId } });
    return {
      ok: false,
      error: check.error,
      awarded: false,
      alreadyCleared: false,
      amount: 0,
      total: row?.total ?? 0,
      stars: 0
    };
  }

  const kind = check.kind;
  const dailyDay = parseDailyLevelId(input.levelId);

  return prisma.$transaction(async (tx) => {
    const pointRow = async (extra: number) => {
      if (extra <= 0) {
        const row = await tx.userPoint.findUnique({ where: { userId } });
        return row?.total ?? 0;
      }
      const updated = await tx.userPoint.upsert({
        where: { userId },
        create: { userId, total: extra },
        update: { total: { increment: extra } }
      });
      return updated.total;
    };

    if (kind === 'daily' && dailyDay) {
      const existing = await tx.solitaireDaily.findUnique({
        where: { userId_utcDate: { userId, utcDate: dailyDay } }
      });
      if (existing?.awarded) {
        const total = await pointRow(0);
        const meta = await tx.solitaireStreak.findUnique({ where: { userId } });
        return {
          ok: true,
          awarded: false,
          alreadyCleared: true,
          amount: 0,
          total,
          stars: Math.max(existing.stars, check.stars),
          streak: meta?.dailyStreak ?? 0
        };
      }

      const meta = await tx.solitaireStreak.findUnique({ where: { userId } });
      const plan = planDailyStreak({
        lastClearDate: meta?.lastDailyDate ?? null,
        streak: meta?.dailyStreak ?? 0,
        freezeWeekKey: meta?.freezeWeekKey ?? null,
        today
      });
      const bonus = streakCycleBonus(plan.streak);
      const amount = check.points + bonus;

      await tx.solitaireDaily.upsert({
        where: { userId_utcDate: { userId, utcDate: dailyDay } },
        create: {
          userId,
          utcDate: dailyDay,
          cleared: true,
          score: input.score,
          stars: check.stars,
          awarded: true
        },
        update: {
          cleared: true,
          score: Math.max(existing?.score ?? 0, input.score),
          stars: Math.max(existing?.stars ?? 0, check.stars),
          awarded: true
        }
      });

      await tx.solitaireStreak.upsert({
        where: { userId },
        create: {
          userId,
          dailyStreak: plan.streak,
          lastDailyDate: today,
          freezeWeekKey: plan.freezeWeekKey,
          highestLevel: 0,
          lessonsCleared: 0
        },
        update: {
          dailyStreak: plan.streak,
          lastDailyDate: today,
          freezeWeekKey: plan.freezeWeekKey
        }
      });

      await tx.pointTransaction.create({
        data: {
          userId,
          amount,
          reason: bonus ? 'solitaire_daily_streak' : 'solitaire_daily',
          gameSlug: 'mahjong-solitaire'
        }
      });
      const total = await pointRow(amount);
      return {
        ok: true,
        awarded: true,
        alreadyCleared: false,
        amount,
        total,
        stars: check.stars,
        streak: plan.streak,
        usedFreeze: plan.consumeFreeze
      };
    }

    const prev = await tx.solitaireProgress.findUnique({
      where: { userId_levelId: { userId, levelId: input.levelId } }
    });
    const firstClear = !prev?.clearedAt;
    const amount = firstClear ? check.points : 0;

    await tx.solitaireProgress.upsert({
      where: { userId_levelId: { userId, levelId: input.levelId } },
      create: {
        userId,
        levelId: input.levelId,
        stars: check.stars,
        bestScore: input.score,
        clearedAt: new Date()
      },
      update: {
        stars: Math.max(prev?.stars ?? 0, check.stars),
        bestScore: Math.max(prev?.bestScore ?? 0, input.score),
        clearedAt: prev?.clearedAt ?? new Date()
      }
    });

    const campaignN = parseCampaignLevel(input.levelId);
    const lessonN = kind === 'teach' ? Number(input.levelId.replace('teach-', '')) || 0 : 0;

    const meta = await tx.solitaireStreak.findUnique({ where: { userId } });
    await tx.solitaireStreak.upsert({
      where: { userId },
      create: {
        userId,
        dailyStreak: 0,
        highestLevel: campaignN ?? 0,
        lessonsCleared: lessonN
      },
      update: {
        ...(campaignN != null
          ? { highestLevel: Math.max(meta?.highestLevel ?? 0, campaignN) }
          : {}),
        ...(lessonN > 0
          ? { lessonsCleared: Math.max(meta?.lessonsCleared ?? 0, lessonN) }
          : {})
      }
    });

    if (amount > 0) {
      await tx.pointTransaction.create({
        data: {
          userId,
          amount,
          reason: kind === 'teach' ? 'solitaire_teach' : 'solitaire_clear',
          gameSlug: 'mahjong-solitaire'
        }
      });
    }

    const total = await pointRow(amount);
    return {
      ok: true,
      awarded: amount > 0,
      alreadyCleared: !firstClear,
      amount,
      total,
      stars: Math.max(prev?.stars ?? 0, check.stars)
    };
  });
}
