import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getLocalizedBlogPost } from '@/data/blog';

const CARDS = [
  { key: 'scratch', href: '/blog/what-is-mahjong', slug: 'what-is-mahjong' },
  { key: 'tiles', href: '/blog/mahjong-tiles-meaning-guide', slug: 'mahjong-tiles-meaning-guide' },
  { key: 'scoring', href: '/blog/mahjong-scoring-system-explained', slug: 'mahjong-scoring-system-explained' },
  { key: 'glossary', href: '/learn/glossary' }
] as const;

export default async function HomeLearnCards({ locale = 'en' }: { locale?: string }) {
  const t = await getTranslations('learn');
  return (
    <section aria-labelledby="home-learn">
      <h2 id="home-learn" className="font-display text-xl font-semibold text-portal-text sm:text-2xl">
        {t('title')}
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-portal-muted">{t('subtitle')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const description = 'slug' in card
            ? getLocalizedBlogPost(card.slug, locale)?.description
            : t('glossaryLead');
          return (
            <Link
              key={card.key}
              href={card.href}
              className="rounded-2xl border border-portal-border bg-portal-panel p-4 hover:border-portal-accent"
            >
              <p className="text-sm font-semibold text-portal-text">{t(card.key)}</p>
              {description ? <p className="mt-2 line-clamp-3 text-xs text-portal-muted">{description}</p> : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
