'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import TileFace, { type TileTheme } from './TileFace';
import {
  isCleared,
  isExposed,
  removePair,
  type Board
} from '@/lib/mahjong-solitaire/board';
import { createBoard, reshuffle } from '@/lib/mahjong-solitaire/generator';
import { findHint, isDead, undo } from '@/lib/mahjong-solitaire/solver';
import type { SolitaireLayout } from '@/lib/mahjong-solitaire/layouts';
import { canSolitaireMatch, tileName } from '@/lib/mahjong/tiles';
import { savedAppearance } from '@/lib/appearance';

export interface MahjongSolitaireProps {
  defaultLayout?: SolitaireLayout;
  onWin?: (points: number) => void;
}

/**
 * Grid geometry for the layered stack. Each layer is shifted up-left from the
 * one below it so a stack reads as a little diagonal column, the classic
 * mahjong-solitaire look.
 */
const CELL_W = 46;
const CELL_H = 62;
const STACK_X = 24;
const STACK_Y = 18;

const TABLE_THEMES = {
  jade: '/images/solitaire/backgrounds/solitaire-jade-table-v1.webp',
  lunar: '/images/solitaire/backgrounds/lunar-new-year-vermilion-table-v1.webp',
  spring: '/images/seasonal/tables/spring-equinox-table-v1.webp',
  summer: '/images/seasonal/tables/summer-solstice-table-v1.webp',
  autumn: '/images/seasonal/tables/autumn-equinox-table-v1.webp',
  winter: '/images/seasonal/tables/winter-solstice-table-v1.webp'
} as const;
type TableTheme = keyof typeof TABLE_THEMES;
const TABLE_THEME_ORDER: TableTheme[] = ['jade', 'spring', 'summer', 'autumn', 'winter', 'lunar'];

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
  const [status, setStatus] = useState<'playing' | 'won' | 'dead'>('playing');
  const [tutorialStep, setTutorialStep] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [tileTheme, setTileTheme] = useState<TileTheme>('classic');
  const [tableTheme, setTableTheme] = useState<TableTheme>('jade');
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const [boardScale, setBoardScale] = useState(1);

  useEffect(() => {
    const sync = () => setTableTheme(savedAppearance());
    sync();
    window.addEventListener('mahjong-appearance-change', sync);
    return () => window.removeEventListener('mahjong-appearance-change', sync);
  }, []);

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

  useEffect(() => {
    const node = boardWrapRef.current;
    if (!node) return undefined;
    const resize = () => setBoardScale(Math.min(1, Math.max(0.68, (node.clientWidth - 12) / geometry.width)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [geometry.width]);

  const handleTile = (index: number) => {
    if (status !== 'playing' || tutorialStep > 0) return;
    if (!isExposed(board, index)) return;

    if (selected === null) {
      setSelected(index);
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    const first = board.tiles[selected];
    const second = board.tiles[index];
    if (first === null || second === null || !canSolitaireMatch(first, second)) {
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

    // Let the player choose the rescue: a dead-end is an understandable game
    // state, not a silent change to the board.
    if (isDead(next)) {
      setBoard(next);
      setStatus('dead');
    } else {
      setBoard(next);
    }
  };

  const showHint = () => {
    if (status !== 'playing' || tutorialStep > 0) return;
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

  const advanceTutorial = () => {
    setTutorialStep((step) => (step >= 3 ? 0 : step + 1));
  };

  const rescue = () => {
    setBoard((current) => reshuffle(current));
    setSelected(null);
    setHint(null);
    setStatus('playing');
  };

  return (
    <div className={`rounded-3xl rainbow-card p-3 sm:p-5 ${highContrast ? 'high-contrast' : ''}`}>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-[#dedacf] pb-3 text-sm">
        <select
          value={layout}
          onChange={(e) => {
            const next = e.target.value as SolitaireLayout;
            setLayout(next);
            restart(next);
          }}
          className="min-h-10 rounded-lg border border-[#d8d7cd] bg-[#fffef9] px-3 py-1.5 font-semibold text-[#1d2a44]"
          aria-label={t('layoutLabel')}
        >
          <option value="turtle">{t('turtle')}</option>
          <option value="pyramid">{t('pyramid')}</option>
        </select>

        <span className="min-h-10 rounded-lg bg-[#e7efec] px-3 py-2 font-semibold text-[#1d2a44]">
          {t('score', { n: score })}
        </span>
        <span className="min-h-10 rounded-lg bg-[#f3efe5] px-3 py-2 font-medium text-[#52617a]">
          {t('left', { n: board.remaining })}
        </span>
        <button type="button" onClick={() => setHighContrast((value) => !value)} aria-pressed={highContrast} className={`min-h-10 rounded-lg border px-3 py-2 font-semibold ${highContrast ? 'border-[#101827] bg-[#101827] text-white' : 'border-[#d8d7cd] bg-[#fffef9] text-[#1d2a44]'}`}>
          {highContrast ? 'AA' : 'Aa'}
        </button>
        <button type="button" onClick={() => setTileTheme((theme) => theme === 'classic' ? 'heritage' : 'classic')} aria-label="Change tile theme" className={`min-h-10 rounded-lg border px-3 py-2 font-semibold ${tileTheme === 'heritage' ? 'border-[#b7834c] bg-[#f6ead9] text-[#75401e]' : 'border-[#d8d7cd] bg-[#fffef9] text-[#1d2a44]'}`}>
          {tileTheme === 'heritage' ? '印' : '牌'}
        </button>
        <button type="button" onClick={() => setTableTheme((theme) => TABLE_THEME_ORDER[(TABLE_THEME_ORDER.indexOf(theme) + 1) % TABLE_THEME_ORDER.length])} aria-label="Change table theme" className={`min-h-10 rounded-lg border px-3 py-2 font-semibold ${tableTheme === 'lunar' ? 'border-[#a6423e] bg-[#f7e0d5] text-[#8b312f]' : 'border-[#d8d7cd] bg-[#fffef9] text-[#1d2a44]'}`}>
          {{ jade: '桌', spring: '春', summer: '夏', autumn: '秋', winter: '冬', lunar: '节' }[tableTheme]}
        </button>

        <button
          type="button"
          onClick={showHint}
          className="min-h-10 rounded-lg border border-[#d8d7cd] bg-[#fffef9] px-3 py-2 font-semibold text-[#1d2a44] hover:bg-[#f4efe2]"
        >
          {t('hint')}
        </button>
        <button
          type="button"
          onClick={handleUndo}
          className="min-h-10 rounded-lg border border-[#d8d7cd] bg-[#fffef9] px-3 py-2 font-semibold text-[#1d2a44] hover:bg-[#f4efe2]"
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

      {/* Board */}
      <div
        ref={boardWrapRef}
        className="relative overflow-hidden rounded-2xl bg-cover bg-center px-1 py-4 sm:py-6"
        style={{
          backgroundImage: `linear-gradient(rgba(255,253,247,${tableTheme === 'jade' ? '.10' : '.14'}), rgba(255,253,247,${tableTheme === 'jade' ? '.10' : '.14'})), url('${TABLE_THEMES[tableTheme]}')`
        }}
      >
        <div
          className="relative mx-auto origin-top"
          style={{ width: geometry.width * boardScale, height: geometry.height * boardScale }}
        >
          <div className="relative" style={{ width: geometry.width, height: geometry.height, transform: `scale(${boardScale})`, transformOrigin: 'top left' }}>
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
                <TileFace tile={tile} size="md" theme={tileTheme} muted={!exposed} />
              </button>
            );
          })}</div>
        </div>
        {(tutorialStep > 0 || status !== 'playing') && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-[#102720]/60 p-4 backdrop-blur-[2px]">
            {tutorialStep > 0 && (
              <section className="w-full max-w-sm rounded-3xl border border-[#fff6df]/45 bg-[#fffdf7]/95 p-5 text-center shadow-2xl">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#e7efec] text-xl text-[#1e554d]">{tutorialStep}</div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a66a3f]">{t('tutorialTitle')}</p>
                <p className="mt-2 text-sm leading-6 text-[#26364a]">{t(`tutorial${tutorialStep === 1 ? 'One' : tutorialStep === 2 ? 'Two' : 'Three'}`)}</p>
                <button type="button" onClick={advanceTutorial} className="mt-5 min-h-11 rounded-xl bg-[#1e554d] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#2d756a]">
                  {tutorialStep === 3 ? t('start') : t('next')}
                </button>
              </section>
            )}
            {tutorialStep === 0 && status === 'won' && (
              <section className="w-full max-w-sm rounded-3xl border border-[#f6d58d] bg-[#fffdf7]/95 p-6 text-center shadow-2xl">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f9e6b4] text-2xl">✦</div>
                <h2 className="mt-3 font-serif text-2xl font-bold text-[#1d2a44]">{t('victoryTitle')}</h2>
                <p className="mt-2 text-sm text-[#52617a]">{t('cleared', { n: score })} {t('victoryBody')}</p>
                <button type="button" onClick={() => restart()} className="mt-5 min-h-11 rounded-xl bg-[#1e554d] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#2d756a]">{t('restart')}</button>
              </section>
            )}
            {tutorialStep === 0 && status === 'dead' && (
              <section className="w-full max-w-sm rounded-3xl border border-[#d9bd8a] bg-[#fffdf7]/95 p-6 text-center shadow-2xl">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f4ead5] text-2xl">↻</div>
                <h2 className="mt-3 font-serif text-2xl font-bold text-[#1d2a44]">{t('deadTitle')}</h2>
                <p className="mt-2 text-sm leading-6 text-[#52617a]">{t('deadBody')}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={rescue} className="min-h-11 rounded-xl bg-[#1e554d] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#2d756a]">{t('rescue')}</button>
                  <button type="button" onClick={() => restart()} className="min-h-11 rounded-xl border border-[#d8d7cd] bg-white px-4 text-sm font-bold text-[#1d2a44]">{t('restart')}</button>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
