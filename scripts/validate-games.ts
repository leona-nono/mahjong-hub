/**
 * Validate data/games.ts catalogue invariants + i18n coverage + sitemap rules.
 * Run: npx tsx scripts/validate-games.ts
 * Also hooked into `npm run build` via validate:games.
 */
import { games, type GameConfig, type NavGroup } from '../data/games';
import { GAME_I18N } from '../data/games.i18n';
import { isGamePageIndexable } from '../lib/game-seo';
import { CONTENT_LOCALES } from '../lib/locales';

const errors: string[] = [];
const warnings: string[] = [];

function fail(msg: string) {
  errors.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

const NAV_GROUPS: NavGroup[] = ['classic', 'solitaire', 'beginners', 'set'];
const REGIONS = new Set(['china', 'japan', 'america', 'taiwan', 'sichuan']);

const slugs = new Set<string>();
for (const game of games) {
  validateGame(game);
}

function validateGame(game: GameConfig) {
  const { slug } = game;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(`${slug || '(empty)'}: invalid slug`);
  }
  if (slugs.has(slug)) fail(`${slug}: duplicate slug`);
  slugs.add(slug);

  if (!game.title?.trim()) fail(`${slug}: missing title`);
  if (!game.description?.trim()) fail(`${slug}: missing description`);
  if (!game.category) fail(`${slug}: missing category`);
  if (!game.gameType) fail(`${slug}: missing gameType`);

  if (!game.navGroup) {
    fail(`${slug}: missing navGroup`);
  } else if (!NAV_GROUPS.includes(game.navGroup)) {
    fail(`${slug}: invalid navGroup ${game.navGroup}`);
  }

  if (game.navGroup === 'classic') {
    if (!game.region) fail(`${slug}: classic games require region`);
    else if (!REGIONS.has(game.region)) fail(`${slug}: invalid region ${game.region}`);
  } else if (game.region) {
    warn(`${slug}: region set but navGroup is ${game.navGroup} (region is classic-only)`);
  }

  if (game.gameType === 'iframe' && !game.gameIframeUrl) {
    fail(`${slug}: iframe game missing gameIframeUrl`);
  }
  if (game.gameType === 'native') {
    if (!game.native) fail(`${slug}: native game missing native component id`);
    if (!game.content?.intro) fail(`${slug}: native game missing content.intro`);
    if (!game.content?.howToPlay?.length) fail(`${slug}: native game missing content.howToPlay`);
    if (!game.content?.faq?.length) fail(`${slug}: native game missing content.faq`);
  }
  if (game.gameType === 'coming-soon' && game.gameIframeUrl) {
    warn(`${slug}: coming-soon should not set gameIframeUrl`);
  }

  // Sitemap / robots consistency
  const indexable = isGamePageIndexable(game);
  if (game.gameType === 'iframe' && indexable) {
    fail(`${slug}: iframe must not be indexable`);
  }
  if ((game.gameType === 'native' || game.gameType === 'coming-soon') && !indexable) {
    fail(`${slug}: ${game.gameType} should be indexable`);
  }

  // i18n coverage for non-English content locales
  const i18n = GAME_I18N[slug];
  if (!i18n) {
    if (game.gameType === 'native' || game.gameType === 'coming-soon') {
      warn(`${slug}: no GAME_I18N entry (pages fall back to English)`);
    }
    return;
  }
  for (const locale of CONTENT_LOCALES) {
    const hasTitle = Boolean(i18n.title?.[locale]);
    const hasDesc = Boolean(i18n.description?.[locale]);
    if (!hasTitle || !hasDesc) {
      warn(`${slug}: missing ${locale} title/description in games-i18n`);
    }
  }
}

if (warnings.length) {
  for (const w of warnings) console.warn(`WARN: ${w}`);
}
if (errors.length) {
  for (const e of errors) console.error(`FAIL: ${e}`);
  console.error(`\n${errors.length} game catalogue error(s).`);
  process.exit(1);
}
console.log(`games catalogue OK (${games.length} games, ${warnings.length} warning(s))`);
