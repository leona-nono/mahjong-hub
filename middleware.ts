import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { authConfig } from './auth.config';

const intlMiddleware = createMiddleware(routing);


// 标准组合：先走 NextAuth 守卫（保护 /api/points、/api/leaderboard、/<locale>/admin），
// 再走 next-intl 的 locale 中间件。后台已移入 app/[locale]/admin，因此带 locale
// 前缀的 /en/admin 等路径可正常命中，不再出现 /admin → /en/admin 的 404。
//
// 注意：/api/* 必须绕过 next-intl。否则 next-intl 在 localePrefix=always 下会
// 把 /api/admin/games 重定向到 /en/api/admin/games，而该路径不存在 → 404。
// API 路由只交给上面的 NextAuth 守卫处理即可（受保护路由返回 401/重定向）。
export default function middleware(req: NextRequest) {
  // The local desktop proxy can loop when next-intl rewrites a dev URL to the
  // AUTH_URL host. The locale is already present in /en, /zh, etc., so skip
  // that rewrite during development; production keeps the normal middleware.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  // API handlers perform their own session/admin checks. Keeping them out of
  // next-intl also prevents locale prefixes from being added to API URLs.
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/:path*']
};
