/**
 * SEO blog published under /blog.
 * English is the base; per-locale overrides live in data/blog-i18n/*.json
 * and are merged by getLocalizedBlogPost(). FAQ data is rendered as FAQPage JSON-LD.
 */
import { BLOG_I18N, type LocaleCode } from './blog.i18n';
import { cornerstonePosts } from './blog.cornerstone';
import type { TileSpec } from './tiles';

export interface BlogSection {
  heading: string;
  body: string[];
  /** Optional row of mahjong tiles (牌图) to render under the section. */
  tiles?: TileSpec[];
}

export interface BlogFaq {
  question: string;
  answer: string;
}

/** End-of-article Play Now button back to the games. */
export interface BlogCta {
  label: string;
  href: string;
}

/** Shared publish date for guides that predate per-article timestamps. */
export const BLOG_SITE_EPOCH = '2026-08-18';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  readMinutes: number;
  sections: BlogSection[];
  faq: BlogFaq[];
  /** ISO date. Falls back to BLOG_SITE_EPOCH when absent. */
  publishedAt?: string;
  updatedAt?: string;
  /** Meta keywords (not rendered). */
  keywords: string;
  /** End-of-article Play Now button back to the games. */
  cta?: BlogCta;
  /** Decorative tile row for the article hero (配图). */
  heroTiles?: TileSpec[];
}

