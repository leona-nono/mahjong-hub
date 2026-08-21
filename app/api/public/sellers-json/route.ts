import { NextResponse } from 'next/server';
import { buildSellersJson } from '@/lib/ads-inventory';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(buildSellersJson(), {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
