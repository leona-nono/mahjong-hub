import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

type CardDef = {
  href: string;
  titleKey: 'catSolitaire' | 'catFourPlayer' | 'catMore';
  bodyKey: 'catSolitaireBody' | 'catFourPlayerBody' | 'catMoreBody';
  accent: string;
};

const BASE_CARDS: CardDef[] = [
  {
    href: '/games/solitaire',
    titleKey: 'catSolitaire',
    bodyKey: 'catSolitaireBody',
    accent: 'from-teal-900/80 to-portal-panel'
  },
  {
    href: '/games/classic',
    titleKey: 'catFourPlayer',
    bodyKey: 'catFourPlayerBody',
    accent: 'from-emerald-900/70 to-portal-panel'
  },
  {
    href: '/games',
    titleKey: 'catMore',
    bodyKey: 'catMoreBody',
    accent: 'from-sky-950/70 to-portal-panel'
  }
];

/**
 * Three SEO funnel cards. On `/games` itself, the “More” card must not
 * self-link — pass moreHref="/games/solitaire") (NAV_AND_GAMES_IA_SPEC §4.4).
 */
export default async function HomeCategoryCards({
  moreHref = '/games'
}: {
  moreHref?: string;
}) {
  const t = await getTranslations('home');
  const cards = BASE_CARDS.map((card) =>
    card.titleKey === 'catMore' ? { ...card, href: moreHref } : card
  );

  return (
    <section aria-labelledby="home-categories">
      <h2 id="home-categories" className="sr-only">
        {t('categoriesTitle')}
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={`${card.titleKey}-${card.href}`}
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
