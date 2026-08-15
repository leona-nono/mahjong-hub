'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const ITEMS = [
  { key: 'solitaire', href: '/games/solitaire', icon: '🀄' },
  { key: 'classic', href: '/games/classic', icon: '🀄️' },
  { key: 'connect', href: '/games', icon: '🔗' },
  { key: 'tileMatch', href: '/games', icon: '🧩' },
  { key: 'beginners', href: '/blog', icon: '📖' }
] as const;

export default function CategorySidebar() {
  const t = useTranslations('portal');
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-portal-muted">
        {t('categories')}
      </p>
      {ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-portal-text/90 transition hover:bg-white/5 hover:text-portal-accent"
        >
          <span className="text-base" aria-hidden>
            {item.icon}
          </span>
          <span>{t(item.key)}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-[var(--portal-sidebar-w)] border-r border-portal-border bg-portal-elevated/95 backdrop-blur md:block">
        {nav}
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-portal-accent text-lg font-black text-slate-900 shadow-lg md:hidden"
        aria-label={t('categories')}
      >
        ≡
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 top-0 w-[min(80vw,280px)] border-r border-portal-border bg-portal-elevated shadow-2xl">
            <div className="flex items-center justify-between border-b border-portal-border px-4 py-3">
              <span className="font-display font-semibold">{t('categories')}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-portal-muted hover:bg-white/5"
              >
                ✕
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
