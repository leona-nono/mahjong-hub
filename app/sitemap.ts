import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { games } from '@/data/games';
import { getPublicGuideSlugs } from '@/lib/guides';

const BASE = 'https://mahjonggame.org';

/**
 * Games stay static (`data/games.ts`) so crawlers do not depend on Neon.
 * Beginner guides merge static blog slugs with published CMS rows; the CMS
 * query times out after 1.5s and falls back to static slugs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const nativeGames = games.filter((g) => g.gameType === 'native');
  const blogSlugs = await getPublicGuideSlugs();
  const lastModified = new Date();

  const alternatesFor = (path: string) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${BASE}/${locale}${path}`])
    );
    // x-default points at the default locale so undefined/region-agnostic
    // visitors (and crawlers without a language hint) land on English.
    languages['x-default'] = `${BASE}/${routing.defaultLocale}${path}`;
    return languages;
  };

  for (const locale of routing.locales) {
    entries.push({
      url: `${BASE}/${locale}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: alternatesFor('') }
    });

    entries.push({
      url: `${BASE}/${locale}/games`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: alternatesFor('/games') }
    });

    // Blog hub + every article. These are the core SEO landing pages, so they
    // must be in the sitemap with full hreflang alternates.
    entries.push({
      url: `${BASE}/${locale}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: { languages: alternatesFor('/blog') }
    });

    for (const slug of blogSlugs) {
      const path = `/blog/${slug}`;
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: alternatesFor(path) }
      });
    }

    for (const game of nativeGames) {
      const path = `/games/${game.slug}`;
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: { languages: alternatesFor(path) }
      });
    }
  }

  return entries;
}
