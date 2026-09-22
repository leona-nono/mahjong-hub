import { encodeChallengeSeed } from './seed';
import type { SpecialtyId, TitleId } from './types';

export type ShareLocale = 'en' | 'zh' | 'zh-TW';

const TITLE_LABEL: Record<TitleId, Record<ShareLocale, string>> = {
  grand_master: { en: 'Grand Master', zh: '麻将通', 'zh-TW': '麻將通' },
  tile_scholar: { en: 'Tile Scholar', zh: '牌理学者', 'zh-TW': '牌理學者' },
  steady_hand: { en: 'Steady Hand', zh: '稳健之手', 'zh-TW': '穩健之手' },
  still_learning: { en: 'Still Learning', zh: '入门学徒', 'zh-TW': '入門學徒' },
  lucky_guess: { en: 'Lucky Guess', zh: '蒙对一手', 'zh-TW': '矇對一手' },
  blank_tile: { en: 'Blank Tile', zh: '白板一块', 'zh-TW': '白板一塊' }
};

const SPECIALTY_LABEL: Record<SpecialtyId, Record<ShareLocale, string>> = {
  tile_spotter: { en: 'Tile Spotter', zh: '认牌高手', 'zh-TW': '認牌高手' },
  call_master: { en: 'Call Master', zh: '鸣牌行家', 'zh-TW': '鳴牌行家' },
  win_reader: { en: 'Win Reader', zh: '和牌通', 'zh-TW': '和牌通' },
  pattern_reader: { en: 'Pattern Reader', zh: '番种解读者', 'zh-TW': '番種解讀者' }
};

export function titleLabel(id: TitleId, locale: ShareLocale): string {
  return TITLE_LABEL[id][locale];
}

export function specialtyLabel(id: SpecialtyId, locale: ShareLocale): string {
  return SPECIALTY_LABEL[id][locale];
}

/**
 * Wordle-style share text — no questions, no answers, score only via titles.
 * URL carries seed only (`?c=`).
 */
export function buildShareText(opts: {
  locale: ShareLocale;
  correct: number;
  total: number;
  titleId: TitleId;
  specialtyId: SpecialtyId | null;
  seed: number;
  dateKey?: string;
  origin?: string;
}): string {
  const { locale, correct, total, titleId, specialtyId, seed, dateKey } = opts;
  const origin = (opts.origin ?? 'https://mahjonggame.org').replace(/\/$/, '');
  const title = titleLabel(titleId, locale);
  const specialty = specialtyId ? specialtyLabel(specialtyId, locale) : null;
  const titles = specialty ? `${title}, ${specialty}` : title;
  const code = encodeChallengeSeed(seed);
  const url = `${origin}/${locale}/challenge?c=${code}`;

  if (locale === 'zh') {
    const head = dateKey
      ? `🀄 TileDojo · 麻将挑战 #${dateKey}`
      : '🀄 TileDojo · 麻将挑战';
    return `${head}\n我答对 ${correct}/${total} —— ${titles.replace(', ', ' · ')}\n你比我更懂麻将吗？来试试 ↓\n${url}`;
  }
  if (locale === 'zh-TW') {
    const head = dateKey
      ? `🀄 TileDojo · 麻將挑戰 #${dateKey}`
      : '🀄 TileDojo · 麻將挑戰';
    return `${head}\n我答對 ${correct}/${total} —— ${titles.replace(', ', ' · ')}\n你比我更懂麻將嗎？來試試 ↓\n${url}`;
  }

  const head = dateKey
    ? `🀄 TileDojo · Mahjong Challenge #${dateKey}`
    : '🀄 TileDojo · Mahjong Challenge';
  return `${head}\nI got ${correct}/${total} — ${titles}\nThink you know mahjong? Beat me ↓\n${url}`;
}
