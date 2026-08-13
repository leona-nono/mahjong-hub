import 'server-only';
import { cache } from 'react';
import type { Game, GameFaq } from '@prisma/client';

import { prisma } from '@/lib/db';
import {
  games as staticGames,
  getLocalizedGame,
  type GameCategory,
  type GameConfig
} from '@/data/games';

/**
 * DB overlay on top of the static game catalogue.
 *
 * The static `data/games.ts` stays the structural source of truth (native
 * component, ruleset, navGroup, region, players, long-form content). The CMS
 * database is the operational override layer: anything an admin edits in the
 * back office — title, description, iframe URL, featured flag, active flag,
 * sort order and FAQs — wins over the static base. Games created in the CMS
 * with no static counterpart render as plain iframe games.
 *
 * If the database is unreachable (build without DATABASE_URL, Neon hiccup),
 * every accessor silently falls back to the static catalogue so the site
 * always builds and renders.
 */

type DbGameWithFaqs = Game & { faqs: GameFaq[] };

const VALID_CATEGORIES: readonly GameCategory[] = [
  'mahjong',
  'connect',
  'solitaire',
  'tile-match',
  'four-player'
];

function toFaqContent(faqs: GameFaq[], locale: string) {
  return faqs
    .filter((f) => f.locale === locale)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((f) => ({ question: f.question, answer: f.answer }));
}

/** Apply the DB row's operational fields onto a static config. */
function applyOverlay(base: GameConfig, row: DbGameWithFaqs): GameConfig {
  const merged: GameConfig = { ...base };

  if (row.title) merged.title = row.title;
  if (row.description) merged.description = row.description;
  if (row.iframeUrl) merged.gameIframeUrl = row.iframeUrl;
  if (
    row.category &&
    (VALID_CATEGORIES as readonly string[]).includes(row.category)
  ) {
    merged.category = row.category as GameCategory;
  }
  merged.featured = row.isFeatured;

  // English FAQs edited in the CMS replace the static ones.
  const dbFaqs = toFaqContent(row.faqs, 'en');
  if (dbFaqs.length && merged.content) {
    merged.content = { ...merged.content, faq: dbFaqs };
  }

  return merged;
}

/** Map a CMS-only game (no static counterpart) to a renderable iframe game. */
function fromDbOnly(row: DbGameWithFaqs): GameConfig | null {
  if (!row.iframeUrl) return null; // nothing playable to render
  return {
    slug: row.slug,
    pageName: row.slug,
    title: row.title,
    description: row.description ?? '',
    category:
      row.category &&
      (VALID_CATEGORIES as readonly string[]).includes(row.category)
        ? (row.category as GameCategory)
        : 'mahjong',
    gameType: 'iframe',
    gameIframeUrl: row.iframeUrl,
    featured: row.isFeatured
  };
}

/**
 * Fetch all games and merge the DB overlay. Cached per request / per build
 * via React `cache`, so a page tree triggers at most one database round trip.
 */
const loadMergedGames = cache(async (): Promise<GameConfig[]> => {
  let rows: DbGameWithFaqs[];
  try {
    rows = await prisma.game.findMany({ include: { faqs: true } });
  } catch (err) {
    console.warn('[games-db] database unreachable, using static catalogue:', err);
    return staticGames;
  }

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const merged: Array<{ game: GameConfig; sortKey: number; index: number }> = [];

  staticGames.forEach((base, index) => {
    const row = bySlug.get(base.slug);
    if (row) {
      bySlug.delete(base.slug);
      if (!row.isActive) return; // hidden from the frontend
      merged.push({
        game: applyOverlay(base, row),
        sortKey: row.sortOrder,
        index
      });
    } else {
      merged.push({ game: base, sortKey: index, index });
    }
  });

  // CMS-only games: appended in (sortOrder, creation) order.
  const extras = [...bySlug.values()]
    .filter((r) => r.isActive)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.createdAt.getTime() - b.createdAt.getTime()
    );
  for (const row of extras) {
    const game = fromDbOnly(row);
    if (game) {
      merged.push({
        game,
        sortKey: row.sortOrder,
        index: staticGames.length + merged.length
      });
    }
  }

  merged.sort((a, b) => a.sortKey - b.sortKey || a.index - b.index);
  return merged.map((m) => m.game);
});

/** All active games, static base + DB overlay, ordered for display. */
export async function getMergedGames(): Promise<GameConfig[]> {
  return loadMergedGames();
}

export async function getMergedGame(
  slug: string
): Promise<GameConfig | undefined> {
  const list = await loadMergedGames();
  return list.find((g) => g.slug === slug);
}

/**
 * Merged game with locale-aware copy. Static i18n (`games.i18n.ts`) provides
 * translated title/description/content; CMS FAQs for the requested locale
 * (when present) override the FAQ section.
 */
export async function getMergedLocalizedGame(
  slug: string,
  locale: string
): Promise<GameConfig | undefined> {
  const game = await getMergedGame(slug);
  if (!game || locale === 'en') return game;

  // Reuse the static localization machinery on the merged base.
  const localized = getLocalizedGame(slug, locale);
  if (!localized) return game;

  const result: GameConfig = {
    ...game,
    title: localized.title,
    description: localized.description,
    content: localized.content
  };

  try {
    const dbFaqs = await prisma.gameFaq.findMany({
      where: { game: { slug }, locale },
      orderBy: { sortOrder: 'asc' }
    });
    if (dbFaqs.length && result.content) {
      result.content = {
        ...result.content,
        faq: dbFaqs.map((f) => ({ question: f.question, answer: f.answer }))
      };
    }
  } catch {
    // Static localization already applied — FAQ overlay is best-effort.
  }

  return result;
}

/**
 * Localize a merged list (for grids / listings). Pure static i18n lookup —
 * listing cards only need title/description, so no per-game DB round trip.
 */
export function getMergedLocalizedGames(
  list: GameConfig[],
  locale: string
): GameConfig[] {
  if (locale === 'en') return list;
  return list.map((g) => {
    const localized = getLocalizedGame(g.slug, locale);
    if (!localized) return g;
    return {
      ...g,
      title: localized.title,
      description: localized.description,
      content: localized.content
    };
  });
}

export async function getMergedFeaturedGames(): Promise<GameConfig[]> {
  return (await loadMergedGames()).filter((g) => g.featured);
}

export async function getMergedNativeGames(): Promise<GameConfig[]> {
  return (await loadMergedGames()).filter((g) => g.gameType === 'native');
}

export async function getMergedGamesByNavGroup(
  navGroup: NonNullable<GameConfig['navGroup']>
): Promise<GameConfig[]> {
  return (await loadMergedGames()).filter(
    (g) => g.navGroup === navGroup && g.gameType !== 'coming-soon'
  );
}

export async function getMergedClassicByRegion(
  region: NonNullable<GameConfig['region']>
): Promise<GameConfig[]> {
  return (await loadMergedGames()).filter(
    (g) => g.navGroup === 'classic' && g.region === region
  );
}

/** Related games, preferring the same category before falling back. */
export async function getMergedRelatedGames(
  slug: string,
  limit = 4
): Promise<GameConfig[]> {
  const list = await loadMergedGames();
  const current = list.find((g) => g.slug === slug);
  const others = list.filter((g) => g.slug !== slug);
  if (!current) return others.slice(0, limit);

  const sameCategory = others.filter((g) => g.category === current.category);
  const rest = others.filter((g) => g.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}
