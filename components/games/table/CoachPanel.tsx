'use client';

import { useTranslations } from 'next-intl';
import type { CoachRisk, CoachVerdict } from '@/lib/mahjong/coach/contract';
import { explainDiscard } from '@/lib/mahjong/coach/explain';
import type { CoachOutputLevel } from '@/features/table/coach-stage';
import { shouldExpandPanel } from '@/features/table/coach-stage';

export interface CoachPanelProps {
  verdict: CoachVerdict | null;
  level?: CoachOutputLevel;
  /** Pre-discard hint line (suggested tile while deciding). */
  hint?: { suggested?: string; shanten?: number; ukeire?: number } | null;
  className?: string;
  compact?: boolean;
}

/**
 * Shared coach feedback card. Consumes CoachVerdict only.
 * Grade uses icon + text (no red / ❌). Risk + note shown when present.
 */
export default function CoachPanel({
  verdict,
  level = 1,
  hint = null,
  className = '',
  compact = false
}: CoachPanelProps) {
  const t = useTranslations('coachFb');

  if (!verdict && !hint) return null;
  if (verdict?.capability === 'unsupported') {
    return (
      <aside
        className={`rounded-lg border border-white/15 bg-[#002f24]/90 px-3 py-2 text-xs text-emerald-100 ${className}`}
        aria-label={t('watchingTitle')}
      >
        <p className="font-semibold tracking-wide text-emerald-200/90">{t('watchingTitle')}</p>
        <p className="mt-0.5 text-emerald-100/75">{t('watchingBody')}</p>
      </aside>
    );
  }

  const expanded = shouldExpandPanel(level) || Boolean(verdict?.risk) || Boolean(verdict?.note);
  const showFull = expanded || !compact;

  const grade = verdict?.grade;
  const gradeLabel =
    grade === 'best' ? t('gradeBest') : grade === 'acceptable' ? t('gradeOk') : grade === 'better' ? t('gradeBetter') : null;
  const gradeIcon = grade === 'best' ? '✓' : grade === 'acceptable' ? '~' : grade === 'better' ? '▸' : '·';

  const reasons = verdict
    ? explainDiscard(verdict).codes.filter((code) => {
        // Avoid duplicating the same copy when note already carries the code.
        if (code === 'yaku_gate_pending' && verdict.note?.includes('yaku_gate_pending')) return false;
        return true;
      })
    : [];
  const suggested = verdict?.suggested ?? hint?.suggested;
  const shanten = verdict?.shanten ?? hint?.shanten;
  const ukeire = verdict?.ukeire ?? hint?.ukeire;

  return (
    <aside
      className={`rounded-lg border border-white/15 bg-[#002f24]/90 px-3 py-2 text-xs text-emerald-50 shadow-lg ${className}`}
      aria-label={t('title')}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-black uppercase tracking-[.12em] text-amber-200">{t('title')}</p>
        {verdict?.capability === 'partial' && (
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-100/80">
            {t('partialBadge')}
          </span>
        )}
      </div>

      {gradeLabel && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-emerald-50">
          <span aria-hidden="true" className="text-amber-200">
            {gradeIcon}
          </span>
          <span>{gradeLabel}</span>
        </p>
      )}

      {showFull && (
        <div className="mt-1.5 space-y-1 text-emerald-100/85">
          {suggested && (
            <p>
              <span className="text-emerald-100/60">{t('suggested')}: </span>
              <strong className="text-amber-100">{suggested}</strong>
              {verdict?.played && verdict.played !== suggested && (
                <span className="text-emerald-100/60">
                  {' '}
                  · {t('played')}: {verdict.played}
                </span>
              )}
            </p>
          )}
          {(typeof shanten === 'number' || typeof ukeire === 'number') && (
            <p>
              {typeof shanten === 'number' && (
                <span>
                  {t('shanten', { n: shanten })}
                </span>
              )}
              {typeof shanten === 'number' && typeof ukeire === 'number' && ' · '}
              {typeof ukeire === 'number' && <span>{t('ukeire', { n: ukeire })}</span>}
              {typeof verdict?.gap === 'number' && verdict.gap !== 0 && (
                <span className="text-amber-100/90">
                  {' '}
                  · {t('gap', { n: verdict.gap })}
                </span>
              )}
            </p>
          )}
          {verdict?.risk && <RiskLine risk={verdict.risk} />}
          {verdict?.note && <NoteLines note={verdict.note} />}
          {reasons.map((code) => (
            <p key={code} className="leading-snug text-emerald-100/75">
              {t(`reasons.${code}`)}
            </p>
          ))}
        </div>
      )}
    </aside>
  );
}

const KNOWN_NOTES = new Set([
  'yaku_gate_pending',
  'exposed-group-compatible',
  'call-commits-to-line',
  'wait-for-mah-jongg'
]);

function NoteLines({ note }: { note: string }) {
  const t = useTranslations('coachFb');
  const parts = note.split('|');
  const lines: string[] = [];
  for (const part of parts) {
    if (KNOWN_NOTES.has(part)) {
      lines.push(t(`notes.${part}` as 'notes.yaku_gate_pending'));
    } else if (part.startsWith('joker:')) {
      lines.push(t('notes.jokerExchange', { tile: part.slice(6) }));
    } else if (part.startsWith('outs:')) {
      lines.push(t('notes.outs', { detail: part.slice(5) }));
    }
  }
  if (lines.length === 0) return null;
  return (
    <>
      {lines.map((line) => (
        <p key={line} className="leading-snug text-emerald-100/80">
          {line}
        </p>
      ))}
    </>
  );
}

function RiskLine({ risk }: { risk: CoachRisk }) {
  const t = useTranslations('coachFb');
  const label =
    risk === 'high' ? t('riskHigh') : risk === 'low' ? t('riskLow') : t('riskMedium');
  const tone =
    risk === 'high'
      ? 'bg-amber-400/20 text-amber-100'
      : risk === 'low'
        ? 'bg-emerald-300/15 text-emerald-100'
        : 'bg-white/10 text-emerald-100';
  return <p className={`mt-1 rounded-md px-2 py-1 font-semibold ${tone}`}>{label}</p>;
}
