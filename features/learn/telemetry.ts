'use client';

/** Privacy-safe learning-funnel telemetry. No email, no account id, no free text. */
export type LearnTelemetryEvent =
  | 'learn_path_open'
  | 'learn_lesson_open'
  | 'learn_lesson_step';

export type LearnTelemetryProps = Record<string, string | number | boolean>;

export function trackLearnEvent(
  event: LearnTelemetryEvent,
  properties: LearnTelemetryProps = {}
): void {
  if (typeof window === 'undefined') return;
  const payload = { event, ...properties };
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) dataLayer.push(payload);
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') gtag('event', event, properties);
  window.dispatchEvent(new CustomEvent('mahjong:telemetry', { detail: payload }));
}
