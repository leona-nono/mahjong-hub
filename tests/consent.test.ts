import { describe, expect, it } from 'vitest';
import {
  CONSENT_VERSION,
  acceptAll,
  customizeConsent,
  detectGlobalPrivacyControl,
  hasDecided,
  parseConsent,
  rejectNonEssential,
  shouldLoadAdvertising,
  shouldLoadAnalytics,
  withPrivacySignals
} from '@/lib/consent';

describe('consent', () => {
  it('parses a valid stored choice', () => {
    const raw = JSON.stringify(acceptAll(1_700_000_000_000));
    const parsed = parseConsent(raw);
    expect(parsed?.version).toBe(CONSENT_VERSION);
    expect(parsed?.analytics).toBe(true);
    expect(hasDecided(parsed)).toBe(true);
  });

  it('rejects malformed json', () => {
    expect(parseConsent('{')).toBeNull();
    expect(parseConsent('{"version":0}')).toBeNull();
  });

  it('keeps analytics off until an explicit decision', () => {
    expect(shouldLoadAnalytics(withPrivacySignals(null, false), false)).toBe(false);
    expect(shouldLoadAnalytics(rejectNonEssential(10), false)).toBe(false);
    expect(shouldLoadAnalytics(acceptAll(10), false)).toBe(true);
  });

  it('honors GPC as opt-out when the visitor has not decided', () => {
    const undecided = withPrivacySignals(null, true);
    expect(undecided.analytics).toBe(false);
    expect(shouldLoadAnalytics(undecided, true)).toBe(false);
    expect(detectGlobalPrivacyControl({ globalPrivacyControl: true })).toBe(true);
  });

  it('does not enable advertising from analytics-only customize', () => {
    const state = customizeConsent({ analytics: true, advertising: false }, 5);
    expect(shouldLoadAnalytics(state, false)).toBe(true);
    expect(shouldLoadAdvertising(state, false)).toBe(false);
  });
});
