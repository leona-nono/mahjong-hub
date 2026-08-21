import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBlogPosts, getLocalizedBlogPost } from '@/data/blog';
import { pageMeta } from '@/lib/seo';
import { brandName, getSiteSettings } from '@/lib/site-settings';

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
  const site = await getSiteSettings();

  return pageMeta({
    locale,
    path: `/games/beginners/${slug}`,
    title: post.title,
    description: post.description,
    ogImage: site.ogImage,
    siteName: brandName(site),
    type: 'article',
    keywords: post.keywords,
    robots: { index: true, follow: true }
  });
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
      url: `${SITE}/${locale}/games/beginners/${slug}`,
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
        href="/games/beginners"
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

      <p className="mt-12 rounded-2xl bg-white/70 p-5 text-sm text-gray-600">
        Ready to put this into practice?{' '}
        <Link href="/games/classic" className="font-semibold text-rainbow-pink hover:underline">
          Play a real game
        </Link>{' '}
        against three computer opponents.
      </p>
    </article>
  );
}
