/**
 * Validate blog locale JSON against the English base in data/blog.ts.
 * Rules live in lib/i18n-rules (shared with Dev Content Studio).
 *
 * Usage: npx tsx scripts/validate-blog-i18n-json.ts
 */
import { checkBlogI18n } from '../lib/i18n-rules';

const result = checkBlogI18n();

for (const e of result.errors) {
  console.error(`[${e.locale ?? '?'}] ${e.path}: ${e.message}`);
}
for (const w of result.warnings) {
  console.warn(`[warn ${w.locale}] ${w.path}: ${w.message}`);
}

if (!result.ok) {
  process.exit(1);
}

console.log('All blog-i18n JSON files match English structure.');
