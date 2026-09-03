import type { Metadata } from 'next';

export const SITE_BASE_URL = 'https://mahjonggame.org';

/** Resolve a site-relative path (or absolute URL) to an absolute https URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_BASE_URL}${path}`;
}

/** Homepage / brand Open Graph + Twitter card fields. */
export function socialShareMeta(opts: {
  title: string;
  description: string;
  locale: string;
  path?: string;
  ogImage?: string;
  siteName?: string;
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  const url = absoluteUrl(`/${opts.locale}${opts.path ?? ''}`);
  const image = absoluteUrl(opts.ogImage || '/og-default.png');
  return {
    openGraph: {
      type: 'website',
      url,
      title: opts.title,
      description: opts.description,
      siteName: opts.siteName,
      locale: opts.locale,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: opts.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [image]
    }
  };
}

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
  es: `${SITE_BASE_URL}/es`,
  'pt-BR': `${SITE_BASE_URL}/pt-BR`,
  fr: `${SITE_BASE_URL}/fr`,
  de: `${SITE_BASE_URL}/de`,
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
      es: `${SITE_BASE_URL}/es${path}`,
      'pt-BR': `${SITE_BASE_URL}/pt-BR${path}`,
      fr: `${SITE_BASE_URL}/fr${path}`,
      de: `${SITE_BASE_URL}/de${path}`,
      'x-default': `${SITE_BASE_URL}/en${path}`
    }
  };
}

/**
 * Full public-page metadata: self-canonical, full hreflang (+ x-default),
 * and complete Open Graph / Twitter cards (title, description, image, url).
 */
export function pageMeta(opts: {
  locale: string;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  siteName?: string;
  type?: 'website' | 'article';
  robots?: Metadata['robots'];
  keywords?: Metadata['keywords'];
}): Metadata {
  const share = socialShareMeta({
    title: opts.title,
    description: opts.description,
    locale: opts.locale,
    path: opts.path,
    ogImage: opts.ogImage,
    siteName: opts.siteName
  });
  if (opts.type && share.openGraph) {
    share.openGraph = { ...share.openGraph, type: opts.type };
  }
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: alternatesFor(opts.locale, opts.path),
    ...share,
    ...(opts.robots ? { robots: opts.robots } : {}),
    ...(opts.keywords ? { keywords: opts.keywords } : {})
  };
}
