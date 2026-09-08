import { NextResponse } from 'next/server';
import {
  assertDevOnly,
  getEntry,
  markOverride,
  saveEntry,
  type StudioDomain
} from '@/lib/i18n-studio/store';
import type { OverrideReason, WithI18nMeta } from '@/lib/i18n-rules/meta';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    assertDevOnly();
    const body = (await req.json()) as {
      domain: StudioDomain;
      id: string;
      locale: string;
      fieldPath: string;
      reason?: OverrideReason;
      note?: string;
    };
    if (!body.domain || !body.id || !body.locale || !body.fieldPath) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }
    if (body.locale === 'en') {
      return NextResponse.json(
        { error: 'Overrides apply to locale entries, not EN root' },
        { status: 400 }
      );
    }
    const { locale: entry } = getEntry(body.domain, body.id, body.locale);
    if (!entry || typeof entry !== 'object') {
      return NextResponse.json({ error: 'entry missing' }, { status: 404 });
    }
    const next = markOverride(
      entry as WithI18nMeta & Record<string, unknown>,
      body.fieldPath,
      body.reason ?? 'locale_idiom',
      body.note
    );
    saveEntry(body.domain, body.id, body.locale, next);
    return NextResponse.json({ ok: true, entry: next });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status }
    );
  }
}
