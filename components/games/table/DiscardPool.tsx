'use client';

import TileFace from '../TileFace';
import type { GameState, Seat } from '@/lib/mahjong/engine';

export interface DiscardPoolProps {
  state: GameState;
  seat: Seat;
  className: string;
}

/**
 * One player's discard river (and exposed melds above it) on the table.
 */
export default function DiscardPool({ state, seat, className }: DiscardPoolProps) {
  const player = state.players[seat];
  return (
    <div className={`absolute z-[5] w-[190px] ${className}`}>
      {player.melds.length > 0 && (
        <div className="mb-1 flex justify-center gap-1">
          {player.melds.map((meld, meldIndex) => (
            <div key={meldIndex} className="flex gap-px bg-black/10 p-0.5">
              {meld.tiles.map((tile, tileIndex) => <TileFace key={tileIndex} tile={tile} size="md" traditional />)}
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-6 justify-items-center gap-0.5">
        {player.discards.slice(-18).map((tile, index, visible) => {
          const latest = state.lastDiscard?.from === seat && index === visible.length - 1;
          return (
            <span key={`${tile}-${index}`} className={latest ? 'relative after:absolute after:-right-1 after:-top-1 after:h-2.5 after:w-2.5 after:rotate-45 after:bg-yellow-300' : ''}>
              <TileFace tile={tile} size="sm" traditional muted={!latest} highlight={latest} />
            </span>
          );
        })}
      </div>
    </div>
  );
}
