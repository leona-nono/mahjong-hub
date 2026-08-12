'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import { useAuth } from '@/lib/auth';
import { usePoints } from '@/lib/points';
import { CLASSIC_REGIONS, getClassicByRegion } from '@/data/games';

const NAV_LINK_CLS =
  'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-black/5 hover:text-gray-900';

export default function Header() {
  const tn = useTranslations('nav');
  const ts = useTranslations('site');
  const ta = useTranslations('auth');
  const tp = useTranslations('points');
  const { openLogin } = useAuth();
  const { data: session, status } = useSession();
  const { points } = usePoints();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const user = session?.user;

  // mahjong classic 二级 = 5 国麻将（中国/日本/美国/台湾/四川），
  // 每项直达对应玩法入口；未上线的 ruleset 打 "Coming Soon"。
  const classicChildren = CLASSIC_REGIONS.map((r) => {
    const games = getClassicByRegion(r.region);
    const first = games[0];
    return {
      label: tn(r.labelKey),
      href: first ? `/games/${first.slug}` : '/games/classic',
      comingSoon: first?.gameType === 'coming-soon'
    };
  });

  const navItems = [
    {
      key: 'classic',
      label: tn('classic'),
      href: '/games/classic',
      children: classicChildren
    },
    { key: 'solitaire', label: tn('solitaire'), href: '/games/solitaire' },
    { key: 'beginners', label: tn('beginners'), href: '/blog' },
    { key: 'set', label: tn('set'), href: '/games/set' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur">
      <div className="rainbow-bar h-1" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-black rainbow-text">
          {ts('name')}
        </Link>

        {/* Desktop nav — hover dropdown (mobile fallback below) */}
        <nav className="hidden items-center gap-0.5 text-sm font-medium text-gray-700 md:flex">
          {navItems.map((item) => (
            <div
              key={item.key}
              className="relative"
              onMouseEnter={() => setOpenMenu(item.key)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link href={item.href} className={NAV_LINK_CLS}>
                <span>{item.label}</span>
                {item.children && <span className="text-[10px] opacity-60">▾</span>}
              </Link>

              {item.children && openMenu === item.key && (
                <div className="absolute left-0 top-full mt-1 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5">
                  {item.children.map((c) => (
                    <Link
                      key={c.label}
                      href={c.href}
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <span>{c.label}</span>
                      {c.comingSoon && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          Coming Soon
                        </span>
                      )}
                    </Link>
                  ))}
                  <Link
                    href="/games/classic"
                    onClick={() => setOpenMenu(null)}
                    className="mt-1 block rounded-xl px-3 py-2 text-xs font-semibold text-rainbow-pink hover:bg-gray-50"
                  >
                    {tn('classicSubtitle')}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />

          {user ? (
            <div className="relative hidden items-center gap-2 md:flex">
              <span className="hidden rounded-full bg-rainbow-yellow/30 px-2 py-0.5 text-xs font-bold text-gray-700 lg:inline">
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
                    onClick={() =>
                      signOut({ callbackUrl: window.location.href })
                    }
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
              className="hidden rounded-full bg-rainbow-pink px-4 py-1 font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60 md:inline-block"
            >
              {ta('login')}
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-700 hover:bg-black/5 md:hidden"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile nav — click-to-expand accordion */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white/95 px-4 py-3 md:hidden">
          {navItems.map((item) => (
            <div key={item.key} className="py-1">
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="ml-2 border-l border-gray-100 pl-3">
                  {item.children.map((c) => (
                    <Link
                      key={c.label}
                      href={c.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <span>{c.label}</span>
                      {c.comingSoon && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          Coming Soon
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {user ? (
            <button
              type="button"
              onClick={() =>
                signOut({ callbackUrl: window.location.href })
              }
              className="mt-2 w-full rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              {ta('logout')} ({user.name ?? user.email})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openLogin();
              }}
              disabled={status === 'loading'}
              className="mt-2 w-full rounded-full bg-rainbow-pink px-4 py-2 font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
            >
              {ta('login')}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
