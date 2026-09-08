import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { getBlogPosts } from '@/data/blog';
import { games } from '@/data/games';
import { CONTENT_LOCALES, INDEXABLE_LOCALES } from '@/lib/locales';
import type { OverrideReason, WithI18nMeta } from '@/lib/i18n-rules/meta';

export type StudioDomain =
  | 'messages'
  | 'blog'
  | 'games'
  | 'about'
  | 'home-guide'
  | 'glossary'
  | 'site';

const ROOT = process.cwd();

const ALLOWED_PREFIXES = [
  path.join(ROOT, 'messages'),
  path.join(ROOT, 'data', 'blog-i18n'),
  path.join(ROOT, 'data', 'games-i18n'),
  path.join(ROOT, 'data', 'about-i18n'),
  path.join(ROOT, 'data', 'home-guide-i18n'),
  path.join(ROOT, 'data', 'glossary'),
  path.join(ROOT, 'data', 'site.json')
];

export function assertDevOnly() {
  if (process.env.NODE_ENV === 'production') {
    const err = new Error('Dev Content Studio is disabled in production');
    (err as Error & { status: number }).status = 404;
    throw err;
  }
}

export function resolveSafePath(rel: string): string {
  const normalized = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, '');
  const abs = path.resolve(ROOT, normalized);
  const ok = ALLOWED_PREFIXES.some(
    (prefix) => abs === prefix || abs.startsWith(prefix + path.sep)
  );
  if (!ok) {
    throw Object.assign(new Error(`Path not allowed: ${rel}`), { status: 400 });
  }
  return abs;
}

function readJson(abs: string): unknown {
  return JSON.parse(readFileSync(abs, 'utf8'));
}

