'use client';

import { useMemo } from 'react';

import SolitaireTileFace from '@/components/games/SolitaireTileFace';
import {
  isExposed,
  type Board
} from '@/lib/mahjong-solitaire/board';
import { tileName } from '@/lib/mahjong/tiles';
import type { useMahjongPreferences } from '@/components/games/MahjongAccessibilityPanel';

const CELL_W = 44;
const CELL_H = 58;
const STACK_X = 22;
const STACK_Y = 16;

type Preferences = ReturnType<typeof useMahjongPreferences>['preferences'];

export type SolitaireBoardProps = {
  board: Board;
  selected: number | null;
  hint: [number, number] | null;
  status: 'playing' | 'won' | 'dead';
  paused: boolean;
  dealReady: boolean;
  showCoach: boolean;
  coachTutorial?: string;
  preferences: Preferences;
  onTileClick: (index: number) => void;
};

export default function SolitaireBoard({
  board,
  selected,
  hint,
  status,
  paused,
  dealReady,
  showCoach,
  coachTutorial,
  preferences,
  onTileClick
}: SolitaireBoardProps) {
  const geometry = useMemo(() => {
    const pts = board.positions.map((p) => ({
      x: p.col * CELL_W - p.layer * STACK_X,
      y: p.row * CELL_H - p.layer * STACK_Y
    }));
    const minX = Math.min(...pts.map((pt) => pt.x));
    const minY = Math.min(...pts.map((pt) => pt.y));
    const maxX = Math.max(...pts.map((pt) => pt.x));
    const maxY = Math.max(...pts.map((pt) => pt.y));
    return {
      minX,
      minY,
      width: maxX - minX + CELL_W,
      height: maxY - minY + CELL_H
    };
  }, [board.positions]);

  return (
    <div
      className="solitaire-board-stage overflow-x-auto rounded-2xl border border-slate-700 bg-[#1e3843] px-3 py-5 shadow-inner"
      style={{
        backgroundImage:
          'linear-gradient(rgba(15,34,42,.78), rgba(15,34,42,.78)), var(--mahjong-table-image)',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <div
        className="relative mx-auto"
        style={{ width: geometry.width, height: geometry.height }}
      >
        {board.positions.map((p, i) => {
          const tile = board.tiles[i];
          if (tile === null) return null;
          const exposed = isExposed(board, i);
          const isSelected = selected === i;
          const isHinted = hint !== null && (hint[0] === i || hint[1] === i);
          const coachHighlight =
            showCoach &&
            coachTutorial === 'free_tile' &&
            exposed &&
            !isSelected;
          const freeHighlight =
            preferences.highlightFreeTiles &&
            exposed &&
            status === 'playing' &&
            !paused &&
            !isSelected &&
            !isHinted;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onTileClick(i)}
              disabled={!exposed || status !== 'playing' || !dealReady}
              aria-label={tileName(tile)}
              className={[
                'absolute rounded-lg transition',
                exposed
                  ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'
                  : 'cursor-default',
                coachHighlight ? 'ring-2 ring-sky-300/80' : '',
                freeHighlight ? 'solitaire-free-highlight' : ''
              ].join(' ')}
              style={{
                left: p.col * CELL_W - p.layer * STACK_X - geometry.minX,
                top: p.row * CELL_H - p.layer * STACK_Y - geometry.minY,
                zIndex: isSelected
                  ? 10000
                  : p.layer * 1000 + p.row * 100 + p.col
              }}
            >
              <SolitaireTileFace
                tile={tile}
                size="md"
                selected={isSelected}
                hinted={isHinted}
                dimmed={!exposed}
                colorblind={preferences.colorblindMarks}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
