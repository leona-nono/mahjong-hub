import { NextResponse } from 'next/server';
import {
  assertDevOnly,
  getEntry,
  saveEntry,
  type StudioDomain
} from '@/lib/i18n-studio/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    assertDevOnly();
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') as StudioDomain;
    const id = url.searchParams.get('id') || 'doc';
    const locale = url.searchParams.get('locale') || 'en';
    const data = getEntry(domain, id, locale);
    return NextResponse.json(data);
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status }
    );
  }
}

export async function PUT(req: Request) {
  try {
    assertDevOnly();
    const body = (await req.json()) as {
      domain: StudioDomain;
      id: string;
      locale: string;
      payload: unknown;
    };
    if (!body.domain || !body.id || !body.locale) {
      return NextResponse.json({ error: 'domain, id, locale required' }, { status: 400 });
    }
    saveEntry(body.domain, body.id, body.locale, body.payload);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status }
    );
  }
}
