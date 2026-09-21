import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'zh-TW'],
  defaultLocale: 'en',
  // HTML hreflang comes from pageMeta()/alternatesFor() in lib/seo.ts.
  // Keep only that set — next-intl middleware Link headers would duplicate it.
  alternateLinks: false
});

export type Locale = (typeof routing.locales)[number];
