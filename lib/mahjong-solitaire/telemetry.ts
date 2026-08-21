/**
 * Privacy-safe solitaire funnel telemetry (P0-E3).
 * No tile order / hand reconstruction — only funnel timings and counters.
 */

'use client';

import {
  CONSENT_STORAGE_KEY,
  detectGlobalPrivacyControl,
  parseConsent,
  shouldLoadAnalytics
} from '@/lib/consent';

export type SolitaireTelemetryEvent =
  | 'solitaire_level_enter'
  | 'solitaire_first_tile_ms'
  | 'solitaire_match'
  | 'solitaire_dead'
  | 'solitaire_clear'
  | 'solitaire_item_use'
  | 'solitaire_daily_enter'
  | 'solitaire_a11y_changed'
  | 'solitaire_pwa_install_prompt'
  | 'solitaire_pwa_installed';

function analyticsAllowed(): boolean {
  try {
    const stored = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
    if (!stored) return false;
    return shouldLoadAnalytics(stored, detectGlobalPrivacyControl(navigator));
  } catch {
    return false;
  }
}

export function trackSolitaireEvent(
  event: SolitaireTelemetryEvent,
  properties: Record<string, string | number | boolean> = {}
): void {
  if (typeof window === 'undefined') return;
  if (!analyticsAllowed()) return;
  const payload = { event, ...properties };
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) dataLayer.push(payload);
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') gtag('event', event, properties);
  window.dispatchEvent(new CustomEvent('solitaire:telemetry', { detail: payload }));
}
