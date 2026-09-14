'use client';

import { useCallback, useEffect, useState } from 'react';

import { getLevel } from '@/lib/mahjong-solitaire/levels';
import type { SolitaireDeal } from '@/lib/mahjong-solitaire/progress-rules';
import { utcDateString } from '@/lib/points-rules';

export type DailyHud = {
  utcDay: string;
  id: string;
  cleared: boolean;
  streak: number;
};

/**
 * Daily challenge HUD: fetch today's deal metadata and record clear/streak updates.
 * Guest streak persistence lives in submitClear (recordGuestDailyClear); this hook
 * only owns the HUD mirror of that state.
 */
export function useSolitaireDaily() {
  const [dailyHud, setDailyHud] = useState<DailyHud | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/solitaire/daily', { credentials: 'same-origin' });
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as {
            utcDay?: string;
            deal?: SolitaireDeal;
            cleared?: boolean;
            streak?: number;
          };
          if (!data.deal || cancelled) return;
          setDailyHud({
            utcDay: data.utcDay ?? utcDateString(),
            id: data.deal.id,
            cleared: !!data.cleared,
            streak: Number(data.streak) || 0
          });
          return;
        }
        const day = utcDateString();
        const local = getLevel(`daily:${day}`);
        if (local && !cancelled) {
          setDailyHud({ utcDay: day, id: local.id, cleared: false, streak: 0 });
        }
      } catch {
        const day = utcDateString();
        const local = getLevel(`daily:${day}`);
        if (local && !cancelled) {
          setDailyHud({ utcDay: day, id: local.id, cleared: false, streak: 0 });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markDailyCleared = useCallback((streak?: number) => {
    setDailyHud((d) => {
      if (!d) return d;
      if (typeof streak === 'number') {
        return { ...d, cleared: true, streak };
      }
      return { ...d, cleared: true };
    });
  }, []);

  return { dailyHud, setDailyHud, markDailyCleared };
}
