/**
 * Offline content i18n translator (DeepSeek + glossary lock + memory cache).
 *
 * Usage (local only — never imported by Next.js runtime):
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain about --locales es,fr,de,pt-BR
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain home-guide --locales es,fr,de,pt-BR
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain games --locales fr,de,pt-BR
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain blog --locales es,fr,de,pt-BR
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain messages --locales es,fr,de,pt-BR
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain games --locales de --dry-run
 *
 * Domains `about` / `home-guide` / `games` / `blog` write under `data/`.
 * Domain `messages` reads `messages/en.json` and writes `messages/{locale}.json`.
 *
 * For `messages` when the locale file already exists: by default only **missing**
 * leaf keys are translated and merged onto the existing file. Pass `--force` to
 * overwrite the entire tree from English.
 *
 * For other domains: existing output files are skipped unless `--force`.
 *
 * Requires DEEPSEEK_API_KEY unless every string is already in .cache/i18n-memory.json.
 * Without an API key, `messages` can still fill missing keys with English copy
 * (see fillMissingLeaves) so the key tree stays complete for validate-content-i18n.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getBlogPosts } from '../../data/blog';
import { games } from '../../data/games';
import type { GlossaryLocale } from '../../data/glossary';
import {
  getDeepSeekApiKey,
  loadMemory,
  saveMemory,
  translateTree
} from './deepseek-client';

const DATA_ROOT = path.join(process.cwd(), 'data');
const MESSAGES_ROOT = path.join(process.cwd(), 'messages');
const EU = ['es', 'fr', 'de', 'pt-BR'] as const satisfies readonly GlossaryLocale[];

type Domain = 'about' | 'home-guide' | 'games' | 'blog' | 'messages';

function parseArgs() {
  const args = process.argv.slice(2);
  let domain: Domain = 'about';
  let locales: GlossaryLocale[] = [...EU];
  let dryRun = false;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--domain') domain = args[++i] as Domain;
    else if (a === '--locales') {
      locales = args[++i].split(',').map((s) => s.trim()) as GlossaryLocale[];
    } else if (a === '--dry-run') dryRun = true;
    else if (a === '--force') force = true;
  }
  return { domain, locales, dryRun, force };
}

function writeJson(absPath: string, data: unknown) {
  mkdirSync(path.dirname(absPath), { recursive: true });
  writeFileSync(absPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${absPath}`);
}

function englishGamesCatalogue() {
  const out: Record<string, unknown> = {};
  for (const g of games) {
    const entry: Record<string, unknown> = {
      title: g.title,
      description: g.description
    };
    if (g.content) {
      entry.content = {
        intro: g.content.intro,
        howToPlay: g.content.howToPlay,
        tips: g.content.tips,
        features: g.content.features,
        supportedDevices: g.content.supportedDevices,
        faq: g.content.faq
      };
    }
    out[g.slug] = entry;
  }
  return out;
}

/** English blog catalogue shaped like data/blog-i18n/{locale}.json */
function englishBlogCatalogue() {
  const out: Record<string, unknown> = {};
  for (const post of getBlogPosts()) {
    out[post.slug] = {
      title: post.title,
      description: post.description,
      sections: post.sections.map((section) => {
        const entry: Record<string, unknown> = {
          heading: section.heading,
          body: section.body
        };
        if (section.tiles?.length) entry.tiles = section.tiles;
        return entry;
      }),
      faq: post.faq
    };
  }
  return out;
}

