import type { Prisma } from '@prisma/client';
import type { AppearanceId } from '@/lib/appearance';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

/** Stable ids — do not rename after launch. */
export const ACHIEVEMENT_IDS = [
  // A milestones (5)
  'first-hand',
  'first-win',
  'ten-hands',
  'fifty-hands',
  'fifty-discards',
  // B decision quality (8)
  'sharp-eye',
  'clean-hand',
  'no-regrets',
  'streak-ten',
  'streak-thirty',
  'efficient',
  'comeback',
  'coach-graduate',
  // C pattern exploration (12)
  'chicken',
  'all-sequences',
  'all-triplets',
  'seven-pairs',
  'pure-straight',
  'mixed-triple',
  'half-flush',
  'full-flush',
  'little-dragons',
  'big-dragons',
  'thirteen-orphans',
  'nine-gates',
  // D playstyle & persistence (7)
  'hk-casual',
  'hk-standard',
  'riichi-declare',
  'riichi-win',
  'mcr-qualified',
  'daily-seven',
  'daily-thirty'
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export const ACHIEVEMENT_TIERS: Record<AchievementId, AchievementTier> = {
  'first-hand': 'bronze',
  'first-win': 'bronze',
  'ten-hands': 'bronze',
  'fifty-hands': 'bronze',
  'fifty-discards': 'bronze',
  chicken: 'bronze',
  'hk-casual': 'bronze',
  'hk-standard': 'bronze',
  'sharp-eye': 'bronze',
  'coach-graduate': 'bronze',

  'no-regrets': 'silver',
  'streak-ten': 'silver',
  'streak-thirty': 'silver',
  efficient: 'silver',
  comeback: 'silver',
  'all-triplets': 'silver',
  'seven-pairs': 'silver',
  'pure-straight': 'silver',
  'mixed-triple': 'silver',
  'little-dragons': 'silver',
  'riichi-declare': 'silver',
  'mcr-qualified': 'silver',

  'clean-hand': 'gold',
  'all-sequences': 'gold',
  'half-flush': 'gold',
  'full-flush': 'gold',
  'riichi-win': 'gold',
  'daily-seven': 'gold',
  'nine-gates': 'gold',

  'big-dragons': 'platinum',
  'thirteen-orphans': 'platinum',
  'daily-thirty': 'platinum'
};

/** Spec B3 — achievement → wardrobe skin. */
export const ACHIEVEMENT_REWARDS: Partial<Record<AchievementId, AppearanceId>> = {
  'clean-hand': 'deep-sea-blue',
  'all-sequences': 'sakura-pink',
  'half-flush': 'bamboo-green',
  'big-dragons': 'gold-dynasty',
  'daily-thirty': 'ink-wash'
};

export type Tx = Prisma.TransactionClient;

/** Grants the linked appearance inside an open transaction (idempotent). */
export async function grantAchievementReward(
  tx: Tx,
  userId: string,
  achievementId: string
): Promise<void> {
  const appearanceId = ACHIEVEMENT_REWARDS[achievementId as AchievementId];
  if (!appearanceId) return;
  try {
    await tx.appearanceUnlock.create({
      data: { userId, appearanceId, source: 'achievement' }
    });
  } catch {
    /* already owned */
  }
}

/** Creates AchievementUnlock + grants reward. Idempotent on composite PK. */
export async function unlockAchievement(
  tx: Tx,
  userId: string,
  achievementId: string
): Promise<boolean> {
  if (!(ACHIEVEMENT_IDS as readonly string[]).includes(achievementId)) {
    return false;
  }
  try {
    await tx.achievementUnlock.create({
      data: { userId, achievementId }
    });
  } catch {
    return false;
  }
  await grantAchievementReward(tx, userId, achievementId);
  return true;
}

export function rewardsMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, appearanceId] of Object.entries(ACHIEVEMENT_REWARDS)) {
    if (appearanceId) out[id] = appearanceId;
  }
  return out;
}

/** Check-in streak → achievement ids that should unlock (thresholds only). */
export function checkInAchievementTargets(streak: number): AchievementId[] {
  const targets: AchievementId[] = [];
  if (streak >= 7) targets.push('daily-seven');
  if (streak >= 30) targets.push('daily-thirty');
  return targets;
}

export type AchievementProgressStub = {
  id: AchievementId;
  tier: AchievementTier;
  unlocked: boolean;
  unlockedAt: string | null;
  /** Placeholder until LearningStat-backed progress lands. */
  progress: { current: number; target: number } | null;
  rewardAppearanceId: AppearanceId | null;
};
