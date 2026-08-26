import { describe, expect, it, beforeEach } from 'vitest';
import {
  awardGuestPoints,
  clearGuestPoints,
  ensureGuestId,
  readGuestPoints,
  GUEST_ID_KEY,
  GUEST_POINTS_KEY
} from '@/lib/guest-points';

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
});
