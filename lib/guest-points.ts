/**
 * Silent guest identity + local points ledger.
 * Storage lives in features/guest; this module keeps the public API stable.
 */

import {
  LEGACY_GUEST_POINTS_KEY,
  clearGuestPointsSlice,
  getGuestPoints,
  setGuestPoints,
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

export function readGuestPoints(): number {
  return getGuestPoints().total;
}

export function readGuestPointsLedger(): GuestPointsLedger {
  return getGuestPoints();
}

/** Award points to the guest ledger. Returns the new total. */
export function awardGuestPoints(amount: number, reason: string): number {
  if (typeof window === 'undefined') return 0;
  const n = Math.max(0, Math.floor(amount));
  if (!n) return getGuestPoints().total;
  ensureGuestId();
  const current = getGuestPoints();
  const next: GuestPointsLedger = {
    total: current.total + n,
    entries: [{ amount: n, reason, at: Date.now() }, ...current.entries].slice(0, 50)
  };
  setGuestPoints(next);
  return next.total;
}

export function clearGuestPoints() {
  if (typeof window === 'undefined') return;
  clearGuestPointsSlice();
}
