import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { hubPageMeta } from '@/lib/hub-seo';
import { getBlogPosts, getLocalizedBlogPosts } from '@/data/blog';
import { BLOG_CLUSTERS, clusterSlugs } from '@/data/blog-clusters';

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
  const learn = await getTranslations('learn');
  const posts = getLocalizedBlogPosts(getBlogPosts(), locale);
  const bySlug = new Map(posts.map((post) => [post.slug, post]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        locale={locale}
        crumbs={[
          { name: t('home'), path: '/' },
          { name: t('beginners'), path: '/blog' }
        ]}
      />
      <h1 className="font-display text-3xl font-semibold text-portal-text">
        {t('beginners')}
      </h1>
      <p className="mt-2 text-portal-muted">{t('beginnersSubtitle')}</p>

      <div className="mt-10 space-y-10">
        {BLOG_CLUSTERS.map((cluster) => {
          const items = clusterSlugs(cluster)
            .map((slug) => bySlug.get(slug))
            .filter((post): post is NonNullable<typeof post> => Boolean(post));
          if (items.length === 0) return null;
          return (
            <section key={cluster.id} id={`cluster-${cluster.id}`} className={cluster.muted ? 'opacity-80' : undefined}>
              <h2 className="font-display text-xl font-semibold text-portal-text">
                {learn(`cluster.${cluster.id}`)}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {items.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block rounded-2xl border border-portal-border bg-portal-panel p-5 transition hover:border-portal-accent/40 hover:shadow-portal"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-portal-text">{post.title}</h3>
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
