import type { Tile } from '../tiles';
import { scoreHand } from '../scoring';
import { calculateRiichiPayment } from '../riichi';
import { calculateHongKongPayment } from '../hongkong';
import { calculateMcrPayment } from '../chinese-official';
import { evaluateSelfDraw } from './draw';
import { clone } from './helpers';
import { SEATS, type GameState, type Seat } from './state';

/** Declare a self-drawn win for the seat currently holding 14 tiles. */
export function declareTsumo(state: GameState, seat: Seat): GameState {
  if (!evaluateSelfDraw(state, seat).legal) return state;
  const player = state.players[seat];
  const winningTile = player.hand[player.hand.length - 1];
  return finishWithWin(clone(state), seat, winningTile, true);
}

/**
 * Riichi double ron: every seat that declared ron wins the same discard and the
 * discarder pays each of them in full. The winner nearest the discarder in turn
 * order — the head-bump seat — additionally collects the unclaimed Riichi
 * deposits and the honba bonus, which are only ever paid once.
 */
export function finishWithDoubleRon(
  state: GameState,
  ronSeats: Seat[],
  discardInfo: { tile: Tile; from: Seat }
): GameState {
  const ordered = [...ronSeats].sort(
    (a, b) => ((a - discardInfo.from + 4) % 4) - ((b - discardInfo.from + 4) % 4)
  );
  const winners = ordered.map((seat, index) => {
    const score = scoreHand({
      state,
      seat,
      winningTile: discardInfo.tile,
      selfDrawn: false
    });
    const liability = state.riichiLiabilities.find((entry) =>
      entry.winner === seat && score.patterns.some((pattern) => pattern.id === entry.yakuman)
    );
    const payment = calculateRiichiPayment({
      han: score.han ?? score.total,
      fu: score.fu ?? 30,
      winner: seat,
      dealer: state.dealer,
      selfDrawn: false,
      honba: index === 0 ? state.honba : 0,
      yakumanCount: score.yakumanCount,
      loser: discardInfo.from,
      liability: liability ? { seat: liability.seat, yakumanCount: 1 } : undefined
    });
    score.points = payment.winnerGain;
    score.paymentLabel = payment.label;
    // Pao spreads the settlement across seats; without it the discarder alone
    // pays, exactly as in a single ron.
    if (Object.keys(payment.payments).length > 0) {
      for (const payer of SEATS) {
        if (payer === seat) continue;
        state.players[payer].score -= payment.payments[payer] ?? 0;
      }
    } else {
      state.players[discardInfo.from].score -= payment.winnerGain;
    }
    state.players[seat].score += payment.winnerGain;
    return { seat, loser: discardInfo.from, score };
  });
  if (state.riichiSticks > 0) {
    state.players[ordered[0]].score += state.riichiSticks * 1000;
    state.riichiSticks = 0;
  }
  state.honba = ordered.includes(state.dealer) ? state.honba + 1 : 0;
  state.claims = {};
  state.submitted = {};
  state.phase = 'over';
  state.result = { kind: 'win', winners };
  state.log.push(
    `Seat ${discardInfo.from} deals in to seats ${ordered.join(' & ')} for a double ron.`
  );
  return state;
}

export function finishWithWin(
  state: GameState,
  seat: Seat,
  winningTile: Tile,
  selfDrawn: boolean,
  loser?: Seat
): GameState {
  const score = scoreHand({ state, seat, winningTile, selfDrawn });
  state.phase = 'over';
  state.result = { kind: 'win', winner: seat, loser, score };
  if (state.ruleset === 'riichi') {
    const liability = state.riichiLiabilities.find((entry) =>
      entry.winner === seat && score.patterns.some((pattern) => pattern.id === entry.yakuman)
    );
    const payment = calculateRiichiPayment({
      han: score.han ?? score.total,
      fu: score.fu ?? 30,
      winner: seat,
      dealer: state.dealer,
      selfDrawn,
      honba: state.honba,
      yakumanCount: score.yakumanCount,
      loser,
      liability: liability ? { seat: liability.seat, yakumanCount: 1 } : undefined
    });
    score.points = payment.winnerGain;
    score.paymentLabel = payment.label;
    if (Object.keys(payment.payments).length > 0) {
      for (const payer of SEATS) {
        if (payer === seat) continue;
        state.players[payer].score -= payment.payments[payer] ?? 0;
      }
    } else if (loser !== undefined) {
      state.players[loser].score -= payment.winnerGain;
    }
    state.players[seat].score += payment.winnerGain;
    if (state.riichiSticks > 0) {
      state.players[seat].score += state.riichiSticks * 1000;
      state.riichiSticks = 0;
    }
    state.honba = seat === state.dealer ? state.honba + 1 : 0;
    state.log.push('Riichi settlement: ' + payment.label + '.');
    return state;
  }
  if (state.ruleset === 'hongkong') {
    const payment = calculateHongKongPayment({
      fan: score.total,
      selfDrawn,
      winner: seat,
      loser,
      liabilitySeat: state.hongKongLiability?.winner === seat ? state.hongKongLiability.seat : undefined
    });
    score.points = payment.winnerGain;
    score.paymentLabel = payment.label;
    for (const payer of SEATS) {
      const amount = payment.payments[payer] ?? 0;
      if (amount > 0) state.players[payer].score -= amount;
    }
    state.players[seat].score += payment.winnerGain;
    state.honba = seat === state.dealer ? state.honba + 1 : 0;
    state.log.push('Hong Kong settlement: ' + payment.label + '.');
    return state;
  }
  const payment = calculateMcrPayment({
    points: score.total,
    selfDrawn,
    winner: seat,
    loser
  });
  score.points = payment.winnerGain;
  score.paymentLabel = payment.label;
  for (const payer of SEATS) {
    if (payer === seat) continue;
    state.players[payer].score -= payment.payments[payer] ?? 0;
  }
  state.players[seat].score += payment.winnerGain;
  state.honba = seat === state.dealer ? state.honba + 1 : 0;
  state.log.push(
    `Seat ${seat} wins ${selfDrawn ? 'by self-draw' : 'on a discard'} for ${score.total}; ${payment.label}.`
  );
  return state;
}