function writeJson(abs: string, data: unknown) {
  writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function listDomain(domain: StudioDomain): { id: string; label: string }[] {
  switch (domain) {
    case 'messages':
      return [{ id: 'tree', label: 'UI messages (full tree)' }];
    case 'blog':
      return getBlogPosts().map((p) => ({ id: p.slug, label: p.title }));
    case 'games':
      return games.map((g) => ({ id: g.slug, label: g.title }));
    case 'about':
      return [{ id: 'doc', label: 'About page' }];
    case 'home-guide':
      return [{ id: 'doc', label: 'Home guide' }];
    case 'glossary':
      return readdirSync(path.join(ROOT, 'data', 'glossary'))
        .filter((f) => f === 'terms.json')
        .map(() => ({ id: 'terms', label: 'Glossary terms' }));
    case 'site':
      return [{ id: 'settings', label: 'Site settings' }];
    default:
      return [];
  }
}

export function getEntry(
  domain: StudioDomain,
  id: string,
  locale: string
): { en: unknown; locale: unknown; localeCode: string } {
  if (!(INDEXABLE_LOCALES as readonly string[]).includes(locale) && locale !== 'en') {
    throw Object.assign(new Error('Invalid locale'), { status: 400 });
  }

  switch (domain) {
    case 'messages': {
      const en = readJson(resolveSafePath('messages/en.json'));
      const locFile =
        locale === 'en'
          ? 'messages/en.json'
          : `messages/${locale}.json`;
      const loc = existsSync(path.join(ROOT, locFile))
        ? readJson(resolveSafePath(locFile))
        : {};
      return { en, locale: loc, localeCode: locale };
    }
    case 'blog': {
      const post = getBlogPosts().find((p) => p.slug === id);
      if (!post) throw Object.assign(new Error('Unknown blog slug'), { status: 404 });
      const en = {
        title: post.title,
        description: post.description,
        sections: post.sections,
        faq: post.faq
      };
      if (locale === 'en') return { en, locale: en, localeCode: 'en' };
      const file = readJson(
        resolveSafePath(`data/blog-i18n/${locale}.json`)
      ) as Record<string, unknown>;
      return { en, locale: file[id] ?? null, localeCode: locale };
    }
    case 'games': {
      const game = games.find((g) => g.slug === id);
      if (!game) throw Object.assign(new Error('Unknown game slug'), { status: 404 });
      const en = {
        title: game.title,
        description: game.description,
        content: game.content ?? null
      };
      if (locale === 'en') return { en, locale: en, localeCode: 'en' };
      const file = readJson(
        resolveSafePath(`data/games-i18n/${locale}.json`)
      ) as Record<string, unknown>;
      return { en, locale: file[id] ?? null, localeCode: locale };
    }
    case 'about': {
      const en = readJson(resolveSafePath('data/about-i18n/en.json'));
      const loc = readJson(
        resolveSafePath(`data/about-i18n/${locale === 'en' ? 'en' : locale}.json`)
      );
      return { en, locale: loc, localeCode: locale };
    }
    case 'home-guide': {
      const en = readJson(resolveSafePath('data/home-guide-i18n/en.json'));
      const loc = readJson(
        resolveSafePath(
          `data/home-guide-i18n/${locale === 'en' ? 'en' : locale}.json`
        )
      );
      return { en, locale: loc, localeCode: locale };
    }
    case 'glossary': {
      const terms = readJson(resolveSafePath('data/glossary/terms.json'));
      return { en: terms, locale: terms, localeCode: locale };
    }
    case 'site': {
      const site = readJson(resolveSafePath('data/site.json'));
      return { en: site, locale: site, localeCode: 'en' };
    }
    default:
      throw Object.assign(new Error('Unknown domain'), { status: 400 });
  }
}

export function saveEntry(
  domain: StudioDomain,
  id: string,
  locale: string,
  payload: unknown
): void {
  switch (domain) {
    case 'messages': {
      const file = locale === 'en' ? 'messages/en.json' : `messages/${locale}.json`;
      writeJson(resolveSafePath(file), payload);
      return;
    }
    case 'blog': {
      if (locale === 'en') {
        throw Object.assign(
          new Error(
            'English blog root lives in data/blog.ts — edit there or migrate to en.json later'
          ),
          { status: 400 }
        );
      }
      if (!(CONTENT_LOCALES as readonly string[]).includes(locale)) {
        throw Object.assign(new Error('Invalid locale'), { status: 400 });
      }
      const abs = resolveSafePath(`data/blog-i18n/${locale}.json`);
      const file = readJson(abs) as Record<string, unknown>;
      file[id] = payload;
      writeJson(abs, file);
      return;
    }
    case 'games': {
      if (locale === 'en') {
        throw Object.assign(
          new Error(
            'English game root lives in data/games.ts — edit there or migrate to en.json later'
          ),
          { status: 400 }
        );
      }
      const abs = resolveSafePath(`data/games-i18n/${locale}.json`);
      const file = readJson(abs) as Record<string, unknown>;
      file[id] = payload;
      writeJson(abs, file);
      return;
    }
    case 'about': {
      const file =
        locale === 'en'
          ? 'data/about-i18n/en.json'
          : `data/about-i18n/${locale}.json`;
      writeJson(resolveSafePath(file), payload);
      return;
    }
    case 'home-guide': {
      const file =
        locale === 'en'
          ? 'data/home-guide-i18n/en.json'
          : `data/home-guide-i18n/${locale}.json`;
      writeJson(resolveSafePath(file), payload);
      return;
    }
    case 'glossary': {
      writeJson(resolveSafePath('data/glossary/terms.json'), payload);
      return;
    }
    case 'site': {
      writeJson(resolveSafePath('data/site.json'), payload);
      return;
    }
    default:
      throw Object.assign(new Error('Unknown domain'), { status: 400 });
  }
}

/** Attach or update a field override on a locale entry object. */
export function markOverride(
  entry: WithI18nMeta & Record<string, unknown>,
  fieldPath: string,
  reason: OverrideReason,
  note?: string
): WithI18nMeta & Record<string, unknown> {
  const meta = entry._meta ?? { overrides: {} };
  const overrides = { ...(meta.overrides ?? {}) };
  overrides[fieldPath] = { reason, note };
  return { ...entry, _meta: { ...meta, overrides } };
}
