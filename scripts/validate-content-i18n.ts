/**
 * Validate about / home-guide / games locale JSON and glossary completeness
 * for every content locale (CJK + EU).
 *
 * Run: npx tsx scripts/validate-content-i18n.ts
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  GLOSSARY,
  GLOSSARY_REQUIRED_LOCALES,
  type GlossaryLocale
} from '../data/glossary';
import { games } from '../data/games';
import { CONTENT_LOCALES } from '../lib/locales';

const ROOT = path.join(process.cwd(), 'data');

let failures = 0;

function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  failures += 1;
}

function loadJson(rel: string): unknown {
  return JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));
}

function assertNotEqualEn(label: string, locale: string, a: unknown, b: unknown) {
  if (JSON.stringify(a) === JSON.stringify(b)) {
    fail(`${label} (${locale}) is identical to English`);
  }
}

function sectionShape(doc: {
  sections?: Array<{
    heading?: string;
    paragraphs?: unknown[];
    bullets?: unknown[];
    choices?: unknown[];
    afterBullets?: unknown[];
  }>;
}): string {
  return JSON.stringify(
    (doc.sections ?? []).map((s) => ({
      hasParagraphs: Boolean(s.paragraphs?.length),
      paragraphCount: s.paragraphs?.length ?? 0,
      bulletCount: s.bullets?.length ?? 0,
      choiceCount: s.choices?.length ?? 0,
      afterCount: s.afterBullets?.length ?? 0
    }))
  );
}

// ---------------------------------------------------------------- glossary ----
for (const [key, entry] of Object.entries(GLOSSARY)) {
  if (!entry.source?.trim()) fail(`glossary ${key}: empty source`);
  if (entry.type !== 'term' && entry.type !== 'text') {
    fail(`glossary ${key}: invalid type ${entry.type}`);
  }
  for (const locale of GLOSSARY_REQUIRED_LOCALES) {
    const v = entry.i18n[locale as GlossaryLocale];
    if (!v?.trim()) fail(`glossary ${key}: missing ${locale}`);
  }
}

// ------------------------------------------------------ about / home-guide ----
for (const domain of ['about-i18n', 'home-guide-i18n'] as const) {
  const en = loadJson(`${domain}/en.json`) as {
    title?: string;
    intro?: string;
    sections?: unknown[];
    closing?: unknown[];
  };
  for (const locale of CONTENT_LOCALES) {
    const doc = loadJson(`${domain}/${locale}.json`) as typeof en;
    assertNotEqualEn(domain, locale, doc, en);
    if (sectionShape(doc as never) !== sectionShape(en as never)) {
      fail(`${domain}/${locale}: section structure differs from en`);
    }
    if (domain === 'home-guide-i18n') {
      const enClosing = (en.closing ?? []).length;
      const locClosing = (doc.closing ?? []).length;
      if (enClosing !== locClosing) {
        fail(`${domain}/${locale}: closing length ${locClosing} != ${enClosing}`);
      }
    }
  }
}

// ---------------------------------------------------------------- games ----
const enBySlug = new Map(games.map((g) => [g.slug, g]));
for (const locale of CONTENT_LOCALES) {
  const file = loadJson(`games-i18n/${locale}.json`) as Record<
    string,
    {
      title?: string;
      description?: string;
      content?: {
        features?: string[];
        supportedDevices?: string;
        intro?: string;
      };
    }
  >;
  for (const [slug, entry] of Object.entries(file)) {
    const base = enBySlug.get(slug);
    if (!base) {
      fail(`games-i18n/${locale}: unknown slug ${slug}`);
      continue;
    }
    if (!entry.title?.trim() || !entry.description?.trim()) {
      fail(`games-i18n/${locale}/${slug}: missing title/description`);
    }
    if (entry.title === base.title) {
      fail(`games-i18n/${locale}/${slug}: title still English`);
    }
    if (entry.description === base.description) {
      fail(`games-i18n/${locale}/${slug}: description still English`);
    }
    const content = entry.content;
    const enContent = base.content;
    if (!content || !enContent) continue;
    if (
      content.features &&
      enContent.features &&
      JSON.stringify(content.features) === JSON.stringify(enContent.features)
    ) {
      fail(`games-i18n/${locale}/${slug}: features still English`);
    }
    if (
      content.supportedDevices &&
      enContent.supportedDevices &&
      content.supportedDevices === enContent.supportedDevices
    ) {
      fail(`games-i18n/${locale}/${slug}: supportedDevices still English`);
    }
    // If a locale ships howToPlay, it must not be a byte-identical English dump.
    if (
      content.howToPlay &&
      enContent.howToPlay &&
      JSON.stringify(content.howToPlay) === JSON.stringify(enContent.howToPlay)
    ) {
      fail(`games-i18n/${locale}/${slug}: howToPlay still English`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} validation error(s).`);
  process.exit(1);
}
console.log(`content i18n OK (${CONTENT_LOCALES.join(', ')})`);
