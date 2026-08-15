/**
 * Precompute the classic-144 campaign seed catalog (server-held).
 * Usage: npx tsx scripts/build-solitaire-catalog.ts
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildSeedCatalog,
  DEFAULT_CATALOG_SEED
} from '../lib/mahjong-solitaire/difficulty';

const TOTAL = 36;
const entries = buildSeedCatalog(TOTAL, DEFAULT_CATALOG_SEED, 'classic', {
  candidatesPerLevel: 4
});

const out = {
  version: 1,
  seedBase: DEFAULT_CATALOG_SEED,
  layout: 'classic' as const,
  entries
};

const dest = join(process.cwd(), 'lib/mahjong-solitaire/seed-catalog.json');
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
console.log(`wrote ${entries.length} catalog rows → ${dest}`);
