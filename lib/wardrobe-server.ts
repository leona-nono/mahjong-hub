import 'server-only';
import { prisma } from '@/lib/db';
import {
  APPEARANCES,
  freeAppearanceIds,
  isSeasonalCurrentlyOffered,
  type AppearanceId
} from '@/lib/appearance';

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

/** After a successful daily check-in: unlock active seasonal skins only. */
export async function grantCheckInCosmetics(userId: string): Promise<{
  unlocked: AppearanceId[];
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
  return { unlocked };
}

/** Points purchase path removed — Premium skins unlock via achievements. */
export async function redeemAppearanceWithPoints(
  _userId: string,
  _appearanceId: AppearanceId
): Promise<{ ok: boolean; total: number; error?: string }> {
  return { ok: false, total: 0, error: 'not_purchasable' };
}
