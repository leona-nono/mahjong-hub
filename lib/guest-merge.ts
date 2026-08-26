import 'server-only';
import { prisma } from '@/lib/db';
import {
  ITEM_TYPES,
  emptyInventory,
  type ItemInventory,
  type ItemType
} from '@/lib/mahjong-solitaire/items';
import { planDailyStreak } from '@/lib/mahjong-solitaire/progress-rules';
import { utcDateString } from '@/lib/points-rules';

export type GuestMergePayload = {
  inventory?: Partial<Record<ItemType, number>>;
  daily?: {
    lastClearDate?: string | null;
    streak?: number;
    freezeWeekKey?: string | null;
  };
  progress?: {
    lessonsCleared?: number;
    seenDeadEnd?: boolean;
  };
  /** Guest hub points earned on-device before login. */
  points?: number;
};

function clampItem(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(99, Math.floor(v)));
}

export async function mergeGuestIntoUser(
  userId: string,
  payload: GuestMergePayload
): Promise<{ merged: boolean; already: boolean }> {
  const already = await prisma.itemLedger.findFirst({
    where: { userId, reason: 'guest_merge' },
    select: { id: true }
  });

  const guestPoints = Math.max(
    0,
    Math.min(50_000, Math.floor(Number(payload.points) || 0))
  );

  if (already) {
    if (guestPoints > 0) {
      await prisma.$transaction(async (tx) => {
        const alreadyPoints = await tx.pointTransaction.findFirst({
          where: { userId, reason: 'guest_points_merge' },
          select: { id: true }
        });
        if (!alreadyPoints) {
          await tx.pointTransaction.create({
            data: { userId, amount: guestPoints, reason: 'guest_points_merge' }
          });
          await tx.userPoint.upsert({
            where: { userId },
            create: { userId, total: guestPoints },
            update: { total: { increment: guestPoints } }
          });
        }
      });
    }
    return { merged: false, already: true };
  }

  const rows = await prisma.itemLedger.groupBy({
    by: ['itemType'],
    where: { userId },
    _sum: { delta: true }
  });
  const serverInv = emptyInventory();
  for (const row of rows) {
    if ((ITEM_TYPES as string[]).includes(row.itemType)) {
      serverInv[row.itemType as ItemType] = Math.max(0, row._sum.delta ?? 0);
    }
  }

  const grants: Array<{ itemType: ItemType; delta: number }> = [];
  for (const type of ITEM_TYPES) {
    const guest = clampItem(payload.inventory?.[type]);
    const delta = guest - (serverInv[type] ?? 0);
    if (delta > 0) grants.push({ itemType: type, delta });
  }

  const guestStreak = Math.max(0, Math.min(3650, Math.floor(Number(payload.daily?.streak) || 0)));
  const guestLast =
    typeof payload.daily?.lastClearDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(payload.daily.lastClearDate)
      ? payload.daily.lastClearDate
      : null;
  const guestFreeze =
    typeof payload.daily?.freezeWeekKey === 'string' ? payload.daily.freezeWeekKey : null;
  const guestLessons = Math.max(
    0,
    Math.min(99, Math.floor(Number(payload.progress?.lessonsCleared) || 0))
  );

  await prisma.$transaction(async (tx) => {
    await tx.itemLedger.create({
      data: { userId, itemType: 'hint', delta: 0, reason: 'guest_merge' }
    });
    if (grants.length) {
      await tx.itemLedger.createMany({
        data: grants.map((g) => ({
          userId,
          itemType: g.itemType,
          delta: g.delta,
          reason: 'guest_merge_item'
        }))
      });
    }

    if (guestPoints > 0) {
      const alreadyPoints = await tx.pointTransaction.findFirst({
        where: { userId, reason: 'guest_points_merge' },
        select: { id: true }
      });
      if (!alreadyPoints) {
        await tx.pointTransaction.create({
          data: { userId, amount: guestPoints, reason: 'guest_points_merge' }
        });
        await tx.userPoint.upsert({
          where: { userId },
          create: { userId, total: guestPoints },
          update: { total: { increment: guestPoints } }
        });
      }
    }

    const meta = await tx.solitaireStreak.findUnique({ where: { userId } });
    const today = utcDateString();
    if (guestStreak > 0 && !(meta?.dailyStreak ?? 0)) {
      const plan = planDailyStreak({
        lastClearDate: guestLast,
        streak: guestStreak,
        freezeWeekKey: guestFreeze,
        today
      });
      await tx.solitaireStreak.upsert({
        where: { userId },
        create: {
          userId,
          dailyStreak: plan.alreadyClearedToday ? plan.streak : guestStreak,
          lastDailyDate: guestLast,
          freezeWeekKey: guestFreeze,
          highestLevel: 0,
          lessonsCleared: guestLessons
        },
        update: {
          dailyStreak: Math.max(meta?.dailyStreak ?? 0, guestStreak),
          lastDailyDate: meta?.lastDailyDate ?? guestLast,
          freezeWeekKey: meta?.freezeWeekKey ?? guestFreeze,
          lessonsCleared: Math.max(meta?.lessonsCleared ?? 0, guestLessons)
        }
      });
    } else if (guestLessons > 0) {
      await tx.solitaireStreak.upsert({
        where: { userId },
        create: {
          userId,
          dailyStreak: 0,
          lessonsCleared: guestLessons
        },
        update: {
          lessonsCleared: Math.max(meta?.lessonsCleared ?? 0, guestLessons)
        }
      });
    }
  });

  return { merged: true, already: false };
}
