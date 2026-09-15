/**
 * Present English engine score labels in the active UI locale.
 * Settlement strings stay in the engine; this file only formats them for display.
 */

export type ScoreCopy = ((
  key: string,
  values?: Record<string, string | number>
) => string) & {
  has?: (key: string) => boolean;
};

export interface DisplayPattern {
  id: string;
  label: string;
  value: number;
}

/** English labels whose pattern id is shared across rulesets with different names. */
const FAN_BY_LABEL: Record<string, string> = {
  'Double Riichi': 'doubleRiichi',
  Riichi: 'riichi',
  Ippatsu: 'ippatsu',
  'Thirteen Orphans': 'thirteenOrphans',
  'Seven Pairs': 'sevenPairs',
  'All Honours': 'allHonours',
  'Full Flush': 'fullFlush',
  'Half Flush': 'halfFlush',
  'All Terminals and Honours': 'allTerminalsHonours',
  'All Terminals': 'allTerminals',
  'All Simples': 'allSimples',
  'One Voided Suit': 'oneVoidedSuit',
  'No Honors': 'noHonours',
  'All Types': 'allTypes',
  'Upper Tiles': 'upperTiles',
  'Upper Four': 'upperFour',
  'Middle Tiles': 'middleTiles',
  'Lower Tiles': 'lowerTiles',
  'Lower Four': 'lowerFour',
  'Reversible Tiles': 'reversibleTiles',
  'All Green': 'allGreen',
  'Nine Gates': 'nineGates',
  'Seven Shifted Pairs': 'sevenShiftedPairs',
  'Tile Hog': 'tileHog',
  'Big Three Dragons': 'bigThreeDragons',
  'Big Four Winds': 'bigFourWinds',
  'Little Four Winds': 'smallFourWinds',
  'Big Three Winds': 'bigThreeWinds',
  'Little Three Dragons': 'littleThreeDragons',
  'Two Dragon Pungs': 'twoDragonPungs',
  'Dragon Triplet': 'dragonTriplet',
  'Seat Wind Triplet': 'seatWind',
  'Round Wind Triplet': 'roundWind',
  'Four Concealed Triplets': 'fourConcealedTriplets',
  'All Triplets': 'allTriplets',
  'All Pungs': 'allPungs',
  Pinfu: 'pinfu',
  'Two Identical Sequences': 'ryanpeikou',
  'One Identical Sequence': 'iipeikou',
  'Mixed Triple Sequence': 'sanshokuDoujun',
  'Triple Triplets': 'sanshokuDoukou',
  'Three Concealed Triplets': 'sanankou',
  'Four Kans': 'fourKans',
  'Three Kans': 'sankantsu',
  'All Sequences': 'allSequences',
  'All Chows': 'allChows',
  'Fully Concealed Hand': 'fullyConcealed',
  'Concealed Hand': 'concealedHand',
  'Fully Concealed': 'fullyConcealedShort',
  'Self Draw': 'selfDraw',
  'Self-Drawn': 'selfDraw',
  'Win on Kong Replacement': 'replacementWin',
  'Rinshan Kaihou': 'rinshanKaihou',
  'Haitei Raoyue': 'haiteiRaoyue',
  'Houtei Raoyui': 'houteiRaoyui',
  'Robbing the Kong': 'robbingKong',
  'Out With Replacement Tile': 'outWithReplacement',
  'Last Tile': 'lastTile',
  'Four Kongs': 'fourKongs',
  'Three Kongs': 'threeKongs',
  'Two Concealed Kongs': 'twoConcealedKongs',
  'Concealed Kong': 'concealedKong',
  'Two Melded Kongs': 'twoMeldedKongs',
  'Melded Kong': 'meldedKong',
  'Melded Hand': 'meldedHand',
  'Chicken Hand (Casual)': 'chickenHand',
  'Chicken Hand': 'mcrChickenHand',
  Renhou: 'renhou',
  Dora: 'dora',
  'Red Five': 'akaDora',
  'Ura Dora': 'uraDora',
  'Single Wait': 'singleWait',
  'Closed Wait': 'closedWait',
  'Edge Wait': 'edgeWait',
  'Pure Terminal Chows': 'pureTerminalChows',
  'Three-Suited Terminal Chows': 'threeSuitedTerminalChows',
  'Two Terminal Chows': 'twoTerminalChows',
  'Quadruple Chow': 'quadrupleChow',
  'Four Shifted Pungs': 'fourShiftedPungs',
  'Pure Shifted Pungs': 'pureShiftedPungs',
  'Four Shifted Chows': 'fourShiftedChows',
  'Pure Shifted Chows': 'pureShiftedChows',
  'All Even Pungs': 'allEvenPungs',
  'All Fives': 'allFives',
  'Pure Triple Chow': 'pureTripleChow',
  'Pure Double Chow': 'pureDoubleChow',
  'Pure Straight': 'pureStraight',
  'Mixed Straight': 'mixedStraight',
  'Mixed Triple Chow': 'mixedTripleChow',
  'Mixed Shifted Chows': 'mixedShiftedChows',
  'Mixed Double Chow': 'mixedDoubleChow',
  'Short Straight': 'shortStraight',
  'Triple Pung': 'triplePung',
  'Mixed Shifted Pungs': 'mixedShiftedPungs',
  'Double Pungs': 'doublePungs',
  'Pung of Terminals or Honors': 'pungTerminalsHonours',
  'Outside Hand': 'outsideHand',
  'Three Concealed Pungs': 'threeConcealedPungs',
  'Two Concealed Pungs': 'twoConcealedPungs',
  'Pure Outside Hand': 'junchan',
  'Mixed Outside Hand': 'chanta',
  'Heavenly Hand': 'heavenlyHand',
  'Earthly Hand': 'earthlyHand'
};

