'use client';

import { useState } from 'react';
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
  const { user, loginHistory, openLogin, logout } = useAuth();
  const { points } = usePoints();
  const [showHistory, setShowHistory] = useState(false);

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
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-1 rounded-full bg-rainbow-indigo/10 px-3 py-1 font-medium text-rainbow-indigo hover:bg-rainbow-indigo/20"
              >
                <span className="text-sm">{user.name.split(' ')[0]}</span>
                <span className="text-xs">▾</span>
              </button>

              {showHistory && (
                <div className="absolute right-0 top-10 z-50 w-60 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                    {ta('loginHistory')}
                  </p>
                  {loginHistory.length === 0 ? (
                    <p className="text-xs text-gray-400">{ta('noHistory')}</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-gray-600">
                      {loginHistory.slice(0, 5).map((r, i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span className="capitalize">{r.provider}</span>
                          <span className="text-gray-400">
                            {new Date(r.at).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    onClick={logout}
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
              className="rounded-full bg-rainbow-pink px-4 py-1 font-semibold text-white shadow-sm hover:opacity-90"
            >
              {ta('login')}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
