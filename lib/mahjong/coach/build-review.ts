import type { GameState, Seat } from '../engine';
import { seatShanten, seatWaits } from '../engine/draw';
import { HONG_KONG_FAN_CAP, calculateHongKongPayment } from '../hongkong';
import { calculateRiichiPayment } from '../riichi';
import { calculateMcrPayment } from '../chinese-official';
import type { ScoreResult } from '../scoring/types';
import { resolveCoachCapability } from './contract';
import type { CoachReview } from './review';
import { evidenceForPattern } from './evidence';

/**
 * Build a settlement CoachReview from game state.
 * Pure: no React. Evidence helpers live in features/ for i18n coupling later;
 * the function stays callable from tests without a DOM.
 */
export function buildCoachReview(
  state: GameState,
  humanSeat: Seat = 0,
  opts: { discloseReveal?: boolean } = {}
): CoachReview {
  const capability = resolveCoachCapability(state.ruleset);
  const result = state.result;
  if (!result) {
    return { capability, outcome: 'draw', discloseReveal: opts.discloseReveal };
  }

  if (result.kind === 'draw') {
    return {
      capability,
      outcome: 'draw',
      missInfo: buildMissInfo(state, humanSeat),
      discloseReveal: opts.discloseReveal
    };
  }

  const humanWon =
    result.winner === humanSeat ||
    Boolean(result.winners?.some((row) => row.seat === humanSeat));

  if (!humanWon) {
    const winnerScore =
      result.winners?.find((row) => row.seat === result.winner)?.score ??
      result.score;
    const review: CoachReview = {
      capability,
      outcome: 'opponentWon',
      missInfo: buildMissInfo(state, humanSeat, result.loser === humanSeat ? 'dealt_in' : undefined),
      discloseReveal: opts.discloseReveal
    };
    if (winnerScore) {
      review.fans = winnerScore.patterns.map((p) => ({
        id: p.id,
        value: p.value,
        evidence: { kind: 'fallback', fanId: p.id }
      }));
      review.formula = { items: [{ labelKey: 'winnerTotal', value: winnerScore.total }], total: winnerScore.total };
    }
    return review;
  }

  const score =
    result.winners?.find((row) => row.seat === humanSeat)?.score ?? result.score;
  if (!score) {
    return {
      capability,
      outcome: 'iWon',
      discloseReveal: opts.discloseReveal
    };
  }

  const selfDrawn = result.loser === undefined && !result.winners;
  const winningTile =
    selfDrawn
      ? state.players[humanSeat].hand[state.players[humanSeat].hand.length - 1]
      : state.lastDiscard?.tile;

  return {
    capability,
    outcome: 'iWon',
    shape: score.handShape
      ? {
          kind: score.handShape,
          sets: score.decomposition,
          winningTile
        }
      : undefined,
    gate: score.gate,
    fans: score.patterns.map((pattern) => ({
      id: pattern.id,
      value: pattern.value,
      evidence: evidenceForPattern(pattern.id, {
        state,
        seat: humanSeat,
        score,
        winningTile,
        selfDrawn
      })
    })),
    formula: buildFormula(state, score, humanSeat, selfDrawn),
    discloseReveal: opts.discloseReveal
  };
}

function buildMissInfo(
  state: GameState,
  seat: Seat,
  note?: string
): CoachReview['missInfo'] {
  return {
    shanten: seatShanten(state, seat),
    waits: seatWaits(state, seat),
    note
  };
}

function buildFormula(
  state: GameState,
  score: ScoreResult,
  winner: Seat,
  selfDrawn: boolean
): CoachReview['formula'] {
  if (state.ruleset === 'hongkong') {
    const rawFan = score.total;
    const payment = calculateHongKongPayment({
      fan: rawFan,
      selfDrawn,
      winner,
      loser: state.result?.loser
    });
    const items: { labelKey: string; value: number }[] = [
      { labelKey: 'fan', value: rawFan }
    ];
    if (score.capped) {
      items.push({ labelKey: 'cappedFan', value: score.capped.to });
    } else {
      items.push({ labelKey: 'cappedFan', value: Math.min(rawFan, HONG_KONG_FAN_CAP) });
    }
    items.push({ labelKey: 'base', value: payment.base });
    if (selfDrawn) {
      items.push({ labelKey: 'selfDrawEach', value: payment.base * 2 });
    } else {
      items.push({ labelKey: 'discardPay', value: payment.base * 4 });
    }
    return {
      items,
      total: payment.winnerGain,
      note: selfDrawn ? 'selfDraw' : 'ron'
    };
  }

  if (state.ruleset === 'riichi') {
    const han = score.han ?? score.total;
    const fu = score.fu ?? 20;
    const payment = calculateRiichiPayment({
      han,
      fu,
      winner,
      dealer: state.dealer,
      selfDrawn,
      yakumanCount: score.yakumanCount ?? 0
    });
    return {
      items: [
        { labelKey: 'han', value: han },
        { labelKey: 'fu', value: fu },
        { labelKey: 'points', value: payment.winnerGain }
      ],
      total: payment.winnerGain,
      note: selfDrawn ? 'selfDraw' : 'ron'
    };
  }

  if (state.ruleset === 'chinese-official') {
    const payment = calculateMcrPayment({
      points: score.total,
      selfDrawn,
      winner,
      loser: state.result?.loser
    });
    return {
      items: [
        { labelKey: 'fan', value: score.total },
        { labelKey: 'qualifying', value: score.qualifyingTotal ?? score.total },
        { labelKey: 'points', value: payment.winnerGain }
      ],
      total: payment.winnerGain,
      note: selfDrawn ? 'selfDraw' : 'ron'
    };
  }

  return { items: [{ labelKey: 'fan', value: score.total }], total: score.total };
}
