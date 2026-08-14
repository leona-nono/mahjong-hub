import { describe, expect, it } from 'vitest';

import {
  canMatch,
  canRemove,
  exposedIndices,
  isCleared,
  isExposed,
  isFree,
  removePair,
  type Board
} from '@/lib/mahjong-solitaire/board';
import { createBoard, reshuffle, rescue } from '@/lib/mahjong-solitaire/generator';
import {
  availableMoves,
  findHint,
  findPairs,
  isDead,
  undo,
  undoForce
} from '@/lib/mahjong-solitaire/solver';
import { layoutTileCount } from '@/lib/mahjong-solitaire/layouts';
import {
  buildWall144,
  canMatchTiles,
  FREE_UNDO_PER_LEVEL,
  artKeyForTile,
  SEASON_TILES,
  FLOWER_TILES
} from '@/lib/mahjong-solitaire/tiles';
import {
  measureDifficulty,
  simulateGreedyClear
} from '@/lib/mahjong-solitaire/difficulty';
import {
  applyMatchScore,
  COMBO_WINDOW_MS,
  scoreForCombo,
  theoreticalMaxScore
} from '@/lib/mahjong-solitaire/scoring';
import {
  TEACHING_LEVELS,
  createLevelBoard,
  nextLevelId
} from '@/lib/mahjong-solitaire/levels';

function tileSig(board: Board): string {
  return board.tiles.map((t) => t ?? '.').join(',');
}

function solvePath(
  board: Board,
  visited = new Set<string>()
): [number, number][] | null {
  if (isCleared(board)) return [];
  const sig = tileSig(board);
  if (visited.has(sig)) return null;
  visited.add(sig);
  for (const [a, b] of findPairs(board)) {
    const rest = solvePath(removePair(board, a, b), visited);
    if (rest) return [[a, b], ...rest];
  }
  return null;
}

describe('solitaire tiles + art keys', () => {
  it('builds a 144-tile wall with 8 bonus tiles', () => {
    const wall = buildWall144();
    expect(wall).toHaveLength(144);
    expect(wall.filter((t) => SEASON_TILES.includes(t) || FLOWER_TILES.includes(t))).toHaveLength(
      8
    );
  });

  it('matches seasons and flowers as wild groups', () => {
    expect(canMatchTiles('f1', 'f3')).toBe(true);
    expect(canMatchTiles('f5', 'f8')).toBe(true);
    expect(canMatchTiles('f1', 'f5')).toBe(false);
    expect(canMatchTiles('m1', 'm1')).toBe(true);
    expect(canMatchTiles('m1', 'm2')).toBe(false);
  });

  it('maps art keys without 万 character filenames', () => {
    expect(artKeyForTile('m5')).toBe('man-05');
    expect(artKeyForTile('z5')).toBe('dragon-white');
    expect(artKeyForTile('f1')).toBe('season-spring');
  });
});

describe('layouts', () => {
  it('exposes even tile counts for all templates', () => {
    expect(layoutTileCount('flat36')).toBe(36);
    expect(layoutTileCount('classic')).toBe(144);
    expect(layoutTileCount('turtle')).toBe(74);
    expect(layoutTileCount('pyramid')).toBe(90);
    expect(layoutTileCount('mini') % 2).toBe(0);
  });
});

describe('createBoard', () => {
  it('deals classic 144 solvable boards', () => {
    const board = createBoard({ layout: 'classic', seed: 42 });
    expect(board.remaining).toBe(144);
    expect(board.freeUndosLeft).toBe(FREE_UNDO_PER_LEVEL);
    expect(board.tiles.every((t) => t !== null)).toBe(true);
    expect(isDead(board)).toBe(false);
  });

  it('keeps turtle 74 for continuity', () => {
    const board = createBoard({ layout: 'turtle', seed: 1 });
    expect(board.remaining).toBe(74);
  });

  it('same seed → same deal', () => {
    const a = createBoard({ layout: 'mini', seed: 99 });
    const b = createBoard({ layout: 'mini', seed: 99 });
    expect(tileSig(a)).toBe(tileSig(b));
  });

  it('teaching deal can exclude lookalikes and bonus', () => {
    const board = createBoard({
      layout: 'flat36',
      seed: 1001,
      includeBonus: false,
      avoidLookalikes: true
    });
    expect(board.remaining).toBe(36);
    for (const t of board.tiles) {
      expect(t).not.toBeNull();
      if (!t) continue;
      expect(SEASON_TILES.includes(t) || FLOWER_TILES.includes(t)).toBe(false);
      const rank = Number(t.slice(1));
      if (t[0] === 'm' || t[0] === 'p' || t[0] === 's') {
        expect(rank === 6 || rank === 9).toBe(false);
      }
    }
  });
});

