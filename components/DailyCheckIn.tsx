'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import { setPendingCheckIn } from '@/lib/appearance';
import { usePoints, claimDailyCheckIn } from '@/lib/points';
import { CHECKIN_CYCLE_DAYS } from '@/lib/points-rules';

export default function DailyCheckIn({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('daily');
  const { status } = useSession();
  const { openLogin } = useAuth();
  const { checkIn, hydrated } = usePoints();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const loggedIn = status === 'authenticated';

  const streak = checkIn?.streak ?? 1;
  const claimedToday = checkIn?.claimedToday ?? false;
  const cycleDay = checkIn?.cycleDay ?? ((streak - 1) % CHECKIN_CYCLE_DAYS) + 1;
  const filledInCycle = claimedToday ? cycleDay : Math.max(0, cycleDay - 1);

  const claim = async () => {
    if (pending || claimedToday) return;
    if (!loggedIn) {
      setPendingCheckIn(true);
      openLogin();
      return;
    }
    setPending(true);
    setError('');
    try {
      const result = await claimDailyCheckIn();
      if (result.needLogin) return;
      if (!result.granted && !result.alreadyClaimed) {
        setError(t('claimFailed'));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-portal-border bg-portal-panel ${
        compact ? '' : 'mt-0'
      }`}
    >
      <div className={compact ? 'p-3' : 'px-4 py-3.5 sm:px-5'}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h2 className="font-display text-base font-semibold text-portal-text">
                {t('title')}
              </h2>
              <span className="text-xs font-medium text-portal-muted">
                {t('cycleProgress', { filled: filledInCycle, total: 7 })}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-portal-muted">
              {claimedToday
                ? t('streakLineShort', { days: streak })
                : t('streakLine', { days: streak })}
              {!claimedToday ? ` · ${t('achievementHint')}` : null}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void claim()}
              disabled={claimedToday || pending || (loggedIn && !hydrated)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                claimedToday
                  ? 'bg-white/10 text-portal-muted'
                  : 'bg-portal-accent text-slate-900 hover:brightness-110'
              }`}
            >
              {claimedToday ? t('claimed') : t('claim')}
            </button>
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

        <ol className="mt-3 grid grid-cols-7 gap-1.5" aria-label={t('weekAria')}>
          {Array.from({ length: CHECKIN_CYCLE_DAYS }, (_, i) => {
            const day = i + 1;
            const isToday = day === cycleDay;
            const isDone = claimedToday ? day <= cycleDay : day < cycleDay;
            return (
              <li
                key={day}
                className={`relative flex flex-col items-center rounded-lg border px-0.5 py-1.5 text-center ${
                  isToday
                    ? 'border-portal-accent/50 bg-portal-accent/10'
                    : isDone
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-portal-border bg-black/20'
                }`}
              >
                <span
                  className={`text-[10px] font-bold ${
                    isToday
                      ? 'text-portal-accent'
                      : isDone
                        ? 'text-emerald-300'
                        : 'text-portal-muted'
                  }`}
                >
                  {t('dayShort', { day })}
                </span>
                <span
                  className={`mt-0.5 text-[11px] font-bold tabular-nums ${
                    isDone ? 'text-emerald-300' : 'text-portal-text'
                  }`}
                >
                  {isDone ? t('doneMark') : t('dayShort', { day })}
                </span>
                {isToday && (
                  <span
                    className="mt-0.5 h-1 w-1 rounded-full bg-portal-accent"
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>

        {!loggedIn && (
          <p className="mt-2 text-[11px] text-portal-muted">{t('guestNote')}</p>
        )}
      </div>
    </section>
  );
}
