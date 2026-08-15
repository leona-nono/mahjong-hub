import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const ts = useTranslations('site');
  const tn = useTranslations('nav');

  return (
    <footer className="mt-10 border-t border-portal-border bg-portal-elevated/60">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-sm font-semibold text-portal-text">
            {ts('name')} · {t('rights')}
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
        </div>
      </div>
    </footer>
  );
}
