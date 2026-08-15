'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import { usePoints, claimDailyCheckIn } from '@/lib/points';
import { CHECKIN_REWARDS } from '@/lib/points-rules';

export default function DailyCheckIn() {
  const t = useTranslations('daily');
  const { status } = useSession();
  const { openLogin } = useAuth();
  const { points, checkIn, hydrated } = usePoints();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const loggedIn = status === 'authenticated';

  const streak = checkIn?.streak ?? 1;
  const claimedToday = checkIn?.claimedToday ?? false;
  const todayReward = checkIn?.todayReward ?? CHECKIN_REWARDS[0];
  const nextReward = checkIn?.nextReward ?? CHECKIN_REWARDS[1];
  const cycleDay = ((streak - 1) % 7) + 1;
  const filledInCycle = claimedToday ? cycleDay : Math.max(0, cycleDay - 1);

  const claim = async () => {
    if (pending || claimedToday) return;
    if (!loggedIn) {
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
    <section className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm">
      <div className="px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-bold text-gray-800">{t('title')}</h2>
              <span className="text-xs font-medium text-gray-500">
                {t('cycleProgress', { filled: filledInCycle, total: 7 })}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {claimedToday
                ? t('claimedRewardShort', { n: todayReward })
                : t('todayRewardShort', { n: todayReward })}
              {claimedToday
                ? ` · ${t('streakLineShort', { days: streak, n: nextReward })}`
                : null}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-gray-600">
              {t('yourPoints', { n: points })}
            </p>
            <button
              type="button"
              onClick={claim}
              disabled={claimedToday || pending || (loggedIn && !hydrated)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                claimedToday
                  ? 'bg-gray-100 text-gray-500'
                  : 'rainbow-bar text-white hover:opacity-90'
              }`}
            >
              {claimedToday ? t('claimed') : t('claim')}
            </button>
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <ol className="mt-3 grid grid-cols-7 gap-1.5" aria-label={t('weekAria')}>
          {CHECKIN_REWARDS.map((r, i) => {
            const day = i + 1;
            const isToday = day === cycleDay;
            const isDone = claimedToday ? day <= cycleDay : day < cycleDay;
            const isMilestone = day === 7;
            return (
              <li
                key={day}
                className={`relative flex flex-col items-center rounded-lg border px-0.5 py-1.5 text-center ${
                  isToday
                    ? 'border-rainbow-pink bg-rainbow-pink/10'
                    : isDone
                      ? 'border-emerald-200 bg-emerald-50/80'
                      : 'border-gray-100 bg-gray-50/80'
                }`}
              >
                <span
                  className={`text-[10px] font-bold ${
                    isToday
                      ? 'text-rainbow-pink'
                      : isDone
                        ? 'text-emerald-700'
                        : 'text-gray-400'
                  }`}
                >
                  {t('dayShort', { day })}
                </span>
                <span
                  className={`mt-0.5 text-[11px] font-bold tabular-nums ${
                    isDone
                      ? 'text-emerald-700'
                      : isMilestone
                        ? 'text-amber-700'
                        : 'text-gray-700'
                  }`}
                >
                  {isDone ? t('doneMark') : r}
                </span>
                {isToday && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-rainbow-pink" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>

        {!loggedIn && (
          <p className="mt-2 text-[11px] text-gray-400">{t('guestNote')}</p>
        )}
      </div>
    </section>
  );
}