/** Ids that share one code across two English names — never translate from id alone. */
const AMBIGUOUS_IDS = new Set(['allSequences', 'concealed', 'allTriplets', 'lastTileWin']);

function hasKey(t: ScoreCopy, key: string): boolean {
  return t.has ? t.has(key) : true;
}

export function patternDisplayName(pattern: DisplayPattern, t: ScoreCopy): string {
  if (pattern.id === 'flower' || pattern.label.startsWith('Flower / Season')) {
    const code = pattern.label.match(/\(([^)]+)\)/)?.[1] ?? '';
    const tileKey = `fanTile.${code}`;
    const tile = code && hasKey(t, tileKey) ? t(tileKey) : code;
    return t('fan.flower', { tile });
  }
  // Hong Kong reuses the MCR English last-tile labels for a different fan.
  if (pattern.id === 'lastTileWin') {
    const key = pattern.label === 'Last Tile Claim' ? 'fan.lastTileClaimHk' : 'fan.lastTileDrawHk';
    return hasKey(t, key) ? t(key) : pattern.label;
  }
  const fromLabel = FAN_BY_LABEL[pattern.label];
  if (fromLabel && hasKey(t, `fan.${fromLabel}`)) return t(`fan.${fromLabel}`);
  if (!AMBIGUOUS_IDS.has(pattern.id) && hasKey(t, `fan.${pattern.id}`)) return t(`fan.${pattern.id}`);
  return pattern.label;
}

export function formatPatternList(
  patterns: DisplayPattern[],
  t: ScoreCopy,
  style: 'paren' | 'plus' = 'paren'
): string {
  if (patterns.length === 0) return t('scoreNoPatterns');
  return patterns
    .map((pattern) => {
      const name = patternDisplayName(pattern, t);
      return style === 'plus' ? `${name} +${pattern.value}` : `${name} (+${pattern.value})`;
    })
    .join(' · ');
}

export function formatScoreHeadline(
  ruleset: string,
  score: { total: number; han?: number; fu?: number; points?: number },
  t: ScoreCopy
): string {
  if (ruleset === 'riichi') {
    return t('scoreHeadlineRiichi', {
      han: score.han ?? score.total,
      fu: score.fu ?? 0,
      points: score.points ?? 0
    });
  }
  if (ruleset === 'chinese-official' && score.points) {
    return t('scoreHeadlineMcr', { total: score.total, points: score.points });
  }
  if (score.points) {
    return t('scoreHeadlineFanPoints', {
      total: score.total,
      points: score.points,
      unit: t('unitFan'),
      pointUnit: t('unitPoints')
    });
  }
  return t('scoreHeadline', {
    total: score.total,
    unit: ruleset === 'chinese-official' ? t('unitPoints') : t('unitFan')
  });
}

export function formatRiichiHanFu(
  score: { total: number; han?: number; fu?: number },
  t: ScoreCopy
): string {
  return t('scoreHeadlineRiichiShort', {
    han: score.han ?? score.total,
    fu: score.fu ?? 0
  });
}

/** Translate baked English payment sentences. Unknown strings stay as-is. */
export function formatPaymentLabel(
  label: string,
  t: ScoreCopy,
  seatName?: (seat: number) => string
): string {
  const selfDraw = label.match(/^(\d+) from each opponent \(8 \+ (\d+)\)$/);
  if (selfDraw) return t('payMcrSelfDraw', { each: selfDraw[1], points: selfDraw[2] });

  const mcrDiscard = label.match(/^(\d+) from discarder, 8 from each other seat$/);
  if (mcrDiscard) return t('payMcrDiscard', { amount: mcrDiscard[1] });

  const total = label.match(/^(\d+) total$/);
  if (total) return t('payTotal', { n: total[1] });

  const each = label.match(/^(\d+) from each opponent$/);
  if (each) return t('payEachOpponent', { n: each[1] });

  const discarder = label.match(/^(\d+) from discarder$/);
  if (discarder) return t('payFromDiscarder', { n: discarder[1] });

  const pao = label.match(/^包牌：seat (\d) pays (\d+) \((self-draw|discard win)\)$/);
  if (pao) {
    const seat = Number(pao[1]);
    return t('payPao', {
      seat: seatName ? seatName(seat) : seat,
      total: pao[2],
      kind: pao[3] === 'self-draw' ? t('selfDrawLabel') : t('winOnDiscardLabel')
    });
  }

  const paoYakuman = label.match(/^Pao (\d+) · (\d+) yakuman liability$/);
  if (paoYakuman) return t('payPaoYakuman', { pay: paoYakuman[1], liability: paoYakuman[2] });

  const paoRon = label.match(/^Pao ron (\d+)$/);
  if (paoRon) return t('payPaoRon', { n: paoRon[1] });

  const paoSplit = label.match(/^Pao split (\d+) \/ (\d+)$/);
  if (paoSplit) return t('payPaoSplit', { a: paoSplit[1], b: paoSplit[2] });

  const ron = label.match(/^(\d+) Ron$/);
  if (ron) return t('payRon', { n: ron[1] });

  const all = label.match(/^(\d+) all$/);
  if (all) return t('payAll', { n: all[1] });

  const split = label.match(/^(\d+) \/ (\d+)$/);
  if (split) return t('payDealerOther', { dealer: split[1], other: split[2] });

  return label;
}
