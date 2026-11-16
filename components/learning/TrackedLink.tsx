'use client';

import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import {
  trackLearnEvent,
  type LearnTelemetryEvent,
  type LearnTelemetryProps
} from '@/features/learn/telemetry';

/**
 * Locale-aware link plus one learning-funnel event.
 * Same `<a>` next-intl already renders; the click handler is the only addition.
 * Uses `@/i18n/navigation` so the locale prefix stays on the href.
 */
export function TrackedLink({
  href,
  event,
  properties,
  className,
  children
}: {
  href: string;
  event: LearnTelemetryEvent;
  properties?: LearnTelemetryProps;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => trackLearnEvent(event, properties)}>
      {children}
    </Link>
  );
}
