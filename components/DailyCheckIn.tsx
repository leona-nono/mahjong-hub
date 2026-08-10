'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import { usePoints, awardPoints } from '@/lib/points';

const DAILY_KEY = 'mh_daily_bonus_date';
const DAILY_AMOUNT = 20;

/**
 * Visible daily check-in card, rendered on the home page.
 *
 * Everyone can check in once per day — guests get points saved on this device
 * (login is P1), and signed-in users get the same local grant. Once a real
 * OAuth login is available the grant can move server-side via /api/points.
 */
export default function DailyCheckIn() {
  const t = useTranslations('daily');
  const { user } = useAuth();
  const { points } = usePoints();
  const [claimedToday, setClaimedToday] = useState(false);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      setClaimedToday(localStorage.getItem(DAILY_KEY) === today);
    } catch {
      /* ignore */
    }
  }, []);

  const claim = () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem(DAILY_KEY) === today) return;
      const res = awardPoints(DAILY_AMOUNT, 'daily_visit');
      // awardPoints grants locally when no real login exists; when a login is
      // configured and the guest hasn't signed in, it opens the login modal and
      // returns needLogin — don't mark the day as claimed in that case.
      if (res.needLogin) return;
      localStorage.setItem(DAILY_KEY, today);
      setClaimedToday(true);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="mt-10 overflow-hidden rounded-3xl rainbow-card">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black rainbow-text">{t('title')}</h2>
          <p className="mt-1 text-sm text-gray-600">{t('subtitle')}</p>
          <p className="mt-2 inline-block rounded-full bg-rainbow-yellow/30 px-3 py-1 text-sm font-bold text-gray-800">
            {t('reward', { n: DAILY_AMOUNT })}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-sm text-gray-600">
            {t('yourPoints', { n: points })}
          </p>
          <button
            type="button"
            onClick={claim}
            disabled={claimedToday}
            className={`rounded-full px-6 py-2.5 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
              claimedToday
                ? 'bg-gray-200 text-gray-500'
                : 'rainbow-bar text-white hover:opacity-90'
            }`}
          >
            {claimedToday ? t('claimed') : t('claim')}
          </button>
          {!user && (
            <p className="max-w-xs text-xs text-gray-400">{t('guestNote')}</p>
          )}
        </div>
      </div>
    </section>
  );
}
