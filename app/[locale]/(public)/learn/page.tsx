import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { hubPageMeta } from '@/lib/hub-seo';
import { hubCollectionJsonLd } from '@/lib/hub-jsonld';
import { LEARNING_PATHS } from '@/data/learning-paths';
import { getLocalizedBlogPost } from '@/data/blog';
import { OFF_PATH_SLUGS } from '@/lib/learning-view';

export const dynamic = 'force-static';

const PATH_HREF = {
  start: '/learn/start',
  variants: '/learn/variants',
  advanced: '/learn/advanced'
} as const;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const learn = await getTranslations({ locale, namespace: 'learn' });
  return hubPageMeta({
    locale,
    path: '/learn',
    titleKey: 'learnTitle',
    pageLabel: learn('hubH1'),
    description: learn('hubLead')
  });
}

export default async function LearnPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const nav = await getTranslations('nav');
  const learn = await getTranslations('learn');

  // Culture + buying guides stay reachable but are deliberately not lessons.
  const offPathPosts = OFF_PATH_SLUGS.map((slug) => getLocalizedBlogPost(slug, locale)).filter(
    (post): post is NonNullable<typeof post> => Boolean(post)
  );

  const collectionLd = hubCollectionJsonLd({
    locale,
    path: '/learn',
    name: learn('hubH1'),
    description: learn('hubLead'),
    items: LEARNING_PATHS.map((path) => ({
      urlPath: PATH_HREF[path.id],
      name: learn(`path.${path.id}.title`)
    }))
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <Breadcrumbs
        locale={locale}
        crumbs={[
          { name: nav('home'), path: '/' },
          { name: learn('title'), path: '/learn' }
        ]}
      />
      <h1 className="font-display text-3xl font-semibold text-portal-text">{learn('hubH1')}</h1>
      <p className="mt-3 max-w-2xl text-portal-muted">{learn('hubLead')}</p>

      <div className="mt-8 space-y-4">
        {LEARNING_PATHS.map((path) => {
          const first = path.courses[0];
          const firstPost = first ? getLocalizedBlogPost(first.slug, locale) : undefined;
          return (
            <section
              key={path.id}
              className="rounded-2xl border border-portal-border bg-portal-panel p-5 sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-portal-accent/90">
                {learn('lessonCount', { n: path.courses.length })}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-portal-text sm:text-2xl">
                {learn(`path.${path.id}.title`)}
              </h2>
              <p className="mt-1 text-sm font-medium text-portal-muted">
                {learn(`path.${path.id}.subtitle`)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-portal-muted">
                {learn(`path.${path.id}.lead`)}
              </p>

              <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-5">
                {first && firstPost ? (
                  <Link
                    href={`/blog/${first.slug}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-portal-accent px-5 py-2.5 text-sm font-bold text-portal-on-accent transition hover:brightness-110"
                  >
                    {learn('startFirst')} →
                  </Link>
                ) : null}
                <Link
                  href={PATH_HREF[path.id]}
                  className="text-sm font-semibold text-portal-accent hover:underline"
                >
                  {learn('viewPath')}
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {learn('cultureTitle')}
        </h2>
        <p className="mt-2 text-sm text-portal-muted">{learn('cultureLead')}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {offPathPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block h-full rounded-2xl border border-portal-border bg-portal-panel p-4 transition hover:border-portal-accent/40"
              >
                <p className="font-semibold text-portal-text">{post.title}</p>
                <p className="mt-2 line-clamp-3 text-sm text-portal-muted">{post.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {learn('glossary')}
        </h2>
        <p className="mt-2 text-sm text-portal-muted">{learn('glossaryLead')}</p>
        <p className="mt-3 text-sm">
          <Link href="/learn/glossary" className="font-semibold text-portal-accent hover:underline">
            {learn('glossary')} →
          </Link>
        </p>
        <p className="mt-3 text-sm">
          <Link href="/blog" className="text-portal-muted underline hover:text-portal-accent">
            {learn('allArticles')}
          </Link>
        </p>
      </section>
    </div>
  );
}
