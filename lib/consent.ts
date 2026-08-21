/**
 * First-party consent (GDPR/CCPA). Necessary storage is always on.
 * Analytics and advertising stay off until the visitor opts in.
 */

export const CONSENT_STORAGE_KEY = 'mh.consent.v1';
export const CONSENT_VERSION = 1;
export const CONSENT_CHANGED_EVENT = 'mh:consent';
export const CONSENT_OPEN_EVENT = 'mh:consent-open';

export type ConsentCategory = 'necessary' | 'analytics' | 'advertising';

export type ConsentState = {
  version: number;
  decidedAt: number;
  analytics: boolean;
  advertising: boolean;
};

export const DEFAULT_CONSENT: ConsentState = {
  version: CONSENT_VERSION,
  decidedAt: 0,
  analytics: false,
  advertising: false
};

export function isConsentState(value: unknown): value is ConsentState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === CONSENT_VERSION &&
    typeof v.decidedAt === 'number' &&
    typeof v.analytics === 'boolean' &&
    typeof v.advertising === 'boolean'
  );
}

export function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isConsentState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function hasDecided(state: ConsentState | null): boolean {
  return !!state && state.decidedAt > 0;
}

/** Sec-GPC / navigator.globalPrivacyControl — treat as opt-out of share/sale. */
export function detectGlobalPrivacyControl(nav?: object | null): boolean {
  if (!nav || !('globalPrivacyControl' in nav)) return false;
  return (nav as { globalPrivacyControl?: unknown }).globalPrivacyControl === true;
}

export function withPrivacySignals(
  stored: ConsentState | null,
  gpc: boolean
): ConsentState {
  if (!stored) {
    return {
      ...DEFAULT_CONSENT,
      analytics: false,
      advertising: false
    };
  }
  if (!gpc) return stored;
  // GPC blocks sale/share. An explicit later opt-in (decidedAt set, analytics true)
  // is allowed; unsigned GPC visitors stay opted out.
  if (!hasDecided(stored)) {
    return { ...stored, analytics: false, advertising: false };
  }
  return stored;
}

export function shouldLoadAnalytics(state: ConsentState, gpc: boolean): boolean {
  return withPrivacySignals(state, gpc).analytics === true && hasDecided(state);
}

export function shouldLoadAdvertising(state: ConsentState, gpc: boolean): boolean {
  return withPrivacySignals(state, gpc).advertising === true && hasDecided(state);
}

export function acceptAll(now = Date.now()): ConsentState {
  return {
    version: CONSENT_VERSION,
    decidedAt: now,
    analytics: true,
    advertising: true
  };
}

export function rejectNonEssential(now = Date.now()): ConsentState {
  return {
    version: CONSENT_VERSION,
    decidedAt: now,
    analytics: false,
    advertising: false
  };
}

export function customizeConsent(
  choices: { analytics: boolean; advertising: boolean },
  now = Date.now()
): ConsentState {
  return {
    version: CONSENT_VERSION,
    decidedAt: now,
    analytics: choices.analytics,
    advertising: choices.advertising
  };
}

export function openConsentManager() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
