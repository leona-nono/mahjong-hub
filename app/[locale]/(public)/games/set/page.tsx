import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor(locale, '/games/set') };
}

export default async function SetPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-portal-text">{t('set')}</h1>
      <p className="mt-3 text-portal-muted">{t('setSubtitle')}</p>

      <div className="mt-10 rounded-2xl border border-dashed border-portal-border p-10 text-center text-sm text-portal-muted">
        {t('setComingSoon')}
      </div>
    </div>
  );
}
