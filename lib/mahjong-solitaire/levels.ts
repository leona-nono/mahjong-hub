/**
 * Campaign / teaching levels (design: lessons 1–3 then infinite mainline).
 */

import {
  campaignDealOpts,
  campaignSeed,
  dailyChallengeSpec,
  levelInfo,
  pickLevel,
  type CatalogEntry,
  type DifficultyBand,
  type LevelInfo
} from './difficulty';
import { createBoard, type BoardOptions } from './generator';
import type { Board } from './board';
import type { SolitaireLayout } from './layouts';
import {
  dailyLevelId,
  parseDailyLevelId,
  type SolitaireDeal
} from './progress-rules';

export type TutorialFocus = 'free_tile' | 'flower_match' | 'deadlock';

export interface LevelDef {
  id: string;
  order: number;
  /** Short English label (UI may i18n via id). */
  title: string;
  layout: SolitaireLayout;
  /** Fixed seed so coaches can demo consistently. */
  seed: number;
  tutorial?: TutorialFocus;
  deal: Pick<
    BoardOptions,
    'includeBonus' | 'avoidLookalikes' | 'forceFlowerPairs' | 'alphabet'
  >;
  /** Coach copy key under messages.solitaire.* */
  coachKey?: 'coachFree' | 'coachFlower' | 'coachDead';
  campaign?: LevelInfo;
}

export const TEACHING_LEVELS: LevelDef[] = [
  {
    id: 'teach-1',
    order: 1,
    title: 'Lesson 1 · Free tiles',
    layout: 'flat36',
    seed: 1001,
    tutorial: 'free_tile',
    deal: {
      includeBonus: false,
      avoidLookalikes: true,
      forceFlowerPairs: false
    },
    coachKey: 'coachFree'
  },
  {
    id: 'teach-2',
    order: 2,
    title: 'Lesson 2 · Flowers',
    layout: 'flat36',
    seed: 2002,
    tutorial: 'flower_match',
    deal: {
      includeBonus: true,
      avoidLookalikes: true,
      forceFlowerPairs: true
    },
    coachKey: 'coachFlower'
  },
  {
    id: 'teach-3',
    order: 3,
    title: 'Lesson 3 · Dead ends',
    layout: 'mini',
    seed: 3003,
    tutorial: 'deadlock',
    deal: {
      includeBonus: true,
      avoidLookalikes: false,
      forceFlowerPairs: true
    },
    coachKey: 'coachDead'
  }
];

export const FIRST_CAMPAIGN_ID = 'lv-1';

export function parseCampaignLevel(id: string): number | null {
  const m = /^lv-(\d+)$/.exec(id);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 ? n : null;
}

export function campaignLevelId(level: number): string {
  return `lv-${Math.max(1, Math.floor(level))}`;
}

export function campaignLevelDef(
  level: number,
  catalog?: CatalogEntry[]
): LevelDef {
  const info = levelInfo(level);
  const picked = catalog ? pickLevel(catalog, level) : null;
  const alphabet = picked?.alphabet ?? info.alphabet;
  return {
    id: campaignLevelId(level),
    order: 3 + level,
    title: `Level ${level}`,
    layout: picked?.layout ?? 'classic',
    seed: picked?.seed ?? campaignSeed(level),
    deal: campaignDealOpts(alphabet),
    campaign: info
  };
}

export function dailyLevelDef(utcDay: string): LevelDef {
  const spec = dailyChallengeSpec(utcDay);
  return {
    id: dailyLevelId(utcDay),
    order: 0,
    title: `Daily ${utcDay}`,
    layout: spec.layout,
    seed: spec.seed,
    deal: campaignDealOpts(spec.alphabet)
  };
}

export function getLevel(id: string, catalog?: CatalogEntry[]): LevelDef | undefined {
  const teach = TEACHING_LEVELS.find((l) => l.id === id);
  if (teach) return teach;
  const daily = parseDailyLevelId(id);
  if (daily) return dailyLevelDef(daily);
  const n = parseCampaignLevel(id);
  if (n == null) return undefined;
  return campaignLevelDef(n, catalog);
}

export function dealFromLevel(level: LevelDef): SolitaireDeal {
  return {
    id: level.id,
    seed: level.seed,
    layout: level.layout,
    alphabet: level.deal.alphabet,
    includeBonus: level.deal.includeBonus,
    avoidLookalikes: level.deal.avoidLookalikes,
    forceFlowerPairs: level.deal.forceFlowerPairs,
    band: level.campaign?.band,
    segment: level.campaign?.segment
  };
}

export function applyServerDeal(level: LevelDef, deal: SolitaireDeal): LevelDef {
  return {
    ...level,
    id: deal.id,
    seed: deal.seed,
    layout: deal.layout,
    deal: {
      alphabet: deal.alphabet ?? level.deal.alphabet,
      includeBonus: deal.includeBonus ?? level.deal.includeBonus,
      avoidLookalikes: deal.avoidLookalikes ?? level.deal.avoidLookalikes,
      forceFlowerPairs: deal.forceFlowerPairs ?? level.deal.forceFlowerPairs
    },
    campaign: level.campaign
      ? {
          ...level.campaign,
          alphabet: deal.alphabet ?? level.campaign.alphabet,
          band: deal.band ?? level.campaign.band,
          segment: deal.segment ?? level.campaign.segment
        }
      : level.campaign
  };
}

export function createLevelBoard(
  level: LevelDef,
  catalog?: CatalogEntry[]
): Board {
  const campaignN = parseCampaignLevel(level.id);
  const def =
    campaignN != null && catalog ? campaignLevelDef(campaignN, catalog) : level;
  return createBoard({
    layout: def.layout,
    seed: def.seed,
    ...def.deal
  });
}

export function nextLevelId(currentId: string): string | null {
  const i = TEACHING_LEVELS.findIndex((l) => l.id === currentId);
  if (i >= 0) {
    if (i < TEACHING_LEVELS.length - 1) return TEACHING_LEVELS[i + 1].id;
    return FIRST_CAMPAIGN_ID;
  }
  const n = parseCampaignLevel(currentId);
  if (n == null) return null;
  return campaignLevelId(n + 1);
}

export function campaignOptions(upto: number, catalog?: CatalogEntry[]): LevelDef[] {
  const n = Math.max(1, Math.floor(upto));
  return Array.from({ length: n }, (_, i) => campaignLevelDef(i + 1, catalog));
}

export function bandLabelKey(band: DifficultyBand): 'bandEase' | 'bandRamp' | 'bandPeak' {
  if (band === 'ease') return 'bandEase';
  if (band === 'peak') return 'bandPeak';
  return 'bandRamp';
}
