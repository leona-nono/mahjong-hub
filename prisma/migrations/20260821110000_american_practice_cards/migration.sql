CREATE TABLE "AmericanPracticeCard" (
  "id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "groups" JSONB NOT NULL,
  "concealed" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "seasonIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AmericanPracticeCard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AmericanPracticeCard_status_updatedAt_idx"
  ON "AmericanPracticeCard"("status", "updatedAt");
