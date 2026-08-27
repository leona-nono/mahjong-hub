-- Native game page SEO / structured content CMS overlay
CREATE TABLE IF NOT EXISTS "NativeGameSeo" (
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "intro" TEXT,
    "howToPlay" JSONB,
    "tips" JSONB,
    "faq" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NativeGameSeo_pkey" PRIMARY KEY ("slug","locale")
);

CREATE INDEX IF NOT EXISTS "NativeGameSeo_locale_idx" ON "NativeGameSeo"("locale");
