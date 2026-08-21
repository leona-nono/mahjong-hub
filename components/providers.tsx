'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, type ReactNode } from 'react';
import { clearSessionUser, initAuth, syncSessionUser } from '@/lib/auth';
import { hydratePointsFromServer, resetPointsForGuest } from '@/lib/points';
import {
  clearGuestMergeFlag,
  mergeGuestProgressOnLogin
} from '@/lib/guest-snapshot';
import LoginModal from '@/components/LoginModal';

export interface EnabledAuthProviders {
  google: boolean;
  facebook: boolean;
  x: boolean;
  email: boolean;
}

/** Mirrors Auth.js session into the client store and hydrates the points ledger. */
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
      void hydratePointsFromServer();
      void mergeGuestProgressOnLogin();
    } else if (status === 'unauthenticated') {
      clearSessionUser();
      resetPointsForGuest();
      clearGuestMergeFlag();
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
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <Inner enabledProviders={enabledProviders}>{children}</Inner>
    </SessionProvider>
  );
}
