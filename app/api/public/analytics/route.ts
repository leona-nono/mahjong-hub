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
    return NextResponse.json({
      ga: value.ga ?? '',
      gtm: value.gtm ?? ''
    });
  } catch {
    // DB unreachable — fail silent, just don't load analytics.
    return NextResponse.json({ ga: '', gtm: '' });
  }
}
