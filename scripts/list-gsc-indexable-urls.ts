/**
 * Print GSC-ready indexable URLs (native/coming-soon games + all blog + hubs).
 * Iframe game detail pages are intentionally omitted (noindex scheme 1).
 *
 * Usage: npx tsx scripts/list-gsc-indexable-urls.ts
 */
import { games } from '../data/games';
import { getBlogPosts } from '../data/blog';
import { INDEXABLE_LOCALES } from '../lib/locales';
import { isGamePageIndexable } from '../lib/game-seo';

const BASE = 'https://mahjonggame.org';

const hubs = ['', '/games', '/games/solitaire', '/games/classic', '/blog', '/about'] as const;
const indexableGames = games.filter(isGamePageIndexable);
const posts = getBlogPosts();
const iframeSlugs = games.filter((g) => g.gameType === 'iframe').map((g) => g.slug);

const urls: string[] = [];
for (const locale of INDEXABLE_LOCALES) {
  for (const hub of hubs) {
    urls.push(`${BASE}/${locale}${hub}`);
  }
  for (const game of indexableGames) {
    urls.push(`${BASE}/${locale}/games/${game.slug}`);
  }
  for (const post of posts) {
    urls.push(`${BASE}/${locale}/blog/${post.slug}`);
  }
}

console.log('# Indexable URLs for GSC (request indexing). Iframe games excluded.');
console.log(`# iframe slugs skipped: ${iframeSlugs.join(', ')}`);
console.log(`# count=${urls.length}`);
for (const u of urls) console.log(u);
