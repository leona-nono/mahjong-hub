import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Cache the read for an hour so static pages don't hammer the DB on every request.
export const revalidate = 3600;

/**
 * GET /api/public/analytics
 *
 * Returns only the non-sensitive tracking IDs (GA4 + GTM) from the `analytics`
 * SiteSetting row. This is already public information (it ends up in the page
 * source anyway), so no admin guard is needed — but we deliberately return
 * nothing else from the settings blob.
 */
export async function GET() {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: 'analytics' }
    });
    const value = (row?.value ?? {}) as { ga?: string; gtm?: string };
    return NextResponse.json(
      {
        ga: value.ga || process.env.NEXT_PUBLIC_GA_ID || 'G-61V8MK15S6',
        gtm: value.gtm || process.env.NEXT_PUBLIC_GTM_ID || ''
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400'
        }
      }
    );
  } catch {
    // DB unreachable — fail silent, just don't load analytics.
    return NextResponse.json({
      ga: process.env.NEXT_PUBLIC_GA_ID || 'G-61V8MK15S6',
      gtm: process.env.NEXT_PUBLIC_GTM_ID || ''
    });
  }
}
