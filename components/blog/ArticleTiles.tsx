/**
 * The 牌图 row rendered under a blog section.
 *
 * This is intentionally the *same artwork* the game table uses (`lib/mahjong/
 * tile-art`), not a second simplified drawing: a reader who studies three dots
 * here and then opens the table meets the exact same three dots there.
 *
 * Server-rendered on purpose — article pages are static content, so the tiles
 * ship as plain `<picture>`/`<img>` markup with real alt text and no client JS.
 */
import { TILE_ART_SIZE, tileArtPngSrc, tileArtWebpSrc, hasTileArt, type TilePhotoSize } from '@/lib/mahjong/tile-art';
import { tileHoverName } from '@/lib/mahjong/tile-hover';
import { isBonusTile, tileName, type Tile } from '@/lib/mahjong/tiles';
import { toEngineTiles } from '@/lib/mahjong/tile-spec';
import type { TileSpec } from '@/data/tiles';

export default function ArticleTiles({
  tiles,
  size = 'xl'
}: {
  tiles: readonly TileSpec[];
  size?: TilePhotoSize;
}) {
  // A tile with no artwork is dropped rather than drawn as a broken image; the
  // alternative — reusing unrelated art — would mislabel the content.
  const engineTiles = toEngineTiles(tiles).filter(hasTileArt);
  if (!engineTiles.length) return null;

  return (
    <div
      data-article-tiles
      className="mx-auto mt-6 flex w-fit max-w-full flex-wrap items-end justify-center gap-x-2 gap-y-4 rounded-2xl border border-portal-border bg-portal-panel/70 px-5 py-6"
    >
      {engineTiles.map((tile, index) => (
        <TilePicture key={`${tile}-${index}`} tile={tile} size={size} />
      ))}
    </div>
  );
}

function TilePicture({ tile, size }: { tile: Tile; size: TilePhotoSize }) {
  const hover = tileHoverName(tile);

  return (
    <span className={`group/tile relative inline-block ${TILE_ART_SIZE[size]}`}>
      <picture className="block h-full w-full">
        {!isBonusTile(tile) && <source srcSet={tileArtWebpSrc(tile)} type="image/webp" />}
        <img
          src={tileArtPngSrc(tile)}
          alt={tileName(tile)}
          width={150}
          height={210}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="block h-full w-full rounded-md object-cover"
        />
      </picture>
      {/* Bilingual teaching label: the Chinese face above the English reading. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-7 left-1/2 z-30 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/15 group-hover/tile:block"
      >
        {hover}
      </span>
    </span>
  );
}
