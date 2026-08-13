import type { Metadata } from 'next';

export const SITE_BASE_URL = 'https://mahjonggame.org';

// Homepage-level hreflang alternates (locale roots). Used only as the fallback
// in the public layout — individual public pages build their own per-path
// alternates via `alternatesFor` so the hreflang tags point at the equivalent
// page in each locale rather than the locale root. Must include x-default
// (falls back to English) so language-agnostic crawlers land on a sensible
// version. Keep in sync with the locales in i18n/routing.ts.
export const LANGUAGE_ALTERNATES = {
  en: `${SITE_BASE_URL}/en`,
  zh: `${SITE_BASE_URL}/zh`,
  'zh-TW': `${SITE_BASE_URL}/zh-TW`,
  ja: `${SITE_BASE_URL}/ja`,
  ko: `${SITE_BASE_URL}/ko`,
  'x-default': `${SITE_BASE_URL}/en`
} as const;

// Self-referencing canonical plus per-locale hreflang alternates for a public
// page. `path` is the route after the locale, e.g. '' (home), '/games',
// '/blog/rainbow-mahjong'. Every public page must build its own alternates:
// Next replaces the parent layout's `alternates` wholesale, so a child that
// sets `canonical` but omits `languages` would silently drop every hreflang.
export function alternatesFor(
  locale: string,
  path = ''
): NonNullable<Metadata['alternates']> {
  return {
    canonical: `${SITE_BASE_URL}/${locale}${path}`,
    languages: {
      en: `${SITE_BASE_URL}/en${path}`,
      zh: `${SITE_BASE_URL}/zh${path}`,
      'zh-TW': `${SITE_BASE_URL}/zh-TW${path}`,
      ja: `${SITE_BASE_URL}/ja${path}`,
      ko: `${SITE_BASE_URL}/ko${path}`,
      'x-default': `${SITE_BASE_URL}/en${path}`
    }
  };
}
