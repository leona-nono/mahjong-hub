/**
 * One-shot parity proof for the EN → JSON migration (JSON workflow, step 2).
 *
 * Proves the export was a pure format conversion: every field the Studio will
 * now edit through data/{blog,games}-i18n/en.json is byte-identical to the
 * value returned by the TS source (getBlogPosts() / games). Run this in the PR
 * and paste the output into the description — it is the "no content change"
 * evidence.
 *
 * Run from repo root:  npx tsx scripts/verify-en-json-parity.ts
 * Exits 1 if any slug is missing, extra, or differs in any field.
 *
 * NOTE: this is intentionally a script, not a test — once content is edited
 * through the Studio the EN file is *supposed* to diverge from blog.ts.
 */
import { getBlogPosts } from '../data/blog';
import { games } from '../data/games';
import blogEn from '../data/blog-i18n/en.json';
import gamesEn from '../data/games-i18n/en.json';

type Json = Record<string, unknown>;

function diff(a: unknown, b: unknown, path = ''): string[] {
  if (a === b) return [];
  if (typeof a !== typeof b) return [`${path}: type ${typeof a} != ${typeof b}`];
  if (a && b && typeof a === 'object') {
    const out: string[] = [];
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    for (const k of new Set([...ka, ...kb])) {
      if (!ka.includes(k)) { out.push(`${path}.${k}: missing in TS`); continue; }
      if (!kb.includes(k)) { out.push(`${path}.${k}: missing in JSON`); continue; }
      out.push(...diff((a as Json)[k], (b as Json)[k], `${path}.${k}`));
    }
    return out;
  }
  return [`${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`];
}

let failures = 0;

function check(label: string, tsSlugs: string[], json: Json, fields: (slug: string) => Record<string, unknown>) {
  const jsonSlugs = Object.keys(json);
  const missing = tsSlugs.filter((s) => !jsonSlugs.includes(s));
  const extra = jsonSlugs.filter((s) => !tsSlugs.includes(s));
  if (missing.length) { failures++; console.log(`✗ ${label}: slugs missing in JSON: ${missing.join(', ')}`); }
  if (extra.length) { failures++; console.log(`✗ ${label}: stale slugs in JSON: ${extra.join(', ')}`); }

  let ok = 0;
  for (const slug of tsSlugs) {
    const entry = json[slug];
    if (!entry) continue;
    const d = diff(fields(slug), entry as Json, slug);
    if (d.length) {
      failures++;
      console.log(`✗ ${label} ${slug}`);
      for (const line of d.slice(0, 8)) console.log(`     ${line}`);
    } else {
      ok++;
    }
  }
  console.log(`${ok === tsSlugs.length && !missing.length && !extra.length ? '✓' : '✗'} ${label}: ${ok}/${tsSlugs.length} identical, missing=${missing.length}, extra=${extra.length}`);
}

const posts = getBlogPosts();
check('blog', posts.map((p) => p.slug), blogEn as Json, (slug) => {
  const p = posts.find((x) => x.slug === slug)!;
  return { title: p.title, description: p.description, sections: p.sections, faq: p.faq };
});

check('games', games.map((g) => g.slug), gamesEn as Json, (slug) => {
  const g = games.find((x) => x.slug === slug)!;
  return { title: g.title, description: g.description, content: g.content ?? null };
});

if (failures) {
  console.log(`\nFAILED: ${failures} problem(s). Export is NOT a pure format conversion.`);
  process.exit(1);
}
console.log('\nPASS: en.json is a pure format conversion — no content change.');
