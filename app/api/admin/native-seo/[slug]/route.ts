import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getGame } from '@/data/games';
import {
  emptyNativeSeoPayload,
  getNativeSeoRow,
  rowToPayload,
  upsertNativeSeo,
  type NativeSeoPayload
} from '@/lib/native-seo';
import {
  isNativeSeoLocale,
  resolveAdminContentLocale
} from '@/lib/native-seo-locales';
import { revalidateGamePaths } from '@/lib/revalidate-games';
import { MAX_DESC, MAX_TITLE, validateString } from '@/lib/admin-validators';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

function parsePayload(body: unknown): NativeSeoPayload | NextResponse {
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;
  const titleErr = validateString('title', raw.title ?? '', {
    max: MAX_TITLE
  });
  if (titleErr) return titleErr;
  const descErr = validateString('description', raw.description ?? '', {
    max: MAX_DESC
  });
  if (descErr) return descErr;
  const seoTitleErr = validateString('seoTitle', raw.seoTitle ?? '', {
    max: MAX_TITLE
  });
  if (seoTitleErr) return seoTitleErr;
  const seoDescErr = validateString('seoDescription', raw.seoDescription ?? '', {
    max: MAX_DESC
  });
  if (seoDescErr) return seoDescErr;
  const introErr = validateString('intro', raw.intro ?? '', { max: 8000 });
  if (introErr) return introErr;

  const howToPlay = Array.isArray(raw.howToPlay)
    ? raw.howToPlay.filter((x): x is string => typeof x === 'string')
    : [];
  const tips = Array.isArray(raw.tips)
    ? raw.tips.filter((x): x is string => typeof x === 'string')
    : [];
  const faq: { question: string; answer: string }[] = [];
  if (Array.isArray(raw.faq)) {
    for (const item of raw.faq) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      if (typeof row.question === 'string' && typeof row.answer === 'string') {
        faq.push({
          question: row.question.slice(0, 500),
          answer: row.answer.slice(0, 4000)
        });
      }
    }
  }

  return {
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    seoTitle: String(raw.seoTitle ?? ''),
    seoDescription: String(raw.seoDescription ?? ''),
    intro: String(raw.intro ?? ''),
    howToPlay,
    tips,
    faq
  };
}

/** GET /api/admin/native-seo/[slug]?lang=en */
export async function GET(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;
  const game = getGame(slug);
  if (!game || game.gameType !== 'native') {
    return NextResponse.json({ error: 'Not a native game' }, { status: 404 });
  }
  const locale = resolveAdminContentLocale(
    req.nextUrl.searchParams.get('lang') ?? undefined
  );
  const row = await getNativeSeoRow(slug, locale);
  return NextResponse.json({
    locale,
    payload: row ? rowToPayload(row) : emptyNativeSeoPayload()
  });
}

/** PUT /api/admin/native-seo/[slug]?lang=zh */
export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;
  const game = getGame(slug);
  if (!game || game.gameType !== 'native') {
    return NextResponse.json({ error: 'Not a native game' }, { status: 404 });
  }
  const locale = resolveAdminContentLocale(
    req.nextUrl.searchParams.get('lang') ?? undefined
  );
  if (!isNativeSeoLocale(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }

  const parsed = parsePayload(await req.json());
  if (parsed instanceof NextResponse) return parsed;

  try {
    const row = await upsertNativeSeo(slug, locale, parsed);
    revalidateGamePaths(slug);
    return NextResponse.json({ ok: true, row: rowToPayload(row) });
  } catch (err) {
    console.error('[native-seo] upsert failed', err);
    return NextResponse.json(
      { error: 'Database write failed. Ensure NativeGameSeo migration is applied.' },
      { status: 500 }
    );
  }
}
