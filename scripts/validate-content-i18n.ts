/**
 * Validate about / home-guide / games locale JSON and glossary completeness.
 * Rules live in lib/i18n-rules (shared with Dev Content Studio).
 *
 * Run: npx tsx scripts/validate-content-i18n.ts
 */
import {
  checkAboutHomeGuide,
  checkGamesI18n,
  checkGlossary,
  mergeResults
} from '../lib/i18n-rules';
import { CONTENT_LOCALES } from '../lib/locales';

const result = mergeResults(
  checkGlossary(),
  checkAboutHomeGuide(),
  checkGamesI18n()
);

for (const e of result.errors) {
  console.error(`FAIL: [${e.domain}] ${e.locale ?? ''} ${e.path}: ${e.message}`);
}
for (const w of result.warnings) {
  console.warn(`WARN: [${w.domain}] ${w.locale ?? ''} ${w.path}: ${w.message}`);
}

if (!result.ok) {
  console.error(`\n${result.errors.length} validation error(s).`);
  process.exit(1);
}
console.log(`content i18n OK (${CONTENT_LOCALES.join(', ')})`);
