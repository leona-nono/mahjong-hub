'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import SolitaireTileFace from './SolitaireTileFace';
import {
  canMatch,
  isCleared,
  isExposed,
  removePair,
  type Board
} from '@/lib/mahjong-solitaire/board';
import { createBoard } from '@/lib/mahjong-solitaire/generator';
import { isDead } from '@/lib/mahjong-solitaire/solver';
import { measureDifficulty } from '@/lib/mahjong-solitaire/difficulty';
import type { SolitaireLayout } from '@/lib/mahjong-solitaire/layouts';
import { FREE_UNDO_PER_LEVEL } from '@/lib/mahjong-solitaire/tiles';
import {
  applyMatchScore,
  type ScoreState
} from '@/lib/mahjong-solitaire/scoring';
import {
  TEACHING_LEVELS,
  bandLabelKey,
  campaignOptions,
  createLevelBoard,
  getLevel,
  nextLevelId,
  parseCampaignLevel,
  type LevelDef
} from '@/lib/mahjong-solitaire/levels';
import type { CatalogEntry } from '@/lib/mahjong-solitaire/difficulty';
import { parseDailyLevelId, type SolitaireDeal } from '@/lib/mahjong-solitaire/progress-rules';
import { recordGuestDailyClear } from '@/lib/mahjong-solitaire/daily-local';
import { useSolitaireTilePreload, warmSolitaireTileArt } from '@/lib/mahjong-solitaire/tile-preload';
import { utcDateString } from '@/lib/points-rules';
import catalogFile from '@/lib/mahjong-solitaire/seed-catalog.json';

/** Same catalog the API serves — deal locally so level switches skip the network wait. */
const SEED_CATALOG = (catalogFile.entries ?? []) as CatalogEntry[];

function playableLevel(id: string): LevelDef | undefined {
  return getLevel(id, SEED_CATALOG);
}
import {
  applyHint,
  applyRescue,
  applyShuffle,
  applyUndo,
  isItemUnlocked,
  starsForLevel,
  type ItemType
} from '@/lib/mahjong-solitaire/items';
import {
  useSolitaireItems,
  type PayChannel
} from '@/lib/solitaire-items';
import { tileName } from '@/lib/mahjong/tiles';
import { applyLedgerTotal, usePoints } from '@/lib/points';

export interface MahjongSolitaireProps {
  defaultLayout?: SolitaireLayout;
  defaultLevelId?: string;
  onWin?: (points: number) => void;
}

const CELL_W = 44;
const CELL_H = 58;
const STACK_X = 22;
const STACK_Y = 16;

type PlayMode = 'level' | 'free';

type OfferState = {
  item: ItemType;
  /** After paying, run this effect */
  run: (channel: PayChannel) => Promise<void>;
} | null;

