import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { GameContent, GameFaq } from '@/data/games';
import { GAME_I18N } from '@/data/games.i18n';
import {
  NATIVE_SEO_LOCALES,
  type NativeSeoLocale
} from '@/lib/native-seo-locales';

export type NativeSeoPayload = {
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  howToPlay: string[];
  tips: string[];
  faq: GameFaq[];
};

export type LocaleCoverageStatus = 'ok' | 'partial' | 'missing';

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function asFaqArray(value: unknown): GameFaq[] {
  if (!Array.isArray(value)) return [];
  const out: GameFaq[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (typeof row.question === 'string' && typeof row.answer === 'string') {
      out.push({ question: row.question, answer: row.answer });
    }
  }
  return out;
}

export function rowToPayload(row: {
  title: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  intro: string | null;
  howToPlay: unknown;
  tips: unknown;
  faq: unknown;
}): NativeSeoPayload {
  return {
    title: row.title ?? '',
    description: row.description ?? '',
    seoTitle: row.seoTitle ?? '',
    seoDescription: row.seoDescription ?? '',
    intro: row.intro ?? '',
    howToPlay: asStringArray(row.howToPlay),
    tips: asStringArray(row.tips),
    faq: asFaqArray(row.faq)
  };
}

export function emptyNativeSeoPayload(): NativeSeoPayload {
  return {
    title: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    intro: '',
    howToPlay: [],
    tips: [],
    faq: []
  };
}

export async function getNativeSeoRow(slug: string, locale: NativeSeoLocale) {
  try {
    return await prisma.nativeGameSeo.findUnique({
      where: { slug_locale: { slug, locale } }
    });
  } catch {
    return null;
  }
}

/** Static i18n has usable page body for this locale (en always from base). */
export function hasStaticLocaleBody(
  slug: string,
  locale: NativeSeoLocale,
  englishHasContent: boolean
): boolean {
  if (locale === 'en') return englishHasContent;
  const i18n = GAME_I18N[slug];
  const body = i18n?.content?.[locale];
  return Boolean(body?.intro?.trim() || body?.howToPlay?.length || body?.tips?.length);
}

export function payloadHasBody(payload: NativeSeoPayload): boolean {
  return Boolean(
    payload.intro.trim() ||
      payload.howToPlay.length ||
      payload.tips.length ||
      payload.faq.length
  );
}

export function payloadHasSeo(payload: NativeSeoPayload): boolean {
  return Boolean(
    payload.seoTitle.trim() ||
      payload.seoDescription.trim() ||
      payload.title.trim() ||
      payload.description.trim()
  );
}

export async function listNativeSeoRows(slug: string) {
  try {
    return await prisma.nativeGameSeo.findMany({ where: { slug } });
  } catch {
    return [];
  }
}

/**
 * Per-locale coverage for detecting missing / partial multi-language content.
 * `ok` = CMS body or solid static body; `partial` = title/SEO only; `missing` = neither.
 */
export async function getNativeLocaleCoverage(
  slug: string,
  englishHasContent: boolean
): Promise<Record<NativeSeoLocale, LocaleCoverageStatus>> {
  const rows = await listNativeSeoRows(slug);
  const byLocale = new Map(
    rows.map((row) => [row.locale, rowToPayload(row)] as const)
  );

  const coverage = {} as Record<NativeSeoLocale, LocaleCoverageStatus>;
  for (const locale of NATIVE_SEO_LOCALES) {
    const cms = byLocale.get(locale);
    if (cms && payloadHasBody(cms)) {
      coverage[locale] = 'ok';
      continue;
    }
    if (hasStaticLocaleBody(slug, locale, englishHasContent)) {
      coverage[locale] = 'ok';
      continue;
    }
    if (cms && payloadHasSeo(cms)) {
      coverage[locale] = 'partial';
      continue;
    }
    coverage[locale] = 'missing';
  }
  return coverage;
}

/** Apply CMS overlay onto static GameContent for one locale. */
export function mergeNativeContent(
  base: GameContent | undefined,
  cms: NativeSeoPayload | null
): GameContent | undefined {
  if (!base && !cms) return undefined;
  const fallback: GameContent = base ?? {
    intro: '',
    howToPlay: [],
    tips: [],
    faq: []
  };
  if (!cms) return fallback;
  return {
    intro: cms.intro.trim() || fallback.intro,
    howToPlay: cms.howToPlay.length ? cms.howToPlay : fallback.howToPlay,
    tips: cms.tips.length ? cms.tips : fallback.tips,
    faq: cms.faq.length ? cms.faq : fallback.faq
  };
}

export async function upsertNativeSeo(
  slug: string,
  locale: NativeSeoLocale,
  payload: NativeSeoPayload
) {
  const howToPlay = payload.howToPlay as Prisma.InputJsonValue;
  const tips = payload.tips as Prisma.InputJsonValue;
  const faq = payload.faq as unknown as Prisma.InputJsonValue;
  return prisma.nativeGameSeo.upsert({
    where: { slug_locale: { slug, locale } },
    create: {
      slug,
      locale,
      title: payload.title.trim() || null,
      description: payload.description.trim() || null,
      seoTitle: payload.seoTitle.trim() || null,
      seoDescription: payload.seoDescription.trim() || null,
      intro: payload.intro.trim() || null,
      howToPlay,
      tips,
      faq
    },
    update: {
      title: payload.title.trim() || null,
      description: payload.description.trim() || null,
      seoTitle: payload.seoTitle.trim() || null,
      seoDescription: payload.seoDescription.trim() || null,
      intro: payload.intro.trim() || null,
      howToPlay,
      tips,
      faq
    }
  });
}
