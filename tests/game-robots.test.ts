import { describe, expect, it } from 'vitest';
import { getGame, getGames, games } from '@/data/games';
import { getBlogPosts } from '@/data/blog';
import { INDEXABLE_LOCALES, isIndexableLocale } from '@/lib/locales';
import { isGamePageIndexable } from '@/lib/game-seo';
import { pageMeta } from '@/lib/seo';

/** Mirrors generateMetadata robots policy on games/[slug]. */
function gameRobots(gameType: 'native' | 'iframe' | 'coming-soon') {
  return isGamePageIndexable({ gameType })
    ? { index: true, follow: true }
    : { index: false, follow: true };
}

describe('game page robots (scheme: iframe stays noindex)', () => {
  it('treats only native and coming-soon as indexable', () => {
    expect(isGamePageIndexable({ gameType: 'native' })).toBe(true);
    expect(isGamePageIndexable({ gameType: 'coming-soon' })).toBe(true);
    expect(isGamePageIndexable({ gameType: 'iframe' })).toBe(false);
  });

  it('keeps every catalogue game aligned with gameType policy', () => {
    for (const game of getGames()) {
      expect(isGamePageIndexable(game)).toBe(
        game.gameType === 'native' || game.gameType === 'coming-soon'
      );
    }
    expect(games.some((g) => g.gameType === 'iframe')).toBe(false);
    expect(games.some((g) => g.gameType === 'native')).toBe(true);
  });

  it('keeps native games indexable on en and zh-TW, and noindexes zh', () => {
    const native = getGame('hong-kong-mahjong');
    expect(native?.gameType).toBe('native');
    const robots = gameRobots('native');

    for (const locale of ['zh-TW', 'en'] as const) {
      expect(isIndexableLocale(locale)).toBe(true);
      const meta = pageMeta({
        locale,
        path: `/games/${native!.slug}`,
        title: native!.title,
        description: native!.description,
        robots
      });
      expect(meta.robots).toEqual({ index: true, follow: true });
    }

    expect(isIndexableLocale('zh')).toBe(false);
    const zh = pageMeta({
      locale: 'zh',
      path: `/games/${native!.slug}`,
      title: native!.title,
      description: native!.description,
      robots
    });
    expect(zh.robots).toEqual({ index: false, follow: true });
    expect(zh.alternates?.canonical).toBe(
      `https://mahjonggame.org/zh/games/${native!.slug}`
    );
    expect(zh.alternates?.languages?.zh).toBeUndefined();
  });

  it('always noindexes iframe games on every locale including en', () => {
    const robots = gameRobots('iframe');

    for (const locale of [...INDEXABLE_LOCALES, 'zh'] as const) {
      const meta = pageMeta({
        locale,
        path: '/games/mahjong-solitaire',
        title: 'Retired iframe',
        description: 'No longer catalogued',
        robots
      });
      expect(meta.robots).toEqual({ index: false, follow: true });
    }
  });

  it('lists blog posts without forced noindex on indexable locales', () => {
    const posts = getBlogPosts();
    expect(posts.length).toBeGreaterThan(0);
    const zhTw = pageMeta({
      locale: 'zh-TW',
      path: `/blog/${posts[0].slug}`,
      title: posts[0].title,
      description: posts[0].description,
      type: 'article'
    });
    expect(zhTw.robots).toBeUndefined();
    const zh = pageMeta({
      locale: 'zh',
      path: `/blog/${posts[0].slug}`,
      title: posts[0].title,
      description: posts[0].description,
      type: 'article'
    });
    expect(zh.robots).toEqual({ index: false, follow: true });
    expect(zh.alternates?.canonical).toBe(
      `https://mahjonggame.org/zh/blog/${posts[0].slug}`
    );
  });
});
