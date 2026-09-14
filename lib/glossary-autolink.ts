import { GLOSSARY } from '@/data/glossary';

const MD_LINK = /\[[^\]]+\]\([^)]+\)/g;

export type GlossaryLink = { key: string; label: string };

const AUTO_SKIP = new Set(['chow', 'pong', 'kong']);

const SKIP_KEYS = new Set(
  Object.entries(GLOSSARY)
    .filter(([, entry]) => entry.type !== 'term')
    .map(([key]) => key)
);

export function glossaryLinkLabel(key: string, locale: string): string | undefined {
  if (SKIP_KEYS.has(key)) return undefined;
  const entry = GLOSSARY[key];
  if (!entry) return undefined;
  if (locale === 'en') return entry.source;
  const localized = entry.i18n[locale as keyof typeof entry.i18n];
  return localized || entry.source;
}

export function glossaryLabels(locale: string): GlossaryLink[] {
  return Object.keys(GLOSSARY)
    .filter((key) => !AUTO_SKIP.has(key))
    .map((key) => {
      const label = glossaryLinkLabel(key, locale);
      return label ? { key, label } : undefined;
    })
    .filter((item): item is GlossaryLink => Boolean(item))
    .filter((item) => item.label.trim().length >= 2)
    .sort((a, b) => b.label.length - a.label.length);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

function splitProtected(text: string): { linked: boolean; text: string }[] {
  const parts: { linked: boolean; text: string }[] = [];
  let last = 0;
  for (const match of text.matchAll(MD_LINK)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ linked: false, text: text.slice(last, index) });
    parts.push({ linked: true, text: match[0] });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ linked: false, text: text.slice(last) });
  return parts;
}

/**
 * Link the first unused glossary term in plain text. Existing markdown links
 * are left alone. Short CJK labels (吃 / 碰) are skipped so they do not
 * paint the paragraph blue.
 */
export function autolinkParagraph(
  text: string,
  labels: GlossaryLink[],
  used: Set<string>
): { text: string; key?: string } {
  if (used.size >= 6) return { text };
  const parts = splitProtected(text);
  for (const label of labels) {
    if (used.has(label.key)) continue;
    if (isCjk(label.label) && label.label.length < 2) continue;
    const pattern = isCjk(label.label)
      ? new RegExp(escapeRegExp(label.label))
      : new RegExp(`(^|[^A-Za-z0-9])(${escapeRegExp(label.label)})(?![A-Za-z0-9])`, 'i');
    const index = parts.findIndex((part) => !part.linked && pattern.test(part.text));
    if (index < 0) continue;
    const part = parts[index];
    if (!part) continue;
    part.text = part.text.replace(pattern, (full, prefix: string | undefined, word: string | undefined) => {
      const anchor = word ?? full;
      const lead = word ? prefix ?? '' : '';
      return `${lead}[${anchor}](/learn/glossary#${label.key})`;
    });
    used.add(label.key);
    return { text: parts.map((item) => item.text).join(''), key: label.key };
  }
  return { text };
}
