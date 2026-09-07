import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/** Keep in sync with SITE_BASE_URL in lib/seo.ts (avoid importing Node/Metadata into Edge). */
const APEX_ORIGIN = 'https://mahjonggame.org';
const APEX_HOST = 'mahjonggame.org';
const WWW_HOST = `www.${APEX_HOST}`;

function hostname(req: NextRequest): string {
  return req.headers.get('host')?.split(':')[0]?.toLowerCase() ?? '';
}

/** Absolute apex URL with path + search (canonical host for SEO). */
function apexUrl(pathname: string, search: string): URL {
  const url = new URL(APEX_ORIGIN);
  url.pathname = pathname;
  url.search = search;
  return url;
}

// Locale routing + host canonicalization. Auth for /api/* and /[locale]/admin
// is enforced in Node (requireAdmin / admin layout) so Edge Middleware does not
// run on every API call (that matcher used to bill an invocation per session poll).
export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = hostname(req);

  // Production only: collapse www to apex in one hop (matches SITE_BASE_URL /
  // robots / sitemap). Root goes straight to /en so crawlers never see a chain.
  if (process.env.NODE_ENV === 'production' && host === WWW_HOST) {
    const targetPath = pathname === '/' ? `/${routing.defaultLocale}` : pathname;
    return NextResponse.redirect(apexUrl(targetPath, search), 308);
  }

  // The bare root has no matching [locale] route. Permanent redirect consolidates
  // ranking signals on /en (same as homepage canonical).
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, req.url), 308);
  }

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
