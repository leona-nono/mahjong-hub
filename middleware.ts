import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Locale routing only. Auth for /api/* and /[locale]/admin is enforced in
// Node (requireAdmin / admin layout) so Edge Middleware does not run on
// every API call — that matcher used to bill an invocation per session poll.
export default function middleware(req: NextRequest) {
  // The local desktop proxy can loop when next-intl rewrites a dev URL to the
  // AUTH_URL host. The locale is already present in /en, /zh, etc., so skip
  // that rewrite during development; production keeps the normal middleware.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
