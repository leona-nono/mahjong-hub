'use client';

import { SessionProvider } from 'next-auth/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, type ReactNode } from 'react';
import { initAuth, hasGoogle } from '@/lib/auth';
import { initPoints } from '@/lib/points';
import LoginModal from '@/components/LoginModal';
import DailyBonus from '@/components/DailyBonus';
import XCallbackHandler from '@/components/XCallbackHandler';

/**
 * Bootstraps the module-level auth/points stores on the client and mounts the
 * global login modal + daily-bonus checker + X OAuth callback handler.
 *
 * Phase 0 (backend ready, UI switch deferred):
 *   • SessionProvider is mounted so Phase 1's `useSession()` + `signIn()`
 *     calls have a session context the moment we flip LoginModal.
 *   • The legacy mock login path in lib/auth.tsx stays untouched — when
 *     no Auth.js provider is configured, the mock login is the only path,
 *     which keeps the current site working in preview / local dev.
 */

function Inner({ children }: { children: ReactNode }) {
  useEffect(() => {
    initAuth();
    initPoints();
  }, []);

  return (
    <>
      {children}
      <DailyBonus />
      <XCallbackHandler />
      <LoginModal />
    </>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  const googleId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const content = (
    <SessionProvider>
      <Inner>{children}</Inner>
    </SessionProvider>
  );
  if (hasGoogle && googleId) {
    return (
      <GoogleOAuthProvider clientId={googleId}>{content}</GoogleOAuthProvider>
    );
  }
  return content;
}