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
export type ConnectVariant = 'classic' | 'garden';

const GARDEN_SLOTS = Array.from({ length: 8 * 12 }, (_, index) => ({
  row: Math.floor(index / 12) + 1,
  col: (index % 12) + 1
})).filter(({ row, col }) => {
  // A quiet, symmetrical garden frame: open corners leave more routing space
  // than a rectangular board, without changing the two-turn Connect rules.
  const outerCorner = (row === 1 || row === 8) && (col <= 2 || col >= 11);
  const sideNotch = (row === 2 || row === 7) && (col === 1 || col === 12);
  return !outerCorner && !sideNotch;
});

const PRESETS: Record<
  ConnectDifficulty,
  { rows: number; cols: number; kinds: number; seconds: number; slots?: readonly Cell[] }
> = {
  relaxed: { rows: 6, cols: 8, kinds: 12, seconds: 0 },
  classic: { rows: 8, cols: 10, kinds: 18, seconds: 300 },
  expert: { rows: 10, cols: 12, kinds: 26, seconds: 240 }
};

const GARDEN_PRESET = { rows: 8, cols: 12, kinds: 24, seconds: 0, slots: GARDEN_SLOTS };

const sameCell = (a: Cell | null, b: Cell) =>
  a !== null && a.row === b.row && a.col === b.col;

export interface MahjongConnectProps {
  defaultDifficulty?: ConnectDifficulty;
  variant?: ConnectVariant;
  onWin?: (points: number) => void;
}

export default function MahjongConnect({
  defaultDifficulty = 'classic',
  variant = 'classic',
  onWin
}: MahjongConnectProps) {
  const t = useTranslations('connect');
  const isGarden = variant === 'garden';
  const [difficulty, setDifficulty] = useState<ConnectDifficulty>(defaultDifficulty);
  const boardOptions = (next: ConnectDifficulty) => isGarden ? GARDEN_PRESET : PRESETS[next];
  const [board, setBoard] = useState<Board>(() => createBoard(boardOptions(defaultDifficulty)));
  const [selected, setSelected] = useState<Cell | null>(null);
  const [hint, setHint] = useState<[Cell, Cell] | null>(null);
  const [flash, setFlash] = useState<Cell[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(boardOptions(defaultDifficulty).seconds);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'dead'>('playing');

  const preset = boardOptions(difficulty);

  const restart = useCallback(
    (next: ConnectDifficulty = difficulty) => {
      setBoard(createBoard(boardOptions(next)));
      setSelected(null);
      setHint(null);
      setFlash([]);
      setScore(0);
      setStreak(0);
      setSecondsLeft(boardOptions(next).seconds);
      setStatus('playing');
    },
    [difficulty, isGarden]
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

    // Show the rescue state rather than silently changing the board.
    if (findAllPairs(next, 1).length === 0) {
      setBoard(next);
      setStatus('dead');
    } else {
      setBoard(next);
    }
  };

  const showHint = () => {
    if (status !== 'playing') return;
    const pairs = findAllPairs(board, 1);
    if (pairs.length > 0) {
      setHint(pairs[0]);
      setScore((s) => Math.max(0, s - 5));
    }
  };

  const rescue = () => {
    setBoard((current) => reshuffle(current));
    setSelected(null);
    setHint(null);
    setStatus('playing');
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
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#dedacf] pb-3 text-sm">
        {!isGarden && <select
          value={difficulty}
          onChange={(e) => {
            const next = e.target.value as ConnectDifficulty;
            setDifficulty(next);
            restart(next);
          }}
          className="min-h-10 rounded-lg border border-[#d8d7cd] bg-[#fffef9] px-3 py-1.5 font-semibold text-[#1d2a44]"
          aria-label={t('difficultyLabel')}
        >
          <option value="relaxed">{t('relaxed')}</option>
          <option value="classic">{t('classic')}</option>
          <option value="expert">{t('expert')}</option>
        </select>}

        {isGarden && <span className="min-h-10 rounded-lg bg-[#e7efec] px-3 py-2 font-semibold text-[#1d2a44]">{t('gardenBoard')}</span>}

        <span className="min-h-10 rounded-lg bg-[#e7efec] px-3 py-2 font-semibold text-[#1d2a44]">
          {t('score', { n: score })}
        </span>
        <span className="min-h-10 rounded-lg bg-[#f3efe5] px-3 py-2 font-semibold text-[#1d2a44]">
          ⏱ {timeLabel}
        </span>
        <span className="min-h-10 rounded-lg bg-[#f3efe5] px-3 py-2 text-[#52617a]">
          {t('left', { n: board.remaining })}
        </span>

        <button
          type="button"
          onClick={showHint}
          className="min-h-10 rounded-lg border border-[#d8d7cd] bg-[#fffef9] px-3 py-2 font-semibold text-[#1d2a44] hover:bg-[#f4efe2]"
        >
          {t('hint')}
        </button>
        <button
          type="button"
          onClick={() => setBoard((b) => reshuffle(b))}
          className="min-h-10 rounded-lg border border-[#d8d7cd] bg-[#fffef9] px-3 py-2 font-semibold text-[#1d2a44] hover:bg-[#f4efe2]"
        >
          {t('shuffle')}
        </button>
        <button
          type="button"
          onClick={() => restart()}
          className="ml-auto min-h-10 rounded-lg bg-[#1e554d] px-4 py-2 font-bold text-white shadow-sm hover:bg-[#2d756a]"
        >
          {t('restart')}
        </button>
      </div>

      <div className="relative overflow-x-auto rounded-2xl bg-cover bg-center p-3 sm:p-5" style={{ backgroundImage: 'linear-gradient(rgba(16, 62, 53, .80), rgba(16, 62, 53, .84)), var(--mahjong-table-image)' }}>
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
                  <TileFace tile={tile} size="sm" />
                </button>
              );
            })
          )}
        </div>
        {status !== 'playing' && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#102720]/65 p-4 backdrop-blur-[2px]">
            <section className="w-full max-w-sm rounded-3xl border border-[#fff6df]/45 bg-[#fffdf7]/95 p-6 text-center shadow-2xl">
              <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full text-2xl ${status === 'won' ? 'bg-[#f9e6b4]' : 'bg-[#f4ead5]'}`}>{status === 'won' ? '✦' : status === 'lost' ? '⌛' : '↻'}</div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-[#1d2a44]">{status === 'won' ? t('winTitle') : status === 'lost' ? t('lossTitle') : t('deadTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-[#52617a]">{status === 'won' ? t('cleared', { n: score }) : status === 'lost' ? t('lossBody') : t('deadBody')}</p>
              <button type="button" onClick={() => status === 'dead' ? rescue() : restart()} className="mt-5 min-h-11 rounded-xl bg-[#1e554d] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#2d756a]">{status === 'dead' ? t('rescue') : t('playAgain')}</button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
