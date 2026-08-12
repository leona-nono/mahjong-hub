export type GameCategory =
  | 'mahjong'
  | 'connect'
  | 'solitaire'
  | 'tile-match'
  | 'four-player';

/** Which in-house component renders a native game. */
export type NativeGame = 'mahjong-table' | 'mahjong-connect' | 'mahjong-solitaire';
export type GameType = 'iframe' | 'native' | 'coming-soon';

/**
 * Ruleset id mirrored from lib/mahjong/engine. Kept as a string literal so this
 * module — which every page imports — stays free of engine imports.
 */
export type NativeRuleset = 'hongkong' | 'riichi' | 'chinese-official';

export interface GameFaq {
  question: string;
  answer: string;
}

/** Long-form copy that makes a native game page worth indexing. */
export interface GameContent {
  /** One paragraph shown above the board. */
  intro: string;
  /** Ordered "how to play" steps. */
  howToPlay: string[];
  /** Strategy notes — the part that earns dwell time and links. */
  tips: string[];
  faq: GameFaq[];
}

export interface GameConfig {
  /** URL-safe unique id, also used as the game page slug. */
  slug: string;
  /** Display id (for reference). */
  pageName: string;
  /** English display title (used as default; localized via page copy). */
  title: string;
  /** English short description (default; localized via page copy). */
  description: string;
  category: GameCategory;
  gameType: GameType;
  /** External embed URL (verified embeddable) — iframe games only. */
  gameIframeUrl?: string;
  /** In-house component to mount — native games only. */
  native?: NativeGame;
  /** Ruleset passed to the native four-player table. */
  ruleset?: NativeRuleset;
  /** Player count, used in the schema.org payload. */
  players?: number;
  /** Highlight on the home page. */
  featured?: boolean;
  /** Indexable long-form copy. Native games only — iframe pages stay noindex. */
  content?: GameContent;
}

/**
 * Curated mahjong elimination collection.
 * Embed URLs are external game hosts (1games.io / Google GameSnacks) that were
 * technically verified as iframe-embeddable. These are facts (links), not copied code.
 */
