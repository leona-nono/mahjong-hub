import { describe, expect, it, beforeEach } from 'vitest';
import {
  awardGuestPoints,
  clearGuestPoints,
  ensureGuestId,
  readGuestPoints,
  GUEST_ID_KEY
} from '@/lib/guest-points';
import {
  GUEST_STORE_KEY,
  LEGACY_ITEM_LEDGER_KEY,
  LEGACY_STARTER_FLAG_KEY,
  ensureStarterPack,
  getLocalInventory
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

describe('guest identity (points currency removed)', () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it('creates a silent guest id; points stubs stay at zero', () => {
    const id = ensureGuestId();
    expect(id).toBeTruthy();
    expect(localStorage.getItem(GUEST_ID_KEY)).toBe(id);
    expect(awardGuestPoints(50, 'start_game')).toBe(0);
    expect(awardGuestPoints(300, 'solitaire_clear')).toBe(0);
    expect(readGuestPoints()).toBe(0);
    clearGuestPoints();
    expect(readGuestPoints()).toBe(0);
  });

  it('still migrates legacy item keys into the unified store', () => {
    localStorage.setItem(
      LEGACY_ITEM_LEDGER_KEY,
      JSON.stringify([{ itemType: 'hint', delta: 2, reason: 'starter', at: 1 }])
    );
    localStorage.setItem(LEGACY_STARTER_FLAG_KEY, '1');

    ensureGuestId();
    expect(getLocalInventory().hint).toBeGreaterThanOrEqual(2);
    expect(localStorage.getItem(GUEST_STORE_KEY)).toBeTruthy();
  });

  it('ensureStarterPack still grants inventory once', () => {
    ensureStarterPack();
    const inv = getLocalInventory();
    expect(inv.hint).toBeGreaterThan(0);
    ensureStarterPack();
    expect(getLocalInventory().hint).toBe(inv.hint);
  });
});
