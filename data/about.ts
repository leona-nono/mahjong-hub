import type { Locale } from '@/i18n/routing';
import type { RichSegment } from '@/components/RichText';

export type AboutBullet = {
  label: string;
  text?: string;
  link?: { label: string; href: string };
  segments?: RichSegment[];
};

export type AboutSection = {
  heading: string;
  paragraphs?: RichSegment[][];
  bullets?: AboutBullet[];
  afterBullets?: RichSegment[][];
};

export type AboutDoc = {
  title: string;
  intro: string;
  metaDescription: string;
  sections: AboutSection[];
};

const aboutEn: AboutDoc = {
  title: 'About Mahjong Hub',
  intro:
    'Mahjong Hub is a free online game hall built for one simple reason: mahjong should be easy to play and easy to learn, whether you\u2019ve got five minutes or five years of experience. No downloads, no account to start, no real-money pressure \u2014 just the game.',
  metaDescription:
    'Mahjong Hub is a free, no-download online game hall for mahjong solitaire and four-player tables \u2014 plus plain-language guides for new players. Here\u2019s who we are and what you\u2019ll find.',
  sections: [
    {
      heading: 'What we are',
      paragraphs: [
        [
          {
            text: 'We\u2019re a small team of mahjong players who kept sending friends to three different sites just to play a round, check a rule, and figure out which tiles they were holding. So we built one place that does all three. Mahjong Hub brings together relaxed tile-matching games and the classic four-player match, with beginner guides written the way we wish someone had explained it to us \u2014 in plain language, not rulebook jargon.'
          }
        ]
      ]
    },
    {
      heading: 'What you\u2019ll find here',
      bullets: [
        {
          label: 'Mahjong Solitaire',
          text: ' \u2014 calm, timer-free tile-matching when you just want to unwind. \u2192 ',
          link: { label: 'Play solitaire', href: '/games/solitaire' }
        },
        {
          label: 'Mahjong 4 Player',
          text: ' \u2014 the real game against AI, across Hong Kong, Riichi, Chinese Official, American, Taiwanese and Sichuan rulesets. \u2192 ',
          link: { label: 'Sit at a table', href: '/games/classic' }
        },
        {
          label: 'Beginner guides',
          segments: [
            { text: ' \u2014 from ' },
            { text: 'What Is Mahjong?', href: '/blog/what-is-mahjong' },
            { text: ' to ' },
            { text: 'Types of Mahjong Games', href: '/blog/types-of-mahjong-games' },
            {
              text: ', so you can learn the tiles, the calls and a winning hand at your own pace. \u2192 '
            },
            { text: 'Browse the blog', href: '/blog' }
          ]
        },
        {
          label: 'The whole Game Hall',
          text: ' \u2014 every board and puzzle in one spot. \u2192 ',
          link: { label: 'Open the Game Hall', href: '/games' }
        }
      ]
    },
    {
      heading: 'Who it\u2019s for',
      paragraphs: [
        [
          { text: 'New to mahjong and not sure where to start? Start with ' },
          { text: 'How to Play Mahjong Online', href: '/blog/how-to-play-mahjong-online' },
          { text: ' and go from there. Already know the game and deciding between styles? ' },
          { text: 'American vs Chinese Mahjong', href: '/blog/american-vs-chinese-mahjong' },
          {
            text: ' breaks down the differences fast. Thinking about a physical set? Our '
          },
          { text: 'best mahjong sets for beginners', href: '/blog/best-mahjong-sets-for-beginners' },
          { text: ' and ' },
          { text: 'where to buy one', href: '/blog/where-to-buy-mahjong-set' },
          { text: ' guides have you covered.' }
        ]
      ]
    },
    {
      heading: 'How we keep it free',
      paragraphs: [
        [
          {
            text: 'Mahjong Hub is free to play. We keep the lights on with ads, not paywalls \u2014 and there\u2019s never any real-money gambling, because this is a game hall, not a casino. Your scores and progress stay in your browser; you decide what to share.'
          }
        ]
      ]
    },
    {
      heading: 'Get started',
      paragraphs: [[{ text: 'Pick a mood, not a commitment:' }]],
      bullets: [
        {
          label: 'Want a quiet break?',
          text: ' \u2192 ',
          link: { label: 'Mahjong Solitaire', href: '/games/solitaire' }
        },
        {
          label: 'Want the full four-player match?',
          text: ' \u2192 ',
          link: { label: 'Mahjong 4 Player', href: '/games/classic' }
        },
        {
          label: 'Want to learn first?',
          text: ' \u2192 ',
          link: { label: 'Mahjong for Beginners', href: '/blog' }
        }
      ],
      afterBullets: [[{ text: 'That\u2019s it. Open a board and play.' }]]
    }
  ]
};

const aboutByLocale: Partial<Record<Locale, AboutDoc>> = {
  en: aboutEn
};

export function getAboutDoc(locale: string): AboutDoc {
  return aboutByLocale[locale as Locale] ?? aboutEn;
}
