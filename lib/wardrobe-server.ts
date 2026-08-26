import 'server-only';
import { prisma } from '@/lib/db';
import {
  APPEARANCES,
  appearanceOf,
  freeAppearanceIds,
  isSeasonalCurrentlyOffered,
  utcWeekKey,
  type AppearanceId
} from '@/lib/appearance';
import { ledgerTotal, syncCachedTotal } from '@/lib/points-ledger';

export async function listOwnedAppearances(userId: string): Promise<AppearanceId[]> {
  const rows = await prisma.appearanceUnlock.findMany({
    where: { userId },
    select: { appearanceId: true }
  });
  const owned = new Set<AppearanceId>(freeAppearanceIds());
  for (const row of rows) {
    if (row.appearanceId in APPEARANCES) owned.add(row.appearanceId as AppearanceId);
  }
  return [...owned];
}

export async function fragmentBalance(userId: string, fragmentId: string): Promise<number> {
  const agg = await prisma.fragmentLedger.aggregate({
    where: { userId, fragmentId },
    _sum: { delta: true }
  });
  return Math.max(0, agg._sum.delta ?? 0);
}

/** After a successful daily check-in: unlock active seasonal skins + drop weekly fragment. */
export async function grantCheckInCosmetics(userId: string): Promise<{
  unlocked: AppearanceId[];
  fragmentGranted: boolean;
  fragmentId: string | null;
  fragmentTotal: number;
}> {
  const unlocked: AppearanceId[] = [];
  for (const id of Object.keys(APPEARANCES) as AppearanceId[]) {
    if (!isSeasonalCurrentlyOffered(id)) continue;
    try {
      await prisma.appearanceUnlock.create({
        data: { userId, appearanceId: id, source: 'seasonal_checkin' }
      });
      unlocked.push(id);
    } catch {
      /* already owned */
    }
  }

  const weekKey = utcWeekKey();
  let fragmentGranted = false;
  const fragmentId = 'ink-wash';
  try {
    await prisma.fragmentLedger.create({
      data: {
        userId,
        fragmentId,
        delta: 1,
        reason: 'checkin_week',
        weekKey
      }
    });
    fragmentGranted = true;
  } catch {
    /* already claimed this ISO week */
  }

  const fragmentTotal = await fragmentBalance(userId, fragmentId);
  return { unlocked, fragmentGranted, fragmentId, fragmentTotal };
}

export async function redeemAppearanceWithPoints(
  userId: string,
  appearanceId: AppearanceId
): Promise<{ ok: boolean; total: number; error?: string }> {
  const def = appearanceOf(appearanceId);
  if (!def || def.unlock !== 'points' || !def.price) {
    return { ok: false, total: await ledgerTotal(prisma, userId), error: 'not_purchasable' };
  }

  const owned = await prisma.appearanceUnlock.findUnique({
    where: { userId_appearanceId: { userId, appearanceId } }
  });
  if (owned) {
    return { ok: false, total: await ledgerTotal(prisma, userId), error: 'already_owned' };
  }

  const price = def.price;
  try {
    const total = await prisma.$transaction(async (tx) => {
      const balance = await ledgerTotal(tx, userId);
      if (balance < price) {
        throw new Error('insufficient');
      }
      await tx.pointTransaction.create({
        data: {
          userId,
          amount: -price,
          reason: `appearance_buy:${appearanceId}`
        }
      });
      await tx.appearanceUnlock.create({
        data: { userId, appearanceId, source: 'points' }
      });
      return syncCachedTotal(tx, userId);
    });
    return { ok: true, total };
  } catch (err) {
    const total = await ledgerTotal(prisma, userId);
    if (err instanceof Error && err.message === 'insufficient') {
      return { ok: false, total, error: 'insufficient' };
    }
    return { ok: false, total, error: 'unavailable' };
  }
}

export async function craftAppearanceWithFragments(
  userId: string,
  appearanceId: AppearanceId
): Promise<{ ok: boolean; fragmentTotal: number; error?: string }> {
  const def = appearanceOf(appearanceId);
  if (!def || def.unlock !== 'fragments' || !def.fragmentId || !def.fragmentsRequired) {
    return { ok: false, fragmentTotal: 0, error: 'not_craftable' };
  }

  const owned = await prisma.appearanceUnlock.findUnique({
    where: { userId_appearanceId: { userId, appearanceId } }
  });
  if (owned) {
    return {
      ok: false,
      fragmentTotal: await fragmentBalance(userId, def.fragmentId),
      error: 'already_owned'
    };
  }

  const need = def.fragmentsRequired;
  const fragmentId = def.fragmentId;
  try {
    const fragmentTotal = await prisma.$transaction(async (tx) => {
      const agg = await tx.fragmentLedger.aggregate({
        where: { userId, fragmentId },
        _sum: { delta: true }
      });
      const bal = Math.max(0, agg._sum.delta ?? 0);
      if (bal < need) throw new Error('insufficient');
      await tx.fragmentLedger.create({
        data: {
          userId,
          fragmentId,
          delta: -need,
          reason: 'craft',
          weekKey: `craft:${appearanceId}`
        }
      });
      await tx.appearanceUnlock.create({
        data: { userId, appearanceId, source: 'fragments' }
      });
      return bal - need;
    });
    return { ok: true, fragmentTotal };
  } catch (err) {
    const fragmentTotal = await fragmentBalance(userId, fragmentId);
    if (err instanceof Error && err.message === 'insufficient') {
      return { ok: false, fragmentTotal, error: 'insufficient' };
    }
    return { ok: false, fragmentTotal, error: 'unavailable' };
  }
}
