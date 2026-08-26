import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Wardrobe from '@/components/Wardrobe';
import { pageMeta } from '@/lib/seo';
import { brandName, getSiteSettings } from '@/lib/site-settings';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  const tw = await getTranslations({ locale, namespace: 'wardrobe' });
  const site = await getSiteSettings();
  const title =
    locale === 'en' ? t('wardrobeTitle') : `${tw('title')} | ${brandName(site)}`;
  return {
    ...pageMeta({
      locale,
      path: '/wardrobe',
      title,
      description: tw('subtitle'),
      ogImage: site.ogImage,
      siteName: brandName(site)
    }),
    title: { absolute: title }
  };
}

export default async function WardrobePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('wardrobe');
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 rounded-3xl border border-[#d8d7cd] bg-[#fffdf7] p-6 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a66a3f]">
          {t('eyebrow')}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-[#1d2a44]">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-[#52617a]">{t('subtitle')}</p>
      </section>
      <Wardrobe />
    </div>
  );
}
