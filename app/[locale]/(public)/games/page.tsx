import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { getMergedGames, getMergedLocalizedGames } from '@/lib/games-db';
import GameCard from '@/components/GameCard';
import { alternatesFor } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor(locale, '/games') };
}

export default async function GamesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('collection');
  const games = getMergedLocalizedGames(await getMergedGames(), locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl rainbow-card px-6 py-10 text-center">
        <h1 className="text-3xl font-black rainbow-text sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          {t('subtitle')}
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
