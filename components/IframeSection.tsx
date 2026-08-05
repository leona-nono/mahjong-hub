import { useTranslations } from 'next-intl';
import LazyIframe from './LazyIframe';
import type { GameConfig } from '@/data/games';
import { getRelatedGames } from '@/data/games';

/**
 * Wraps a game iframe with a tap-to-play gate and a related-games fallback.
 * The surrounding page copy (title / description / related) carries SEO;
 * the external iframe itself is not indexed (cross-origin, noindex on detail route).
 */
export default function IframeSection({ game }: { game: GameConfig }) {
  const t = useTranslations('game');
  const related = getRelatedGames(game.slug, 4).map((g) => ({
    slug: g.slug,
    title: g.title
  }));

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-800">{t('about')}</h2>
        <p className="mt-1 text-sm text-gray-500">{game.description}</p>
      </div>
      {game.gameIframeUrl ? (
        <LazyIframe
          src={game.gameIframeUrl}
          title={game.title}
          fallbackGames={related}
        />
      ) : (
        <p className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500">
          {t('failedDesc')}
        </p>
      )}
    </section>
  );
}
