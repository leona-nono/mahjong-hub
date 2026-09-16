'use client';

import { useSyncExternalStore } from 'react';
import { APPEARANCES, markLocalOwned, type AppearanceId } from './appearance';
import { getAuthState, openLogin } from './auth';

interface ClaimResult {
  granted: boolean;
  needLogin: boolean;
  alreadyClaimed?: boolean;
  error?: string;
}

export interface CheckInState {
  claimedToday: boolean;
  streak: number;
  cycleDay: number;
}

interface PointsState {
  checkIn: CheckInState | null;
  hydrated: boolean;
}

const DEFAULT_CHECKIN: CheckInState = {
  claimedToday: false,
  streak: 1,
  cycleDay: 1
};

let state: PointsState = {
  checkIn: null,
  hydrated: false
};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: Partial<PointsState>) {
  state = { ...state, ...next };
  emit();
}

export function initPoints() {
  if (typeof window === 'undefined') return;
  if (!getAuthState().user) {
    setState({ hydrated: true });
  }
}

export async function hydratePointsFromServer(): Promise<void> {
  try {
    const res = await fetch('/api/points', { credentials: 'same-origin' });
    if (res.status === 401) {
      setState({ checkIn: null, hydrated: true });
      return;
    }
    if (!res.ok) {
      setState({ hydrated: true });
      return;
    }
    const data = (await res.json()) as { checkIn?: CheckInState; streak?: number };
    setState({
      checkIn: data.checkIn ?? DEFAULT_CHECKIN,
      hydrated: true
    });
  } catch {
    setState({ hydrated: true });
  }
}

/** @deprecated No currency balance — kept as no-op for transitional call sites. */
export function applyLedgerTotal(_total: number, _award?: { amount: number; reason: string }) {
  /* no-op */
}

export function resetPointsForGuest() {
  setState({
    checkIn: null,
    hydrated: true
  });
}

export async function claimDailyCheckIn(): Promise<ClaimResult> {
  try {
    const res = await fetch('/api/points/check-in', {
      method: 'POST',
      credentials: 'same-origin'
    });
    if (res.status === 401) {
      openLogin();
      return { granted: false, needLogin: true, error: 'unauthorized' };
    }
    const data = (await res.json()) as {
      granted?: boolean;
      alreadyClaimed?: boolean;
      checkIn?: CheckInState;
      error?: string;
      cosmetics?: { unlocked?: string[] };
    };
    if (!res.ok) {
      return {
        granted: false,
        needLogin: false,
        error: data.error ?? 'unavailable'
      };
    }
    if (data.checkIn) {
      setState({ checkIn: data.checkIn });
    }
    if (data.cosmetics?.unlocked?.length) {
      for (const id of data.cosmetics.unlocked) {
        if (id in APPEARANCES) markLocalOwned(id as AppearanceId);
      }
    }
    return {
      granted: !!data.granted,
      needLogin: false,
      alreadyClaimed: !!data.alreadyClaimed
    };
  } catch {
    return { granted: false, needLogin: false, error: 'unavailable' };
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function snapshot() {
  return state;
}

const SERVER_POINTS_STATE: PointsState = {
  checkIn: null,
  hydrated: false
};

function serverSnapshot(): PointsState {
  return SERVER_POINTS_STATE;
}

/** Check-in / streak store (name kept for fewer call-site renames). */
export function usePoints() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