/** Beginner guides plus cornerstone SEO articles. */
const beginnerPosts: BlogPost[] = [
  {
    slug: 'what-is-mahjong',
    title: 'What Is Mahjong? A Complete Beginner Guide',
    description:
      'Mahjong is a four-player tile game of skill, strategy and luck. Learn what mahjong is, how the tiles work, the main rulesets around the world, and how it differs from the tile-matching games you may have seen online.',
    readMinutes: 8,
    keywords: 'what is mahjong, mahjong rules, mahjong tiles, mahjong variants, four player mahjong',
    heroTiles: [{"suit": 'char', "rank": 1}, {"suit": 'bamboo', "rank": 1}, {"suit": 'dot', "rank": 1}, {"suit": 'wind', "wind": 'east'}, {"suit": 'dragon', "dragon": 'red'}],
    sections: [
      {
        heading: 'Mahjong Is a Four-Player Tile Game',
        body: [
          'Mahjong (麻将) is a tile-based game for four players that combines skill, strategy, and a little luck. Each player starts with thirteen tiles and takes turns drawing and discarding until someone completes a winning hand — traditionally four sets plus a pair.',
          'It originated in China in the 19th century and spread across Asia, then the world, producing distinct regional rulesets. Today it is one of the most-played games in the world, and it is completely free to play online on sites like this one.',
          'There is no board and no score pad in front of you — only tiles. Four players sit around a square, each guarding thirteen tiles, the undealt tiles are stacked face down in the middle as a tile wall, and the discards pile up in rows in front of every player. Everything else in the game grows out of that arrangement.',
          'A hand begins with all 144 tiles shuffled face down and built into four walls around the table, then dealt out thirteen at a time. The player who deals first becomes the dealer, and the four seats are named after the winds — East is the dealer, then South, West and North. Those names come back later, because a triplet of your own seat wind is worth extra points.'
        ]
      },
      {
        heading: 'The Tiles',
        body: [
          'A standard mahjong set has 144 tiles: three suits of numbered tiles, honour tiles (winds and dragons), and bonus tiles (flowers and seasons, used in some rulesets).',
          'The suits are the character tiles (万, tens), bamboo (条, bamboos) and dots (筒, circles), each numbered 1 through 9 with four copies of every tile. The honours are the four winds (East, South, West, North) and three dragons (Red, Green, White).',
          'Every mahjong tile exists exactly four times, and that single fact shapes the whole game. It is why three identical tiles can form a set, why you can often work out that two copies of a tile are already gone, and why a hand that looks finished on paper may still be waiting for a tile that no longer exists anywhere on the table. Counting those four copies is the first real skill a beginner picks up.'
        ],
        tiles: [{"suit": 'char', "rank": 1}, {"suit": 'bamboo', "rank": 1}, {"suit": 'dot', "rank": 1}, {"suit": 'wind', "wind": 'east'}, {"suit": 'dragon', "dragon": 'red'}],
      },
      {
        heading: 'The Objective',
        body: [
          'The goal is to build a hand of four sets and one pair. A set is either a triplet (three identical tiles) or a sequence (three consecutive tiles in the same suit). A pair is two identical tiles.',
          'Depending on the ruleset, a winning hand also needs a minimum number of points (called faan, han or points). This is what gives mahjong its depth — a complete hand is not always a winning hand.',
          'The arithmetic tells you almost everything: four sets of three tiles plus a pair is fourteen tiles, which is why a finished hand is fourteen tiles, why you hold thirteen between turns, and why every turn is a draw followed by a discard. The fourteenth tile is the one that closes the shape — every hand is one tile short of itself until that tile arrives.'
        ]
      },
      {
        heading: 'What a Turn Actually Looks Like',
        body: [
          'Strip away the rulesets and every turn follows the same rhythm: draw a tile, work out what it does to your shape, then discard a tile. Beginners tend to rush the middle step. Most of the skill in the game lives in those few seconds between picking a tile up and putting one down.',
          'Picture an early turn. Among your thirteen tiles you hold a 2 and a 3 of dots, a 7 and an 8 of bamboo, a pair of East winds, and several loose tiles that are going nowhere. You draw a 4 of dots. It is not the 1 of dots you were quietly hoping for, but 2-3-4 is a finished sequence all the same — one draw has turned a wish into a set.',
          'That is when the turn gets interesting, because now you have to give something back. Discarding a lone White Dragon costs you nothing: it pairs with nothing and blocks nothing. Breaking up the 2-3 that has just become useful would cost you the set. Strong players spend their turn on this decision far more than on the draw itself.',
          'Not every turn belongs to you alone. When another player discards a tile you need, you can sometimes claim it instead of waiting for your own draw. That is what the calls at the table are for, and it is why strong players read all four discard rows and not just their own hand.',
          'That is the loop — draw, evaluate, release. Early on you are collecting shapes that might grow; later you are holding the ones that will finish and cutting the ones that will not. Once the loop feels natural, the rules stop reading like a checklist and start reading like a map.'
        ],
        tiles: [{"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 3}, {"suit": 'dot', "rank": 4}, {"suit": 'bamboo', "rank": 7}, {"suit": 'bamboo', "rank": 8}, {"suit": 'wind', "wind": 'east'}, {"suit": 'wind', "wind": 'east'}, {"suit": 'dragon', "dragon": 'white'}],
      },
      {
        heading: 'The Main Variants',
        body: [
          'There are many ways to play mahjong, and the rules differ between regions:',
          '• Chinese Mahjong (Hong Kong style): the most common outside Japan, with a three-faan minimum.',
          '• Japanese Riichi Mahjong: the competitive ruleset with riichi declarations, doras and strict scoring.',
          '• Chinese Official (MCR): the international tournament ruleset with an eight-point minimum.',
          '• American Mahjong: uses jokers, flowers and an annual hand card.',
          '• Taiwanese Mahjong: played with sixteen tiles instead of thirteen.',
          '• Sichuan Mahjong: a fast "bloody battle" variant with no honours and continued play after a win.'
        ]
      },
      {
        heading: 'Mahjong Solitaire vs. Four-Player Mahjong',
        body: [
          'Many western websites call the single-player tile-matching puzzle "mahjong" — this is actually mahjong solitaire, a completely different game. Solitaire asks you to match identical tiles in a layered layout. Real mahjong is a competitive game with drawing, discarding, calling and scoring.',
          'Both are fun and both are free to play here. This guide is about the four-player game.',
          'The two share little beyond their artwork. Solitaire is a solo puzzle on a fixed, fully visible layout that has a solution if you look carefully enough; four-player mahjong hides every hand, deals a different draw each time, and ends when somebody wins — or when nobody does. Same tiles, opposite games.'
        ]
      },
      {
        heading: 'One Hand Is Not the Whole Game',
        body: [
          'A single hand ends in one of three ways. You draw the tile you were missing and win on your own — a self-draw. Or another player discards the tile you were waiting for and you claim it, which is how most first wins actually happen. Or the wall runs out before anybody completes a hand, and the round is a draw with nobody scoring.',
          'That third ending takes new players by surprise. There are only 136 playable tiles in a set, and if all four players defend carefully, the wall really can run dry. A hand that stalls is not a failure by anyone — it is the table agreeing that nobody found a way through. Experienced players will often take a draw over a risky discard.',
          'Then everything resets and you play the next hand. The deal moves around the table, scores build up across hands, and a session is usually a dozen hands or more rather than a single round. That is why a game of mahjong can take twenty minutes or fill an evening, depending on how the table plays.',
          'For a beginner this matters more than any rule. You are not trying to win one hand; you are learning to read tiles, to take your chances when the table is quiet, and to let a hopeless hand go early instead of chasing it. The players who improve fastest are the ones who stop playing every hand as if it were the last — and start treating a session as one long game.'
        ]
      },
      {
        heading: 'Is Mahjong Gambling?',
        body: [
          'No. Mahjong is a game of skill that can be played for fun or for money, exactly like poker or chess. On this site it is completely free — there is no wagering, no purchasable currency and no cash prize.',
          'Skill shows up over time rather than inside a single hand. Luck decides who draws the tile they need tonight; judgement decides who is ahead after fifty hands, because reading discards, defending against an obvious threat, and folding a hopeless hand early are all choices. The tiles are dealt to you — what you do with them is yours.'
        ]
      },
      {
        heading: 'How to Start Playing',
        body: [
          'The best way to learn is to play. Start with our Hong Kong Mahjong table (the easiest ruleset to learn first), or read How to Play Mahjong for a step-by-step guide. When you are comfortable, try Japanese Riichi or Chinese Official for more depth.',
          'If you want a plan for a first session: play one hand slowly, ignore the score completely, and just try to reach four sets and a pair. Once that shape feels natural, add the three-faan minimum and start keeping score. Two or three short sessions is usually enough to stop counting on your fingers.'
        ]
      }
    ],
    faq: [
      { question: 'How many tiles are in a mahjong set?', answer: 'A standard set has 144 tiles: 108 numbered tiles (three suits), 28 honour tiles (winds and dragons), and 8 bonus tiles (flowers and seasons). Some rulesets leave out the bonus tiles.' },
      { question: 'Is mahjong hard to learn?', answer: 'The core rules are simple: draw a tile, discard a tile, build four sets and a pair. Scoring takes a little longer, but the Hong Kong ruleset with its three-faan minimum is a gentle entry point.' },
      { question: 'Do I need money to play mahjong?', answer: 'No. Mahjong can be played for fun without any money. Our tables are completely free and there is no wagering of any kind.' },
      { question: 'Can I play mahjong alone?', answer: 'Real mahjong needs four players, but online you can play against computer opponents anytime. Mahjong solitaire is a separate single-player puzzle if you prefer solo play.' },
      { question: 'What is the difference between mahjong and mahjong solitaire?', answer: 'Mahjong is a competitive four-player game of drawing, discarding and scoring. Mahjong solitaire is a single-player puzzle where you match identical tiles in a layered layout. Different games, same tiles.' },
      { question: 'How long does a game of mahjong last?', answer: 'A single hand usually takes five to ten minutes, but a game is normally a series of hands — often a dozen or more — so a full session can run from twenty minutes to a few hours. A wall that runs out ends a hand quickly; a tight, defensive table can stretch each one out.' },
      { question: 'How many tiles do you need to win at mahjong?', answer: 'Fourteen: four sets of three tiles plus a pair. You hold thirteen between turns and win on the fourteenth, either by drawing it yourself or by claiming it from another player’s discard. Taiwanese mahjong plays with sixteen instead of thirteen.' },
    ]
  },
  {
    slug: 'how-to-play-mahjong',
    title: 'How to Play Mahjong: Step-by-Step Guide for Beginners',
    description:
      'Learn how to play mahjong from scratch: the tiles, setting up the wall, drawing and discarding, building pongs and chows, and declaring a winning hand — explained simply with examples.',
    readMinutes: 8,
    keywords: 'how to play mahjong, mahjong rules, mahjong for beginners, mahjong tutorial',
    heroTiles: [{"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 3}, {"suit": 'dot', "rank": 4}, {"suit": 'bamboo', "rank": 6}],
    sections: [
      {
        heading: 'What You Need to Play',
        body: [
          'You need four players and a set of 144 tiles. Each player sits at one side of the table, called a seat. The dealer (East) starts the round.',
          'When you play online, the computer deals, tracks the wall and scores for you — so you only need to focus on building your hand.'
        ]
      },
      {
        heading: 'Building the Wall and Dealing',
        body: [
          'The tiles are shuffled face-down and stacked two-high into a wall of 17 stacks per side. Each player builds one side.',
          'The dealer rolls the dice to decide where to break the wall, then each player is dealt 13 tiles (the dealer gets 14 and discards first). Online, this all happens automatically.'
        ]
      },
      {
        heading: 'Your Turn: Draw and Discard',
        body: [
          'On your turn you draw one tile from the wall, look at your hand, and discard one tile face-up into the centre. You always keep your hand at thirteen tiles.',
          'Your goal while doing this is to turn your hand into four sets plus a pair.'
        ]
      },
      {
        heading: 'Calling Tiles: Pong, Chi and Kong',
        body: [
          'When another player discards a tile you need, you may call it instead of drawing:',
          '• Pong (碰): take the discard to complete a triplet of three identical tiles.',
          '• Chi (吃): take the discard to complete a sequence (three consecutive tiles) — but only from the player on your left.',
          '• Kong (杠): take the discard to complete four identical tiles.',
          'Calling makes your hand open (exposed), which can reduce the patterns you are eligible for — so only call when it genuinely helps.'
        ],
        tiles: [{ "suit": 'dot', "rank": 5 }, { "suit": 'dot', "rank": 5 }, { "suit": 'dot', "rank": 5 }, { "suit": 'bamboo', "rank": 6 }, { "suit": 'bamboo', "rank": 7 }, { "suit": 'bamboo', "rank": 8 }]
      },
      {
        heading: 'Winning a Hand',
        body: [
          'A winning hand is four sets plus one pair. You can win by self-draw (tsumo) or by claiming another player\u2019s discard (ron).',
          'Most rulesets also require a minimum score. Hong Kong style needs at least three faan, Chinese Official needs eight points, and Japanese Riichi needs at least one yaku. Our tables show your distance to ready and explain how each winning hand scored.'
        ]
      },
      {
        heading: 'Scoring Basics',
        body: [
          'Points come from patterns built into your hand. Common ones are flushes (all one suit), all-triplets, dragon or wind sets, and the prized seven pairs.',
          'Different rulesets value patterns differently. The simplest rule: the more structured your hand, the more it is worth. Our scoring breakdown shows exactly where your points come from after every win.'
        ]
      },
      {
        heading: 'Try It Now',
        body: [
          'The fastest way to learn is to play. Start with Hong Kong Mahjong — three computer opponents, an optional readiness hint, and a full score breakdown on every hand.'
        ]
      }
    ],
    faq: [
      { question: 'How many tiles do I start with?', answer: 'Each player starts with 13 tiles. The dealer starts with 14 and discards first, which keeps every hand at 13 tiles after the first discard.' },
      { question: 'What is the difference between a pong and a kong?', answer: 'A pong is three identical tiles; a kong is four identical tiles. A kong counts as a set plus an extra draw from the end of the wall.' },
      { question: 'Can I call a discard from any player?', answer: 'A pong or kong can be claimed from any player\u2019s discard. A chi (sequence) can only be claimed from the player on your left, to keep the turn order fair.' },
      { question: 'What does it mean to be "ready" or tenpai?', answer: 'You are ready (tenpai) when your hand needs only one more tile to be complete. Being ready means you can win the moment the right tile arrives.' },
      { question: 'How many points do I need to win?', answer: 'It depends on the ruleset: Hong Kong needs three faan, Japanese Riichi needs at least one yaku, and Chinese Official needs eight points. Our tables remind you of the minimum and show your score breakdown.' }
    ]
  },
  {
    slug: 'how-to-win-mahjong',
    title: 'How to Win at Mahjong: Strategy for New Players',
    description:
      'Practical mahjong strategy for beginners: choose a hand direction early, discard honours, read the discard pile, avoid over-calling, and reach ready faster. Beat the bots more often with these tips.',
    readMinutes: 7,
    keywords: 'how to win mahjong, mahjong strategy, mahjong tips, mahjong tenpai, mahjong tactics',
    heroTiles: [{"suit": 'dragon', "dragon": 'red'}, {"suit": 'dragon', "dragon": 'green'}, {"suit": 'dragon', "dragon": 'white'}, {"suit": 'char', "rank": 7}],
    sections: [
      {
        heading: 'Pick a Direction Early',
        body: [
          'In the first few turns, look at your hand and choose what it wants to be. A hand with seven or eight tiles of one suit is aiming at a flush. A hand full of pairs or triplets can chase all-triplets. A hand with no honours at all is close to all-simples.',
          'Committing early turns your tiles into a plan instead of random discards. This is the single biggest difference between winning and losing players.'
        ]
      },
      {
        heading: 'Discard Lone Honours First',
        body: [
          'Wind and dragon tiles are the hardest to pair up. A lone honour does almost nothing for a beginner hand, so throw it out early before it becomes a liability.',
          'The exception: if you have a pair or triplet of a useful honour (like a dragon or your seat wind), keep it — it is a scoring pattern waiting to happen.'
        ]
      },
      {
        heading: 'Read the Discard Pile',
        body: [
          'Every discard is information. If three players are throwing away bamboo, the bamboo tiles you need are probably still safe. If everyone is keeping characters, those tiles are being hoarded and are harder to get.',
          'Watching the discards also helps you avoid discarding a tile that would complete an opponent\u2019s hand.'
        ]
      },
      {
        heading: 'Do Not Over-Call',
        body: [
          'Calling tiles makes your hand open and closes off scoring patterns. In most rulesets a concealed hand is worth more.',
          'A good rule for beginners: only call when the call puts you one or two tiles from ready. Otherwise keep drawing and keep your hand closed.'
        ]
      },
      {
        heading: 'Reach Ready as Fast as You Can',
        body: [
          'The player who gets ready first usually wins. Trade tiles you cannot use for tiles you might use, and keep the shape of your hand flexible — a hand that can win on several different tiles is stronger than one waiting on a single tile.',
          'Our tables include a readiness hint that shows exactly how far you are from a complete hand, which trains you to see the distance yourself.'
        ]
      },
      {
        heading: 'Know the Common Winning Patterns',
        body: [
          'These patterns appear constantly and are worth memorising:',
          '• All-simples (断幺九): no 1s, 9s or honours. Reachable from almost any hand.',
          '• Flush (清一色): all tiles from one suit. Worth a lot of points.',
          '• All-triplets (碰碰胡): every set is a triplet.',
          '• Seven pairs (七对子): the classic alternative winning shape.',
          '• Dragon sets (三元牌): three dragons score in most rulesets.'
        ],
        tiles: [{"suit": 'dragon', "dragon": 'red'}, {"suit": 'dragon', "dragon": 'green'}, {"suit": 'dragon', "dragon": 'white'}, {"suit": 'char', "rank": 7}, {"suit": 'char', "rank": 7}],
      },
      {
        heading: 'Play Your Ruleset, Not a Generic Game',
        body: [
          'Hong Kong, Riichi and Chinese Official reward different things. Hong Kong values a quick, cheap three-faan hand. Riichi rewards concealed, structured hands and offers riichi itself. Chinese Official demands a real eight-point pattern.',
          'Pick one ruleset and learn its patterns — switching between them too early is the fastest way to confuse yourself.'
        ]
      }
    ],
    faq: [
      { question: 'What is the fastest way to reach tenpai?', answer: 'Keep your hand flexible and aim for a cheap, reliable pattern. All-simples is the fastest for beginners because it can be built from almost any starting hand.' },
      { question: 'Should I call tiles or stay concealed?', answer: 'For beginners, stay concealed unless a call takes you to ready. Open hands score less and give away information.' },
      { question: 'How do I avoid dealing into another player\u2019s hand?', answer: 'Watch the discards. Late in the hand, avoid discarding tiles that other players have been collecting — especially if they are ready.' },
      { question: 'Is winning about luck or skill?', answer: 'Any single hand has luck, but over a session skill dominates. Hand direction, discard discipline and pattern knowledge decide who wins most often.' },
      { question: 'Which mahjong ruleset is easiest to win in?', answer: 'Hong Kong Mahjong has the lowest scoring minimum (three faan), so it is the most forgiving for beginners. It is the best place to learn winning habits.' }
    ]
  }
];

export const blogPosts: BlogPost[] = [...beginnerPosts, ...cornerstonePosts];

export function getBlogPosts(): BlogPost[] {
  return blogPosts;
}

function withDates(post: BlogPost): BlogPost {
  const publishedAt = post.publishedAt ?? BLOG_SITE_EPOCH;
  return { ...post, publishedAt, updatedAt: post.updatedAt ?? publishedAt };
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const post = blogPosts.find((p) => p.slug === slug);
  return post ? withDates(post) : undefined;
}

/** Merge locale overlays (data/blog-i18n/*.json) into a post, falling back to TS. */
export function getLocalizedBlogPost(
  slug: string,
  locale: string
): BlogPost | undefined {
  const post = getBlogPost(slug);
  if (!post) return undefined;

  const i18n = BLOG_I18N[slug];
  if (!i18n) return withDates(post);

  const localeKey = locale as LocaleCode;
  // EN prefers en.json when present so Studio "Save EN" is live on the site.
  return withDates({
    ...post,
    title: i18n.title?.[localeKey] ?? post.title,
    description: i18n.description?.[localeKey] ?? post.description,
    sections: i18n.sections?.[localeKey] ?? post.sections,
    faq: i18n.faq?.[localeKey] ?? post.faq
  });
}

/** Localize a list of posts (for the beginners listing). */
export function getLocalizedBlogPosts(
  list: BlogPost[],
  locale: string
): BlogPost[] {
  return list.map((p) => getLocalizedBlogPost(p.slug, locale) ?? p);
}
