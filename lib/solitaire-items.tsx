'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAuthState, openLogin } from '@/lib/auth';
import { hydratePointsFromServer, usePoints } from '@/lib/points';
import {
  ITEM_PRICE,
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
} from '@/lib/mahjong-solitaire/item-inventory';
import { adsEnabled } from '@/lib/flags';

export type PayChannel = 'inventory' | 'points' | 'ad';

export interface LevelAdState {
  toolAdsUsed: number;
  rescueAdsUsed: number;
}

const freshAds = (): LevelAdState => ({ toolAdsUsed: 0, rescueAdsUsed: 0 });

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
  const { points } = usePoints();
  const [inventory, setInventory] = useState<ItemInventory>(emptyInventory);
  const [progress, setProgress] = useState<SolitaireProgress>({
    lessonsCleared: 0,
    seenDeadEnd: false
  });
  const [ads, setAds] = useState<LevelAdState>(freshAds);
  const [hydrated, setHydrated] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const local = ensureStarterPack();
    setProgress(readProgress());
    if (getAuthState().user) {
      const server = await fetchServerInventory();
      setInventory(server ?? local);
    } else {
      setInventory(getLocalInventory());
    }
    setHydrated(true);
  }, []);

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
   * Priority: inventory → (caller may offer points/ad UI).
   * Returns which channel was used, or null if blocked.
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

      if (channel === 'points') {
        if (!getAuthState().user) {
          openLogin();
          return { ok: false, reason: 'need_login' };
        }
        const price = ITEM_PRICE[itemType];
        if (points < price) {
          setMsg(`Need ${price} points`);
          return { ok: false, reason: 'insufficient_points' };
        }
        // Buy 1 into inventory then consume immediately (net: -price, effect once)
        const buy = await fetch('/api/solitaire/item', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'buy', itemType })
        });
        const buyData = (await buy.json().catch(() => ({}))) as {
          error?: string;
          inventory?: ItemInventory;
          points?: number;
        };
        if (!buy.ok) {
          setMsg(buyData.error ?? 'purchase failed');
          return { ok: false, reason: buyData.error ?? 'buy_failed' };
        }
        if (buyData.inventory) setInventory(buyData.inventory);
        await hydratePointsFromServer();

        const use = await fetch('/api/solitaire/item', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'consume', itemType })
        });
        if (use.ok) {
          const useData = (await use.json()) as { inventory?: ItemInventory };
          if (useData.inventory) setInventory(useData.inventory);
        }
        return { ok: true };
      }

      // ad — requires a verified S2S grant from /api/reward/verify.
      if (!adsEnabled()) {
        return { ok: false, reason: 'ads_unavailable' };
      }
      return { ok: false, reason: 'grant_required' };
    },
    [ads, inventory, points]
  );

  return {
    inventory,
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
    prices: ITEM_PRICE
  };
}
