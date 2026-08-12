'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import { usePoints, awardPoints } from '@/lib/points';

/** 7-day weekly cycle rewards (repeats every week). */
const REWARDS = [50, 80, 120, 100, 150, 200, 300];
const DATE_KEY = 'mh_checkin_date';
const STREAK_KEY = 'mh_checkin_streak';

function dateStr(offsetDays = 0) {
  return new Date(Date.now() + offsetDays * 86400000)
    .toISOString()
    .slice(0, 10);
}

/**
 * Daily check-in with a 7-day streak cycle (50/80/120/100/150/200/300).
 * Runs client-side until the server-side points ledger lands (P0-1); guests
 * earn locally, and the streak lives in localStorage per browser.
 */
export default function DailyCheckIn() {
  const t = useTranslations('daily');
  const { user } = useAuth();
  const { points } = usePoints();
  const [streak, setStreak] = useState(1);
  const [claimedToday, setClaimedToday] = useState(false);

  useEffect(() => {
    try {
      const last = localStorage.getItem(DATE_KEY);
      const s = Number(localStorage.getItem(STREAK_KEY)) || 1;
      if (last === dateStr()) setClaimedToday(true);
      setStreak(Math.max(1, s));
    } catch {
      /* ignore */
    }
  }, []);

  const cycleDay = ((streak - 1) % 7) + 1; // 1..7 within the weekly cycle
  const todayReward = REWARDS[cycleDay - 1];
  const nextReward = REWARDS[cycleDay % 7]; // wraps Day7 -> Day1

  const claim = () => {
    try {
      if (localStorage.getItem(DATE_KEY) === dateStr()) return;
      const prevStreak = Number(localStorage.getItem(STREAK_KEY)) || 0;
      const newStreak = localStorage.getItem(DATE_KEY) === dateStr(-1)
        ? prevStreak + 1
        : 1;
      const reward = REWARDS[(newStreak - 1) % 7];
      const res = awardPoints(reward, 'daily_checkin');
      if (res.needLogin) return; // real login gate opens the modal; don't claim yet
      localStorage.setItem(DATE_KEY, dateStr());
      localStorage.setItem(STREAK_KEY, String(newStreak));
      setStreak(newStreak);
      setClaimedToday(true);
    } catch {
      /* ignore */
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
          disabled={claimedToday}
          className={`mt-4 w-full rounded-full px-6 py-3 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10 ${
            claimedToday
              ? 'bg-gray-200 text-gray-500'
              : 'rainbow-bar text-white hover:opacity-90'
          }`}
        >
          {claimedToday ? t('claimed') : t('claim')}
        </button>

        {claimedToday && (
          <p className="mt-3 text-sm text-gray-600">
            {t('streakLine', { days: streak, n: nextReward })}
          </p>
        )}

        {/* 7-day cycle row */}
        <div className="mt-6 grid grid-cols-7 gap-2">
          {REWARDS.map((r, i) => {
            const day = i + 1;
            const isToday = day === cycleDay;
            const isDone = !isToday && day < cycleDay;
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

        {!user && <p className="mt-3 text-xs text-gray-400">{t('guestNote')}</p>}
      </div>
    </section>
  );
}
