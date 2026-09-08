import { NextResponse } from 'next/server';
import { assertDevOnly, listDomain, type StudioDomain } from '@/lib/i18n-studio/store';
import { INDEXABLE_LOCALES } from '@/lib/locales';

export const dynamic = 'force-dynamic';

const DOMAINS: StudioDomain[] = [
  'messages',
  'blog',
  'games',
  'about',
  'home-guide',
  'glossary',
  'site'
];

export async function GET(req: Request) {
  try {
    assertDevOnly();
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') as StudioDomain | null;
    if (domain && DOMAINS.includes(domain)) {
      return NextResponse.json({
        domain,
        items: listDomain(domain),
        locales: INDEXABLE_LOCALES
      });
    }
    return NextResponse.json({
      domains: DOMAINS,
      locales: INDEXABLE_LOCALES
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status }
    );
  }
}
