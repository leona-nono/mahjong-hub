import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleTiles from '@/components/blog/ArticleTiles';
import { pageMeta, SITE_BASE_URL } from '@/lib/seo';
import { UI_LOCALES } from '@/lib/locales';
import { getBlogPosts, getLocalizedBlogPost } from '@/data/blog';
import { clusterOf, ctaHrefFor, relatedSlugs } from '@/data/blog-clusters';
import { articleWordCount, linkArticleSections } from '@/lib/article-links';
import { RichParagraph } from '@/lib/rich-text';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';

/** Pure SSG from data/blog + blog-i18n JSON. Redeploy to refresh. */
export const dynamic = 'force-static';

export function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.flatMap((post) =>
    UI_LOCALES.map((locale) => ({ locale, slug: post.slug }))
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
  const site = getPublicSiteSettings();
  return pageMeta({
    locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.description,
    ogImage: site.ogImage,
    siteName: brandName(site),
    type: 'article'
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
  const nav = await getTranslations('nav');
  const learn = await getTranslations('learn');
  const site = getPublicSiteSettings();
  const brand = brandName(site);
  const pageUrl = `${SITE_BASE_URL}/${locale}/blog/${slug}`;
  const publishedAt = post.publishedAt ?? '2026-08-18';
  const updatedAt = post.updatedAt ?? publishedAt;
  const sections = linkArticleSections(post.sections, slug, locale);
  const cluster = clusterOf(slug);
  const related = relatedSlugs(slug)
    .map((relatedSlug) => getLocalizedBlogPost(relatedSlug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const ctaHref = ctaHrefFor(slug, post.cta?.href ?? '/games/classic');
  const ctaLabel = post.cta?.label ?? t('playNow');

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      url: pageUrl,
      inLanguage: locale,
      isAccessibleForFree: true,
      author: { '@type': 'Organization', name: brand, url: SITE_BASE_URL },
      publisher: { '@id': `${SITE_BASE_URL}/#organization` },
      datePublished: publishedAt,
      dateModified: updatedAt,
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      wordCount: articleWordCount(post.sections)
    },
    ...(post.faq.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer }
          }))
        }]
      : [])
  ];

  const crumbs = [
    { name: nav('home'), path: '/' },
    { name: nav('beginners'), path: '/blog' },
    ...(cluster ? [{ name: learn(`cluster.${cluster.id}`), path: `/blog#cluster-${cluster.id}` }] : []),
    { name: post.title, path: `/blog/${slug}` }
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {jsonLd.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <Breadcrumbs locale={locale} crumbs={crumbs} />

      <h1 className="mt-4 font-display text-3xl font-semibold text-portal-text">
        {post.title}
      </h1>
      <p className="mt-3 text-portal-muted">{post.description}</p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-portal-muted/70">
        {t('minRead', { n: post.readMinutes })}
      </p>

      <div className="mt-8 space-y-10">
        {sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-xl font-bold text-portal-text">{section.heading}</h2>
            {section.body.map((para, j) => (
              <p key={j} className="mt-3 leading-relaxed text-portal-muted">
                <RichParagraph text={para} />
              </p>
            ))}
            {section.tiles?.length ? <ArticleTiles tiles={section.tiles} /> : null}
          </section>
        ))}
      </div>

      {post.faq.length ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-portal-text">{t('faq')}</h2>
          <div className="mt-4 space-y-3">
            {post.faq.map((item, i) => (
              <div key={i} className="rounded-2xl border border-portal-border bg-portal-panel p-4">
                <h3 className="font-semibold text-portal-text">{item.question}</h3>
                <p className="mt-2 text-sm text-portal-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-portal-text">{learn('related')}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="rounded-2xl border border-portal-border bg-portal-panel p-4 hover:border-portal-accent"
              >
                <p className="font-semibold text-portal-text">{item.title}</p>
                <p className="mt-2 text-xs text-portal-muted">{t('minRead', { n: item.readMinutes })}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-12 rounded-2xl border border-portal-border bg-portal-panel p-8 text-center">
        <p className="text-lg font-bold text-portal-text">{ctaLabel}</p>
        <Link
          href={ctaHref}
          className="mt-4 inline-block rounded-full bg-portal-accent px-8 py-3 font-bold text-portal-on-accent transition hover:brightness-110"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
