import 'server-only';
import { prisma } from '@/lib/db';
import {
  ACHIEVEMENT_IDS,
  ACHIEVEMENT_REWARDS,
  ACHIEVEMENT_TIERS,
  checkInAchievementTargets,
  unlockAchievement,
  type AchievementId,
  type AchievementProgressStub
} from '@/lib/achievements';

/** Check-in streak thresholds → daily-seven / daily-thirty. */
export async function evaluateCheckInAchievements(
  userId: string,
  streak: number
): Promise<string[]> {
  const newly: string[] = [];
  const targets = checkInAchievementTargets(streak);
  if (targets.length === 0) return newly;

  await prisma.$transaction(async (tx) => {
    for (const id of targets) {
      const ok = await unlockAchievement(tx, userId, id);
      if (ok) newly.push(id);
    }
  });
  return newly;
}

export async function listAchievementsForUser(userId: string): Promise<{
  unlocked: AchievementId[];
  items: AchievementProgressStub[];
}> {
  const rows = await prisma.achievementUnlock.findMany({
    where: { userId },
    select: { achievementId: true, unlockedAt: true }
  });
  const unlockedSet = new Set(
    rows
      .map((r) => r.achievementId)
      .filter((id): id is AchievementId =>
        (ACHIEVEMENT_IDS as readonly string[]).includes(id)
      )
  );
  const unlockedAt = new Map(
    rows.map((r) => [r.achievementId, r.unlockedAt.toISOString()] as const)
  );

  const items: AchievementProgressStub[] = ACHIEVEMENT_IDS.map((id) => ({
    id,
    tier: ACHIEVEMENT_TIERS[id],
    unlocked: unlockedSet.has(id),
    unlockedAt: unlockedAt.get(id) ?? null,
    progress: null,
    rewardAppearanceId: ACHIEVEMENT_REWARDS[id] ?? null
  }));

  return { unlocked: [...unlockedSet], items };
}
