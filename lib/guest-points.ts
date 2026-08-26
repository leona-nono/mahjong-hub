/**
 * Silent guest identity + local points ledger.
 * Guests earn on-device; login merges into the server ledger once.
 */

export const GUEST_ID_KEY = 'mh.guest-id.v1';
export const GUEST_POINTS_KEY = 'mh.guest-points.v1';

export type GuestPointsLedger = {
  total: number;
  entries: Array<{ amount: number; reason: string; at: number }>;
};

function emptyLedger(): GuestPointsLedger {
  return { total: 0, entries: [] };
}

function readRaw(): GuestPointsLedger {
  if (typeof window === 'undefined') return emptyLedger();
  try {
    const raw = localStorage.getItem(GUEST_POINTS_KEY);
    if (!raw) return emptyLedger();
    const parsed = JSON.parse(raw) as GuestPointsLedger;
    const total = Math.max(0, Math.floor(Number(parsed.total) || 0));
    const entries = Array.isArray(parsed.entries) ? parsed.entries.slice(0, 50) : [];
    return { total, entries };
  } catch {
    return emptyLedger();
  }
}

function writeRaw(ledger: GuestPointsLedger) {
  localStorage.setItem(GUEST_POINTS_KEY, JSON.stringify(ledger));
  window.dispatchEvent(new CustomEvent('mh-guest-points', { detail: ledger.total }));
}

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
  return readRaw().total;
}

export function readGuestPointsLedger(): GuestPointsLedger {
  return readRaw();
}

/** Award points to the guest ledger. Returns the new total. */
export function awardGuestPoints(amount: number, reason: string): number {
  if (typeof window === 'undefined') return 0;
  const n = Math.max(0, Math.floor(amount));
  if (!n) return readRaw().total;
  ensureGuestId();
  const current = readRaw();
  const next: GuestPointsLedger = {
    total: current.total + n,
    entries: [{ amount: n, reason, at: Date.now() }, ...current.entries].slice(0, 50)
  };
  writeRaw(next);
  return next.total;
}

export function clearGuestPoints() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_POINTS_KEY);
  window.dispatchEvent(new CustomEvent('mh-guest-points', { detail: 0 }));
}
