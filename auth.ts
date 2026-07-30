import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { authConfig } from './auth.config';

/**
 * Auth.js (NextAuth v5) wiring.
 *
 * - session.strategy = 'database'  → sessions persist in the Session table
 *   (clean revocation, no JWT cookies for OAuth-only sites). Prisma adapter
 *   handles User/Account/Session/VerificationToken rows automatically.
 *
 * - Providers are only included when the matching env vars are set, so the
 *   site still boots in local dev / preview deployments without credentials.
 *   When no providers are configured, signIn() has no real targets and the
 *   legacy mock login in lib/auth.tsx remains the only path (intentional
 *   for Phase 0: backend infra is shipped first, UI switches in Phase 1).
 *
 * X (Twitter) OAuth2 PKCE ships as a custom provider once the credentials
 * arrive — tracked in Phase 1.
 */
const googleConfigured = !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;
const facebookConfigured =
  !!process.env.AUTH_FACEBOOK_ID && !!process.env.AUTH_FACEBOOK_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  ...authConfig,
  providers: [
    ...(googleConfigured ? [Google] : []),
    ...(facebookConfigured ? [Facebook] : [])
  ]
});