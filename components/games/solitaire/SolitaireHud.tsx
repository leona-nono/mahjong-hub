'use client';

import { useTranslations } from 'next-intl';

import type { Board } from '@/lib/mahjong-solitaire/board';
import type { SolitaireLayout } from '@/lib/mahjong-solitaire/layouts';
import { FREE_PLAY_LAYOUTS } from '@/lib/mahjong-solitaire/layouts';
import {
  TEACHING_LEVELS,
  getLevel,
  parseCampaignLevel,
  type LevelDef
} from '@/lib/mahjong-solitaire/levels';
import type { ScoreState } from '@/lib/mahjong-solitaire/scoring';
import {
  isItemUnlocked,
  type ItemType
} from '@/lib/mahjong-solitaire/items';
import type { useSolitaireItems } from '@/lib/solitaire-items';
import { playableLevel, type PlayMode } from './useSolitaireCampaign';
import type { DailyHud } from './useSolitaireDaily';

type ItemsApi = ReturnType<typeof useSolitaireItems>;

export type SolitaireHudProps = {
  compact: boolean;
  mode: PlayMode;
  level: LevelDef;
  layout: SolitaireLayout;
  board: Board;
  scoreState: ScoreState;
  status: 'playing' | 'won' | 'dead';
  paused: boolean;
  dailyHud: DailyHud | null;
  campaignLevels: LevelDef[];
  items: ItemsApi;
  unlockCtx: {
    lessonsCleared: number;
    seenDeadEnd: boolean;
    freePlay: boolean;
  };
  onSelectLevel: (level: LevelDef) => void;
  onSelectFree: (layout: SolitaireLayout) => void;
  onHint: () => void;
  onUndo: () => void;
  onShuffle: () => void;
  onTogglePause: () => void;
  onOpenA11y: () => void;
  onRestart: () => void;
};

function layoutLabel(
  id: SolitaireLayout,
  t: ReturnType<typeof useTranslations<'solitaire'>>
) {
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
}

export default function SolitaireHud({
  compact,
  mode,
  level,
  layout,
  board,
  scoreState,
  status,
  paused,
  dailyHud,
  campaignLevels,
  items,
  unlockCtx,
  onSelectLevel,
  onSelectFree,
  onHint,
  onUndo,
  onShuffle,
  onTogglePause,
  onOpenA11y,
  onRestart
}: SolitaireHudProps) {
  const t = useTranslations('solitaire');

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
        className="min-h-11 rounded-full border border-slate-600 bg-[#213c47] px-3 py-2 font-medium text-emerald-200 hover:bg-[#2c4b57] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {label}
        <span className="ml-1 text-xs text-amber-200">×{count}</span>
      </button>
    );
  };

  return (
    <div className="sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-700 bg-[#172f39]/95 p-2 text-sm shadow-md backdrop-blur">
      {!compact && (
        <select
          value={mode === 'level' ? level.id : `free:${layout}`}
          onChange={(e) => {
            const v = e.target.value;
            if (v.startsWith('free:')) {
              onSelectFree(v.slice(5) as SolitaireLayout);
              return;
            }
            const next = playableLevel(v) ?? getLevel(v);
            if (!next) return;
            onSelectLevel(next);
          }}
          className="max-w-[11rem] rounded-full border border-slate-600 bg-[#213c47] px-3 py-1.5 font-medium text-emerald-100 sm:max-w-none"
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
            {FREE_PLAY_LAYOUTS.map((id) => (
              <option key={id} value={`free:${id}`}>
                {layoutLabel(id, t)}
              </option>
            ))}
          </optgroup>
        </select>
      )}
      {compact && (
        <span className="rounded-full bg-[#213c47] px-3 py-1.5 font-semibold text-emerald-100">
          {t('dailyChallenge')}
          {dailyHud?.cleared ? ` · ${t('dailyDone')}` : ''}
        </span>
      )}

      <span className="rounded-full bg-[#213c47] px-3 py-1.5 font-semibold text-emerald-100">
        {t('score', { n: scoreState.score })}
      </span>
      <span className="rounded-full bg-[#213c47] px-3 py-1.5 text-slate-300">
        {t('left', { n: board.remaining })}
      </span>
      {scoreState.combo > 1 && (
        <span className="rounded-full bg-[#213c47] px-3 py-1.5 text-amber-200">
          ×{scoreState.combo}
        </span>
      )}

      {itemBtn('hint', t('hint'), onHint, status !== 'playing' || paused)}
      {itemBtn('undo', t('undo'), onUndo, paused)}
      {itemBtn(
        'shuffle',
        t('shuffle'),
        onShuffle,
        (status !== 'playing' && status !== 'dead') || paused
      )}

      <button
        type="button"
        onClick={onTogglePause}
        className="min-h-11 rounded-full border border-slate-500 bg-[#213c47] px-3 py-2 font-medium text-emerald-100"
      >
        {paused ? t('resume') : t('pause')}
      </button>
      <button
        type="button"
        onClick={onOpenA11y}
        className="min-h-11 rounded-full border border-slate-600 bg-[#213c47] px-3 py-2 font-medium text-emerald-100 hover:bg-[#2c4b57]"
        aria-label={t('settings')}
        title={t('settings')}
      >
        {t('settings')}
      </button>
      <button
        type="button"
        onClick={onRestart}
        className="ml-auto min-h-11 rounded-full bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500"
      >
        {t('restart')}
      </button>
    </div>
  );
}
