import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBlogPosts, getLocalizedBlogPosts } from '@/data/blog';
import { pageMeta } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-static';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const site = getPublicSiteSettings();
  return pageMeta({
    locale,
    path: '/games/beginners',
    title: t('beginners'),
    description: t('beginnersSubtitle'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

export default async function BeginnersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');
  const posts = getLocalizedBlogPosts(getBlogPosts(), locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black rainbow-text">{t('beginners')}</h1>
      <p className="mt-3 text-gray-600">{t('beginnersSubtitle')}</p>

      <div className="mt-10 space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/games/beginners/${post.slug}`}
            className="block rounded-2xl rainbow-card p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-800">{post.title}</h2>
              <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                {post.readMinutes} min
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-gray-500">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
