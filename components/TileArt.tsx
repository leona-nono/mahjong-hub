/**
 * Lightweight SVG mahjong tile faces — rendered inline, no image assets.
 * Used as decorative "牌图" inside blog articles and in article heroes.
 */
import type { TileSpec } from '@/data/tiles';

/** Standard dot/bamboo arrangements in a 3×3 grid (x, y ∈ {-1, 0, 1}). */
const DOT_GRID: Record<number, Array<[number, number]>> = {
  1: [[0, 0]],
  2: [[-1, 1], [1, -1]],
  3: [[-1, 1], [0, 0], [1, -1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]],
  6: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]],
  7: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1], [0, 0]],
  8: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  9: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]]
};

const CN_NUM: Record<number, string> = {
  1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九'
};

const WIND_CHAR: Record<string, string> = {
  east: '東', south: '南', west: '西', north: '北'
};

/** One tile face as an SVG fragment (46×58 viewBox). */
function TileGlyph({ tile }: { tile: TileSpec }) {
  const rank = tile.rank ?? 1;
  const motif = tile.suit === 'dot' ? '#1e5aa8' : '#2e7d32';

  switch (tile.suit) {
    case 'dot': {
      const dots = (DOT_GRID[rank] ?? DOT_GRID[1]).map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={23 + x * 9}
          cy={29 + y * 9}
          r={4}
          fill={motif}
        />
      ));
      return (
        <g>
          <rect x="4" y="6" width="38" height="46" rx="4" fill="#fffdf5" stroke="#c9bda6" strokeWidth="1.2" />
          {dots}
        </g>
      );
    }
    case 'bamboo': {
      const sticks = (DOT_GRID[rank] ?? DOT_GRID[1]).map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${23 + x * 9}, ${29 + y * 9})`}>
          <rect x="-1.6" y="-8" width="3.2" height="16" rx="1.6" fill={motif} />
          <circle cx="0" cy="-9" r="1.4" fill="#c62828" />
        </g>
      ));
      return (
        <g>
          <rect x="4" y="6" width="38" height="46" rx="4" fill="#fffdf5" stroke="#c9bda6" strokeWidth="1.2" />
          {sticks}
        </g>
      );
    }
    case 'char':
      return (
        <g>
          <rect x="4" y="6" width="38" height="46" rx="4" fill="#fffdf5" stroke="#c9bda6" strokeWidth="1.2" />
          <text x="23" y="25" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#1a1a1a">
            {CN_NUM[rank]}
          </text>
          <text x="23" y="46" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#a8231f">
            萬
          </text>
        </g>
      );
    case 'wind':
      return (
        <g>
          <rect x="4" y="6" width="38" height="46" rx="4" fill="#fffdf5" stroke="#1e5aa8" strokeWidth="2.2" />
          <text x="23" y="36" textAnchor="middle" fontSize="21" fontWeight="bold" fill="#1e5aa8">
            {WIND_CHAR[tile.wind ?? 'east']}
          </text>
        </g>
      );
    case 'dragon': {
      const isWhite = tile.dragon === 'white';
      const color = tile.dragon === 'green' ? '#2e7d32' : '#c62828';
      return (
        <g>
          <rect x="4" y="6" width="38" height="46" rx="4" fill={isWhite ? '#fffdf5' : '#fffdf5'} stroke={isWhite ? '#1e5aa8' : color} strokeWidth="2.2" />
          {!isWhite && (
            <text x="23" y="36" textAnchor="middle" fontSize="21" fontWeight="bold" fill={color}>
              {tile.dragon === 'green' ? '發' : '中'}
            </text>
          )}
        </g>
      );
    }
  }
}

/** A single tile (svg element, sized to the caller's max-height). */
export default function TileArt({
  tile,
  size = 52
}: {
  tile: TileSpec;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 46 58"
      width={size * (46 / 58)}
      height={size}
      className="inline-block drop-shadow-sm"
      role="img"
      aria-label={`mahjong tile ${tile.suit}${tile.rank ?? ''}`}
    >
      <TileGlyph tile={tile} />
    </svg>
  );
}

/** A row of tiles (used under blog sections and in heroes). */
export function TileRow({ tiles, size = 52 }: { tiles: TileSpec[]; size?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-1">
      {tiles.map((tile, i) => (
        <TileArt key={i} tile={tile} size={size} />
      ))}
    </div>
  );
}
