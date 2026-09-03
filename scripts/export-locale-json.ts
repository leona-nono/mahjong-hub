/**
 * ONE-SHOT / DANGEROUS: re-exports locale JSON from TypeScript sources.
 *
 * Do NOT run against locales that already have curated translations — it will
 * overwrite CJK about / home-guide / games content with English fallbacks merged
 * from GAME_I18N. Prefer editing data/*-i18n/*.json directly.
 *
 * Run from repo root only when intentionally regenerating from TS: npx tsx scripts/export-locale-json.ts
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { games } from '../data/games';
import { GAME_I18N } from '../data/games.i18n';
import { getAboutDoc } from '../data/about';
import { getHomeGuideDoc } from '../data/home-guide';

const OUT_ROOT = path.join(process.cwd(), 'data');

const LOCALES = ['zh', 'zh-TW', 'ja', 'ko'] as const;
type Locale = (typeof LOCALES)[number];

function writeJson(relPath: string, data: unknown) {
  const file = path.join(OUT_ROOT, relPath);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${file}`);
}

// ---------------------------------------------------------------- games ----
const gameBySlug = new Map(games.map((g) => [g.slug, g]));

function gamesLocaleJson(locale: Locale) {
  const out: Record<string, unknown> = {};
  for (const [slug, entry] of Object.entries(GAME_I18N)) {
    const base = gameBySlug.get(slug);
    if (!base) continue;

    const baseContent = base.content;
    const override = entry.content?.[locale];

    const merged: Record<string, unknown> = {
      title: entry.title?.[locale] ?? base.title,
      description: entry.description?.[locale] ?? base.description
    };

    if (baseContent) {
      merged.content = {
        intro: override?.intro ?? baseContent.intro,
        howToPlay: override?.howToPlay ?? baseContent.howToPlay,
        tips: override?.tips ?? baseContent.tips,
        features: override?.features ?? baseContent.features,
        supportedDevices: override?.supportedDevices ?? baseContent.supportedDevices,
        faq: override?.faq ?? baseContent.faq
      };
    } else if (override) {
      merged.content = override;
    }

    out[slug] = merged;
  }
  return out;
}

for (const locale of LOCALES) {
  writeJson(`games-i18n/${locale}.json`, gamesLocaleJson(locale));
}

// ---------------------------------------------------------------- about ----
for (const locale of ['en', ...LOCALES]) {
  writeJson(`about-i18n/${locale}.json`, getAboutDoc(locale));
}

// ------------------------------------------------------------ home-guide ----
for (const locale of ['en', ...LOCALES]) {
  writeJson(`home-guide-i18n/${locale}.json`, getHomeGuideDoc(locale));
}
