import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CLASSIC_REGIONS } from '@/data/games';
import { getMergedClassicByRegion, getMergedLocalizedGames } from '@/lib/games-db';
import GameCard from '@/components/GameCard';
import { alternatesFor } from '@/lib/seo';

export const revalidate = 86_400;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor(locale, '/games/classic') };
}

export default async function ClassicGamesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');
  const tg = await getTranslations('game');
  const gamesByRegion = new Map(
    await Promise.all(
      CLASSIC_REGIONS.map(
        async (r) =>
          [
            r.region,
            getMergedLocalizedGames(await getMergedClassicByRegion(r.region), locale)
          ] as const
      )
    )
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-display text-2xl font-semibold text-portal-text sm:text-3xl">
        {t('classic')}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-portal-muted">{t('classicSubtitle')}</p>

      <div className="mt-8 space-y-10">
        {CLASSIC_REGIONS.map((region) => {
          const games = gamesByRegion.get(region.region) ?? [];
          return (
            <section key={region.region}>
              <h2 className="mb-3 font-display text-lg font-semibold text-portal-text">
                {t(region.labelKey)}
              </h2>
              {games.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {games.map((g) => (
                    <GameCard key={g.slug} game={g} />
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-portal-border p-4 text-sm text-portal-muted">
                  {tg('comingSoon')}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
