import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Twitter from 'next-auth/providers/twitter';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { authConfig } from './auth.config';

/**
 * Auth.js (NextAuth v5) wiring.
 *
 * - session.strategy = 'database' means sessions persist in the Session table
 *   (clean revocation, no JWT cookies for OAuth-only sites). Prisma adapter
 *   handles User/Account/Session/VerificationToken rows automatically.
 *
 * - Providers are conditionally registered. This is important for local dev
 *   and preview deploys that do not have credentials yet: the API route still
 *   loads, but /api/auth/providers returns an empty object. Meanwhile the
 *   legacy mock login in lib/auth.tsx remains the only path (intentional
 *   for Phase 0: backend infra is shipped first, UI switches in Phase 1).
 *
 * X (Twitter) uses Auth.js OAuth 2.0 with PKCE. Local development is
 * served on 127.0.0.1 so the callback exactly matches X's allowlist.
 */
const googleConfigured =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;
const facebookConfigured =
  !!process.env.AUTH_FACEBOOK_ID && !!process.env.AUTH_FACEBOOK_SECRET;
const xConfigured = !!process.env.AUTH_X_ID && !!process.env.AUTH_X_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  ...authConfig,
  providers: [
    ...(googleConfigured ? [Google] : []),
    ...(facebookConfigured ? [Facebook] : []),
    ...(xConfigured
      ? [
          Twitter({
            clientId: process.env.AUTH_X_ID!,
            clientSecret: process.env.AUTH_X_SECRET!,
          }),
        ]
      : []),
  ],
});