export default function MahjongSolitaire({
  defaultLayout = 'classic',
  defaultLevelId = 'teach-1',
  onWin
}: MahjongSolitaireProps) {
  const t = useTranslations('solitaire');
  const { points } = usePoints();
  const items = useSolitaireItems();
  const initialLevel = playableLevel(defaultLevelId) ?? TEACHING_LEVELS[0];
  useSolitaireTilePreload(true);

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
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [coachDismissed, setCoachDismissed] = useState(false);
  const [itemUses, setItemUses] = useState(0);
  const [offer, setOffer] = useState<OfferState>(null);
  const [dailyHud, setDailyHud] = useState<{
    utcDay: string;
    id: string;
    cleared: boolean;
    streak: number;
  } | null>(null);
  const [dealReady, setDealReady] = useState(true);
  const startedAt = useRef(Date.now());
  const submitting = useRef(false);

  useEffect(() => {
    warmSolitaireTileArt();
  }, []);

  const unlockCtx = {
    lessonsCleared: items.progress.lessonsCleared,
    seenDeadEnd: items.progress.seenDeadEnd,
    freePlay: mode === 'free'
  };

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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/solitaire/daily', { credentials: 'same-origin' });
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as {
            utcDay?: string;
            deal?: SolitaireDeal;
            cleared?: boolean;
            streak?: number;
          };
          if (!data.deal || cancelled) return;
          setDailyHud({
            utcDay: data.utcDay ?? utcDateString(),
            id: data.deal.id,
            cleared: !!data.cleared,
            streak: Number(data.streak) || 0
          });
          return;
        }
        const day = utcDateString();
        const local = getLevel(`daily:${day}`);
        if (local && !cancelled) {
          setDailyHud({ utcDay: day, id: local.id, cleared: false, streak: 0 });
        }
      } catch {
        const day = utcDateString();
        const local = getLevel(`daily:${day}`);
        if (local && !cancelled) {
          setDailyHud({ utcDay: day, id: local.id, cleared: false, streak: 0 });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetRoundMeta = () => {
    setSelected(null);
    setHint(null);
    setScoreState({ score: 0, combo: 0, lastMatchAt: 0 });
    setStatus('playing');
    setStatusMsg(null);
    setItemUses(0);
    setOffer(null);
    items.resetLevelAds();
    startedAt.current = Date.now();
    submitting.current = false;
  };

  const restartLevel = (next: LevelDef) => {
    const def = playableLevel(next.id) ?? next;
    setMode('level');
    setLevel(def);
    setCoachDismissed(false);
    setBoard(createLevelBoard(def));
    resetRoundMeta();
    setDealReady(true);
  };

  useEffect(() => {
    if (!defaultLevelId || defaultLevelId.startsWith('teach-')) return;
    const next = playableLevel(defaultLevelId);
    if (next) restartLevel(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLevelId]);

  const restartFree = (nextLayout: SolitaireLayout = layout) => {
    setDealReady(true);
    setBoard(
      createBoard({
        layout: nextLayout,
        seed: Math.floor(Math.random() * 2 ** 31)
      })
    );
    resetRoundMeta();
  };

  const submitClear = async (score: number) => {
    if (submitting.current) return;
    submitting.current = true;
    const durationMs = Date.now() - startedAt.current;
    try {
      const res = await fetch('/api/solitaire/complete', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId: level.id,
          seed: board.seed,
          score,
          itemUses,
          durationMs
        })
      });
      if (res.status === 401) {
        if (parseDailyLevelId(level.id)) {
          const g = recordGuestDailyClear();
          setDailyHud((d) =>
            d ? { ...d, cleared: true, streak: g.streak } : d
          );
        }
        setStatusMsg(t('guestClear'));
        return;
      }
      const data = (await res.json()) as {
        awarded?: boolean;
        alreadyCleared?: boolean;
        amount?: number;
        total?: number;
        streak?: number;
      };
      if (typeof data.total === 'number') {
        applyLedgerTotal(
          data.total,
          data.awarded && data.amount
            ? { amount: data.amount, reason: 'solitaire_clear' }
            : undefined
        );
      }
      if (data.alreadyCleared) setStatusMsg(t('alreadyCleared'));
      else if (data.awarded) setStatusMsg(t('awardedPoints', { n: data.amount ?? 0 }));
      if (typeof data.streak === 'number') {
        setDailyHud((d) =>
          d ? { ...d, cleared: true, streak: data.streak as number } : d
        );
      } else if (parseDailyLevelId(level.id)) {
        setDailyHud((d) => (d ? { ...d, cleared: true } : d));
      }
      onWin?.(data.amount ?? 0);
    } catch {
      submitting.current = false;
    }
  };

  const geometry = useMemo(() => {
    const pts = board.positions.map((p) => ({
      x: p.col * CELL_W - p.layer * STACK_X,
      y: p.row * CELL_H - p.layer * STACK_Y
    }));
    const minX = Math.min(...pts.map((pt) => pt.x));
    const minY = Math.min(...pts.map((pt) => pt.y));
    const maxX = Math.max(...pts.map((pt) => pt.x));
    const maxY = Math.max(...pts.map((pt) => pt.y));
    return {
      minX,
      minY,
      width: maxX - minX + CELL_W,
      height: maxY - minY + CELL_H
    };
  }, [board.positions]);

  const metrics = measureDifficulty(board);
  const showCoach = mode === 'level' && Boolean(level.coachKey) && !coachDismissed;
  const campaignUpto = Math.max(12, parseCampaignLevel(level.id) ?? 0);
  const campaignLevels = useMemo(
    () => campaignOptions(campaignUpto, SEED_CATALOG),
    [campaignUpto]
  );
  const stars = starsForLevel({
    cleared: status === 'won',
    itemUses
  });

  const bumpItemUse = () => setItemUses((n) => n + 1);

  const handleTile = (index: number) => {
    if (status !== 'playing' || paused || !dealReady) return;
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
      if (mode === 'level') items.markLessonCleared(level.order);
      if (mode === 'level') {
        void submitClear(scored.score);
      }
      return;
    }

    if (isDead(next)) {
      setBoard(next);
      setStatus('dead');
      items.markDeadSeen();
    } else {
      setBoard(next);
    }
  };

  const runHint = async (channel: PayChannel) => {
    if (status !== 'playing' || paused) return;
    const paid = await items.tryConsume('hint', channel);
    if (!paid.ok) {
      if (paid.reason === 'empty') setOffer({ item: 'hint', run: runHint });
      return;
    }
    const r = applyHint(board);
    if (!r.ok) {
      setStatusMsg(t('noMoves'));
      return;
    }
    setHint(r.pair);
    bumpItemUse();
    setOffer(null);
  };

  const runUndo = async (channel: PayChannel) => {
    // Free undos first — no inventory
    const freeTry = applyUndo(board);
    if (freeTry.ok && freeTry.usedFree) {
      setBoard(freeTry.board);
      setSelected(null);
      setHint(null);
      setStatusMsg(null);
      if (status === 'won' || status === 'dead') setStatus('playing');
      setOffer(null);
      return;
    }
    if (freeTry.ok && !freeTry.usedFree) {
      // shouldn't happen without spendItem
    }

    const paid = await items.tryConsume('undo', channel);
    if (!paid.ok) {
      if (paid.reason === 'empty' || paid.reason === undefined) {
        setOffer({ item: 'undo', run: runUndo });
        setStatusMsg(t('noFreeUndo', { n: FREE_UNDO_PER_LEVEL }));
      }
      return;
    }
    const r = applyUndo(board, { spendItem: true });
    if (!r.ok) {
      setStatusMsg(null);
      return;
    }
    setBoard(r.board);
    setSelected(null);
    setHint(null);
    bumpItemUse();
    setOffer(null);
    if (status === 'won' || status === 'dead') setStatus('playing');
  };

  const runShuffle = async (channel: PayChannel) => {
    if (status !== 'playing' && status !== 'dead') return;
    const paid = await items.tryConsume('shuffle', channel);
    if (!paid.ok) {
      if (paid.reason === 'empty') setOffer({ item: 'shuffle', run: runShuffle });
      return;
    }
    const r = applyShuffle(board);
    if (!r.ok) return;
    setBoard(r.board);
    setSelected(null);
    setHint(null);
    setStatus('playing');
    bumpItemUse();
    setOffer(null);
  };

  const runRescue = async (channel: PayChannel) => {
    if (status !== 'dead') return;
    const paid = await items.tryConsume('rescue', channel);
    if (!paid.ok) {
      if (paid.reason === 'empty') setOffer({ item: 'rescue', run: runRescue });
      return;
    }
    const r = applyRescue(board);
    if (!r.ok) return;
    setBoard(r.board);
    setSelected(null);
    setHint(null);
    setStatus('playing');
    bumpItemUse();
    setOffer(null);
  };

  const enterFree = () => {
    setMode('free');
    setLayout(defaultLayout);
    restartFree(defaultLayout);
    setCoachDismissed(true);
  };

  const itemBtn = (
    type: ItemType,
    label: string,
    onClick: () => void,
    disabled?: boolean
  ) => {
    const unlocked = isItemUnlocked(type, unlockCtx);
    const count = items.inventory[type] ?? 0;
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !unlocked}
        title={!unlocked ? t('itemLocked') : undefined}
        className="rounded-full border border-slate-600 bg-[#213c47] px-3 py-1.5 font-medium text-emerald-200 hover:bg-[#2c4b57] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {label}
        <span className="ml-1 text-xs text-amber-200">×{count}</span>
      </button>
    );
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
            const next = playableLevel(v) ?? getLevel(v);
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
          {dailyHud && (
            <optgroup label={t('dailyChallenge')}>
              <option value={dailyHud.id}>
                {t('dailyChallenge')}
                {dailyHud.cleared ? ` · ${t('dailyDone')}` : ''}
              </option>
            </optgroup>
          )}
          <optgroup label={t('campaign')}>
            {campaignLevels.map((l) => (
              <option key={l.id} value={l.id}>
                {t('levelN', { n: l.campaign?.level ?? parseCampaignLevel(l.id) })}
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
        {mode === 'level' && level.campaign && (
          <span className="rounded-full bg-[#213c47] px-3 py-1.5 text-sky-200/90">
            {t('levelN', { n: level.campaign.level })} ·{' '}
            {t(bandLabelKey(level.campaign.band))} ·{' '}
            {t('alphabetShort', { n: level.campaign.alphabet })}
          </span>
        )}
        {dailyHud && (
          <span className="rounded-full bg-[#213c47] px-3 py-1.5 text-amber-100/90">
            {t('streakN', { n: dailyHud.streak })}
          </span>
        )}

        {itemBtn('hint', t('hint'), () => void runHint('inventory'), status !== 'playing' || paused)}
        {itemBtn('undo', t('undo'), () => void runUndo('inventory'), paused)}
        {itemBtn(
          'shuffle',
          t('shuffle'),
          () => void runShuffle('inventory'),
          (status !== 'playing' && status !== 'dead') || paused
        )}

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
          <p className="max-w-2xl leading-relaxed">
            {level.coachKey ? t(level.coachKey) : null}
          </p>
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

      {(statusMsg || items.msg) && (
        <p className="mb-2 text-center text-xs text-amber-200">
          {statusMsg || items.msg}
        </p>
      )}

      {offer && (
        <div className="mb-3 rounded-2xl border border-violet-400/40 bg-violet-500/10 p-4 text-sm text-violet-50">
          <p className="font-semibold">{t('needItem', { item: t(offer.item) })}</p>
          <p className="mt-1 text-xs text-violet-100/80">
            {t('pointsBalance', { n: points })} · {t('itemPrice', { n: items.prices[offer.item] })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void offer.run('points')}
              className="rounded-full bg-violet-500 px-4 py-2 font-bold text-white"
            >
              {t('buyWithPoints', { n: items.prices[offer.item] })}
            </button>
            <button
              type="button"
              onClick={() => void offer.run('ad')}
              className="rounded-full border border-violet-300 px-4 py-2 font-medium"
            >
              {t('watchAdOnce')}
            </button>
            <button
              type="button"
              onClick={() => setOffer(null)}
              className="rounded-full px-3 py-2 text-violet-200/80"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {status === 'won' && (
        <div className="mb-3 rounded-2xl bg-emerald-500/20 p-4 text-center text-sm font-bold text-emerald-200">
          <p>{t('cleared', { n: scoreState.score })}</p>
          <p className="mt-1 text-amber-200">
            {'★'.repeat(stars)}
            {'☆'.repeat(3 - stars)}
          </p>
          {mode === 'level' && nextLevelId(level.id) && (
            <button
              type="button"
              onClick={() => {
                const nid = nextLevelId(level.id);
                const next = nid ? playableLevel(nid) ?? getLevel(nid) : undefined;
                if (next) restartLevel(next);
              }}
              className="mt-3 rounded-full bg-emerald-500 px-4 py-2 font-bold text-slate-900"
            >
              {parseCampaignLevel(nextLevelId(level.id) ?? '') != null
                ? t('nextLevel')
                : t('nextLesson')}
            </button>
          )}
          {mode === 'level' && parseDailyLevelId(level.id) && (
            <button
              type="button"
              onClick={() => {
                const next = playableLevel('lv-1');
                if (next) restartLevel(next);
              }}
              className="mt-3 rounded-full bg-emerald-500 px-4 py-2 font-bold text-slate-900"
            >
              {t('playCampaign')}
            </button>
          )}
          {mode === 'level' && !nextLevelId(level.id) && !parseDailyLevelId(level.id) && (
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
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => void runRescue('inventory')}
              className="rounded-full bg-amber-500 px-4 py-2 font-bold text-slate-900"
            >
              {t('rescue')} ×{items.inventory.rescue}
            </button>
            <button
              type="button"
              onClick={() => void runRescue('points')}
              className="rounded-full border border-amber-300 px-4 py-2 font-medium"
            >
              {t('buyWithPoints', { n: items.prices.rescue })}
            </button>
            <button
              type="button"
              onClick={() => void runRescue('ad')}
              className="rounded-full border border-amber-300 px-4 py-2 font-medium"
            >
              {t('watchAdRescue')}
            </button>
            <button
              type="button"
              onClick={() =>
                mode === 'level' ? restartLevel(level) : restartFree()
              }
              className="rounded-full px-4 py-2 text-amber-100/70"
            >
              {t('giveUp')}
            </button>
          </div>
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
                disabled={!exposed || status !== 'playing' || !dealReady}
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
