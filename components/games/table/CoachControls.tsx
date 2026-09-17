'use client';

import { useTranslations } from 'next-intl';
import type { CoachIntensity } from '@/lib/mahjong/coach';

const OPTIONS: CoachIntensity[] = ['silent', 'ask', 'live'];

export default function CoachControls({
  intensity,
  onChange,
  onAsk,
  className = ''
}: {
  intensity: CoachIntensity;
  onChange: (next: CoachIntensity) => void;
  onAsk?: () => void;
  className?: string;
}) {
  const t = useTranslations('mahjong');
  const label = (value: CoachIntensity) =>
    value === 'silent' ? t('coachSilent') : value === 'live' ? t('coachLive') : t('coachAsk');

  return (
    <span className={`inline-flex items-center gap-2 text-xs font-semibold ${className}`}>
      <label className="inline-flex items-center gap-2">
      <span>{t('coachIntensity')}</span>
      <select
        value={intensity}
        aria-label={t('coachIntensity')}
        onChange={(event) => onChange(event.target.value as CoachIntensity)}
        className="rounded-md border border-white/20 bg-transparent px-2 py-1 text-inherit"
      >
        {OPTIONS.map((value) => (
          <option key={value} value={value} className="text-slate-900">
            {label(value)}
          </option>
        ))}
      </select>
      </label>
      {intensity === 'ask' && onAsk && (
        <button type="button" onClick={onAsk} className="rounded bg-amber-300 px-2 py-1 text-xs font-bold text-emerald-950">
          {t('coachAskNow')}
        </button>
      )}
    </span>
  );
}
