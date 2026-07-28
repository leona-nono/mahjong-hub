import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { getGame, getRelatedGames, getGames } from '@/data/games';
import IframeSection from '@/components/IframeSection';
import GameCard from '@/components/GameCard';
import AdSlot from '@/components/AdSlot';

export function generateStaticParams() {
  return getGames().flatMap((g) =>
    ['en', 'zh', 'zh-TW', 'ja', 'ko'].map((locale) => ({ locale, slug: g.slug }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: game.title,
    description: game.description,
    // The iframe content is cross-origin and not ours; keep the wrapper thin
    // and let content pages (home / collection) carry SEO.
    robots: { index: false, follow: true }
  };
}

export default async function GamePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const game = getGame(slug);
  if (!game) notFound();

  const t = await getTranslations('game');
  const related = getRelatedGames(slug, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-black rainbow-text">{game.title}</h1>
      <IframeSection game={game} />

      <AdSlot />

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          {t('tryAnother')}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {related.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
