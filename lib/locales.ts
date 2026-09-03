import { routing, type Locale } from '@/i18n/routing';

/** All UI / path-prefix locales (language switcher). */
export const UI_LOCALES = routing.locales;

/**
 * Locales with dedicated long-form content (games, blog, about, home-guide).
 * European UI locales stay switchable but are not indexable until translated.
 */
export const INDEXABLE_LOCALES = [
  'en',
  'zh',
  'zh-TW',
  'ja',
  'ko'
] as const satisfies readonly Locale[];

export type IndexableLocale = (typeof INDEXABLE_LOCALES)[number];

export function isIndexableLocale(locale: string): locale is IndexableLocale {
  return (INDEXABLE_LOCALES as readonly string[]).includes(locale);
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
