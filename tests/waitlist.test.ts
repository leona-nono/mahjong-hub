import { describe, expect, it } from 'vitest';
import {
  isWaitlistHoneypot,
  normalizeWaitlistEmail,
  normalizeWaitlistLocale,
  normalizeWaitlistSource
} from '@/lib/waitlist';

describe('waitlist input rules', () => {
  it('accepts a trimmed lowercase email and rejects the rest', () => {
    expect(normalizeWaitlistEmail('  A@B.COM ')).toBe('a@b.com');
    expect(normalizeWaitlistEmail('not-an-email')).toBeNull();
    expect(normalizeWaitlistEmail('a@b.c')).toBeNull();
    expect(normalizeWaitlistEmail('')).toBeNull();
    expect(normalizeWaitlistEmail(`${'a'.repeat(250)}@b.co`)).toBeNull();
  });

  it('whitelists source and falls unknown locales back to en', () => {
    expect(normalizeWaitlistSource('learn-variants')).toBe('learn-variants');
    expect(normalizeWaitlistSource('kit')).toBe('kit');
    expect(normalizeWaitlistSource('home')).toBe('home');
    expect(normalizeWaitlistSource('other')).toBeNull();
    expect(normalizeWaitlistLocale('zh-TW')).toBe('zh-TW');
    expect(normalizeWaitlistLocale('fr')).toBe('en');
    expect(normalizeWaitlistLocale(undefined)).toBe('en');
  });

  it('treats a filled honeypot as a bot and a blank one as a person', () => {
    expect(isWaitlistHoneypot('')).toBe(false);
    expect(isWaitlistHoneypot('   ')).toBe(false);
    expect(isWaitlistHoneypot(undefined)).toBe(false);
    expect(isWaitlistHoneypot('http://spam.test')).toBe(true);
  });
});
