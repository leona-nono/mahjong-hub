'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import TileFace from '@/components/games/TileFace';
import {
  COPIES_PER_TILE,
  TILE_KINDS,
  tileFromIndex,
  tileIndex,
  type Suit,
  type Tile
} from '@/lib/mahjong/tiles';
import { shanten, waitingTiles } from '@/lib/mahjong/shanten';

/**
 * Mahjong Hand Checker.
 *
 * Follows docs/MAHJONG_TOOLS_SPEC.md §4.1. Three rules shape the code:
 *
 * 1. Every number comes from `lib/mahjong/shanten.ts`. This tool must never
 *    disagree with the game engine — a checker that says 3 while the table
 *    says 4 destroys the only reason the page exists.
 * 2. Only 3n+1 tile counts can be read. Anything else gets an invitation to
 *    add more tiles, never an error.
 * 3. `force-static` on the page means `searchParams` is unavailable, so a
 *    shared link is parsed from `window.location.search` on mount.
 *
 * Meld input is deliberately absent: exposed hands need UI and correctness work
 * that belongs in phase 2. Concealed hands only.
 */

const RULESET = 'hongkong' as const;
const MAX_TILES = 14;

/** Tiles are laid out in four rows: characters, dots, bamboo, honours. */
const ROWS: { suit: Suit; ranks: number[] }[] = [
  { suit: 'm', ranks: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { suit: 'p', ranks: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { suit: 's', ranks: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { suit: 'z', ranks: [1, 2, 3, 4, 5, 6, 7] }
];

function tileAt(suit: Suit, rank: number): Tile {
  return `${suit}${rank}` as Tile;
}

/**
 * A hand is readable at 13 tiles, or 10 / 7 / 4 with exposed sets.
 *
 * 14 is deliberately *not* readable. That count means "just drew, still holding
 * the discard", and `waitingTiles` is only defined for 3n+1 shapes — running it
 * on 14 tiles would answer a question nobody asked. The UI asks the player to
 * take one tile back out instead.
 *
 * The lower bound matters too: a lone tile is technically 3n+1, but a one-tile
 * "hand" has no meaningful shanten, so the check starts at four.
 */
const MIN_TILES = 4;

function isReadableCount(count: number): boolean {
  return count >= MIN_TILES && count % 3 === 1 && count <= MAX_TILES;
}

const OVERFULL = MAX_TILES; // 14 — one too many, see above

/** How many taps are still needed to reach a readable count. */
function nextReadableCount(count: number): number {
  const remainder = count % 3;
  if (remainder === 1) return 0;
  const floor = count - remainder; // nearest 3n below
  const target = floor + 1;
  return target > count ? target : target + 3;
}

/** Parse `?hand=m1m2m3...`; ignore anything malformed rather than throwing. */
function parseSharedHand(search: string): Tile[] {
  const raw = new URLSearchParams(search).get('hand');
  if (!raw) return [];
  const ids = raw.match(/[mpsz][1-9]/g);
  if (!ids) return [];
  const valid = ids.filter((id) => {
    const index = tileIndex(id);
    return index >= 0 && index < TILE_KINDS;
  });
  if (valid.length === 0 || valid.length > MAX_TILES) return [];
  // Cap each kind at four copies — silently trim the surplus.
  const tally = new Map<string, number>();
  const kept: Tile[] = [];
  for (const id of valid) {
    const seen = tally.get(id) ?? 0;
    if (seen >= COPIES_PER_TILE) continue;
    tally.set(id, seen + 1);
    kept.push(id);
  }
  return kept;
}

export default function WaitsTool() {
  const t = useTranslations('tools');
  const [hand, setHand] = useState<Tile[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // `force-static` strips searchParams from the props, so read the URL here.
  useEffect(() => {
    setHand(parseSharedHand(window.location.search));
    setHydrated(true);
  }, []);

  const addTile = useCallback((tile: Tile) => {
    setHand((current) => {
      if (current.length >= MAX_TILES) return current;
      const used = current.filter((item) => item === tile).length;
      if (used >= COPIES_PER_TILE) return current;
      return [...current, tile];
    });
  }, []);

  const removeTile = useCallback((tile: Tile) => {
    setHand((current) => {
      const index = current.lastIndexOf(tile);
      if (index < 0) return current;
      return [...current.slice(0, index), ...current.slice(index + 1)];
    });
  }, []);

  const undo = useCallback(() => setHand((current) => current.slice(0, -1)), []);
  const clear = useCallback(() => setHand([]), []);

  const result = useMemo(() => {
    if (!isReadableCount(hand.length)) return null;

    const counts = new Array<number>(TILE_KINDS).fill(0);
    for (const tile of hand) counts[tileIndex(tile)] += 1;

    const distance = shanten(counts, 0, RULESET);

    // Improvements mirror `acceptance()` in lib/mahjong/coach.ts, which needs a
    // GameState we do not have here — so walk the 34 kinds ourselves.
    const improvements: { tile: Tile; next: number }[] = [];
    if (distance > 0) {
      const work = [...counts];
      for (let i = 0; i < TILE_KINDS; i += 1) {
        if (work[i] >= COPIES_PER_TILE) continue;
        work[i] += 1;
        const next = shanten(work, 0, RULESET);
        work[i] -= 1;
        if (next < distance) improvements.push({ tile: tileFromIndex(i), next });
      }
    }

    const waits = distance === 0 ? waitingTiles(counts, 0, RULESET) : [];

    return { distance, waits, improvements, counts };
  }, [hand]);

  const selected = useMemo(() => {
    const tally = new Map<Tile, number>();
    for (const tile of hand) tally.set(tile, (tally.get(tile) ?? 0) + 1);
    return tally;
  }, [hand]);

  const remainingFor = (tile: Tile) => {
    if (!result) return 0;
    return COPIES_PER_TILE - result.counts[tileIndex(tile)];
  };

  const readable = isReadableCount(hand.length);
  const overfull = !readable && hand.length === OVERFULL;
  const needMore = readable || overfull ? 0 : nextReadableCount(hand.length) - hand.length;

  return (
    <div className="space-y-6">
      {/* ── Picker ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-portal-border bg-portal-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold text-portal-text">{t('waitsPick')}</h2>
        <p className="mt-1 text-xs text-portal-muted">{t('waitsPickHint')}</p>

        <div className="mt-4 space-y-3">
          {ROWS.map((row) => (
            <div key={row.suit} className="flex flex-wrap gap-1.5">
              {row.ranks.map((rank) => {
                const tile = tileAt(row.suit, rank);
                const used = selected.get(tile) ?? 0;
                return (
                  <TileFace
                    key={tile}
                    tile={tile}
                    size="md"
                    onClick={addTile}
                    disabled={used >= COPIES_PER_TILE || hand.length >= MAX_TILES}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ── Hand ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-portal-border bg-portal-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-portal-text">{t('waitsHand')}</h2>
          <p className="text-xs text-portal-muted">{t('waitsCount', { n: hand.length })}</p>
        </div>

        {hand.length === 0 ? (
          <p className="mt-3 text-sm text-portal-muted">—</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hand.map((tile, index) => (
              <TileFace
                key={`${tile}-${index}`}
                tile={tile}
                size="md"
                onClick={removeTile}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={hand.length === 0}
            className="rounded-lg border border-portal-border px-3 py-2 text-sm text-portal-text transition hover:border-portal-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('waitsUndo')}
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={hand.length === 0}
            className="rounded-lg border border-portal-border px-3 py-2 text-sm text-portal-text transition hover:border-portal-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('waitsClear')}
          </button>
        </div>
      </section>

      {/* ── Result ─────────────────────────────────────────────── */}
      {hydrated && !readable ? (
        <section className="rounded-2xl border border-portal-border bg-portal-panel p-5">
          <p className="text-base font-semibold text-portal-text">
            {overfull ? t('waitsOverfull') : t('waitsIncomplete', { n: Math.max(needMore, 0) })}
          </p>
          <p className="mt-2 text-sm text-portal-muted">{t('waitsIncompleteHint')}</p>
        </section>
      ) : null}

      {result && result.distance === -1 ? (
        <section className="rounded-2xl border border-portal-accent bg-portal-panel p-5">
          <h2 className="text-lg font-semibold text-portal-accent">{t('waitsWinning')}</h2>
          <p className="mt-2 text-sm text-portal-muted">{t('waitsWinningHint')}</p>
        </section>
      ) : null}

      {result && result.distance === 0 ? (
        <section className="rounded-2xl border border-portal-accent bg-portal-panel p-5">
          <h2 className="text-lg font-semibold text-portal-accent">{t('waitsTenpai')}</h2>
          <ul className="mt-3 flex flex-wrap gap-4">
            {result.waits.map((tile) => (
              <li key={tile} className="flex flex-col items-center gap-1.5">
                <TileFace tile={tile} size="lg" />
                <span className="text-xs text-portal-muted">
                  {t('waitsRemaining', { n: remainingFor(tile) })}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-portal-muted">{t('waitsRemainingNote')}</p>
        </section>
      ) : null}

      {result && result.distance > 0 ? (
        <section className="rounded-2xl border border-portal-border bg-portal-panel p-5">
          <h2 className="text-lg font-semibold text-portal-text">
            {t('waitsAway', { n: result.distance })}
          </h2>
          <p className="mt-2 text-sm text-portal-muted">{t('waitsAwayHint', { n: result.distance })}</p>

          <p className="mt-3 text-sm font-semibold text-portal-text">
            <span className="text-portal-muted">{t('waitsShantenLabel')}：</span>
            {result.distance}
          </p>
          <p className="mt-1 text-xs text-portal-muted">{t('waitsShantenWhat')}</p>

          {result.improvements.length > 0 ? (
            <>
              <h3 className="mt-5 text-sm font-semibold text-portal-text">{t('waitsImprove')}</h3>
              <p className="mt-1 text-xs text-portal-muted">{t('waitsImproveNote')}</p>
              <ul className="mt-3 flex flex-wrap gap-3">
                {result.improvements.map((entry) => (
                  <li key={entry.tile} className="flex flex-col items-center gap-1">
                    <TileFace tile={entry.tile} size="table" />
                    <span className="text-xs text-portal-muted">
                      {t('waitsRemaining', { n: remainingFor(entry.tile) })}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
