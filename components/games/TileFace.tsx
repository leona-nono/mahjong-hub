'use client';

import { isFlower, isSpecialFace, tileFace, tileIndex, tileName, tileRank, tileSuit, type Tile } from '@/lib/mahjong/tiles';

export type TileSize = 'sm' | 'md' | 'lg';
export type TileTheme = 'classic' | 'heritage';

const ZODIAC = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
const SPECIAL_ART = ['spring', 'summer', 'autumn', 'winter', 'sheng', 'dan', 'jing', 'chou'];

const SIZE_CLASS: Record<TileSize, string> = {
  sm: 'h-11 w-8 text-[11px] rounded-md',
  md: 'h-[58px] w-11 text-base rounded-lg',
  lg: 'h-[76px] w-[58px] text-xl rounded-xl'
};

const SUIT_CLASS: Record<string, string> = {
  m: 'tile-character', p: 'tile-dot', s: 'tile-bamboo', z: 'tile-honour'
};

function SuitMark({ tile }: { tile: Tile }) {
  if (isFlower(tile)) {
    const flower = tileFace(tile);
    return <span className="flower-mark"><i>{isSpecialFace(tile) ? '◉' : '❀'}</i>{flower}</span>;
  }
  const suit = tileSuit(tile);
  const rank = tileRank(tile);
  if (suit === 'm') return <span className="tile-number">{rank}</span>;
  if (suit === 'p') {
    const positions = [
      ['middle'], ['top-left', 'bottom-right'], ['top-left', 'middle', 'bottom-right'],
      ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      ['top-left', 'top-right', 'middle', 'bottom-left', 'bottom-right'],
      ['top-left', 'mid-left', 'bottom-left', 'top-right', 'mid-right', 'bottom-right'],
      ['top-left', 'mid-left', 'bottom-left', 'middle', 'top-right', 'mid-right', 'bottom-right'],
      ['top-left', 'mid-left', 'bottom-left', 'top-right', 'mid-right', 'bottom-right', 'top-middle', 'bottom-middle'],
      ['top-left', 'mid-left', 'bottom-left', 'top-right', 'mid-right', 'bottom-right', 'top-middle', 'middle', 'bottom-middle']
    ][rank - 1];
    return <span className="dot-grid">{positions.map((position) => <i key={position} className={position} />)}</span>;
  }
  if (suit === 's') return <span className="bamboo-mark">{Array.from({ length: rank }, (_, i) => <i key={i} />)}</span>;
  const honours = [
    ['☀', '東'], ['◒', '南'], ['☾', '西'], ['✦', '北'], ['□', '白'], ['✤', '發'], ['●', '中']
  ];
  return <span className="honour-mark"><i>{honours[rank - 1][0]}</i>{honours[rank - 1][1]}</span>;
}

export interface TileFaceProps { tile: Tile; size?: TileSize; theme?: TileTheme; onClick?: (tile: Tile) => void; disabled?: boolean; highlight?: boolean; muted?: boolean; }

export default function TileFace({ tile, size = 'md', theme = 'classic', onClick, disabled, highlight, muted }: TileFaceProps) {
  const suit = tileSuit(tile);
  const flower = isFlower(tile);
  const rank = tileRank(tile);
  const interactive = Boolean(onClick) && !disabled;
  const atlasIndex = tileIndex(tile);
  const atlasColumn = atlasIndex % 9;
  const atlasRow = Math.floor(atlasIndex / 9);
  const classes = [
    'tile-face inline-flex select-none items-center justify-center border shadow-sm transition', SIZE_CLASS[size], flower ? 'tile-flower' : SUIT_CLASS[suit],
    muted ? 'tile-covered' : '', highlight ? 'tile-drawn' : '',
    theme === 'heritage' ? 'tile-heritage' : '', interactive ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md active:translate-y-0' : '', disabled ? 'opacity-100' : ''
  ].filter(Boolean).join(' ');
  const zodiac = ZODIAC[tileIndex(tile) % ZODIAC.length];
  const content = <>{flower ? <span className="tile-special-art" aria-hidden="true" style={{ backgroundImage: `url('/images/tiles/faces/special/${SPECIAL_ART[rank - 1]}-v1.webp')` }} /> : <><span className="tile-standard-art" aria-hidden="true" style={{ backgroundPosition: `${(atlasColumn * 100) / 8}% ${(atlasRow * 100) / 3}%` }} /><span className={`tile-a11y-marker tile-a11y-${suit}`} aria-hidden="true" /></>}{flower && <><span className="tile-corner tile-corner-top">✦</span><span className="tile-corner tile-corner-bottom">✦</span></>}{theme === 'heritage' && <span className="tile-zodiac" aria-hidden="true">{zodiac}</span>}</>;
  if (!interactive) return <span className={classes} role="img" aria-label={tileName(tile)}>{content}</span>;
  return <button type="button" className={classes} onClick={() => onClick?.(tile)} aria-label={tileName(tile)}>{content}</button>;
}

export function TileBack({ size = 'md' }: { size?: TileSize }) {
  return <span className={`tile-back inline-block ${SIZE_CLASS[size]}`} style={{ backgroundImage: 'var(--mahjong-tile-back-image)' }} aria-hidden="true"><i /></span>;
}
