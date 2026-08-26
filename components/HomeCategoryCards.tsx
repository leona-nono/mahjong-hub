import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

const CARDS = [
  {
    href: '/games/solitaire',
    titleKey: 'catSolitaire' as const,
    bodyKey: 'catSolitaireBody' as const,
    accent: 'from-teal-900/80 to-portal-panel'
  },
  {
    href: '/games/classic',
    titleKey: 'catFourPlayer' as const,
    bodyKey: 'catFourPlayerBody' as const,
    accent: 'from-emerald-900/70 to-portal-panel'
  },
  {
    href: '/games',
    titleKey: 'catMore' as const,
    bodyKey: 'catMoreBody' as const,
    accent: 'from-sky-950/70 to-portal-panel'
  }
];

/** Three SEO funnel cards under the daily board. */
export default async function HomeCategoryCards() {
  const t = await getTranslations('home');

  return (
    <section aria-labelledby="home-categories">
      <h2 id="home-categories" className="sr-only">
        {t('categoriesTitle')}
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`rounded-2xl border border-portal-border bg-gradient-to-br ${card.accent} px-5 py-6 transition hover:border-portal-accent/50`}
          >
            <h3 className="font-display text-lg font-semibold text-portal-text">
              {t(card.titleKey)}
            </h3>
            <p className="mt-2 text-sm text-portal-muted">{t(card.bodyKey)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
