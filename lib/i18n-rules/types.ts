export type FindingSeverity = 'error' | 'warning';

export interface I18nFinding {
  severity: FindingSeverity;
  domain: string;
  locale?: string;
  path: string;
  message: string;
}

export interface CheckResult {
  ok: boolean;
  errors: I18nFinding[];
  warnings: I18nFinding[];
}

export function emptyResult(): CheckResult {
  return { ok: true, errors: [], warnings: [] };
}

export function mergeResults(...parts: CheckResult[]): CheckResult {
  const errors = parts.flatMap((p) => p.errors);
  const warnings = parts.flatMap((p) => p.warnings);
  return { ok: errors.length === 0, errors, warnings };
}

export function error(
  domain: string,
  path: string,
  message: string,
  locale?: string
): I18nFinding {
  return { severity: 'error', domain, locale, path, message };
}

export function warning(
  domain: string,
  path: string,
  message: string,
  locale?: string
): I18nFinding {
  return { severity: 'warning', domain, locale, path, message };
}
