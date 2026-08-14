'use client';

import { useSyncExternalStore } from 'react';
import { getAuthState, openLogin } from './auth';

interface AwardResult {
  granted: boolean;
  needLogin: boolean;
}

interface AwardEvent {
  amount: number;
  reason?: string;
  at: number;
}

export interface CheckInState {
  claimedToday: boolean;
  streak: number;
  todayReward: number;
  nextReward: number;
}

interface PointsState {
  points: number;
  recentAwards: AwardEvent[];
  checkIn: CheckInState | null;
  hydrated: boolean;
}

const DEFAULT_CHECKIN: CheckInState = {
  claimedToday: false,
  streak: 1,
  todayReward: 50,
  nextReward: 80
};

let state: PointsState = {
  points: 0,
  recentAwards: [],
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
  // Balance lives on the server after login. Guests see 0 until they sign in.
}

export async function hydratePointsFromServer(): Promise<void> {
  try {
    const res = await fetch('/api/points', { credentials: 'same-origin' });
    if (res.status === 401) {
      setState({ points: 0, checkIn: null, hydrated: true });
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as {
      total?: number;
      checkIn?: CheckInState;
    };
    setState({
      points: Number(data.total) || 0,
      checkIn: data.checkIn ?? DEFAULT_CHECKIN,
      hydrated: true
    });
  } catch {
    /* keep last known */
  }
}

export function resetPointsForGuest() {
  setState({
    points: 0,
    recentAwards: [],
    checkIn: null,
    hydrated: true
  });
}

export async function awardPoints(
  amount: number,
  reason: 'start_game' | 'game_win',
  gameSlug?: string
): Promise<AwardResult> {
  if (!getAuthState().user) {
    openLogin();
    return { granted: false, needLogin: true };
  }

  try {
    const res = await fetch('/api/points', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason, gameSlug })
    });
    if (res.status === 401) {
      openLogin();
      return { granted: false, needLogin: true };
    }
    const data = (await res.json()) as { total?: number; granted?: boolean };
    if (typeof data.total === 'number') {
      const nextAwards = data.granted
        ? [{ amount, reason, at: Date.now() }, ...state.recentAwards].slice(0, 50)
        : state.recentAwards;
      setState({ points: data.total, recentAwards: nextAwards });
    }
    return { granted: !!data.granted, needLogin: false };
  } catch {
    return { granted: false, needLogin: false };
  }
}

export async function claimDailyCheckIn(): Promise<
  AwardResult & { alreadyClaimed?: boolean; error?: string }
> {
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
      total?: number;
      amount?: number;
      checkIn?: CheckInState;
      error?: string;
    };
    if (!res.ok) {
      return {
        granted: false,
        needLogin: false,
        error: data.error ?? 'unavailable'
      };
    }
    if (typeof data.total === 'number') {
      const nextAwards =
        data.granted && data.amount
          ? [
              { amount: data.amount, reason: 'daily_checkin', at: Date.now() },
              ...state.recentAwards
            ].slice(0, 50)
          : state.recentAwards;
      setState({
        points: data.total,
        checkIn: data.checkIn ?? state.checkIn,
        recentAwards: nextAwards
      });
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
  points: 0,
  recentAwards: [],
  checkIn: null,
  hydrated: false
};

function serverSnapshot(): PointsState {
  return SERVER_POINTS_STATE;
}

export function usePoints() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
