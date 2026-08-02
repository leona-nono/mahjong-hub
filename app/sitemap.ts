import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getGames } from '@/data/games';

const BASE = 'https://mahjonggame.org';

/**
 * Only pages we actually want indexed go in here.
 *
 * Native game pages are our own content (full rules copy + structured data) and
 * get a high priority. Iframe game pages are noindex in their metadata, so
 * listing them would send Search Console a contradictory signal — they are
 * deliberately excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const nativeGames = getGames().filter((g) => g.gameType === 'native');
  const lastModified = new Date();

  const alternatesFor = (path: string) =>
    Object.fromEntries(
      routing.locales.map((locale) => [locale, `${BASE}/${locale}${path}`])
    );

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
