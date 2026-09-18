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
    cta: { label: 'Play Hong Kong Mahjong', href: '/games/hong-kong-mahjong' },
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
      'Learn how to play mahjong from scratch: build the wall, deal, draw and discard, call pong and kong, and win your first hand. A complete beginner walkthrough with no assumed knowledge.',
    readMinutes: 8,
    keywords:
      'how to play mahjong, mahjong rules for beginners, mahjong how to play step by step, learn mahjong, mahjong basics',
    heroTiles: [{ "suit": 'dot', "rank": 1 }, { "suit": 'bamboo', "rank": 2 }, { "suit": 'char', "rank": 3 }, { "suit": 'wind', "wind": 'east' }],
    cta: { label: 'Play Hong Kong Mahjong', href: '/games/hong-kong-mahjong' },
    sections: [
      {
        heading: 'What You Need to Play',
        body: [
          'A mahjong set is 144 tiles: three suits numbered one to nine, four of each (the dots, the bamboo and the characters), plus four winds, three dragons and eight bonus tiles. You also need four players and a flat surface. That is the whole equipment list — no board, no counters, no dice unless you want them.',
          'Two things are worth knowing before you touch a tile. First, mahjong is a game of sets: you are not collecting points, you are assembling a shape. Second, there is no penalty for a bad hand — a hand that goes nowhere costs you nothing but time, which is why the game is easy to learn by playing badly for a while.',
          'If you are reading this to learn rather than to play tonight, the single most useful thing you can do is play one game against computer opponents with the rules visible. The mechanics below only make sense once you have seen them happen in order, and a bot table will not mind if you take thirty seconds over every discard.',
          'It also helps to know what the tiles actually are before you start sorting them. The dots are the circles, the bamboo are the sticks, and the characters are the numbers written in Chinese with a small mark for the suit. The honours — four winds and three dragons — are the ones that do not belong to any suit, and they behave differently from everything else, which is why beginners are usually told to throw them early.'
        ]
      },
      {
        heading: 'Building the Wall and Dealing',
        body: [
          'All 144 tiles go face down and get shuffled. Each player then builds a wall of tiles in front of them — traditionally seventeen stacks of two — and pushes it together into a square. The dealer is East to begin with, and the wall is broken at a point decided by a roll of the dice.',
          'Dealing runs counter-clockwise. Each player takes four tiles at a time until everyone has twelve, then the dealer takes one extra and each other player takes one more, leaving the dealer with fourteen and everyone else with thirteen.',
          'The wall after dealing is not just spare tiles. It is the game clock: play continues until the tiles run out, and running out without a winner is a drawn hand that simply ends the deal.',
          'Flowers and seasons are set aside immediately when drawn, and you draw a replacement tile from the back of the wall to fill the gap. This keeps your hand at the right size and, more importantly, keeps the wall cycling — which is why a hand can feel like it is progressing faster than the tile count suggests.',
          'One convention worth knowing even if you never play face to face: the wall is built and broken the same way every time, and the ritual exists to guarantee that nobody can predict which tiles are coming. Once you understand that the wall is a shuffled queue, every other rule about drawing becomes obvious rather than arbitrary.'
        ]
      },
      {
        heading: 'Your Turn: Draw and Discard',
        body: [
          'On your turn you draw one tile from the wall and discard one from your hand, keeping your hand at thirteen tiles between turns. That draw-and-discard loop is the entire rhythm of the game.',
          'Your goal is a hand of four sets and a pair. A set is either a sequence of three consecutive tiles in one suit (a chow) or three identical tiles (a pong), and the pair is two identical tiles. With thirteen tiles you are always one tile short of that shape, which is what "waiting" means: you are holding a nearly complete hand and hoping for the specific tile that finishes it.',
          'That is the whole game in one sentence: keep thirteen tiles, and take turns deciding which of them to throw away.',
          'A practical note for the first few hands: your instinct will be to keep tiles that look interesting and throw the boring ones. Do the opposite. Throw the tiles that connect to nothing, and keep the ones that can grow into a sequence in two different directions. A lone two of dots can become a run with a one and a three or with a three and a four, which is why middle tiles are more valuable than edge tiles even though they look equally unremarkable.',
          'The wall is shared, not per-player. Everyone draws from the same queue, which means every tile you discard is one that nobody — including you — can ever draw again. That is the real weight of a discard, and it is why experienced players spend so long deciding.'
        ]
      },
      {
        heading: 'Calling Tiles: Pong, Chow and Kong',
        body: [
          'You do not have to wait for the wall to give you what you need. You can claim a tile another player discards — but only in specific ways, and only under the right conditions.',
          'Pong: if you hold two identical tiles and any player discards a third, you may call pong, take the tile, and place your three as an open set. Anyone may pong, from any seat.',
          'Chow: if you hold two tiles that complete a run with the discarded tile, you may call chow — but only from the player to your left, never from anyone else.',
          'Kong: four identical tiles. You may declare it from a concealed set of four, by adding the fourth tile to an existing pong, or by claiming a discard when you hold three. A kong earns you a replacement draw from the wall.',
          'Calling is a real trade. Claiming a tile speeds your hand up and reveals it to the table at the same time. Each call also permanently opens your hand, which in most rulesets means giving up concealed-hand bonuses. Call when it moves you clearly closer to ready; keep drawing when it does not.',
          'One ordering rule to remember: a pong or kong beats a chow if two players want the same discard, and priority passes in turn order after that. If two people could pong the same tile, the one nearer the discarder in turn order takes it.',
          'Beginners usually over-call in their first hour. The temptation is to grab every tile that fits, because each call makes the hand visibly closer to complete. What is harder to see is that three calls in a row can take you from a hand worth nothing to a hand still worth nothing, just finished sooner — you have spent all your flexibility and gained a shape that cannot score.'
        ],
        tiles: [{ "suit": 'dot', "rank": 5 }, { "suit": 'dot', "rank": 5 }, { "suit": 'dot', "rank": 5 }]
      },
      {
        heading: 'Winning a Hand',
        body: [
          'You win when your fourteen tiles form four sets and a pair. If the winning tile comes from the wall it is a self-draw; if it is someone else’s discard you claim it, and that player pays.',
          'Most rulesets have a minimum score, so a completed hand is not automatically a winning one. In Hong Kong mahjong you need three faan, and a bare hand of four runs and a pair often falls short until you add a scoring pattern.',
          'The practical consequence is that "completing" your hand is not the goal — completing it *worth enough* is the goal. Beginners who learn this early stop chasing the first shape they can find and start steering toward shapes that will actually pay.',
          'There is also a version of winning that surprises new players: you can be ready with a perfectly good hand and simply never receive the tile, because the wall empties first or because someone else wins on a tile you were also waiting for. Losing a hand you played well is normal and does not mean you misplayed it.'
        ]
      },
      {
        heading: 'Scoring Basics',
        body: [
          'Scores come from patterns, called faan in Hong Kong mahjong and yaku, tài or points in other rulesets. Each pattern is worth a fixed number, and your total is the sum.',
          'Common ones: three dragons, all-tiles-one-suit, no honours and no terminal tiles, or a self-drawn win. Most rulesets also pay a bonus per flower or season you collected.',
          'You may encounter a common claim that a hand with no pattern at all can win. In most rulesets it cannot.',
          'If you want the full breakdown of every pattern and how the totals are added up, that deserves its own read rather than a paragraph here — the catalogue is long, and the thresholds differ enough between rulesets that a single summary would mislead you.',
          'What matters at this stage is the shape of the thing: a small number of recognisable patterns, a minimum you must clear, and payments that depend on how the hand was finished. Learn those three facts and you can sit down at a table without being surprised by anything that happens.'
        ]
      },
      {
        heading: 'Try It Now',
        body: [
          'That is the game. Wall, deal, draw, discard, call, win — everything else is scoring detail layered on top of those six steps.',
          'The fastest way to internalise it is to play a hand. Our tables show you your readiness at every turn, so you can watch the numbers move as you choose what to throw, and they never punish you for a bad discard. Play two or three hands badly, then read this page again — it will make considerably more sense the second time.',
          'Start with Hong Kong mahjong if you have no preference. It keeps the scoring shallow, plays fast and is forgiving about the mistakes every new player makes in their first hour.'
        ]
      },
    ],
    faq: [
      { question: 'How many tiles do you start with in mahjong?', answer: 'Thirteen. The dealer takes fourteen so they can discard without drawing first, and everyone else holds thirteen and draws a tile on their turn before discarding.' },
      { question: 'What is the difference between pong and chow?', answer: 'Pong is three identical tiles and can be claimed from any player. Chow is a run of three consecutive tiles in one suit and can only be claimed from the player immediately to your left.' },
      { question: 'Do I have to call pong if I can?', answer: 'No. Claiming is always optional. Passing on a tile keeps your hand concealed and intact, and that is often the better play even when the call is available.' },
      { question: 'What happens if nobody wins?', answer: 'The hand is drawn when the wall runs out. In most rulesets the deal simply ends with no payment; some rulesets award a small bonus to the player still holding a ready hand.' },
      { question: 'How do I know when I have won?', answer: 'When your fourteen tiles form four sets and a pair, it is a valid shape — but most rulesets still require a minimum score, so check that your hand carries enough faan or points before calling the win.' },
      { question: 'Can I play mahjong alone?', answer: 'The four-player game needs opponents, but you can practise against computer players at any time, and mahjong solitaire is a genuinely single-player puzzle that uses the same tiles.' },
    ]
  },
  {
    slug: 'how-to-win-mahjong',
    title: 'How to Win at Mahjong: Strategy for New Players',
    description:
      'Practical mahjong strategy for beginners: choose a hand direction early, discard honours, read the discard pile, avoid over-calling, and reach ready faster. Beat the bots more often with these tips.',
    readMinutes: 7,
    keywords:
      'how to win at mahjong, mahjong strategy, mahjong tips, mahjong for beginners, how to get better at mahjong',
    heroTiles: [{ "suit": 'dragon', "dragon": 'red' }, { "suit": 'dragon', "dragon": 'green' }, { "suit": 'dragon', "dragon": 'white' }, { "suit": 'char', "rank": 7 }],
    cta: { label: 'Play Hong Kong Mahjong', href: '/games/hong-kong-mahjong' },
    sections: [
      {
        heading: 'Pick a Direction Early',
        body: [
          'In the first few turns, look at your hand and choose what it wants to be. A hand with seven or eight tiles of one suit is telling you something. A hand with three pairs is telling you something else. Players who wander through the first half of a deal discarding whatever looks least useful end up with no shape at all, and then they lose to the player who committed at turn three.',
          'Committing early turns your tiles into a plan instead of random discards. This is the single biggest difference between a beginner and a player who wins consistently, and it costs nothing to start doing.',
          '"Committing" does not mean locking in. It means having a default direction you are steering toward, one you are willing to abandon when the draws contradict it. The mistake is not changing your mind — it is never having a mind to change. A player who has decided they are building an all-simples hand will discard a lone honour without hesitating; a player who has not decided will keep it "just in case", and by the time they work out what they are doing, the wall is half gone.',
          'A useful habit for the first three turns: name your hand out loud, even silently. "This is a bamboo hand." "This is a pairs hand." If you cannot name it, you do not have one yet, and the correct action is to keep discarding the tiles that help nothing.'
        ]
      },
      {
        heading: 'Discard Lone Honours First',
        body: [
          'Wind and dragon tiles are the hardest to pair up. A lone honour does almost nothing for a beginner hand, so the usual answer is to throw it early, while it is still safe to do so.',
          'The exception: if you have a pair or triplet of a useful honour (like a dragon or your seat wind), keep it — it is worth points in most rulesets and calling rules make triplets easy to complete.',
          'The reason honours are different from suit tiles comes down to arithmetic. There are only four copies of any honour, and no way to build a run out of them, so a lone honour needs exactly a pair to become anything at all. By contrast a lone numbered tile can connect upward or downward into a sequence, which means it has roughly twice as many ways to become useful. When you are choosing what to throw, that difference in potential is the whole calculation.',
          'Early game is when discarding an honour is cheapest, because nobody has had time to develop a hand that needs the tile you are throwing. Late game the same discard can be a direct payment, which is why the order of your discards matters as much as their content — honour tiles out first, and let the dangerous suit tiles wait until you know more.'
        ]
      },
      {
        heading: 'Read the Discard Pile',
        body: [
          'Every discard is information. If three players are throwing away bamboo, the bamboo tiles you need are probably sitting in their hands or are still buried in the wall — and, more usefully, you have just learned which suit nobody wants. The pile tells you what is safe to throw and which suit is crowded.',
          'Watching the discards also helps you avoid discarding a tile that would complete an opponent’s hand.',
          'The most valuable reads come from what is *not* being discarded. A player who has thrown away every honour but keeps passing on a particular suit is signalling something. If a suit stops appearing on the table after a few turns, that is often because the people who could throw it are now collecting it, and the tiles you were hoping to draw from that suit are no longer coming.',
          'Combine the pile with what you see called. When a player pongs a tile, they have declared three of the four copies exist and two of them are on the table. That makes the fourth copy significantly safer for you to discard against them — and it also tells you their hand has committed to that direction, which is useful when you are deciding whether to push or fold.',
          'Keep a running count of one or two tiles you actually need rather than trying to track everything at once. If you are waiting on a 5 of bamboo and you have watched two of them go past, you know your wait is thin and it may be worth switching to a shape with more live tiles — a wider wait is often worth more than a prettier one.'
        ]
      },
      {
        heading: 'Do Not Over-Call',
        body: [
          'Calling tiles makes your hand open and closes off scoring patterns. In most rulesets a concealed hand is worth more, and an open hand loses access to the patterns that depend on being closed.',
          'A good rule for beginners: only call when the call puts you one or two tiles from ready. Otherwise keep drawing and keep your options open.',
          'There is a second cost that beginners rarely notice. Calling reveals your direction. The moment you pong two tiles of a suit, everyone at the table knows what you are building and will hold back the tiles you need — and will also stop throwing the tiles that would let you finish. A concealed hand gives nothing away and can change direction mid-deal; an open hand has publicly announced what it is.',
          'So weigh the call properly: it buys you speed, and it pays for that speed with information and with scoring potential. If the call takes you from three tiles away to one, it is usually worth it. If it takes you from four to three, you have given away your plan for almost nothing, and the correct play is to keep drawing.'
        ]
      },
      {
        heading: 'Reach Ready as Fast as You Can',
        body: [
          'The player who gets ready first usually wins. Trade tiles you cannot use for tiles you might use, and keep the shape flexible until the wall forces your hand.',
          'Our tables include a readiness hint that shows exactly how far you are from a complete hand, which trains you to see the distance without having to count it yourself. Watch what changes when you consider different discards — that is the fastest way to internalise hand-reading.',
          'Speed compounds. The earlier you are ready, the more draws you get at the tile you need, and the more chances you have to win before someone else does. A hand that becomes ready on turn eight has most of the wall left to work with; the same hand becoming ready on turn fourteen is relying on luck.',
          'There is a tension here worth understanding rather than resolving. Chasing the fastest possible readiness can push you toward a hand worth almost nothing, while chasing a big hand can mean never becoming ready at all. Most of the practical skill in mahjong lives in that trade-off: how much hand value you are willing to give up for how many turns of speed.',
          'A workable default for beginners is to aim for readiness first and let the points follow. Once you can reliably reach ready while the wall still has tiles in it, you have a foundation you can trade against; until then, a beautiful hand you never complete is worth exactly nothing.'
        ]
      },
      {
        heading: 'Know the Common Winning Patterns',
        body: [
          'These patterns appear constantly and are worth memorising:',
          '• All-simples (斷幺九): no 1s, 9s or honours. Reachable from almost any hand.',
          '• Flush (清一色): all tiles from one suit. Worth a lot of points.',
          '• All-triplets (碰碰胡): every set is a triplet.',
          '• Seven pairs (七對子): the classic alternative winning shape.',
          '• Dragon sets (三元牌): three dragons score in most rulesets.',
          'Learn these five and you will recognise most of the hands you actually see at a beginner table. They are not the full catalogue — Chinese Official alone has eighty-one patterns — but they are the ones that decide ordinary games, and recognising a pattern three turns early is what lets you steer toward it while everyone else is still discarding at random.'
        ],
        tiles: [{ "suit": 'dragon', "dragon": 'red' }, { "suit": 'dragon', "dragon": 'green' }, { "suit": 'dragon', "dragon": 'white' }, { "suit": 'char', "rank": 7 }, { "suit": 'char', "rank": 7 }]
      },
      {
        heading: 'Play Your Ruleset, Not a Generic Game',
        body: [
          'Hong Kong, Riichi and Chinese Official reward different things. Hong Kong values a quick, cheap three-faan hand; Riichi demands a yaku before you can win at all; Chinese Official sets an eight-point floor that rules out most beginners’ instincts. A strategy that wins in one is often wrong in another.',
          'Pick one ruleset and learn its patterns — switching between them too early is the fastest way to confuse yourself and to start applying the wrong rules mid-game.',
          'Concretely: the "discard lone honours first" advice above is straightforwardly right in Hong Kong and Chinese Official, but in Riichi a dragon pair is a route to a yaku and is worth keeping far longer than a beginner would guess. The advice is not wrong, it is conditional, and knowing which conditions apply is the difference between rules and strategy.',
          'Pick the style you can actually play with people — that usually means Hong Kong for a beginner — and stay with it until its scoring stops being something you have to think about. Fluency in one ruleset beats vague familiarity with three, and it makes learning the second one much faster later.',
          'If you are playing our tables, the practical version of all of this is: pick a direction by turn three, throw your lone honours, check the readiness hint before every discard from turn six onward, and call only when it takes you to one tile away. Do those four things consistently and you will beat bots that are individually better than you, because consistency is the whole game at this level.'
        ]
      },
    ],
    faq: [
      { question: 'What is the fastest way to reach tenpai?', answer: 'Commit to a direction in the first three turns, discard lone honours before suit tiles, and prefer discards that keep several tiles live. Chasing a specific rare tile early is the usual reason beginners stall short of ready.' },
      { question: 'Should I call tiles or stay concealed?', answer: 'Call when it brings you within one or two tiles of ready, and stay concealed otherwise. Calling reveals your direction and closes off concealed-hand bonuses, so a call that saves you a single draw is usually a bad trade.' },
      { question: 'How do I avoid dealing into another player’s hand?', answer: 'Watch what the other three are not discarding. A suit that stops appearing on the table is being collected, and a player who has called twice has announced their direction. Throw the suits that are already dead, and keep dangerous middle tiles until late.' },
      { question: 'Is winning about luck or skill?', answer: 'Over one hand it is mostly luck, and over a session it is mostly skill. The draws decide individual deals; your discard choices, direction and folding decide how often you are the one who converts a good draw into a win.' },
      { question: 'Which mahjong ruleset is easiest to win in?', answer: 'Hong Kong. A three-faan minimum is low enough that ordinary hands qualify, so a beginner who simply reaches ready quickly will win regularly rather than being blocked by a pattern requirement.' },
      { question: 'Why do I keep losing to the bots?', answer: 'Usually because you are changing direction mid-hand or holding tiles that help nothing. Bots play consistently, so the fix is consistency on your side: commit early, discard the tiles that build nothing, and stop calling for one-draw gains.' },
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
