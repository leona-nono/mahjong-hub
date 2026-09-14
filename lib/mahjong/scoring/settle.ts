/** Payment settlement lives in the ruleset modules — re-export only. */
export {
  HONG_KONG_FAN_CAP,
  calculateHongKongPayment,
  type HongKongPayment
} from '../hongkong';
export {
  calculateRiichiPayment,
  riichiBasePoints,
  roundFu,
  countDora,
  nextDora,
  visibleDoraIndicators,
  uraDoraIndicators,
  type RiichiPayment,
  type RiichiLiabilityYakuman
} from '../riichi';
export {
  MCR_BASE_POINTS,
  calculateMcrPayment,
  type McrPayment
} from '../chinese-official';