function outPathFor(domain: Domain, locale: string): string {
  if (domain === 'messages') return path.join(MESSAGES_ROOT, `${locale}.json`);
  if (domain === 'games') return path.join(DATA_ROOT, `games-i18n/${locale}.json`);
  if (domain === 'blog') return path.join(DATA_ROOT, `blog-i18n/${locale}.json`);
  return path.join(DATA_ROOT, `${domain}-i18n/${locale}.json`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Deep-merge missing leaves from `source` into `existing`.
 * Existing non-empty strings win; objects recurse; arrays are replaced only if missing.
 */
export function fillMissingLeaves(
  source: unknown,
  existing: unknown
): { result: unknown; filled: number } {
  let filled = 0;

  function walk(src: unknown, cur: unknown): unknown {
    if (typeof src === 'string') {
      if (typeof cur === 'string' && cur.trim()) return cur;
      if (cur === undefined || cur === null || (typeof cur === 'string' && !cur.trim())) {
        filled += 1;
        return src;
      }
      return cur;
    }
    if (Array.isArray(src)) {
      if (cur === undefined || cur === null) {
        filled += 1;
        return src;
      }
      return cur;
    }
    if (isPlainObject(src)) {
      const out: Record<string, unknown> = isPlainObject(cur) ? { ...cur } : {};
      for (const [k, v] of Object.entries(src)) {
        out[k] = walk(v, isPlainObject(cur) ? cur[k] : undefined);
      }
      return out;
    }
    return cur !== undefined && cur !== null ? cur : src;
  }

  return { result: walk(source, existing), filled };
}

/** Collect only the subtree of `source` for paths missing (or empty) in `existing`. */
function missingSubtree(source: unknown, existing: unknown): unknown {
  if (typeof source === 'string') {
    if (typeof existing === 'string' && existing.trim()) return undefined;
    return source;
  }
  if (Array.isArray(source)) {
    if (existing === undefined || existing === null) return source;
    return undefined;
  }
  if (isPlainObject(source)) {
    const out: Record<string, unknown> = {};
    let any = false;
    for (const [k, v] of Object.entries(source)) {
      const child = missingSubtree(v, isPlainObject(existing) ? existing[k] : undefined);
      if (child !== undefined) {
        out[k] = child;
        any = true;
      }
    }
    return any ? out : undefined;
  }
  return undefined;
}

function deepMergeTranslated(
  existing: Record<string, unknown>,
  translatedMissing: unknown
): Record<string, unknown> {
  if (!isPlainObject(translatedMissing)) return existing;
  const out: Record<string, unknown> = { ...existing };
  for (const [k, v] of Object.entries(translatedMissing)) {
    if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = deepMergeTranslated(out[k] as Record<string, unknown>, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function translateMessages(
  locale: GlossaryLocale,
  opts: { dryRun: boolean; force: boolean; memory: ReturnType<typeof loadMemory>; apiKey?: string }
) {
  const enPath = path.join(MESSAGES_ROOT, 'en.json');
  const source = JSON.parse(readFileSync(enPath, 'utf8')) as Record<string, unknown>;
  const outPath = outPathFor('messages', locale);
  const existing = existsSync(outPath)
    ? (JSON.parse(readFileSync(outPath, 'utf8')) as Record<string, unknown>)
    : null;

  if (existing && !opts.force) {
    const missing = missingSubtree(source, existing);
    if (missing === undefined) {
      console.log(`messages/${locale}.json already complete — skip`);
      return;
    }

    console.log(`Filling missing keys in messages/${locale}.json…`);
    if (opts.apiKey && !opts.dryRun) {
      const translated = await translateTree(missing, locale, {
        memory: opts.memory,
        apiKey: opts.apiKey,
        dryRun: opts.dryRun
      });
      const merged = deepMergeTranslated(existing, translated);
      if (!opts.dryRun) {
        writeJson(outPath, merged);
        saveMemory(opts.memory);
      } else {
        console.log(`[dry-run] would merge translated missing keys into ${outPath}`);
      }
      return;
    }

    // No API key: copy English leaves so the key tree is complete for validators.
    const { result, filled } = fillMissingLeaves(source, existing);
    console.log(
      `DEEPSEEK_API_KEY unset — copied ${filled} English leaf/value(s) into messages/${locale}.json`
    );
    if (!opts.dryRun) writeJson(outPath, result);
    else console.log(`[dry-run] would write ${outPath}`);
    return;
  }

  console.log(`Translating messages → ${locale}…`);
  if (!opts.apiKey && !opts.dryRun) {
    console.log(
      `DEEPSEEK_API_KEY unset — writing English copy for messages/${locale}.json (--force or new file)`
    );
    writeJson(outPath, source);
    return;
  }

  const translated = await translateTree(source, locale, {
    memory: opts.memory,
    apiKey: opts.apiKey,
    dryRun: opts.dryRun
  });
  if (!opts.dryRun) {
    writeJson(outPath, translated);
    saveMemory(opts.memory);
  } else {
    console.log(`[dry-run] would write full tree to ${outPath}`);
  }
}

async function translateDomain(
  domain: Domain,
  locale: GlossaryLocale,
  opts: { dryRun: boolean; force: boolean; memory: ReturnType<typeof loadMemory>; apiKey?: string }
) {
  if (domain === 'messages') {
    await translateMessages(locale, opts);
    return;
  }

  const outPath = outPathFor(domain, locale);
  if (existsSync(outPath) && !opts.force) {
    console.log(`Skip existing ${path.relative(process.cwd(), outPath)} (pass --force to overwrite)`);
    return;
  }

  let source: unknown;
  if (domain === 'games') {
    source = englishGamesCatalogue();
  } else if (domain === 'blog') {
    source = englishBlogCatalogue();
  } else {
    source = JSON.parse(
      readFileSync(path.join(DATA_ROOT, `${domain}-i18n/en.json`), 'utf8')
    );
  }

  console.log(`Translating ${domain} → ${locale}…`);
  const translated = await translateTree(source, locale, {
    memory: opts.memory,
    apiKey: opts.apiKey,
    dryRun: opts.dryRun
  });
  if (!opts.dryRun) {
    writeJson(outPath, translated);
    saveMemory(opts.memory);
  }
}

async function main() {
  const { domain, locales, dryRun, force } = parseArgs();
  if (!['about', 'home-guide', 'games', 'blog', 'messages'].includes(domain)) {
    throw new Error(`Unknown domain: ${domain}`);
  }
  const memory = loadMemory();
  const apiKey = getDeepSeekApiKey();
  if (!apiKey && !dryRun) {
    console.warn(
      'DEEPSEEK_API_KEY not set — messages will EN-copy missing keys; other domains need memory hits.'
    );
  }

  for (const locale of locales) {
    if (!EU.includes(locale as (typeof EU)[number]) && !['zh', 'zh-TW', 'ja', 'ko'].includes(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    await translateDomain(domain, locale, { dryRun, force, memory, apiKey });
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
