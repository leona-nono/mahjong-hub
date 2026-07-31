'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import { useAuth } from '@/lib/auth';
import { usePoints } from '@/lib/points';

export default function Header() {
  const tn = useTranslations('nav');
  const ts = useTranslations('site');
  const ta = useTranslations('auth');
  const tp = useTranslations('points');
  const { openLogin } = useAuth();
  const { data: session, status } = useSession();
  const { points } = usePoints();
  const [showAccount, setShowAccount] = useState(false);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur">
      <div className="rainbow-bar h-1" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-black rainbow-text">
          {ts('name')}
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-gray-700 sm:gap-4">
          <Link href="/" className="hover:text-rainbow-pink">
            {tn('home')}
          </Link>
          <Link href="/games" className="hover:text-rainbow-pink">
            {tn('games')}
          </Link>
          <LocaleSwitcher />

          {user ? (
            <div className="relative flex items-center gap-2">
              <span className="hidden rounded-full bg-rainbow-yellow/30 px-2 py-0.5 text-xs font-bold text-gray-700 sm:inline">
                {tp('youHave', { n: points })}
              </span>
              <button
                type="button"
                onClick={() => setShowAccount((value) => !value)}
                className="flex items-center gap-1 rounded-full bg-rainbow-indigo/10 px-3 py-1 font-medium text-rainbow-indigo hover:bg-rainbow-indigo/20"
              >
                <span className="text-sm">
                  {(user.name ?? user.email ?? 'User').split(' ')[0]}
                </span>
                <span className="text-xs">▾</span>
              </button>

              {showAccount && (
                <div className="absolute right-0 top-10 z-50 w-64 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5">
                  <p className="truncate text-sm font-semibold text-gray-700">
                    {user.name ?? 'Mahjong Hub User'}
                  </p>
                  {user.email && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {user.email}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: window.location.href })}
                    className="mt-3 w-full rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                  >
                    {ta('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              disabled={status === 'loading'}
              className="rounded-full bg-rainbow-pink px-4 py-1 font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
            >
              {ta('login')}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
