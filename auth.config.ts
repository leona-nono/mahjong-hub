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
    // Authorization is enforced server-side, NOT at the edge:
    //  - Admin pages: app/[locale]/admin/layout.tsx calls auth() and redirects.
    //  - APIs: each route calls requireAdmin() and returns 401.
    // Edge middleware redirecting statically-prerendered admin pages is
    // unreliable (the cached 200 HTML is served straight from the CDN, so
    // the edge redirect never runs). The Node server component is the
    // authoritative gate. The middleware still runs to set up the session.
    authorized() {
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