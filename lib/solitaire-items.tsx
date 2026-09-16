'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAuthState } from '@/lib/auth';
import {
  ITEM_DAILY_FREE,
  ITEM_TYPES,
  emptyInventory,
  type ItemInventory,
  type ItemType
} from '@/lib/mahjong-solitaire/items';
import {
  appendLocalItem,
  ensureStarterPack,
  getLocalInventory,
  readProgress,
  writeProgress,
  type SolitaireProgress
} from '@/features/guest/guest-store';
import { adsEnabled } from '@/lib/flags';
import { utcDateString } from '@/lib/points-rules';

export type PayChannel = 'inventory' | 'daily_free' | 'ad';

export interface LevelAdState {
  toolAdsUsed: number;
  rescueAdsUsed: number;
}

const DAILY_FREE_KEY = 'mh.solitaire-daily-free.v1';

type DailyFreeState = { utcDate: string; used: ItemInventory };

const freshAds = (): LevelAdState => ({ toolAdsUsed: 0, rescueAdsUsed: 0 });

function loadDailyFreeState(): DailyFreeState {
  const today = utcDateString();
  if (typeof window === 'undefined') {
    return { utcDate: today, used: emptyInventory() };
  }
  try {
    const raw = localStorage.getItem(DAILY_FREE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyFreeState;
      if (parsed?.utcDate === today && parsed.used) {
        return {
          utcDate: today,
          used: { ...emptyInventory(), ...parsed.used }
        };
      }
    }
  } catch {
    /* reset */
  }
  return { utcDate: today, used: emptyInventory() };
}

function saveDailyFreeState(state: DailyFreeState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DAILY_FREE_KEY, JSON.stringify(state));
}

function dailyFreeLeftFrom(used: ItemInventory): ItemInventory {
  const left = emptyInventory();
  for (const type of ITEM_TYPES) {
    left[type] = Math.max(0, ITEM_DAILY_FREE[type] - (used[type] ?? 0));
  }
  return left;
}

async function fetchServerInventory(): Promise<ItemInventory | null> {
  try {
    const res = await fetch('/api/solitaire/item', { credentials: 'same-origin' });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const data = (await res.json()) as { inventory?: ItemInventory };
    return data.inventory ?? null;
  } catch {
    return null;
  }
}

export function useSolitaireItems() {
  const [inventory, setInventory] = useState<ItemInventory>(emptyInventory);
  const [dailyFreeLeft, setDailyFreeLeft] = useState<ItemInventory>(() =>
    dailyFreeLeftFrom(emptyInventory())
  );
  const [progress, setProgress] = useState<SolitaireProgress>({
    lessonsCleared: 0,
    seenDeadEnd: false
  });
  const [ads, setAds] = useState<LevelAdState>(freshAds);
  const [hydrated, setHydrated] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const syncDailyFree = useCallback(() => {
    const state = loadDailyFreeState();
    setDailyFreeLeft(dailyFreeLeftFrom(state.used));
  }, []);

  const refresh = useCallback(async () => {
    const local = ensureStarterPack();
    setProgress(readProgress());
    syncDailyFree();
    if (getAuthState().user) {
      const server = await fetchServerInventory();
      setInventory(server ?? local);
    } else {
      setInventory(getLocalInventory());
    }
    setHydrated(true);
  }, [syncDailyFree]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resetLevelAds = useCallback(() => setAds(freshAds()), []);

  const markDeadSeen = useCallback(() => {
    writeProgress({ seenDeadEnd: true });
    setProgress(readProgress());
  }, []);

  const markLessonCleared = useCallback((order: number) => {
    writeProgress({ lessonsCleared: order });
    setProgress(readProgress());
  }, []);

  /**
   * Spend one use of an item.
   * Priority at call sites: inventory → daily_free → ad.
   */
  const tryConsume = useCallback(
    async (
      itemType: ItemType,
      channel: PayChannel
    ): Promise<{ ok: boolean; reason?: string }> => {
      setMsg(null);

      if (channel === 'inventory') {
        if ((inventory[itemType] ?? 0) < 1) {
          return { ok: false, reason: 'empty' };
        }
        if (getAuthState().user) {
          const res = await fetch('/api/solitaire/item', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'consume', itemType })
          });
          if (res.ok) {
            const data = (await res.json()) as { inventory?: ItemInventory };
            if (data.inventory) setInventory(data.inventory);
            return { ok: true };
          }
          // fall through to local if API unavailable
        }
        const next = appendLocalItem(itemType, -1, 'consume');
        if (!next) return { ok: false, reason: 'empty' };
        setInventory(next);
        return { ok: true };
      }

      if (channel === 'daily_free') {
        const state = loadDailyFreeState();
        const used = state.used[itemType] ?? 0;
        if (used >= ITEM_DAILY_FREE[itemType]) {
          return { ok: false, reason: 'daily_free_exhausted' };
        }
        state.used[itemType] = used + 1;
        saveDailyFreeState(state);
        setDailyFreeLeft(dailyFreeLeftFrom(state.used));
        return { ok: true };
      }

      // ad — requires a verified S2S grant from /api/reward/verify.
      if (!adsEnabled()) {
        return { ok: false, reason: 'ads_unavailable' };
      }
      return { ok: false, reason: 'grant_required' };
    },
    [inventory]
  );

  return {
    inventory,
    dailyFreeLeft,
    progress,
    ads,
    hydrated,
    msg,
    setMsg,
    refresh,
    resetLevelAds,
    markDeadSeen,
    markLessonCleared,
    tryConsume,
    dailyFree: ITEM_DAILY_FREE
  };
}
