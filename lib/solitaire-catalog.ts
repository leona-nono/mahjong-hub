import 'server-only';

import {
  buildSeedCatalog,
  campaignDealOpts,
  campaignSeed,
  dailyChallengeSpec,
  type CatalogEntry
} from '@/lib/mahjong-solitaire/difficulty';
import { generateSolvable } from '@/lib/mahjong-solitaire/generator';
import {
  dealFromLevel,
  getLevel,
  parseCampaignLevel,
  TEACHING_LEVELS
} from '@/lib/mahjong-solitaire/levels';
import {
  dailyLevelId,
  parseDailyLevelId,
  type SolitaireDeal
} from '@/lib/mahjong-solitaire/progress-rules';
import catalogJson from '@/lib/mahjong-solitaire/seed-catalog.json';

export const CATALOG_SIZE = 36;

type CatalogFile = {
  version: number;
  seedBase: number;
  layout: 'classic';
  entries: CatalogEntry[];
};

const file = catalogJson as CatalogFile;

const memory = globalThis as unknown as {
  __solitaireCatalog?: CatalogEntry[];
  __solitaireDaily?: Map<string, SolitaireDeal>;
};

function loadedCatalog(): CatalogEntry[] {
  if (memory.__solitaireCatalog) return memory.__solitaireCatalog;
  if (Array.isArray(file.entries) && file.entries.length > 0) {
    memory.__solitaireCatalog = file.entries;
    return memory.__solitaireCatalog;
  }
  memory.__solitaireCatalog = buildSeedCatalog(CATALOG_SIZE, file.seedBase, 'classic', {
    candidatesPerLevel: 4
  });
  return memory.__solitaireCatalog;
}

export function getSeedCatalog(): CatalogEntry[] {
  return loadedCatalog();
}

function dealFromCatalog(entry: CatalogEntry): SolitaireDeal {
  const opts = campaignDealOpts(entry.alphabet);
  return {
    id: `lv-${entry.level}`,
    seed: entry.seed,
    layout: entry.layout,
    alphabet: entry.alphabet,
    includeBonus: opts.includeBonus,
    avoidLookalikes: opts.avoidLookalikes,
    forceFlowerPairs: opts.forceFlowerPairs,
    band: entry.band,
    segment: entry.segment
  };
}

function resolveCampaign(level: number): SolitaireDeal | null {
  const catalog = loadedCatalog();
  const hit = catalog.find((e) => e.level === level);
  if (hit) return dealFromCatalog(hit);

  const infoLevel = getLevel(`lv-${level}`);
  if (!infoLevel) return null;
  const seed = campaignSeed(level);
  const gen = generateSolvable({
    layout: infoLevel.layout,
    seed,
    ...campaignDealOpts(infoLevel.deal.alphabet ?? 12)
  });
  if (!gen) return null;
  return {
    ...dealFromLevel(infoLevel),
    seed: gen.seed
  };
}

export function resolveDailyDeal(utcDay: string): SolitaireDeal | null {
  if (!memory.__solitaireDaily) memory.__solitaireDaily = new Map();
  const cached = memory.__solitaireDaily.get(utcDay);
  if (cached) return cached;

  const spec = dailyChallengeSpec(utcDay);
  const opts = campaignDealOpts(spec.alphabet);
  const gen = generateSolvable({
    layout: spec.layout,
    seed: spec.seed,
    ...opts
  });
  if (!gen) return null;
  const deal: SolitaireDeal = {
    id: dailyLevelId(utcDay),
    seed: gen.seed,
    layout: spec.layout,
    alphabet: spec.alphabet,
    includeBonus: opts.includeBonus,
    avoidLookalikes: opts.avoidLookalikes,
    forceFlowerPairs: opts.forceFlowerPairs,
    band: 'peak'
  };
  memory.__solitaireDaily.set(utcDay, deal);
  return deal;
}

export function resolveDeal(id: string, todayUtc: string): SolitaireDeal | null {
  const teach = TEACHING_LEVELS.find((l) => l.id === id);
  if (teach) return dealFromLevel(teach);

  const daily = parseDailyLevelId(id);
  if (daily) {
    if (daily > todayUtc) return null;
    return resolveDailyDeal(daily);
  }

  if (id === 'daily' || id === dailyLevelId(todayUtc)) {
    return resolveDailyDeal(todayUtc);
  }

  const n = parseCampaignLevel(id);
  if (n == null) return null;
  return resolveCampaign(n);
}
