import type { BlogPost } from './blog';

/**
 * Cornerstone SEO articles (12) — traffic drivers published under /blog/.
 * English full content here; title/description translations live in
 * data/blog-i18n/{locale}.json. Each article ends with a "Play Now" CTA back to the
 * game pages (content earns search traffic, game pages keep users and ads).
 */
export const cornerstonePosts: BlogPost[] = [
  {
    slug: 'mahjong-rules-beginners-complete-guide',
    title: 'Mahjong Rules for Beginners: The Complete Guide',
    description:
      'The complete beginner-friendly guide to mahjong rules. Learn the tiles, the wall, turns, calling, winning hands and scoring — plus a full hand played turn by turn, what happens when nobody wins, and how to choose your first ruleset.',
    readMinutes: 11,
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
          'The honours are the four winds (East, South, West, North) and three dragons (Red, Green, White). Bonus tiles (flowers and seasons) appear in some rulesets and usually give a small bonus rather than forming sets.',
          'The arithmetic behind the set is worth memorising, because it explains half of mahjong strategy. Three suits × nine ranks × four copies = 108 number tiles. Seven honour types × four copies = 28. Add eight bonus tiles and you arrive at 144. Every tile exists exactly four times, which means that the moment you can account for three of them — in your hand, in an exposed set, or face-up in the discard pool — the fourth is the only one still live. That single fact is what turns guessing into counting.'
        ]
      },
      {
        heading: 'The Wall and Dealing',
        body: [
          'All tiles are shuffled face-down and stacked into a wall of 17 stacks per player. The dealer (East) rolls two dice to choose where to break the wall, then deals 13 tiles to every player. The dealer takes a 14th tile and discards first.',
          'Online, the wall is built and dealt for you automatically — you only manage your hand.',
          'The wall is not scenery — it is a countdown. After the deal, around ninety tiles remain stacked, which works out to roughly twenty turns per player. Once the wall drops to its last few stacks, every player at the table knows the hand is nearly over, and cautious players stop feeding tiles to opponents. Online tables usually display the live wall count for exactly this reason: it tells you whether you still have time to finish a big hand or should settle for the small one you already have.'
        ]
      },
      {
        heading: 'Your Turn',
        body: [
          'On your turn, draw one tile, study your hand, and discard one tile face-up. You always hold 13 tiles. The discarded tile sits in the middle so everyone can see it — and so everyone can read your strategy.',
          'The rhythm of draw-and-discard is the same across every ruleset, which is why skills transfer between them.',
          'Notice what is not a decision: the draw. You do not choose which tile arrives. The only real choice you make each turn is which tile to let go of — and that choice speaks to all three opponents at once. Discarding an honour early tells them you have no use for honours. Switching suits mid-hand announces that you changed direction. Experienced players read the discard pools the way a poker player reads bets: the tiles you threw away describe the hand you are trying to build.'
        ]
      },
      {
        heading: 'Building Sets: Pong, Chi and Kong',
        body: [
          'When another player discards a tile that would complete a set in your hand, you may call it instead of drawing:',
          '• Pong — three identical tiles. Callable from any player.',
          '• Chi — three consecutive tiles in one suit. Callable only from the player on your left.',
          '• Kong — four identical tiles. The most powerful call, worth bonus tiles in some rulesets.',
          'Calls expose your hand. An open hand is weaker in most scoring systems, so beginners should call sparingly.',
          'The real trade is speed against value. Calling a pong hands you a finished set immediately, which shortens the game and gets you closer to a win. It also announces your target, removes your ability to change plans, and usually costs you the concealed-hand bonuses that make the biggest hands possible. The habit that works in Hong Kong style: call when the tile clearly completes a hand you have already committed to, and let it pass while you are still deciding what to build.'
        ],
        tiles: [{"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}, {"suit": 'bamboo', "rank": 6}, {"suit": 'bamboo', "rank": 7}, {"suit": 'bamboo', "rank": 8}],
      },
      {
        heading: 'Your First Hand, Turn by Turn',
        body: [
          'Rules explained in the abstract are hard to remember; a single hand is much easier. Here is how one deal unfolds in the Hong Kong style, from the wall to the winning tile.',
          'You are East, so you take fourteen tiles and discard first. Your opening thirteen hold a 1-2-3 run of characters, a 6-7-8 run of bamboo, a 4-5-5 in dots, a single East wind and three tiles that belong to nothing: a North wind, a Red dragon and a 9 dot. The fourteenth tile is a stray 8 dot, so it goes straight out. The next few discards are housekeeping rather than strategy — out go the North wind, the Red dragon and the 9 dot, and any junk you draw along the way leaves the same way. You are not choosing between clever plans; you are clearing tiles that cannot help you.',
          'The hand is really decided in the middle turns. You draw a 3 dot, and the awkward 4-5-5 becomes a 3-4-5 run with a 5 dot left over — now you need one more set and a pair. Two turns later a second 5 dot arrives and the leftover becomes a pair. Then the second and third East winds come in, and the hand is complete: three runs, a triplet of East, and a pair of 5 dots. East is your seat wind, so that triplet is worth points in most rulesets. Across the whole hand, only two decisions mattered — which suits to commit to, and whether to call a discarded tile that would have finished a set but exposed your hand. Everything else was arithmetic and patience.'
        ],
        tiles: [{"suit": 'char', "rank": 1}, {"suit": 'char', "rank": 2}, {"suit": 'char', "rank": 3}, {"suit": 'bamboo', "rank": 6}, {"suit": 'bamboo', "rank": 7}, {"suit": 'bamboo', "rank": 8}, {"suit": 'dot', "rank": 3}, {"suit": 'dot', "rank": 4}, {"suit": 'dot', "rank": 5}, {"suit": 'wind', "wind": 'east'}, {"suit": 'wind', "wind": 'east'}, {"suit": 'wind', "wind": 'east'}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}],
      },
      {
        heading: 'Winning Hands',
        body: [
          'A winning hand is four sets plus a pair. You win by self-draw (tsumo) or by taking another player\u2019s discard (ron).',
          'Rulesets also require a minimum score: three faan in Hong Kong style, one yaku in Japanese Riichi, eight points in Chinese Official. A complete hand below the minimum is not a winning hand — you keep improving it.',
          'The first real disappointment in mahjong is not losing — it is completing the shape and being told it is not enough. Hong Kong style asks for three faan; Chinese Official asks for eight points; Riichi asks for at least one yaku. Beginners who assemble four sets and a pair out of ordinary tiles discover they hold a valid shape worth nothing. The fix is not to play harder, it is to plan earlier: decide within the first few turns which scoring element you are steering toward — a dragon triplet, your seat wind, a single-suit hand, seven pairs — and then let that decision choose your discards instead of the other way round.'
        ]
      },
      {
        heading: 'When Nobody Wins: Draws, Dead Walls and Fouls',
        body: [
          'Not every hand ends with a winner. When the wall runs out and nobody has completed a hand, the deal ends as an exhaustive draw: the round is abandoned and no score is awarded. In Hong Kong style this is usually treated as a washout and the same dealer continues. Japanese Riichi handles it differently — players who were waiting on a winning tile can still collect small payments, which is why experienced Riichi players watch the wall count as closely as they watch the discards.',
          'A few special situations can end a deal early. Four players declaring riichi, four kongs on the table at once, or an opening hand holding nine different terminal and honour tiles can all stop play by rule. None of them award a win; they simply reset the round. Treat them as the game telling you that this particular deal had no answer, and that the next one starts fresh.',
          'Fouls are handled differently. An exposed wrong tile, an incorrect draw, or a hand revealed before it is complete is settled by penalty rather than argument — and the penalty depends entirely on where you are playing. At a physical table, agree the rules before the first tile is dealt, because there is no referee. Online tables remove the problem almost entirely: the software will not let you discard out of turn or draw twice. That is one quiet advantage of learning on a screen — the rules enforce themselves while you concentrate on the play.'
        ]
      },
      {
        heading: 'Choosing Your First Ruleset',
        body: [
          'Every style in this guide shares the paragraph you read at the top: draw a tile, discard a tile, build four sets and a pair. What changes between rulesets is what counts as a good hand, how fast the game moves, and how severely a mistake is punished. That sounds like a small difference. It decides which style you should learn first.',
          'Start with Hong Kong style. The three-faan minimum is forgiving, the scoring is compact enough to absorb in an afternoon, and it is the style most commonly played outside Japan — so it is the one you are most likely to meet at a real table. Move to Japanese Riichi when you want depth and do not mind losing often while you learn. Move to Chinese Official when you want structure and long-range planning. Sichuan, Taiwanese and American styles each change the shape of the game itself — sixteen tiles, no honours at all, jokers and an annual hand card — and they are better treated as second languages than as starting points.',
          'One practical note for playing online: pick the table that matches the style you are learning, not the one with the nicest interface. Habits formed in the wrong ruleset are hard to unlearn, and a player who learns to call tiles freely in Sichuan style will find Riichi brutally unforgiving. We keep a separate side-by-side comparison of all six styles if you want the differences collected in one place instead of spread across prose.'
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
      { question: 'Is mahjong hard to win?', answer: 'The rules are simple; winning well takes practice. Choosing a hand direction early and not over-calling are the two habits that improve results fastest.' },
      { question: 'What happens if nobody wins a hand?', answer: 'The deal ends in an exhaustive draw. The wall empties, the round is abandoned and no score is awarded. Hong Kong style usually lets the same dealer continue; Japanese Riichi still pays small amounts to players who were waiting on a winning tile.' },
      { question: 'Do all mahjong styles use the same tiles?', answer: 'Most of them do. A standard 144-tile set covers Hong Kong, Riichi and Chinese Official play. American mahjong adds jokers and uses a 152-tile set, while Sichuan style removes the honour tiles altogether.' },
      { question: 'Can I play mahjong by myself?', answer: 'Yes. Mahjong needs four seats, not four people. Our Hong Kong table seats three computer opponents, so a single player can learn the whole flow with hints and a full score breakdown after every hand.' }
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
          'There are five groups in the set: three numbered suits, four winds, three dragons and the bonus tiles. Each group behaves differently — some tiles can form sequences, some can only form triplets, and a few never enter a winning hand at all. Learning which group a tile belongs to is most of what knowing the tiles means.'
        ]
      },
      {
        heading: 'The Three Suits',
        body: [
          '• Characters (萬, wan) — the tile shows a number of Chinese characters, 1 through 9.',
          '• Bamboo (條, tiao) — the tile shows one to nine sticks of bamboo.',
          '• Circles (筒, tong) — the tile shows one to nine coins or dots.',
          'Each suit has four copies of each number, giving 36 tiles per suit and 108 numbered tiles in total. A set (sequence) is three consecutive numbers in the same suit, so suits matter for more than looks: two tiles can only be joined if they share a suit and sit close in number. That is why a hand which keeps drifting between all three suits never gets anywhere.'
        ],
        tiles: [{"suit": 'char', "rank": 1}, {"suit": 'bamboo', "rank": 1}, {"suit": 'dot', "rank": 1}],
      },
      {
        heading: 'The Winds',
        body: [
          'The four winds are East, South, West and North. They are honour tiles — they cannot form sequences, only triplets. In many rulesets, a triplet of your seat wind or the round wind scores extra points.',
          'The dealer is always East, and turns rotate through South, West and North. The wind tiles are the only honours that map to something visible at the table — your seat and the round both carry a name you can point to, so you can always tell which winds are worth more to you right now.',
          'That is what makes winds awkward to hold. A single South does nothing until it becomes a pair, and a pair does nothing until it becomes a triplet — and there are only four copies of any given wind in the whole set. Beginners therefore throw lone winds away early. The exception is the wind that matches your seat or the round: those earn extra points when they complete, so they are worth a few extra turns of patience.'
        ]
      },
      {
        heading: 'The Dragons',
        body: [
          'The three dragons are Red (中), Green (發) and White (白). Like winds, they only form triplets, but dragon triplets score in almost every ruleset — a red dragon triplet is one of the most reliable ways to reach a scoring minimum.',
          'A hand holding all three dragon triplets is a major scoring pattern in most games. In Hong Kong mahjong it is one of those patterns that beginners build by accident once, then spend the next twenty games chasing.',
          'Dragons differ from winds in one important way: a dragon triplet pays in almost every ruleset, while a wind triplet only pays when the wind matches your seat or the round. That difference is why a lone red dragon is a better keep than a lone South, and why an experienced player will hold a dragon pair two turns longer than a wind pair.'
        ]
      },
      {
        heading: 'Flowers and Seasons',
        body: [
          'Flowers and seasons are bonus tiles, used in some rulesets. Each player has one flower and one season; drawing your own grants bonus points and lets you draw a replacement tile from the wall.',
          'They are usually set aside immediately and never form part of a winning hand.',
          'Bonus tiles also change the arithmetic of a set. A set that includes flowers holds 144 tiles, while the Japanese game uses 136 and plays with no flowers at all. That is why two beginner guides can quote different tile totals and both be right — the first thing to check is whether the set being described includes flowers.'
        ]
      },
      {
        heading: 'How to Read a Mahjong Tile: A Field Guide',
        body: [
          'You do not need to read Chinese to identify a mahjong tile. Every tile tells you its group first and its value second. Learn that two-step habit and you can name all 144 tiles after a handful of games.',
          'Step one: which group is it? Numbered suit tiles always show a number in one of three visual forms — characters, bamboo sticks or circles. Anything that does not show a number is either an honour or a bonus tile. That single check narrows 144 tiles down to the right family straight away.',
          'Step two: what number, or which honour? In the three suits you count the pips or read the Chinese numeral. 一 through 九 are simply 1 to 9. The character tiles carry the numeral above the character for ten thousand (萬), so 一萬 is 1 and 九萬 is 9. Dot tiles show that many coins, and the 1-dot is a single large circle.',
          'Bamboo tiles show that many sticks — with one famous exception. On traditional sets the 1-bamboo is drawn as a bird rather than a single stick, which trips up nearly every beginner at least once. If a tile shows a small bird, it is the 1 of bamboo.',
          'Honours are written as single characters and never show digits. The four winds are 東 East, 南 South, 西 West and 北 North. The three dragons are 中 Red, 發 Green and 白 White. The white dragon is usually drawn as a plain or lightly framed tile, which makes it the easiest of the three to overlook.',
          'Bonus tiles sit outside this system. The four flowers are 梅 plum, 蘭 orchid, 菊 chrysanthemum and 竹 bamboo; the four seasons are 春 spring, 夏 summer, 秋 autumn and 冬 winter. They are not numbered in any useful sense — each one simply belongs to a seat — and they never become part of a hand.',
          'A quick way to train your eye: lay a set face up, draw five tiles at random, and name the group and value of each one out loud before you set it down. Most people can recognise all 34 distinct tiles within an evening.'
        ],
        tiles: [{"suit": 'char', "rank": 9}, {"suit": 'bamboo', "rank": 1}, {"suit": 'dot', "rank": 1}, {"suit": 'wind', "wind": 'north'}, {"suit": 'dragon', "dragon": 'white'}],
      },
      {
        heading: 'What Each Tile Is Worth: Rarity and What to Keep',
        body: [
          'Once you can name a tile, the next question is whether to keep it. Tile value in mahjong is not a price list. It comes down to three things: what the tile can become, how many copies are still in play, and what your ruleset actually pays for.',
          'What it can become. A tile that can join a sequence has more futures than a tile that can only form a triplet. A 4, 5 or 6 of any suit slots into runs on either side, so it stays useful in almost any hand. A lone honour has exactly one future, and only if you find two more copies.',
          'How many copies are left. Every tile has four copies in the set. If three of them are already on the table, the fourth is nearly dead. If two are sitting in your own hand, only the remaining two can complete your triplet. This is why strong players watch the discards instead of trying to memorise odds — the table tells you which tiles are still alive.',
          'What the ruleset pays for. A tile is only valuable inside a scoring system. Hong Kong mahjong rewards a dragon triplet, your seat wind and a pure one suit. Chinese Official demands eight points before any hand counts at all. The same red dragon can be the most useful tile in one ruleset and an easy discard in another, so value is never a property of the tile alone.',
          'A practical keep-or-throw order for beginners. Keep the middle tiles (4, 5, 6) of a suit you already hold three or more of. Keep a pair of dragons or a pair of your seat wind. Throw lone winds, lone 1s and 9s in suits you are not collecting, and lone honours that are not dragons. Then re-check after every draw, because the answer changes as the wall empties.',
          'One trap catches almost everyone. Tile value is relative to your own hand, not absolute. A 9-dot is close to worthless in a hand built on 4s and 5s, and close to essential in a hand already holding 7-dot and 8-dot. Before you keep or throw, name the hand the tile is going to complete — if you cannot name it, the tile is not doing any work.',
          'Two habits separate players who improve from players who stall. First, choose your hand direction by the fifth or sixth discard and stop second-guessing it. Second, never keep a tile because it looks valuable — keep it because you can name the hand it is about to complete.'
        ],
        tiles: [{"suit": 'char', "rank": 4}, {"suit": 'char', "rank": 5}, {"suit": 'char', "rank": 6}, {"suit": 'dragon', "dragon": 'red'}, {"suit": 'dragon', "dragon": 'red'}],
      },
      {
        heading: 'Why Tile Meanings Matter',
        body: [
          'You do not need to memorise the artwork — the numbers and suits carry all the information. But knowing what each tile is worth (can it make a sequence? a triplet? a scoring pattern?) turns random drawing into a plan.',
          'Once the tiles are familiar, the rest of mahjong is pattern recognition and timing. You stop asking what a tile is and start asking what it can still become — which is the whole game.'
        ]
      }
    ],
    faq: [
      { question: 'How many different mahjong tiles are there?', answer: 'There are 34 distinct tiles (9 characters, 9 bamboo, 9 circles, 4 winds, 3 dragons), and four copies of most, giving 144 tiles. Flowers and seasons add 8 more in sets that include them.' },
      { question: 'What do the three suits represent?', answer: 'Characters, bamboo and circles represent different denominations of coins in the game\u2019s historical Chinese origin. In play they are just three suits of 1\u20139.' },
      { question: 'Can honours form sequences?', answer: 'No. Winds and dragons can only form triplets, never sequences. That is why lone honours are usually discarded early.' },
      { question: 'What is the most valuable tile?', answer: 'There is no single most valuable tile — value depends on your hand and ruleset. Dragon triplets, your seat wind and rare suit tiles like 1 and 9 are generally the most useful.' },
      { question: 'How do I tell which mahjong tile I am holding?', answer: 'Check the group first: a number means a suit tile, a single character means an honour, and flowers or seasons are bonus tiles. Then read the value — count the pips, read the numeral, or recognise the wind or dragon character.' },
      { question: 'Why is the 1-bamboo tile drawn as a bird?', answer: 'On traditional sets the 1 of bamboo is illustrated as a sparrow or peacock rather than a single stick. The artwork is decorative only — the tile still counts as the 1 of the bamboo suit.' },
      { question: 'Which tiles should a beginner keep?', answer: 'Keep middle tiles (4, 5, 6) in a suit you are collecting, plus pairs of dragons or your seat wind. Discard lone winds, lone 1s and 9s in suits you are not using, and lone honours that are not dragons.' }
    ]
  },
  {
    slug: 'american-vs-chinese-mahjong',
    title: 'American vs Chinese Mahjong: Key Differences Explained',
    description:
      'American mahjong and Chinese mahjong are very different games. Compare jokers, hand cards, scoring and tile counts to see which style suits you.',
    readMinutes: 8,
    keywords:
      'american vs chinese mahjong, american mahjong rules, chinese mahjong rules',
    heroTiles: [{ "suit": 'char', "rank": 1 }, { "suit": 'wind', "wind": 'east' }, { "suit": 'dragon', "dragon": 'red' }],
    cta: { label: 'Play Chinese Mahjong Now', href: '/games/classic' },
    sections: [
      {
        heading: 'Two Games That Share a Name',
        body: [
          'Both games use mahjong tiles and both are played by four people, but American and Chinese mahjong diverged dramatically after mahjong reached the West in the 1920s. The card-driven American game plays more like a hand-building race; Chinese styles keep the draw-and-discard purity of the original.',
          'The confusion is understandable, because the two games genuinely look alike on a table. Same tiles, same four seats, same wall. A beginner watching from across the room might not notice a difference for the first three turns. Then the American player picks up a joker, everything changes, and the two games stop resembling each other at all.',
          'The cleanest way to hold the distinction is to ask what defines a win. In Chinese mahjong, a win is a shape — four sets and a pair, plus a pattern worth enough to clear the minimum. In American mahjong, a win is a match — your fourteen tiles have to line up exactly with one line printed on a card that the National Mah Jongg League reissues every spring. That single difference in the definition of winning is the root of almost every other difference below.',
          'This article is not an argument for one game over the other. It is a map of where they part company, so you can tell which one you are sitting down to — and so you do not spend your first American game looking for a chow that does not exist.',
          'One more thing worth stating plainly before the details: "Chinese mahjong" is itself not a single game. Hong Kong, Riichi, Taiwanese, Sichuan and Chinese Official all sit under that label and disagree with each other about scoring and even tile count. So when this article contrasts American and Chinese play, it is comparing the card-driven American tradition against the common draw-and-discard family — the part those Chinese variants do agree on.'
        ]
      },
      {
        heading: 'The Hand Card vs. Open Patterns',
        body: [
          'The defining feature of American mahjong is the annual hand card, published each year by the National Mah Jongg League. It lists dozens of exact winning patterns; you must build one of them exactly to win. The patterns change every year, which keeps the game fresh but means the rules are not all discoverable from the tiles alone.',
          'Chinese mahjong uses fixed, universal scoring patterns — flushes, triplets, dragons — that have not changed for a century. The rules are the same whether you play in Beijing or online.',
          'The practical consequences of this one difference are larger than they first appear. Because the American card is exact, a hand that looks beautiful can be worthless: if your fourteen tiles nearly match line 42 but you hold a 7 of craks where the card requires a 7 of bams, you have not "almost" won, you have nothing. There is no partial credit and no improvisation.',
          'Because the Chinese table is open, the opposite is true. Any legal shape that clears the minimum counts, whether or not it appears on a list. Four sets and a pair made of whatever you happened to draw is a valid hand in Hong Kong if it reaches three faan. That openness is why Chinese mahjong rewards reading your own tiles, and why American mahjong rewards reading a document you must buy every January.',
          'The card also makes American mahjong unusually social in a specific way. Because everyone at the table is chasing lines printed in the same booklet, players trade opinions about which hand is "live" this year, and a new card release is a genuine event in the community. Chinese mahjong has no equivalent moment — its rules are simply there, and have been for generations.'
        ]
      },
      {
        heading: 'Jokers and the Charleston',
        body: [
          'American mahjong uses jokers that can stand in for any tile, and a fixed opening exchange called the Charleston in which players pass tiles left, right and across in a set sequence. Both features add a trading phase that does not exist in Chinese mahjong.',
          'Chinese styles have no jokers and no passing — you play strictly from the tiles you are dealt.',
          'Jokers, though, are not as simple as "wild tiles". In American mahjong a joker substitutes only inside a group of three or more identical tiles — a pung, a kong or a quint. It cannot complete a pair, and it cannot be used where the card calls for a single specific tile. Learn those limits early, because the most common beginner mistake is using a joker somewhere it is simply not legal, then discovering the whole hand is dead.',
          'The Charleston is the other half of the trading phase, and it is the feature that most surprises Chinese players. Before the first draw, all four players pass tiles in a fixed pattern — right, then across, then left — with an optional second round in the same rotation. Nothing about it is optional in the sense of being skippable, and nothing about it is secret: you know exactly where each of your passed tiles went.',
          'What the Charleston really does is let skill act before luck takes over. A Chinese player receives thirteen tiles and can only react to them one draw at a time. An American player receives thirteen tiles, then gets to renegotiate the worst of them before the wall is touched. That one round of passing is why American hands start more coherently than Chinese hands do, and why a weak opening hand in the American game is less fatal than the equivalent in Hong Kong.',
          'Keep one distinction straight, though: the Charleston is not a negotiation with another player. Nobody is choosing to give you a tile. Everyone passes simultaneously and blindly to a dictated direction, so the exchange shuffles the distribution of luck without creating a favour economy at the table.'
        ],
        tiles: [{ "suit": 'wind', "wind": 'east' }, { "suit": 'wind', "wind": 'south' }, { "suit": 'wind', "wind": 'west' }, { "suit": 'wind', "wind": 'north' }]
      },
      {
        heading: 'Tiles, Turns and Calling',
        body: [
          'American mahjong includes flowers and seasons and has its own calling rules. Chinese mahjong (and its regional variants) keeps the classic pong / chi / kong calls and the draw-discard turn structure.',
          'Japanese Riichi and Chinese Official add their own twists — riichi declarations, the eight-point minimum — but they are recognisably the same family as the original Chinese game.',
          'The tile count is the first thing to check, and it is the fastest way to tell which game someone is playing. A Chinese or Japanese set is built around 144 tiles, with the flowers and seasons set aside as bonus tiles that score immediately and then leave the wall. An American set runs to 152 tiles, because American play does not set flowers aside — they stay in the deal, are passed during the Charleston, and are used inside specific hands on the card. The eight extra jokers account for the rest of the difference.',
          'Then there is the chow, and its absence. Chinese mahjong lets you claim a discard to complete a sequence of three consecutive tiles in the same suit — that is a chow, or chi in Japanese. American mahjong has no chow at all. There are no runs of three; the card is built from pungs, kongs and quints. If you have played Chinese mahjong for years, this is the habit that will trip you up first, because reaching for a sequence is almost reflexive.',
          'What replaces the chow is the quint: five identical tiles in one group. It is a shape that barely exists in Chinese play and is impossible to complete without jokers, which is exactly why jokers occupy their own section of the American card. A quint is not harder in the sense of requiring more luck alone — it is harder because it requires jokers, and jokers are scarce and contested.',
          'Finally, the vocabulary differs for the same physical tiles. American players say craks, bams and dots; Chinese players say characters, bamboo and circles, or use the regional names such as 萬子, 條子 and 筒子. The tiles are identical. The words are not, and one of the fastest ways to look like a beginner at an American table is to ask for a "three of bamboo" when everyone else calls it a three bam.'
        ]
      },
      {
        heading: 'Which Should You Play?',
        body: [
          'If you want a game with trading, jokers and a yearly metagame, American mahjong is a great social hobby. If you want the classic competitive game that transfers across countries and tournaments, Chinese mahjong — Hong Kong style first, then Riichi or Chinese Official — is the better path.',
          'You can play Chinese mahjong online for free right now and it will teach you the game the rest of the world plays.',
          'A few honest considerations on each side. American mahjong has a real barrier to entry that has nothing to do with skill: you need the current card, and a stale card means you are playing a game that no longer exists. That annual cost is small in money and large in attention, and it is the single most common reason casual players drift away — they miss a year, and the game has moved.',
          'Chinese mahjong has the opposite property. Its rules are stable enough that a set of tiles bought decades ago is still fully usable, and a player returning after ten years needs no re-education. The cost is that the pattern catalogue is large, so the ceiling for a serious player is high and progress is gradual.',
          'There is also a question of who you will actually play with. American mahjong is concentrated in North America and played largely in clubs and friendship groups organised around the card. Chinese mahjong is played nearly everywhere, in dozens of regional variants, and is the version you can find an opponent for in almost any city in the world.',
          'So the honest recommendation depends on your social situation rather than on which game is "better". If you have a local group that plays the American game, the card is a small price for a game designed around that table. If you are learning alone, or want skills that travel, start with Chinese mahjong and treat the American rules as a second language you can pick up later. Neither is a lesser choice — they are simply tuned for different situations.'
        ]
      },
    ],
    faq: [
      { question: 'Are American and Chinese mahjong played with the same tiles?', answer: 'The tile set is broadly the same, but American mahjong relies on jokers and the annual hand card, which Chinese mahjong does not use. Gameplay differs more than the tiles do.' },
      { question: 'Which is easier to learn, American or Chinese mahjong?', answer: 'Chinese mahjong has more discoverable rules because patterns are fixed and universal. American mahjong requires learning the yearly hand card, which changes each year.' },
      { question: 'Do I need the annual hand card to play American mahjong?', answer: 'Yes — the card defines the winning patterns for that year. Without it you cannot declare a valid win under American rules.' },
      { question: 'Can I play Chinese mahjong online for free?', answer: 'Yes. Our Hong Kong Mahjong table is free, in-browser, and teaches the classic draw-and-discard game against computer opponents.' },
      { question: 'What is the Charleston in American mahjong?', answer: 'The Charleston is a mandatory tile-pass before the first draw: three tiles right, three across, three left, with an optional reverse pass. It reshapes every hand before play starts and has no equivalent in Chinese mahjong.' },
      { question: 'Can I practise Chinese mahjong with an American set?', answer: 'Only partly. You can ignore jokers and the card and play four-set-plus-pair Chinese hands, but American seating norms and Charleston habits will still pull you toward a different game. For Chinese practice, use a 144-tile set or play Hong Kong style online.' },
      { question: 'Why don’t online sites recreate the official American hand card?', answer: 'The National Mah Jongg League’s annual card is trademarked and copyrighted. Sites that respect that line teach American concepts (Charleston, jokers, card-driven wins) without shipping the official yearly patterns.' },
    ]
  },
  {
    slug: 'how-to-play-mahjong-online',
    title: 'How to Play Mahjong Online: Free in Your Browser',
    description:
      'Play mahjong online free — no download, no install. Learn where to play, how the online rules work, and the etiquette of playing against bots and strangers.',
    readMinutes: 8,
    keywords:
      'how to play mahjong online, mahjong online free, play mahjong online',
    heroTiles: [{ "suit": 'bamboo', "rank": 6 }, { "suit": 'bamboo', "rank": 7 }, { "suit": 'bamboo', "rank": 8 }, { "suit": 'dragon', "dragon": 'green' }],
    cta: { label: 'Play Free Now', href: '/games/hong-kong-mahjong' },
    sections: [
      {
        heading: 'Why Play Mahjong Online',
        body: [
          'Online mahjong removes the hardest part of the game for beginners: administration. The computer builds the wall, deals the tiles, handles calls and calculates scores. You focus entirely on your hand.',
          'It is also the only way most people can play whenever they want — no need to gather three friends around a table.',
          'That administrative load is bigger than it sounds. In a live game, a beginner spends the first several sessions counting tiles, working out whose turn it is, remembering what a pong costs them, and trying to add up faan in their head while three people wait. Almost none of that is the actual game. Online the software does all of it, so your attention goes where the skill lives: deciding what to discard and when to commit to a shape.',
          'There is a second benefit that is easy to overlook. Online play makes your mistakes visible. When you discard into another player’s hand, the table can show you the hand you fed, and when your shape falls apart you can step back and see which discard caused it. In a live game that feedback usually arrives as a loss and no explanation.'
        ]
      },
      {
        heading: 'What You Need',
        body: [
          'Just a browser and an internet connection. There is nothing to install on desktop or mobile. Our tables run in the browser on any modern device and work with touch or mouse.',
          'No account is needed to start playing, and every game is completely free — there is no wagering or purchasable currency.',
          'Because everything runs client-side in your browser, the game loads in seconds and works on a phone, a tablet or a laptop without a separate app. If you have opened a website on the device, you have everything you need to play a full four-player game.',
          'The absence of accounts matters more than it might seem. There is no registration wall between you and your first hand, no email confirmation to hunt for, and no payment method to enter — which also means there is no risk of accidentally buying anything. You can try the game, dislike it, and close the tab without having given up a single detail about yourself.',
          'If you later want the game to remember your preferences or your progress, that is a separate step you take after you already know you enjoy playing. The order is deliberate: play first, decide later.',
          'One practical tip about devices: the game is designed to be readable on a small screen, but a phone held in landscape shows more of the discard pile at once. On a laptop you can keep the whole table in view without scrolling. Neither changes the rules — it only changes how much information you can take in at a glance, and reading the table quickly is most of the skill.',
          'A stable connection is the only real technical requirement. There is no large download and no asset pack to install, so a modest connection is enough. If you have ever watched a video in a browser, your connection can handle a game of mahjong.'
        ]
      },
      {
        heading: 'How an Online Game Works',
        body: [
          'You join a table and the game deals you 13 tiles. On your turn you click a tile to draw, then click a tile to discard. The game highlights tiles you can call and shows when your hand can win.',
          'An optional readiness hint shows how far your hand is from a complete shape, which is the single most useful tool for learning.',
          'The turn loop is genuinely that short, and the small number of actions is what makes online mahjong such a good learning environment. Draw, consider, discard. Everything you need is on the screen at once: your hand, the three opponents’ discards, and the counters for the tiles you cannot see.',
          'Calls work the same way they do at a table, but with the guesswork removed. When a discard is available to you — because it would complete a set in your hand — the tile lights up, and you can accept or decline. Declining is always an option, and knowing when to decline is a skill in itself, since calling opens your hand and forfeits the concealed-hand bonuses.',
          'The end of a hand is where the software helps most. When someone wins, the table shows the completed shape broken into its sets, names the patterns the hand scored, and shows the faan total. Instead of learning scoring from a table in a book, you learn it by watching your own hands get taken apart.',
          'One thing to expect in your first session: you will probably discard a tile that helps an opponent, and you will probably do it more than once. That is not a sign you are doing it wrong. Reading the discard pile is a skill that takes dozens of hands to build, and the game will keep showing you what you missed.',
          'The readiness hint deserves a word of its own, because it is the feature that most changes how fast beginners improve. In a live game, knowing whether you are one tile from ready or four tiles from ready is a mental calculation you do silently, and beginners get it wrong constantly. Showing that distance on screen turns a hidden skill into a visible number.',
          'Use it as a training wheel rather than a crutch. The habit worth building is to glance at the hint, decide your discard, then ask yourself whether you could have worked out the same thing without it. Over a few dozen hands the answer starts being yes, and at that point you have learned to read a hand — which is the transferable skill, not the hint itself.'
        ],
        tiles: [{ "suit": 'bamboo', "rank": 6 }, { "suit": 'bamboo', "rank": 7 }, { "suit": 'bamboo', "rank": 8 }, { "suit": 'dragon', "dragon": 'green' }]
      },
      {
        heading: 'Bots vs. Human Opponents',
        body: [
          'Playing against computer opponents is ideal for learning: bots play at a steady pace, never stall, and never get impatient while you think. Our tables always seat three bots, so you can play alone any time.',
          'When you are ready for human opponents, the same skills apply — online rules are the same as table rules.',
          'The most common worry beginners have about playing bots is that the game will be too easy and they will learn bad habits. That is usually backwards. Bots do not get bored, do not get distracted, and do not make the emotional errors that human beginners make — they simply play the hand in front of them, every time. Beating them requires the same discipline a human table requires: commit early, discard efficiently, and stop feeding tiles.',
          'What bots do not give you is unpredictability. Human opponents bluff, hesitate, and change direction for reasons that make no sense until you see their tiles. Bots largely do not. So there is a real skill that only appears against people, and it is mostly about reading hesitation rather than reading tiles.',
          'The practical order that works well: learn the rules and the rhythm against bots until the interface stops demanding attention, then move to human tables. Trying to learn the rules and the psychology at the same time is what makes new players feel lost.'
        ]
      },
      {
        heading: 'Online Mahjong Etiquette',
        body: [
          'Take your turn promptly. Call only when you really want the tile. Do not rush others. And in casual games, remember the goal is fun — nobody wins every hand.',
          'The one rule that matters most online: stay engaged. A stalled table is the only true annoyance.',
          'Online etiquette is mostly the table etiquette translated into a medium without faces. You cannot see whether the player to your left is thinking hard or has walked away, so the burden falls on you to keep the game moving. A player who takes a reasonable pause is fine; a player who disappears for five minutes has effectively ended the game for three other people.',
          'Calling has an etiquette dimension online that it does not have in person. Because the software makes calling a single click, it is tempting to call reflexively — and a player who calls constantly, then discards the tile they just called, reads as inattentive. At a real table that behaviour would draw a look. Online it draws silence, but it still costs you the game.',
          'There is also a good-habit argument for playing politely even against software. The habits you build in a hundred bot games are the habits you will bring to your first human table, and nobody wants to unlearn clicking every call they see. Play each game as though three people are watching, which at a real table they would be.',
          'Finally, remember what a casual game is. Nobody wins every hand, and a session is judged by whether it was enjoyable, not by the final tally. The etiquette rules exist to protect that, not to impose formality on a hobby.',
          'Online there is one more thing worth saying about pace: because the other players may be anywhere in the world, "promptly" means seconds, not minutes. A turn that takes five seconds at a live table can feel like a long silence on a screen where nothing else is happening. If you need to think, think — but think with your hand on the mouse rather than leaving the table.'
        ]
      },
      {
        heading: 'Start Playing Now',
        body: [
          'Ready to try it? Our Hong Kong Mahjong table deals you in against three bots with scoring explained on every hand. It is free, instant, and the fastest way to go from rules to real games.',
          'If you are brand new, do not try to learn everything before your first hand. Play a full game first, accept that you will discard badly, and read the scoring breakdown when the hand ends. Two or three games will teach you more about the rhythm than any amount of reading.',
          'Then go back and study the parts that confused you — the patterns, the faan minimum, when to call. Learning in that order, playing first and reading second, is far faster than the reverse, because you will have real hands to attach the rules to.',
          'Your first game is one click away, and nothing about it is permanent. If you do not like it, close the tab. If you do, you have found a game you can play any time, alone or with friends, for the price of a browser tab.'
        ]
      },
    ],
    faq: [
      { question: 'Is online mahjong free?', answer: 'On our site, yes — completely free, no account, no wagering, nothing to download. You can play in your browser on desktop or mobile.' },
      { question: 'Do I need to know the rules before playing online?', answer: 'It helps to know the basics, but online tables handle calls and scoring automatically. You can learn while playing, with the readiness hint guiding you.' },
      { question: 'Can I play mahjong online alone?', answer: 'Yes. Our tables always seat three computer opponents, so you can play a full four-player game by yourself any time.' },
      { question: 'Is playing mahjong online the same as in person?', answer: 'The rules are identical. The only difference is that the computer handles dealing, calling and scoring — which actually makes it easier to focus on strategy.' },
      { question: 'Can I play mahjong online on my phone?', answer: 'Yes. The tables are browser-based and work on phones and tablets as well as desktop — no app install required.' },
      { question: 'Are there real-player tables online?', answer: 'Our tables seat three computer opponents so you can start any time without waiting for a lobby. Human multiplayer is a different product; bots are the reliable way to learn the full four-player flow solo.' },
      { question: 'Should beginners start with Hong Kong or Riichi online?', answer: 'Start with Hong Kong. Its three-faan minimum and short pattern list let you win in the first session. Switch to Riichi once you are comfortable with calls, waiting shapes and reading discards.' },
    ]
  },
  {
    slug: 'best-mahjong-sets-for-beginners',
    title: 'The Best Mahjong Sets for Beginners in 2026',
    description:
      'What to look for in a first mahjong set: tile size, material, travel cases and the right accessories. Practical buying advice so you start with the right tiles.',
    readMinutes: 8,
    keywords:
      'best mahjong sets for beginners, mahjong set buying guide, mahjong tiles set',
    heroTiles: [{ "suit": 'wind', "wind": 'east' }, { "suit": 'wind', "wind": 'south' }, { "suit": 'wind', "wind": 'west' }, { "suit": 'wind', "wind": 'north' }],
    cta: { label: 'Play Online Instead', href: '/games/mahjong-solitaire-classic' },
    sections: [
      {
        heading: 'What to Look For',
        body: [
          'A good beginner set needs three things: readable tiles, a full 144-tile count, and a case that survives being played. Everything else is preference.',
          'Tile size matters most. Standard tiles are 28–34mm across the face. Bigger tiles are easier to read and to pick up, and are worth the extra table space if you play casually.',
          'Those three criteria are worth unpacking, because they are what separate a set that gets used from one that sits in a cupboard. Readability is about how quickly you can identify a tile at a glance, which matters far more when you are still learning the patterns than it will later. Tile count is binary: either the set is complete or it is not, and an incomplete set cannot be played at all. And the case is what decides whether the set survives a year of being carried to a friend’s house and back.',
          'The trap most beginners fall into is optimising for the wrong thing. A beautiful vintage set with small, hand-painted tiles looks wonderful on a shelf and is genuinely hard to play with, because small tiles are difficult to read and the faces wear. A plain mid-range resin set with large, crisp tiles will give you a far better first year.',
          'One more criterion that is easy to forget: does the set match the ruleset you plan to play? A 144-tile set covers Hong Kong, Riichi and most casual play. If you intend to play American mahjong you need jokers, and if your local group plays Taiwanese rules you need a sixteen-tile configuration. Buying first and discovering a mismatch later is the most expensive beginner mistake.',
          'The honest summary is that a first set should be boring. Readable, complete, well-cased, and matched to your ruleset. Save the personality for the second set, once you know the game well enough to know what you actually want.'
        ]
      },
      {
        heading: 'Tile Material: Bakelite, Resin and More',
        body: [
          'Classic sets are made from bone-and-bamboo, but modern sets use resin, plastic or melamine. Good-quality resin tiles have crisp, painted faces that do not wear off. Cheap plastic tiles can chip at the corners and fade.',
          'For a first set, choose solid-colour resin or melamine tiles with a frosted back — they shuffle well and last for years.',
          'Material is where price and quality diverge most sharply, so it is worth knowing what you are actually buying. Bone-and-bamboo is the traditional construction: a bamboo backing with a bone or ivory-substitute face, glued together. Genuine antique sets are collectible and priced accordingly, and they are also heavier, more delicate, and not obviously better to play with than a good modern set.',
          'Resin is the modern default and covers a very wide quality range. Good resin is dense, has a consistent weight, and carries faces that are painted and then sealed, so the markings survive years of shuffling. Poor resin is light, hollow-feeling, and often has faces that were stamped or printed rather than painted, which is why they fade.',
          'Melamine sits close to good resin and is common in mid-price sets. It resists scratching and chipping well and holds colour cleanly, which is why it is a frequent choice for sets meant to be used rather than displayed.',
          'Plastic is the budget option and behaves accordingly. Tiles are light, the faces are usually printed, and corners chip. A cheap plastic set is a reasonable way to find out whether you enjoy the game, but it is a poor choice as the set you intend to keep.',
          'The practical test, if you can handle a set before buying, is weight and edge. A good tile feels dense in the hand and has a clean, slightly rounded edge that will not chip. A poor tile feels hollow and has a sharp or rough edge. You can tell more from thirty seconds of handling than from any specification on a listing.'
        ],
        tiles: [{ "suit": 'dot', "rank": 1 }, { "suit": 'dot', "rank": 2 }, { "suit": 'dot', "rank": 3 }, { "suit": 'dot', "rank": 4 }]
      },
      {
        heading: 'Tile Count and Size',
        body: [
          'Make sure the set has 144 tiles. Many modern sets include flowers and seasons (8 bonus tiles) on top of the 136 core tiles. If you plan to play American mahjong, you also need jokers.',
          'A 144-tile set covers Hong Kong, Riichi and Chinese Official play. A 152-tile set adds flowers and seasons if your ruleset uses them.',
          'The arithmetic is worth spelling out because listings are often vague. The core of every set is 136 tiles: three suits of nine ranks with four copies each (108), plus sixteen winds and twelve dragons (28). Many sets then add eight flowers and seasons, bringing the total to 144. American sets add eight jokers on top of that, reaching 152.',
          'Where listings go wrong is by advertising a number without saying what is in it. A set sold as "108 tiles" is missing every honour tile and cannot be used for standard play. A set sold as "144" may or may not include flowers, depending on the seller. The safe approach is to read the tile breakdown, not the headline number, and to check whether the listing itemises suits, winds, dragons and flowers separately.',
          'Size is the other variable, and it is a genuine trade-off rather than a simple case of bigger being better. Standard tiles run about 28mm across the face; larger sets run 34mm and beyond. Bigger tiles are easier to read and easier to pick up, and they feel substantial in the hand, which most beginners enjoy. They also take up more space, need a bigger table, and are heavier to carry.',
          'For a first set the usual advice holds: if you play casually at home, favour larger tiles. If you plan to travel with the set or play in a small space, standard size is the better compromise. There is no wrong answer here, only a mismatch between the set and how you will use it.'
        ]
      },
      {
        heading: 'Travel and Storage Cases',
        body: [
          'A rigid case or bag protects the tiles and keeps the table tidy between games. Look for a case with a divider for each tile type — it makes setting up the next game dramatically faster.',
          'A collapsible playing mat is a worthwhile add-on: it keeps tiles from sliding and protects the table surface.',
          'The case matters more than beginners expect, because it is the part that determines whether the set gets played. A set that takes ten minutes to unpack and sort is a set that stays on the shelf. A set whose case has a compartment per tile type can be set up in a fraction of the time, and setup speed is a real factor in how often a casual group actually plays.',
          'Rigid beats soft almost every time for mahjong. Tiles are heavy, and a soft bag lets them knock against each other in transit, which is exactly how faces get chipped and corners get damaged. A hard case with foam or a moulded insert holds each tile separately and turns a rough journey into a safe one.',
          'If you expect to play away from home regularly, look for a case with a handle and a latch rather than a zip. Zips on fabric cases are the first thing to fail, and a case that will not close is worse than no case at all.',
          'The playing mat is the accessory people skip and then wish they had not. A clean cloth or felt surface stops tiles sliding when you shuffle them, deadens the noise, and protects the table underneath. It also gives a clear boundary for the discard area, which makes the table easier to read for everyone.',
          'One small habit that pays off: store the set sorted, not mixed. If the tiles go back in their compartments at the end of a session, the next game starts with a deal rather than a sorting exercise.'
        ]
      },
      {
        heading: 'Recommended Accessories',
        body: [
          'A dice cup, scoring sticks or a scorepad, and a tile pusher (rack) are the usual extras. For beginners, scoring sticks are the clearest way to keep track of wins.',
          'Some sets bundle two racks per player — convenient for beginners who like to arrange their hand.',
          'A dice cup is not a decoration; it is how most rulesets decide who breaks the wall and where. If your group plays to standard rules, the cup is effectively required, and it is the accessory most often missing from budget bundles.',
          'Scoring is where a beginner set most often falls short, and where a small addition helps most. Scoring sticks give each player a physical tally that everyone at the table can see, which removes the recurring argument about whether someone remembered their points. A scorepad works too and is cheaper, but it does nothing for the visibility of a running score.',
          'Racks are worth considering if you are buying for someone who is still learning. Arranging tiles on a rack keeps them upright and face-visible, which makes it much easier for a beginner to actually read their own hand. Two racks per player, so the hand can be split into pairs and runs, is a genuine learning aid rather than a luxury.',
          'Beyond those, the useful extras thin out quickly. A tile pusher is convenient for shuffling but not essential. Decorative items such as wind indicators or score markers add personality to a table without changing how it plays. Buy the practical accessories first and treat everything else as something to add once you know how you actually play.',
          'If you are buying for a beginner as a gift, the safest bundle is a 144-tile set, a case with compartments, a dice cup, scoring sticks and two racks per player. That covers standard play out of the box and needs nothing else to start.'
        ]
      },
      {
        heading: 'Try Before You Buy',
        body: [
          'Not sure a physical set is right for you yet? You can learn the game free online against computer opponents — including the exact same Hong Kong ruleset most physical sets are built for — and buy a set once you are hooked.',
          'The logic here is simple and it saves money. A set is a purchase you keep for years, which makes it a good investment if you enjoy the game and a waste of shelf space if you do not. The only way to find out which is true is to play, and you can do that today for nothing.',
          'Playing online first also tells you something a purchase cannot: which ruleset you actually enjoy. Someone who has played a few dozen hands against the computer will know whether they like the fast, permissive Hong Kong game that most 144-tile sets are built for, or whether they would rather be playing Riichi with its stricter requirements. That knowledge changes which set you should buy.',
          'It also builds the skills that make a physical set enjoyable. Buying tiles before you can read a hand means spending your first sessions fighting the tiles rather than playing the game. Learning the shapes online first means that the first time you shuffle real tiles, you already know what you are trying to build.',
          'If you are still unsure after a week of online play, there is no hurry. The tiles will still be there, and a set bought after you know you enjoy the game is worth more than a set bought to motivate yourself into playing.',
          'When you do buy, buy once and buy well: a complete 144-tile resin set, matched to your ruleset, with a rigid compartment case and the practical accessories. That set will serve you for years, and you will not need to think about equipment again.'
        ]
      },
    ],
    faq: [
      { question: 'How many tiles should a beginner mahjong set have?', answer: 'Buy a 144-tile set. It covers all the standard styles, and the four-of-each-tile structure is what makes the game work.' },
      { question: 'What is the best tile size for beginners?', answer: '34mm tiles are the most comfortable for casual players. They are larger and easier to read than 28mm tournament tiles.' },
      { question: 'Are expensive mahjong sets worth it?', answer: 'For a first set, no. A solid mid-price resin set with crisp faces is enough. Upgrade once you know you play often.' },
      { question: 'Do I need flowers and seasons?', answer: 'Only if your ruleset uses them. Hong Kong and Riichi do not require flowers; Chinese Official and some variants do. A 144-tile set with flowers covers the most ground.' },
      { question: 'Is bone-and-bamboo better than resin for beginners?', answer: 'Not for a first set. Bone-and-bamboo looks traditional and ages beautifully, but costs several times more and is easier to chip. Modern resin with engraved or sharply printed faces is the practical starter choice.' },
      { question: 'Are travel mahjong sets good for learning?', answer: 'They are fine for practice on the road if the tiles are still readable. Just avoid tiny magnetic sets with muddy faces — beginners need clear suits more than a slim case.' },
      { question: 'Should I try mahjong online before buying a set?', answer: 'Yes. A week of free online play tells you whether you enjoy the rhythm and which ruleset you prefer, so the set you buy matches a game you already know you like.' },
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
          'This minimum is what stops every hand from being a boring race to the first complete shape.',
          'It also shapes how you play, not just how you score. A hand that cannot reach the minimum is worth abandoning, so players fold those shapes early rather than spend a dozen turns completing something that pays nothing. The minimum turns mahjong into a game of hand selection rather than hand completion.'
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
          '• Seven pairs — an alternative winning shape in most rulesets.',
          'Everything else is a variation on that base. A flush is the base restricted to one suit, all-triplets is the base with the sequences replaced by triplets, and a dragon triplet is one of the four sets. Once you can point to the four sets and the pair, you can already read the scoring table.'
        ]
      },
      {
        heading: 'Hong Kong Faan',
        body: [
          'Hong Kong style requires three faan minimum. Common patterns and their value: a pure suit hand (3), all-triplets (3), all-simples (1), a dragon triplet (1\u20133). Hands stack — a flush with a dragon triplet is worth more than either alone.',
          'The scoring table rewards clean, deliberate hands. Cheap hands are reliable but slow; ambitious hands score big but rarely come together.',
          'All simples alone is worth one faan, so a hand built only from 2s through 8s cannot be declared on that pattern by itself. It needs company: all sequences and a fully concealed win take the same hand to exactly three, which is the bar. That is why Hong Kong hands tend to be either cheap and specific or ambitious and rare.'
        ],
        tiles: [{"suit": 'dragon', "dragon": 'red'}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}],
      },
      {
        heading: 'Japanese Han and Riichi',
        body: [
          'Riichi scoring adds yaku (fixed patterns) on top of han. Riichi itself is a yaku — declaring it on tenpai adds one han and is the signature of the ruleset. Concealed hands score much higher, which rewards patience.',
          'The readiness (tenpai) position matters in Riichi too: you can declare riichi, or stay silent and score differently. Understanding han is the key to choosing.',
          'Fu converts that han into points, but only below five han \u2014 above that the payment tiers are fixed by han alone. Fu is therefore the number that decides close hands, and the one beginners most often get wrong.'
        ]
      },
      {
        heading: 'Chinese Official Points (MCR)',
        body: [
          'Chinese Official uses an eight-point minimum with a large catalogue of patterns worth 1 to 88 points. Flush hands, all-triplets and the rarest patterns stack quickly.',
          'The high minimum forces genuine structure — a seven-pairs hand or a flush is usually needed, which is why MCR players plan their hand from the first tiles.',
          'It also settles overlapping patterns by an account-once rule: when one pattern covers another, only the larger is paid. That is why an MCR total is usually smaller than the list of names the hand appears to contain.'
        ]
      },
      {
        heading: 'How to Score a Hand in Five Steps',
        body: [
          'Scoring tables look like homework, but you do not memorise them \u2014 you work them. Every ruleset runs the same five steps, and the only thing that changes between Hong Kong, Riichi and Chinese Official is the numbers you look up at step three.',
          'Step 1 \u2014 confirm the shape. A standard hand is four sets and a pair, and each set is either a triplet or a sequence. If the tiles will not divide that way, check for a special shape before anything else: seven pairs and thirteen orphans are scored as a single pattern rather than as sets.',
          'Step 2 \u2014 name what the hand contains. Before valuing anything, list what is true. Is every tile from one suit? Is every set a triplet? Are there dragons? Did you claim anything, or is the hand still concealed? Did the win come off the last tile in the wall? Naming is description, not judgement.',
          'Step 3 \u2014 look each name up in the ruleset\u2019s table. This is where the three games part company. The same name is worth different numbers in each: a half flush is 3 in Hong Kong, 2 in Riichi and 6 in Chinese Official. The vocabulary overlaps heavily; the values deliberately do not.',
          'Step 4 \u2014 add the patterns, then apply the cap. Most rulesets let patterns stack, so a flush that also contains a dragon triplet is paid for both. Hong Kong stops at 10 faan, Riichi converts a full yakuman into a flat 13, and Chinese Official has no total cap at all.',
          'Step 5 \u2014 check the minimum. Below it the hand is not a legal win however complete it looks: 3 faan in Hong Kong, at least one yaku in Riichi, 8 points in Chinese Official. This is the step that catches beginners.',
          'Run the procedure once on a real hand, in Hong Kong. You have claimed one exposed triplet of 8 Circles. Concealed, you still hold 2-2-2 Circles, 5-5-5 Circles and the Red Dragon triplet, and you are waiting on a pair of 9 Circles. An opponent discards one and you claim the win.',
          'Naming first: every tile is Circles or an honour, so that is a half flush; all four sets are triplets, so all triplets; and one of those triplets is a dragon triplet. Adding: 3 + 3 + 1 = 7 faan. The Hong Kong minimum is 3, so the hand stands with room to spare.',
          'The shortcut most players use is that you do not run all five steps every hand. Two or three patterns decide the value of almost every hand you will play, so the table you actually consult shrinks to about a dozen names. Step 2 is still worth doing carefully, though — beginners usually miss a pattern rather than misprice one.',
          'One thing trips people up here: the names from step 2 are not a fixed vocabulary shared by every game. Chinese Official calls all-triplets all pungs, and carries patterns Hong Kong has no entry for at all. You are looking the same hand up in three different tables rather than translating between them.',
          'Two habits make the whole procedure faster. Learn the three or four patterns that decide most hands in your ruleset, and check the minimum before you commit to a shape rather than after you have completed it. Scoring then stops being arithmetic and becomes part of how you choose a hand.'
        ],
        tiles: [{"suit": 'dragon', "dragon": 'red'}, {"suit": 'dragon', "dragon": 'red'}, {"suit": 'dragon', "dragon": 'red'}, {"suit": 'dot', "rank": 8}, {"suit": 'dot', "rank": 8}, {"suit": 'dot', "rank": 8}],
      },
      {
        heading: 'One Hand, Three Rulesets',
        body: [
          'That hand is legal in all three games, and each prices it differently. Nothing about the tiles changes \u2014 only the table you look them up in.',
          '• Hong Kong pays 7 faan: half flush (3), all triplets (3), dragon triplet (1).',
          '• Riichi pays 7 han and 40 fu, worth 12,000 points: half flush (2), dragon triplet (1), all triplets (2), three concealed triplets (2).',
          '• Chinese Official pays 32 points: half flush (6), dragon triplet (2), all pungs (6), pung of terminals or honours (1), three concealed pungs (16), single wait (1).',
          'Three totals, one hand. The numbers are not convertible: 7 faan is not 7 han, and neither is 32 Chinese points. Hong Kong caps a hand at 10 faan, Riichi treats 13 han as a ceiling, and Chinese Official lets a single pattern reach 88 without capping the total. Comparing raw numbers across games tells you nothing.',
          'Go the other way and take the cheapest legal hand: four sequences, no honours, nothing but 2s through 8s, completed on a two-sided wait with the hand still concealed. Hong Kong pays exactly 3 faan \u2014 all simples (1), all sequences (1), fully concealed (1), right on the minimum. Riichi pays 2 han, all simples plus pinfu, worth 2,000. Chinese Official pays exactly 8 points: all simples (2), no honours (1), all chows (2), short straight (1), concealed hand (2), also on the minimum.',
          'Two hands, both legal, and the spread runs from 2 han to 32 points. That is why the scoring table matters less than knowing which patterns your ruleset actually pays for. Someone who learns one game\u2019s table and then switches will spend a whole session building hands that do not qualify.',
          'Each scale is tuned to make a different kind of hand expensive. Hong Kong keeps its ceiling low, so a modest, fast hand stays competitive. Chinese Official\u2019s 88-point fans pay for rare, difficult constructions. Riichi sits between them and pays extra for concealment and for the shape of the wait.',
          'Caps matter as much as values. Because Hong Kong stops at 10 faan, a hand worth 11 and a hand worth 30 settle identically, so there is no reason to keep building. Riichi\u2019s ceiling and Chinese Official\u2019s absence of one push the same decision in opposite directions.'
        ],
        tiles: [{"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 2}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}, {"suit": 'dot', "rank": 5}],
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
      { question: 'Can I compare a faan score with a han score?', answer: 'No. The three scales are independent \u2014 7 faan in Hong Kong, 7 han in Riichi and 32 points in Chinese Official can all describe the same hand. Each game also caps differently, so raw totals mean nothing across rulesets.' },
      { question: 'Why does a complete hand sometimes fail to win?', answer: 'Because every ruleset enforces a minimum. A hand can be structurally complete and still fall below three faan in Hong Kong or eight points in Chinese Official, in which case it cannot be declared at all.' },
      { question: 'What is the easiest way to learn mahjong scoring?', answer: 'Play online where the table calculates and explains every score. Seeing the breakdown after each win teaches the patterns far faster than memorising a table.' },
      { question: 'Which patterns score the most?', answer: 'Rare, structured hands score most: pure-suit hands, all-triplets, and special shapes like seven pairs or thirteen orphans. Riichi\u2019s limit hands and Chinese Official\u2019s 88-point fans sit at the top of their scales.' },
      { question: 'Does the same hand score the same in every ruleset?', answer: 'No, and the gap is wide. A half flush with a dragon triplet and all triplets pays 7 faan in Hong Kong, 7 han in Riichi and 32 points in Chinese Official. Learn the table of the game you actually play.' }
    ]
  },
  {
    slug: 'types-of-mahjong-games',
    title: 'Types of Mahjong Games: Every Style Explained',
    description:
      'From Hong Kong and Riichi to American, Taiwanese and Sichuan — compare every major type of mahjong, what makes each one different, and which style to learn first.',
    readMinutes: 7,
    keywords:
      'types of mahjong, mahjong variants, mahjong styles, different mahjong games, mahjong rules by region',
    heroTiles: [{ "suit": 'char', "rank": 1 }, { "suit": 'bamboo', "rank": 1 }, { "suit": 'dot', "rank": 1 }, { "suit": 'wind', "wind": 'west' }],
    cta: { label: 'Try Hong Kong Mahjong', href: '/games/classic' },
    sections: [
      {
        heading: 'One Name, Many Games',
        body: [
          'Mahjong is not one game. The moment it left a single province it started splitting, and a century later "mahjong" names at least half a dozen games that disagree about how many tiles you hold, what you are allowed to claim, and what counts as a win. They all share the same 144-tile ancestor and the same draw-and-discard rhythm, which is why they feel related. Everything underneath that rhythm is negotiable, and every region negotiated differently.',
          'This is the map. Each style below gets the same treatment: how many tiles, what scoring looks like, what makes it distinctive, and who it suits. Read the whole thing once, then pick one and stay with it for a while — the fastest way to stay confused is to learn three rulesets in one week and keep mixing their scoring rules together at the table.',
          'One thing worth settling first, because it trips up almost every beginner: the same hand shape can be worth very different amounts depending on which style you sit down to. A tidy all-simples hand is a cheap win in one ruleset and a strong one in another. So the question "is this a good hand?" has no answer until you name the game.'
        ]
      },
      {
        heading: 'Hong Kong Mahjong',
        body: [
          'The most widely played style outside Japan, and the one we recommend learning first. You hold thirteen tiles, build four sets and a pair, and the only real gate on winning is a three-faan minimum — low enough that beginners score regularly instead of grinding through hand after hand with nothing to show for it.',
          'Scoring is deliberately shallow. A small catalogue of patterns, no yaku list to memorise, no requirement that your hand be concealed. You can call tiles freely and still win; calling simply costs you some faan rather than disqualifying the hand outright.',
          'What makes it distinctive is the pace. Games finish quickly, the minimum keeps hands honest without making them rare, and the scoring is forgiving enough that new players get a win in their first session. Flowers and seasons are usually included as bonus tiles worth a faan each.',
          'Who it suits: anyone who wants a complete game they can be competent at within an evening, and anyone who will later move sideways into Riichi or Chinese Official.'
        ],
        tiles: [{ "suit": 'wind', "wind": 'east' }, { "suit": 'dragon', "dragon": 'red' }]
      },
      {
        heading: 'Japanese Riichi Mahjong',
        body: [
          'The competitive standard, and by some distance the most studied. Riichi adds a declaration you can make once your hand is one tile from completion: you push a thousand-point stake into the table, announce it, and play your remaining draws face up. It converts a quiet endgame into public information and public pressure, which is why the game produces so many memorable finishes.',
          'The gate on winning is yaku, not points. Your hand must contain at least one recognised pattern before it is allowed to win at all, and that single rule changes how the whole game is played — you cannot simply assemble four sets and a pair. Furiten forbids winning on a tile you have already discarded, which makes every discard a lasting commitment.',
          'Red fives, or dora, add a layer of luck players either love or resent. Dora is only revealed after a win and inflates the score of whatever hand happened to contain it, which means a mediocre hand can pay unexpectedly well. A hand of unremarkable shape holding three red fives can outscore a beautifully constructed concealed hand, and experienced players build their risk tolerance around that possibility rather than pretending it away.',
          'Defence is a first-class skill here in a way it is not in the faster styles. Because a single discard into a large hand can cost you more than you have won all evening, reading the table matters as much as reading your own tiles, and the discipline of folding a promising hand is often the correct play. That trade-off between pushing and folding is what gives Riichi its reputation for depth.',
          'Who it suits: players who want a deep, well-documented game with a real competitive ladder and an enormous body of theory to read.'
        ],
        tiles: [{ "suit": 'wind', "wind": 'north' }, { "suit": 'dragon', "dragon": 'white' }]
      },
      {
        heading: 'Chinese Official (MCR)',
        body: [
          'The tournament ruleset, codified so that a player from any country can sit down at an international table and lose to a specialist on equal terms. Eighty-one patterns, an eight-point minimum, and a scoring system built to be unambiguous rather than exciting.',
          'MCR is the most demanding of the styles here in pure breadth. Reaching eight points is easy with the large patterns and nearly impossible with small ones, so real play becomes a hunt for one of the handful of shapes that will clear the threshold. Many points are also awarded for a fully concealed hand or for winning on the last tile, which rewards patience over speed.',
          'The eight-point gate is the defining feature. It is far higher, in practice, than Hong Kong’s three faan, and it means a beginner’s "obvious" hand frequently cannot win at all. That is intentional: the ruleset exists to rank strong players, not to welcome weak ones. The practical consequence is that the first hour at an MCR table is mostly spent counting points rather than playing, and players who arrive from a casual style often lose several hands before they understand why.',
          'Because the catalogue is fixed and published, MCR is unusually fair as a competitive format — everyone has the same eighty-one patterns available, and disagreements get decided by the rulebook rather than by house convention. That standardisation is exactly why international tournaments adopted it.',
          'Who it suits: players interested in competition and standardisation, and anyone who enjoys the puzzle of a large pattern catalogue. Not a first ruleset.'
        ],
        tiles: [{ "suit": 'char', "rank": 9 }, { "suit": 'bamboo', "rank": 9 }]
      },
      {
        heading: 'American Mahjong',
        body: [
          'A genuinely different game wearing the same clothes. It uses 152 tiles — the standard set plus eight jokers — and you do not decide for yourself what you are building. Each year the National Mahjong League publishes a card listing the legal hands, and everyone at the table plays from that card.',
          'Winning therefore means matching a printed pattern rather than constructing a shape, and the skill shifts from hand-reading to card-reading: recognising which of the listed hands your fifteen tiles are closest to, and how far you can drift toward one before committing. Jokers stand in for tiles in most positions, which makes some hands dramatically easier than others for reasons that have nothing to do with your play.',
          'The Charleston opens every hand: three compulsory passes of three tiles, then an optional courtesy pass, which is by far the most social phase of any mahjong game. The card is republished annually, so an expert in one year’s card is a competent beginner in the next — a rare feature in a game this deep.',
          'Who it suits: clubs and social players, especially anyone who wants a fresh puzzle every year rather than a fixed ruleset to master.'
        ],
        tiles: [{ "suit": 'dragon', "dragon": 'green' }, { "suit": 'dot', "rank": 5 }]
      },
      {
        heading: 'Taiwanese Mahjong',
        body: [
          'Sixteen tiles instead of thirteen, which changes everything downstream. Holding one extra tile per hand means you build five sets and a pair rather than four, and it makes your hand roughly a full step further from completion on average — games last longer, and a single well-timed call matters more.',
          'The distinguishing mechanic is the flower replacement. Whenever you draw a flower or season you place it aside and draw a replacement from the back of the wall, so your hand keeps cycling and the wall drains faster than the tile count suggests. Scoring is by tài, a flexible bonus counter that stacks on top of the base hand value.',
          'Taiwanese play also tends to allow more speculative bidding than Hong Kong, and the extra tile gives you more room to keep a marginal shape alive. If you already know Hong Kong, expect your instincts about hand length to be off by about one tile for your first few games — the extra tile is exactly the trap.',
          'Who it suits: players who know Hong Kong or Chinese Official and want a variant that is genuinely different rather than a scoring tweak.'
        ],
        tiles: [{ "suit": 'bamboo', "rank": 5 }, { "suit": 'char', "rank": 5 }]
      },
      {
        heading: 'Sichuan Mahjong',
        body: [
          'The fast, aggressive blood-battle variant that has become hugely popular for mobile play. There are no honours at all — no winds, no dragons — leaving a 108-tile set. Before play you must void a suit, declaring that you will never win with it, which instantly converts the dense suit-by-suit decisions of other styles into one early commitment.',
          'The "bloody battle" part is the win condition: play does not stop when someone wins. The winner leaves the table, the remaining players continue, and the hand goes on until three of the four have finished or the wall runs out. One deal produces multiple winners, and the player who wins first does not necessarily win the most.',
          'Sichuan scoring is impatient in exactly the way the rest of the ruleset is. It rewards going out fast and punishes the player left holding tiles, and the voided-suit rule makes a bad early decision expensive. It has no concept at all of the thoughtful endgames you see in Riichi, and almost no defensive play — the game is designed so that the cost of stalling is higher than the cost of a bad discard.',
          'The stripped-down tile set is worth understanding separately. Remove the honours and you are left with three suits of thirty-six tiles, which means every tile you need is roughly a third more likely to appear than it would be in a full set. Hands come together fast, the wall is proportionally shorter, and the whole game compresses into a much tighter window.',
          'Who it suits: players who want short, high-tempo games and are happy with a ruleset built for volume rather than depth.'
        ],
        tiles: [{ "suit": 'dot', "rank": 2 }, { "suit": 'dot', "rank": 8 }]
      },
      {
        heading: 'Mahjong Solitaire',
        body: [
          'Not mahjong, despite the name. It is a single-player tile-matching puzzle in which you clear a stacked layout by pairing off identical tiles that have at least one long side free. There are no opponents, no draws, no scoring decisions — just a layout that is either solvable from where you are or is not, and the only real skill is recognising which pairs you can afford to spend.',
          'It shares the tile faces and the word "mahjong" and essentially nothing else. It is the reason a lot of Western players first type the word into a search box, and it is a legitimately good puzzle. It is not a way to learn the four-player game, and the two should not be confused when you are choosing something to play tonight.',
          'If the four-player game is what you are after, the styles above are your options and Hong Kong is the gentlest door in. If you want a quiet fifteen minutes with a familiar-looking board, this one is genuinely worth the time — just know which of the two you signed up for.',
          'Who it suits: solo players, and anyone who wants the pleasure of the tiles without the table.'
        ]
      },
    ],
    faq: [
      { question: 'What is the most popular type of mahjong?', answer: 'Hong Kong Mahjong is the most widely played outside Japan, and Japanese Riichi dominates organised competitive play. Inside mainland China, Sichuan and Chinese Official are both very common, and Sichuan has the largest online following of any variant.' },
      { question: 'Which mahjong style is easiest for beginners?', answer: 'Hong Kong Mahjong. Its three-faan minimum and short pattern list mean a new player can win within a first session. Riichi is more rewarding long-term but requires learning yaku before a hand can legally win at all.' },
      { question: 'Are all mahjong variants played with four players?', answer: 'The four-player game is standard for every style listed here, and Mahjong Solitaire is the single-player exception. Taiwanese, Sichuan and Hong Kong all assume four seats, though all can be adapted to three with adjustments to the wall and claiming rules.' },
      { question: 'Do I need different tiles for different mahjong types?', answer: 'A standard 144-tile set covers Hong Kong, Riichi and Chinese Official. American Mahjong needs eight jokers, which most Western sets include; Taiwanese, Sichuan and Chinese Official have their own conventions for flowers and seasons.' },
      { question: 'What is the main difference between Chinese and Japanese mahjong?', answer: 'The winning gate. Chinese styles use a points or faan minimum, so almost any completed hand can win if it is worth enough. Japanese Riichi requires at least one yaku pattern before a hand may win at all, which changes how you build from the first discard.' },
      { question: 'Can I play different mahjong styles with the same set?', answer: 'Usually yes. Hong Kong, Riichi, Chinese Official and Taiwanese all use the 144-tile set, with differences in how flowers and seasons are handled. American Mahjong is the outlier because its annual card assumes jokers and a specific 152-tile configuration.' },
      { question: 'Why is Sichuan mahjong called blood battle?', answer: 'Because play does not stop when someone wins. The winner leaves and the rest continue playing the same deal until three players have finished or the wall is exhausted, so one deal produces several winners and the first to go out is not always the biggest winner.' },
    ]
  },
  {
    slug: 'mahjong-etiquette-tips',
    title: 'Mahjong Etiquette: The Unwritten Rules of the Table',
    description:
      'Learn the etiquette of mahjong — how to handle tiles, when to call, reading the flow, and the social rules that keep the table friendly.',
    readMinutes: 7,
    keywords:
      'mahjong etiquette, mahjong table manners, how to behave playing mahjong',
    heroTiles: [{ "suit": 'wind', "wind": 'east' }, { "suit": 'wind', "wind": 'south' }, { "suit": 'wind', "wind": 'west' }, { "suit": 'wind', "wind": 'north' }, { "suit": 'dragon', "dragon": 'white' }],
    cta: { label: 'Play a Friendly Game', href: '/games/hong-kong-mahjong' },
    sections: [
      {
        heading: 'Etiquette Is What Makes the Game Playable',
        body: [
          'Mahjong is a social game. The unwritten rules exist so everyone can read the table, think in peace, and enjoy the session. Most are simple: respect the turn order, keep your tiles to yourself, and never rush another player.',
          'It is worth understanding why these rules exist rather than just memorising them. Mahjong is a game of incomplete information. You never see the other three hands, and everything you know about them comes from what they discard, how long they pause, and what they call. That means any behaviour that muddies the public record of the table — talking about your tiles, handling them carelessly, or rushing someone mid-decision — does not just break a social norm. It degrades the information every player is relying on to play well.',
          'So etiquette in mahjong is not decoration layered on top of the rules. It is closer to a maintenance agreement: everybody keeps the signal clean, and everybody gets a better game in return. A table where the norms hold is one where skill actually decides the outcome.',
          'This is also why etiquette travels. The specific customs vary between Chinese, Japanese and American tables, but the underlying principle is identical everywhere — do not disturb the shared information, and do not disturb another player’s concentration. Learn the principle and the local variations stop being mysterious.',
          'A useful test for any uncertain situation: ask whether your action makes the public record less clear or makes another player’s decision harder. Exposing a tile fails both. So does narrating your hand. So does a slow turn that leaves everyone guessing whether you have moved. Almost every real etiquette question resolves into one of those two failures.',
          'One thing etiquette is not: it is not a system for policing beginners. Every table has had someone ask whether they can look at the discards, and the answer is always yes. The norms protect the game, not the pecking order, which is why experienced players are usually the most patient people at the table rather than the strictest.'
        ]
      },
      {
        heading: 'Handle the Tiles With Care',
        body: [
          'Draw and discard one tile at a time. Do not sweep tiles across the table, and never rearrange another player’s discards. Online, this translates to: take your turn without dragging the game — a slow but steady player is better than a fast sloppy one.',
          'The discard pile is a shared record, which is why rearranging it is such a serious breach. Every player at the table has been reading that pile to work out what is safe and what is live. If one player shuffles the row, they have not committed a minor discourtesy — they have destroyed information three other people were actively using.',
          'The same logic applies to how you place your own discard. Put it down clearly, face up, and in a position other players can see. A tile that is half-hidden behind your hand or left ambiguously between two rows forces the table to ask you what you played, which slows the game and, worse, creates doubt about the record.',
          'Handle tiles gently for practical reasons too. Real mahjong tiles are heavy and painted, and slamming a tile down can chip the face or the corner. A chipped tile is still playable but becomes recognisable from the back, which is a genuine problem in a game where tile backs are supposed to be identical. Careless handling quietly damages the set you play with.',
          'Online, the equivalent of careful handling is simply not stalling. The interface prevents you from scattering tiles, but it cannot stop you leaving the table. A slow, attentive player is welcome anywhere; a player who is present in name only is the one behaviour that reliably ruins an online game.'
        ],
        tiles: [{ "suit": 'dot', "rank": 1 }, { "suit": 'dot', "rank": 2 }, { "suit": 'dot', "rank": 3 }, { "suit": 'dot', "rank": 4 }]
      },
      {
        heading: 'Call With Confidence, Not Habit',
        body: [
          'Calling a tile announces your hand to the table. Etiquette (and good strategy) says call only when the tile genuinely helps. Repeatedly calling and discarding weak tiles reads as inexperience and gives the table free information.',
          'There is a real difference between a considered call and a reflexive one, and other players can tell which they are watching. A considered call comes after a pause and is followed by a discard that clearly continues the same plan. A reflexive call is instant, and the discard that follows often has nothing to do with the set that was just completed.',
          'The habitual caller pays twice. They pay in information, because every call tells the table which suit they are collecting and roughly how far along the hand is. And they pay in scoring, because calling opens the hand and forfeits the concealed bonuses that many rulesets reward. Neither cost is visible while it is being incurred, which is exactly why the habit is so persistent in beginners.',
          'Announce your calls clearly as a matter of etiquette. Whether you say “pong” out loud or click the button on screen, the rest of the table needs to know immediately so they can respond. A mumble followed by a silent tile movement forces everyone to reconstruct what happened, and reconstruction is exactly the thing ettiquette is designed to prevent.',
          'If you find yourself unsure whether to call, the answer is almost always no. Declining a call costs you nothing and keeps every option open. Calling to save a single draw is the most common beginner error in the game, and it is one the etiquette rule points at for a reason.'
        ]
      },
      {
        heading: 'Read the Flow, Not Just the Tiles',
        body: [
          'Watch the rhythm of discards. A player who pauses before discarding is deciding — usually near a win. Respect the tension of a late game and think before you discard a dangerous tile.',
          'Pace is information, and reading it is a skill. A player who has been discarding instantly all game and suddenly slows down is telling you something has changed. Often that means they are now choosing between several close options rather than throwing their least useful tile, which in practice means their hand has come together.',
          'The reverse signal is equally useful. Someone discarding with no hesitation late in a hand is usually far from ready, because a player with nothing to protect has nothing to think about. Noticing that lets you push harder with your own hand, since the risk of feeding them is lower than it looks.',
          'Etiquette and this skill interact in an important way. If you chat about the tiles, or comment on how the game is going, or otherwise fill the table with noise, you are making it harder for everyone to read pace — including yourself. The quiet at a serious table is not coldness. It is the medium the game is played through.',
          'When you are the one deciding late in a hand, take the time you need. A reasonable pause is not rude; it is the correct response to a decision that matters. What would be rude is discarding quickly and carelessly into someone else’s hand and then blaming the loss on luck.'
        ]
      },
      {
        heading: 'Winning and Losing Gracefully',
        body: [
          'Wins and losses are part of a session. Thank the player who feeds a winning tile, and do not dwell on a bad beat. In friendly games the goal is the session, not the score.',
          'Thanking the player who discarded your winning tile is a genuine tradition at Chinese and Japanese tables, not an empty courtesy. It acknowledges that the win depended on someone else’s decision, which is true of almost every win in mahjong. A player who treats every win as personal brilliance and every loss as bad luck is not fun to sit with, regardless of how well they play.',
          'Bad beats deserve a word because they are so common. Losing to a hand that appeared from nowhere at the last moment is normal in a game with four players and a finite wall, and it will happen to you repeatedly. The players who improve are the ones who review the hand afterwards and ask whether their discards were sound, not the ones who relive the moment.',
          'There is a practical side to this too. A player who visibly tilts after a loss starts making worse decisions, and at a friendly table those worse decisions come at the expense of the other three. Keeping your composure is therefore not just manners — it is protecting the quality of the game you are in.',
          'The simplest standard to hold yourself to is this: play the hand well, accept the result, and make the next hand enjoyable for everyone at the table. That is a session worth having, and it is entirely within your control regardless of who wins.'
        ]
      },
      {
        heading: 'Online Etiquette',
        body: [
          'Online the same rules apply: take turns promptly, play honestly, and remember bots are patient but humans are not. Our tables never stall and never judge your pace — the ideal place to learn good habits.',
          'Two online-specific norms are worth naming. First, do not abandon a game in progress. At a table you would not stand up mid-hand and walk away, and disconnecting has the same effect on the other three players. Second, do not use the chat to comment on other players’ hands or hint at what you hold. The same information rules that apply face-to-face apply on screen.',
          'Online play does remove one common friction: the software handles announcing calls, showing the discard row, and calculating scores, so the mechanical etiquette takes care of itself. What is left is the part software cannot enforce — showing up, paying attention, and not making the game worse for the people across the table.',
          'Learning online has a genuine advantage here. Because there is no social pressure and no one watching you hesitate, you can practise the habits that make you a good table companion without the anxiety of getting them wrong in front of friends. By the time you sit at a real table, the norms are already muscle memory.',
          'Start with a game against the computer opponents. They will never be offended, and you can experiment with pace, calling discipline and composure in a setting where the only thing at stake is your own improvement.'
        ]
      },
    ],
    faq: [
      { question: 'Can I look at other players’ discards?', answer: 'Yes — the discard pile is public information in every ruleset. Reading it is not just allowed, it is expected.' },
      { question: 'Is it rude to take time on my turn?', answer: 'A reasonable pause is fine, especially late in a hand. The etiquette issue is stalling or rushing. Most casual tables are relaxed about pace.' },
      { question: 'Should I announce my calls?', answer: 'Yes — announce pong, chi or kong clearly so the table can react. Online tables do this for you automatically.' },
      { question: 'What is the most important etiquette rule?', answer: 'Respect the flow of the game: take turns in order, keep discards clean, and never expose another player’s tiles or your own until the hand ends.' },
      { question: 'What should I do after dealing into someone’s win?', answer: 'Pay the score without argument, clear the table for the next deal, and move on. Debating the hand after the fact only slows the session; save rules questions for between hands.' },
      { question: 'Can I look at or coach another player’s hand?', answer: 'No. Hands stay private until the deal ends. Pointing at someone’s tiles, naming what they should discard, or peeking mid-hand breaks trust at every serious table.' },
      { question: 'Does etiquette change when you play online?', answer: 'The core stays the same — take turns, do not abandon a live hand, and do not tip other players’ holdings in chat. Software handles calls and scoring, so the remaining duty is showing up and staying focused.' },
    ]
  },
  {
    slug: 'where-to-buy-mahjong-set',
    title: 'Where to Buy a Mahjong Set Online',
    description:
      'Where to buy a mahjong set online: what shops carry, how to check quality, price ranges, and what to avoid when buying your first set.',
    readMinutes: 8,
    keywords:
      'buy mahjong online, where to buy mahjong set, mahjong set price',
    heroTiles: [{ "suit": 'dot', "rank": 1 }, { "suit": 'dot', "rank": 2 }, { "suit": 'dot', "rank": 3 }, { "suit": 'dot', "rank": 4 }, { "suit": 'dot', "rank": 5 }],
    cta: { label: 'Play Online for Free', href: '/games/mahjong-solitaire-classic' },
    sections: [
      {
        heading: 'What You Are Actually Buying',
        body: [
          'A mahjong set is tiles plus a case. Within that, quality varies enormously — a 144-tile resin set can cost as little as ¥100 or as much as ¥1,500+ for bone-and-bamboo craftsmanship. For your first set, the sweet spot is a well-made resin or melamine set.',
          'It helps to think of the purchase as two separate decisions rather than one. The tiles are the part you will touch for years, and their material and finish decide how the game feels. The case is the part you will handle twice every session, and it decides whether the set gets used. Buyers usually spend all their attention on the tiles and then accept whatever box comes with them, which is backwards.',
          'Price is a poor guide on its own because the same words describe very different products. "Resin" covers tiles that feel like stone and tiles that feel like hollow plastic. "Bone-and-bamboo" covers genuine antiques, modern reproductions, and listings that mean nothing more than a two-tone look. The words on a listing tell you the category, not the quality.',
          'What you cannot judge from a listing is weight and edge finish, and those are what decide whether a set is pleasant to play. A dense tile with a clean, slightly rounded edge survives years of shuffling. A light tile with a sharp edge chips within months. If you can handle a set before buying, do; if you cannot, buy from a seller whose reviews mention these qualities specifically.',
          'So the honest frame is this: for a first set you are buying a tool, not a centrepiece. A solid mid-range resin set with crisp painted faces and a rigid compartment case will outperform an expensive set with small tiles and a flimsy box. Spend the money on the things you touch every session.',
          'It also helps to know which parts you cannot upgrade later. A case can be replaced cheaply. Racks, scoring sticks and a dice cup can all be bought separately for very little. The tiles cannot — they are the one part of the purchase that is effectively permanent, which is why the tile decision deserves more attention than the accessories combined.',
          'If you are buying for a group rather than yourself, one extra consideration applies: buy for the least experienced player at the table. A set that a newcomer can read and handle comfortably will be enjoyed by everyone, whereas a set chosen for an experienced player’s preferences may leave the beginner struggling with small, hard-to-read tiles.'
        ]
      },
      {
        heading: 'Online Marketplaces',
        body: [
          'The major online marketplaces all carry mahjong sets: general marketplaces for budget and mid-range sets, and specialty shops for premium hand-made tiles. Filter by "144 tiles" and read reviews that mention tile size and paint quality.',
          'Look for listings that state the tile count explicitly. Many budget listings sell 108-tile or incomplete sets without saying so.',
          'General marketplaces are the right place to start for a first set. Selection is broad, prices are competitive, and the review volume means you can usually find buyers who have already checked the details you care about. The risk is that listings are written for search engines rather than players, so the headline number may be the only specification given.',
          'Specialty shops and tile makers are the better route once you know what you want. They tend to publish real specifications, sell replacements and spares, and in some cases let you specify tile size or finish. They are also often the only source for genuine bone-and-bamboo work. This is a second-set purchase more than a first one, because it only pays off when you already know your preferences.',
          'One practical filter that saves time: search for the tile count rather than the product name. Searching for a mahjong set returns everything, including travel sets, digital tables and decorative items. Searching for a 144-tile set narrows results to things that can actually be played.',
          'If you are buying across a border, check the listing for import duties and delivery estimates before committing. Tiles are heavy, which makes international shipping expensive and slow, and a set that arrives in six weeks is a different proposition from one that arrives on Friday. Where possible, buy from a seller in your own region.',
          'Finally, be wary of listings with stock photography only. A seller who has never photographed the actual product they are shipping is a seller who may not have handled it either. Real photographs of a real set are the cheapest quality signal available.'
        ]
      },
      {
        heading: 'What to Check in Reviews',
        body: [
          '• Does the case hold the tiles securely?',
          '• Are the faces painted or printed? Printed faces can wear off.',
          '• Is the tile size stated and comfortable?',
          '• Do the backs match exactly? Mismatched backs are a common cheap-set flaw.',
          'Reviews that mention these four points are the ones to trust.',
          'Read reviews for specifics, not for stars. A five-star review that says "great set, love it" tells you nothing you can use. A three-star review that says "tiles are 30mm not 34mm as listed, and two backs are visibly different shades" tells you everything. The most useful reviews are usually the middling ones, because satisfied buyers tend not to inspect.',
          'The mismatched-back point is worth understanding rather than just checking. In mahjong, the backs of all tiles must be indistinguishable, because that is what makes the game fair — nobody can read your hand from the reverse. A set with noticeably different shades or textures on the backs is not merely ugly; it leaks information and can make the game unplayable with observant opponents. It is a fault that cheap manufacturing produces routinely.',
          'Check when the reviews were written, too. Sets get reformulated, sellers change suppliers, and a listing that earned good reviews in 2022 may be shipping a different product now. Recent reviews are the ones that describe what you will actually receive.',
          'If a listing has a question-and-answer section, read it. Buyers ask exactly the questions a first-time purchaser would ask — tile count, tile size, whether flowers are included — and sellers who answer honestly there are usually reliable.',
          'One more check that costs nothing: look at whether the seller publishes a tile breakdown, including suits, winds, dragons and flowers separately. A seller who can list the contents precisely is a seller who knows the product.'
        ]
      },
      {
        heading: 'Price Ranges',
        body: [
          '• ¥100–¥300 — serviceable plastic or light resin sets. Fine for casual play.',
          '• ¥300–¥800 — solid resin with crisp faces and a good case. The beginner sweet spot.',
          '• ¥800+ — premium and vintage sets. Only worth it if you know you play often.',
          'Spend at the middle tier for your first set and you will not regret it.',
          'It is worth knowing what each tier actually buys, because the differences are not evenly spread. Moving from the bottom tier to the middle buys you a great deal: solid tiles instead of hollow ones, painted faces instead of printed, and a case that will not fall apart. That step is where most of the value lives.',
          'Moving from the middle tier to the top buys you much less in playability terms. Beyond a certain point you are paying for materials with heritage value, hand craftsmanship, and scarcity — genuine qualities, but ones that affect how the set looks and how collectible it is far more than how it plays. A well-made mid-range set and a premium set are not dramatically different to play a hand with.',
          'There is also a running-cost argument for the bottom tier being a false economy. A cheap set with printed faces will show wear within a year of regular play, at which point you buy again — and the two purchases together cost more than the mid-range set would have. If you are confident you will keep playing, start in the middle.',
          'If you are not confident, that is exactly what online play is for. Spending nothing to find out whether you enjoy the game is cheaper than spending ¥200 to find out you do not.',
          'A reasonable rule for most buyers: set a budget at the middle tier, then buy the best set within it rather than the cheapest set above it. The marginal spend at the top of the middle tier buys more than the marginal spend at the bottom of the premium tier.'
        ],
        tiles: [{ "suit": 'dot', "rank": 1 }, { "suit": 'dot', "rank": 2 }, { "suit": 'dot', "rank": 3 }]
      },
      {
        heading: 'Try the Game Before You Commit',
        body: [
          'A mahjong set is a purchase you will keep for years — but only if you enjoy the game. Play a few free hands online first, learn whether you like the rhythm, and then invest in tiles. If you decide you love it, the online set recommendation is still the right place to start.',
          'There is a specific advantage to learning online before buying, beyond the money. The ruleset most 144-tile sets are built for is the Hong Kong game, and online play lets you try exactly that without committing to a physical purchase. You will know whether the fast, permissive Hong Kong style suits you before you spend anything.',
          'It also means your first physical session is about playing rather than reading instructions. Someone who has already played fifty hands against computer opponents can shuffle real tiles, recognise their own hand, and know what they are building. Someone who buys first spends their opening sessions fighting the equipment.',
          'If after a week of online play you are still unsure, that is a useful answer in itself. It means the purchase can wait, which costs nothing. Tiles do not expire, and the set that is right for you after you have played more will be a better choice than the one you would buy today.',
          'When you are ready, buy once and buy well: a complete 144-tile set, matched to the ruleset you actually play, with a rigid compartment case and the practical accessories. Then stop shopping and start playing — the equipment question is settled, and the only thing left to improve is your game.'
        ]
      },
    ],
    faq: [
      { question: 'How much should I spend on a first mahjong set?', answer: 'Plan ¥300–¥800 for a solid resin set with a good case. Budget sets under ¥300 often have thin tiles or printed faces that wear quickly.' },
      { question: 'What is a fair price for a 144-tile mahjong set?', answer: 'A reliable 144-tile resin set with case typically runs ¥300–¥600 on major marketplaces. Premium bone-and-bamboo sets cost several times more.' },
      { question: 'Are cheap mahjong sets worth buying?', answer: 'For occasional play, a budget set is fine. Just confirm it has 144 tiles and check reviews for paint and back-matching complaints.' },
      { question: 'Should I buy a mahjong set before learning to play?', answer: 'Not necessarily. You can learn the game free online first and buy a set once you are sure you enjoy it — then the purchase is an investment, not a gamble.' },
      { question: 'How should I choose a set on Amazon or a brand store?', answer: 'Read recent reviews for missing tiles and face quality, confirm the listing shows 144 tiles with matching backs, and prefer sellers who list tile size in millimetres. Brand stores help when you want a warranty; marketplaces win on price if the reviews check out.' },
      { question: 'What are the biggest pitfalls when buying a mahjong set?', answer: 'Incomplete walls (missing one or two tiles), purely printed faces that peel, and mismatched backs that make the set unusable face-down. Always count tiles on arrival and check backs under the same light.' },
      { question: 'Should I buy a 144-tile or 136-tile set?', answer: 'Buy 144. The extra eight flowers and seasons cover more rulesets, and you can simply leave them out for Hong Kong or Riichi. A 136-tile set without flowers is harder to expand later.' },
    ]
  },
  {
    slug: 'mahjong-history-cultural-guide',
    title: 'The History of Mahjong: From Qing Dynasty China to the World',
    description:
      'The fascinating history of mahjong — its origins in 19th-century China, the 1920s Western craze, its reinvention in Japan and America, and where it stands today.',
    readMinutes: 10,
    keywords:
      'mahjong history, history of mahjong, mahjong origins, mahjong culture',
    heroTiles: [{ "suit": 'char', "rank": 1 }, { "suit": 'wind', "wind": 'east' }, { "suit": 'dragon', "dragon": 'green' }, { "suit": 'bamboo', "rank": 9 }],
    cta: { label: 'Play the Classic Game', href: '/games/hong-kong-mahjong' },
    sections: [
      {
        heading: 'Origins in Qing Dynasty China',
        body: [
          'Mahjong emerged in China in the mid-19th century, most likely around Shanghai or Ningbo. It borrowed the card-game logic of earlier Chinese games and translated it into tiles — a format that let it survive the banning of many gambling games.',
          'By the 1890s it was a fixture of Shanghai’s teahouses, spreading outward along trade routes.',
          'The tile format was not a cosmetic choice; it was a survival strategy. Chinese authorities repeatedly banned card games they associated with gambling, and cards were easy to seize, easy to identify and easy to outlaw. Tiles were none of those things. A set of tiles could sit on a table in a teahouse looking like a puzzle or a pastime, and the same set could be understood by any player who knew the rules. Mahjong spread partly because it was portable, durable, and hard to legislate against.',
          'The game also inherited real structure from the card games that preceded it. The idea of matched sets, the ranking of suits, and the concept of a hand built from combinations rather than a single winning card all came from earlier Chinese card play. What mahjong added was the physicality: heavy tiles, a wall you build and demolish, and the audible clatter of a real table. That sensory element is a large part of why the game became a social ritual rather than just a pastime.',
          'Cities mattered to the early game. Shanghai and Ningbo were trading ports, and mahjong moved with the merchants, sailors and clerks who passed through them. By the end of the nineteenth century it was no longer a local game; it was a coastal Chinese one, and it was already on the move.',
          'It is worth saying that mahjong did not appear fully formed. Early variants differed in tile count, in scoring, and in which regional rules were treated as standard, and those disagreements never fully went away. The game that reached Shanghai in the 1890s and the game you play online today are recognisably the same family, but the family has always argued with itself.'
        ]
      },
      {
        heading: 'The 1920s Western Craze',
        body: [
          'Mahjong reached the United States in the early 1920s and became a genuine social phenomenon — the "mahjong craze". Hundreds of thousands of sets were sold, and American players quickly invented their own conventions, including the Charleston and later the annual hand card.',
          'The Chinese game also travelled to Japan, where it was refined into the Riichi ruleset that now dominates competitive play.',
          'What made the Western craze remarkable was its speed and its social range. Mahjong arrived as a fashionable import, sold in department stores, written up in women’s magazines, and played in living rooms rather than gambling halls. Within a few years it had moved from curiosity to craze to a fixture of home entertainment. Few imported games have ever spread that fast.',
          'The craze also explains an oddity that persists today: American mahjong uses rules that no Chinese player recognises. Because the game was adapted for home play rather than for the competitive tables it came from, American players built their own conventions from scratch. The Charleston and the annual card were not translations of Chinese practice; they were inventions, and they are the reason American mahjong is now a distinct game rather than a variant.',
          'The burst did not last forever. Like most crazes, the mahjong boom cooled in the West within a decade, and the game settled into a smaller but durable following. The important legacy is that it never disappeared — the clubs and conventions formed during the craze are the direct ancestors of the American game played today.',
          'Meanwhile the game took a very different path in Japan. There it was not treated as a parlour novelty but absorbed into an existing culture of competitive play, and the result was Riichi: stricter, formally scored, and built around declared patterns rather than the loose conventions of the American card. Two very different children from the same parent, and both are still being played tonight.'
        ],
        tiles: [{ "suit": 'wind', "wind": 'east' }, { "suit": 'wind', "wind": 'south' }, { "suit": 'wind', "wind": 'west' }, { "suit": 'wind', "wind": 'north' }]
      },
      {
        heading: 'Regional Reinvention',
        body: [
          'As mahjong spread it became many games. Japan built Riichi with its strict yaku and concealed-hand scoring. Taiwan developed the sixteen-tile game. Sichuan created the fast "bloody battle" variant. America kept the card-driven style that diverged furthest from the original.',
          'Each version kept the draw-and-discard core but rebuilt the scoring and strategy around local taste.',
          'The most visible variation is tile count. The classic game deals thirteen tiles and asks you to complete four sets and a pair. Taiwanese mahjong deals sixteen and asks for five sets and a pair, which makes every hand larger, slower, and more information-rich. Sichuan play strips the game down in the other direction, removing whole tile groups to speed up the deal and push players into faster, more aggressive hands.',
          'Scoring is the second axis, and the differences run deep. Riichi requires a yaku — a named pattern — before a hand can be declared at all, which means the scoring table is not an afterthought but the thing that decides whether a hand is legal. Chinese Official goes further with an eight-point minimum and a very large pattern catalogue. Hong Kong sits at the permissive end, with a three-faan minimum that lets ordinary hands win. These are not cosmetic differences; they change what a good hand looks like at each table.',
          'Then there is the question of what is counted at all. Some variants count flowers and seasons as immediate bonus points; some fold them into the deal; some remove them entirely. Dora, the extra bonus tiles that increase a hand’s value in Riichi, have no equivalent in most Chinese play. Learning a new variant is therefore less about memorising a table and more about learning which of these axes the variant has moved.',
          'The practical consequence for a beginner is that “the rules of mahjong” is not a single set of rules anywhere in the world. There is a shared family resemblance — the tiles, the wall, the draw-and-discard loop, the four-set-and-a-pair goal — and then there is a local layer on top that changes much of what matters. Knowing which layer you are in is the first thing a new player has to establish.'
        ]
      },
      {
        heading: 'Competitive Mahjong Today',
        body: [
          'The 21st century brought competitive mahjong: professional Riichi leagues, the Mahjong Competition Rules (MCR) for international play, and a worldwide online scene. Mahjong has also appeared in esports-adjacent events and streaming, reaching a new generation.',
          'Today the game is played on nearly every continent, in clubs, online platforms and at home.',
          'The competitive scene split into two broad approaches. Riichi developed professional leagues, standardised rules and a ranking culture, particularly in Japan, with televised matches and a dedicated following. International competition organised around MCR took the other route: a single ruleset designed to be playable across countries, with a scoring system broad enough to accommodate players trained in different traditions.',
          'Standardisation is harder in mahjong than in most games, and it is worth understanding why. Chess has one set of rules everywhere. Mahjong has dozens of regional variants, each with players who consider their version the real one. Any international ruleset is therefore a compromise, and the arguments about which compromise were part of mahjong’s culture long before anyone tried to run a world championship.',
          'Online play has quietly done more for the competitive scene than any rulebook. It removed geography as a constraint, let players in different countries meet at the same table, and provided a venue for the volume of games that competitive improvement actually requires. A player who might once have found a serious opponent once a week can now find one any evening.',
          'There is a live question about how far mahjong can go as a spectator sport. It is a game of hidden information, which is exactly the property that makes it hard to watch: the audience sees four closed hands and a discard row, and the drama happens inside decisions that the camera cannot show. Broadcasts work around this with expert commentary and delayed hand reveals, but it remains the central tension. The game is far more dramatic to play than to watch.'
        ]
      },
      {
        heading: 'The Cultural Meaning of Mahjong',
        body: [
          'In East Asia, mahjong is more than a game — it is a social ritual. Families gather around the table during holidays, and the game is a common bond across generations. In the West it carried a different weight, as a symbol of the exotic that became a beloved hobby.',
          'That dual life — deeply traditional yet endlessly adaptable — is exactly why mahjong survived and spread.',
          'The holiday table is the clearest example. In many families the game is not scheduled as entertainment but assumed, the way a meal is assumed. Grandparents, parents and children sit at the same table with the same rules, and the game becomes a way of spending time together that does not require anyone to explain themselves. Few games carry that weight in a family calendar.',
          'In the West the meaning is different and less settled. Mahjong arrived as an import and has never stopped being slightly novel there, which gives it a particular kind of social role: something between a hobby and a heritage someone is choosing to take up. American mahjong clubs in particular have an unusually strong community identity, organised around the annual card and around regular play rather than around competition.',
          'There is also a design reason the game travels so well, and it is worth naming. Mahjong has almost no hidden information about the rules — everything that matters is either on the table or in your hand — and it has a short teaching core. You can explain the loop of drawing and discarding in five minutes, even if the scoring takes years. That low floor is why the game has been adopted by so many cultures without ever being simplified into something else.',
          'Which brings the story to the present. The tiles on the table in a Hong Kong club, an American living room and a Japanese tournament hall are the same objects. Nearly two centuries after they began appearing in Chinese teahouses, the question of which rules you play is still open — and that openness, rather than any fixed tradition, is what has kept the game alive.'
        ]
      },
      {
        heading: 'Play the History',
        body: [
          'You can play the same classic game that swept Shanghai, Japan and the world — for free, online, against three computer opponents. The tiles you see are the same tiles players have been drawing for nearly two centuries.',
          'If the history appeals to you, the fastest way to understand why the game spread is to play a hand. The rhythm of the wall and the discard pile is much easier to appreciate at the table than in a description, and the ruleset you will see on our tables is the Hong Kong game at the centre of the mahjong family.',
          'Nothing is required to start. No account, no download, no cost, and no risk of doing anything irreversible. Play a few hands against the computer, then read the history again with real decisions behind you — the parts that seemed abstract tend to make sense the second time through.',
          'What you are picking up is something that has survived a craze, two world wars, the banning of its ancestors, and a century of reinvention in half a dozen countries. That kind of longevity is rare and it is not an accident. Whatever else the game is, it is something people do not want to give up.'
        ]
      },
    ],
    faq: [
      { question: 'Where was mahjong invented?', answer: 'Mahjong originated in China in the mid-19th century, most likely around Shanghai or Ningbo, from earlier Chinese card games translated into tiles.' },
      { question: 'Why did mahjong become popular in the West?', answer: 'The 1920s "mahjong craze" brought it to the US as a fashionable social game, and Western players developed their own variants like the Charleston and the annual hand card.' },
      { question: 'Is mahjong the same game everywhere?', answer: 'No. Chinese, Japanese, American, Taiwanese and Sichuan mahjong are distinct games sharing a core of tiles, drawing and discarding.' },
      { question: 'How old is mahjong?', answer: 'Around 150 years old. It emerged in mid-19th-century China and has been reinvented by every culture that adopted it.' },
      { question: 'When did Japanese Riichi mahjong take shape?', answer: 'Riichi crystallised in early-to-mid 20th-century Japan from Chinese tile games already played there. Modern competitive Riichi — with its yaku gate, riichi declaration and dora — solidified through organised clubs and later televised and online play.' },
      { question: 'Is “mahjong” the same word as the matching solitaire game?', answer: 'In English marketing, yes — and that causes confusion. Four-player mahjong and “mahjong solitaire” share artwork and the name, but solitaire is a single-player matching puzzle, not the draw-and-discard game that spread from China.' },
      { question: 'Where is competitive mahjong strongest today?', answer: 'Organised Riichi is strongest in Japan and growing worldwide through clubs and online leagues. Mainland China has huge online and regional scenes (including Sichuan), while Hong Kong style remains the common social table across much of the diaspora.' },
    ]
  }
,
  {
    slug: 'how-to-play-american-mahjong',
    title: 'How to Play American Mahjong: Complete Beginner Guide',
    description:
      'American mahjong is not the game in Chinese mahjong guides. Learn the 152-tile set, the Charleston, jokers, the annual NMJL card, dead hands and how scoring really works — with a full walkthrough of your first hand.',
    readMinutes: 11,
    keywords:
      'how to play american mahjong, american mahjong rules, american mahjong for beginners, nmjl card, charleston mahjong, american mahjong jokers',
    publishedAt: '2026-09-17',
    heroTiles: [{ "suit": 'char', "rank": 1 }, { "suit": 'dot', "rank": 1 }, { "suit": 'bamboo', "rank": 1 }, { "suit": 'dragon', "dragon": 'red' }, { "suit": 'dragon', "dragon": 'white' }],
    cta: { label: 'Play Mahjong Now', href: '/games/classic' },
    sections: [
      {
        heading: 'American Mahjong Is a Different Game',
        body: [
          'American mahjong uses the same tiles you have seen in Chinese mahjong, and almost none of the same rules. In the Chinese game you win by building four sets and a pair. In the American game you win by matching one exact hand printed on a card that the National Mah Jongg League reissues every spring — and if your fourteen tiles do not match a line on that card, they are worth nothing at all.',
          'Three things separate the two games. The card decides what is legal this year. Jokers, eight wild tiles that exist in no other variant, stand in for tiles inside a group of three or more. And the Charleston — a round of passing tiles before the first draw — lets every player steer their hand before luck takes over. Everything else in this guide grows out of those three.'
        ]
      },
      {
        heading: 'The Tiles: 152, Not 144',
        body: [
          'An American set holds 152 tiles. The numbered tiles are the same as everywhere else: three suits — craks (characters), bams (bamboo) and dots — each running from one to nine with four copies of every tile, 108 in total. American players almost always use the short names, so a "three bam" is what a Chinese player calls a three of bamboo. The suits are colour-coded on the tile faces themselves — characters in red and black, bamboo in green, dots in a mix of blues and reds — but the colours printed on the card mean something else entirely, and mixing the two up is a standard first-week mistake.',
          'The count changes in the honours. Sixteen winds (four each of East, South, West and North), twelve dragons (four Red, four Green, four White), eight flowers and eight jokers. Sixteen plus twelve plus eight plus eight is forty-four, and 108 plus 44 is 152 — the jokers are the eight tiles a Chinese set does not have at all.',
          'Two of those tiles change how the game feels. Flowers are not set aside and scored the way they are in Chinese play; they are passed during the Charleston and used inside the hands that call for them. And jokers are wild, but only inside groups. There is also no chow in American mahjong — no runs of three consecutive tiles. Chinese players reach for that move by habit in their first American game, and it is not there. What replaces it is the quint: five identical tiles in a single group, a shape that cannot be completed without jokers and that gets its own section of the card.'
        ],
        tiles: [{ "suit": 'char', "rank": 1 }, { "suit": 'bamboo', "rank": 1 }, { "suit": 'dot', "rank": 1 }, { "suit": 'wind', "wind": 'east' }, { "suit": 'dragon', "dragon": 'red' }]
      },
      {
        heading: 'You Cannot Win Without the Card',
        body: [
          'Every spring the National Mah Jongg League publishes a new card, and every spring it is different. A card lists somewhere between 65 and 75 legal hands, grouped into sections by theme — the year itself, 2468, Quints, Consecutive Run, 13579, Winds and Dragons, 369, and Singles and Pairs. You may build any hand on that card. You may build nothing else. The card is published by the league and sold each spring rather than shipped with any set, which is why a second-hand set on a resale site so often has everything except the one thing you actually need.',
          'Read a line the way you read a recipe. Numbers are literal, with one exception: a zero stands for the White Dragon, which American players call the soap. The letter F is a flower and D is a dragon. Colour carries meaning — two tiles printed in the same colour must come from the same suit, and two tiles in different colours must come from different suits. You choose which suits to use, and that choice is most of your strategy.',
          'This is why American players say the game is relearned every year. A hand that was legal last April may not exist this April. For your first session, do not try to learn the card. Pick two lines that use three or four groups, prop the card next to your rack, and play only those.'
        ],
        tiles: [{ "suit": 'dot', "rank": 2 }, { "suit": 'dot', "rank": 2 }, { "suit": 'dot', "rank": 2 }, { "suit": 'dot', "rank": 4 }, { "suit": 'dot', "rank": 4 }, { "suit": 'dot', "rank": 4 }, { "suit": 'dot', "rank": 6 }, { "suit": 'dot', "rank": 6 }, { "suit": 'dot', "rank": 6 }]
      },
      {
        heading: 'The Charleston: Three Passes Before Anyone Draws',
        body: [
          'Before the first draw, every player passes tiles. The first Charleston is mandatory and always runs in the same direction: three tiles to the player on your right, three across the table, three to the player on your left. Nine tiles leave your hand and nine arrive before a single tile is drawn from the wall. In practice you pass the three tiles that fit nothing you are holding, and you hope the nine coming back are less random than the nine going out.',
          'A second Charleston may follow in the reverse direction — left, across, right — but any player may stop it, and in most groups someone does. During that second pass you may also make a blind pass, sending on tiles you have just received without looking at them, which helps when everything you have been handed is wrong for the hand you are chasing.',
          'One rule catches everybody: jokers cannot be passed. They stay in your rack through the whole exchange. After the Charleston you and the player opposite may agree a courtesy pass of up to three tiles, and that number is negotiated rather than fixed — you may ask for three and receive none. The Charleston exists only in American mahjong, and it is the reason two players who start with similar tiles can end up in completely different hands.'
        ],
        tiles: [{ "suit": 'char', "rank": 3 }, { "suit": 'char', "rank": 4 }, { "suit": 'char', "rank": 5 }]
      },
      {
        heading: 'Setting Up: Walls, Dice and Racks',
        body: [
          'All 152 tiles go face down and get shuffled, then each player builds a wall in front of their rack — nineteen tiles long and two tiles high, 38 to a side. Dice decide who is East, and East rolls again to decide where the wall is broken. Two dice produce the total, and that total fixes both who deals and where the wall is broken. Online it happens without you noticing; in person it is the moment everyone leans in to check the count.',
          'Tiles are dealt from the broken wall in fours. East ends up with fourteen and everyone else with thirteen, and each player stands their tiles on a rack with the faces toward them. The rack is not decoration: it keeps a hand private in a game whose tiles are tall enough to be read from across the table.',
          'East discards first, and play then moves counter-clockwise around the table. A turn is a draw and a discard, exactly as in Chinese mahjong. What differs is what you are allowed to do with the tiles other people throw away, and that is where the game turns.'
        ]
      },
      {
        heading: 'Jokers: Where They Fit and Where They Never Fit',
        body: [
          'A joker is a wild tile, and it is the most misused tile in the game. It can stand in for any tile you need inside a group of three or more — a pung of three, a kong of four, a quint of five. Where a hand offers you a choice of suits, the joker takes whichever suit you choose.',
          'What a joker cannot do is just as firm. It cannot stand in for a pair. It cannot stand in for a single tile. It cannot be used inside NEWS, the grouping of one of each wind, or inside the year numbers, because those groupings are about specific tiles rather than interchangeable ones. This one restriction kills more beginner hands than any other rule, because a pair looks exactly like a group that is one tile short. Picture two Red Dragons in your rack with a joker beside them. That is a pair plus a spare tile, not a pung — and if you lay it down as one, you have exposed a group the card does not recognise.',
          'There is one escape hatch, and you should know it before somebody uses it on you. If a player exposes a group containing a joker, any player may swap for it: you hand over the real tile the joker is standing in for, add one extra tile from your hand as compensation, and the joker comes to you. You cannot take a joker out of a group just to keep it. The swap has to be paid for.'
        ],
        tiles: [{ "suit": 'dragon', "dragon": 'red' }, { "suit": 'dragon', "dragon": 'red' }, { "suit": 'dot', "rank": 5 }]
      },
      {
        heading: 'Exposing a Hand: Calling and the C on the Card',
        body: [
          'You may claim a discard to complete a group of three or more, and you must then lay that group face-up on your rack. You cannot claim a discard to make a pair — with one exception, which is claiming the tile that wins the hand outright.',
          'Every hand on the card is marked either X or C. X means exposed: you may call discards freely while building it. C means concealed: you may not call anything except the tile that completes your hand, and the rest stays hidden on your rack until the end. Concealed hands are harder to finish and they pay more. The gap is deliberate: a C hand cannot be fed by the table, so the card pays you for building it blind.',
          'Exposure is a commitment, not a convenience. The moment you lay a group down it is fixed, the table can see what you are chasing, and any joker inside it becomes available to whoever wants to pay for the swap. If that group turns out to belong to no line on the card, you have not simply given away information — you have killed the hand.'
        ],
        tiles: [{ "suit": 'dragon', "dragon": 'green' }, { "suit": 'dragon', "dragon": 'green' }, { "suit": 'dragon', "dragon": 'green' }]
      },
      {
        heading: 'Dead Hands and the Two Ways Beginners Reach Them',
        body: [
          'A dead hand is a hand that can no longer win, whatever you draw. It happens when the tiles you have exposed match no line on the card, or when your hand holds the wrong number of tiles. A dead hand keeps drawing and discarding until somebody else wins, but it cannot win itself.',
          'Beginners reach a dead hand the same two ways almost every time. The first is exposing a group that fits no line — usually because two lines were being chased at once and the group belonged to neither. The second is declaring a win with the wrong count: fourteen tiles for most hands, more for hands built on kongs or quints, and a hand that is one tile off is simply a hand that has not won.',
          'The cure is boring and it works. Before you lay a group down, put a finger on the line you are building and read it back. If the group is on that line, expose it. If you cannot find it in three seconds, do not. Experienced players do this without thinking, which is why they rarely go dead. And if you do go dead, the hand is not over — you keep drawing and discarding, and your job becomes making sure nobody wins off you. A dead hand that folds safely costs you nothing but time.'
        ]
      },
      {
        heading: 'Scoring: Who Pays What',
        body: [
          'Every hand on the card carries a value, and the values run from roughly twenty-five to roughly seventy-five. That number is the size of the pot for that hand. The card decides it — not how well you played.',
          'Only three things change what each player actually pays. Who threw the winning tile. Whether you drew it yourself. And whether your hand is jokerless.',
          'Win on a discard and the player who threw it pays double while the other two pay face value. Draw the tile yourself and every player pays double. The total settles between you and each opponent rather than out of a central pot, which is why American players keep score on a slip of paper instead of stacking chips. Run it once and the shape of the game becomes clear: a thirty-point hand won on a discard pays sixty from the thrower and thirty from each of the other two, a hundred and twenty in total. Win the same hand on your own draw and all three opponents pay sixty, which comes to a hundred and eighty.',
          'A jokerless hand — one built with no wild tiles at all — doubles what every opponent pays, except in the Singles and Pairs section, where jokers are barred anyway and the bonus would mean nothing. If the wall runs out before anyone completes a hand, that is a wall game: nobody wins, nobody pays, and the deal passes on.'
        ]
      },
      {
        heading: 'Your First Session',
        body: [
          'Set the card where you can see it and pick two X hands that use three or four groups. X hands let you call tiles, which keeps the game moving while you learn. Ignore the point values on the first night and ignore Singles and Pairs completely — those hands are hard, and jokers are banned inside them. If you are learning alone, pick hands you can picture finishing in five turns. If you are learning at a table, say your target hand out loud for the first few deals — hearing a hand named is how most American players learned the card in the first place.',
          'Play three or four hands before you decide anything about the game. The Charleston will feel chaotic for two of them, you will probably expose a group you should not have, and the card will take longer to read than you expect. After one evening it stops being a puzzle and becomes a shape you recognise.'
        ]
      },
    ],
    faq: [
      { question: 'How many tiles are in an American mahjong set?', answer: 'American mahjong is played with 152 tiles: 108 numbered tiles across three suits, 16 winds, 12 dragons, 8 flowers and 8 jokers. The eight jokers and eight flowers are what make an American set larger than the 144-tile Chinese set.' },
      { question: 'What is the Charleston in American mahjong?', answer: 'The Charleston is a mandatory round of passing tiles before the first draw. Each player passes three tiles to the right, three across and three to the left. A second Charleston in reverse is optional and any player may stop it. Jokers can never be passed.' },
      { question: 'Can I use a joker for a pair in American mahjong?', answer: 'No. A joker can only stand in for a tile inside a group of three or more — a pung, kong or quint. It can never substitute for a pair, a single tile, one of the four winds in NEWS, or a tile in the year numbers.' },
      { question: 'Do I need a new mahjong card every year?', answer: 'Yes. The National Mah Jongg League publishes a new card each spring with a different set of legal hands, and only the current card is valid. Older cards describe hands that no longer exist, so they cannot be used at a table playing the current year.' },
      { question: 'What is a dead hand?', answer: 'A dead hand cannot win, no matter what you draw. It usually comes from exposing a group that matches no line on the card, or from holding the wrong number of tiles. You keep playing the hand out, but you cannot win it yourself.' },
      { question: 'Is American mahjong harder than Chinese mahjong?', answer: 'It is harder to start and easier to master. You cannot win by building any sensible shape — you have to match a line on the card, which takes a few sessions to read fluently. But with no chows and a fixed list of hands, there are fewer patterns to learn than in Chinese play.' },
      { question: 'Can I play American mahjong online for free?', answer: 'Yes. Our tables deal a full hand against computer opponents, track the wall and score every win for you, so you can learn the card and the Charleston without needing three other players at the table.' },
    ]
  },
  {
    slug: 'how-many-players-mahjong',
    title: 'How Many Players Can Play Mahjong? 2, 3 and 4-Player Setups',
    description:
      'Mahjong is built for four players, but you can play tonight with two or three. Learn exactly what changes: the wall, claiming, the Charleston, sanma, Siamese racks, which tiles to remove, and how scoring adjusts.',
    readMinutes: 11,
    keywords:
      'how many players play mahjong, 3 player mahjong, 2 player mahjong, mahjong with 3 players, sanma rules, two player mahjong',
    publishedAt: '2026-09-17',
    heroTiles: [{ "suit": 'wind', "wind": 'east' }, { "suit": 'wind', "wind": 'south' }, { "suit": 'wind', "wind": 'west' }, { "suit": 'wind', "wind": 'north' }],
    cta: { label: 'Play Mahjong Now', href: '/games/hong-kong-mahjong' },
    sections: [
      {
        heading: 'Why Four Players Became the Standard',
        body: [
          'Mahjong is written for four. The wall is built in four sides, the seats are named after the four winds, and the rule that a hand needs four sets and a pair quietly assumes there are four hands in play. Four is also the number the game needs to work as a game of information: with three opponents reading a shared discard pile, every tile you throw away is a signal and every tile you keep is a hint you cannot help giving. Change the count and you change how much information is in the room, which is the real variable in every adaptation below.',
          'None of that makes four mandatory. Mahjong adapts to two, three or five players with small mechanical changes — you remove tiles or seats, you change who may claim a discard, and occasionally you change what counts as a win. What follows is exactly what moves in each case, so you can sit down tonight with whoever is actually available.'
        ]
      },
      {
        heading: 'What Actually Changes When a Seat Is Empty',
        body: [
          'Four things move when a seat goes empty, and only one of them is obvious. The tiles that seat would have drawn stay in the wall. Whoever would have passed you tiles in the Charleston is gone. The number of players who can claim a discard drops. And the number of people who pay you when you win drops with it.',
          'The wall is the change players feel first. Four players take 52 tiles into their hands before play begins; three players take 39. That leaves more tiles in the wall, which sounds like an advantage and mostly is — hands finish instead of stalling, because the wall runs dry far less often. Three-player games end in an actual win more frequently than four-player ones, and they end sooner. Do the division and the reason is plain: a four-player hand gives each player roughly twenty-one draws, and a three-player hand gives each of them about thirty.',
          'The change you notice last is the information. Three opponents means three people reading your discards and three hands competing for the tiles you need; two opponents means half as many eyes on you and the tiles you want concentrated in fewer hands. Fewer players does not make the game easier. It makes it more direct, which is why three-handed mahjong is usually faster and more aggressive than the game you are used to.'
        ]
      },
      {
        heading: 'Three Players, American Style',
        body: [
          'American mahjong allows three-handed play, and the simplest adaptation is to skip the Charleston entirely. There are no passes at all, the dealer discards first, and play begins immediately. For a game whose opening ritual is a nine-tile exchange, dropping it changes more than it sounds — you start with the hand you were dealt and no chance to repair it.',
          'The alternative that most groups actually use is a ghost seat. A fourth hand is dealt face down and never played, but it still takes part in the Charleston, with tiles passing to and from a wall nobody draws from. This keeps the exchange intact and keeps the table’s rhythm, at the cost of three passes’ worth of tiles that vanish out of the game. Setup takes one extra step: deal the ghost hand as though a fourth player were sitting there, leave it face down in front of the empty space, and pass to it on every leg of the Charleston. Nobody looks at it, and it never draws or discards.',
          'Choose between them by what your table wants. Skip the Charleston if you want speed, a clean start and no bookkeeping. Use the ghost seat if the ritual is part of why you play — the passing, the reading of who gave you what, the small politics of a courtesy pass. Both are legal, and both are played in American clubs.'
        ]
      },
      {
        heading: 'Three Players, Japanese Style: Sanma',
        body: [
          'Japanese three-player mahjong has a name, sanma, and it is not a house rule. It is a recognised variant with its own competitive scene, and in some parts of Japan it is played more than the four-player game.',
          'Sanma removes the 2 through 8 of one suit — 28 tiles in total — leaving 108. The suit that gets cut is normally characters, which leaves the one and the nine sitting in a suit where nobody can build a run. What is left is a faster, more aggressive game: fewer tiles to read, more turns that matter, and a higher chance that any given discard is genuinely dangerous. A three-handed wall also stretches further per player than a four-handed one, which sounds like it should slow things down and does the opposite — more draws means more chances to complete, so sanma players push thinner hands than they would with four at the table.',
          'Sanma also changes the furniture of the game. A drawn north wind often counts as a bonus tile rather than a usable seat wind, riichi gets declared more often because scoring is compressed, and hands run shorter from start to finish. If your group knows Japanese mahjong and is one player short, this is the variant to play — the rules are settled, so nobody has to argue about house rules at the table.'
        ],
        tiles: [{ "suit": 'wind', "wind": 'east' }, { "suit": 'wind', "wind": 'south' }, { "suit": 'wind', "wind": 'west' }]
      },
      {
        heading: 'Two Players: The Draw-Only Duel',
        body: [
          'The simplest two-player game removes claiming altogether. Each player draws from the wall, decides, and discards. Nobody may pong, kong or chow another player’s discard. You are not so much playing against your opponent as racing them, and the first player to complete a hand wins it. Set it up by dealing thirteen tiles each and leaving the rest of the set in the wall; you need no ghost hand and no rulebook, because the only thing you removed is the right to claim.',
          'This version is slower per hand and much better for learning. Because no discard can be claimed, every tile you need has to come off the wall, which means you spend the whole game reading your own hand and counting tiles instead of watching three discard rows. It is the fastest way to find out which shapes actually connect and which ones stall forever.',
          'It also has a quiet tactical layer that four-player games rarely offer. With one opponent and no calling, the discards in front of them are the only information you have — and that information is complete. If both copies of a tile you need are already lying in their pile, you can abandon that hand before you waste ten turns chasing it.'
        ]
      },
      {
        heading: 'Two Players: Siamese Racks',
        body: [
          'American mahjong has its own two-player format, usually called Siamese mah jongg, and it does not shrink the game — it doubles it. Each player runs two racks, 27 tiles in total, and has to complete two hands rather than one. There is no Charleston; you start from what you were dealt. Set the two racks one above the other and deal 27 tiles to each player — two hands’ worth — and the wall still holds close to a hundred tiles, so the game does not run dry before somebody finishes.',
          'The interest is in choosing what to build. Before your first discard you are looking at 27 tiles and picking two lines off the card, and the temptation is to pick the two hands you like best. The better play is to pick two hands that share as few tiles as possible, so that a tile which helps one rack is not sitting useless in the other. You may move tiles between your racks freely while both are concealed; once a group is exposed, it belongs to that rack for good.',
          'Two racks also change the endgame. You declare each completed hand separately, and the first declaration locks in its jokers — nobody can swap a joker out of a hand you have already declared. Winning both racks is the goal, and finishing one while your opponent finishes neither is usually enough to take the game.'
        ]
      },
      {
        heading: 'What to Remove From the Set',
        body: [
          'Some variants take tiles out, and the arithmetic is worth knowing before you start pulling tiles off the table. Chinese three-player play usually drops the North wind: remove all four north tiles and you are down to 132, with the north seat simply not existing and north often treated as a bonus for whoever holds it.',
          'Japanese sanma cuts far deeper, removing 28 tiles — the 2 through 8 of one suit — and leaving 108. The trade is that the wall gets thin relative to the number of players, which is part of why sanma hands run fast and finish often. You are not removing tiles to make the game harder; you are removing them to keep three hands from drawing dead. The rule of thumb is that tiles come out in multiples of four: four winds, or seven ranks across one suit. That is why the Chinese adjustment is four tiles and the Japanese one is twenty-eight.',
          'Two-player games usually remove nothing at all. With half the hands in play, a standard set already leaves an unusually deep wall — 110 tiles against 26 held — so the game plays out instead of stalling, and cutting tiles would only make it end faster than it needs to.'
        ],
        tiles: [{ "suit": 'char', "rank": 2 }, { "suit": 'char', "rank": 5 }, { "suit": 'char', "rank": 8 }]
      },
      {
        heading: 'Five Players and Beyond: Passing the Seat',
        body: [
          'Five players is easier than three, because nothing about the game changes. Four play a standard hand while one sits out, and the seat rotates so nobody sits out twice before everybody has. Many groups send out the player who came second in the previous hand; some send out the last-place finisher as a gentler penalty. The seated four play entirely normal mahjong — same wall, same Charleston, same claims, same scoring — and nothing at the table tells the fifth player they are not in a standard game.',
          'Six players works the same way with two seats moving. The alternative — a five-player table where everybody plays — usually goes badly: five hands competing for the same 136 tiles means the wall runs down faster, draws get more frequent, and two players will spend most hands holding nothing that connects.',
          'Rotating a seat is the only adaptation that changes no rule at all. Nobody removes tiles, nobody changes how claiming works, and the Charleston still runs with four players, because there are four. If your group is larger than four, this is the answer. The game was designed for exactly four people, and it rewards you for keeping it there.'
        ]
      },
      {
        heading: 'How Scoring and Minimums Adjust',
        body: [
          'Fewer players means fewer people paying, and that changes the shape of a session more than any single rule. In a four-player game a win collects from three opponents. In a three-player game it collects from two, so the same card value moves a third less on the scorepad.',
          'The honest fix is not to inflate the values but to count hands instead of a running total. Ten hands of three-player play is a session; ten hands of four-player play is a session too, and both are worth playing. Comparing raw totals across the two formats is the mistake, not the scoring.',
          'The other lever is the minimum. Chinese and Japanese rulesets set a floor — three faan in Hong Kong, one yaku in riichi, eight points in Chinese Official — and that floor exists to stop players winning with a hand that is technically complete but strategically empty. With fewer players the same floor bites harder, because the wall is deeper and cheap hands are easier to assemble. If your three-player sessions feel slow, lower the minimum before you change anything else. One concrete version: drop the Hong Kong floor from three faan to two for a few hands and watch what happens — cheap hands start finishing, the wall stops running out, and hands per hour roughly doubles. That is a better trade than inflating every card value, which changes the arithmetic without changing how often anybody wins.'
        ]
      },
      {
        heading: 'Which Setup Should You Play Tonight?',
        body: [
          'Two players: play the draw-only duel while you are learning, and Siamese racks once you know the card and want a real game. Three players: use a ghost seat if you are playing American and want the Charleston, sanma if you are playing Japanese and want a settled ruleset, or skip the Charleston if you simply want to start. Four players: play the standard game. Five or more: rotate the seat and play the standard game.',
          'The player count was never the hard part. Every version above uses the same 136 or 152 tiles, the same draw-and-discard turn and the same four-sets-and-a-pair target. What changes is how much information you have and how many people are paying when somebody finally wins. If you are not sure which ruleset to learn first, Hong Kong mahjong is the gentlest entry point for a small table — its three-faan minimum lets you win with the shapes you are already building by accident. Pick the version that fits who is actually in the room, and play.'
        ]
      },
    ],
    faq: [
      { question: 'How many players do you need for mahjong?', answer: 'Four is standard, and it is what every ruleset assumes. You can play with two or three by adapting the setup, and with five or more by rotating one seat out between hands so that four players are always at the table.' },
      { question: 'Can you play mahjong with 3 players?', answer: 'Yes. In American mahjong the Charleston is usually skipped, or a ghost fourth hand is dealt to keep the passing sequence intact. Japanese mahjong has a formal three-player variant, sanma, that removes 28 tiles and is played competitively.' },
      { question: 'Can 2 people play mahjong?', answer: 'Yes. The simplest version lets players draw and discard only, with no claiming at all. American mahjong has its own two-player format called Siamese mah jongg, where each player runs two racks of 27 tiles and must complete two hands.' },
      { question: 'What is sanma?', answer: 'Sanma is Japanese three-player mahjong. It removes the 2 through 8 of one suit — 28 tiles — leaving 108 in play. The result is a faster, more aggressive game that is played competitively in Japan rather than treated as a casual workaround.' },
      { question: 'Do you remove tiles in three-player mahjong?', answer: 'Not always. American three-handed play keeps all 152 tiles and simply skips the Charleston or deals a ghost hand. Chinese three-player play commonly removes the four North wind tiles, leaving 132. Japanese sanma removes 28 tiles, leaving 108.' },
      { question: 'Can 5 people play mahjong?', answer: 'Yes, by rotating the seat. Four players play a standard hand while the fifth sits out, and the seat moves each hand so nobody sits out twice in a row. This changes no rule at all, which is why it works better than trying to play with five hands.' },
      { question: 'Does the Charleston change with fewer players?', answer: 'In American mahjong, yes. With three players you either skip the Charleston entirely or deal a ghost hand that takes part in the passing. Two-player Siamese mah jongg has no Charleston at all. Japanese and Chinese rulesets have no Charleston in any format.' },
    ]
  }
];
