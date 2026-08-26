import { Link } from '@/i18n/navigation';
import type { GameConfig } from '@/data/games';
import { catalogCover } from '@/lib/game-cover';

type CatalogKind = 'solitaire' | 'classic';

const CLASSIC_COPY: Record<string, string> = {
  'american-mahjong': 'AMERICAN MAHJONG',
  'riichi-mahjong': 'RIICHI MAHJONG',
  'chinese-official-mahjong': 'CHINESE OFFICIAL',
  'hong-kong-mahjong': 'HONG KONG MAHJONG',
  'taiwan-mahjong': 'TAIWAN MAHJONG',
  'sichuan-mahjong': 'SICHUAN MAHJONG'
};

function visualKey(game: GameConfig) {
  return game.slug.replace(/[^a-z0-9]+/g, '-');
}

export default function CatalogGameCard({
  game,
  kind,
  compact = false
}: {
  game: GameConfig;
  kind: CatalogKind;
  compact?: boolean;
}) {
  const english = kind === 'classic' ? CLASSIC_COPY[game.slug] ?? game.title : undefined;
  const art = catalogCover(game.slug);

  return (
    <Link
      href={`/games/${game.slug}`}
      className="catalog-game-card group block focus:outline-none focus-visible:ring-2 focus-visible:ring-portal-accent"
    >
      <article className={`catalog-game-card__frame catalog-game-card__frame--${kind} ${compact ? 'catalog-game-card__frame--compact' : ''} catalog-art--${visualKey(game)}`}>
        <div className="catalog-game-card__art" aria-hidden>
          {art ? (
            // The approved catalogue design uses a different playable scene for every game.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={art}
              alt={`Play ${game.title} free online`}
              className="catalog-game-card__cover"
            />
          ) : (
            <>
              <div className="catalog-game-card__glow" />
              <div className="catalog-game-card__tiles">
                <img src="/assets/mahjong-solitaire/tiles/pin-05.png" alt="" className="catalog-tile catalog-tile--1" />
                <img src="/assets/mahjong-solitaire/tiles/sou-03.png" alt="" className="catalog-tile catalog-tile--2" />
                <img src="/assets/mahjong-solitaire/tiles/dragon-red.png" alt="" className="catalog-tile catalog-tile--3" />
              </div>
              <span className="catalog-game-card__motif" />
            </>
          )}
        </div>
        <div className="catalog-game-card__meta">
          <div className="min-w-0">
            <h2>{game.title}</h2>
            {english && !compact && <p>{english}</p>}
          </div>
          {!compact && kind === 'classic' && <span className="catalog-game-card__players">4 PLAYERS</span>}
          {!compact && <span className="catalog-game-card__play" aria-hidden>›</span>}
        </div>
      </article>
    </Link>
  );
}
