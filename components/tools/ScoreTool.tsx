'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import TileFace from '@/components/games/TileFace';
import {
  COPIES_PER_TILE,
  WINDS,
  type Suit,
  type Tile
} from '@/lib/mahjong/tiles';
import { scoreHongKongToolsHand } from '@/lib/tools/score-path';

const MAX_TILES = 14;

const ROWS: { suit: Suit; ranks: number[] }[] = [
  { suit: 'm', ranks: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { suit: 'p', ranks: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { suit: 's', ranks: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { suit: 'z', ranks: [1, 2, 3, 4, 5, 6, 7] }
];

function tileAt(suit: Suit, rank: number): Tile {
  return `${suit}${rank}` as Tile;
}

const WIND_LABEL_KEYS = ['scoreWindEast', 'scoreWindSouth', 'scoreWindWest', 'scoreWindNorth'] as const;

/**
 * Hong Kong score calculator UI.
 * Numbers always come from scoreHand via createGame rebuild — never a parallel table.
 */
export default function ScoreTool() {
  const t = useTranslations('tools');
  const [hand, setHand] = useState<Tile[]>([]);
  const [winningTile, setWinningTile] = useState<Tile | null>(null);
  const [selfDrawn, setSelfDrawn] = useState(true);
  const [seatWind, setSeatWind] = useState<Tile>(WINDS[0]);
  const [roundWind, setRoundWind] = useState<Tile>(WINDS[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  // Drop the winning-tile mark if that kind left the hand.
  useEffect(() => {
    if (winningTile && hand.filter((tile) => tile === winningTile).length === 0) {
      setWinningTile(null);
    }
  }, [hand, winningTile]);

  const markWinning = useCallback((tile: Tile) => {
    setWinningTile(tile);
  }, []);

  const clear = useCallback(() => {
    setHand([]);
    setWinningTile(null);
  }, []);

  const selected = useMemo(() => {
    const tally = new Map<Tile, number>();
    for (const tile of hand) tally.set(tile, (tally.get(tile) ?? 0) + 1);
    return tally;
  }, [hand]);

  const ready = hand.length === MAX_TILES && winningTile !== null && hand.includes(winningTile);

  const outcome = useMemo(() => {
    if (!ready || !winningTile) return null;
    return scoreHongKongToolsHand({
      hand14: hand,
      winningTile,
      selfDrawn,
      seatWind,
      roundWind,
      hongKongMode: 'standard'
    });
  }, [hand, winningTile, selfDrawn, seatWind, roundWind, ready]);

  const patternLabel = (id: string, fallback: string) => {
    const key = `pattern.${id}`;
    return t.has(key) ? t(key) : fallback;
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-portal-border bg-portal-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold text-portal-text">{t('scorePick')}</h2>
        <p className="mt-1 text-xs text-portal-muted">{t('scorePickHint')}</p>
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

      <section className="rounded-2xl border border-portal-border bg-portal-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-portal-text">{t('scoreHand')}</h2>
          <p className="text-xs text-portal-muted">{t('scoreCount', { n: hand.length })}</p>
        </div>
        <p className="mt-1 text-xs text-portal-muted">{t('scoreMarkWinHint')}</p>
        {hand.length === 0 ? (
          <p className="mt-3 text-sm text-portal-muted">—</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hand.map((tile, index) => (
              <TileFace
                key={`${tile}-${index}`}
                tile={tile}
                size="md"
                highlight={tile === winningTile}
                onClick={markWinning}
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHand((current) => current.slice(0, -1))}
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

      <section className="rounded-2xl border border-portal-border bg-portal-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold text-portal-text">{t('scoreWinMethod')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelfDrawn(true)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              selfDrawn
                ? 'border-portal-accent bg-portal-accent/10 text-portal-text'
                : 'border-portal-border text-portal-muted'
            }`}
          >
            {t('scoreSelfDraw')}
          </button>
          <button
            type="button"
            onClick={() => setSelfDrawn(false)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              !selfDrawn
                ? 'border-portal-accent bg-portal-accent/10 text-portal-text'
                : 'border-portal-border text-portal-muted'
            }`}
          >
            {t('scoreRon')}
          </button>
        </div>
        <p className="mt-3 text-xs text-portal-muted">{t('scoreDefaultsNote')}</p>

        <button
          type="button"
          className="mt-4 text-sm font-semibold text-portal-accent underline"
          onClick={() => setShowAdvanced((value) => !value)}
        >
          {showAdvanced ? t('scoreHideAdvanced') : t('scoreShowAdvanced')}
        </button>

        {showAdvanced ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-portal-text">
              <span className="font-semibold">{t('scoreSeatWind')}</span>
              <select
                className="mt-1 w-full rounded-lg border border-portal-border bg-portal-panel px-3 py-2"
                value={seatWind}
                onChange={(event) => setSeatWind(event.target.value)}
              >
                {WINDS.map((wind, index) => (
                  <option key={wind} value={wind}>
                    {t(WIND_LABEL_KEYS[index])}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-portal-text">
              <span className="font-semibold">{t('scoreRoundWind')}</span>
              <select
                className="mt-1 w-full rounded-lg border border-portal-border bg-portal-panel px-3 py-2"
                value={roundWind}
                onChange={(event) => setRoundWind(event.target.value)}
              >
                {WINDS.map((wind, index) => (
                  <option key={wind} value={wind}>
                    {t(WIND_LABEL_KEYS[index])}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </section>

      {!ready ? (
        <section className="rounded-2xl border border-portal-border bg-portal-panel p-5">
          <p className="text-base font-semibold text-portal-text">{t('scoreIncomplete')}</p>
          <p className="mt-2 text-sm text-portal-muted">{t('scoreIncompleteHint')}</p>
        </section>
      ) : null}

      {outcome && !outcome.ok && outcome.reason === 'notWinning' ? (
        <section className="rounded-2xl border border-portal-border bg-portal-panel p-5">
          <p className="text-base font-semibold text-portal-text">{t('scoreNotWinning')}</p>
          <p className="mt-2 text-sm text-portal-muted">{t('scoreNotWinningHint')}</p>
          <p className="mt-3 text-sm">
            <Link href="/tools/waits" className="text-portal-accent underline">
              {t('scoreGoWaits')}
            </Link>
          </p>
        </section>
      ) : null}

      {outcome && !outcome.ok && outcome.reason === 'belowMinimum' && outcome.score ? (
        <section className="rounded-2xl border border-portal-border bg-portal-panel p-5">
          <p className="text-base font-semibold text-portal-text">
            {t('scoreBelowMin', { n: outcome.score.total, min: outcome.minimum ?? 3 })}
          </p>
          <p className="mt-2 text-sm text-portal-muted">{t('scoreBelowMinHint')}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {outcome.score.patterns.map((pattern) => (
              <li key={pattern.id} className="flex justify-between gap-4 text-portal-text">
                <span>{patternLabel(pattern.id, pattern.label)}</span>
                <span className="font-semibold">{t('scoreFan', { n: pattern.value })}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {outcome && !outcome.ok && outcome.reason === 'error' ? (
        <section className="rounded-2xl border border-portal-border bg-portal-panel p-5">
          <p className="text-base font-semibold text-portal-text">{t('scoreError')}</p>
          <p className="mt-2 text-sm text-portal-muted">{t('scoreErrorHint')}</p>
        </section>
      ) : null}

      {outcome?.ok ? (
        <section className="rounded-2xl border border-portal-accent bg-portal-panel p-5">
          <h2 className="text-lg font-semibold text-portal-accent">
            {t('scoreTotal', { n: outcome.score.total })}
          </h2>
          <p className="mt-1 text-xs text-portal-muted">{t('scoreDefaultsNote')}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {outcome.score.patterns.map((pattern) => (
              <li key={pattern.id} className="flex justify-between gap-4 text-portal-text">
                <span>{patternLabel(pattern.id, pattern.label)}</span>
                <span className="font-semibold">{t('scoreFan', { n: pattern.value })}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
