/**
 * Mahjong Competition Rules (MCR / Chinese Official) scoring catalogue.
 *
 * Source edition: Mahjong Competition Rules, EMA English edition (the
 * "Green Book"), the 81-element chart.  `number` deliberately follows that
 * chart so a score explanation can be checked against a printed score sheet.
 *
 * This is a catalogue, not a claim that every detector is already enabled.
 * Scoring code must mark a fan as implemented only after it has a fixture for
 * its shape and its relevant Account-Once / Non-Identical interactions.
 */

export type McrFanId =
  | 'big-four-winds' | 'big-three-dragons' | 'all-green' | 'nine-gates'
  | 'four-kongs' | 'seven-shifted-pairs' | 'thirteen-orphans' | 'all-terminals'
  | 'little-four-winds' | 'little-three-dragons' | 'all-honors'
  | 'four-concealed-pungs' | 'pure-terminal-chows' | 'quadruple-chow'
  | 'four-shifted-pungs' | 'four-shifted-chows' | 'three-kongs'
  | 'all-terminals-honors' | 'seven-pairs' | 'greater-honors-knitted'
  | 'all-even-pungs' | 'full-flush' | 'pure-triple-chow' | 'pure-shifted-pungs'
  | 'upper-tiles' | 'middle-tiles' | 'lower-tiles' | 'pure-straight'
  | 'three-suited-terminal-chows' | 'pure-shifted-chows' | 'all-fives'
  | 'triple-pung' | 'three-concealed-pungs' | 'lesser-honors-knitted'
  | 'knitted-straight' | 'upper-four' | 'lower-four' | 'big-three-winds'
  | 'mixed-straight' | 'reversible-tiles' | 'mixed-triple-chow'
  | 'mixed-shifted-pungs' | 'chicken-hand' | 'last-tile-draw'
  | 'last-tile-claim' | 'out-with-replacement' | 'robbing-kong'
  | 'two-concealed-kongs' | 'all-pungs' | 'half-flush' | 'mixed-shifted-chows'
  | 'all-types' | 'melded-hand' | 'two-dragon-pungs' | 'outside-hand'
  | 'fully-concealed-hand' | 'two-melded-kongs' | 'last-tile' | 'dragon-pung'
  | 'prevalent-wind' | 'seat-wind' | 'concealed-hand' | 'all-chows'
  | 'tile-hog' | 'double-pungs' | 'two-concealed-pungs' | 'concealed-kong'
  | 'all-simples' | 'pure-double-chow' | 'mixed-double-chow' | 'short-straight'
  | 'two-terminal-chows' | 'pung-terminals-honors' | 'melded-kong'
  | 'one-voided-suit' | 'no-honors' | 'edge-wait' | 'closed-wait'
  | 'single-wait' | 'self-drawn' | 'flower-tiles';

export interface McrFanDefinition {
  /** Official chart number, from 1 (highest group) through 81. */
  number: number;
  id: McrFanId;
  label: string;
  points: number;
  /**
   * Fans directly implied by this fan and therefore not scored again.
   * More contextual exclusions are resolved by the decomposition selector.
   */
  excludes?: readonly McrFanId[];
  /** Flowers never contribute to MCR's eight-point declaration threshold. */
  bonusOnly?: boolean;
}

const fan = (
  number: number,
  id: McrFanId,
  label: string,
  points: number,
  excludes?: readonly McrFanId[],
  bonusOnly = false
): McrFanDefinition => ({ number, id, label, points, excludes, bonusOnly });

