import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js config — referenced from middleware.ts so that the
 * edge runtime never has to import the Prisma adapter (which uses Node APIs).
 *
 * Provider configuration (Google / Facebook / X) is added in `auth.ts`
 * because it pulls in `next-auth/providers/*` which is not edge-safe.
 *
 * The `authorized` callback gates /api/points (and any future per-user API
 * route) on having a logged-in session. Everything else stays public so
 * the existing static SEO pages keep SSG.
 */
export const authConfig = {
  pages: {
    signIn: '/'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedApi =
        nextUrl.pathname.startsWith('/api/points') ||
        nextUrl.pathname.startsWith('/api/leaderboard');
      if (isProtectedApi) return isLoggedIn;
      return true;
    },
    async session({ session, user }) {
      // With database session strategy, `user` is the DB row. Attach the id
      // so client components can use session.user.id when calling our APIs.
      if (user?.id) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    }
  },
  // Providers are wired up in auth.ts (Node runtime only).
  providers: []
} satisfies NextAuthConfig;