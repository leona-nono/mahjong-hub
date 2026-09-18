'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import ThemePicker from './ThemePicker';
import { useAuth } from '@/lib/auth';
import { usePoints } from '@/lib/points';
import { applyAppearance, savedAppearance } from '@/lib/appearance';

export default function Header({ siteTitle }: { siteTitle: string }) {
  const tn = useTranslations('nav');
  const ts = useTranslations('site');
  const ta = useTranslations('auth');
  const td = useTranslations('daily');
  const { openLogin } = useAuth();
  const { data: session, status } = useSession();
  const { checkIn } = usePoints();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const user = session?.user;
  const streak = checkIn?.streak ?? 0;

  useEffect(() => {
    applyAppearance(savedAppearance());
  }, []);

  const links = [
    { href: '/games/classic', label: tn('classic') },
    { href: '/games/solitaire', label: tn('solitaire') },
    { href: '/tools', label: tn('tools') },
    { href: '/blog', label: tn('beginners') }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-portal-border bg-portal-elevated/90 backdrop-blur-md">
      <div className="rainbow-bar" />
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-portal-text">
          {siteTitle.includes('·') ? (
            <>
              <span className="text-portal-accent">
                {siteTitle.split('·')[0].trim()}
              </span>
              <span className="sr-only">{ts('name')}</span>
            </>
          ) : (
            <>
              {siteTitle}
              <span className="sr-only">{ts('name')}</span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-portal-muted transition hover:bg-white/5 hover:text-portal-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemePicker />
          <LocaleSwitcher />

          {user ? (
            <div className="relative hidden items-center gap-2 md:flex">
              {streak > 0 ? (
                <span className="rounded-full bg-portal-accent/15 px-2.5 py-1 text-xs font-bold text-portal-accent">
                  {td('streakLineShort', { days: streak })}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setShowAccount((v) => !v)}
                className="rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-portal-text hover:bg-white/10"
              >
                {(user.name ?? user.email ?? 'User').split(' ')[0]}
              </button>
              {showAccount && (
                <div className="absolute right-0 top-10 z-50 w-60 rounded-xl border border-portal-border bg-portal-panel p-3 shadow-portal">
                  <p className="truncate text-sm font-semibold">{user.name ?? 'Mahjong Hub User'}</p>
                  {user.email && (
                    <p className="mt-0.5 truncate text-xs text-portal-muted">{user.email}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: window.location.href })}
                    className="mt-3 w-full rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-portal-muted hover:bg-white/10"
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
              className="hidden rounded-full bg-portal-accent px-4 py-1.5 text-sm font-bold text-portal-on-accent hover:brightness-110 disabled:opacity-60 md:inline-block"
            >
              {ta('login')}
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-lg text-xl text-portal-text hover:bg-white/5 md:hidden"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-portal-border bg-portal-elevated px-4 py-3 md:hidden">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-portal-text hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
          {!user && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openLogin();
              }}
              className="mt-2 w-full rounded-full bg-portal-accent px-4 py-2 font-bold text-portal-on-accent"
            >
              {ta('login')}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
