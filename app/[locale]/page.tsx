import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { getFeaturedGames, getGames } from '@/data/games';
import GameCard from '@/components/GameCard';
import { Link } from '@/i18n/navigation';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const ts = await getTranslations('site');
  const featured = getFeaturedGames();
  const all = getGames();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ts('name'),
    description: ts('tagline'),
    url: 'https://mahjonggame.org',
    inLanguage: ['en', 'zh', 'zh-TW', 'ja', 'ko']
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="rounded-3xl rainbow-card px-6 py-12 text-center">
        <h1 className="text-4xl font-black rainbow-text sm:text-5xl">
          {t('heroTitle')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          {t('heroSubtitle')}
        </p>
        <Link
          href="/games"
          className="mt-6 inline-block rounded-full rainbow-bar px-8 py-3 font-bold text-white shadow-md transition hover:opacity-90"
        >
          {t('playButton')}
        </Link>
      </section>

      {/* Featured */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          {t('featuredTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {featured.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>

      {/* All games */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          {t('collectionTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {all.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
