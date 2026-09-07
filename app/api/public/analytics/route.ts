import { NextResponse } from 'next/server';

export const revalidate = 86400;

/**
 * GET /api/public/analytics
 * Tracking IDs from env only (ops CMS SiteSetting removed).
 */
export async function GET() {
  return NextResponse.json(
    {
      ga: process.env.NEXT_PUBLIC_GA_ID || 'G-61V8MK15S6',
      gtm: process.env.NEXT_PUBLIC_GTM_ID || ''
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400'
      }
    }
  );
}
