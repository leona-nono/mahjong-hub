import type { Seat } from './engine';

/**
 * Chinese Official (MCR) settlement.
 *
 * Every loser owes a fixed base on top of the hand's points. The winner's
 * Fan total `F` is paid once — by all three opponents on a self-draw, or by
 * the discarder alone on a discard win, where the other two still owe the
 * base. Flower / Season points are ordinary settlement points and are part of
 * `F`; they are only excluded from the eight-point declaration threshold,
 * which the engine checks before this function is ever reached.
 */
export const MCR_BASE_POINTS = 8;

export interface McrPayment {
  winnerGain: number;
  payments: Partial<Record<Seat, number>>;
  label: string;
}

export function calculateMcrPayment(input: {
  /** The hand's full Fan total, Flowers included. */
  points: number;
  selfDrawn: boolean;
  winner: Seat;
  /** Seat that discarded the winning tile; omitted on a self-draw. */
  loser?: Seat;
}): McrPayment {
  const { points, selfDrawn, winner, loser } = input;
  const payments: Partial<Record<Seat, number>> = {};
  const seats: Seat[] = [0, 1, 2, 3];
  let winnerGain = 0;

  if (selfDrawn) {
    const each = MCR_BASE_POINTS + points;
    for (const seat of seats) {
      if (seat === winner) continue;
      payments[seat] = each;
      winnerGain += each;
    }
    return { winnerGain, payments, label: `${each} from each opponent (8 + ${points})` };
  }

  for (const seat of seats) {
    if (seat === winner) continue;
    const amount = seat === loser ? MCR_BASE_POINTS + points : MCR_BASE_POINTS;
    payments[seat] = amount;
    winnerGain += amount;
  }
  return {
    winnerGain,
    payments,
    label: loser === undefined
      ? `${winnerGain} total`
      : `${MCR_BASE_POINTS + points} from discarder, 8 from each other seat`
  };
}
