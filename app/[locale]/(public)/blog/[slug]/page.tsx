import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { pageMeta } from '@/lib/seo';
import { UI_LOCALES } from '@/lib/locales';
import { getBlogPosts, getLocalizedBlogPost } from '@/data/blog';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';

const SITE = 'https://mahjonggame.org';

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
  const ctaHref = post.cta?.href ?? null;
  const ctaLabel = post.cta?.label ?? null;

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
        {t('minRead', { n: post.readMinutes })}
      </p>

      <div className="mt-8 space-y-10">
        {post.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-xl font-bold text-portal-text">{section.heading}</h2>
            {section.body.map((para, j) => (
              <p key={j} className="mt-3 leading-relaxed text-portal-muted">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>

      {ctaHref ? (
        <div className="mt-12 rounded-2xl border border-portal-border bg-portal-panel p-8 text-center">
          <p className="text-lg font-bold text-portal-text">
            {ctaLabel || t('playNow')}
          </p>
          <Link
            href={ctaHref}
            className="mt-4 inline-block rounded-full bg-portal-accent px-8 py-3 font-bold text-slate-900 transition hover:brightness-110"
          >
            {ctaLabel || t('playNow')}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
