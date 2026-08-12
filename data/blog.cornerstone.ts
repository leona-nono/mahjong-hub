import type { BlogPost } from './blog';

/**
 * Cornerstone SEO articles (10) — traffic drivers published under /blog/.
 * English full content here; title/description translations live in
 * data/blog.i18n.ts. Each article ends with a "Play Now" CTA back to the
 * game pages (content earns search traffic, game pages keep users and ads).
 */
export const cornerstonePosts: BlogPost[] = [
  {
    slug: 'mahjong-rules-beginners-complete-guide',
    title: 'Mahjong Rules for Beginners: The Complete Guide',
    description:
      'The complete beginner-friendly guide to mahjong rules. Learn the tiles, the wall, turns, calling, winning hands and scoring — with a plain-language ruleset comparison.',
    readMinutes: 12,
    keywords: 'mahjong for beginners, mahjong rules, learn mahjong, mahjong basics',
    heroTiles: [{"suit": 'wind', "wind": 'east'}, {"suit": 'dragon', "dragon": 'red'}, {"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 3}, {"suit": 'dot', "rank": 4}],
    cta: { label: 'Play Mahjong Now', href: '/games/classic' },
    sections: [
      {
        heading: 'Mahjong Rules in One Paragraph',
        body: [
          'Four players build hands from 144 tiles. Each turn you draw one tile and discard one, trying to complete four sets plus a pair. A set is a triplet or a sequence. When your hand is complete and meets the ruleset\u2019s minimum score, you declare a win. That is the whole game — everything else is detail.',
          'This guide walks through every piece of that paragraph so a brand-new player can sit down and play.'
        ]
      },
      {
        heading: 'The Tiles',
        body: [
          'A standard set has 144 tiles: 108 numbered tiles, 28 honours and 8 bonus tiles. The numbered tiles come in three suits — characters (wàn), bamboo (tiáo) and circles (tóng) — each numbered 1 to 9 with four copies.',
          'The honours are the four winds (East, South, West, North) and three dragons (Red, Green, White). Bonus tiles (flowers and seasons) appear in some rulesets and usually give a small bonus rather than forming sets.'
        ]
      },
      {
        heading: 'The Wall and Dealing',
        body: [
          'All tiles are shuffled face-down and stacked into a wall of 17 stacks per player. The dealer (East) rolls two dice to choose where to break the wall, then deals 13 tiles to every player. The dealer takes a 14th tile and discards first.',
          'Online, the wall is built and dealt for you automatically — you only manage your hand.'
        ]
      },
      {
        heading: 'Your Turn',
        body: [
          'On your turn, draw one tile, study your hand, and discard one tile face-up. You always hold 13 tiles. The discarded tile sits in the middle so everyone can see it — and so everyone can read your strategy.',
          'The rhythm of draw-and-discard is the same across every ruleset, which is why skills transfer between them.'
        ]
      },
      {
        heading: 'Building Sets: Pong, Chi and Kong',
        body: [
          'When another player discards a tile that would complete a set in your hand, you may call it instead of drawing:',
          '• Pong — three identical tiles. Callable from any player.',
          '• Chi — three consecutive tiles in one suit. Callable only from the player on your left.',
          '• Kong — four identical tiles. The most powerful call, worth bonus tiles in some rulesets.',
          'Calls expose your hand. An open hand is weaker in most scoring systems, so beginners should call sparingly.'
        ],
        tiles: [{"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}, {"suit": 'bamboo', "rank": 6}, {"suit": 'bamboo', "rank": 7}, {"suit": 'bamboo', "rank": 8}],
      },
      {
        heading: 'Winning Hands',
        body: [
          'A winning hand is four sets plus a pair. You win by self-draw (tsumo) or by taking another player\u2019s discard (ron).',
          'Rulesets also require a minimum score: three faan in Hong Kong style, one yaku in Japanese Riichi, eight points in Chinese Official. A complete hand below the minimum is not a winning hand — you keep improving it.'
        ]
      },
      {
        heading: 'The Main Rulesets Compared',
        body: [
          '• Hong Kong Mahjong — the easiest entry point. Three-faan minimum, forgiving scoring, the most widely played style outside Japan.',
          '• Japanese Riichi — competitive standard. Concealed hands and riichi declarations score higher; strict yaku requirements.',
          '• Chinese Official (MCR) — international tournament rules. An eight-point minimum demands real hand structure.',
          '• American / Taiwanese / Sichuan — regional variants with jokers, sixteen tiles, or no honours at all.',
          'Start with Hong Kong. When you can win reliably, try Riichi for depth or Chinese Official for structure.'
        ]
      },
      {
        heading: 'Try It Free',
        body: [
          'Reading rules only goes so far — the fastest way to learn is to play. Our Hong Kong table deals you in against three computer opponents with a readiness hint and a full score breakdown on every hand. It is completely free, in your browser, no download.'
        ]
      }
    ],
    faq: [
      { question: 'How long does it take to learn mahjong rules?', answer: 'You can learn the basic flow — draw, discard, build four sets and a pair — in about an hour. Scoring and strategy take longer, but the Hong Kong ruleset is gentle enough to learn while playing.' },
      { question: 'Do I need four people to play mahjong?', answer: 'In person, yes. Online, you can play against computer opponents anytime — our tables always seat three bots if you play alone.' },
      { question: 'What is the difference between a pong and a chi?', answer: 'A pong is three identical tiles and can be called from any player. A chi is three consecutive tiles in one suit and can only be called from the player on your left.' },
      { question: 'Is mahjong hard to win?', answer: 'The rules are simple; winning well takes practice. Choosing a hand direction early and not over-calling are the two habits that improve results fastest.' }
    ]
  },
  {
    slug: 'mahjong-tiles-meaning-guide',
    title: 'Mahjong Tiles and Their Meanings: The Complete Guide',
    description:
      'What do mahjong tiles mean? A full guide to the 144 tiles — suits, winds, dragons, flowers and seasons — with the symbols explained for beginners.',
    readMinutes: 8,
    keywords: 'mahjong tiles meaning, mahjong tiles, mahjong suit symbols, chinese mahjong tiles',
    heroTiles: [{"suit": 'char', "rank": 1}, {"suit": 'bamboo', "rank": 1}, {"suit": 'dot', "rank": 1}, {"suit": 'wind', "wind": 'east'}, {"suit": 'dragon', "dragon": 'red'}],
    cta: { label: 'Play Mahjong Now', href: '/games/classic' },
    sections: [
      {
        heading: 'The 144 Tiles at a Glance',
        body: [
          'A standard mahjong set contains 144 tiles divided into suits, honours and bonus tiles. Every tile appears four times in a suit (with a few exceptions for flowers and seasons), which is why matches and sets are possible at all.',
          'The chart below explains each group. Together they give the game its depth — you are always tracking what is in your hand, what is on the table and what is still in the wall.'
        ]
      },
      {
        heading: 'The Three Suits',
        body: [
          '• Characters (萬, wan) — the tile shows a number of Chinese characters, 1 through 9.',
          '• Bamboo (條, tiao) — the tile shows one to nine sticks of bamboo.',
          '• Circles (筒, tong) — the tile shows one to nine coins or dots.',
          'Each suit has four copies of each number, giving 36 tiles per suit and 108 numbered tiles in total. A set (sequence) is three consecutive numbers in the same suit, so suits matter for more than just looks.'
        ],
        tiles: [{"suit": 'char', "rank": 1}, {"suit": 'bamboo', "rank": 1}, {"suit": 'dot', "rank": 1}],
      },
      {
        heading: 'The Winds',
        body: [
          'The four winds are East, South, West and North. They are honour tiles — they cannot form sequences, only triplets. In many rulesets, a triplet of your seat wind or the round wind scores extra points.',
          'The dealer is always East, and turns rotate through South, West and North. The wind tiles are the only honours that map to something visible at the table.'
        ]
      },
      {
        heading: 'The Dragons',
        body: [
          'The three dragons are Red (中), Green (發) and White (白). Like winds, they only form triplets, but dragon triplets score in almost every ruleset — a red dragon triplet is one of the most reliable ways to reach a scoring minimum.',
          'A full hand with all three dragon triplets is a major scoring pattern in most games.'
        ]
      },
      {
        heading: 'Flowers and Seasons',
        body: [
          'Flowers and seasons are bonus tiles, used in some rulesets. Each player has one flower and one season; drawing your own grants bonus points and lets you draw a replacement tile from the wall.',
          'They are usually set aside immediately and never form part of a winning hand.'
        ]
      },
      {
        heading: 'Why Tile Meanings Matter',
        body: [
          'You do not need to memorise the artwork — the numbers and suits carry all the information. But knowing what each tile is worth (can it make a sequence? a triplet? a scoring pattern?) turns random drawing into a plan.',
          'Once the tiles are familiar, the rest of mahjong is pattern recognition and timing.'
        ]
      }
    ],
    faq: [
      { question: 'How many different mahjong tiles are there?', answer: 'There are 34 distinct tiles (9 characters, 9 bamboo, 9 circles, 4 winds, 3 dragons), and four copies of most, giving 144 tiles. Flowers and seasons add 8 more in sets that include them.' },
      { question: 'What do the three suits represent?', answer: 'Characters, bamboo and circles represent different denominations of coins in the game\u2019s historical Chinese origin. In play they are just three suits of 1\u20139.' },
      { question: 'Can honours form sequences?', answer: 'No. Winds and dragons can only form triplets, never sequences. That is why lone honours are usually discarded early.' },
      { question: 'What is the most valuable tile?', answer: 'There is no single most valuable tile — value depends on your hand and ruleset. Dragon triplets, your seat wind and rare suit tiles like 1 and 9 are generally the most useful.' }
    ]
  },
  {
    slug: 'american-vs-chinese-mahjong',
    title: 'American vs Chinese Mahjong: Key Differences Explained',
    description:
      'American mahjong and Chinese mahjong are very different games. Compare jokers, hand cards, scoring and tile counts to see which style suits you.',
    readMinutes: 7,
    keywords: 'american vs chinese mahjong, american mahjong rules, chinese mahjong rules',
    heroTiles: [{"suit": 'char', "rank": 1}, {"suit": 'wind', "wind": 'east'}, {"suit": 'dragon', "dragon": 'red'}],
    cta: { label: 'Play Chinese Mahjong Now', href: '/games/classic' },
    sections: [
      {
        heading: 'Two Games That Share a Name',
        body: [
          'Both games use mahjong tiles and both are played by four people, but American and Chinese mahjong diverged dramatically after mahjong reached the West in the 1920s. The card-driven American game plays more like a hand-building race; Chinese styles keep the draw-and-discard purity of the original.',
          'Here is what actually differs, so you can choose the style you will enjoy.'
        ]
      },
      {
        heading: 'The Hand Card vs. Open Patterns',
        body: [
          'The defining feature of American mahjong is the annual hand card, published each year by the National Mahjong League. It lists dozens of exact winning patterns; you must build one of them exactly to win. The patterns change every year, which keeps the game fresh but means the rules are not all discoverable from the tiles alone.',
          'Chinese mahjong uses fixed, universal scoring patterns — flushes, triplets, dragons — that have not changed for a century. The rules are the same whether you play in Beijing or online.'
        ]
      },
      {
        heading: 'Jokers and the Charleston',
        body: [
          'American mahjong uses jokers that can stand in for any tile, and a fixed opening exchange called the Charleston in which players pass tiles left, right and across in a set sequence. Both features add a trading phase that does not exist in Chinese mahjong.',
          'Chinese styles have no jokers and no passing — you play strictly from the tiles you are dealt.'
        ],
        tiles: [{"suit": 'wind', "wind": 'east'}, {"suit": 'wind', "wind": 'south'}, {"suit": 'wind', "wind": 'west'}, {"suit": 'wind', "wind": 'north'}],
      },
      {
        heading: 'Tiles, Turns and Calling',
        body: [
          'American mahjong includes flowers and seasons and has its own calling rules. Chinese mahjong (and its regional variants) keeps the classic pong / chi / kong calls and the draw-discard turn structure.',
          'Japanese Riichi and Chinese Official add their own twists — riichi declarations, the eight-point minimum — but they are recognisably the same family as the original Chinese game.'
        ]
      },
      {
        heading: 'Which Should You Play?',
        body: [
          'If you want a game with trading, jokers and a yearly metagame, American mahjong is a great social hobby. If you want the classic competitive game that transfers across countries and tournaments, Chinese mahjong — Hong Kong style first, then Riichi or Chinese Official — is the better path.',
          'You can play Chinese mahjong online for free right now and it will teach you the game the rest of the world plays.'
        ]
      }
    ],
    faq: [
      { question: 'Are American and Chinese mahjong played with the same tiles?', answer: 'The tile set is broadly the same, but American mahjong relies on jokers and the annual hand card, which Chinese mahjong does not use. Gameplay differs more than the tiles do.' },
      { question: 'Which is easier to learn, American or Chinese mahjong?', answer: 'Chinese mahjong has more discoverable rules because patterns are fixed and universal. American mahjong requires learning the yearly hand card, which changes each year.' },
      { question: 'Do I need the annual hand card to play American mahjong?', answer: 'Yes — the card defines the winning patterns for that year. Without it you cannot declare a valid win under American rules.' },
      { question: 'Can I play Chinese mahjong online for free?', answer: 'Yes. Our Hong Kong Mahjong table is free, in-browser, and teaches the classic draw-and-discard game against computer opponents.' }
    ]
  },
  {
    slug: 'how-to-play-mahjong-online',
    title: 'How to Play Mahjong Online: Free in Your Browser',
    description:
      'Play mahjong online free — no download, no install. Learn where to play, how the online rules work, and the etiquette of playing against bots and strangers.',
    readMinutes: 6,
    keywords: 'how to play mahjong online, mahjong online free, play mahjong online',
    heroTiles: [{"suit": 'bamboo', "rank": 6}, {"suit": 'bamboo', "rank": 7}, {"suit": 'bamboo', "rank": 8}, {"suit": 'dragon', "dragon": 'green'}],
    cta: { label: 'Play Free Now', href: '/games/classic' },
    sections: [
      {
        heading: 'Why Play Mahjong Online',
        body: [
          'Online mahjong removes the hardest part of the game for beginners: administration. The computer builds the wall, deals the tiles, handles calls and calculates scores. You focus entirely on your hand.',
          'It is also the only way most people can play whenever they want — no need to gather three friends around a table.'
        ]
      },
      {
        heading: 'What You Need',
        body: [
          'Just a browser and an internet connection. There is nothing to install on desktop or mobile. Our tables run in the browser on any modern device and work with touch or mouse.',
          'No account is needed to start playing, and every game is completely free — there is no wagering or purchasable currency.'
        ]
      },
      {
        heading: 'How an Online Game Works',
        body: [
          'You join a table and the game deals you 13 tiles. On your turn you click a tile to draw, then click a tile to discard. The game highlights tiles you can call and shows when your hand can win.',
          'An optional readiness hint shows how far your hand is from a complete shape, which is the single most useful tool for learning.'
        ],
        tiles: [{"suit": 'bamboo', "rank": 6}, {"suit": 'bamboo', "rank": 7}, {"suit": 'bamboo', "rank": 8}, {"suit": 'dragon', "dragon": 'green'}],
      },
      {
        heading: 'Bots vs. Human Opponents',
        body: [
          'Playing against computer opponents is ideal for learning: bots play at a steady pace, never stall, and never get impatient while you think. Our tables always seat three bots, so you can play alone any time.',
          'When you are ready for human opponents, the same skills apply — online rules are the same as table rules.'
        ]
      },
      {
        heading: 'Online Mahjong Etiquette',
        body: [
          'Take your turn promptly. Call only when you really want the tile. Do not rush others. And in casual games, remember the goal is fun — nobody wins every hand.',
          'The one rule that matters most online: stay engaged. A stalled table is the only true annoyance.'
        ]
      },
      {
        heading: 'Start Playing Now',
        body: [
          'Ready to try it? Our Hong Kong Mahjong table deals you in against three bots with scoring explained on every hand. It is free, instant, and the fastest way to go from rules to real games.'
        ]
      }
    ],
    faq: [
      { question: 'Is online mahjong free?', answer: 'On our site, yes — completely free, no account, no wagering, nothing to download. You can play in your browser on desktop or mobile.' },
      { question: 'Do I need to know the rules before playing online?', answer: 'It helps to know the basics, but online tables handle calls and scoring automatically. You can learn while playing, with the readiness hint guiding you.' },
      { question: 'Can I play mahjong online alone?', answer: 'Yes. Our tables always seat three computer opponents, so you can play a full four-player game by yourself any time.' },
      { question: 'Is playing mahjong online the same as in person?', answer: 'The rules are identical. The only difference is that the computer handles dealing, calling and scoring — which actually makes it easier to focus on strategy.' }
    ]
  },
  {
    slug: 'best-mahjong-sets-for-beginners',
    title: 'The Best Mahjong Sets for Beginners in 2026',
    description:
      'What to look for in a first mahjong set: tile size, material, travel cases and the right accessories. Practical buying advice so you start with the right tiles.',
    readMinutes: 6,
    keywords: 'best mahjong sets for beginners, mahjong set buying guide, mahjong tiles set',
    heroTiles: [{"suit": 'wind', "wind": 'east'}, {"suit": 'wind', "wind": 'south'}, {"suit": 'wind', "wind": 'west'}, {"suit": 'wind', "wind": 'north'}],
    cta: { label: 'Play Online Instead', href: '/games/classic' },
    sections: [
      {
        heading: 'What to Look For',
        body: [
          'A good beginner set needs three things: readable tiles, a full 144-tile count, and a case that survives being played. Everything else is preference.',
          'Tile size matters most. Standard tiles are 28\u201334mm across the face. Bigger tiles are easier to read and to pick up, and are worth the extra table space if you play casually.'
        ]
      },
      {
        heading: 'Tile Material: Bakelite, Resin and More',
        body: [
          'Classic sets are made from bone-and-bamboo, but modern sets use resin, plastic or melamine. Good-quality resin tiles have crisp, painted faces that do not wear off. Cheap plastic tiles can chip at the corners and fade.',
          'For a first set, choose solid-colour resin or melamine tiles with a frosted back — they shuffle well and last for years.'
        ],
        tiles: [{"suit": 'dot', "rank": 1}, {"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 3}, {"suit": 'dot', "rank": 4}],
      },
      {
        heading: 'Tile Count and Size',
        body: [
          'Make sure the set has 144 tiles. Many modern sets include flowers and seasons (8 bonus tiles) on top of the 136 core tiles. If you plan to play American mahjong, you also need jokers.',
          'A 144-tile set covers Hong Kong, Riichi and Chinese Official play. A 152-tile set adds flowers and seasons if your ruleset uses them.'
        ]
      },
      {
        heading: 'Travel and Storage Cases',
        body: [
          'A rigid case or bag protects the tiles and keeps the table tidy between games. Look for a case with a divider for each tile type — it makes setting up the next game dramatically faster.',
          'A collapsible playing mat is a worthwhile add-on: it keeps tiles from sliding and protects the table surface.'
        ]
      },
      {
        heading: 'Recommended Accessories',
        body: [
          'A dice cup, scoring sticks or a scorepad, and a tile pusher (rack) are the usual extras. For beginners, scoring sticks are the clearest way to keep track of wins.',
          'Some sets bundle two racks per player — convenient for beginners who like to arrange their hand.'
        ]
      },
      {
        heading: 'Try Before You Buy',
        body: [
          'Not sure a physical set is right for you yet? You can learn the game free online against computer opponents — including the exact same Hong Kong ruleset most physical sets are built for — and buy a set once you are hooked.'
        ]
      }
    ],
    faq: [
      { question: 'How many tiles should a beginner mahjong set have?', answer: 'Buy a 144-tile set. It covers all the standard styles, and the four-of-each-tile structure is what makes the game work.' },
      { question: 'What is the best tile size for beginners?', answer: '34mm tiles are the most comfortable for casual players. They are larger and easier to read than 28mm tournament tiles.' },
      { question: 'Are expensive mahjong sets worth it?', answer: 'For a first set, no. A solid mid-price resin set with crisp faces is enough. Upgrade once you know you play often.' },
      { question: 'Do I need flowers and seasons?', answer: 'Only if your ruleset uses them. Hong Kong and Riichi do not require flowers; Chinese Official and some variants do. A 144-tile set with flowers covers the most ground.' }
    ]
  },
  {
    slug: 'mahjong-scoring-system-explained',
    title: 'Mahjong Scoring System Explained: Faan, Han and Points',
    description:
      'How mahjong scoring works across rulesets: faan in Hong Kong, han in Riichi, points in Chinese Official. The common patterns and how to count your hand.',
    readMinutes: 8,
    keywords: 'mahjong scoring, mahjong points, mahjong faan, mahjong han, mahjong scoring system',
    heroTiles: [{"suit": 'dragon', "dragon": 'red'}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}, {"suit": 'char', "rank": 7}],
    cta: { label: 'See Scoring in Action', href: '/games/classic' },
    sections: [
      {
        heading: 'Every Ruleset Has a Minimum',
        body: [
          'In every mahjong ruleset, a winning hand must reach a minimum score before it can be declared. The names differ — faan in Hong Kong, han in Riichi, points in Chinese Official — but the idea is the same: a hand must contain enough structure to count as a win.',
          'This minimum is what stops every hand from being a boring race to the first complete shape.'
        ]
      },
      {
        heading: 'The Basic Winning Shape',
        body: [
          'The foundation is always four sets plus a pair. Sets can be triplets or sequences. On top of that base, patterns add value:',
          '• Flush — all tiles from one suit.',
          '• All-triplets — every set is a triplet.',
          '• All-simples — no 1s, 9s or honours.',
          '• Dragon triplets — three dragons in a hand.',
          '• Seven pairs — an alternative winning shape in most rulesets.'
        ]
      },
      {
        heading: 'Hong Kong Faan',
        body: [
          'Hong Kong style requires three faan minimum. Common patterns and their value: a pure suit hand (3), all-triplets (3), all-simples (1), a dragon triplet (1\u20133). Hands stack — a flush with a dragon triplet is worth more than either alone.',
          'The scoring table rewards clean, deliberate hands. Cheap hands are reliable but slow; ambitious hands score big but rarely come together.'
        ],
        tiles: [{"suit": 'dragon', "dragon": 'red'}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}],
      },
      {
        heading: 'Japanese Han and Riichi',
        body: [
          'Riichi scoring adds yaku (fixed patterns) on top of han. Riichi itself is a yaku — declaring it on tenpai adds one han and is the signature of the ruleset. Concealed hands score much higher, which rewards patience.',
          'The readiness (tenpai) position matters in Riichi too: you can declare riichi, or stay silent and score differently. Understanding han is the key to choosing.'
        ]
      },
      {
        heading: 'Chinese Official Points (MCR)',
        body: [
          'Chinese Official uses an eight-point minimum with a large catalogue of patterns worth 1 to 88 points. Flush hands, all-triplets and the rarest patterns stack quickly.',
          'The high minimum forces genuine structure — a seven-pairs hand or a flush is usually needed, which is why MCR players plan their hand from the first tiles.'
        ]
      },
      {
        heading: 'Let the Table Score for You',
        body: [
          'When you play online, the table calculates your score and explains exactly where every point came from after each win. It is the fastest way to learn the scoring table — you see the patterns you built and what they earned, hand after hand.'
        ]
      }
    ],
    faq: [
      { question: 'What is the difference between faan, han and points?', answer: 'They are the same idea under different names: a score attached to patterns in a winning hand. Hong Kong uses faan, Riichi uses han, Chinese Official uses points.' },
      { question: 'How many points do I need to win mahjong?', answer: 'Hong Kong needs three faan, Japanese Riichi needs at least one yaku, and Chinese Official needs eight points. Each ruleset defines its own minimum.' },
      { question: 'What is the easiest way to learn mahjong scoring?', answer: 'Play online where the table calculates and explains every score. Seeing the breakdown after each win teaches the patterns far faster than memorising a table.' },
      { question: 'Which patterns score the most?', answer: 'Rare, structured hands score most: pure-suit (flush) hands, all-triplets, and special shapes like seven pairs or thirteen orphans are among the highest-value patterns.' }
    ]
  },
  {
    slug: 'types-of-mahjong-games',
    title: 'Types of Mahjong Games: Every Style Explained',
    description:
      'From Hong Kong and Riichi to American, Taiwanese and Sichuan — compare the major types of mahjong games and find the style that fits you.',
    readMinutes: 7,
    keywords: 'types of mahjong, mahjong variants, mahjong styles, different mahjong games',
    heroTiles: [{"suit": 'char', "rank": 1}, {"suit": 'bamboo', "rank": 1}, {"suit": 'dot', "rank": 1}, {"suit": 'wind', "wind": 'west'}],
    cta: { label: 'Try Hong Kong Mahjong', href: '/games/classic' },
    sections: [
      {
        heading: 'One Name, Many Games',
        body: [
          'Mahjong split into distinct regional games as it spread from China. They share tiles and the draw-and-discard core, but scoring, calling and even the number of tiles differ. Choosing a style is a real choice — here is the map.'
        ]
      },
      {
        heading: 'Hong Kong Mahjong',
        body: [
          'The most widely played style outside Japan and the best entry point for beginners. Three-faan minimum, simple scoring, fast games. If you want one style to learn first, make it this one.'
        ],
        tiles: [{"suit": 'wind', "wind": 'east'}, {"suit": 'dragon', "dragon": 'red'}],
      },
      {
        heading: 'Japanese Riichi Mahjong',
        body: [
          'The competitive standard. Riichi declarations, strict yaku, concealed-hand bonuses and red fives. Deeper and slower than Hong Kong style — the chess of mahjong, rewarding study and patience.'
        ]
      },
      {
        heading: 'Chinese Official (MCR)',
        body: [
          'The international tournament ruleset with an eight-point minimum and a huge pattern catalogue. Demanding and structured; a hand must earn its win. Popular in Chinese-speaking communities and competitions.'
        ]
      },
      {
        heading: 'American Mahjong',
        body: [
          'Uses jokers, flowers, the Charleston pass and an annual hand card published by the National Mahjong League. Social and card-driven — the rules change every year. A very different experience from the Asian styles.'
        ]
      },
      {
        heading: 'Taiwanese Mahjong',
        body: [
          'Played with sixteen tiles instead of thirteen, so you build five sets and a pair. Flower replacement and tài-based scoring add unusual depth. A good next step after you master thirteen-tile play.'
        ]
      },
      {
        heading: 'Sichuan Mahjong',
        body: [
          'A fast "bloody battle" variant with no honours, a mandatory voided suit, and continued play after each win. Games are quick and aggressive — ideal for casual players who like pace.'
        ]
      },
      {
        heading: 'Mahjong Solitaire',
        body: [
          'Not mahjong at all — a single-player tile-matching puzzle where you clear a layered layout by matching identical tiles. Great for relaxing, but share nothing with the four-player game except the tiles.'
        ]
      }
    ],
    faq: [
      { question: 'What is the most popular type of mahjong?', answer: 'Hong Kong style is the most widely played outside Japan, and Japanese Riichi dominates competitive play. In China, Sichuan and Chinese Official are popular.' },
      { question: 'Which mahjong style is easiest for beginners?', answer: 'Hong Kong Mahjong. Its three-faan minimum and forgiving scoring make it the gentlest entry point before moving to Riichi or Chinese Official.' },
      { question: 'Are all mahjong variants played with four players?', answer: 'Yes, the four-player game is the standard. Mahjong solitaire is the exception — it is a single-player puzzle, not a mahjong variant.' },
      { question: 'Do I need different tiles for different mahjong types?', answer: 'A standard 144-tile set covers Hong Kong, Riichi and Chinese Official. American mahjong needs jokers; Taiwanese and Sichuan have their own conventions.' }
    ]
  },
  {
    slug: 'mahjong-etiquette-tips',
    title: 'Mahjong Etiquette: The Unwritten Rules of the Table',
    description:
      'Learn the etiquette of mahjong — how to handle tiles, when to call, reading the flow, and the social rules that keep the table friendly.',
    readMinutes: 5,
    keywords: 'mahjong etiquette, mahjong table manners, how to behave playing mahjong',
    heroTiles: [{"suit": 'wind', "wind": 'east'}, {"suit": 'wind', "wind": 'south'}, {"suit": 'wind', "wind": 'west'}, {"suit": 'wind', "wind": 'north'}, {"suit": 'dragon', "dragon": 'white'}],
    cta: { label: 'Play a Friendly Game', href: '/games/classic' },
    sections: [
      {
        heading: 'Etiquette Is What Makes the Game Playable',
        body: [
          'Mahjong is a social game. The unwritten rules exist so everyone can read the table, think in peace, and enjoy the session. Most are simple: respect the turn order, keep your tiles to yourself, and never rush another player.'
        ]
      },
      {
        heading: 'Handle the Tiles With Care',
        body: [
          'Draw and discard one tile at a time. Do not sweep tiles across the table, and never rearrange another player\u2019s discards. Online, this translates to: take your turn without dragging the game — a slow but steady player is better than a fast sloppy one.'
        ],
        tiles: [{"suit": 'dot', "rank": 1}, {"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 3}, {"suit": 'dot', "rank": 4}],
      },
      {
        heading: 'Call With Confidence, Not Habit',
        body: [
          'Calling a tile announces your hand to the table. Etiquette (and good strategy) says call only when the tile genuinely helps. Repeatedly calling and discarding weak tiles reads as inexperience and gives the table free information.'
        ]
      },
      {
        heading: 'Read the Flow, Not Just the Tiles',
        body: [
          'Watch the rhythm of discards. A player who pauses before discarding is deciding — usually near a win. Respect the tension of a late game and think before you discard a dangerous tile.'
        ]
      },
      {
        heading: 'Winning and Losing Gracefully',
        body: [
          'Wins and losses are part of a session. Thank the player who feeds a winning tile, and do not dwell on a bad beat. In friendly games the goal is the session, not the score.'
        ]
      },
      {
        heading: 'Online Etiquette',
        body: [
          'Online the same rules apply: take turns promptly, play honestly, and remember bots are patient but humans are not. Our tables never stall and never judge your pace — the ideal place to learn good habits.'
        ]
      }
    ],
    faq: [
      { question: 'Can I look at other players\u2019 discards?', answer: 'Yes — the discard pile is public information in every ruleset. Reading it is not just allowed, it is expected.' },
      { question: 'Is it rude to take time on my turn?', answer: 'A reasonable pause is fine, especially late in a hand. The etiquette issue is stalling or rushing. Most casual tables are relaxed about pace.' },
      { question: 'Should I announce my calls?', answer: 'Yes — announce pong, chi or kong clearly so the table can react. Online tables do this for you automatically.' },
      { question: 'What is the most important etiquette rule?', answer: 'Respect the flow of the game: take turns in order, keep discards clean, and never expose another player\u2019s tiles or your own until the hand ends.' }
    ]
  },
  {
    slug: 'where-to-buy-mahjong-set',
    title: 'Where to Buy a Mahjong Set Online',
    description:
      'Where to buy a mahjong set online: what shops carry, how to check quality, price ranges, and what to avoid when buying your first set.',
    readMinutes: 6,
    keywords: 'buy mahjong online, where to buy mahjong set, mahjong set price',
    heroTiles: [{"suit": 'dot', "rank": 1}, {"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 3}, {"suit": 'dot', "rank": 4}, {"suit": 'dot', "rank": 5}],
    cta: { label: 'Play Online for Free', href: '/games/classic' },
    sections: [
      {
        heading: 'What You Are Actually Buying',
        body: [
          'A mahjong set is tiles plus a case. Within that, quality varies enormously — a 144-tile resin set can cost as little as ¥100 or as much as ¥1,500+ for bone-and-bamboo craftsmanship. For your first set, the sweet spot is a well-made resin or melamine set.'
        ]
      },
      {
        heading: 'Online Marketplaces',
        body: [
          'The major online marketplaces all carry mahjong sets: general marketplaces for budget and mid-range sets, and specialty shops for premium hand-made tiles. Filter by "144 tiles" and read reviews that mention tile size and paint quality.',
          'Look for listings that state the tile count explicitly. Many budget listings sell 108-tile or incomplete sets without saying so.'
        ]
      },
      {
        heading: 'What to Check in Reviews',
        body: [
          '• Does the case hold the tiles securely?',
          '• Are the faces painted or printed? Printed faces can wear off.',
          '• Is the tile size stated and comfortable?',
          '• Do the backs match exactly? Mismatched backs are a common cheap-set flaw.',
          'Reviews that mention these four points are the ones to trust.'
        ]
      },
      {
        heading: 'Price Ranges',
        body: [
          '• ¥100\u2013¥300 — serviceable plastic or light resin sets. Fine for casual play.',
          '• ¥300\u2013¥800 — solid resin with crisp faces and a good case. The beginner sweet spot.',
          '• ¥800+ — premium and vintage sets. Only worth it if you know you play often.',
          'Spend at the middle tier for your first set and you will not regret it.'
        ],
        tiles: [{"suit": 'dot', "rank": 1}, {"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 3}],
      },
      {
        heading: 'Try the Game Before You Commit',
        body: [
          'A mahjong set is a purchase you will keep for years — but only if you enjoy the game. Play a few free hands online first, learn whether you like the rhythm, and then invest in tiles. If you decide you love it, the online set recommendation is still the right place to start.'
        ]
      }
    ],
    faq: [
      { question: 'How much should I spend on a first mahjong set?', answer: 'Plan ¥300\u2013¥800 for a solid resin set with a good case. Budget sets under ¥300 often have thin tiles or printed faces that wear quickly.' },
      { question: 'What is a fair price for a 144-tile mahjong set?', answer: 'A reliable 144-tile resin set with case typically runs ¥300\u2013¥600 on major marketplaces. Premium bone-and-bamboo sets cost several times more.' },
      { question: 'Are cheap mahjong sets worth buying?', answer: 'For occasional play, a budget set is fine. Just confirm it has 144 tiles and check reviews for paint and back-matching complaints.' },
      { question: 'Should I buy a mahjong set before learning to play?', answer: 'Not necessarily. You can learn the game free online first and buy a set once you are sure you enjoy it — then the purchase is an investment, not a gamble.' }
    ]
  },
  {
    slug: 'mahjong-history-cultural-guide',
    title: 'The History of Mahjong: From Qing Dynasty China to the World',
    description:
      'The fascinating history of mahjong — its origins in 19th-century China, the 1920s Western craze, its reinvention in Japan and America, and where it stands today.',
    readMinutes: 8,
    keywords: 'mahjong history, history of mahjong, mahjong origins, mahjong culture',
    heroTiles: [{"suit": 'char', "rank": 1}, {"suit": 'wind', "wind": 'east'}, {"suit": 'dragon', "dragon": 'green'}, {"suit": 'bamboo', "rank": 9}],
    cta: { label: 'Play the Classic Game', href: '/games/classic' },
    sections: [
      {
        heading: 'Origins in Qing Dynasty China',
        body: [
          'Mahjong emerged in China in the mid-19th century, most likely around Shanghai or Ningbo. It borrowed the card-game logic of earlier Chinese games and translated it into tiles — a format that let it survive the banning of many gambling games.',
          'By the 1890s it was a fixture of Shanghai\u2019s teahouses, spreading outward along trade routes.'
        ]
      },
      {
        heading: 'The 1920s Western Craze',
        body: [
          'Mahjong reached the United States in the early 1920s and became a genuine social phenomenon — the "mahjong craze". Hundreds of thousands of sets were sold, and American players quickly invented their own conventions, including the Charleston and later the annual hand card.',
          'The Chinese game also travelled to Japan, where it was refined into the Riichi ruleset that now dominates competitive play.'
        ]
      },
      {
        heading: 'Regional Reinvention',
        body: [
          'As mahjong spread it became many games. Japan built Riichi with its strict yaku and concealed-hand scoring. Taiwan developed the sixteen-tile game. Sichuan created the fast "bloody battle" variant. America kept the card-driven style that diverged furthest from the original.',
          'Each version kept the draw-and-discard core but rebuilt the scoring and strategy around local taste.'
        ],
        tiles: [{"suit": 'wind', "wind": 'east'}, {"suit": 'wind', "wind": 'south'}, {"suit": 'wind', "wind": 'west'}, {"suit": 'wind', "wind": 'north'}],
      },
      {
        heading: 'Competitive Mahjong Today',
        body: [
          'The 21st century brought competitive mahjong: professional Riichi leagues, the Mahjong Competition Rules (MCR) for international play, and a worldwide online scene. Mahjong has also appeared in esports-adjacent events and streaming, reaching a new generation.',
          'Today the game is played on nearly every continent, in clubs, online platforms and at home.'
        ]
      },
      {
        heading: 'The Cultural Meaning of Mahjong',
        body: [
          'In East Asia, mahjong is more than a game — it is a social ritual. Families gather around the table during holidays, and the game is a common bond across generations. In the West it carried a different weight, as a symbol of the exotic that became a beloved hobby.',
          'That dual life — deeply traditional yet endlessly adaptable — is exactly why mahjong survived and spread.'
        ]
      },
      {
        heading: 'Play the History',
        body: [
          'You can play the same classic game that swept Shanghai, Japan and the world — for free, online, against three computer opponents. The tiles you see are the same tiles players have been drawing for nearly two centuries.'
        ]
      }
    ],
    faq: [
      { question: 'Where was mahjong invented?', answer: 'Mahjong originated in China in the mid-19th century, most likely around Shanghai or Ningbo, from earlier Chinese card games translated into tiles.' },
      { question: 'Why did mahjong become popular in the West?', answer: 'The 1920s "mahjong craze" brought it to the US as a fashionable social game, and Western players developed their own variants like the Charleston and the annual hand card.' },
      { question: 'Is mahjong the same game everywhere?', answer: 'No. Chinese, Japanese, American, Taiwanese and Sichuan mahjong are distinct games sharing a core of tiles, drawing and discarding.' },
      { question: 'How old is mahjong?', answer: 'Around 150 years old. It emerged in mid-19th-century China and has been reinvented by every culture that adopted it.' }
    ]
  }
];