export const games: GameConfig[] = [
  // ---------------------------------------------------------------- native --
  // Ours. Code lives in lib/mahjong and lib/connect, written clean-room against
  // the published rules. Indexable, with full rules copy.
  {
    slug: 'hong-kong-mahjong',
    pageName: 'hong-kong-mahjong',
    title: 'Hong Kong Mahjong',
    description:
      'Play real four-player mahjong against three opponents. Hong Kong Old Style scoring, free, no download.',
    category: 'four-player',
    gameType: 'native',
    native: 'mahjong-table',
    ruleset: 'hongkong',
    players: 4,
    featured: true,
    content: {
      intro:
        'Mahjong Hub Hong Kong Mahjong is a four-player product ruleset based on Hong Kong Old Style. It uses Characters, Dots, Bamboo, Winds, Red Dragon and Green Dragon; White Dragon plus all Flowers and Seasons are deliberately excluded. Build four sets and one pair, then choose Casual mode for beginner-friendly chicken hands or Standard mode for the traditional three-faan minimum.',
      howToPlay: [
        'The 132-tile product wall contains Characters, Dots, Bamboo, Winds, Red Dragon and Green Dragon. White Dragon, Flowers and Seasons are not used.',
        'Each player starts with 13 tiles; East starts with 14 and makes the first discard. On a later turn, draw one tile and then discard one, keeping your hand at 13.',
        'A winning hand is four sets plus one pair. A set is either three identical tiles or three consecutive tiles in the same suit.',
        'When another player discards a tile you need, you may call it: pong for a triplet, chi for a sequence (from the player to your left only), or kong for all four copies.',
        'Calling a tile makes your hand open, which costs you some scoring patterns. Take the call only when it genuinely moves you forward.',
        'Declare a win by self-draw or on another player\u2019s discard. Casual mode accepts any complete four-sets-and-a-pair hand; Standard mode requires at least three faan.',
        'After settlement, East keeps the dealer seat after a dealer win or a draw; otherwise the dealer moves to the next seat.'
      ],
      tips: [
        'Discard lone honour tiles early. They are the hardest tiles to pair up and the least flexible thing in your hand.',
        'Track your distance to ready rather than staring at individual tiles. Two away is a normal mid-game position; one away is when you start playing carefully.',
        'A hand of all one suit is worth far more than the sum of its parts. Dealt seven or eight tiles in a single suit, committing early usually pays.',
        'Watch the other seats. Three players throwing away the same suit means the tiles you need are probably still live.',
        'In Standard mode, verify the faan total before committing to a call: a complete shape below three faan is not a legal win.'
      ],
      faq: [
        {
          question: 'Do I need to download anything?',
          answer:
            'No. The game runs entirely in your browser on desktop and mobile, and nothing is installed.'
        },
        {
          question: 'Is this real mahjong or the tile-matching game?',
          answer:
            'This is real four-player mahjong with drawing, discarding, calling and scoring. The tile-matching game most Western sites call "mahjong" is mahjong solitaire, which is a different game.'
        },
        {
          question: 'What is the difference between Casual and Standard mode?',
          answer:
            'Casual mode lets any structurally complete hand win and awards a one-faan chicken hand when no other pattern scores. Standard Hong Kong mode requires at least three faan, so a complete lower-scoring hand must keep playing.'
        },
        {
          question: 'Is there any real-money gambling?',
          answer:
            'No. There is no wagering, no purchasable currency and no cash prize of any kind. Scores track your own progress only.'
        }
      ]
    }
  },
  {
    slug: 'riichi-mahjong',
    pageName: 'riichi-mahjong',
    title: 'Riichi Mahjong',
    description:
      'Japanese Riichi mahjong against three opponents. The ruleset behind the modern competitive scene.',
    category: 'four-player',
    gameType: 'native',
    native: 'mahjong-table',
    ruleset: 'riichi',
    players: 4,
    featured: true,
    content: {
      intro:
        'This four-player Japanese Riichi table follows the approved World Riichi Championship 2025 baseline: no red fives, one-winner head-bump, and a 30,000-point start.',
      howToPlay: [
        'Each player starts with 13 tiles. Draw one tile and discard one, aiming for four sets and a pair; Seven Pairs and Thirteen Orphans are also valid closed shapes.',
        'A complete shape is not enough: the hand needs at least one yaku. Dora adds value but is not a yaku by itself.',
        'Chi is available only from the player on your left. Pon, Kan and Ron may be called from any opponent, subject to claim priority.',
        'Keep the hand closed and reach tenpai to declare Riichi. Choose a highlighted discard and place a 1,000-point stick.',
        'Win by Tsumo on your own draw or Ron on an opponent discard. Under WRC head-bump, only the first winner in turn order receives the Ron.',
        'The match runs through East and South rounds. In this product baseline, a dealer win or an exhaustive draw keeps the dealer; exhaustive draws use a 3,000-point noten payment.',
        'This table uses 136 tiles, a 14-tile dead wall, Dora indicators and no red fives.'
      ],
      tips: [
        'Secure a yaku before chasing Dora: bonus tiles cannot make an otherwise yaku-less hand legal.',
        'Compare shanten and effective tiles before every discard; keep shapes with more improving draws.',
        'Against Riichi, begin with genbutsu, then use suji and visible tile walls to reduce risk.',
        'Declare Riichi deliberately: compare wait quality, hand value, remaining tiles and the match score.',
        'Do not force low-value attacks late in the hand when a safer fold protects your position.'
      ],
      faq: [
        {
          question: 'How is Riichi different from Chinese mahjong?',
          answer:
            'Riichi requires a scoring pattern before a win can be declared, values concealed hands more highly, and uses a different scoring table. The draw-and-discard core is the same, so the two transfer easily.'
        },
        {
          question: 'Is this a good place to learn Riichi?',
          answer:
            'It is a good place to get comfortable with the flow, the calls and the common patterns. The readiness hint shows how far you are from a complete hand, which is the single most useful thing for a new player to see.'
        }
      ]
    }
  },
  {
    slug: 'chinese-official-mahjong',
    pageName: 'chinese-official-mahjong',
    title: 'Chinese Official Mahjong',
    description:
      'Chinese Official (MCR) mahjong with the eight-point minimum — the international tournament ruleset.',
    category: 'four-player',
    gameType: 'native',
    native: 'mahjong-table',
    ruleset: 'chinese-official',
    players: 4,
    content: {
      intro:
        'Chinese Official, also called Mahjong Competition Rules (MCR), is the four-player international tournament ruleset. It uses 144 tiles, including Flowers and Seasons, and requires a legal hand to reach at least eight points from its official scoring elements.',
      howToPlay: [
        'Standard four-player mahjong: draw, discard, and build four sets plus a pair.',
        'A hand must be worth at least eight points before it can be declared. Simple hands with no pattern do not qualify.',
        'Points come from patterns — flushes, all-triplets, dragon and wind sets, and many more — which stack together.',
        'Because the minimum is high, calling tiles to rush a weak hand is usually a losing plan.'
      ],
      tips: [
        'Pick a direction in the first few turns. Flush hands and all-triplet hands are the most reliable ways to clear eight points.',
        'Dragon and seat-wind triplets are worth taking even at the cost of a turn, because they combine with almost everything else.',
        'A hand one tile from complete but worth only six points is not yet a hand. Keep improving it.'
        ,'Check the score before calling a win: MCR has overlap and exclusion rules, so visible patterns do not always stack.'
      ],
      faq: [
        {
          question: 'Why can I not declare a win on a complete hand?',
          answer:
            'Chinese Official requires eight points minimum. If your completed hand scores less, the win cannot be declared and play continues.'
        },
        {
          question: 'Is the scoring here complete?',
          answer:
            'It covers the common patterns rather than the full official table. It is built for learning and casual play, not for tournament adjudication.'
        }
      ]
    }
  },
  {
    slug: 'sichuan-mahjong',
    pageName: 'sichuan-mahjong',
    title: 'Sichuan Mahjong',
    description: 'Sichuan Blood Battle Mahjong with Exchange Three, a forbidden suit, and continued play after the first win.',
    category: 'four-player',
    gameType: 'coming-soon',
    players: 4,
    featured: true,
    content: {
      intro: 'Sichuan Mahjong on Mahjong Hub follows the Chengdu Blood Battle to the End baseline: three suits only, Exchange Three, a forbidden suit, no Chow, and play continuing after the first player wins.',
      howToPlay: [
        'The 108-tile wall uses only Characters, Dots and Bamboo. Winds, Dragons, Flowers and Seasons are not used.',
        'Before normal play, select three tiles from one suit for Exchange Three; the table passes them in the direction chosen for that hand.',
        'Choose one forbidden suit. You must discard every tile of that suit before you are allowed to win.',
        'Draw and discard normally. Chow is not allowed; Pung and Kong are allowed under the table claim order.',
        'Make four melds and a pair, or an approved special hand such as Seven Pairs, then win by self-draw or a legal discard.',
        'A winner stops drawing, but the hand continues for the remaining players. End-of-hand settlement includes ready-hand check, flower-pig penalty and Kong refund.'
      ],
      tips: [
        'Choose the forbidden suit from the suit you can clear most quickly, not merely from its lowest tiles.',
        'Exchange Three should remove three tiles from one coherent weak suit so you do not create three unrelated dead tiles.',
        'Because Chow is unavailable, pairs and connected shapes are more valuable than in Chow-enabled variants.',
        'After another player wins, reassess risk: staying ready matters for the end-of-hand check, but avoid becoming flower pig.',
        'Track Kong exposure and settlement. A high-value Kong is not automatically safe if it opens a dangerous draw.'
      ],
      faq: [
        { question: 'Why can I not win while I still hold my forbidden suit?', answer: 'The forbidden-suit rule is a core Chengdu Blood Battle condition. Clear every tile of your chosen suit before a win may be declared.' },
        { question: 'Why does the game continue after someone wins?', answer: 'Blood Battle to the End permits remaining players to continue. This can create several winners or penalties within one hand.' }
      ]
    }
  },
  {
    slug: 'taiwan-mahjong',
    pageName: 'taiwan-mahjong',
    title: 'Taiwan Mahjong',
    description: 'Taiwanese 16-tile Mahjong with Flower replacement and Tai-based scoring.',
    category: 'four-player',
    gameType: 'coming-soon',
    players: 4,
    featured: true,
    content: {
      intro: 'Mahjong Hub Taiwan Mahjong is a relaxed 16-tile version: a 144-tile wall with Flowers and Seasons, five melds plus a pair to win, additive Tai scoring, and a 0-Tai minimum for beginner-friendly play.',
      howToPlay: [
        'Use all 144 tiles. Each non-dealer starts with 16 tiles; East starts with 17 and makes the first discard.',
        'Reveal every Flower or Season immediately and draw a replacement. It remains outside your 16-tile hand and adds Tai when applicable.',
        'On your turn draw one tile and discard one. You may Chow from the left player, or Pung and Kong according to the claim order.',
        'Win with five melds and one pair, for a 17-tile hand. Self-draw and discard wins are both supported.',
        'Tai patterns add together for settlement. This Mahjong Hub beginner baseline allows a complete 0-Tai hand to win.'
      ],
      tips: [
        'With 16 concealed tiles, retain several connected shapes early instead of committing to one wait too quickly.',
        'Flowers add value but do not repair a weak main hand; build the five-meld structure first.',
        'Kongs are more frequent in Taiwan Mahjong. Consider both the replacement draw and the information you reveal.',
        'Use 0-Tai mode to learn tempo; once comfortable, chase Tai only when it does not reduce your live waits.',
        'Check whether your Flower matches your seat, as seat Flowers can add an extra scoring bonus.'
      ],
      faq: [
        { question: 'Why do I hold 16 tiles instead of 13?', answer: 'Taiwan Mahjong uses five melds plus one pair. Players normally hold 16 tiles and win after drawing or claiming the 17th.' },
        { question: 'Can a 0-Tai hand win here?', answer: 'Yes. Mahjong Hub uses a relaxed 0-Tai baseline. Other Taiwan tables may require a minimum Tai, so this is shown clearly in the game settings.' }
      ]
    }
  },
  {
    slug: 'american-mahjong',
    pageName: 'american-mahjong',
    title: 'American Mahjong',
    description: 'American Mahjong with Charleston, Jokers, Flowers, and card-based winning patterns.',
    category: 'four-player',
    gameType: 'coming-soon',
    players: 4,
    featured: true,
    content: {
      intro: 'Mahjong Hub American Mahjong is an original practice-card game inspired by NMJL-style flow: 152 tiles, Charleston, Flowers, Jokers, exposed groups and exact card-pattern wins. It does not reproduce a current NMJL annual card.',
      howToPlay: [
        'Use a 152-tile set with standard tiles, eight Flowers and eight Jokers. Every player takes 13 tiles; East takes 14 and discards first.',
        'Read the original practice card, then complete Charleston: pass three tiles right, across and left. A second Charleston and courtesy pass are table options.',
        'Draw and discard while steering toward one exact line on the practice card, not a general four-meld-and-a-pair shape.',
        'Expose legal Pungs, Kongs or larger groups when the selected card line permits it. Concealed card lines may not be exposed before the final win.',
        'Use a Joker only in a group of three or more; never use it as a single or pair. On your turn, a natural tile may exchange for a Joker in an opponent exposure.',
        'Declare Mah Jongg only when all 14 tiles exactly match one legal original practice-card line.'
      ],
      tips: [
        'Before Charleston, keep two or three compatible card lines open rather than committing to a single rare line.',
        'Pass tiles that do not support any of your likely card categories, but never pass a Joker.',
        'Do not expose a group merely because you can: exposure signals your target and may make your hand impossible to pivot.',
        'Treat Jokers as group accelerators, not universal wildcards; you still need natural tiles for singles and pairs.',
        'Use opponent exposures to decide which natural tiles are safe to discard and when a Joker exchange is valuable.'
      ],
      faq: [
        { question: 'Is this the official NMJL yearly card?', answer: 'No. This game uses Mahjong Hub original practice cards. A licensed NMJL-card integration would be a separate future product.' },
        { question: 'Can a Joker be used in a pair?', answer: 'No. In this rules baseline, Jokers are legal only in groups of three or more, never in singles or pairs.' }
      ]
    }
  },
  {
    slug: 'mahjong-connect-classic',
    pageName: 'mahjong-connect-classic',
    title: 'Mahjong Connect',
    description:
      'Link matching tile pairs with a path that turns at most twice. Three board sizes, hints, and no timer on relaxed mode.',
    category: 'connect',
    gameType: 'native',
    native: 'mahjong-connect',
    players: 1,
    featured: true,
    content: {
      intro:
        'Mahjong Connect, also known as Onet, is the link-matching puzzle built from mahjong tiles. Clear the whole board by joining pairs of identical tiles with a path that bends no more than twice. Relaxed mode has no clock if you would rather take your time.',
      howToPlay: [
        'Tap or click two tiles showing the same face.',
        'The pair clears if they can be joined by a path of empty space that turns at most twice. The path may travel around the outside edge of the board.',
        'Clear every tile to win. Consecutive matches build a streak bonus.',
        'If no pair is playable, the board reshuffles automatically so you never get stuck.'
      ],
      tips: [
        'Work the edges first. Outside tiles have the most routes available and open up the middle as they clear.',
        'Two identical tiles sitting next to each other are always playable — but clearing them may be the only way to open a path elsewhere, so look before taking the free match.',
        'The hint button costs a few points. On the timed boards that trade is almost always worth it.'
      ],
      faq: [
        {
          question: 'How is this different from mahjong solitaire?',
          answer:
            'Solitaire stacks tiles in layers and you match tiles that are free on one side. Connect lays them flat and asks you to join pairs with a path. Different puzzle, same tiles.'
        },
        {
          question: 'What counts as a turn in the path?',
          answer:
            'Every change of direction. A straight line has no turns, an L shape has one, and a Z or U shape has two. Three or more is not allowed.'
        }
      ]
    }
  },

  {
    slug: 'mahjong-solitaire-classic',
    pageName: 'mahjong-solitaire-classic',
    title: 'Mahjong Solitaire Classic',
    description:
      'The classic layered tile-matching puzzle. Turtle and pyramid layouts, guaranteed-solvable deals, hints and undo.',
    category: 'solitaire',
    gameType: 'native',
    native: 'mahjong-solitaire',
    players: 1,
    featured: true,
    content: {
      intro:
        'Mahjong Solitaire is the classic single-player tile-matching puzzle built from mahjong tiles. Clear the whole layout by matching identical tiles that are free: nothing rests on top of them and at least one side is open. Every deal here is generated solvable, so a complete clearing always exists. Two classic shapes are included — the turtle and the pyramid — plus hints, undo, and a reshuffle for when you corner yourself.',
      howToPlay: [
        'Tap two tiles showing the same face to match them. A tile can be matched only when it is free: nothing rests on top of it and it is open on at least one side at its own layer.',
        'Tiles cover the tiles directly beneath them, so clear a stack from the top down. The top layer is always available; lower layers open up as you work through it.',
        'Clear every tile to win. The turtle spreads a wide shell across the board; the pyramid stacks five centred triangles that you peel from the edges inward.',
        'Every deal is generated solvable, so a solution always exists. Use hints if you are stuck, undo a hasty match, or reshuffle to re-deal the remaining tiles.',
        'There is no timer and no score pressure — take as long as you like.'
      ],
      tips: [
        'Work the outside first. A tile on the outer edge of a layer has an open side for free, so clearing the perimeter opens up the middle.',
        'Before taking an obvious pair, glance at what it frees. Two adjacent identical tiles are an easy match, but clearing them may be the only way to unpin a higher stack.',
        'Use the pyramid tiers to your advantage: its edge tiles are playable from the start, and the apex tile is only reachable once its layer is reached.',
        'If you run out of matches, reshuffle instead of restarting — the remaining tiles are re-dealt in a fresh solvable arrangement.'
      ],
      faq: [
        {
          question: 'How is this different from mahjong connect?',
          answer:
            'Connect lays tiles flat and asks you to join matching pairs with a path. Solitaire stacks tiles in layers, and you match tiles that are free on one side and uncovered on top. Different puzzle, same tiles.'
        },
        {
          question: 'What does "free" mean here?',
          answer:
            'A tile is free when nothing rests directly on top of it and at least one of its left or right neighbours at the same level is empty. The outer edge tiles of a layer are always free on the outside.'
        },
        {
          question: 'Is every game guaranteed solvable?',
          answer:
            'Yes. Deals are built in reverse — the game repeatedly picks two free tiles, removes them and records the match — so every layout has a known solution path you can find with thought.'
        },
        {
          question: 'Is there any real-money gambling?',
          answer:
            'No. This is a pure puzzle with no wagering, no purchasable currency and no cash prize of any kind.'
        }
      ]
    }
  },

  // ---------------------------------------------------------------- iframe --
  // External embeds whose URLs were verified as embeddable. These are links,
  // not copied code, and their pages stay noindex because the content is not ours.
  {
    slug: 'mahjong-connect',
    pageName: 'mahjong-connect',
    title: 'Mahjong Connect Lite',
    description:
      'Match pairs of free mahjong tiles connected by a path. A relaxing connect-style elimination game.',
    category: 'connect',
    gameType: 'iframe',
    gameIframeUrl: 'https://1games.io/embed/mahjong-connect'
  },
  {
    slug: 'mahjong-classic',
    pageName: 'mahjong-classic',
    title: 'Mahjong Classic',
    description:
      'The timeless mahjong solitaire. Clear the board by matching open tile pairs.',
    category: 'mahjong',
    gameType: 'iframe',
    gameIframeUrl:
      'https://mahjongclassic.h5games.usercontent.goog/v/390ce075-68ea-41ab-b192-b120b5647b61/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks',
    featured: true
  },
  {
    slug: 'mahjong-solitaire',
    pageName: 'mahjong-solitaire',
    title: 'Mahjong Solitaire',
    description:
      'A beautiful solitaire layout of mahjong tiles. Match and clear the tower at your own pace.',
    category: 'solitaire',
    gameType: 'iframe',
    gameIframeUrl:
      'https://4erks8385j9eo.h5games.usercontent.goog/v/1ff4p4m8ilme8/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks',
    featured: true
  },
  {
    slug: 'mahjong-3d',
    pageName: 'mahjong-3d',
    title: 'Mahjong 3D',
    description:
      'A three-dimensional take on mahjong matching with depth and a calm rainbow palette.',
    category: 'mahjong',
    gameType: 'iframe',
    gameIframeUrl:
      'https://mahjong3d.h5games.usercontent.goog/v/eba0837e-4855-4bb2-b762-5dd6d8982cac/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'onet-connect-classic',
    pageName: 'onet-connect-classic',
    title: 'Onet Connect Classic',
    description:
      'The classic Onet link game. Connect identical tiles with a line of at most two turns.',
    category: 'connect',
    gameType: 'iframe',
    gameIframeUrl:
      'https://onetconnectclassic.h5games.usercontent.goog/v/3548fcd4-da1a-47bd-ac18-01488239c660/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'bee-connect',
    pageName: 'bee-connect',
    title: 'Bee Connect',
    description:
      'A cute bee-themed connect game. Link the little tiles and clear the honeycomb board.',
    category: 'connect',
    gameType: 'iframe',
    gameIframeUrl:
      'https://beeconnect.h5games.usercontent.goog/v/06c7e297-3e6d-4512-9fb2-e491ae2b2fb9/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'aloha-mahjong',
    pageName: 'aloha-mahjong',
    title: 'Aloha Mahjong',
    description:
      'A tropical twist on mahjong matching with a sunny, laid-back vibe.',
    category: 'mahjong',
    gameType: 'iframe',
    gameIframeUrl:
      'https://02ef7fb7guapg.h5games.usercontent.goog/v/13knu9k9rm8go/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: '8x8-match-tiles',
    pageName: '8x8-match-tiles',
    title: '8x8 Match Tiles',
    description:
      'A compact 8x8 tile-match puzzle. Connect same tiles and chase the high score.',
    category: 'tile-match',
    gameType: 'iframe',
    gameIframeUrl:
      'https://75njrrvim9kq0.h5games.usercontent.goog/v/1v57mtiv2ele0/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'tile-guru',
    pageName: 'tile-guru',
    title: 'Tile Guru',
    description:
      'A zen tile-matching puzzle. Find and connect matching tiles in a soothing layout.',
    category: 'tile-match',
    gameType: 'iframe',
    gameIframeUrl:
      'https://5en3tugq69tdo.h5games.usercontent.goog/v/4pu6to0p0cgrg/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'tile-journey',
    pageName: 'tile-journey',
    title: 'Tile Journey',
    description:
      'A journey through tile-matching levels. Plan your connections and clear each board.',
    category: 'tile-match',
    gameType: 'iframe',
    gameIframeUrl:
      'https://0i1jh8boqif48.h5games.usercontent.goog/v/1643ot8on0v9g/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  }
];

export function getGames(): GameConfig[] {
  return games;
}

export function getGame(slug: string): GameConfig | undefined {
  return games.find((g) => g.slug === slug);
}

export function getFeaturedGames(): GameConfig[] {
  return games.filter((g) => g.featured);
}

/** Games we built ourselves — indexable, and the ones worth promoting. */
export function getNativeGames(): GameConfig[] {
  return games.filter((g) => g.gameType === 'native');
}

export function getGamesByCategory(category: GameCategory): GameConfig[] {
  return games.filter((g) => g.category === category);
}

/** Related games, preferring the same category before falling back to the rest. */
export function getRelatedGames(slug: string, limit = 4): GameConfig[] {
  const current = getGame(slug);
  const others = games.filter((g) => g.slug !== slug);
  if (!current) return others.slice(0, limit);

  const sameCategory = others.filter((g) => g.category === current.category);
  const rest = others.filter((g) => g.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}
