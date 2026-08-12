'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, type ReactNode } from 'react';
import { clearSessionUser, initAuth, syncSessionUser } from '@/lib/auth';
import { initPoints, awardPoints } from '@/lib/points';
import LoginModal from '@/components/LoginModal';

export interface EnabledAuthProviders {
  google: boolean;
  facebook: boolean;
  x: boolean;
  email: boolean;
}

const FIRST_LOGIN_KEY = 'mh_first_email_login_rewarded';

/** Keeps the legacy points UI aware of the authoritative Auth.js session. */
function AuthSessionBridge() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session.user) {
      const user = session.user as typeof session.user & { id?: string };
      syncSessionUser({
        id: user.id ?? user.email ?? 'authjs-user',
        name: user.name ?? user.email ?? 'Mahjong Hub User',
        email: user.email ?? '',
        avatar: user.image ?? undefined,
        provider: 'authjs'
      });
      // First email login bonus (P0-2). Client-side once-per-browser for now;
      // the server-side ledger (P0-1) will move this to a per-user DB flag.
      try {
        if (!localStorage.getItem(FIRST_LOGIN_KEY)) {
          awardPoints(500, 'email_first_login');
          localStorage.setItem(FIRST_LOGIN_KEY, '1');
        }
      } catch {
        /* ignore */
      }
    } else if (status === 'unauthenticated') {
      clearSessionUser();
    }
  }, [session, status]);

  return null;
}

function Inner({
  children,
  enabledProviders
}: {
  children: ReactNode;
  enabledProviders: EnabledAuthProviders;
}) {
  useEffect(() => {
    initAuth();
    initPoints();
  }, []);

  return (
    <>
      <AuthSessionBridge />
      {children}
      <LoginModal enabledProviders={enabledProviders} />
    </>
  );
}

export default function Providers({
  children,
  enabledProviders
}: {
  children: ReactNode;
  enabledProviders: EnabledAuthProviders;
}) {
  return (
    <SessionProvider>
      <Inner enabledProviders={enabledProviders}>{children}</Inner>
    </SessionProvider>
  );
}
