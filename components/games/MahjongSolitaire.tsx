'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import TileFace from './TileFace';
import {
  isCleared,
  isExposed,
  removePair,
  type Board
} from '@/lib/mahjong-solitaire/board';
import { createBoard, reshuffle } from '@/lib/mahjong-solitaire/generator';
import { findHint, isDead, undo } from '@/lib/mahjong-solitaire/solver';
import type { SolitaireLayout } from '@/lib/mahjong-solitaire/layouts';
import { tileName } from '@/lib/mahjong/tiles';

export interface MahjongSolitaireProps {
  defaultLayout?: SolitaireLayout;
  onWin?: (points: number) => void;
}

/**
 * Grid geometry for the layered stack. Each layer is shifted up-left from the
 * one below it so a stack reads as a little diagonal column, the classic
 * mahjong-solitaire look.
 */
const CELL_W = 42;
const CELL_H = 54;
const STACK_X = 24;
const STACK_Y = 18;

export default function MahjongSolitaire({
  defaultLayout = 'turtle',
  onWin
}: MahjongSolitaireProps) {
  const t = useTranslations('solitaire');
  const [layout, setLayout] = useState<SolitaireLayout>(defaultLayout);
  const [board, setBoard] = useState<Board>(() =>
    createBoard({ layout: defaultLayout, seed: Math.floor(Math.random() * 2 ** 31) })
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won'>('playing');

  const restart = (nextLayout: SolitaireLayout = layout) => {
    setBoard(
      createBoard({ layout: nextLayout, seed: Math.floor(Math.random() * 2 ** 31) })
    );
    setSelected(null);
    setHint(null);
    setScore(0);
    setStatus('playing');
  };

  // The layout geometry never changes while playing, so it can be derived from
  // the static positions and normalised into the container's top-left corner.
  const geometry = useMemo(() => {
    const points = board.positions.map((p) => ({
      x: p.col * CELL_W - p.layer * STACK_X,
      y: p.row * CELL_H - p.layer * STACK_Y
    }));
    const minX = Math.min(...points.map((pt) => pt.x));
    const minY = Math.min(...points.map((pt) => pt.y));
    const maxX = Math.max(...points.map((pt) => pt.x));
    const maxY = Math.max(...points.map((pt) => pt.y));
    return { minX, minY, width: maxX - minX + CELL_W, height: maxY - minY + CELL_H };
  }, [board.positions]);

  const handleTile = (index: number) => {
    if (status !== 'playing') return;
    if (!isExposed(board, index)) return;

    if (selected === null) {
      setSelected(index);
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    if (board.tiles[selected] !== board.tiles[index]) {
      setSelected(index);
      return;
    }

    const next = removePair(board, selected, index);
    setSelected(null);
    setHint(null);
    setScore((s) => s + 5);

    if (isCleared(next)) {
      setBoard(next);
      setStatus('won');
      onWin?.(Math.min(score + 10, 50));
      return;
    }

    // A board with no legal pair left is a dead end — re-deal the remaining
    // tiles solvably rather than making the player restart.
    if (isDead(next)) {
      setBoard(reshuffle(next));
    } else {
      setBoard(next);
    }
  };

  const showHint = () => {
    if (status !== 'playing') return;
    const pair = findHint(board);
    if (pair) {
      setHint(pair);
      setScore((s) => Math.max(0, s - 2));
    }
  };

  const handleUndo = () => {
    if (status === 'won') {
      setBoard((b) => undo(b));
      setStatus('playing');
      return;
    }
    setBoard((b) => undo(b));
    setSelected(null);
    setHint(null);
  };

  return (
    <div className="rounded-3xl rainbow-card p-3 sm:p-5">
      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <select
          value={layout}
          onChange={(e) => {
            const next = e.target.value as SolitaireLayout;
            setLayout(next);
            restart(next);
          }}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium"
          aria-label={t('layoutLabel')}
        >
          <option value="turtle">{t('turtle')}</option>
          <option value="pyramid">{t('pyramid')}</option>
        </select>

        <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-gray-700">
          {t('score', { n: score })}
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
          onClick={handleUndo}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('undo')}
        </button>
        <button
          type="button"
          onClick={() => {
            setBoard((b) => reshuffle(b));
            setSelected(null);
            setHint(null);
          }}
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

      {/* Win banner */}
      {status === 'won' && (
        <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          {t('cleared', { n: score })}
        </div>
      )}

      {/* Board */}
      <div className="overflow-x-auto py-2">
        <div
          className="relative mx-auto"
          style={{ width: geometry.width, height: geometry.height }}
        >
          {board.positions.map((p, i) => {
            const tile = board.tiles[i];
            if (tile === null) return null;
            const exposed = isExposed(board, i);
            const isSelected = selected === i;
            const isHinted =
              hint !== null && (hint[0] === i || hint[1] === i);

            const classes = [
              'absolute rounded-lg transition',
              exposed
                ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'
                : 'opacity-60 saturate-50',
              isSelected ? 'scale-105 ring-2 ring-amber-400' : '',
              isHinted ? 'ring-2 ring-sky-400' : ''
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleTile(i)}
                disabled={!exposed}
                aria-label={tileName(tile)}
                className={classes}
                style={{
                  left: p.col * CELL_W - p.layer * STACK_X - geometry.minX,
                  top: p.row * CELL_H - p.layer * STACK_Y - geometry.minY,
                  zIndex: isSelected
                    ? 10000
                    : p.layer * 1000 + p.row * 100 + p.col
                }}
              >
                <TileFace tile={tile} size="md" muted={!exposed} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
