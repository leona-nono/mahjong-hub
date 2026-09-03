'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { openConsentManager } from '@/lib/consent';

export default function Footer({ siteTitle }: { siteTitle: string }) {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const tc = useTranslations('consent');

  return (
    <footer className="mt-10 border-t border-portal-border bg-portal-elevated/60">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-sm font-semibold text-portal-text">
            {siteTitle} · {t('rights')}
          </p>
          <p className="mt-1 text-xs text-portal-muted">{t('noGambling')}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-portal-muted">
          <Link href="/games" className="hover:text-portal-accent">
            {tn('games')}
          </Link>
          <Link href="/games/solitaire" className="hover:text-portal-accent">
            {tn('solitaire')}
          </Link>
          <Link href="/blog" className="hover:text-portal-accent">
            {tn('beginners')}
          </Link>
          <Link href="/about" className="hover:text-portal-accent">
            {tn('about')}
          </Link>
          <Link href="/privacy" className="hover:text-portal-accent">
            {tc('privacy')}
          </Link>
          <Link href="/cookies" className="hover:text-portal-accent">
            {tc('cookies')}
          </Link>
          <button
            type="button"
            className="hover:text-portal-accent"
            onClick={() => openConsentManager()}
          >
            {tc('settings')}
          </button>
        </div>
      </div>
    </footer>
  );
}
