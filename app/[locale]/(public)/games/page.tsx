import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { getGames } from '@/data/games';
import GameCard from '@/components/GameCard';
import Image from 'next/image';

export default async function GamesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('collection');
  const games = getGames();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="relative isolate overflow-hidden rounded-3xl rainbow-card px-6 py-10 text-center">
        <Image src="/images/key-art/mahjong-hub-solitaire-key-art-v1.webp" alt="" fill sizes="(max-width: 640px) 100vw, 1024px" className="-z-20 object-cover object-[65%_52%] opacity-45" />
        <div className="absolute inset-0 -z-10 bg-[#fffdf7]/82" />
        <h1 className="text-3xl font-black rainbow-text sm:text-4xl">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-[#52617a]">{t('subtitle')}</p>
      </section>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {games.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
    </div>
  );
}
