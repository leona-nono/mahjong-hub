'use client';

import {
  SessionProvider,
  getSession,
  useSession
} from 'next-auth/react';
import { useEffect, type ReactNode } from 'react';
import { hasPendingCheckIn, setPendingCheckIn } from '@/lib/appearance';
import { clearSessionUser, initAuth, syncSessionUser } from '@/lib/auth';
import {
  claimDailyCheckIn,
  hydratePointsFromServer,
  resetPointsForGuest
} from '@/lib/points';
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

function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return /(?:^|;\s)(?:__Secure-)?(?:authjs|next-auth)\.session-token=/.test(
    document.cookie
  );
}

/**
 * Skip the default SessionProvider mount fetch (every anonymous page view).
 * Only probe /api/auth/session when a session cookie is already present.
 */
function SessionCookieBootstrap() {
  const { update } = useSession();

  useEffect(() => {
    if (!hasSessionCookie()) return;
    let cancelled = false;
    void getSession().then((session) => {
      if (!cancelled && session) void update(session);
    });
    return () => {
      cancelled = true;
    };
  }, [update]);

  return null;
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
      void (async () => {
        await hydratePointsFromServer();
        await mergeGuestProgressOnLogin();
        if (hasPendingCheckIn()) {
          setPendingCheckIn(false);
          await claimDailyCheckIn();
        }
      })();
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
      <SessionCookieBootstrap />
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
    <SessionProvider
      // Explicit null skips the automatic /api/auth/session fetch on mount.
      session={null}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <Inner enabledProviders={enabledProviders}>{children}</Inner>
    </SessionProvider>
  );
}
