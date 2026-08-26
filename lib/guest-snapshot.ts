'use client';

import { getLocalInventory, readProgress } from '@/lib/mahjong-solitaire/item-inventory';
import { readGuestDaily } from '@/lib/mahjong-solitaire/daily-local';
import { clearGuestPoints, readGuestPoints } from '@/lib/guest-points';

const MERGED_KEY = 'mh.guest-merged.v1';

export async function mergeGuestProgressOnLogin(): Promise<void> {
  try {
    if (sessionStorage.getItem(MERGED_KEY) === '1') return;
    const guestPoints = readGuestPoints();
    const res = await fetch('/api/account/merge', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inventory: getLocalInventory(),
        daily: readGuestDaily(),
        progress: readProgress(),
        points: guestPoints
      })
    });
    if (res.ok) {
      sessionStorage.setItem(MERGED_KEY, '1');
      if (guestPoints > 0) clearGuestPoints();
    } else if (res.status === 401) {
      sessionStorage.setItem(MERGED_KEY, '1');
    }
  } catch {
    /* offline: try again next hydrate */
  }
}

export function clearGuestMergeFlag() {
  try {
    sessionStorage.removeItem(MERGED_KEY);
  } catch {
    /* ignore */
  }
}
