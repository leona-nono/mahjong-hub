/**
 * Slug and structure parity between the TypeScript English source and en.json.
 *
 * Studio is allowed to change wording (title, description, section body, FAQ
 * text). This script must not fail on those edits. It still fails when a slug
 * exists on only one side, or when a post's section count or FAQ count differs.
 *
 * Run from repo root:  npx tsx scripts/verify-en-json-parity.ts
 */
import { pathToFileURL } from 'node:url';
import { getBlogPosts } from '../data/blog';
import { games } from '../data/games';
import blogEn from '../data/blog-i18n/en.json';
import gamesEn from '../data/games-i18n/en.json';

type JsonRecord = Record<string, unknown>;

export function slugSetFailures(label: string, tsSlugs: readonly string[], jsonSlugs: readonly string[]): string[] {
  const jsonSet = new Set(jsonSlugs);
  const tsSet = new Set(tsSlugs);
  const missing = tsSlugs.filter((slug) => !jsonSet.has(slug));
  const extra = jsonSlugs.filter((slug) => !tsSet.has(slug));
  const failures: string[] = [];
  if (missing.length) failures.push(`${label}: slugs missing in JSON: ${missing.join(', ')}`);
  if (extra.length) failures.push(`${label}: stale slugs in JSON: ${extra.join(', ')}`);
  return failures;
}

function arrayLength(value: unknown): number | null {
  return Array.isArray(value) ? value.length : null;
}

/** Section count and FAQ count only. Wording is ignored. */
export function blogStructureFailures(
  slug: string,
  ts: { sections: unknown; faq: unknown },
  json: { sections: unknown; faq: unknown }
): string[] {
  const failures: string[] = [];
  const tsSections = arrayLength(ts.sections);
  const jsonSections = arrayLength(json.sections);
  if (tsSections === null || jsonSections === null || tsSections !== jsonSections) {
    failures.push(
      `${slug}: section count ${tsSections ?? 'missing'} (TS) != ${jsonSections ?? 'missing'} (JSON)`
    );
  }
  const tsFaq = arrayLength(ts.faq);
  const jsonFaq = arrayLength(json.faq);
  if (tsFaq === null || jsonFaq === null || tsFaq !== jsonFaq) {
    failures.push(`${slug}: FAQ count ${tsFaq ?? 'missing'} (TS) != ${jsonFaq ?? 'missing'} (JSON)`);
  }
  return failures;
}

function contentCounts(content: unknown): { howToPlay: number | null; tips: number | null; faq: number | null } | null {
  if (content == null) return null;
  if (typeof content !== 'object') return { howToPlay: null, tips: null, faq: null };
  const record = content as JsonRecord;
  return {
    howToPlay: arrayLength(record.howToPlay),
    tips: arrayLength(record.tips),
    faq: arrayLength(record.faq)
  };
}

/**
 * Games have no sections. Structural counts are howToPlay, tips, and FAQ.
 * Title, description, and the strings inside those lists are ignored.
 */
export function gameStructureFailures(slug: string, tsContent: unknown, jsonContent: unknown): string[] {
  const ts = contentCounts(tsContent);
  const json = contentCounts(jsonContent);
  if (ts === null && json === null) return [];
  if (ts === null || json === null) {
    return [`${slug}: content is ${ts ? 'present' : 'missing'} in TS and ${json ? 'present' : 'missing'} in JSON`];
  }
  const failures: string[] = [];
  for (const key of ['howToPlay', 'tips', 'faq'] as const) {
    if (ts[key] === null || json[key] === null || ts[key] !== json[key]) {
      failures.push(`${slug}: ${key} count ${ts[key] ?? 'missing'} (TS) != ${json[key] ?? 'missing'} (JSON)`);
    }
  }
  return failures;
}

export function collectParityFailures(input: {
  blogPosts: ReadonlyArray<{ slug: string; sections: unknown; faq: unknown }>;
  blogJson: JsonRecord;
  games: ReadonlyArray<{ slug: string; content?: unknown }>;
  gamesJson: JsonRecord;
}): string[] {
  const failures = [
    ...slugSetFailures(
      'blog',
      input.blogPosts.map((post) => post.slug),
      Object.keys(input.blogJson)
    ),
    ...slugSetFailures(
      'games',
      input.games.map((game) => game.slug),
      Object.keys(input.gamesJson)
    )
  ];

  for (const post of input.blogPosts) {
    const entry = input.blogJson[post.slug];
    if (!entry || typeof entry !== 'object') continue;
    failures.push(
      ...blogStructureFailures(post.slug, post, entry as { sections: unknown; faq: unknown })
    );
  }

  for (const game of input.games) {
    const entry = input.gamesJson[game.slug];
    if (!entry || typeof entry !== 'object') continue;
    const jsonContent = (entry as JsonRecord).content;
    failures.push(...gameStructureFailures(game.slug, game.content ?? null, jsonContent ?? null));
  }

  return failures;
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

export function runLiveParity(): string[] {
  return collectParityFailures({
    blogPosts: getBlogPosts(),
    blogJson: blogEn as JsonRecord,
    games,
    gamesJson: gamesEn as JsonRecord
  });
}

if (isDirectRun()) {
  const failures = runLiveParity();
  if (failures.length) {
    for (const failure of failures) console.log(`✗ ${failure}`);
    console.log(`\nFAILED: ${failures.length} structure problem(s). Wording differences are ignored.`);
    process.exit(1);
  }
  const posts = getBlogPosts();
  console.log(`✓ blog: ${posts.length}/${posts.length} slugs, section counts and FAQ counts match`);
  console.log(`✓ games: ${games.length}/${games.length} slugs and content list counts match`);
  console.log('\nPASS: en.json matches the TypeScript source in slugs and structure. Text may differ.');
}
