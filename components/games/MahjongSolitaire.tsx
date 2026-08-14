'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import SolitaireTileFace from './SolitaireTileFace';
import {
  canMatch,
  isCleared,
  isExposed,
  removePair,
  type Board
} from '@/lib/mahjong-solitaire/board';
import { createBoard, rescue, reshuffle } from '@/lib/mahjong-solitaire/generator';
import { findHint, isDead, undo } from '@/lib/mahjong-solitaire/solver';
import { measureDifficulty } from '@/lib/mahjong-solitaire/difficulty';
import type { SolitaireLayout } from '@/lib/mahjong-solitaire/layouts';
import { FREE_UNDO_PER_LEVEL } from '@/lib/mahjong-solitaire/tiles';
import {
  applyMatchScore,
  type ScoreState
} from '@/lib/mahjong-solitaire/scoring';
import {
  TEACHING_LEVELS,
  createLevelBoard,
  getLevel,
  nextLevelId,
  type LevelDef
} from '@/lib/mahjong-solitaire/levels';
import { tileName } from '@/lib/mahjong/tiles';

export interface MahjongSolitaireProps {
  defaultLayout?: SolitaireLayout;
  /** Start on a teaching level id (e.g. teach-1). */
  defaultLevelId?: string;
  onWin?: (points: number) => void;
}

const CELL_W = 44;
const CELL_H = 58;
const STACK_X = 22;
const STACK_Y = 16;

type PlayMode = 'level' | 'free';

