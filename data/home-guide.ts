import type { Locale } from '@/i18n/routing';
import type { RichSegment } from '@/components/RichText';

export type HomeGuideBullet = {
  strong: string;
  text: string;
  link?: { label: string; href: string };
  links?: { label: string; href: string }[];
};

export type HomeGuideChoice = {
  prompt: string;
  answerStrong?: string;
  answerText?: string;
  link?: { label: string; href: string };
  answerSegments?: RichSegment[];
};

export type HomeGuideSection = {
  heading: string;
  bullets?: HomeGuideBullet[];
  choices?: HomeGuideChoice[];
};

export type HomeGuideDoc = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: HomeGuideSection[];
  closing: RichSegment[];
};

const homeGuideEn: HomeGuideDoc = {
  eyebrow: 'PLAY · LEARN · RELAX',
  title: 'Why play mahjong online \u2014 and which game is right for you?',
  intro:
    'Mahjong is one of the easiest ways to clear your head for a few minutes \u2014 and one of the most satisfying to actually learn. Here\u2019s why people keep coming back, and a quick way to find the game that fits your mood.',
  sections: [
    {
      heading: 'Why players stick around',
      bullets: [
        {
          strong: 'It\u2019s a real break, not a time sink.',
          text: ' No downloads, no account to start \u2014 open a board and clear your head. \u2192 ',
          link: { label: 'Browse the Game Hall', href: '/games' }
        },
        {
          strong: 'There\u2019s a version for every mood.',
          text: ' Want pure calm? Match tiles in solitaire. Want a real game of skill? Sit at a four-player table against the bots. \u2192 ',
          links: [
            { label: 'Mahjong Solitaire', href: '/games/solitaire' },
            { label: 'Mahjong 4 Player', href: '/games/classic' }
          ]
        },
        {
          strong: 'You can actually get good at it.',
          text: ' Our beginner guides walk you through the tiles, the rules and a winning hand in plain language \u2014 no jargon walls. \u2192 ',
          link: { label: 'What Is Mahjong?', href: '/blog/what-is-mahjong' }
        }
      ]
    },
    {
      heading: 'How to choose your game in 10 seconds',
      choices: [
        {
          prompt: '\u201cI have 5 minutes and just want to unwind.\u201d',
          answerStrong: 'Mahjong Solitaire',
          answerText: ' \u2014 match free tiles and clear the board, no timer. \u2192 ',
          link: { label: 'Play solitaire', href: '/games/solitaire' }
        },
        {
          prompt: '\u201cI want the classic four-player game.\u201d',
          answerStrong: 'Mahjong 4 Player',
          answerText:
            ' \u2014 Hong Kong, Riichi, Chinese Official and more, played against AI. \u2192 ',
          link: { label: 'Sit at a table', href: '/games/classic' }
        },
        {
          prompt: '\u201cI\u2019m brand new and not sure where to start.\u201d',
          answerSegments: [
            { text: 'Start with ' },
            { text: 'What Is Mahjong?', href: '/blog/what-is-mahjong' },
            { text: ', then ' },
            { text: 'Types of Mahjong Games', href: '/blog/types-of-mahjong-games' },
            { text: ' to find your style.' }
          ]
        }
      ]
    }
  ],
  closing: [
    { text: 'Still deciding which ruleset suits you? Read ' },
    { text: 'American vs Chinese Mahjong', href: '/blog/american-vs-chinese-mahjong' },
    { text: ' or ' },
    { text: 'How to Play Mahjong Online', href: '/blog/how-to-play-mahjong-online' },
    { text: ' \u2014 both free, no sign-up.' }
  ]
};

const homeGuideByLocale: Partial<Record<Locale, HomeGuideDoc>> = {
  en: homeGuideEn
};

export function getHomeGuideDoc(locale: string): HomeGuideDoc {
  return homeGuideByLocale[locale as Locale] ?? homeGuideEn;
}
