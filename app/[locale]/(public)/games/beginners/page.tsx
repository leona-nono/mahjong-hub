import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function BeginnersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black rainbow-text">{t('beginners')}</h1>
      <p className="mt-3 text-gray-600">{t('beginnersSubtitle')}</p>

      {/* Beginner guides / blog articles will render here. */}
      <div className="mt-10 rounded-3xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
        {t('beginnersComingSoon')}
      </div>
    </div>
  );
}
