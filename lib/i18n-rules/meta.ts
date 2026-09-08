/**
 * Locale override metadata for intentional localization (idiom / brand voice).
 * Soft "still-English / length" warnings are skipped when a field has a reason;
 * hard structure + glossary rules still apply.
 *
 * Place `_meta` on a locale JSON entry (blog/games slug) or document root:
 * {
 *   "_meta": {
 *     "overrides": {
 *       "title": { "reason": "locale_idiom", "note": "…" },
 *       "content.intro": { "reason": "brand_voice" }
 *     }
 *   },
 *   "title": "…"
 * }
 */
export type OverrideReason = 'locale_idiom' | 'brand_voice' | 'legal' | 'other';

export interface FieldOverride {
  reason: OverrideReason;
  note?: string;
}

export interface I18nEntryMeta {
  overrides?: Record<string, FieldOverride>;
}

export interface WithI18nMeta {
  _meta?: I18nEntryMeta;
}

export function stripMeta<T extends Record<string, unknown>>(entry: T): Omit<T, '_meta'> {
  const { _meta: _ignored, ...rest } = entry;
  return rest as Omit<T, '_meta'>;
}

export function hasFieldOverride(
  meta: I18nEntryMeta | undefined,
  fieldPath: string
): boolean {
  const o = meta?.overrides?.[fieldPath];
  return Boolean(o?.reason);
}

export function isSoftExempt(
  meta: I18nEntryMeta | undefined,
  fieldPath: string
): boolean {
  return hasFieldOverride(meta, fieldPath);
}
