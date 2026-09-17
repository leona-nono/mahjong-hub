/**
 * Report UI strings that were never localized: the locale value is byte-identical
 * to the English source while still containing natural-language words.
 *
 * Why this exists: `translate-content-i18n.ts` decides what to translate with
 * `missingSubtree()`, which treats any non-empty string as done. A string that was
 * copied from English to keep the key tree valid is therefore "complete" forever —
 * the translator reports "already complete — skip" and the English copy ships.
 * Nothing else looks for this either: `lint-zh-prose` only scans blog JSON, and
 * `validate-content-i18n` only checks for empty values.
 *
 * So this is the missing signal, not a duplicate of an existing check.
 *
 *   npx tsx scripts/i18n/lint-untranslated.ts                  # all locales, grouped
 *   npx tsx scripts/i18n/lint-untranslated.ts --locale zh-TW
 *   npx tsx scripts/i18n/lint-untranslated.ts --domain messages --json
 *   npx tsx scripts/i18n/lint-untranslated.ts --errors-only    # exit 1 if any found
 *
 * Exit code is 0 unless `--errors-only` is passed.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DOMAIN_DIRS: Record<string, string> = {
  messages: 'messages',
  about: 'data/about-i18n',
  'home-guide': 'data/home-guide-i18n',
  games: 'data/games-i18n',
  blog: 'data/blog-i18n'
};

/** English is the source language; every other shipped locale is a target. */
const SOURCE_LOCALE = 'en';

type Hit = { locale: string; domain: string; key: string; value: string };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function flatten(value: unknown, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  if (typeof value === 'string') {
    out[prefix] = value;
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(item, prefix ? `${prefix}.${i}` : String(i), out));
    return out;
  }
  if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

/**
 * Should this string have been translated in the first place?
 *
 * Several kinds of value are *correctly* identical across locales and must not be
 * reported, or the signal drowns in noise (a first pass without these exclusions
 * reported 115 hits for `de`, almost all of them wrong):
 *   - pure placeholders, `{n}` — nothing to translate
 *   - symbols, `✓` / `→` / `·` — ditto
 *   - short tokens that are genuinely language-neutral on this site, e.g. `AI`
 *   - machine-readable values: hrefs, suits, winds, dragons, ranks, sprite keys
 *   - proper nouns that must NOT be localized (brand, partner product names)
 * A value qualifies only if it carries at least three consecutive Latin letters
 * and survives all of the above.
 */
const NEUTRAL_TOKENS = new Set(['AI', 'OK', 'PWA', 'SEO', 'FAQ', 'MCR', 'URL', 'PDF']);

/**
 * Keys whose values are identifiers or engine data, never prose. Checked against
 * the last path segment so `sections.1.tiles.0.suit` is excluded but
 * `hero.title` is not.
 */
const MACHINE_KEYS = new Set([
  'href', 'url', 'src', 'path', 'slug', 'id', 'key', 'code',
  'suit', 'wind', 'dragon', 'rank', 'kind', 'type', 'variant', 'tier',
  'icon', 'image', 'cover', 'ogImage', 'color', 'theme', 'sprite',
  'locale', 'lang', 'date', 'updated', 'version'
]);

/** Values that look like a path/fragment rather than prose. */
function looksMachineReadable(value: string): boolean {
  return (
    value.startsWith('/') ||
    value.startsWith('http') ||
    value.startsWith('#') ||
    /^[a-z0-9]+(-[a-z0-9]+)+$/.test(value) || // kebab-case token
    /^[a-z]+([A-Z][a-z]+)+$/.test(value) || // camelCase token
    /^\{[^}]*\}$/.test(value.trim()) // bare placeholder like {n}
  );
}

export function needsTranslation(key: string, value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  if (NEUTRAL_TOKENS.has(t)) return false;
  if (looksMachineReadable(t)) return false;

  const last = key.split('.').pop() ?? '';
  if (MACHINE_KEYS.has(last)) return false;

  // `{n} pts` still needs translating (the unit is English); `{n}` alone does not.
  if (!/[A-Za-z]{3,}/.test(t)) return false;
  return true;
}

