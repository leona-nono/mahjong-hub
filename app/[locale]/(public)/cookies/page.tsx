import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';
import { getCookiesDoc } from '@/data/legal';
import { getSiteSettings } from '@/lib/site-settings';
import { LEGAL_UPDATED } from '@/data/legal';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = getCookiesDoc(locale);
  const site = await getSiteSettings();
  return {
    title: doc.title,
    description: doc.intro,
    alternates: alternatesFor(locale, '/cookies'),
    openGraph: {
      title: doc.title,
      description: doc.intro,
      images: site.ogImage ? [site.ogImage] : undefined
    }
  };
}

export default async function CookiesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('consent');
  const doc = getCookiesDoc(locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-portal-text">{doc.title}</h1>
      <p className="mt-2 text-sm text-portal-muted">{LEGAL_UPDATED}</p>
      <p className="mt-6 leading-relaxed text-portal-text/90">{doc.intro}</p>
      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="font-display text-xl font-semibold text-portal-text">
            {section.heading}
          </h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="mt-3 leading-relaxed text-portal-muted">
              {p}
            </p>
          ))}
        </section>
      ))}
      <p className="mt-10 text-sm">
        <Link href="/privacy" className="text-portal-accent hover:underline">
          {t('privacy')}
        </Link>
      </p>
    </article>
  );
}
