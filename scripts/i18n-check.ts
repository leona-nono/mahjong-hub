/**
 * Full i18n rules report (errors + warnings) for Studio / CI review.
 * Usage: npx tsx scripts/i18n-check.ts
 */
import { runAllI18nChecks } from '../lib/i18n-rules';

const result = runAllI18nChecks();

for (const e of result.errors) {
  console.error(`ERROR [${e.domain}] ${e.locale ?? '-'} ${e.path}: ${e.message}`);
}
for (const w of result.warnings) {
  console.warn(`WARN  [${w.domain}] ${w.locale ?? '-'} ${w.path}: ${w.message}`);
}

console.log(
  `\n${result.errors.length} error(s), ${result.warnings.length} warning(s). ok=${result.ok}`
);
process.exit(result.ok ? 0 : 1);
