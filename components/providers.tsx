'use client';

import { useEffect, type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initAuth, hasGoogle } from '@/lib/auth';
import { initPoints } from '@/lib/points';
import LoginModal from '@/components/LoginModal';
import DailyBonus from '@/components/DailyBonus';
import XCallbackHandler from '@/components/XCallbackHandler';

/**
 * Bootstraps the module-level auth/points stores on the client and mounts the
 * global login modal + daily-bonus checker + X OAuth callback handler.
 * No React Context is used, so the stores are reachable from any client
 * component (including ones nested under Server Components during SSG).
 *
 * GoogleOAuthProvider is only mounted when a Google client id is configured,
 * so the GoogleLoginButton (which calls useGoogleLogin) is never rendered
 * without a provider.
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
  if (hasGoogle && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <Inner>{children}</Inner>
      </GoogleOAuthProvider>
    );
  }
  return <Inner>{children}</Inner>;
}
