import type { Metadata } from 'next';
import { INDEXABLE_LOCALES, ogLocale } from '@/lib/locales';

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
      locale: ogLocale(opts.locale),
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

/** Build hreflang map for all indexable locales (+ x-default → English). */
function indexableLanguageMap(path = ''): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of INDEXABLE_LOCALES) {
    languages[locale] = `${SITE_BASE_URL}/${locale}${path}`;
  }
  languages['x-default'] = `${SITE_BASE_URL}/en${path}`;
  return languages;
}

// Homepage-level hreflang alternates (locale roots) for every indexable locale.
export const LANGUAGE_ALTERNATES = indexableLanguageMap('') as Record<
  string,
  string
> & { 'x-default': string };

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
    languages: indexableLanguageMap(path)
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
