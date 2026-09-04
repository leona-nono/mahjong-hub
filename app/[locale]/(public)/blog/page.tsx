import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { hubPageMeta } from '@/lib/hub-seo';
import { getBlogPosts, getLocalizedBlogPosts } from '@/data/blog';

export const dynamic = 'force-static';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return hubPageMeta({
    locale,
    path: '/blog',
    titleKey: 'blogTitle',
    pageLabel: t('beginners'),
    description: t('beginnersSubtitle')
  });
}

export default async function BlogPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');
  const posts = getLocalizedBlogPosts(getBlogPosts(), locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-portal-text">
        {t('beginners')}
      </h1>
      <p className="mt-2 text-portal-muted">{t('beginnersSubtitle')}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl border border-portal-border bg-portal-panel p-5 transition hover:border-portal-accent/40 hover:shadow-portal"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-portal-text">{post.title}</h2>
              <span className="shrink-0 rounded-md bg-black/30 px-2 py-0.5 text-xs font-medium text-portal-muted">
                {post.readMinutes} min
              </span>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-portal-muted">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
