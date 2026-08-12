import { tileRank, tileSuit, type Tile } from './tiles';
import type { GameState, Seat } from './engine';

export interface RiichiPayment {
  winnerGain: number;
  payments: Partial<Record<Seat, number>>;
  label: string;
}

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

export function riichiBasePoints(han: number, fu: number): number {
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
}): RiichiPayment {
  const { han, fu, winner, dealer, selfDrawn, honba = 0 } = input;
  const base = riichiBasePoints(han, fu);
  const payments: Partial<Record<Seat, number>> = {};
  const seats: Seat[] = [0, 1, 2, 3];

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
