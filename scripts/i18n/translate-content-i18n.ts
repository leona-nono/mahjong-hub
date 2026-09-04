/**
 * Offline content i18n translator (DeepSeek + glossary lock + memory cache).
 *
 * Usage (local only — never imported by Next.js runtime):
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain about --locales es,fr,de,pt-BR
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain home-guide --locales es,fr,de,pt-BR
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain games --locales fr,de,pt-BR
 *   npx tsx scripts/i18n/translate-content-i18n.ts --domain games --locales de --dry-run
 *
 * Requires DEEPSEEK_API_KEY unless every string is already in .cache/i18n-memory.json.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { games } from '../../data/games';
import type { GlossaryLocale } from '../../data/glossary';
import {
  getDeepSeekApiKey,
  loadMemory,
  saveMemory,
  translateTree
} from './deepseek-client';

const ROOT = path.join(process.cwd(), 'data');
const EU = ['es', 'fr', 'de', 'pt-BR'] as const satisfies readonly GlossaryLocale[];

type Domain = 'about' | 'home-guide' | 'games';

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

function writeJson(rel: string, data: unknown) {
  const file = path.join(ROOT, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${file}`);
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

async function translateDomain(
  domain: Domain,
  locale: GlossaryLocale,
  opts: { dryRun: boolean; force: boolean; memory: ReturnType<typeof loadMemory>; apiKey?: string }
) {
  const outRel =
    domain === 'games'
      ? `games-i18n/${locale}.json`
      : `${domain}-i18n/${locale}.json`;
  const outPath = path.join(ROOT, outRel);
  if (existsSync(outPath) && !opts.force) {
    console.log(`Skip existing ${outRel} (pass --force to overwrite)`);
    return;
  }

  let source: unknown;
  if (domain === 'games') {
    source = englishGamesCatalogue();
  } else {
    source = JSON.parse(readFileSync(path.join(ROOT, `${domain}-i18n/en.json`), 'utf8'));
  }

  console.log(`Translating ${domain} → ${locale}…`);
  const translated = await translateTree(source, locale, {
    memory: opts.memory,
    apiKey: opts.apiKey,
    dryRun: opts.dryRun
  });
  writeJson(outRel, translated);
  saveMemory(opts.memory);
}

async function main() {
  const { domain, locales, dryRun, force } = parseArgs();
  if (!['about', 'home-guide', 'games'].includes(domain)) {
    throw new Error(`Unknown domain: ${domain}`);
  }
  const memory = loadMemory();
  const apiKey = getDeepSeekApiKey();
  if (!apiKey && !dryRun) {
    console.warn('DEEPSEEK_API_KEY not set — will only succeed for memory/glossary hits.');
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
