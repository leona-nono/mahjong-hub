import { NextRequest, NextResponse } from 'next/server';
import { utcDateString } from '@/lib/points-rules';
import { resolveDeal } from '@/lib/solitaire-catalog';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')?.trim();
  if (!id || id.length > 32) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const today = utcDateString();
  try {
    const deal = resolveDeal(id === 'daily' ? `daily:${today}` : id, today);
    if (!deal) {
      return NextResponse.json({ error: 'unknown_level' }, { status: 404 });
    }
    return NextResponse.json(deal);
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
