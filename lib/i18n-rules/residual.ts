import { GLOSSARY, type GlossaryLocale } from '@/data/glossary';
import { isSoftExempt, type I18nEntryMeta } from '@/lib/i18n-rules/meta';
import {
  error,
  warning,
  type I18nFinding
} from '@/lib/i18n-rules/types';

export const CJK_LOCALES = ['zh', 'zh-TW', 'ja', 'ko'] as const;

export function isCjkLocale(locale: string): boolean {
  return (CJK_LOCALES as readonly string[]).includes(locale);
}

/** Report identical-to-EN residual: hard error for CJK, warning otherwise. */
export function pushResidualFinding(
  findings: { errors: I18nFinding[]; warnings: I18nFinding[] },
  domain: string,
  locale: string,
  fieldPath: string,
  enVal: unknown,
  locVal: unknown,
  meta?: I18nEntryMeta
) {
  if (isSoftExempt(meta, fieldPath) || isSoftExempt(meta, '*')) return;
  if (enVal === undefined || locVal === undefined) return;
  if (JSON.stringify(enVal) !== JSON.stringify(locVal)) return;
  // Skip empty both
  if (enVal === '' || (Array.isArray(enVal) && enVal.length === 0)) return;

  const message = 'English residual (identical to EN)';
  if (isCjkLocale(locale)) {
    findings.errors.push(error(domain, fieldPath, message, locale));
  } else {
    findings.warnings.push(warning(domain, fieldPath, message, locale));
  }
}

/**
 * If English glossary source still appears in locale body, warn and suggest
 * the locked translation (Studio can one-click replace).
 */
export function scanGlossaryResiduals(
  domain: string,
  locale: string,
  textBlob: string
): I18nFinding[] {
  if (!textBlob || locale === 'en') return [];
  const out: I18nFinding[] = [];
  const seen = new Set<string>();
  for (const [key, entry] of Object.entries(GLOSSARY)) {
    if (entry.type !== 'term') continue;
    const source = entry.source?.trim();
    if (!source || source.length < 3) continue;
    if (!textBlob.includes(source)) continue;
    const expected = entry.i18n[locale as GlossaryLocale];
    if (!expected) continue;
    // Latin-script locales often keep EN term as the locked form — not a residual.
    if (expected === source) continue;
    if (seen.has(source)) continue;
    seen.add(source);
    out.push(
      warning(
        domain,
        `glossary:${key}`,
        `English term "${source}" left in text; glossary expects "${expected}"`,
        locale
      )
    );
  }
  return out;
}

export function collectStringBlob(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(collectStringBlob).join('\n');
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([k]) => k !== '_meta')
      .map(([, v]) => collectStringBlob(v))
      .join('\n');
  }
  return '';
}