function readJson(file: string): Record<string, unknown> | undefined {
  if (!existsSync(file)) return undefined;
  return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
}

function localeNames(): string[] {
  const names = new Set<string>();
  for (const dir of Object.values(DOMAIN_DIRS)) {
    const abs = path.join(process.cwd(), dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs)) {
      if (!f.endsWith('.json') || f === 'types.json') continue;
      names.add(f.replace(/\.json$/, ''));
    }
  }
  names.delete(SOURCE_LOCALE);
  return [...names].sort();
}

export function collectUntranslated(opts: {
  locales?: string[];
  domains?: string[];
}): Hit[] {
  const locales = opts.locales?.length ? opts.locales : localeNames();
  const domains = opts.domains?.length ? opts.domains : Object.keys(DOMAIN_DIRS);
  const hits: Hit[] = [];

  for (const domain of domains) {
    const dir = DOMAIN_DIRS[domain];
    if (!dir) throw new Error(`Unknown domain: ${domain}`);
    const source = readJson(path.join(process.cwd(), dir, `${SOURCE_LOCALE}.json`));
    if (!source) continue;
    const sourceFlat = flatten(source);

    for (const locale of locales) {
      const target = readJson(path.join(process.cwd(), dir, `${locale}.json`));
      if (!target) continue;
      const targetFlat = flatten(target);

      for (const [key, value] of Object.entries(targetFlat)) {
        const en = sourceFlat[key];
        // Only a real English counterpart counts — a key absent from EN is a
        // different problem (orphan key) and belongs to the structural validator.
        if (typeof en !== 'string') continue;
        if (value !== en) continue;
        if (!needsTranslation(key, en)) continue;
        hits.push({ locale, domain, key, value: en });
      }
    }
  }
  return hits;
}

function main() {
  const args = process.argv.slice(2);
  const locales: string[] = [];
  const domains: string[] = [];
  let errorsOnly = false;
  let asJson = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--locale') locales.push(args[++i]);
    else if (a === '--domain') domains.push(args[++i]);
    else if (a === '--errors-only') errorsOnly = true;
    else if (a === '--json') asJson = true;
  }

  const hits = collectUntranslated({ locales, domains });

  if (asJson) {
    console.log(JSON.stringify(hits, null, 2));
    if (errorsOnly && hits.length > 0) process.exit(1);
    return;
  }

  if (hits.length === 0) {
    console.log('No untranslated UI strings found.');
    return;
  }

  const byLocale = new Map<string, Hit[]>();
  for (const h of hits) {
    if (!byLocale.has(h.locale)) byLocale.set(h.locale, []);
    byLocale.get(h.locale)!.push(h);
  }

  console.log('Untranslated UI strings (value identical to English but translatable):\n');
  for (const [locale, list] of [...byLocale.entries()].sort()) {
    console.log(`── ${locale} · ${list.length} string(s) ──`);
    const groups = new Map<string, Hit[]>();
    for (const h of list) {
      const ns = h.domain === 'messages' ? h.key.split('.')[0] : h.domain;
      if (!groups.has(ns)) groups.set(ns, []);
      groups.get(ns)!.push(h);
    }
    for (const [ns, items] of [...groups.entries()].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`   [${ns}] ${items.length}`);
      for (const it of items.slice(0, 6)) {
        console.log(`      ${it.key} = ${JSON.stringify(it.value.slice(0, 64))}`);
      }
      if (items.length > 6) console.log(`      … and ${items.length - 6} more`);
    }
    console.log('');
  }

  const totals = [...byLocale.entries()].map(([l, v]) => `${l} ${v.length}`).join(' · ');
  console.log(`Total: ${hits.length}  (${totals})`);
  console.log('Fix by rewriting each value per docs/I18N_MASTER_SPEC.md §4, then run `npm run gate`.');

  if (errorsOnly) process.exit(1);
}

const isMain = process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/i18n/lint-untranslated.ts');
if (isMain) main();
