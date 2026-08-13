import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getGamesByNavGroup } from '@/data/games';
import GameCard from '@/components/GameCard';
import { alternatesFor } from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor(locale, '/games/solitaire') };
}

export default async function SolitaireGamesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');
  const games = getGamesByNavGroup('solitaire');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl rainbow-card px-6 py-10 text-center">
        <h1 className="text-3xl font-black rainbow-text sm:text-4xl">
          {t('solitaire')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          {t('solitaireSubtitle')}
        </p>
      </section>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {games.map((g) => (
          <GameCard key={g.slug} game={g} locale={locale} />
        ))}
      </div>
    </div>
  );
}
