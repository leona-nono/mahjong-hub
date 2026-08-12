'use client';

import { useSyncExternalStore } from 'react';

export type SocialProvider = 'google' | 'facebook' | 'x' | 'authjs';

export interface LoginRecord {
  provider: SocialProvider;
  at: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: SocialProvider;
}

interface AuthState {
  user: User | null;
  loginHistory: LoginRecord[];
  loginModalOpen: boolean;
}

const USER_KEY = 'mh_user';
const HISTORY_KEY = 'mh_login_history';

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  x: 'X',
  authjs: 'OAuth'
};

// ── Env-gated flags ───────────────────────────────────────────────────────
// NEXT_PUBLIC_* are inlined at build time, so these are safe in a client
// component. When a provider's client id is absent we fall back to the mock
// login() so the site still runs locally without real OAuth credentials.
export const hasGoogle = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export const hasFacebook = !!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
export const hasX = !!process.env.NEXT_PUBLIC_X_CLIENT_ID;
/** Email magic-link login (server env is AUTH_EMAIL_SERVER/FROM). */
export const hasEmail = !!process.env.NEXT_PUBLIC_EMAIL_ENABLED;

// Module-level store (no React Context) so client components can read auth
// from anywhere — even across Server Component boundaries (App Router SSG).
let state: AuthState = { user: null, loginHistory: [], loginModalOpen: false };
const listeners = new Set<() => void>();
let initialized = false;

function emit() {
  listeners.forEach((l) => l());
}

function persist(user: User | null, history: LoginRecord[]) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

export function getAuthState(): AuthState {
  return state;
}

export function initAuth() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try {
    const u = localStorage.getItem(USER_KEY);
    if (u) state = { ...state, user: JSON.parse(u) };
    const h = localStorage.getItem(HISTORY_KEY);
    if (h) state = { ...state, loginHistory: JSON.parse(h) };
    emit();
  } catch {
    /* ignore */
  }
}

/**
 * Writes a *verified* user (returned by a real OAuth provider) into the store
 * and records the login. Used by the real login flows in LoginModal / the X
 * callback handler. Guests are never routed here.
 */
export function loginWithUser(user: User) {
  const record: LoginRecord = { provider: user.provider, at: Date.now() };
  const next = [record, ...state.loginHistory].slice(0, 20);
  state = { ...state, user, loginHistory: next, loginModalOpen: false };
  persist(user, next);
  emit();
}
/**
 * Mirrors an authoritative Auth.js session into the legacy client store.
 * This temporary bridge keeps the local points UI working until it moves to
 * /api/points; the server-side Auth.js session remains the source of truth.
 */
export function syncSessionUser(user: User) {
  const unchanged =
    state.user?.provider === 'authjs' &&
    state.user.id === user.id &&
    state.user.name === user.name &&
    state.user.email === user.email &&
    state.user.avatar === user.avatar;
  if (unchanged && !state.loginModalOpen) return;
  state = { ...state, user, loginModalOpen: false };
  persist(user, state.loginHistory);
  emit();
}

export function clearSessionUser() {
  if (state.user?.provider !== 'authjs') return;
  state = { ...state, user: null, loginModalOpen: false };
  persist(null, state.loginHistory);
  emit();
}

/**
 * Mock login — only used when the matching provider's client id env var is
 * missing (e.g. local dev without credentials). Keeps the full UX working.
 * Replace with real OAuth in production (see LoginModal.tsx / X route).
 */
export async function login(provider: SocialProvider) {
  const mockUser: User = {
    id: `${provider}-${Date.now()}`,
    name: `${PROVIDER_LABEL[provider]} User`,
    email: `demo@${provider}.example`,
    provider
  };
  loginWithUser(mockUser);
}

export function logout() {
  state = { ...state, user: null, loginModalOpen: false };
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function openLogin() {
  state = { ...state, loginModalOpen: true };
  emit();
}

export function closeLogin() {
  state = { ...state, loginModalOpen: false };
  emit();
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

const SERVER_AUTH_STATE: AuthState = {
  user: null,
  loginHistory: [],
  loginModalOpen: false
};

function serverSnapshot(): AuthState {
  return SERVER_AUTH_STATE;
}

export function useAuth() {
  const s = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return { ...s, login, loginWithUser, logout, openLogin, closeLogin };
}
