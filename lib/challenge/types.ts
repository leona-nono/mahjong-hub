/** Localized copy for challenge questions (EN / zh / zh-TW). */
export type ChallengeLocale = 'en' | 'zh' | 'zh-TW';

export type LocalizedText = Record<ChallengeLocale, string>;

export type ChallengeGroup =
  | 'tiles'
  | 'honours'
  | 'calls'
  | 'winning'
  | 'patterns'
  | 'table'
  | 'rules';

export type ChallengeLink =
  | { type: 'glossary'; key: string }
  | { type: 'blog'; slug: string };

export type ChallengeOption = {
  id: string;
  label: LocalizedText;
};

export type ChallengeQuestionBase = {
  id: string;
  group: ChallengeGroup;
  prompt: LocalizedText;
  options: ChallengeOption[];
  answerId: string;
  why: LocalizedText;
  link: ChallengeLink;
};

/** Show a tile face; options are suit / honour names. */
export type IdentifyQuestion = ChallengeQuestionBase & {
  kind: 'identify';
  tile: string;
};

/** Definition ↔ term (or reverse). */
export type TermQuestion = ChallengeQuestionBase & {
  kind: 'term';
};

/** Rules / pattern question with a blog deep-link. */
export type RuleQuestion = ChallengeQuestionBase & {
  kind: 'rule';
};

export type ChallengeQuestion = IdentifyQuestion | TermQuestion | RuleQuestion;

export type DealtQuestion = ChallengeQuestion & {
  /** Options already shuffled for this seed. */
  options: ChallengeOption[];
};

export type ChallengeDeal = {
  seed: number;
  questions: DealtQuestion[];
};

export type TitleId =
  | 'grand_master'
  | 'tile_scholar'
  | 'steady_hand'
  | 'still_learning'
  | 'lucky_guess'
  | 'blank_tile';

export type SpecialtyId =
  | 'tile_spotter'
  | 'call_master'
  | 'win_reader'
  | 'pattern_reader';
