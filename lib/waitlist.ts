export const WAITLIST_SOURCES = ['learn-variants', 'kit', 'home'] as const;
export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];

export const WAITLIST_LOCALES = ['en', 'zh', 'zh-TW'] as const;
export type WaitlistLocale = (typeof WAITLIST_LOCALES)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trimmed, lowercased email, or null when it fails the public rule. */
export function normalizeWaitlistEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

export function normalizeWaitlistSource(raw: unknown): WaitlistSource | null {
  if (typeof raw !== 'string') return null;
  return (WAITLIST_SOURCES as readonly string[]).includes(raw) ? (raw as WaitlistSource) : null;
}

/** Unknown locales fall back to English. They are not an error. */
export function normalizeWaitlistLocale(raw: unknown): WaitlistLocale {
  if (typeof raw === 'string' && (WAITLIST_LOCALES as readonly string[]).includes(raw)) {
    return raw as WaitlistLocale;
  }
  return 'en';
}

/** A non-empty honeypot means the submit is discarded. Missing or blank is a person. */
export function isWaitlistHoneypot(website: unknown): boolean {
  if (website == null) return false;
  if (typeof website === 'string') return website.trim().length > 0;
  return true;
}
