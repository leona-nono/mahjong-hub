import 'server-only';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Admin guard — verifies login + ADMIN_EMAILS whitelist.
 * Returns `null` on success, or a 401/403 NextResponse on failure.
 *
 * Admin allow-list is read from `ADMIN_EMAILS` env var (comma-separated).
 *
 * Security model — FAIL CLOSED in production:
 *   • If ADMIN_EMAILS is set, only listed emails may hit /api/admin/*.
 *   • If ADMIN_EMAILS is MISSING in production, the route is locked down
 *     (403) so a forgotten env var can never accidentally grant admin to
 *     every logged-in user.
 *   • If ADMIN_EMAILS is missing in development (NODE_ENV !== 'production'),
 *     we fall back to "any logged-in user is admin" for convenience.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowList = process.env.ADMIN_EMAILS;
  if (!allowList) {
    if (process.env.NODE_ENV === 'production') {
      // Fail closed: never implicitly grant admin in prod.
      return NextResponse.json(
        { error: 'Admin allowlist not configured' },
        { status: 403 }
      );
    }
    // Dev fallback: allow any logged-in user.
    return null;
  }

  const emails = allowList.split(',').map((e) => e.trim().toLowerCase());
  if (!emails.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}
