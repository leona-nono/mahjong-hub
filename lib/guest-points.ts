/**
 * Silent guest identity. Points ledger stubs kept for transitional imports.
 * Storage lives in features/guest.
 */

import {
  LEGACY_GUEST_POINTS_KEY,
  clearGuestPointsSlice,
  type GuestPointsLedger
} from '@/features/guest/guest-store';

export const GUEST_ID_KEY = 'mh.guest-id.v1';
/** @deprecated Prefer GUEST_STORE_KEY; kept for migration + tests. */
export const GUEST_POINTS_KEY = LEGACY_GUEST_POINTS_KEY;

export type { GuestPointsLedger };

export function ensureGuestId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

/** @deprecated Points currency removed. */
export function readGuestPoints(): number {
  return 0;
}

/** @deprecated Points currency removed. */
export function readGuestPointsLedger(): GuestPointsLedger {
  return { total: 0, entries: [] };
}

/** @deprecated Points currency removed — no-op. */
export function awardGuestPoints(_amount: number, _reason: string): number {
  return 0;
}

/** @deprecated Points currency removed. */
export function clearGuestPoints() {
  if (typeof window === 'undefined') return;
  clearGuestPointsSlice();
}
