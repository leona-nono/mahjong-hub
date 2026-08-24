import { Link } from '@/i18n/navigation';
import type { GameConfig } from '@/data/games';

type CatalogKind = 'solitaire' | 'classic';

const CLASSIC_COPY: Record<string, string> = {
  'american-mahjong': 'AMERICAN MAHJONG',
  'riichi-mahjong': 'RIICHI MAHJONG',
  'chinese-official-mahjong': 'CHINESE OFFICIAL',
  'hong-kong-mahjong': 'HONG KONG MAHJONG',
  'taiwan-mahjong': 'TAIWAN MAHJONG',
  'sichuan-mahjong': 'SICHUAN MAHJONG'
};

const SOLITAIRE_ART: Record<string, string> = {
  'mahjong-connect-classic': '/images/catalog/solitaire/mahjong-connect.png',
  'mahjong-solitaire-classic': '/images/catalog/solitaire/mahjong-solitaire-classic.png',
  'mahjong-connect': '/images/catalog/solitaire/mahjong-connect-lite.png',
  'mahjong-classic': '/images/catalog/solitaire/mahjong-classic.png',
  'mahjong-solitaire': '/images/catalog/solitaire/mahjong-connect-pipe.png',
  'mahjong-3d': '/images/catalog/solitaire/mahjong-3d.png',
  'onet-connect-classic': '/images/catalog/solitaire/onet-connect-classic.png',
  'bee-connect': '/images/catalog/solitaire/bee-connect.png',
  'aloha-mahjong': '/images/catalog/solitaire/aloha-mahjong.png',
  '8x8-match-tiles': '/images/catalog/solitaire/8x8-match-tiles.png',
  'tile-guru': '/images/catalog/solitaire/tile-guru.png',
  'tile-journey': '/images/catalog/solitaire/tile-journey.png'
};

const CLASSIC_ART: Record<string, string> = {
  'american-mahjong': '/images/catalog/classic/american-mahjong.png',
  'riichi-mahjong': '/images/catalog/classic/riichi-mahjong.png',
  'chinese-official-mahjong': '/images/catalog/classic/chinese-official-mahjong.png',
  'hong-kong-mahjong': '/images/catalog/classic/hong-kong-mahjong.png',
  'taiwan-mahjong': '/images/catalog/classic/taiwan-mahjong.png',
  'sichuan-mahjong': '/images/catalog/classic/sichuan-mahjong.png'
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
  const art = kind === 'solitaire' ? SOLITAIRE_ART[game.slug] : CLASSIC_ART[game.slug];

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
            <img src={art} alt="" className="catalog-game-card__cover" />
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
