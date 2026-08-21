'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import { useAuth } from '@/lib/auth';
import { usePoints } from '@/lib/points';
import { applyAppearance, savedAppearance } from '@/lib/appearance';

export default function Header() {
  const tn = useTranslations('nav');
  const ts = useTranslations('site');
  const ta = useTranslations('auth');
  const tp = useTranslations('points');
  const tx = useTranslations('accessibility');
  const { openLogin } = useAuth();
  const { data: session, status } = useSession();
  const { points } = usePoints();
  const [showAccount, setShowAccount] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeTiles, setLargeTiles] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const user = session?.user;

  useEffect(() => {
    applyAppearance(savedAppearance());
    const root = document.documentElement;
    const contrast = localStorage.getItem('mahjong-high-contrast') === 'true';
    const tiles = localStorage.getItem('mahjong-large-tiles') === 'true';
    const motion = localStorage.getItem('mahjong-reduced-motion') === 'true';
    root.classList.toggle('high-contrast', contrast);
    root.classList.toggle('tile-size-large', tiles);
    root.classList.toggle('reduce-motion', motion);
    setHighContrast(contrast); setLargeTiles(tiles); setReducedMotion(motion);
  }, []);

  const togglePreference = (key: string, className: string, value: boolean, setValue: (next: boolean) => void) => {
    const next = !value;
    document.documentElement.classList.toggle(className, next);
    localStorage.setItem(key, String(next));
    setValue(next);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur">
      <div className="rainbow-bar h-1" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-black rainbow-text">
          {ts('name')}
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-gray-700 sm:gap-4">
          <Link href="/" className="hover:text-[#2d756a]">
            {tn('home')}
          </Link>
          <Link href="/games" className="hover:text-[#2d756a]">
            {tn('games')}
          </Link>
          <Link href="/wardrobe" className="hover:text-[#2d756a]">
            {tn('wardrobe')}
          </Link>
          <button type="button" onClick={() => togglePreference('mahjong-high-contrast', 'high-contrast', highContrast, setHighContrast)} aria-pressed={highContrast} aria-label={tx('highContrast')} className="rounded-md border border-[#d8d7cd] bg-[#fffdf7] px-2 py-1 text-xs font-bold text-[#1d2a44]">AA</button>
          <button type="button" onClick={() => togglePreference('mahjong-large-tiles', 'tile-size-large', largeTiles, setLargeTiles)} aria-pressed={largeTiles} aria-label={tx('largeTiles')} className="rounded-md border border-[#d8d7cd] bg-[#fffdf7] px-2 py-1 text-xs font-bold text-[#1d2a44]">A+</button>
          <button type="button" onClick={() => togglePreference('mahjong-reduced-motion', 'reduce-motion', reducedMotion, setReducedMotion)} aria-pressed={reducedMotion} aria-label={tx('reduceMotion')} className="rounded-md border border-[#d8d7cd] bg-[#fffdf7] px-2 py-1 text-xs font-bold text-[#1d2a44]">◌</button>
          <LocaleSwitcher />

          {user ? (
            <div className="relative flex items-center gap-2">
              <span className="hidden rounded-full bg-[#eee3c8] px-2 py-0.5 text-xs font-bold text-gray-700 sm:inline">
                {tp('youHave', { n: points })}
              </span>
              <button
                type="button"
                onClick={() => setShowAccount((value) => !value)}
                className="flex items-center gap-1 rounded-full bg-[#e2eee9] px-3 py-1 font-medium text-[#1e554d] hover:bg-[#cee1d9]"
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
              className="rounded-full bg-[#1e554d] px-4 py-1 font-semibold text-white shadow-sm hover:bg-[#2d756a] disabled:opacity-60"
            >
              {ta('login')}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
