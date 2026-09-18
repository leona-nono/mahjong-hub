import type { GameState, Seat } from '../engine';
import {
  isDragon,
  isSimple,
  isTerminalOrHonour,
  tileSuit,
  type Tile
} from '../tiles';
import type { ScoreResult } from '../scoring/types';
import { isGreenTile, isReversibleTile } from '../scoring/shapes';
import type { Evidence } from './review';

export interface EvidenceContext {
  state: GameState;
  seat: Seat;
  score: ScoreResult;
  winningTile?: Tile;
  selfDrawn: boolean;
}

/**
 * Map a scored pattern id to structured Evidence for settlement teaching.
 * Unknown / rare fans fall back to name-only rendering.
 */
export function evidenceForPattern(fanId: string, ctx: EvidenceContext): Evidence {
  const player = ctx.state.players[ctx.seat];
  const concealed = ctx.selfDrawn ? [...player.hand] : [...player.hand, ...(ctx.winningTile ? [ctx.winningTile] : [])];
  const allTiles = [...concealed, ...player.melds.flatMap((m) => m.tiles)];
  const sets = ctx.score.decomposition ?? [];

  switch (fanId) {
    case 'allSimples':
      return { kind: 'allTiles', predicate: 'simple', hits: allTiles.filter(isSimple) };
    case 'allTerminals':
      return {
        kind: 'allTiles',
        predicate: 'terminal',
        hits: allTiles.filter((t) => tileSuit(t) !== 'z' && isTerminalOrHonour(t))
      };
    case 'allHonours':
    case 'honroutou':
    case 'allTerminalsHonours':
      return { kind: 'allTiles', predicate: 'honour', hits: allTiles.filter(isTerminalOrHonour) };
    case 'allGreen':
      return { kind: 'allTiles', predicate: 'green', hits: allTiles.filter(isGreenTile) };
    case 'reversibleTiles':
      return { kind: 'allTiles', predicate: 'reversible', hits: allTiles.filter(isReversibleTile) };
    case 'fullFlush':
    case 'halfFlush':
      return { kind: 'allTiles', predicate: 'oneSuit', hits: allTiles };
    case 'allTriplets':
    case 'allPungs':
      return { kind: 'setComposition', all: 'triplet', sets: sets.filter((s) => s.kind === 'triplet') };
    case 'allSequences':
    case 'pinfu':
      return { kind: 'setComposition', all: 'run', sets: sets.filter((s) => s.kind === 'run') };
    case 'seatWind':
    case 'roundWind':
    case 'whiteDragon':
    case 'greenDragon':
    case 'redDragon':
    case 'dragonPung':
      return {
        kind: 'specificSets',
        what: isDragon(sets.find((s) => s.kind === 'triplet')?.tile ?? 'z5') ? 'dragon' : 'wind',
        count: 1,
        sets: sets.filter((s) => s.kind === 'triplet')
      };
    case 'selfDraw':
    case 'fullyConcealed':
      return { kind: 'winCondition', condition: 'selfDraw' };
    case 'replacementWin':
    case 'rinshanKaihou':
    case 'outWithReplacement':
      return { kind: 'winCondition', condition: 'rinshan' };
    case 'robbingKong':
      return { kind: 'winCondition', condition: 'robKong' };
    case 'lastTileWin':
    case 'haiteiRaoyue':
    case 'houteiRaoyui':
    case 'lastTileDraw':
    case 'lastTileClaim':
      return { kind: 'winCondition', condition: 'haitei' };
    case 'lastTile':
      return { kind: 'winCondition', condition: 'lastTile' };
    case 'riichi':
      return { kind: 'declaration', what: 'riichi' };
    case 'doubleRiichi':
      return { kind: 'declaration', what: 'doubleRiichi' };
    case 'ippatsu':
      return { kind: 'declaration', what: 'ippatsu' };
    case 'concealed':
      return { kind: 'declaration', what: 'concealed' };
    case 'sevenPairs':
      return { kind: 'specialShape', shape: 'sevenPairs', tiles: allTiles };
    case 'thirteenOrphans':
      return { kind: 'specialShape', shape: 'thirteenOrphans', tiles: allTiles };
    case 'nineGates':
      return { kind: 'specialShape', shape: 'nineGates', tiles: allTiles };
    case 'ittsuu':
      return { kind: 'sequencePattern', pattern: 'ittsuu', sets: sets.filter((s) => s.kind === 'run') };
    case 'sanshokuDoujun':
      return { kind: 'sequencePattern', pattern: 'sanshoku', sets: sets.filter((s) => s.kind === 'run') };
    case 'iipeikou':
    case 'ryanpeikou':
      return { kind: 'sequencePattern', pattern: 'iipeikou', sets: sets.filter((s) => s.kind === 'run') };
    case 'flower':
      return { kind: 'flowerCount', tiles: [...player.flowers] };
    case 'chickenHand':
      return {
        kind: 'gate',
        required: 1,
        actual: 1,
        passed: true,
        reason: 'chickenHand'
      };
    default:
      return { kind: 'fallback', fanId };
  }
}
