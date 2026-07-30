import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Edge-runtime middleware: only runs the `authorized` callback from
 * authConfig so it does not need Prisma / Node APIs. We restrict the
 * matcher to API routes and admin pages that need auth — static pages
 * keep full SSG caching.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/api/points/:path*',
    '/api/leaderboard/:path*',
    '/admin/:path*'
  ]
};
