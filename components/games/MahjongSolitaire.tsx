'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import SolitaireBoard from './solitaire/SolitaireBoard';
import SolitaireHud from './solitaire/SolitaireHud';
import { useSolitaireCampaign, playableLevel } from './solitaire/useSolitaireCampaign';
import { useSolitaireDaily } from './solitaire/useSolitaireDaily';
import { useSolitaireBoardItems } from './solitaire/useSolitaireBoardItems';
import {
  canMatch,
  isCleared,
  isExposed,
  removePair
} from '@/lib/mahjong-solitaire/board';
import { isDead } from '@/lib/mahjong-solitaire/solver';
import type { SolitaireLayout } from '@/lib/mahjong-solitaire/layouts';
import { FREE_PLAY_LAYOUTS, layoutTileCount } from '@/lib/mahjong-solitaire/layouts';
import {
  applyMatchScore,
  type ScoreState
} from '@/lib/mahjong-solitaire/scoring';
import {
  getLevel,
  nextLevelId,
  parseCampaignLevel
} from '@/lib/mahjong-solitaire/levels';
import {
  parseDailyLevelId
} from '@/lib/mahjong-solitaire/progress-rules';
import { recordGuestDailyClear } from '@/features/guest/guest-store';
import { useSolitaireTilePreload, warmSolitaireTileArt } from '@/features/solitaire/tile-preload';
import { trackSolitaireEvent } from '@/features/solitaire/telemetry';
import { adsEnabled } from '@/lib/flags';
import { starsForLevel } from '@/lib/mahjong-solitaire/items';
import { useSolitaireItems } from '@/lib/solitaire-items';
import { ensureGuestId } from '@/lib/guest-points';
import { openLogin } from '@/lib/auth';
import MahjongAccessibilityPanel, {
  useMahjongPreferences
} from '@/components/games/MahjongAccessibilityPanel';

export interface MahjongSolitaireProps {
  defaultLayout?: SolitaireLayout;
  defaultLevelId?: string;
  onWin?: (points: number) => void;
  /** Slim chrome for homepage daily embed — hides free-play / campaign chrome. */
  compact?: boolean;
  /** Prefer starting play immediately (skips coach / free-play entry). */
  autoStart?: boolean;
}

