'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { awardPoints } from '@/lib/points';

const DAILY_KEY = 'mh_daily_bonus_date';

/**
 * Awards a daily bonus to SIGNED-IN users only.
 * Guests are never interrupted — earning points stays gated behind login,
 * so this component does nothing until the user has authenticated.
 */
export default function DailyBonus() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem(DAILY_KEY) !== today) {
        awardPoints(20, 'daily_visit');
        localStorage.setItem(DAILY_KEY, today);
      }
    } catch {
      /* ignore */
    }
  }, [user, awardPoints]);

  return null;
}
