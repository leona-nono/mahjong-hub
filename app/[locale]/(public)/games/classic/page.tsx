import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CLASSIC_REGIONS, getClassicByRegion } from '@/data/games';
import GameCard from '@/components/GameCard';

export default async function ClassicGamesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');
  const tg = await getTranslations('game');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl rainbow-card px-6 py-10 text-center">
        <h1 className="text-3xl font-black rainbow-text sm:text-4xl">
          {t('classic')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          {t('classicSubtitle')}
        </p>
      </section>

      <div className="mt-10 space-y-12">
        {CLASSIC_REGIONS.map((region) => {
          const games = getClassicByRegion(region.region);
          return (
            <section key={region.region}>
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                {t(region.labelKey)}
              </h2>
              {games.length ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {games.map((g) => (
                    <GameCard key={g.slug} game={g} locale={locale} />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-400">
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