export default function MahjongSolitaire({
  defaultLayout = 'classic',
  defaultLevelId = 'teach-1',
  onWin
}: MahjongSolitaireProps) {
  const t = useTranslations('solitaire');
  const initialLevel = getLevel(defaultLevelId) ?? TEACHING_LEVELS[0];

  const [mode, setMode] = useState<PlayMode>('level');
  const [level, setLevel] = useState<LevelDef>(initialLevel);
  const [layout, setLayout] = useState<SolitaireLayout>(defaultLayout);
  const [board, setBoard] = useState<Board>(() => createLevelBoard(initialLevel));
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    lastMatchAt: 0
  });
  const [status, setStatus] = useState<'playing' | 'won' | 'dead'>('playing');
  const [paused, setPaused] = useState(false);
  const [undoMsg, setUndoMsg] = useState<string | null>(null);
  const [coachDismissed, setCoachDismissed] = useState(false);

  useEffect(() => {
    if (mode !== 'free') return;
    setBoard(
      createBoard({
        layout: defaultLayout,
        seed: Math.floor(Math.random() * 2 ** 31)
      })
    );
    setStatus('playing');
  }, [defaultLayout, mode]);

  const restartLevel = (next: LevelDef) => {
    setLevel(next);
    setBoard(createLevelBoard(next));
    setSelected(null);
    setHint(null);
    setScoreState({ score: 0, combo: 0, lastMatchAt: 0 });
    setStatus('playing');
    setUndoMsg(null);
    setCoachDismissed(false);
  };

  const restartFree = (nextLayout: SolitaireLayout = layout) => {
    setBoard(
      createBoard({
        layout: nextLayout,
        seed: Math.floor(Math.random() * 2 ** 31)
      })
    );
    setSelected(null);
    setHint(null);
    setScoreState({ score: 0, combo: 0, lastMatchAt: 0 });
    setStatus('playing');
    setUndoMsg(null);
  };

  const geometry = useMemo(() => {
    const points = board.positions.map((p) => ({
      x: p.col * CELL_W - p.layer * STACK_X,
      y: p.row * CELL_H - p.layer * STACK_Y
    }));
    const minX = Math.min(...points.map((pt) => pt.x));
    const minY = Math.min(...points.map((pt) => pt.y));
    const maxX = Math.max(...points.map((pt) => pt.x));
    const maxY = Math.max(...points.map((pt) => pt.y));
    return {
      minX,
      minY,
      width: maxX - minX + CELL_W,
      height: maxY - minY + CELL_H
    };
  }, [board.positions]);

  const metrics = measureDifficulty(board);
  const showCoach = mode === 'level' && !coachDismissed;

  const handleTile = (index: number) => {
    if (status !== 'playing' || paused) return;
    if (!isExposed(board, index)) return;

    if (selected === null) {
      setSelected(index);
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    if (!canMatch(board, selected, index)) {
      setSelected(index);
      return;
    }

    const next = removePair(board, selected, index);
    setSelected(null);
    setHint(null);

    const scored = applyMatchScore(scoreState, Date.now());
    setScoreState({
      score: scored.score,
      combo: scored.combo,
      lastMatchAt: scored.lastMatchAt
    });

    if (isCleared(next)) {
      setBoard(next);
      setStatus('won');
      onWin?.(Math.min(scored.score, 50));
      return;
    }

    if (isDead(next)) {
      setBoard(next);
      setStatus('dead');
    } else {
      setBoard(next);
    }
  };

  const showHint = () => {
    if (status !== 'playing' || paused) return;
    const pair = findHint(board);
    if (pair) {
      setHint(pair);
      setScoreState((s) => ({ ...s, score: Math.max(0, s.score - 2) }));
    }
  };

  const handleUndo = () => {
    const result = undo(board);
    if (!result.ok) {
      setUndoMsg(
        result.reason === 'no_free_undo'
          ? t('noFreeUndo', { n: FREE_UNDO_PER_LEVEL })
          : null
      );
      return;
    }
    setUndoMsg(null);
    setBoard(result.board);
    setSelected(null);
    setHint(null);
    if (status === 'won' || status === 'dead') setStatus('playing');
  };

  const handleRescue = () => {
    setBoard(rescue(board));
    setStatus('playing');
    setSelected(null);
    setHint(null);
  };

  const enterFree = () => {
    setMode('free');
    setLayout(defaultLayout);
    restartFree(defaultLayout);
    setCoachDismissed(true);
  };

  return (
    <div className="rounded-3xl border border-slate-950/20 bg-[#13252d] p-3 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,.28)] sm:p-5">
      <div className="sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-700 bg-[#172f39]/95 p-2 text-sm shadow-md backdrop-blur">
        <select
          value={mode === 'level' ? level.id : `free:${layout}`}
          onChange={(e) => {
            const v = e.target.value;
            if (v.startsWith('free:')) {
              const next = v.slice(5) as SolitaireLayout;
              setMode('free');
              setLayout(next);
              restartFree(next);
              return;
            }
            const next = getLevel(v);
            if (!next) return;
            setMode('level');
            restartLevel(next);
          }}
          className="rounded-full border border-slate-600 bg-[#213c47] px-3 py-1.5 font-medium text-emerald-100"
          aria-label={t('layoutLabel')}
        >
          <optgroup label={t('lessons')}>
            {TEACHING_LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </optgroup>
          <optgroup label={t('freePlay')}>
            <option value="free:classic">Classic 144</option>
            <option value="free:mini">Mini 72</option>
            <option value="free:turtle">{t('turtle')}</option>
            <option value="free:pyramid">{t('pyramid')}</option>
            <option value="free:flat36">Flat 36</option>
          </optgroup>
        </select>

        <span className="rounded-full bg-[#213c47] px-3 py-1.5 font-semibold text-emerald-100">
          {t('score', { n: scoreState.score })}
        </span>
        <span className="rounded-full bg-[#213c47] px-3 py-1.5 text-slate-300">
          {t('left', { n: board.remaining })}
        </span>
        <span className="rounded-full bg-[#213c47] px-3 py-1.5 text-amber-200">
          ×{scoreState.combo || 1}
        </span>
        <span className="rounded-full bg-[#213c47] px-3 py-1.5 text-slate-400">
          undo {board.freeUndosLeft}/{FREE_UNDO_PER_LEVEL}
        </span>
        <span className="hidden rounded-full bg-[#213c47] px-3 py-1.5 text-slate-500 sm:inline">
          branch {metrics.branchWidth}
        </span>

        <button
          type="button"
          onClick={showHint}
          className="rounded-full border border-slate-600 bg-[#213c47] px-3 py-1.5 font-medium text-emerald-200 hover:bg-[#2c4b57]"
        >
          {t('hint')}
        </button>
        <button
          type="button"
          onClick={handleUndo}
          className="rounded-full border border-slate-600 bg-[#213c47] px-3 py-1.5 font-medium text-emerald-200 hover:bg-[#2c4b57]"
        >
          {t('undo')}
        </button>
        <button
          type="button"
          onClick={() => {
            setBoard((b) => reshuffle(b));
            setSelected(null);
            setHint(null);
            setStatus('playing');
          }}
          className="rounded-full border border-slate-600 bg-[#213c47] px-3 py-1.5 font-medium text-emerald-200 hover:bg-[#2c4b57]"
        >
          {t('shuffle')}
        </button>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          onClick={() =>
            mode === 'level' ? restartLevel(level) : restartFree()
          }
          className="ml-auto rounded-full bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-500"
        >
          {t('restart')}
        </button>
      </div>

      {showCoach && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2 rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-50">
          <p className="max-w-2xl leading-relaxed">{t(level.coachKey)}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCoachDismissed(true)}
              className="rounded-full border border-sky-400/50 px-3 py-1 text-xs font-medium text-sky-100 hover:bg-sky-500/20"
            >
              {t('coachSkip')}
            </button>
            <button
              type="button"
              onClick={enterFree}
              className="rounded-full border border-sky-400/50 px-3 py-1 text-xs font-medium text-sky-100 hover:bg-sky-500/20"
            >
              {t('freePlay')}
            </button>
          </div>
        </div>
      )}

      {undoMsg && (
        <p className="mb-2 text-center text-xs text-amber-200">{undoMsg}</p>
      )}

      {status === 'won' && (
        <div className="mb-3 rounded-2xl bg-emerald-500/20 p-4 text-center text-sm font-bold text-emerald-200">
          <p>{t('cleared', { n: scoreState.score })}</p>
          {mode === 'level' && nextLevelId(level.id) && (
            <button
              type="button"
              onClick={() => {
                const nid = nextLevelId(level.id);
                const next = nid ? getLevel(nid) : undefined;
                if (next) restartLevel(next);
              }}
              className="mt-3 rounded-full bg-emerald-500 px-4 py-2 font-bold text-slate-900"
            >
              {t('nextLesson')}
            </button>
          )}
          {mode === 'level' && !nextLevelId(level.id) && (
            <button
              type="button"
              onClick={enterFree}
              className="mt-3 rounded-full bg-emerald-500 px-4 py-2 font-bold text-slate-900"
            >
              {t('freePlay')}
            </button>
          )}
        </div>
      )}

      {status === 'dead' && (
        <div className="mb-3 flex flex-col items-center gap-2 rounded-2xl bg-amber-500/15 p-4 text-center text-sm text-amber-100">
          <p>
            {mode === 'level' && level.tutorial === 'deadlock'
              ? t('coachDeadPrompt')
              : t('deadPrompt')}
          </p>
          <button
            type="button"
            onClick={handleRescue}
            className="rounded-full bg-amber-500 px-4 py-2 font-bold text-slate-900"
          >
            {t('rescue')}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-[#1e3843] px-3 py-5 shadow-inner">
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
            const coachHighlight =
              showCoach &&
              level.tutorial === 'free_tile' &&
              exposed &&
              !isSelected;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleTile(i)}
                disabled={!exposed || status !== 'playing'}
                aria-label={tileName(tile)}
                className={[
                  'absolute rounded-lg transition',
                  exposed
                    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'
                    : 'cursor-default',
                  coachHighlight ? 'ring-2 ring-sky-300/80' : ''
                ].join(' ')}
                style={{
                  left: p.col * CELL_W - p.layer * STACK_X - geometry.minX,
                  top: p.row * CELL_H - p.layer * STACK_Y - geometry.minY,
                  zIndex: isSelected
                    ? 10000
                    : p.layer * 1000 + p.row * 100 + p.col
                }}
              >
                <SolitaireTileFace
                  tile={tile}
                  size="md"
                  selected={isSelected}
                  hinted={isHinted}
                  dimmed={!exposed}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
