import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { getFeaturedGames, getGames, getNativeGames } from '@/data/games';
import GameCard from '@/components/GameCard';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import AppearanceCabinet from '@/components/AppearanceCabinet';

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
  const native = getNativeGames();
  const all = getGames();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ts('name'),
    description: ts('tagline'),
    url: 'https://mahjonggame.org',
    inLanguage: ['en', 'zh', 'zh-TW', 'ja', 'ko', 'es', 'pt-BR', 'fr', 'de']
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative isolate min-h-[390px] overflow-hidden rounded-3xl rainbow-card px-6 py-12 sm:min-h-[430px] sm:px-10">
        <Image
          src="/images/key-art/mahjong-hub-solitaire-key-art-v1.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 100vw, 1024px"
          className="-z-20 object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#fffdf7]/95 via-[#fffdf7]/78 to-[#fffdf7]/10" />
        <div className="max-w-xl pt-4 text-left sm:pt-10">
          <h1 className="text-4xl font-black leading-tight rainbow-text sm:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-[#52617a]">
            {t('heroSubtitle')}
          </p>
          <Link
            href="/games"
            className="mt-7 inline-block rounded-lg bg-[#1e554d] px-7 py-3 font-bold text-white shadow-md transition hover:bg-[#2d756a]"
          >
            {t('playButton')}
          </Link>
        </div>
      </section>

      {/* Our own games — the differentiator, so they go above the fold. */}
      <section className="mt-12">
        <h2 className="mb-1 text-2xl font-bold text-gray-800">
          {t('originalTitle')}
        </h2>
        <p className="mb-4 text-sm text-gray-500">{t('originalSubtitle')}</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {native.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
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

      <section className="mt-12 overflow-hidden rounded-3xl border border-[#d8d7cd] bg-[#fffdf7] p-5 sm:p-7">
        <div className="max-w-2xl">
          <h2 className="font-serif text-2xl font-bold text-[#1d2a44]">{t('seasonalTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-[#52617a]">{t('seasonalBody')}</p>
        </div>
        <AppearanceCabinet />
      </section>
    </div>
  );
}
