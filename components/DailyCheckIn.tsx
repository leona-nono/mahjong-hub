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
    <section className="mt-10 overflow-hidden rounded-3xl rainbow-card">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📅</span>
          <h2 className="text-xl font-black rainbow-text">{t('title')}</h2>
        </div>

        <p className="mt-3 font-bold text-gray-800">
          {claimedToday
            ? t('claimedReward', { n: todayReward, day: cycleDay })
            : t('todayReward', { n: todayReward, day: cycleDay })}
        </p>

        <button
          type="button"
          onClick={claim}
          disabled={claimedToday || pending || (loggedIn && !hydrated)}
          className={`mt-4 w-full rounded-full px-6 py-3 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10 ${
            claimedToday
              ? 'bg-gray-200 text-gray-500'
              : 'rainbow-bar text-white hover:opacity-90'
          }`}
        >
          {claimedToday ? t('claimed') : t('claim')}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {claimedToday && (
          <p className="mt-3 text-sm text-gray-600">
            {t('streakLine', { days: streak, n: nextReward })}
          </p>
        )}

        <div className="mt-6 grid grid-cols-7 gap-2">
          {CHECKIN_REWARDS.map((r, i) => {
            const day = i + 1;
            const isToday = day === cycleDay;
            const isDone = claimedToday ? day <= cycleDay : day < cycleDay;
            return (
              <div
                key={day}
                className={`flex flex-col items-center rounded-xl border px-1 py-2 text-center ${
                  isToday
                    ? 'border-rainbow-pink bg-rainbow-pink/10 font-bold'
                    : isDone
                      ? 'border-gray-100 bg-white/50'
                      : 'border-gray-100 bg-white/30 opacity-60'
                }`}
              >
                <span className="text-[11px] font-bold text-gray-800">
                  {isDone ? '✅' : r}
                </span>
                <span className="mt-0.5 text-[10px] font-medium text-gray-400">
                  D{day}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <details className="group text-sm text-gray-500">
            <summary className="cursor-pointer font-medium text-rainbow-pink hover:underline">
              {t('pointsTip')}
            </summary>
            <p className="mt-1 max-w-xs text-xs text-gray-500">{t('tipBody')}</p>
          </details>
          <p className="shrink-0 text-sm text-gray-600">
            {t('yourPoints', { n: points })}
          </p>
        </div>

        {!loggedIn && <p className="mt-3 text-xs text-gray-400">{t('guestNote')}</p>}
      </div>
    </section>
  );
}
