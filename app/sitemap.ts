import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { games } from '@/data/games';
import { getBlogPosts } from '@/data/blog';

const BASE = 'https://mahjonggame.org';

/**
 * Built from the static catalogue only — no Prisma.
 * Hitting the DB here previously made /sitemap.xml a serverless function
 * (and 500 when Neon was slow). Admin CMS overlay is not required for
 * crawlers; native slugs live in `data/games.ts`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  // Coming-soon rulesets render an indexable rules guide, so they belong in the
  // sitemap alongside the playable games. Only iframe pages stay out.
  const indexableGames = games.filter(
    (g) => g.gameType === 'native' || g.gameType === 'coming-soon'
  );
  const blogPosts = getBlogPosts();
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

    for (const post of blogPosts) {
      const path = `/blog/${post.slug}`;
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: alternatesFor(path) }
      });
    }

    for (const game of indexableGames) {
      const path = `/games/${game.slug}`;
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: game.gameType === 'native' ? 0.9 : 0.6,
        alternates: { languages: alternatesFor(path) }
      });
    }
  }

  return entries;
}
