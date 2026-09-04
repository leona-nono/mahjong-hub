/**
 * Validate blog locale JSON against the English base in data/blog.ts.
 *
 * Usage: npx tsx scripts/validate-blog-i18n-json.ts
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getBlogPosts } from '../data/blog';
import type { BlogLocaleJson } from '../data/blog-i18n/types';
import { CONTENT_LOCALES } from '../lib/locales';

const LOCALES = CONTENT_LOCALES;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Shape fingerprint that avoids `tiles?.length` on `unknown` under strict tsc. */
function sectionShape(sections: unknown): string {
  if (!Array.isArray(sections)) return '';
  return sections
    .map((section) => {
      const record = asRecord(section);
      const body = record && Array.isArray(record.body) ? record.body : [];
      const tiles = record?.tiles;
      const hasTiles = Array.isArray(tiles) && tiles.length > 0;
      return `${body.length}:${hasTiles ? 1 : 0}`;
    })
    .join('|');
}

let failed = false;

for (const locale of LOCALES) {
  const file = path.join(process.cwd(), 'data', 'blog-i18n', `${locale}.json`);
  const data = JSON.parse(readFileSync(file, 'utf8')) as BlogLocaleJson;

  for (const post of getBlogPosts()) {
    const entry = data[post.slug];
    if (!entry) {
      console.error(`[${locale}] missing slug: ${post.slug}`);
      failed = true;
      continue;
    }
    if (entry.sections.length !== post.sections.length) {
      console.error(`[${locale}] ${post.slug}: section count mismatch`);
      failed = true;
    }
    if (entry.faq.length !== post.faq.length) {
      console.error(`[${locale}] ${post.slug}: faq count mismatch`);
      failed = true;
    }
    if (sectionShape(entry.sections) !== sectionShape(post.sections)) {
      console.error(`[${locale}] ${post.slug}: section body/tiles shape mismatch`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('All blog-i18n JSON files match English structure.');
