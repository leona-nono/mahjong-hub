import { NextResponse } from 'next/server';
import { buildAdsTxt } from '@/lib/ads-inventory';

export const dynamic = 'force-static';

export async function GET() {
  return new NextResponse(buildAdsTxt(), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
