'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, type ReactNode } from 'react';
import { clearSessionUser, initAuth, syncSessionUser } from '@/lib/auth';
import { initPoints } from '@/lib/points';
import LoginModal from '@/components/LoginModal';

export interface EnabledAuthProviders {
  google: boolean;
  facebook: boolean;
  x: boolean;
  email: boolean;
}

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
