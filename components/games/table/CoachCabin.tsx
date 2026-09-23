'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { McrScoreBody, type McrScoreCoachProps } from './ScorePanel';

export interface CoachCabinProps {
  /** Coach drawer body (controls + panel). Null when silent. */
  coachPanel: ReactNode | null;
  /** Folded chip label; null hides the coach chip. */
  coachChipLabel: string | null;
  /** MCR live score; omit for HK / Riichi. */
  mcr?: McrScoreCoachProps | null;
}

/**
 * Bottom-right coach cabin: folded chips (≥150px) + upward drawer that may cover the hand.
 * Replaces the old mid-table McrScoreCoach and top-right coach float.
 */
export default function CoachCabin({ coachPanel, coachChipLabel, mcr = null }: CoachCabinProps) {
  const t = useTranslations('mahjong');
  const [open, setOpen] = useState<'coach' | 'mcr' | null>(null);
  const showCoach = Boolean(coachChipLabel && coachPanel);
  const showMcr = Boolean(mcr);
  if (!showCoach && !showMcr) return null;

  const drawerOpen = open !== null;
  const close = () => setOpen(null);

  return (
    <div className="absolute bottom-1 right-2 z-40 flex min-w-[150px] flex-col items-stretch gap-1">
      {drawerOpen && (
        <div
          className="absolute bottom-full right-0 z-50 mb-1 max-h-[62%] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-amber-200/30 bg-[#063d30]/98 p-3 text-emerald-50 shadow-2xl"
          role="dialog"
          aria-label={open === 'mcr' ? t('mcrScoreCoach') : t('coachIntensity')}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-[.12em] text-amber-200">
              {open === 'mcr' ? t('mcrScoreCoach') : t('coachIntensity')}
            </span>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-sm font-bold text-emerald-50"
              aria-label={t('closeScoringTips')}
            >
              ×
            </button>
          </div>
          {open === 'mcr' && mcr ? <McrScoreBody {...mcr} /> : null}
          {open === 'coach' && coachPanel}
        </div>
      )}

      <div className="flex min-w-[150px] flex-wrap justify-end gap-1">
        {showMcr && mcr ? (
          <button
            type="button"
            onClick={() => setOpen((current) => (current === 'mcr' ? null : 'mcr'))}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-black tabular-nums shadow-md ${
              open === 'mcr'
                ? 'border-amber-300 bg-amber-300 text-emerald-950'
                : 'border-amber-200/40 bg-[#063d30]/95 text-amber-100'
            }`}
          >
            {t('mcrChipShort', { q: mcr.qualifying, f: mcr.flowers })}
          </button>
        ) : null}
        {showCoach ? (
          <button
            type="button"
            onClick={() => setOpen((current) => (current === 'coach' ? null : 'coach'))}
            className={`max-w-[11rem] truncate rounded-full border px-2.5 py-1 text-[11px] font-black shadow-md ${
              open === 'coach'
                ? 'border-amber-300 bg-amber-300 text-emerald-950'
                : 'border-emerald-200/35 bg-[#0b6548]/95 text-emerald-50'
            }`}
          >
            {coachChipLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
