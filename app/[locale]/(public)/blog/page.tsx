import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { pageMeta } from '@/lib/seo';
import { getPublicGuides } from '@/lib/guides';
import { brandName, getSiteSettings } from '@/lib/site-settings';

export const revalidate = 86_400;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const site = await getSiteSettings();
  return pageMeta({
    locale,
    path: '/blog',
    title: t('beginners'),
    description: t('beginnersSubtitle'),
    ogImage: site.ogImage,
    siteName: brandName(site)
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
  const posts = await getPublicGuides();

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
            {post.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover}
                alt=""
                className="mb-3 aspect-[16/9] w-full rounded-lg object-cover"
              />
            ) : null}
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
