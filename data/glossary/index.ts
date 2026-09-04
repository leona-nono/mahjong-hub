import termsJson from './terms.json';

export type GlossaryLocale =
  | 'zh'
  | 'zh-TW'
  | 'ja'
  | 'ko'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt-BR';

export type GlossaryEntry = {
  source: string;
  type: 'term' | 'text';
  i18n: Partial<Record<GlossaryLocale, string>>;
};

export type GlossaryMap = Record<string, GlossaryEntry>;

export const GLOSSARY: GlossaryMap = termsJson as GlossaryMap;

/** Locales that must have a non-empty glossary value for every entry. */
export const GLOSSARY_REQUIRED_LOCALES: GlossaryLocale[] = [
  'zh',
  'zh-TW',
  'ja',
  'ko',
  'es',
  'fr',
  'de',
  'pt-BR'
];

/**
 * Resolve a locked glossary term for a locale.
 * Throws when the key is missing or the locale has no value — callers must not
 * invent free translations for unknown keys (build/validate fail-fast).
 */
export function term(key: string, locale: GlossaryLocale | 'en'): string {
  const entry = GLOSSARY[key];
  if (!entry) {
    throw new Error(`Glossary key not found: ${key}`);
  }
  if (locale === 'en') return entry.source;
  const value = entry.i18n[locale];
  if (!value) {
    throw new Error(`Glossary missing locale "${locale}" for key: ${key}`);
  }
  return value;
}

export function hasTerm(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(GLOSSARY, key);
}

export function glossaryKeys(): string[] {
  return Object.keys(GLOSSARY);
}
