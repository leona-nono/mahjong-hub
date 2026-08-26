-- Wardrobe ownership + limited-edition weekly fragments
CREATE TABLE IF NOT EXISTS "AppearanceUnlock" (
    "userId" TEXT NOT NULL,
    "appearanceId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppearanceUnlock_pkey" PRIMARY KEY ("userId","appearanceId")
);

CREATE INDEX IF NOT EXISTS "AppearanceUnlock_userId_idx" ON "AppearanceUnlock"("userId");

ALTER TABLE "AppearanceUnlock"
  DROP CONSTRAINT IF EXISTS "AppearanceUnlock_userId_fkey";
ALTER TABLE "AppearanceUnlock"
  ADD CONSTRAINT "AppearanceUnlock_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "FragmentLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fragmentId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "weekKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FragmentLedger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FragmentLedger_userId_fragmentId_idx" ON "FragmentLedger"("userId", "fragmentId");

CREATE UNIQUE INDEX IF NOT EXISTS "FragmentLedger_userId_fragmentId_weekKey_reason_key"
  ON "FragmentLedger"("userId", "fragmentId", "weekKey", "reason");

ALTER TABLE "FragmentLedger"
  DROP CONSTRAINT IF EXISTS "FragmentLedger_userId_fkey";
ALTER TABLE "FragmentLedger"
  ADD CONSTRAINT "FragmentLedger_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
