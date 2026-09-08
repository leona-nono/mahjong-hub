import { NextResponse } from 'next/server';
import { assertDevOnly } from '@/lib/i18n-studio/store';
import { runAllI18nChecks } from '@/lib/i18n-rules';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    assertDevOnly();
    const result = runAllI18nChecks();
    return NextResponse.json(result);
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'error' },
      { status }
    );
  }
}
