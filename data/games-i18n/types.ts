import type { GameContent } from '../games';

export type GameLocaleContent = Pick<
  GameContent,
  'intro' | 'howToPlay' | 'tips' | 'features' | 'supportedDevices' | 'faq'
>;

export type GameLocaleEntry = {
  title: string;
  description: string;
  content?: GameLocaleContent;
};

/** Per-locale game copy: every slug has title/description; content falls back to English when omitted. */
export type GameLocaleJson = Record<string, GameLocaleEntry>;
