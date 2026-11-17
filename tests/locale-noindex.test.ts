import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { getBlogPosts } from '@/data/blog';
import { getGame } from '@/data/games';
import { homeJsonLd } from '@/lib/home-jsonld';
import { SITE_BASE_URL, pageMeta } from '@/lib/seo';
import { DEFAULT_PUBLIC_SITE_SETTINGS } from '@/lib/site-settings';

const BASE = SITE_BASE_URL;

/** Paths the ticket requires to follow locale noindex. */
const COVERED_PATHS = [
  '',
  '/learn',
  '/learn/start',
  '/learn/variants',
  '/learn/advanced',
  '/blog',
  '/games',
  '/games/classic',
  '/games/solitaire',
  '/tools',
  '/tools/waits',
  '/tools/tile-identifier',
  '/tools/score',
  '/learn/glossary',
  '/challenge',
  '/about',
  '/terms',
  '/refunds'
] as const;

function localeOf(url: string): string {
  const match = url.match(/^https:\/\/mahjonggame\.org\/([^/?#]+)/);
  if (!match) throw new Error(`unexpected sitemap url ${url}`);
  return match[1];
}

describe('zh locale noindex', () => {
  it('noindexes covered zh pages with follow, self canonical, and no zh hreflang', () => {
    const post = getBlogPosts()[0];
    const game = getGame('hong-kong-mahjong');
    expect(post).toBeTruthy();
    expect(game).toBeTruthy();
    const paths = [
      ...COVERED_PATHS,
      `/blog/${post!.slug}`,
      `/games/${game!.slug}`
    ];

    for (const path of paths) {
      const meta = pageMeta({
        locale: 'zh',
        path,
        title: '标题',
        description: '描述'
      });
      expect(meta.robots, path).toEqual({ index: false, follow: true });
      expect(meta.alternates?.canonical, path).toBe(`${BASE}/zh${path}`);
      const languages = meta.alternates?.languages ?? {};
      expect(Object.keys(languages).sort(), path).toEqual(['en', 'x-default', 'zh-TW']);
      expect(languages.zh, path).toBeUndefined();
      expect(languages['x-default'], path).toBe(`${BASE}/en${path}`);
      expect(languages.en, path).toBe(`${BASE}/en${path}`);
      expect(languages['zh-TW'], path).toBe(`${BASE}/zh-TW${path}`);
    }
  });

  it('keeps en and zh-TW covered pages indexable', () => {
    for (const locale of ['en', 'zh-TW'] as const) {
      for (const path of ['', '/learn', '/blog', '/games', '/about', '/challenge'] as const) {
        const meta = pageMeta({
          locale,
          path,
          title: 'Title',
          description: 'Description'
        });
        expect(meta.robots, `${locale}${path}`).toBeUndefined();
        expect(meta.alternates?.canonical).toBe(`${BASE}/${locale}${path}`);
      }
    }
  });

  it('preserves challenge ?c= noindex and the set-page nofollow', () => {
    for (const locale of ['en', 'zh', 'zh-TW'] as const) {
      const shared = pageMeta({
        locale,
        path: '/challenge',
        title: 'Daily',
        description: 'Shared hand',
        robots: { index: false, follow: true }
      });
      expect(shared.robots).toEqual({ index: false, follow: true });

      const set = pageMeta({
        locale,
        path: '/games/set',
        title: 'Sets',
        description: 'Affiliate',
        robots: { index: false, follow: false }
      });
      expect(set.robots).toEqual({ index: false, follow: false });
    }
  });

  it('omits every /zh URL from the sitemap and from sitemap hreflang', () => {
    const entries = sitemap();
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      const locale = localeOf(entry.url);
      counts[locale] = (counts[locale] ?? 0) + 1;
      expect(locale, entry.url).not.toBe('zh');
      const languages = entry.alternates?.languages ?? {};
      expect(Object.keys(languages).sort(), entry.url).toEqual(['en', 'x-default', 'zh-TW']);
      for (const href of Object.values(languages)) {
        expect(localeOf(href), entry.url).not.toBe('zh');
      }
    }
    expect(counts.zh ?? 0).toBe(0);
    expect(counts.en).toBeGreaterThan(0);
    expect(counts.en).toBe(counts['zh-TW']);
    expect(entries.length).toBe(counts.en + counts['zh-TW']);
    expect(Object.keys(counts).sort()).toEqual(['en', 'zh-TW']);
    // Locked after the zh drop: 48 URLs per indexable locale.
    expect(counts).toEqual({ en: 48, 'zh-TW': 48 });
    expect(entries.length).toBe(96);
  });

  it('advertises only indexable languages on the WebSite node', () => {
    const nodes = homeJsonLd({
      site: DEFAULT_PUBLIC_SITE_SETTINGS,
      locale: 'zh',
      description: '描述'
    });
    const website = nodes.find((node) => node['@type'] === 'WebSite');
    expect(website?.inLanguage).toEqual(['en', 'zh-TW']);
  });
});
