import 'server-only';
import { NextResponse } from 'next/server';

/**
 * Shared input validators for /api/admin/* routes.
 *
 * Each function returns `null` when the value passes, or a 400 `NextResponse`
 * describing the failure. Routes compose them in sequence — first failure wins.
 *
 * Limits are conservative defaults: chosen to keep payloads small (storage /
 * DoS safety) without blocking realistic content. Tighten or relax per field
 * if real content demands it.
 */

// ── Constants ────────────────────────────────────────────────────────────

export const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export const MAX_SLUG = 64;
export const MAX_TITLE = 200;
export const MAX_DESC = 1000;
export const MAX_URL = 2048;
export const MAX_LOCALE = 16;
export const MAX_KEY = 200;
export const MAX_VALUE = 16 * 1024; // 16KB for short string values
export const MAX_QUESTION = 500;
export const MAX_ANSWER = 8 * 1024; // 8KB per FAQ answer
export const MAX_FEATURE_CONTENT = 64 * 1024; // 64KB MDX long-form
export const MAX_TAGS = 32; // upper bound on tags array length
export const MAX_TAG_LEN = 64; // upper bound on a single tag

export const ALL_LOCALES = [
  'en', 'zh-TW', 'zh-CN', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'pt-BR', 'it', 'nl',
  'pl', 'ru', 'ar', 'th', 'vi', 'id', 'ms'
] as const;

export const FEATURE_LOCALES = ['en', 'zh-TW', 'zh-CN', 'ja', 'ko', 'de', 'fr', 'es', 'pt-BR'] as const;

export const GAME_CATEGORIES = [
  'mahjong', 'connect', 'solitaire', 'tile-match', 'four-player'
] as const;

export const SETTINGS_KEYS = ['site', 'social', 'analytics'] as const;

// ── Helpers ──────────────────────────────────────────────────────────────

function badRequest(msg: string): NextResponse {
  return NextResponse.json({ error: msg }, { status: 400 });
}

// ── Validators ───────────────────────────────────────────────────────────

/** slug must be lowercase alphanumeric with hyphens, 2..MAX_SLUG chars. */
export function validateSlug(slug: unknown): NextResponse | null {
  if (typeof slug !== 'string') return badRequest('slug 必须是字符串');
  if (slug.length < 2) return badRequest('slug 太短（至少 2 字符）');
  if (slug.length > MAX_SLUG) return badRequest(`slug 不能超过 ${MAX_SLUG} 字符`);
  if (!SLUG_RE.test(slug)) {
    return badRequest(
      'slug 只能包含小写字母、数字、连字符；首尾必须是字母或数字'
    );
  }
  return null;
}

/**
 * Validate a string field. Returns 400 when the value is wrong type or
 * exceeds `max`. Use `required: true` to reject undefined/null as well.
 */
export function validateString(
  field: string,
  value: unknown,
  opts: { max: number; required?: boolean }
): NextResponse | null {
  if (value === undefined || value === null) {
    return opts.required ? badRequest(`${field} 是必填项`) : null;
  }
  if (typeof value !== 'string') return badRequest(`${field} 必须是字符串`);
  if (value.length > opts.max) {
    return badRequest(`${field} 长度不能超过 ${opts.max}`);
  }
  return null;
}

/** Validate an integer field. Rejects NaN, floats, non-numbers. */
export function validateInt(field: string, value: unknown): NextResponse | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return badRequest(`${field} 必须是整数`);
  }
  return null;
}

/** Validate a boolean field. */
export function validateBool(field: string, value: unknown): NextResponse | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'boolean') return badRequest(`${field} 必须是布尔值`);
  return null;
}

/** Validate that value is one of the allowed strings. */
export function validateEnum(
  field: string,
  value: unknown,
  allowed: readonly string[]
): NextResponse | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return badRequest(`${field} 必须是字符串`);
  if (!allowed.includes(value)) {
    return badRequest(
      `${field} 取值无效（允许: ${allowed.join(', ')}）`
    );
  }
  return null;
}

/**
 * Validate a `body` object whose field is required. Combines required + enum.
 * Returns the first failure encountered.
 */
export function validateRequiredEnum(
  field: string,
  value: unknown,
  allowed: readonly string[]
): NextResponse | null {
  if (value === undefined || value === null) {
    return badRequest(`${field} 是必填项`);
  }
  return validateEnum(field, value, allowed);
}

/**
 * Validate a string-array tag list. Reject anything that isn't an array,
 * bounds the array length and per-item length, and rejects non-string
 * entries. Used by the Game.tags column.
 */
export function validateTags(value: unknown): NextResponse | null {
  if (!Array.isArray(value)) {
    return badRequest('tags 必须是字符串数组');
  }
  if (value.length > MAX_TAGS) {
    return badRequest(`tags 数量不能超过 ${MAX_TAGS}`);
  }
  for (const t of value) {
    if (typeof t !== 'string' || t.length > MAX_TAG_LEN) {
      return badRequest(`tags 每项必须是 ≤${MAX_TAG_LEN} 字符的字符串`);
    }
  }
  return null;
}
