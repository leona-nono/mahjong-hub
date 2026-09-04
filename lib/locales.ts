import { routing, type Locale } from '@/i18n/routing';

/** All UI / path-prefix locales (language switcher). */
export const UI_LOCALES = routing.locales;

/**
 * Locales open to search indexing (hreflang + sitemap).
 * Matches UI_LOCALES — every routed language has dedicated long-form copy.
 */
export const INDEXABLE_LOCALES = [
  'en',
  'zh',
  'zh-TW',
  'ja',
  'ko',
  'es',
  'pt-BR',
  'fr',
  'de'
] as const satisfies readonly Locale[];

export type IndexableLocale = (typeof INDEXABLE_LOCALES)[number];

/** Non-English locales that ship long-form JSON (about / home-guide / games). */
export const CONTENT_LOCALES = [
  'zh',
  'zh-TW',
  'ja',
  'ko',
  'es',
  'fr',
  'de',
  'pt-BR'
] as const satisfies readonly Exclude<IndexableLocale, 'en'>[];

export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export function isIndexableLocale(locale: string): locale is IndexableLocale {
  return (INDEXABLE_LOCALES as readonly string[]).includes(locale);
}

export function isContentLocale(locale: string): locale is ContentLocale {
  return (CONTENT_LOCALES as readonly string[]).includes(locale);
}

/** Open Graph `locale` codes (underscore form). */
export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  'zh-TW': 'zh_TW',
  ja: 'ja_JP',
  ko: 'ko_KR',
  es: 'es_ES',
  'pt-BR': 'pt_BR',
  fr: 'fr_FR',
  de: 'de_DE'
};

export function ogLocale(locale: string): string {
  return OG_LOCALE[locale as Locale] ?? locale;
}
