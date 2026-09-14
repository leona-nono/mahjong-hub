import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const CARDS = [
  { key: 'scratch', href: '/blog/what-is-mahjong' },
  { key: 'tiles' },
  { key: 'scoring' },
  { key: 'glossary' }
] as const;

export default async function HomeLearnCards() {
  const t = await getTranslations('learn');
  return (
    <section aria-labelledby="home-learn">
      <h2 id="home-learn" className="font-display text-xl font-semibold text-portal-text sm:text-2xl">
        {t('title')}
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-portal-muted">{t('subtitle')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) =>
          'href' in card ? (
            <Link
              key={card.key}
              href={card.href}
              className="rounded-2xl border border-portal-border bg-portal-panel p-4 text-sm font-semibold text-portal-text hover:border-portal-accent"
            >
              {t(card.key)}
            </Link>
          ) : (
            <div
              key={card.key}
              className="rounded-2xl border border-dashed border-portal-border bg-portal-panel/60 p-4"
            >
              <p className="text-sm font-semibold text-portal-text">{t(card.key)}</p>
              <p className="mt-1 text-xs text-portal-muted">{t('comingSoon')}</p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
