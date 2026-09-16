-- Phase A2/B/C: ActionLog + LearningStat + AchievementUnlock; drop points/fragments

-- 1. Drop currency balance table
DROP TABLE IF EXISTS "UserPoint";

-- 2. ActionLog maps onto PointTransaction (reason/amount columns kept via @map)
ALTER TABLE "PointTransaction" ADD COLUMN IF NOT EXISTS "meta" JSONB;

DROP INDEX IF EXISTS "PointTransaction_userId_createdAt_idx";
DROP INDEX IF EXISTS "PointTransaction_reason_createdAt_idx";

CREATE INDEX IF NOT EXISTS "PointTransaction_userId_reason_createdAt_idx"
  ON "PointTransaction"("userId", "reason", "createdAt");
CREATE INDEX IF NOT EXISTS "PointTransaction_reason_createdAt_idx"
  ON "PointTransaction"("reason", "createdAt");

-- 3. Drop fragment ledger
DROP TABLE IF EXISTS "FragmentLedger";

-- 4. SolitaireDaily item-usage counters (daily free quotas)
ALTER TABLE "SolitaireDaily" ADD COLUMN IF NOT EXISTS "hintUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SolitaireDaily" ADD COLUMN IF NOT EXISTS "undoUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SolitaireDaily" ADD COLUMN IF NOT EXISTS "shuffleUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SolitaireDaily" ADD COLUMN IF NOT EXISTS "rescueUsed" INTEGER NOT NULL DEFAULT 0;

-- 5. Learning career counters
CREATE TABLE IF NOT EXISTS "LearningStat" (
    "userId" TEXT NOT NULL,
    "handsPlayed" INTEGER NOT NULL DEFAULT 0,
    "discardsPlayed" INTEGER NOT NULL DEFAULT 0,
    "coachFeedbacks" INTEGER NOT NULL DEFAULT 0,
    "bestGrades" INTEGER NOT NULL DEFAULT 0,
    "patternsSeen" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningStat_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "LearningStat"
  DROP CONSTRAINT IF EXISTS "LearningStat_userId_fkey";
ALTER TABLE "LearningStat"
  ADD CONSTRAINT "LearningStat_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Achievement badges
CREATE TABLE IF NOT EXISTS "AchievementUnlock" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AchievementUnlock_pkey" PRIMARY KEY ("userId","achievementId")
);

CREATE INDEX IF NOT EXISTS "AchievementUnlock_userId_idx" ON "AchievementUnlock"("userId");

ALTER TABLE "AchievementUnlock"
  DROP CONSTRAINT IF EXISTS "AchievementUnlock_userId_fkey";
ALTER TABLE "AchievementUnlock"
  ADD CONSTRAINT "AchievementUnlock_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Relabel legacy points-purchased skins
UPDATE "AppearanceUnlock" SET "source" = 'legacy' WHERE "source" = 'points';
