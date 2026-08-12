'use client';

import { useSyncExternalStore } from 'react';
import { getAuthState, openLogin, hasGoogle, hasFacebook, hasX, hasEmail } from './auth';

interface AwardResult {
  granted: boolean;
  needLogin: boolean;
}

interface AwardEvent {
  amount: number;
  reason?: string;
  at: number;
}

interface PointsState {
  points: number;
  recentAwards: AwardEvent[];
}

const POINTS_KEY = 'mh_points';
const AWARDS_KEY = 'mh_awards';

// Module-level store (mirrors lib/auth). Survives Server Component boundaries.
let state: PointsState = { points: 0, recentAwards: [] };
const listeners = new Set<() => void>();
let initialized = false;

function emit() {
  listeners.forEach((l) => l());
}

function persist(points: number, awards: AwardEvent[]) {
  try {
    localStorage.setItem(POINTS_KEY, String(points));
    localStorage.setItem(AWARDS_KEY, JSON.stringify(awards));
  } catch {
    /* ignore */
  }
}

export function initPoints() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try {
    const p = localStorage.getItem(POINTS_KEY);
    if (p) state = { ...state, points: Number(p) || 0 };
    const a = localStorage.getItem(AWARDS_KEY);
    if (a) state = { ...state, recentAwards: JSON.parse(a) };
    emit();
  } catch {
    /* ignore */
  }
}

export function awardPoints(amount: number, reason?: string): AwardResult {
  // Earning points is gated behind login — BUT only once a real login is
  // actually available. Until an OAuth provider is configured (P1), there is
  // nothing to log into, so opening the login modal is a dead end and guests
  // lose their points. Instead we grant points on this device and let the
  // server-side auth take over the gate later.
  const loginAvailable = hasGoogle || hasFacebook || hasX || hasEmail;
  if (!getAuthState().user && loginAvailable) {
    openLogin();
    return { granted: false, needLogin: true };
  }
  const nextPoints = state.points + amount;
  const nextAwards = [{ amount, reason, at: Date.now() }, ...state.recentAwards].slice(0, 50);
  state = { ...state, points: nextPoints, recentAwards: nextAwards };
  persist(nextPoints, nextAwards);
  emit();
  return { granted: true, needLogin: false };
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

const SERVER_POINTS_STATE: PointsState = { points: 0, recentAwards: [] };

function serverSnapshot(): PointsState {
  return SERVER_POINTS_STATE;
}

export function usePoints() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
