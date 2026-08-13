import type { Seat } from './engine';

/** Mahjong Hub Hong Kong product settlement: display fan is capped at ten. */
export const HONG_KONG_FAN_CAP = 10;

export interface HongKongPayment {
  base: number;
  winnerGain: number;
  payments: Partial<Record<Seat, number>>;
  label: string;
}

/**
 * Product v1.0 settlement. It keeps the familiar Hong Kong asymmetry simple:
 * a self-draw is paid by all three opponents (2 x base each); a discard win
 * is paid by the discarder alone (4 x base). Scores are site points only.
 */
export function calculateHongKongPayment(input: {
  fan: number;
  selfDrawn: boolean;
  winner: Seat;
  loser?: Seat;
  /**
   * Product pao / 包牌: the player who supplied the decisive exposed meld
   * carries the full settlement. This is recorded by the engine at the call,
   * rather than inferred after a hand has been rearranged for scoring.
   */
  liabilitySeat?: Seat;
}): HongKongPayment {
  const fan = Math.max(0, Math.min(HONG_KONG_FAN_CAP, input.fan));
  const base = 2 ** fan;
  const payments: Partial<Record<Seat, number>> = {};
  if (input.liabilitySeat !== undefined && input.liabilitySeat !== input.winner) {
    const total = input.selfDrawn ? base * 6 : base * 4;
    payments[input.liabilitySeat] = total;
    return {
      base,
      winnerGain: total,
      payments,
      label: `包牌：seat ${input.liabilitySeat} pays ${total} (${input.selfDrawn ? 'self-draw' : 'discard win'})`
    };
  }
  if (input.selfDrawn) {
    for (const seat of [0, 1, 2, 3] as Seat[]) {
      if (seat !== input.winner) payments[seat] = base * 2;
    }
    return { base, winnerGain: base * 6, payments, label: `${base * 2} from each opponent` };
  }
  if (input.loser !== undefined) payments[input.loser] = base * 4;
  return { base, winnerGain: base * 4, payments, label: `${base * 4} from discarder` };
}
