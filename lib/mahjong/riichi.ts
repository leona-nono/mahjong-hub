import { tileRank, tileSuit, type Tile } from './tiles';
import type { GameState, Seat } from './engine';

export interface RiichiPayment {
  winnerGain: number;
  payments: Partial<Record<Seat, number>>;
  label: string;
}

export type RiichiLiabilityYakuman = 'bigThreeDragons' | 'bigFourWinds' | 'fourKans';

export function nextDora(indicator: Tile): Tile {
  const suit = tileSuit(indicator);
  const rank = tileRank(indicator);
  if (suit !== 'z') return (suit + (rank === 9 ? 1 : rank + 1)) as Tile;
  if (rank <= 4) return ('z' + (rank === 4 ? 1 : rank + 1)) as Tile;
  return ('z' + (rank === 7 ? 5 : rank + 1)) as Tile;
}

export function visibleDoraIndicators(state: GameState): Tile[] {
  const kanCount = state.players.reduce(
    (total, player) => total + player.melds.filter((meld) => meld.kind === 'kan').length,
    0
  );
  const count = Math.min(1 + kanCount, 5);
  return Array.from({ length: count }, (_, index) => state.wall[state.wall.length - 5 - index * 2]);
}

export function uraDoraIndicators(state: GameState): Tile[] {
  return visibleDoraIndicators(state).map((_, index) => state.wall[state.wall.length - 6 - index * 2]);
}

export function countDora(tiles: Tile[], indicators: Tile[]): number {
  const dora = indicators.map(nextDora);
  return tiles.reduce((total, tile) => total + dora.filter((value) => value === tile).length, 0);
}

function ceil100(value: number): number {
  return Math.ceil(value / 100) * 100;
}

export function riichiBasePoints(han: number, fu: number, yakumanCount = 0): number {
  if (yakumanCount > 0) return 8000 * yakumanCount;
  if (han >= 13) return 8000;
  if (han >= 11) return 6000;
  if (han >= 8) return 4000;
  if (han >= 6) return 3000;
  if (han >= 5 || (han === 4 && fu >= 40) || (han === 3 && fu >= 70)) return 2000;
  return Math.min(fu * 2 ** (han + 2), 2000);
}

export function calculateRiichiPayment(input: {
  han: number;
  fu: number;
  winner: Seat;
  dealer: Seat;
  selfDrawn: boolean;
  honba?: number;
  /** Genuine yakuman stack in WRC; counted yakuman stays one yakuman. */
  yakumanCount?: number;
  /** WRC pao applies only to the yakuman the liable player enabled. */
  liability?: { seat: Seat; yakumanCount: number };
  /** Seat that discarded the winning tile on ron. */
  loser?: Seat;
}): RiichiPayment {
  const { han, fu, winner, dealer, selfDrawn, honba = 0, yakumanCount = 0, liability, loser } = input;
  const base = riichiBasePoints(han, fu, yakumanCount);
  const payments: Partial<Record<Seat, number>> = {};
  const seats: Seat[] = [0, 1, 2, 3];

  if (liability && liability.yakumanCount > 0) {
    const liableBase = 8000 * liability.yakumanCount;
    const otherBase = Math.max(0, base - liableBase);
    const fullMultiplier = winner === dealer ? 6 : 4;
    const totalYakuman = liableBase * fullMultiplier;
    if (selfDrawn) {
      // The liable player pays the entire liable yakuman; the remaining hand
      // (if any stacked yakuman) is split under normal tsumo rules.
      let winnerGain = totalYakuman;
      payments[liability.seat] = totalYakuman;
      if (otherBase > 0) {
        for (const seat of seats) {
          if (seat === winner) continue;
          const share = ceil100(otherBase * (winner === dealer || seat === dealer ? 2 : 1)) + honba * 100;
          payments[seat] = (payments[seat] ?? 0) + share;
          winnerGain += share;
        }
      } else {
        // Honba belongs to the liability payment in the single-yakuman case.
        payments[liability.seat] = (payments[liability.seat] ?? 0) + honba * 300;
        winnerGain += honba * 300;
      }
      return { winnerGain, payments, label: `Pao ${payments[liability.seat]} · ${totalYakuman} yakuman liability` };
    }
    // On ron, liability and discarder split the corresponding yakuman.
    // If the liable player also discarded the winning tile, they pay it all.
    const liableShare = Math.ceil(totalYakuman / 2 / 100) * 100;
    const discarderShare = totalYakuman - liableShare + honba * 300;
    if (liability.seat === loser) {
      const fullPayment = totalYakuman + honba * 300 + otherBase * fullMultiplier;
      payments[liability.seat] = fullPayment;
      return { winnerGain: fullPayment, payments, label: `Pao ron ${fullPayment}` };
    }
    payments[liability.seat] = liableShare;
    if (loser !== undefined) payments[loser] = discarderShare + otherBase * fullMultiplier;
    const winnerGain = (payments[liability.seat] ?? 0) + (loser === undefined ? 0 : payments[loser] ?? 0);
    return { winnerGain, payments, label: `Pao split ${payments[liability.seat]} / ${loser === undefined ? 0 : payments[loser]}` };
  }

  if (!selfDrawn) {
    const ron = ceil100(base * (winner === dealer ? 6 : 4)) + honba * 300;
    return { winnerGain: ron, payments, label: String(ron) + ' Ron' };
  }

  let winnerGain = 0;
  for (const seat of seats) {
    if (seat === winner) continue;
    const multiplier = winner === dealer || seat === dealer ? 2 : 1;
    const payment = ceil100(base * multiplier) + honba * 100;
    payments[seat] = payment;
    winnerGain += payment;
  }
  const label = winner === dealer
    ? String(payments[seats.find((seat) => seat !== winner)!]) + ' all'
    : String(payments[dealer]) + ' / ' + String(payments[seats.find((seat) => seat !== winner && seat !== dealer)!]);
  return { winnerGain, payments, label };
}

export function roundFu(value: number): number {
  if (value === 25) return 25;
  return Math.max(20, Math.ceil(value / 10) * 10);
}
