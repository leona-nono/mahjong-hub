/**
 * Offline DeepSeek i18n client — used only by local scripts.
 * Runtime Next.js never imports this module.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { GLOSSARY, type GlossaryLocale } from '../../data/glossary';

const MEMORY_PATH = path.join(process.cwd(), '.cache', 'i18n-memory.json');
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

export type MemoryStore = Record<string, string>;

function memoryKey(locale: string, source: string): string {
  return createHash('sha256').update(`${locale}\n${source}`).digest('hex');
}

export function loadMemory(): MemoryStore {
  if (!existsSync(MEMORY_PATH)) return {};
  return JSON.parse(readFileSync(MEMORY_PATH, 'utf8')) as MemoryStore;
}

export function saveMemory(store: MemoryStore) {
  mkdirSync(path.dirname(MEMORY_PATH), { recursive: true });
  writeFileSync(MEMORY_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

export function glossaryLockTable(locale: GlossaryLocale): string {
  return Object.entries(GLOSSARY)
    .map(([key, entry]) => {
      const locked = entry.i18n[locale] ?? entry.source;
      return `- ${key}: EN "${entry.source}" → ${locale} "${locked}"`;
    })
    .join('\n');
}

function systemPrompt(locale: GlossaryLocale): string {
  const names: Record<GlossaryLocale, string> = {
    zh: 'Simplified Chinese',
    'zh-TW': 'Traditional Chinese (Taiwan)',
    ja: 'Japanese',
    ko: 'Korean',
    es: 'Spanish (Spain / LatAm web formal)',
    fr: 'French',
    de: 'German',
    'pt-BR': 'Brazilian Portuguese'
  };
  return [
    `You translate Mahjong Hub marketing and rules copy from English into ${names[locale]}.`,
    'English is the only source language. Never reverse-translate from Chinese.',
    'Output ONLY the translated text. Preserve JSON structure, href paths, punctuation used as UI separators (→), and brand name "Mahjong Hub".',
    'Locked mahjong terminology — use these exact strings, never synonyms:',
    glossaryLockTable(locale),
    'Tone: clear written game-site copy, not slang. Keep link labels natural for the locale.'
  ].join('\n');
}

export async function translateText(
  source: string,
  locale: GlossaryLocale,
  opts: { memory: MemoryStore; apiKey?: string; dryRun?: boolean }
): Promise<string> {
  const trimmed = source.trim();
  if (!trimmed) return source;

  const key = memoryKey(locale, source);
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
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt(locale) },
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
    if (keyHint === 'href' || keyHint === 'suit' || value.startsWith('/')) {
      return value;
    }
    // Keep pure separators / arrows
    if (/^[\s→\-—,./]*$/.test(value)) return value;
    return translateText(value, locale, opts);
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
