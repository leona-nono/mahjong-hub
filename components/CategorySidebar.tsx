'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const ITEMS = [
  { key: 'solitaire', href: '/games/solitaire', icon: 'clear' },
  { key: 'classic', href: '/games/classic', icon: 'classic' },
  { key: 'connect', href: '/games', icon: 'connect' },
  { key: 'tileMatch', href: '/games', icon: 'pair' },
  { key: 'beginners', href: '/blog', icon: 'learn' }
] as const;

function SidebarIcon({ name }: { name: (typeof ITEMS)[number]['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'clear') return <svg viewBox="0 0 24 24" aria-hidden><rect x="4" y="5" width="11" height="13" rx="2" {...common} /><rect x="9" y="9" width="11" height="11" rx="2" {...common} /><path d="M19 3v4m-2-2h4" {...common} /></svg>;
  if (name === 'classic') return <svg viewBox="0 0 24 24" aria-hidden><rect x="5" y="3" width="14" height="18" rx="3" {...common} /><path d="M12 7v10m-3-5h6" {...common} /></svg>;
  if (name === 'connect') return <svg viewBox="0 0 24 24" aria-hidden><circle cx="6" cy="17" r="3" {...common} /><circle cx="18" cy="7" r="3" {...common} /><path d="m8.5 15 7-6" {...common} /></svg>;
  if (name === 'pair') return <svg viewBox="0 0 24 24" aria-hidden><rect x="4" y="4" width="11" height="11" rx="2" {...common} /><rect x="9" y="9" width="11" height="11" rx="2" {...common} /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden><path d="M4 5.5c3.4-1 6 .2 8 2.1 2-1.9 4.6-3.1 8-2.1v13c-3.1-.8-5.5.1-8 2-2.5-1.9-4.9-2.8-8-2Z" {...common} /><path d="M12 7.6v12" {...common} /></svg>;
}

export default function CategorySidebar() {
  const t = useTranslations('portal');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = (
    <nav className="catalog-sidebar-nav">
      <p className="catalog-sidebar-nav__title">
        {t('categories')}
      </p>
      {ITEMS.map((item) => {
        const active = pathname === item.href || (item.key === 'connect' && pathname === '/games');
        return (
        <Link
          key={item.key}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`catalog-sidebar-nav__item ${active ? 'catalog-sidebar-nav__item--active' : ''}`}
        >
          <span className="catalog-sidebar-nav__icon"><SidebarIcon name={item.icon} /></span>
          <span>{t(item.key)}</span>
        </Link>
      );})}
    </nav>
  );

  return (
    <>
      <aside className="catalog-sidebar fixed bottom-0 left-0 top-16 z-30 hidden w-[var(--portal-sidebar-w)] md:block">
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
          <div className="catalog-sidebar absolute bottom-0 left-0 top-0 w-[min(80vw,280px)] shadow-2xl">
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
