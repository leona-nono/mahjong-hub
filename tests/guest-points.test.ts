import { describe, expect, it, beforeEach } from 'vitest';
import {
  awardGuestPoints,
  clearGuestPoints,
  ensureGuestId,
  readGuestPoints,
  GUEST_ID_KEY,
  GUEST_POINTS_KEY
} from '@/lib/guest-points';
import {
  GUEST_STORE_KEY,
  LEGACY_GUEST_POINTS_KEY,
  LEGACY_DAILY_KEY,
  LEGACY_ITEM_LEDGER_KEY,
  LEGACY_PROGRESS_KEY,
  LEGACY_STARTER_FLAG_KEY,
  ensureStarterPack,
  getLocalInventory,
  readGuestDaily,
  readGuestStore,
  readProgress
} from '@/features/guest/guest-store';

function installMemoryStorage() {
  const store = new Map<string, string>();
  const memory = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear()
  };
  Object.defineProperty(globalThis, 'localStorage', { value: memory, configurable: true });
  Object.defineProperty(globalThis, 'window', {
    value: {
      localStorage: memory,
      dispatchEvent: () => true
    },
    configurable: true
  });
}

describe('guest points localStorage', () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it('creates a silent guest id and accumulates points', () => {
    const id = ensureGuestId();
    expect(id).toBeTruthy();
    expect(localStorage.getItem(GUEST_ID_KEY)).toBe(id);
    expect(awardGuestPoints(50, 'start_game')).toBe(50);
    expect(awardGuestPoints(300, 'solitaire_clear')).toBe(350);
    expect(readGuestPoints()).toBe(350);
    clearGuestPoints();
    expect(readGuestPoints()).toBe(0);
    expect(localStorage.getItem(GUEST_POINTS_KEY)).toBeNull();
  });

  it('writes the versioned guest store key', () => {
    awardGuestPoints(10, 'start_game');
    const raw = localStorage.getItem(GUEST_STORE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as { version: number; points: { total: number } };
    expect(parsed.version).toBe(1);
    expect(parsed.points.total).toBe(10);
  });

  it('migrates legacy keys into the unified store once', () => {
    localStorage.setItem(
      LEGACY_GUEST_POINTS_KEY,
      JSON.stringify({ total: 120, entries: [{ amount: 120, reason: 'start_game', at: 1 }] })
    );
    localStorage.setItem(
      LEGACY_ITEM_LEDGER_KEY,
      JSON.stringify([{ itemType: 'hint', delta: 2, reason: 'starter', at: 1 }])
    );
    localStorage.setItem(LEGACY_STARTER_FLAG_KEY, '1');
    localStorage.setItem(
      LEGACY_PROGRESS_KEY,
      JSON.stringify({ lessonsCleared: 3, seenDeadEnd: true })
    );
    localStorage.setItem(
      LEGACY_DAILY_KEY,
      JSON.stringify({ lastClearDate: '2026-09-10', streak: 4, freezeWeekKey: null })
    );

    const store = readGuestStore();
    expect(store.points.total).toBe(120);
    expect(getLocalInventory().hint).toBe(2);
    expect(readProgress()).toEqual({ lessonsCleared: 3, seenDeadEnd: true });
    expect(readGuestDaily()).toMatchObject({ lastClearDate: '2026-09-10', streak: 4 });
    expect(localStorage.getItem(LEGACY_GUEST_POINTS_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_ITEM_LEDGER_KEY)).toBeNull();
    expect(localStorage.getItem(GUEST_STORE_KEY)).toBeTruthy();

    // Starter already granted via legacy flag — do not double-grant
    ensureStarterPack();
    expect(getLocalInventory().hint).toBe(2);
  });
});
