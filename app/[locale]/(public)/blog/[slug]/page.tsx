import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import MarkdownContent from '@/components/MarkdownContent';
import { pageMeta } from '@/lib/seo';
import { UI_LOCALES } from '@/lib/locales';
import { getBlogPosts } from '@/data/blog';
import { getPublicGuide, localizeStaticGuide } from '@/lib/guides';
import { brandName, getSiteSettings } from '@/lib/site-settings';

const SITE = 'https://mahjonggame.org';

export const revalidate = 86_400;

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
  const cms = await getPublicGuide(slug);
  const post = cms?.source === 'cms' ? cms : localizeStaticGuide(slug, locale) ?? cms;
  if (!post) return {};
  const site = await getSiteSettings();
  return pageMeta({
    locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.description,
    ogImage: post.cover || site.ogImage,
    siteName: brandName(site),
    type: 'article',
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

  const cms = await getPublicGuide(slug);
  const post = cms?.source === 'cms' ? cms : localizeStaticGuide(slug, locale) ?? cms;
  if (!post) notFound();

  const t = await getTranslations('game');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url: `${SITE}/${locale}/blog/${slug}`,
    inLanguage: locale,
    isAccessibleForFree: true
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {post.cover ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-portal-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt="" className="w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-8">
        <MarkdownContent markdown={post.content} />
      </div>

      {post.ctaHref ? (
        <div className="mt-12 rounded-2xl border border-portal-border bg-portal-panel p-8 text-center">
          <p className="text-lg font-bold text-portal-text">
            {post.ctaLabel || 'Play Now'}
          </p>
          <Link
            href={post.ctaHref}
            className="mt-4 inline-block rounded-full bg-portal-accent px-8 py-3 font-bold text-slate-900 transition hover:brightness-110"
          >
            {post.ctaLabel || 'Play Now'}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
