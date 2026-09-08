import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import {
  GLOSSARY,
  GLOSSARY_REQUIRED_LOCALES,
  type GlossaryLocale
} from '@/data/glossary';
import { getBlogPosts } from '@/data/blog';
import { games } from '@/data/games';
import { CONTENT_LOCALES } from '@/lib/locales';
import {
  isSoftExempt,
  stripMeta,
  type I18nEntryMeta,
  type WithI18nMeta
} from './meta';
import {
  emptyResult,
  error,
  mergeResults,
  warning,
  type CheckResult,
  type I18nFinding
} from './types';
import {
  collectStringBlob,
  isCjkLocale,
  pushResidualFinding,
  scanGlossaryResiduals
} from './residual';

const DATA = path.join(process.cwd(), 'data');

function loadJson(rel: string): unknown {
  return JSON.parse(readFileSync(path.join(DATA, rel), 'utf8'));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function softLengthWarning(
  findings: I18nFinding[],
  domain: string,
  locale: string,
  fieldPath: string,
  en: string,
  loc: string,
  meta?: I18nEntryMeta
) {
  if (isSoftExempt(meta, fieldPath)) return;
  if (!en || !loc) return;
  const ratio = loc.length / Math.max(en.length, 1);
  // CJK scripts are denser — allow shorter titles without noise.
  const low = isCjkLocale(locale) ? 0.12 : 0.35;
  const high = isCjkLocale(locale) ? 4.5 : 3.5;
  if (ratio < low || ratio > high) {
    findings.push(
      warning(
        domain,
        fieldPath,
        `length ratio ${ratio.toFixed(2)} vs EN (soft)`,
        locale
      )
    );
  }
}

function blogSectionShape(sections: unknown): string {
  if (!Array.isArray(sections)) return '';
  return sections
    .map((section) => {
      const record = asRecord(section);
      const body = record && Array.isArray(record.body) ? record.body : [];
      const tiles = record?.tiles;
      const hasTiles = Array.isArray(tiles) && tiles.length > 0;
      return `${body.length}:${hasTiles ? 1 : 0}`;
    })
    .join('|');
}

function docSectionShape(doc: {
  sections?: Array<{
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

export function checkGlossary(): CheckResult {
  const errors: I18nFinding[] = [];
  for (const [key, entry] of Object.entries(GLOSSARY)) {
    if (!entry.source?.trim()) {
      errors.push(error('glossary', key, 'empty source'));
    }
    if (entry.type !== 'term' && entry.type !== 'text') {
      errors.push(error('glossary', key, `invalid type ${entry.type}`));
    }
    for (const locale of GLOSSARY_REQUIRED_LOCALES) {
      const v = entry.i18n[locale as GlossaryLocale];
      if (!v?.trim()) {
        errors.push(error('glossary', `${key}.i18n.${locale}`, 'missing', locale));
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function checkBlogI18n(): CheckResult {
  const errors: I18nFinding[] = [];
  const warnings: I18nFinding[] = [];
  const posts = getBlogPosts();

  for (const locale of CONTENT_LOCALES) {
    const file = path.join(DATA, 'blog-i18n', `${locale}.json`);
    if (!existsSync(file)) {
      errors.push(error('blog', locale, 'locale file missing', locale));
      continue;
    }
    const data = loadJson(`blog-i18n/${locale}.json`) as Record<
      string,
      WithI18nMeta & {
        title?: string;
        description?: string;
        sections?: unknown[];
        faq?: unknown[];
      }
    >;

    for (const post of posts) {
      const raw = data[post.slug];
      if (!raw) {
        errors.push(error('blog', post.slug, 'missing slug', locale));
        continue;
      }
      const meta = raw._meta;
      const entry = stripMeta(raw as Record<string, unknown>) as {
        title?: string;
        description?: string;
        sections?: unknown[];
        faq?: unknown[];
      };

      if (!Array.isArray(entry.sections) || entry.sections.length !== post.sections.length) {
        errors.push(
          error('blog', `${post.slug}.sections`, 'section count mismatch', locale)
        );
      }
      if (!Array.isArray(entry.faq) || entry.faq.length !== post.faq.length) {
        errors.push(error('blog', `${post.slug}.faq`, 'faq count mismatch', locale));
      }
      if (blogSectionShape(entry.sections) !== blogSectionShape(post.sections)) {
        errors.push(
          error(
            'blog',
            `${post.slug}.sections`,
            'section body/tiles shape mismatch',
            locale
          )
        );
      }
      const bag = { errors, warnings };
      pushResidualFinding(
        bag,
        'blog',
        locale,
        `${post.slug}.title`,
        post.title,
        entry.title,
        meta
      );
      pushResidualFinding(
        bag,
        'blog',
        locale,
        `${post.slug}.description`,
        post.description,
        entry.description,
        meta
      );
      if (typeof entry.title === 'string' && typeof post.title === 'string') {
        softLengthWarning(
          warnings,
          'blog',
          locale,
          `${post.slug}.title`,
          post.title,
          entry.title,
          meta
        );
      }
      warnings.push(
        ...scanGlossaryResiduals(
          'blog',
          locale,
          collectStringBlob(entry)
        ).map((f) => ({ ...f, path: `${post.slug}.${f.path}` }))
      );
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function checkAboutHomeGuide(): CheckResult {
  const errors: I18nFinding[] = [];
  const warnings: I18nFinding[] = [];

  for (const domain of ['about-i18n', 'home-guide-i18n'] as const) {
    const en = loadJson(`${domain}/en.json`) as WithI18nMeta & {
      title?: string;
      intro?: string;
      sections?: unknown[];
      closing?: unknown[];
    };
    const enClean = stripMeta(en as Record<string, unknown>) as typeof en;

    for (const locale of CONTENT_LOCALES) {
      const doc = loadJson(`${domain}/${locale}.json`) as typeof en;
      const meta = doc._meta;
      const locClean = stripMeta(doc as Record<string, unknown>) as typeof en;

      if (
        JSON.stringify(locClean) === JSON.stringify(enClean) &&
        !isSoftExempt(meta, '*')
      ) {
        errors.push(
          error(domain, locale, 'document identical to English', locale)
        );
      }
      if (docSectionShape(locClean as never) !== docSectionShape(enClean as never)) {
        errors.push(
          error(domain, `${locale}.sections`, 'section structure differs from en', locale)
        );
      }
      if (domain === 'home-guide-i18n') {
        const enClosing = (enClean.closing ?? []).length;
        const locClosing = (locClean.closing ?? []).length;
        if (enClosing !== locClosing) {
          errors.push(
            error(
              domain,
              `${locale}.closing`,
              `closing length ${locClosing} != ${enClosing}`,
              locale
            )
          );
        }
      }
      if (typeof enClean.title === 'string' && typeof locClean.title === 'string') {
        softLengthWarning(
          warnings,
          domain,
          locale,
          'title',
          enClean.title,
          locClean.title,
          meta
        );
      }
      const bag = { errors, warnings };
      pushResidualFinding(bag, domain, locale, 'title', enClean.title, locClean.title, meta);
      pushResidualFinding(bag, domain, locale, 'intro', enClean.intro, locClean.intro, meta);
      warnings.push(...scanGlossaryResiduals(domain, locale, collectStringBlob(locClean)));
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function checkGamesI18n(): CheckResult {
  const errors: I18nFinding[] = [];
  const warnings: I18nFinding[] = [];
  const enBySlug = new Map(games.map((g) => [g.slug, g]));

  for (const locale of CONTENT_LOCALES) {
    const file = loadJson(`games-i18n/${locale}.json`) as Record<
      string,
      WithI18nMeta & {
        title?: string;
        description?: string;
        content?: {
          intro?: string;
          howToPlay?: string[];
          tips?: string[];
          features?: string[];
          supportedDevices?: string;
          faq?: unknown[];
        };
      }
    >;

    for (const [slug, raw] of Object.entries(file)) {
      const base = enBySlug.get(slug);
      if (!base) {
        errors.push(error('games', slug, 'unknown slug', locale));
        continue;
      }
      const meta = raw._meta;
      const entry = stripMeta(raw as Record<string, unknown>) as typeof raw;

      if (!entry.title?.trim() || !entry.description?.trim()) {
        errors.push(error('games', `${slug}`, 'missing title/description', locale));
      }
      if (entry.title === base.title && !isSoftExempt(meta, 'title')) {
        errors.push(error('games', `${slug}.title`, 'still English', locale));
      }
      if (entry.description === base.description && !isSoftExempt(meta, 'description')) {
        errors.push(error('games', `${slug}.description`, 'still English', locale));
      }

      const content = entry.content;
      const enContent = base.content;
      if (enContent) {
        if (!content) {
          errors.push(
            error('games', `${slug}.content`, 'missing content (EN has full copy)', locale)
          );
          continue;
        }
        for (const key of [
          'intro',
          'howToPlay',
          'tips',
          'features',
          'supportedDevices',
          'faq'
        ] as const) {
          const locVal = content[key];
          const enVal = enContent[key];
          if (enVal == null) continue;
          if (locVal == null || (Array.isArray(locVal) && locVal.length === 0)) {
            errors.push(
              error('games', `${slug}.content.${key}`, 'missing', locale)
            );
          }
        }
      }
      if (!content || !enContent) continue;

      const same = (a: unknown, b: unknown) =>
        JSON.stringify(a) === JSON.stringify(b);

      if (
        content.features &&
        enContent.features &&
        same(content.features, enContent.features) &&
        !isSoftExempt(meta, 'content.features')
      ) {
        errors.push(error('games', `${slug}.content.features`, 'still English', locale));
      }
      if (
        content.supportedDevices &&
        enContent.supportedDevices &&
        content.supportedDevices === enContent.supportedDevices &&
        !isSoftExempt(meta, 'content.supportedDevices')
      ) {
        errors.push(
          error('games', `${slug}.content.supportedDevices`, 'still English', locale)
        );
      }
      if (
        content.howToPlay &&
        enContent.howToPlay &&
        same(content.howToPlay, enContent.howToPlay) &&
        !isSoftExempt(meta, 'content.howToPlay')
      ) {
        errors.push(error('games', `${slug}.content.howToPlay`, 'still English', locale));
      }
      if (
        content.intro &&
        enContent.intro &&
        content.intro === enContent.intro &&
        !isSoftExempt(meta, 'content.intro')
      ) {
        errors.push(error('games', `${slug}.content.intro`, 'still English', locale));
      }

      if (typeof entry.title === 'string') {
        softLengthWarning(
          warnings,
          'games',
          locale,
          `${slug}.title`,
          base.title,
          entry.title,
          meta
        );
      }
      warnings.push(
        ...scanGlossaryResiduals('games', locale, collectStringBlob(entry)).map(
          (f) => ({ ...f, path: `${slug}.${f.path}` })
        )
      );
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function checkMessagesStructure(): CheckResult {
  const errors: I18nFinding[] = [];
  const warnings: I18nFinding[] = [];
  const messagesDir = path.join(process.cwd(), 'messages');
  const enPath = path.join(messagesDir, 'en.json');
  if (!existsSync(enPath)) {
    return {
      ok: false,
      errors: [error('messages', 'en.json', 'missing')],
      warnings: []
    };
  }
  const en = JSON.parse(readFileSync(enPath, 'utf8')) as Record<string, unknown>;

  function flatten(
    obj: Record<string, unknown>,
    prefix = ''
  ): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === '_meta') continue;
      const p = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        Object.assign(out, flatten(v as Record<string, unknown>, p));
      } else if (typeof v === 'string') {
        out[p] = v;
      }
    }
    return out;
  }

  const enFlat = flatten(en);
  for (const locale of CONTENT_LOCALES) {
    const locPath = path.join(messagesDir, `${locale}.json`);
    if (!existsSync(locPath)) {
      errors.push(error('messages', locale, 'file missing', locale));
      continue;
    }
    const loc = JSON.parse(readFileSync(locPath, 'utf8')) as Record<string, unknown>;
    const locFlat = flatten(loc);
    for (const key of Object.keys(enFlat)) {
      if (!(key in locFlat)) {
        warnings.push(
          warning('messages', key, 'missing key (falls back to EN)', locale)
        );
      } else if (locFlat[key] === enFlat[key] && locFlat[key].length > 12) {
        const bag = { errors, warnings };
        pushResidualFinding(
          bag,
          'messages',
          locale,
          key,
          enFlat[key],
          locFlat[key],
          undefined
        );
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

/** Full catalogue check used by Studio + `npm run i18n:check`. */
export function runAllI18nChecks(): CheckResult {
  return mergeResults(
    checkGlossary(),
    checkBlogI18n(),
    checkAboutHomeGuide(),
    checkGamesI18n(),
    checkMessagesStructure()
  );
}

export {
  CJK_LOCALES,
  collectStringBlob,
  isCjkLocale,
  pushResidualFinding,
  scanGlossaryResiduals
} from './residual';
export { emptyResult, mergeResults } from './types';
export type { CheckResult, FindingSeverity, I18nFinding } from './types';
export type { FieldOverride, I18nEntryMeta, OverrideReason, WithI18nMeta } from './meta';
export {
  hasFieldOverride,
  isSoftExempt,
  stripMeta
} from './meta';
