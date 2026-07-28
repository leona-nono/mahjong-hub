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
  // Core rule: earning points is gated behind login.
  // Guests keep browsing AND starting games freely; they are only prompted
  // to sign in at the moment points would be awarded.
  if (!getAuthState().user) {
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

function serverSnapshot(): PointsState {
  return { points: 0, recentAwards: [] };
}

export function usePoints() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
