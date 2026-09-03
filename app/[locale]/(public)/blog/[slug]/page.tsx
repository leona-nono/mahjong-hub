import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import MarkdownContent from '@/components/MarkdownContent';
import { pageMeta } from '@/lib/seo';
import { UI_LOCALES } from '@/lib/locales';
import { getBlogPosts, getLocalizedBlogPost, type BlogPost } from '@/data/blog';
import { getPublicGuide, resolvePublicGuide, type PublicGuide } from '@/lib/guides';
import { brandName, getSiteSettings } from '@/lib/site-settings';

const SITE = 'https://mahjonggame.org';

/** Shorter ISR so locale/copy fixes reach production without waiting a full day. */
export const revalidate = 300;

export function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.flatMap((post) =>
    UI_LOCALES.map((locale) => ({ locale, slug: post.slug }))
  );
}

type Resolved =
  | { kind: 'localized'; post: BlogPost }
  | { kind: 'guide'; post: PublicGuide };

function resolveBlogPage(slug: string, locale: string, cms: PublicGuide | undefined): Resolved | undefined {
  // Non-English: always prefer static JSON sections. CMS rows are English-only
  // and previously left H2 bodies stuck on "What You Need to Play" etc.
  if (locale !== 'en') {
    const localized = getLocalizedBlogPost(slug, locale);
    if (localized) return { kind: 'localized', post: localized };
  }
  const guide = resolvePublicGuide(slug, locale, cms);
  return guide ? { kind: 'guide', post: guide } : undefined;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cms = await getPublicGuide(slug);
  const resolved = resolveBlogPage(slug, locale, cms);
  if (!resolved) return {};
  const site = await getSiteSettings();
  return pageMeta({
    locale,
    path: `/blog/${slug}`,
    title: resolved.post.title,
    description: resolved.post.description,
    ogImage:
      (resolved.kind === 'guide' ? resolved.post.cover : null) || site.ogImage,
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

  const cms = await getPublicGuide(slug);
  const resolved = resolveBlogPage(slug, locale, cms);
  if (!resolved) notFound();

  const t = await getTranslations('game');
  const { post } = resolved;
  const cover = resolved.kind === 'guide' ? resolved.post.cover : null;
  const ctaHref =
    resolved.kind === 'guide'
      ? resolved.post.ctaHref
      : resolved.post.cta?.href ?? null;
  const ctaLabel =
    resolved.kind === 'guide'
      ? resolved.post.ctaLabel
      : resolved.post.cta?.label ?? null;
  const readMinutes = post.readMinutes;

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
        {readMinutes} min read
      </p>

      {cover ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-portal-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="w-full object-cover" />
        </div>
      ) : null}

      {resolved.kind === 'localized' ? (
        <div className="mt-8 space-y-10">
          {resolved.post.sections.map((section, i) => (
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
      ) : (
        <div className="mt-8">
          <MarkdownContent markdown={resolved.post.content} />
        </div>
      )}

      {ctaHref ? (
        <div className="mt-12 rounded-2xl border border-portal-border bg-portal-panel p-8 text-center">
          <p className="text-lg font-bold text-portal-text">
            {ctaLabel || 'Play Now'}
          </p>
          <Link
            href={ctaHref}
            className="mt-4 inline-block rounded-full bg-portal-accent px-8 py-3 font-bold text-slate-900 transition hover:brightness-110"
          >
            {ctaLabel || 'Play Now'}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
