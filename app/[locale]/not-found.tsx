import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-portal-accent">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-portal-text">
        {t('title')}
      </h1>
      <p className="mt-2 text-sm text-portal-muted">{t('body')}</p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-portal-accent px-5 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110"
      >
        {t('home')}
      </Link>
    </div>
  );
}
