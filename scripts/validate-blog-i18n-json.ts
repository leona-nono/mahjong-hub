/**
 * Validate blog locale JSON against the English base in data/blog.ts.
 *
 * Usage: npx tsx scripts/validate-blog-i18n-json.ts
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getBlogPosts } from '../data/blog';
import type { BlogLocaleJson } from '../data/blog-i18n/types';

const LOCALES = ['zh', 'zh-TW', 'ja', 'ko'] as const;

function sectionShape(sections: { body: string[]; tiles?: unknown }[]) {
  return sections.map((s) => ({
    bodyLen: s.body.length,
    hasTiles: Boolean(s.tiles?.length)
  }));
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
    if (sectionShape(entry.sections).join() !== sectionShape(post.sections).join()) {
      console.error(`[${locale}] ${post.slug}: section body/tiles shape mismatch`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('All blog-i18n JSON files match English structure.');