export default function MahjongSolitaire({
  defaultLayout = 'classic',
  defaultLevelId = 'teach-1',
  onWin,
  compact = false,
  autoStart = false
}: MahjongSolitaireProps) {
  const t = useTranslations('solitaire');
  const items = useSolitaireItems();
  const { preferences, setPreference } = useMahjongPreferences();
  const [a11yOpen, setA11yOpen] = useState(false);
  useSolitaireTilePreload(true);

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
  const [savePromptPts, setSavePromptPts] = useState<number | null>(null);
  const startedAt = useRef(Date.now());
  const submitting = useRef(false);
  const firstTileTracked = useRef(false);

  const boardItemsRef = useRef<{ resetItemMeta: () => void } | null>(null);

  const resetRoundMeta = () => {
    setSelected(null);
    setHint(null);
    setScoreState({ score: 0, combo: 0, lastMatchAt: 0 });
    setStatus('playing');
    setStatusMsg(null);
    boardItemsRef.current?.resetItemMeta();
    items.resetLevelAds();
    startedAt.current = Date.now();
    submitting.current = false;
    firstTileTracked.current = false;
  };

  const {
    mode,
    setMode,
    level,
    layout,
    setLayout,
    board,
    setBoard,
    coachDismissed,
    setCoachDismissed,
    dealReady,
    campaignLevels,
    restartLevel,
    restartFree,
    enterFree
  } = useSolitaireCampaign({
    defaultLayout,
    defaultLevelId,
    autoStart,
    compact,
    onRoundReset: resetRoundMeta,
    onFreeModeDeal: () => setStatus('playing')
  });

  const { dailyHud, markDailyCleared } = useSolitaireDaily();

  const {
    itemUses,
    offer,
    setOffer,
    resetItemMeta,
    runHint,
    runUndo,
    runShuffle,
    runRescue
  } = useSolitaireBoardItems({
    board,
    setBoard,
    status,
    setStatus,
    paused,
    setSelected,
    setHint,
    setStatusMsg,
    levelId: level.id,
    items,
    t
  });
  boardItemsRef.current = { resetItemMeta };

  useEffect(() => {
    warmSolitaireTileArt();
  }, []);

  useEffect(() => {
    // Non-teach defaults go through restartLevel (which tracks). Teach starts here.
    if (defaultLevelId && !defaultLevelId.startsWith('teach-')) return;
    trackSolitaireEvent(
      parseDailyLevelId(level.id) ? 'solitaire_daily_enter' : 'solitaire_level_enter',
      {
        levelId: level.id,
        layout: level.layout,
        alphabet: level.deal.alphabet ?? 0,
        remaining: layoutTileCount(level.layout)
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const a11yTracked = useRef(false);
  useEffect(() => {
    if (!a11yTracked.current) {
      a11yTracked.current = true;
      return;
    }
    trackSolitaireEvent('solitaire_a11y_changed', {
      highContrast: preferences.highContrast,
      reducedMotion: preferences.reducedMotion,
      tileScale: preferences.tileScale
    });
  }, [preferences.highContrast, preferences.reducedMotion, preferences.tileScale]);

  const unlockCtx = {
    lessonsCleared: items.progress.lessonsCleared,
    seenDeadEnd: items.progress.seenDeadEnd,
    freePlay: mode === 'free'
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
        ensureGuestId();
        if (parseDailyLevelId(level.id)) {
          const g = recordGuestDailyClear();
          markDailyCleared(g.streak);
        }
        setStatusMsg(t('guestClear'));
        setSavePromptPts(1);
        return;
      }
      const data = (await res.json()) as {
        awarded?: boolean;
        alreadyCleared?: boolean;
        amount?: number;
        total?: number;
        streak?: number;
      };
      if (data.alreadyCleared) setStatusMsg(t('alreadyCleared'));
      else if (data.awarded) setStatusMsg(t('cleared', { n: score }));
      if (typeof data.streak === 'number') {
        markDailyCleared(data.streak);
      } else if (parseDailyLevelId(level.id)) {
        markDailyCleared();
      }
      onWin?.(data.amount ?? 0);
    } catch {
      submitting.current = false;
    }
  };

  const showCoach =
    !compact && mode === 'level' && Boolean(level.coachKey) && !coachDismissed;
  const stars = starsForLevel({
    cleared: status === 'won',
    itemUses
  });

  const handleTile = (index: number) => {
    if (status !== 'playing' || paused || !dealReady) return;
    if (!isExposed(board, index)) return;

    if (!firstTileTracked.current) {
      firstTileTracked.current = true;
      trackSolitaireEvent('solitaire_first_tile_ms', {
        levelId: level.id,
        ms: Date.now() - startedAt.current
      });
    }

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
    trackSolitaireEvent('solitaire_match', {
      levelId: level.id,
      remaining: next.remaining,
      combo: scored.combo
    });

    if (isCleared(next)) {
      setBoard(next);
      setStatus('won');
      trackSolitaireEvent('solitaire_clear', {
        levelId: level.id,
        score: scored.score,
        itemUses,
        ms: Date.now() - startedAt.current
      });
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
      trackSolitaireEvent('solitaire_dead', {
        levelId: level.id,
        remaining: next.remaining
      });
    } else {
      setBoard(next);
    }
  };

  const hotkeys = useRef({
    hint: runHint,
    undo: runUndo,
    togglePause: () => setPaused((v) => !v)
  });
  hotkeys.current = {
    hint: runHint,
    undo: runUndo,
    togglePause: () => setPaused((v) => !v)
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === 'p') {
        event.preventDefault();
        hotkeys.current.togglePause();
        return;
      }
      if (key === 'h') {
        event.preventDefault();
        void hotkeys.current.hint('inventory');
        return;
      }
      if (key === 'z') {
        event.preventDefault();
        void hotkeys.current.undo('inventory');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const layoutLabel = (id: SolitaireLayout) => {
    if (id === 'classic') return 'Classic 144';
    if (id === 'mini') return 'Mini';
    if (id === 'flat36') return 'Flat 36';
    return t(
      id as
        | 'turtle'
        | 'pyramid'
        | 'fish'
        | 'butterfly'
        | 'gate'
        | 'snail'
        | 'arrow'
        | 'bridge'
        | 'castle'
        | 'dna'
        | 'peacock'
        | 'tower'
        | 'diamond'
    );
  };

  return (
    <div
      className={`solitaire-shell rounded-3xl border border-slate-950/20 bg-[#13252d] p-3 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,.28)] ${
        compact ? 'sm:p-4' : 'sm:p-5'
      }`}
      data-compact={compact ? 'true' : 'false'}
      data-high-contrast={preferences.highContrast ? 'true' : 'false'}
      data-reduced-motion={preferences.reducedMotion ? 'true' : 'false'}
      data-tile-scale={preferences.tileScale}
      data-table-theme={preferences.tableTheme}
    >
      {a11yOpen && (
        <MahjongAccessibilityPanel
          preferences={preferences}
          onChange={setPreference}
          onClose={() => setA11yOpen(false)}
          solitaireExtras
        />
      )}
      <SolitaireHud
        compact={compact}
        mode={mode}
        level={level}
        layout={layout}
        board={board}
        scoreState={scoreState}
        status={status}
        paused={paused}
        dailyHud={dailyHud}
        campaignLevels={campaignLevels}
        items={items}
        unlockCtx={unlockCtx}
        onSelectLevel={(next) => {
          setMode('level');
          restartLevel(next);
        }}
        onSelectFree={(next) => {
          setMode('free');
          setLayout(next);
          restartFree(next);
        }}
        onHint={() => void runHint('inventory')}
        onUndo={() => void runUndo('inventory')}
        onShuffle={() => void runShuffle('inventory')}
        onTogglePause={() => setPaused((value) => !value)}
        onOpenA11y={() => setA11yOpen(true)}
        onRestart={() => (mode === 'level' ? restartLevel(level) : restartFree())}
      />

      {!compact && mode === 'free' && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t('layoutPicker')}
          </p>
          <div className="portal-scrollbar flex gap-2 overflow-x-auto pb-1">
            {FREE_PLAY_LAYOUTS.map((id) => {
              const active = layout === id;
              const n = layoutTileCount(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setLayout(id);
                    restartFree(id);
                  }}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-100'
                      : 'border-slate-600 bg-[#213c47] text-slate-200 hover:border-slate-400'
                  }`}
                >
                  <span className="block text-sm font-semibold">{layoutLabel(id)}</span>
                  <span className="text-[11px] text-slate-400">{n} tiles</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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

      {(statusMsg || items.msg || savePromptPts) && (
        <div className="mb-3 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-amber-100">
            {savePromptPts != null ? t('guestClear') : statusMsg || items.msg}
          </p>
          {savePromptPts != null && (
            <button
              type="button"
              onClick={() => openLogin()}
              className="mt-2 rounded-full bg-amber-300 px-4 py-1.5 text-xs font-black text-emerald-950"
            >
              {t('guestClear')}
            </button>
          )}
        </div>
      )}

      {offer && (
        <div className="mb-3 rounded-2xl border border-violet-400/40 bg-violet-500/10 p-4 text-sm text-violet-50">
          <p className="font-semibold">{t('needItem', { item: t(offer.item) })}</p>
          <p className="mt-1 text-xs text-violet-100/80">
            {t('useDailyFree', { n: items.dailyFreeLeft[offer.item] })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {items.dailyFreeLeft[offer.item] > 0 ? (
              <button
                type="button"
                onClick={() => void offer.run('daily_free')}
                className="rounded-full bg-violet-500 px-4 py-2 font-bold text-white"
              >
                {t('useDailyFree', { n: items.dailyFreeLeft[offer.item] })}
              </button>
            ) : null}
            {adsEnabled() && (
              <button
                type="button"
                onClick={() => void offer.run('ad')}
                className="rounded-full border border-violet-300 px-4 py-2 font-medium"
              >
                {t('watchAdOnce')}
              </button>
            )}
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
          {mode === 'level' && nextLevelId(level.id) && !compact && (
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
          {mode === 'level' && parseDailyLevelId(level.id) && !compact && (
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
          {mode === 'level' && !nextLevelId(level.id) && !parseDailyLevelId(level.id) && !compact && (
            <button
              type="button"
              onClick={enterFree}
              className="mt-3 rounded-full bg-emerald-500 px-4 py-2 font-bold text-slate-900"
            >
              {t('freePlay')}
            </button>
          )}
          {compact && parseDailyLevelId(level.id) && (
            <p className="mt-2 text-sm font-semibold text-emerald-100/90">
              {t('cleared', { n: scoreState.score })}
            </p>
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
            {items.dailyFreeLeft.rescue > 0 ? (
              <button
                type="button"
                onClick={() => void runRescue('daily_free')}
                className="rounded-full border border-amber-300 px-4 py-2 font-medium"
              >
                {t('useDailyFree', { n: items.dailyFreeLeft.rescue })}
              </button>
            ) : null}
            {adsEnabled() && (
              <button
                type="button"
                onClick={() => void runRescue('ad')}
                className="rounded-full border border-amber-300 px-4 py-2 font-medium"
              >
                {t('watchAdRescue')}
              </button>
            )}
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

      <SolitaireBoard
        board={board}
        selected={selected}
        hint={hint}
        status={status}
        paused={paused}
        dealReady={dealReady}
        showCoach={showCoach}
        coachTutorial={level.tutorial}
        preferences={preferences}
        onTileClick={handleTile}
      />
    </div>
  );
}
