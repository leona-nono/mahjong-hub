import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { hubPageMeta } from '@/lib/hub-seo';
import { getAboutDoc } from '@/data/about';
import { RichText } from '@/components/RichText';

export const dynamic = 'force-static';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = getAboutDoc(locale);
  return hubPageMeta({
    locale,
    path: '/about',
    titleKey: 'aboutTitle',
    pageLabel: doc.title,
    description: doc.metaDescription
  });
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const doc = getAboutDoc(locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-portal-text">{doc.title}</h1>
      <p className="mt-6 leading-relaxed text-portal-text/90">{doc.intro}</p>
      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="font-display text-xl font-semibold text-portal-text">
            {section.heading}
          </h2>
          {section.paragraphs?.map((segments) => (
            <p key={segments.map((s) => s.text).join('').slice(0, 72)} className="mt-3 leading-relaxed text-portal-muted">
              <RichText segments={segments} />
            </p>
          ))}
          {section.bullets ? (
            <ul className="mt-3 space-y-3 leading-relaxed text-portal-muted">
              {section.bullets.map((bullet) => (
                <li key={bullet.label}>
                  <strong className="font-semibold text-portal-text">{bullet.label}</strong>
                  {bullet.segments ? (
                    <RichText segments={bullet.segments} />
                  ) : (
                    <>
                      {bullet.text}
                      {bullet.link ? (
                        <Link
                          href={bullet.link.href}
                          className="font-semibold text-portal-accent hover:underline"
                        >
                          {bullet.link.label}
                        </Link>
                      ) : null}
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
          {section.afterBullets?.map((segments) => (
            <p
              key={segments.map((s) => s.text).join('').slice(0, 72)}
              className="mt-3 leading-relaxed text-portal-muted"
            >
              <RichText segments={segments} />
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
