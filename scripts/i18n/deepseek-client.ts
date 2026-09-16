/**
 * Offline DeepSeek i18n client — used only by local scripts.
 * Runtime Next.js never imports this module.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { GlossaryLocale } from '../../data/glossary';
import { buildLocalePrompt, LOCALE_SHEETS, SPEC_VERSION } from './localization-spec';

const MEMORY_PATH = path.join(process.cwd(), '.cache', 'i18n-memory.json');
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

export type MemoryStore = Record<string, string>;

/**
 * The cache is keyed by prompt version + locale + source. The version comes from
 * `localization-spec.ts` rather than living here, because a local copy drifts: the spec
 * can be rewritten while this file still claims an old version, and every cached string
 * keeps answering with its pre-change wording — a rewrite that appears to have no effect.
 * Bump `SPEC_VERSION` in the spec and the whole cache is retired at once.
 */
function memoryKey(locale: string, source: string, prose: boolean): string {
  return createHash('sha256')
    .update(`${SPEC_VERSION}\n${prose ? 'prose' : 'label'}\n${locale}\n${source}`)
    .digest('hex');
}

/** Prose decodes differently every time, so it samples warmer than a locked label. */
const PROSE_TEMPERATURE = 0.35;
const LABEL_TEMPERATURE = 0.1;

export function loadMemory(): MemoryStore {
  if (!existsSync(MEMORY_PATH)) return {};
  return JSON.parse(readFileSync(MEMORY_PATH, 'utf8')) as MemoryStore;
}

export function saveMemory(store: MemoryStore) {
  mkdirSync(path.dirname(MEMORY_PATH), { recursive: true });
  writeFileSync(MEMORY_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

/**
 * Locale labels live in the spec, next to the rules that use them — one list, not two.
 */
export const LOCALE_NAMES = Object.fromEntries(
  Object.entries(LOCALE_SHEETS).map(([locale, sheet]) => [locale, sheet.label])
) as Record<GlossaryLocale, string>;

/**
 * Fields whose job is to read well. Long-form prose is localized with a
 * rewrite-oriented brief and a higher sampling temperature; short labels keep the
 * conservative settings that suit terminology-locked strings.
 */
const PROSE_KEYS = new Set([
  'title',
  'description',
  'heading',
  'body',
  'question',
  'answer',
  'intro',
  'howToPlay',
  'tips'
]);

export function isProseKey(keyHint: string): boolean {
  return PROSE_KEYS.has(keyHint);
}

/**
 * The prompt is owned by localization-spec.ts, next to the linter's copy of the
 * same rules — a calibration sentence that the translator follows but the gate
 * does not know about is how translationese shipped in the first place.
 */
function systemPrompt(locale: GlossaryLocale, prose = false): string {
  return buildLocalePrompt(locale, prose);
}

export async function translateText(
  source: string,
  locale: GlossaryLocale,
  opts: { memory: MemoryStore; apiKey?: string; dryRun?: boolean; prose?: boolean }
): Promise<string> {
  const trimmed = source.trim();
  if (!trimmed) return source;

  const prose = opts.prose ?? false;
  const key = memoryKey(locale, source, prose);
  if (opts.memory[key]) return opts.memory[key];

  // Identity for locked glossary English sources
  for (const entry of Object.values(GLOSSARY)) {
    if (entry.source === source && entry.i18n[locale]) {
      opts.memory[key] = entry.i18n[locale]!;
      return entry.i18n[locale]!;
    }
  }

  if (opts.dryRun || !opts.apiKey) {
    throw new Error(
      `Missing translation memory for locale=${locale}. Set DEEPSEEK_API_KEY or seed .cache/i18n-memory.json. Source: ${source.slice(0, 80)}…`
    );
  }

  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: prose ? PROSE_TEMPERATURE : LABEL_TEMPERATURE,
      messages: [
        { role: 'system', content: systemPrompt(locale, prose) },
        { role: 'user', content: source }
      ]
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepSeek HTTP ${res.status}: ${body.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('DeepSeek returned empty content');

  opts.memory[key] = text;
  return text;
}

/** Walk a JSON-like tree and translate every string leaf (skip href keys). */
export async function translateTree(
  value: unknown,
  locale: GlossaryLocale,
  opts: { memory: MemoryStore; apiKey?: string; dryRun?: boolean },
  keyHint = ''
): Promise<unknown> {
  if (typeof value === 'string') {
    if (keyHint === 'href' || keyHint === 'suit' || keyHint === 'wind' || keyHint === 'dragon' || keyHint === 'rank' || value.startsWith('/')) {
      return value;
    }
    // Keep pure separators / arrows
    if (/^[\s→\-—,./]*$/.test(value)) return value;
    return translateText(value, locale, { ...opts, prose: isProseKey(keyHint) });
  }
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) {
      out.push(await translateTree(item, locale, opts, keyHint));
    }
    return out;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = await translateTree(v, locale, opts, k);
    }
    return out;
  }
  return value;
}

export function getDeepSeekApiKey(): string | undefined {
  return process.env.DEEPSEEK_API_KEY?.trim() || undefined;
}
