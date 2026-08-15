'use client';

/**
 * Privacy-safe gameplay telemetry. It intentionally carries no tile order,
 * account identifier or chat content; event analytics is about the funnel,
 * not about reconstructing a player's hand.
 */
export type MahjongTelemetryEvent =
  | 'mahjong_game_started'
  | 'mahjong_hand_completed'
  | 'mahjong_fullscreen'
  | 'mahjong_sound_changed'
  | 'mahjong_accessibility_changed';

export function trackMahjongEvent(event: MahjongTelemetryEvent, properties: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined') return;
  const payload = { event, ...properties };
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) dataLayer.push(payload);
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') gtag('event', event, properties);
  window.dispatchEvent(new CustomEvent('mahjong:telemetry', { detail: payload }));
}
