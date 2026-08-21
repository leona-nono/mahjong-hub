import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'zh-TW', 'ja', 'ko', 'es', 'pt-BR', 'fr', 'de'],
  defaultLocale: 'en'
});

export type Locale = (typeof routing.locales)[number];
