'use client';

import { useSyncExternalStore } from 'react';
import { getAuthState, openLogin } from './auth';
import { FIRST_LOGIN_BONUS } from './points-rules';

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

export interface LedgerEntry {
  amount: number;
  reason: string;
  createdAt: string;
}

interface PointsState {
  points: number;
  recentAwards: AwardEvent[];
  checkIn: CheckInState | null;
  ledger: LedgerEntry[];
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
  ledger: [],
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
      setState({ points: 0, checkIn: null, ledger: [], hydrated: true });
      return;
    }
    if (!res.ok) {
      setState({ hydrated: true });
      return;
    }
    const data = (await res.json()) as {
      total?: number;
      checkIn?: CheckInState;
      firstLoginGranted?: boolean;
      ledger?: LedgerEntry[];
    };
    const ledger = Array.isArray(data.ledger) ? data.ledger : state.ledger;
    const nextAwards =
      data.firstLoginGranted
        ? [
            { amount: FIRST_LOGIN_BONUS, reason: 'first_login', at: Date.now() },
            ...state.recentAwards
          ].slice(0, 50)
        : state.recentAwards;
    setState({
      points: Number(data.total) || 0,
      checkIn: data.checkIn ?? DEFAULT_CHECKIN,
      ledger,
      recentAwards: nextAwards,
      hydrated: true
    });
  } catch {
    setState({ hydrated: true });
  }
}

export function applyLedgerTotal(
  total: number,
  award?: { amount: number; reason: string }
) {
  const nextAwards =
    award && award.amount > 0
      ? [{ amount: award.amount, reason: award.reason, at: Date.now() }, ...state.recentAwards].slice(
          0,
          50
        )
      : state.recentAwards;
  setState({ points: total, recentAwards: nextAwards });
}

export function resetPointsForGuest() {
  setState({
    points: 0,
    recentAwards: [],
    checkIn: null,
    ledger: [],
    hydrated: true
  });
}

export async function awardPoints(
  amount: number,
  reason: 'start_game',
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
        recentAwards: nextAwards,
        ledger:
          data.granted && data.amount
            ? [
                {
                  amount: data.amount,
                  reason: 'daily_checkin',
                  createdAt: new Date().toISOString()
                },
                ...state.ledger
              ].slice(0, 20)
            : state.ledger
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
  ledger: [],
  hydrated: false
};

function serverSnapshot(): PointsState {
  return SERVER_POINTS_STATE;
}

export function usePoints() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
