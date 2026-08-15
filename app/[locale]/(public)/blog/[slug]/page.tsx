import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBlogPosts, getLocalizedBlogPost } from '@/data/blog';
import { TileRow } from '@/components/TileArt';
import { alternatesFor } from '@/lib/seo';

const SITE = 'https://mahjonggame.org';
const LOCALES = ['en', 'zh', 'zh-TW', 'ja', 'ko'];

export function generateStaticParams() {
  return getBlogPosts().flatMap((post) =>
    LOCALES.map((locale) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getLocalizedBlogPost(slug, locale);
  if (!post) return {};

  const url = `${SITE}/${locale}/blog/${slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: alternatesFor(locale, `/blog/${slug}`),
    openGraph: { title: post.title, description: post.description, url, type: 'article' },
    keywords: post.keywords,
    robots: { index: true, follow: true }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getLocalizedBlogPost(slug, locale);
  if (!post) notFound();

  const t = await getTranslations('game');

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      url: `${SITE}/${locale}/blog/${slug}`,
      inLanguage: locale,
      isAccessibleForFree: true
    },
    ...(post.faq.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer }
            }))
          }
        ]
      : [])
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <Link href="/blog" className="text-sm font-medium text-portal-accent hover:underline">
        ← {t('tryAnother')}
      </Link>

      <h1 className="mt-4 font-display text-3xl font-semibold text-portal-text">
        {post.title}
      </h1>
      <p className="mt-3 text-portal-muted">{post.description}</p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-portal-muted/70">
        {post.readMinutes} min read
      </p>

      {post.heroTiles && post.heroTiles.length > 0 && (
        <div className="mt-6 rounded-2xl border border-portal-border bg-portal-panel px-6 py-6">
          <TileRow tiles={post.heroTiles} size={60} />
        </div>
      )}

      <div className="mt-8 space-y-10">
        {post.sections.map((section, i) => (
          <section key={i}>
            <h2 className="font-display text-xl font-semibold text-portal-text">
              {section.heading}
            </h2>
            {section.body.map((para, j) => (
              <p key={j} className="mt-3 leading-relaxed text-portal-muted">
                {para}
              </p>
            ))}
            {section.tiles && section.tiles.length > 0 && (
              <div className="mt-4 rounded-2xl border border-portal-border bg-portal-panel px-4 py-4">
                <TileRow tiles={section.tiles} size={48} />
              </div>
            )}
          </section>
        ))}
      </div>

      {post.faq.length ? (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-semibold text-portal-text">
            {t('faq')}
          </h2>
          <div className="space-y-3">
            {post.faq.map((item, i) => (
              <details
                key={i}
                className="rounded-2xl border border-portal-border bg-portal-panel p-4"
              >
                <summary className="cursor-pointer font-semibold text-portal-text">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-portal-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {post.cta && (
        <div className="mt-12 rounded-2xl border border-portal-border bg-portal-panel p-8 text-center">
          <p className="text-lg font-bold text-portal-text">{post.cta.label}</p>
          <Link
            href={post.cta.href}
            className="mt-4 inline-block rounded-full bg-portal-accent px-8 py-3 font-bold text-slate-900 transition hover:brightness-110"
          >
            Play Now
          </Link>
        </div>
      )}
    </article>
  );
}
