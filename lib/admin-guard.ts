import 'server-only';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Admin guard — verifies login + ADMIN_EMAILS whitelist.
 * Returns `null` on success, or a 401/403 NextResponse on failure.
 *
 * Admin allow-list is read from `ADMIN_EMAILS` env var (comma-separated).
 * If env is missing, all logged-in users are admins (single-user dev mode).
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowList = process.env.ADMIN_EMAILS;
  if (!allowList) {
    // Dev fallback: allow any logged-in user. Once ADMIN_EMAILS is set in
    // Vercel / .env.local, only listed emails can hit /api/admin/*.
    return null;
  }

  const emails = allowList.split(',').map((e) => e.trim().toLowerCase());
  if (!emails.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}