/** The complete official 81-element MCR catalogue, in chart order. */
export const MCR_FANS: readonly McrFanDefinition[] = [
  fan(1, 'big-four-winds', 'Big Four Winds', 88, ['little-four-winds', 'big-three-winds', 'seat-wind', 'prevalent-wind', 'pung-terminals-honors']),
  fan(2, 'big-three-dragons', 'Big Three Dragons', 88, ['little-three-dragons', 'two-dragon-pungs', 'dragon-pung']),
  fan(3, 'all-green', 'All Green', 88),
  fan(4, 'nine-gates', 'Nine Gates', 88, ['full-flush', 'no-honors', 'concealed-hand', 'single-wait']),
  fan(5, 'four-kongs', 'Four Kongs', 88, ['three-kongs', 'two-concealed-kongs', 'two-melded-kongs', 'concealed-kong', 'melded-kong']),
  fan(6, 'seven-shifted-pairs', 'Seven Shifted Pairs', 88, ['seven-pairs', 'full-flush', 'concealed-hand', 'single-wait']),
  fan(7, 'thirteen-orphans', 'Thirteen Orphans', 88),
  fan(8, 'all-terminals', 'All Terminals', 64, ['all-terminals-honors', 'all-pungs', 'pung-terminals-honors']),
  fan(9, 'little-four-winds', 'Little Four Winds', 64, ['big-three-winds', 'seat-wind', 'prevalent-wind', 'pung-terminals-honors']),
  fan(10, 'little-three-dragons', 'Little Three Dragons', 64, ['two-dragon-pungs', 'dragon-pung']),
  fan(11, 'all-honors', 'All Honors', 64, ['all-pungs', 'outside-hand', 'pung-terminals-honors']),
  fan(12, 'four-concealed-pungs', 'Four Concealed Pungs', 64, ['three-concealed-pungs', 'two-concealed-pungs', 'concealed-hand']),
  fan(13, 'pure-terminal-chows', 'Pure Terminal Chows', 64, ['full-flush', 'all-chows', 'pure-straight', 'two-terminal-chows', 'no-honors']),
  fan(14, 'quadruple-chow', 'Quadruple Chow', 48, ['pure-triple-chow', 'pure-double-chow']),
  fan(15, 'four-shifted-pungs', 'Four Shifted Pungs', 48, ['pure-shifted-pungs', 'three-concealed-pungs', 'two-concealed-pungs']),
  fan(16, 'four-shifted-chows', 'Four Shifted Chows', 32, ['pure-shifted-chows', 'short-straight', 'pure-double-chow']),
  fan(17, 'three-kongs', 'Three Kongs', 32, ['two-concealed-kongs', 'two-melded-kongs', 'concealed-kong', 'melded-kong']),
  fan(18, 'all-terminals-honors', 'All Terminals and Honors', 32, ['all-pungs', 'pung-terminals-honors']),
  fan(19, 'seven-pairs', 'Seven Pairs', 24, ['concealed-hand']),
  fan(20, 'greater-honors-knitted', 'Greater Honors and Knitted Tiles', 24),
  fan(21, 'all-even-pungs', 'All Even Pungs', 24, ['all-pungs']),
  fan(22, 'full-flush', 'Full Flush', 24, ['half-flush', 'one-voided-suit', 'no-honors']),
  fan(23, 'pure-triple-chow', 'Pure Triple Chow', 24, ['pure-double-chow']),
  fan(24, 'pure-shifted-pungs', 'Pure Shifted Pungs', 24, ['double-pungs']),
  fan(25, 'upper-tiles', 'Upper Tiles', 24),
  fan(26, 'middle-tiles', 'Middle Tiles', 24),
  fan(27, 'lower-tiles', 'Lower Tiles', 24),
  fan(28, 'pure-straight', 'Pure Straight', 16, ['short-straight']),
  fan(29, 'three-suited-terminal-chows', 'Three-Suited Terminal Chows', 16, ['two-terminal-chows']),
  fan(30, 'pure-shifted-chows', 'Pure Shifted Chows', 16, ['short-straight', 'pure-double-chow']),
  fan(31, 'all-fives', 'All Fives', 16),
  fan(32, 'triple-pung', 'Triple Pung', 16, ['double-pungs']),
  fan(33, 'three-concealed-pungs', 'Three Concealed Pungs', 16, ['two-concealed-pungs']),
  fan(34, 'lesser-honors-knitted', 'Lesser Honors and Knitted Tiles', 12),
  fan(35, 'knitted-straight', 'Knitted Straight', 12),
  fan(36, 'upper-four', 'Upper Four', 12),
  fan(37, 'lower-four', 'Lower Four', 12),
  fan(38, 'big-three-winds', 'Big Three Winds', 12, ['seat-wind', 'prevalent-wind', 'pung-terminals-honors']),
  fan(39, 'mixed-straight', 'Mixed Straight', 8, ['short-straight']),
  fan(40, 'reversible-tiles', 'Reversible Tiles', 8),
  fan(41, 'mixed-triple-chow', 'Mixed Triple Chow', 8, ['mixed-double-chow']),
  fan(42, 'mixed-shifted-pungs', 'Mixed Shifted Pungs', 8, ['double-pungs']),
  fan(43, 'chicken-hand', 'Chicken Hand', 8),
  fan(44, 'last-tile-draw', 'Last Tile Draw', 8, ['last-tile']),
  fan(45, 'last-tile-claim', 'Last Tile Claim', 8, ['last-tile']),
  fan(46, 'out-with-replacement', 'Out With Replacement Tile', 8),
  fan(47, 'robbing-kong', 'Robbing the Kong', 8),
  fan(48, 'two-concealed-kongs', 'Two Concealed Kongs', 8, ['concealed-kong']),
  fan(49, 'all-pungs', 'All Pungs', 6),
  fan(50, 'half-flush', 'Half Flush', 6, ['one-voided-suit']),
  fan(51, 'mixed-shifted-chows', 'Mixed Shifted Chows', 6, ['mixed-double-chow', 'short-straight']),
  fan(52, 'all-types', 'All Types', 6),
  fan(53, 'melded-hand', 'Melded Hand', 6),
  fan(54, 'two-dragon-pungs', 'Two Dragon Pungs', 6, ['dragon-pung']),
  fan(55, 'outside-hand', 'Outside Hand', 4),
  fan(56, 'fully-concealed-hand', 'Fully Concealed Hand', 4, ['concealed-hand', 'self-drawn']),
  fan(57, 'two-melded-kongs', 'Two Melded Kongs', 4, ['melded-kong']),
  fan(58, 'last-tile', 'Last Tile', 4),
  fan(59, 'dragon-pung', 'Dragon Pung', 2),
  fan(60, 'prevalent-wind', 'Prevalent Wind Pung', 2),
  fan(61, 'seat-wind', 'Seat Wind Pung', 2),
  fan(62, 'concealed-hand', 'Concealed Hand', 2),
  fan(63, 'all-chows', 'All Chows', 2),
  fan(64, 'tile-hog', 'Tile Hog', 2),
  fan(65, 'double-pungs', 'Double Pungs', 2),
  fan(66, 'two-concealed-pungs', 'Two Concealed Pungs', 2),
  fan(67, 'concealed-kong', 'Concealed Kong', 2),
  fan(68, 'all-simples', 'All Simples', 2),
  fan(69, 'pure-double-chow', 'Pure Double Chow', 1),
  fan(70, 'mixed-double-chow', 'Mixed Double Chow', 1),
  fan(71, 'short-straight', 'Short Straight', 1),
  fan(72, 'two-terminal-chows', 'Two Terminal Chows', 1),
  fan(73, 'pung-terminals-honors', 'Pung of Terminals or Honors', 1),
  fan(74, 'melded-kong', 'Melded Kong', 1),
  fan(75, 'one-voided-suit', 'One Voided Suit', 1),
  fan(76, 'no-honors', 'No Honors', 1),
  fan(77, 'edge-wait', 'Edge Wait', 1),
  fan(78, 'closed-wait', 'Closed Wait', 1),
  fan(79, 'single-wait', 'Single Wait', 1),
  fan(80, 'self-drawn', 'Self-Drawn', 1),
  fan(81, 'flower-tiles', 'Flower Tiles', 1, undefined, true)
];

export const MCR_FAN_BY_ID: Readonly<Record<McrFanId, McrFanDefinition>> = Object.freeze(
  Object.fromEntries(MCR_FANS.map((entry) => [entry.id, entry])) as Record<McrFanId, McrFanDefinition>
);

/**
 * Applies direct Account-Once exclusions after the caller has selected the
 * highest-value compatible decomposition. It deliberately does not decide
 * competing decompositions; that is handled by the MCR selector.
 */
export function applyDirectMcrExclusions<T extends { id: McrFanId; points: number }>(fans: readonly T[]): T[] {
  const present = new Set(fans.map((entry) => entry.id));
  const excluded = new Set<McrFanId>();
  for (const id of present) {
    for (const lower of MCR_FAN_BY_ID[id].excludes ?? []) excluded.add(lower);
  }
  return fans.filter((entry) => !excluded.has(entry.id));
}

/** A development guard: the source chart must remain exactly complete. */
export function hasCompleteMcrCatalogue(): boolean {
  return MCR_FANS.length === 81 && MCR_FANS.every((fan, index) => fan.number === index + 1);
}