describe('match + undo budget', () => {
  it('canRemove / isFree alias canMatch / isExposed', () => {
    const board = createBoard({ layout: 'mini', seed: 7 });
    const pair = findHint(board);
    expect(pair).not.toBeNull();
    if (!pair) return;
    expect(canRemove(board, pair[0], pair[1])).toBe(true);
    expect(canMatch(board, pair[0], pair[1])).toBe(true);
    expect(isFree(board, pair[0])).toBe(true);
    expect(availableMoves(board).length).toBeGreaterThan(0);
  });

  it('consumes free undos then blocks', () => {
    let board = createBoard({ layout: 'mini', seed: 3 });
    for (let i = 0; i < FREE_UNDO_PER_LEVEL; i += 1) {
      const pair = findHint(board);
      expect(pair).not.toBeNull();
      if (!pair) return;
      board = removePair(board, pair[0], pair[1]);
      const u = undo(board);
      expect(u.ok).toBe(true);
      if (u.ok) board = u.board;
    }
    const pair = findHint(board);
    expect(pair).not.toBeNull();
    if (!pair) return;
    board = removePair(board, pair[0], pair[1]);
    const blocked = undo(board);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.reason).toBe('no_free_undo');
    board = undoForce(board);
    expect(board.history.length).toBe(0);
  });

  it('reshuffle preserves free undo budget', () => {
    let board = createBoard({ layout: 'mini', seed: 8 });
    const pair = findHint(board)!;
    board = removePair(board, pair[0], pair[1]);
    const u = undo(board);
    expect(u.ok).toBe(true);
    if (!u.ok) return;
    board = u.board;
    expect(board.freeUndosLeft).toBe(FREE_UNDO_PER_LEVEL - 1);
    const next = reshuffle(board, 123);
    expect(next.freeUndosLeft).toBe(FREE_UNDO_PER_LEVEL - 1);
    expect(next.remaining).toBe(board.remaining);
  });
});

describe('rescue + difficulty', () => {
  it('rescue returns a board with remaining tiles', () => {
    const board = createBoard({ layout: 'turtle', seed: 11 });
    const rescued = rescue(board, 99);
    expect(rescued.remaining).toBeGreaterThan(0);
  });

  it('measureDifficulty reports branch width and diversity', () => {
    const board = createBoard({ layout: 'mini', seed: 5 });
    const m = measureDifficulty(board);
    expect(m.branchWidth).toBeGreaterThan(0);
    expect(m.remaining).toBe(board.remaining);
    expect(m.faceDiversity).toBeGreaterThan(0);
  });

  it('simulateGreedyClear finishes flat36 without excessive rescues', () => {
    const board = createBoard({
      layout: 'flat36',
      seed: 44,
      includeBonus: false
    });
    const sim = simulateGreedyClear(board, { maxRescues: 6, seed: 1 });
    expect(sim.cleared).toBe(true);
    expect(sim.deadEnds).toBeLessThanOrEqual(6);
  });
});

describe('scoring (E9)', () => {
  it('applies combo inside the 5s window and resets after', () => {
    let s = applyMatchScore({ score: 0, combo: 0, lastMatchAt: 0 }, 1000);
    expect(s.gained).toBe(scoreForCombo(1));
    s = applyMatchScore(s, 1000 + COMBO_WINDOW_MS - 1);
    expect(s.combo).toBe(2);
    expect(s.gained).toBe(scoreForCombo(2));
    s = applyMatchScore(s, s.lastMatchAt + COMBO_WINDOW_MS);
    expect(s.combo).toBe(1);
  });

  it('caps combo at ×5', () => {
    let s = { score: 0, combo: 0, lastMatchAt: 0 };
    let now = 1;
    for (let i = 0; i < 8; i += 1) {
      const next = applyMatchScore(s, now);
      s = { score: next.score, combo: next.combo, lastMatchAt: next.lastMatchAt };
      now += 100;
    }
    expect(s.combo).toBe(5);
  });

  it('theoretical max is monotonic', () => {
    expect(theoreticalMaxScore(2)).toBeLessThan(theoreticalMaxScore(3));
  });
});

describe('teaching levels', () => {
  it('defines three progressive lessons', () => {
    expect(TEACHING_LEVELS).toHaveLength(3);
    expect(nextLevelId('teach-1')).toBe('teach-2');
    expect(nextLevelId('teach-3')).toBeNull();
  });

  it('createLevelBoard deals teach-1 without bonus', () => {
    const board = createLevelBoard(TEACHING_LEVELS[0]);
    expect(board.remaining).toBe(36);
    expect(
      board.tiles.some(
        (t) => t && (SEASON_TILES.includes(t) || FLOWER_TILES.includes(t))
      )
    ).toBe(false);
  });

  it('teach-2 includes bonus faces', () => {
    const board = createLevelBoard(TEACHING_LEVELS[1]);
    expect(
      board.tiles.some(
        (t) => t && (SEASON_TILES.includes(t) || FLOWER_TILES.includes(t))
      )
    ).toBe(true);
  });
});

describe('solver path (flat36)', () => {
  it('finds a clearing path on a solvable flat deal', () => {
    const board = createBoard({
      layout: 'flat36',
      seed: 2,
      includeBonus: false
    });
    const path = solvePath(board);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(board.remaining / 2);
  });
});

describe('exposure helpers', () => {
  it('exposedIndices only returns free tiles', () => {
    const board = createBoard({ layout: 'turtle', seed: 4 });
    for (const i of exposedIndices(board)) {
      expect(isExposed(board, i)).toBe(true);
    }
  });

  it('single-layer corners are free; sandwiched middle is blocked', () => {
    const board = createBoard({
      layout: 'flat36',
      seed: 9,
      includeBonus: false
    });
    // Corner of 6×6 grid: row0 col0
    const corner = board.positions.findIndex((p) => p.row === 0 && p.col === 0);
    const mid = board.positions.findIndex((p) => p.row === 0 && p.col === 2);
    expect(corner).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThanOrEqual(0);
    expect(isExposed(board, corner)).toBe(true);
    expect(isExposed(board, mid)).toBe(false);
  });
});
