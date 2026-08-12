import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBlogPosts, getLocalizedBlogPost } from '@/data/blog';

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
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${SITE}/${l}/blog/${slug}`])
      )
    },
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
    <article className="mx-auto max-w-3xl px-4 py-12">
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <Link
        href="/blog"
        className="text-sm font-medium text-rainbow-pink hover:underline"
      >
        ← {t('tryAnother')}
      </Link>

      <h1 className="mt-4 text-3xl font-black rainbow-text">{post.title}</h1>
      <p className="mt-3 text-gray-600">{post.description}</p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        {post.readMinutes} min read
      </p>

      <div className="mt-8 space-y-10">
        {post.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-xl font-bold text-gray-800">
              {section.heading}
            </h2>
            {section.body.map((para, j) => (
              <p key={j} className="mt-3 leading-relaxed text-gray-600">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>

      {post.faq.length ? (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-gray-800">{t('faq')}</h2>
          <div className="space-y-3">
            {post.faq.map((item, i) => (
              <details
                key={i}
                className="rounded-2xl border border-gray-100 bg-white/70 p-4"
              >
                <summary className="cursor-pointer font-semibold text-gray-800">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-gray-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* Play Now CTA — content drives SEO traffic, the game page keeps it. */}
      {post.cta && (
        <div className="mt-12 rounded-3xl rainbow-card p-8 text-center">
          <p className="text-lg font-bold text-gray-800">
            {post.cta.label}
          </p>
          <Link
            href={post.cta.href}
            className="mt-4 inline-block rounded-full rainbow-bar px-8 py-3 font-bold text-white shadow-md transition hover:opacity-90"
          >
            Play Now
          </Link>
        </div>
      )}
    </article>
  );
}
