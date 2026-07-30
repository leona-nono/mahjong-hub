import { describe, expect, it } from 'vitest';
import {
  ALL_LOCALES,
  FEATURE_LOCALES,
  GAME_CATEGORIES,
  MAX_ANSWER,
  MAX_FEATURE_CONTENT,
  MAX_KEY,
  MAX_LOCALE,
  MAX_QUESTION,
  MAX_SLUG,
  MAX_TITLE,
  MAX_URL,
  MAX_VALUE,
  SETTINGS_KEYS,
  SLUG_RE,
  validateBool,
  validateEnum,
  validateInt,
  validateRequiredEnum,
  validateSlug,
  validateString,
  validateTags
} from '@/lib/admin-validators';

// ── slug ──────────────────────────────────────────────────────────────

describe('validateSlug', () => {
  it('accepts a typical lowercase-hyphen slug', () => {
    expect(validateSlug('aloha-mahjong')).toBeNull();
    expect(validateSlug('a1')).toBeNull();
    expect(validateSlug('a'.repeat(2))).toBeNull();
  });
  it('rejects empty / non-string', () => {
    expect(validateSlug('').status).toBe(400);
    expect(validateSlug(undefined).status).toBe(400);
    expect(validateSlug(123 as any).status).toBe(400);
  });
  it('rejects slugs that are too short', () => {
    expect(validateSlug('a').status).toBe(400);
  });
  it('rejects slugs that exceed the cap', () => {
    expect(validateSlug('a'.repeat(MAX_SLUG + 1)).status).toBe(400);
  });
  it('rejects uppercase / spaces / special chars', () => {
    for (const bad of ['Foo', 'foo bar', 'foo_bar', '-foo', 'foo-', '/foo']) {
      expect(validateSlug(bad).status).toBe(400);
    }
  });
  it('exports a regex that matches the validator', () => {
    expect(SLUG_RE.test('aloha-mahjong')).toBe(true);
    expect(SLUG_RE.test('Foo')).toBe(false);
  });
});

// ── string ────────────────────────────────────────────────────────────

describe('validateString', () => {
  it('accepts undefined when not required', () => {
    expect(validateString('title', undefined, { max: 100 })).toBeNull();
    expect(validateString('title', null, { max: 100 })).toBeNull();
  });
  it('rejects undefined when required', () => {
    expect(validateString('title', undefined, { max: 100, required: true }).status).toBe(400);
  });
  it('rejects non-strings', () => {
    expect(validateString('title', 5 as any, { max: 100, required: true }).status).toBe(400);
  });
  it('rejects strings exceeding max length', () => {
    expect(validateString('title', 'x'.repeat(MAX_TITLE + 1), { max: MAX_TITLE, required: true }).status).toBe(400);
  });
  it('accepts a string at exactly the max length', () => {
    expect(validateString('title', 'x'.repeat(MAX_TITLE), { max: MAX_TITLE, required: true })).toBeNull();
  });
});

// ── int / bool ────────────────────────────────────────────────────────

describe('validateInt', () => {
  it('accepts undefined (caller decides default)', () => {
    expect(validateInt('sortOrder', undefined)).toBeNull();
    expect(validateInt('sortOrder', null)).toBeNull();
  });
  it('accepts integers', () => {
    expect(validateInt('sortOrder', 0)).toBeNull();
    expect(validateInt('sortOrder', -3)).toBeNull();
  });
  it('rejects floats, NaN, non-numbers', () => {
    expect(validateInt('sortOrder', 1.5).status).toBe(400);
    expect(validateInt('sortOrder', NaN).status).toBe(400);
    expect(validateInt('sortOrder', '5' as any).status).toBe(400);
  });
});

describe('validateBool', () => {
  it('accepts booleans and skips undefined', () => {
    expect(validateBool('featured', true)).toBeNull();
    expect(validateBool('featured', false)).toBeNull();
    expect(validateBool('featured', undefined)).toBeNull();
  });
  it('rejects non-booleans', () => {
    expect(validateBool('featured', 1 as any).status).toBe(400);
    expect(validateBool('featured', 'yes' as any).status).toBe(400);
  });
});

// ── enum ──────────────────────────────────────────────────────────────

describe('validateEnum', () => {
  it('skips undefined', () => {
    expect(validateEnum('locale', undefined, ALL_LOCALES)).toBeNull();
  });
  it('accepts allowed values', () => {
    expect(validateEnum('locale', 'zh-TW', ALL_LOCALES)).toBeNull();
    expect(validateEnum('category', 'mahjong', GAME_CATEGORIES)).toBeNull();
  });
  it('rejects values outside the list', () => {
    expect(validateEnum('locale', 'klingon', ALL_LOCALES).status).toBe(400);
    expect(validateEnum('category', 'poker', GAME_CATEGORIES).status).toBe(400);
  });
  it('rejects non-strings', () => {
    expect(validateEnum('locale', 5 as any, ALL_LOCALES).status).toBe(400);
  });
});

describe('validateRequiredEnum', () => {
  it('rejects undefined', () => {
    expect(validateRequiredEnum('locale', undefined, ALL_LOCALES).status).toBe(400);
  });
  it('accepts allowed values', () => {
    expect(validateRequiredEnum('locale', 'en', ALL_LOCALES)).toBeNull();
  });
});

// ── tags ──────────────────────────────────────────────────────────────

describe('validateTags', () => {
  it('accepts an empty array', () => {
    expect(validateTags([])).toBeNull();
  });
  it('rejects non-arrays', () => {
    expect(validateTags('classic' as any).status).toBe(400);
  });
  it('rejects arrays longer than 32', () => {
    expect(validateTags(new Array(33).fill('a')).status).toBe(400);
  });
  it('rejects entries that are too long', () => {
    expect(validateTags(['ok', 'x'.repeat(65)]).status).toBe(400);
  });
  it('rejects non-string entries', () => {
    expect(validateTags(['ok', 5 as any]).status).toBe(400);
  });
});

// ── constants sanity ──────────────────────────────────────────────────

describe('shared constants', () => {
  it('FEATURE_LOCALES is a strict subset of ALL_LOCALES', () => {
    for (const l of FEATURE_LOCALES) expect(ALL_LOCALES).toContain(l);
  });
  it('SETTINGS_KEYS lists the three documented keys', () => {
    expect(SETTINGS_KEYS).toEqual(['site', 'social', 'analytics']);
  });
  it('all length caps are positive integers', () => {
    for (const cap of [
      MAX_SLUG, MAX_TITLE, MAX_QUESTION, MAX_ANSWER,
      MAX_FEATURE_CONTENT, MAX_VALUE, MAX_KEY, MAX_URL, MAX_LOCALE
    ]) {
      expect(cap).toBeGreaterThan(0);
      expect(Number.isInteger(cap)).toBe(true);
    }
  });
});
