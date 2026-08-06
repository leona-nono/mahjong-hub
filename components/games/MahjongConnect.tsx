'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import TileFace from './TileFace';
import {
  createBoard,
  findAllPairs,
  findPath,
  isCleared,
  removePair,
  reshuffle,
  type Board,
  type Cell
} from '@/lib/connect/board';

export type ConnectDifficulty = 'relaxed' | 'classic' | 'expert';

const PRESETS: Record<
  ConnectDifficulty,
  { rows: number; cols: number; kinds: number; seconds: number }
> = {
  relaxed: { rows: 6, cols: 8, kinds: 12, seconds: 0 },
  classic: { rows: 8, cols: 10, kinds: 18, seconds: 300 },
  expert: { rows: 10, cols: 12, kinds: 26, seconds: 240 }
};

const sameCell = (a: Cell | null, b: Cell) =>
  a !== null && a.row === b.row && a.col === b.col;

export interface MahjongConnectProps {
  defaultDifficulty?: ConnectDifficulty;
  onWin?: (points: number) => void;
}

export default function MahjongConnect({
  defaultDifficulty = 'classic',
  onWin
}: MahjongConnectProps) {
  const t = useTranslations('connect');
  const [difficulty, setDifficulty] = useState<ConnectDifficulty>(defaultDifficulty);
  const [board, setBoard] = useState<Board>(() => createBoard(PRESETS[defaultDifficulty]));
  const [selected, setSelected] = useState<Cell | null>(null);
  const [hint, setHint] = useState<[Cell, Cell] | null>(null);
  const [flash, setFlash] = useState<Cell[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[defaultDifficulty].seconds);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const preset = PRESETS[difficulty];

  const restart = useCallback(
    (next: ConnectDifficulty = difficulty) => {
      setBoard(createBoard(PRESETS[next]));
      setSelected(null);
      setHint(null);
      setFlash([]);
      setScore(0);
      setStreak(0);
      setSecondsLeft(PRESETS[next].seconds);
      setStatus('playing');
    },
    [difficulty]
  );

  // Countdown for the timed presets.
  useEffect(() => {
    if (status !== 'playing' || preset.seconds === 0) return undefined;
    if (secondsLeft <= 0) {
      setStatus('lost');
      return undefined;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, status, preset.seconds]);

  // Clear the "matched" flash a beat after it fires.
  useEffect(() => {
    if (flash.length === 0) return undefined;
    const timer = setTimeout(() => setFlash([]), 220);
    return () => clearTimeout(timer);
  }, [flash]);

  const handleTile = (row: number, col: number) => {
    if (status !== 'playing') return;
    const cell = { row, col };
    if (!board.grid[row][col]) return;

    if (selected === null) {
      setSelected(cell);
      return;
    }
    if (sameCell(selected, cell)) {
      setSelected(null);
      return;
    }

    const path = findPath(board, selected, cell);
    if (!path) {
      setSelected(cell);
      setStreak(0);
      return;
    }

    const next = removePair(board, selected, cell);
    setFlash(path);
    setSelected(null);
    setHint(null);
    setStreak((s) => s + 1);
    setScore((s) => s + 10 + Math.min(streak, 5) * 2);

    if (isCleared(next)) {
      setStatus('won');
      onWin?.(score + 10);
      setBoard(next);
      return;
    }

    // A board with no legal pair left is a dead end — reshuffle rather than
    // making the player restart, which is the convention in this genre.
    if (findAllPairs(next, 1).length === 0) {
      setBoard(reshuffle(next));
    } else {
      setBoard(next);
    }
  };

  const showHint = () => {
    const pairs = findAllPairs(board, 1);
    if (pairs.length > 0) {
      setHint(pairs[0]);
      setScore((s) => Math.max(0, s - 5));
    }
  };

  const flashKeys = useMemo(
    () => new Set(flash.map((c) => `${c.row}:${c.col}`)),
    [flash]
  );

  const timeLabel =
    preset.seconds === 0
      ? '∞'
      : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <div className="rounded-3xl rainbow-card p-3 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <select
          value={difficulty}
          onChange={(e) => {
            const next = e.target.value as ConnectDifficulty;
            setDifficulty(next);
            restart(next);
          }}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium"
          aria-label={t('difficultyLabel')}
        >
          <option value="relaxed">{t('relaxed')}</option>
          <option value="classic">{t('classic')}</option>
          <option value="expert">{t('expert')}</option>
        </select>

        <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-gray-700">
          {t('score', { n: score })}
        </span>
        <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-gray-700">
          ⏱ {timeLabel}
        </span>
        <span className="rounded-full bg-white px-3 py-1.5 text-gray-500">
          {t('left', { n: board.remaining })}
        </span>

        <button
          type="button"
          onClick={showHint}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('hint')}
        </button>
        <button
          type="button"
          onClick={() => setBoard((b) => reshuffle(b))}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('shuffle')}
        </button>
        <button
          type="button"
          onClick={() => restart()}
          className="ml-auto rounded-full rainbow-bar px-4 py-1.5 font-bold text-white"
        >
          {t('restart')}
        </button>
      </div>

      {status !== 'playing' && (
        <div
          className={`mb-3 rounded-2xl p-3 text-sm font-bold ${
            status === 'won'
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {status === 'won' ? t('cleared', { n: score }) : t('timeUp')}
        </div>
      )}

      <div className="overflow-x-auto">
        <div
          className="mx-auto grid w-max gap-0.5"
          style={{ gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: board.rows }).map((_, r) =>
            Array.from({ length: board.cols }).map((__, c) => {
              const row = r + 1;
              const col = c + 1;
              const tile = board.grid[row][col];
              const key = `${row}:${col}`;
              const isSelected = sameCell(selected, { row, col });
              const isHinted =
                hint !== null &&
                (sameCell(hint[0], { row, col }) || sameCell(hint[1], { row, col }));

              if (!tile) {
                return (
                  <div
                    key={key}
                    className={`h-9 w-7 rounded-md sm:h-11 sm:w-8 ${
                      flashKeys.has(key) ? 'bg-amber-200/70' : ''
                    }`}
                  />
                );
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTile(row, col)}
                  aria-label={tile}
                  className={`flex h-9 w-7 items-center justify-center rounded-md transition sm:h-11 sm:w-8 ${
                    isSelected
                      ? 'scale-95 ring-2 ring-amber-400'
                      : isHinted
                        ? 'ring-2 ring-sky-400'
                        : 'hover:-translate-y-0.5'
                  }`}
                >
                  <TileFace tile={tile} size="sm" traditional />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
