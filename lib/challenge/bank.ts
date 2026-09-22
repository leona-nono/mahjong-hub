import type { ChallengeQuestion, LocalizedText } from './types';

const L = (
  en: string,
  zh: string,
  zhTW: string
): LocalizedText => ({ en, zh, 'zh-TW': zhTW });

/**
 * First-wave bank: 20 questions (6 identify + 10 term + 4 rule).
 * Expand toward 60 after playtest — keep ids stable.
 */
export const CHALLENGE_BANK: ChallengeQuestion[] = [
  // —— identify (6) ——
  {
    id: 'id-m5',
    kind: 'identify',
    group: 'tiles',
    tile: 'm5',
    prompt: L('What suit is this tile?', '这张牌是什么花色？', '這張牌是什麼花色？'),
    options: [
      { id: 'characters', label: L('Characters (Craks)', '万子', '萬子') },
      { id: 'bamboo', label: L('Bamboo (Bams)', '条子', '索子') },
      { id: 'dots', label: L('Dots (Circles)', '筒子', '筒子') },
      { id: 'winds', label: L('Winds', '风牌', '風牌') }
    ],
    answerId: 'characters',
    why: L(
      'Numbered tiles with 萬 are characters (craks), from 1 to 9.',
      '写着“万”的数牌是万子，从一万到九万。',
      '寫著「萬」的數牌是萬子，從一萬到九萬。'
    ),
    link: { type: 'glossary', key: 'character_tiles' }
  },
  {
    id: 'id-s1',
    kind: 'identify',
    group: 'tiles',
    tile: 's1',
    prompt: L('What suit is this tile?', '这张牌是什么花色？', '這張牌是什麼花色？'),
    options: [
      { id: 'bamboo', label: L('Bamboo (Bams)', '条子', '索子') },
      { id: 'dots', label: L('Dots (Circles)', '筒子', '筒子') },
      { id: 'characters', label: L('Characters (Craks)', '万子', '萬子') },
      { id: 'dragons', label: L('Dragons', '箭牌', '箭牌') }
    ],
    answerId: 'bamboo',
    why: L(
      'Stick-style tiles are bamboo (bams). The 1 of bamboo is often drawn as a bird.',
      '画成竹条的是条子；一条常画成鸟，但仍是条子。',
      '畫成竹條的是索子；一索常畫成鳥，但仍是索子。'
    ),
    link: { type: 'glossary', key: 'bamboo_tiles' }
  },
  {
    id: 'id-p9',
    kind: 'identify',
    group: 'tiles',
    tile: 'p9',
    prompt: L('What suit is this tile?', '这张牌是什么花色？', '這張牌是什麼花色？'),
    options: [
      { id: 'dots', label: L('Dots (Circles)', '筒子', '筒子') },
      { id: 'bamboo', label: L('Bamboo (Bams)', '条子', '索子') },
      { id: 'characters', label: L('Characters (Craks)', '万子', '萬子') },
      { id: 'honours', label: L('Honours', '字牌', '字牌') }
    ],
    answerId: 'dots',
    why: L(
      'Circle pips mark the dots suit (circles / tung).',
      '圆点花色是筒子。',
      '圓點花色是筒子。'
    ),
    link: { type: 'glossary', key: 'dot_tiles' }
  },
  {
    id: 'id-z1',
    kind: 'identify',
    group: 'honours',
    tile: 'z1',
    prompt: L('Which honour is this?', '这是哪张字牌？', '這是哪張字牌？'),
    options: [
      { id: 'east', label: L('East wind', '东风', '東風') },
      { id: 'south', label: L('South wind', '南风', '南風') },
      { id: 'red', label: L('Red dragon', '红中', '紅中') },
      { id: 'white', label: L('White dragon', '白板', '白板') }
    ],
    answerId: 'east',
    why: L(
      'East is the first wind tile. Winds never form numbered sequences.',
      '东是四风之首；风牌不能按数字组成顺子。',
      '東是四風之首；風牌不能按數字組成順子。'
    ),
    link: { type: 'glossary', key: 'wind_tiles' }
  },
  {
    id: 'id-z5',
    kind: 'identify',
    group: 'honours',
    tile: 'z5',
    prompt: L('Which honour is this?', '这是哪张字牌？', '這是哪張字牌？'),
    options: [
      { id: 'red', label: L('Red dragon', '红中', '紅中') },
      { id: 'green', label: L('Green dragon', '发财', '發財') },
      { id: 'white', label: L('White dragon', '白板', '白板') },
      { id: 'north', label: L('North wind', '北风', '北風') }
    ],
    answerId: 'red',
    why: L(
      'The red dragon (中) is one of three dragons, with green and white.',
      '红中是三张箭牌之一，另外两张是发财和白板。',
      '紅中是三張箭牌之一，另外兩張是發財和白板。'
    ),
    link: { type: 'glossary', key: 'dragon_tiles' }
  },
  {
    id: 'id-z7',
    kind: 'identify',
    group: 'honours',
    tile: 'z7',
    prompt: L('Which honour is this?', '这是哪张字牌？', '這是哪張字牌？'),
    options: [
      { id: 'white', label: L('White dragon', '白板', '白板') },
      { id: 'red', label: L('Red dragon', '红中', '紅中') },
      { id: 'green', label: L('Green dragon', '发财', '發財') },
      { id: 'west', label: L('West wind', '西风', '西風') }
    ],
    answerId: 'white',
    why: L(
      'The white dragon is often a blank or framed tile — still a dragon honour.',
      '白板常是空白或带框的牌面，但仍是箭牌。',
      '白板常是空白或帶框的牌面，但仍是箭牌。'
    ),
    link: { type: 'glossary', key: 'dragon_tiles' }
  },

  // —— term (10) ——
  {
    id: 'term-pong',
    kind: 'term',
    group: 'calls',
    prompt: L(
      'Three identical tiles called from any discard is called a…',
      '三张相同的牌、任何人打出都可以叫的是…',
      '三張相同的牌、任何人打出都可以叫的是…'
    ),
    options: [
      { id: 'pong', label: L('Pung / pong', '碰', '碰') },
      { id: 'chow', label: L('Chow / chi', '吃', '吃') },
      { id: 'kong', label: L('Kong / gang', '杠', '槓') },
      { id: 'pair', label: L('Pair', '将 / 对子', '將 / 對子') }
    ],
    answerId: 'pong',
    why: L(
      'A pung is three identical tiles and can be called from any seat.',
      '碰是三张相同的牌，任何人打出都可以碰。',
      '碰是三張相同的牌，任何人打出都可以碰。'
    ),
    link: { type: 'glossary', key: 'pong' }
  },
  {
    id: 'term-chow',
    kind: 'term',
    group: 'calls',
    prompt: L(
      'A sequence of three tiles in one suit, usually from the player on your left, is a…',
      '同一花色连续三张、通常只能吃上家的叫…',
      '同一花色連續三張、通常只能吃上家的叫…'
    ),
    options: [
      { id: 'chow', label: L('Chow / chi', '吃', '吃') },
      { id: 'pong', label: L('Pung / pong', '碰', '碰') },
      { id: 'kong', label: L('Kong / gang', '杠', '槓') },
      { id: 'ready', label: L('Ready hand', '听牌', '聽牌') }
    ],
    answerId: 'chow',
    why: L(
      'A chow is a run in one suit; most rulesets only allow it from the left-hand discard.',
      '吃是同一花色的顺子；多数规则只能吃上家。',
      '吃是同一花色的順子；多數規則只能吃上家。'
    ),
    link: { type: 'glossary', key: 'chow' }
  },
  {
    id: 'term-kong',
    kind: 'term',
    group: 'calls',
    prompt: L(
      'Four identical tiles that draw a replacement tile form a…',
      '四张相同、杠完要补一张的是…',
      '四張相同、槓完要補一張的是…'
    ),
    options: [
      { id: 'kong', label: L('Kong / gang', '杠', '槓') },
      { id: 'pong', label: L('Pung / pong', '碰', '碰') },
      { id: 'chow', label: L('Chow / chi', '吃', '吃') },
      { id: 'flower', label: L('Flower', '花牌', '花牌') }
    ],
    answerId: 'kong',
    why: L(
      'A kong is four of a kind; after declaring it you take a replacement from the wall.',
      '杠是四张相同的牌，宣告后要从牌墙补一张。',
      '槓是四張相同的牌，宣告後要從牌牆補一張。'
    ),
    link: { type: 'glossary', key: 'kong' }
  },
  {
    id: 'term-waiting',
    kind: 'term',
    group: 'winning',
    prompt: L(
      'A hand that needs only one more tile to win is…',
      '只差一张就能和的手牌叫…',
      '只差一張就能和的手牌叫…'
    ),
    options: [
      { id: 'waiting', label: L('Ready / waiting (tenpai)', '听牌', '聽牌') },
      { id: 'selfdraw', label: L('Self-draw', '自摸', '自摸') },
      { id: 'deal_in', label: L('Deal-in', '点炮', '放槍') },
      { id: 'wall', label: L('The wall', '牌墙', '牌牆') }
    ],
    answerId: 'waiting',
    why: L(
      'A waiting (ready) hand is one tile away from a legal win.',
      '听牌表示再来一张就能组成和牌。',
      '聽牌表示再來一張就能組成和牌。'
    ),
    link: { type: 'glossary', key: 'waiting_hand' }
  },
  {
    id: 'term-selfdraw',
    kind: 'term',
    group: 'winning',
    prompt: L(
      'Winning on a tile you drew yourself is a…',
      '靠自己摸到的牌和了叫…',
      '靠自己摸到的牌和了叫…'
    ),
    options: [
      { id: 'selfdraw', label: L('Self-draw', '自摸', '自摸') },
      { id: 'deal_in', label: L('Deal-in / ron', '点炮 / 荣和', '放槍 / 榮和') },
      { id: 'rob', label: L('Robbing a kong', '抢杠', '搶槓') },
      { id: 'chow', label: L('Chow', '吃', '吃') }
    ],
    answerId: 'selfdraw',
    why: L(
      'A self-draw win comes from your own wall draw, not someone else’s discard.',
      '自摸是摸牌墙和牌，不是别人打出的牌。',
      '自摸是摸牌牆和牌，不是別人打出的牌。'
    ),
    link: { type: 'glossary', key: 'self_draw_win' }
  },
  {
    id: 'term-deal-in',
    kind: 'term',
    group: 'winning',
    prompt: L(
      'Winning on another player’s discard is…',
      '用别人打出的牌和了叫…',
      '用別人打出的牌和了叫…'
    ),
    options: [
      { id: 'deal_in', label: L('Deal-in / ron', '点炮 / 荣和', '放槍 / 榮和') },
      { id: 'selfdraw', label: L('Self-draw', '自摸', '自摸') },
      { id: 'kong', label: L('Kong', '杠', '槓') },
      { id: 'wall', label: L('Exhaustive draw', '流局', '流局') }
    ],
    answerId: 'deal_in',
    why: L(
      'A deal-in (ron) win claims the tile someone else discarded.',
      '点炮是别人打出你要的牌，你宣告和牌。',
      '放槍是別人打出你要的牌，你宣告和牌。'
    ),
    link: { type: 'glossary', key: 'deal_in_win' }
  },
  {
    id: 'term-seven-pairs',
    kind: 'term',
    group: 'patterns',
    prompt: L(
      'A winning hand made of seven pairs (no melds of three) is…',
      '七个对子、没有四组面子的和牌叫…',
      '七個對子、沒有四組面子的和牌叫…'
    ),
    options: [
      { id: 'seven', label: L('Seven pairs', '七对', '七對') },
      { id: 'pungs', label: L('All pungs', '对对胡', '對對胡') },
      { id: 'pure', label: L('Pure one suit', '清一色', '清一色') },
      { id: 'simples', label: L('All simples', '断幺', '斷幺') }
    ],
    answerId: 'seven',
    why: L(
      'Seven pairs is a special shape: seven pairs instead of four melds and a pair.',
      '七对是特殊牌型：七个对子，而不是四组加一对。',
      '七對是特殊牌型：七個對子，而不是四組加一對。'
    ),
    link: { type: 'glossary', key: 'seven_pairs' }
  },
  {
    id: 'term-pure',
    kind: 'term',
    group: 'patterns',
    prompt: L(
      'A hand that uses only one numbered suit (no honours) is…',
      '只用一种数牌花色、没有字牌的叫…',
      '只用一種數牌花色、沒有字牌的叫…'
    ),
    options: [
      { id: 'pure', label: L('Pure one suit', '清一色', '清一色') },
      { id: 'mixed', label: L('Mixed one suit', '混一色', '混一色') },
      { id: 'seven', label: L('Seven pairs', '七对', '七對') },
      { id: 'wall', label: L('The wall', '牌墙', '牌牆') }
    ],
    answerId: 'pure',
    why: L(
      'Pure one suit keeps every tile in a single suit — characters, bamboo, or dots only.',
      '清一色整手牌只有一种数牌花色。',
      '清一色整手牌只有一種數牌花色。'
    ),
    link: { type: 'glossary', key: 'pure_one_suit' }
  },
  {
    id: 'term-wall',
    kind: 'term',
    group: 'table',
    prompt: L(
      'The face-down stack players draw from is called…',
      '扣着供摸牌的那叠牌叫…',
      '扣著供摸牌的那疊牌叫…'
    ),
    options: [
      { id: 'wall', label: L('The wall', '牌墙', '牌牆') },
      { id: 'hand', label: L('The hand', '手牌', '手牌') },
      { id: 'river', label: L('The discard river', '弃牌河', '棄牌河') },
      { id: 'kong', label: L('A kong', '杠', '槓') }
    ],
    answerId: 'wall',
    why: L(
      'The wall is the face-down stock; draws come from it until it runs out.',
      '牌墙是扣着的牌堆，摸牌都从这里取，摸完可能流局。',
      '牌牆是扣著的牌堆，摸牌都從這裡取，摸完可能流局。'
    ),
    link: { type: 'glossary', key: 'tile_wall' }
  },
  {
    id: 'term-discard',
    kind: 'term',
    group: 'calls',
    prompt: L(
      'The face-up tile a player puts out for others to call is a…',
      '正面打出、别人可以吃碰杠的那张叫…',
      '正面打出、別人可以吃碰槓的那張叫…'
    ),
    options: [
      { id: 'discard', label: L('Discard', '打牌 / 弃牌', '打牌 / 棄牌') },
      { id: 'draw', label: L('Draw', '摸牌', '摸牌') },
      { id: 'flower', label: L('Flower', '花牌', '花牌') },
      { id: 'pair', label: L('Pair', '对子', '對子') }
    ],
    answerId: 'discard',
    why: L(
      'A discard is played face-up; others may pung, chow, kong, or win on it.',
      '打牌是把牌正面打出，别人可以碰吃杠或点炮。',
      '打牌是把牌正面打出，別人可以碰吃槓或放槍。'
    ),
    link: { type: 'glossary', key: 'discard_tile' }
  },

  // —— rule / blog (4) ——
  {
    id: 'rule-four-sets',
    kind: 'rule',
    group: 'rules',
    prompt: L(
      'In standard four-player mahjong, a winning hand is usually…',
      '标准四人麻将的和牌通常是…',
      '標準四人麻將的和牌通常是…'
    ),
    options: [
      {
        id: 'four_pair',
        label: L('Four sets + one pair', '四组面子 + 一对将', '四組面子 + 一對將')
      },
      { id: 'five_pairs', label: L('Five pairs only', '五个对子', '五個對子') },
      { id: 'thirteen', label: L('Thirteen orphans only', '只能十三幺', '只能十三么') },
      { id: 'solitaire', label: L('Any two matching tiles', '任意两张相同即可', '任意兩張相同即可') }
    ],
    answerId: 'four_pair',
    why: L(
      'The classic shape is four melds (pung/chow/kong) plus one pair — fourteen tiles.',
      '经典牌型是四组面子加一对将，共十四张。',
      '經典牌型是四組面子加一對將，共十四張。'
    ),
    link: { type: 'blog', slug: 'what-is-mahjong' }
  },
  {
    id: 'rule-hk-faan',
    kind: 'rule',
    group: 'rules',
    prompt: L(
      'Hong Kong style usually needs a minimum score of…',
      '港式麻将通常要求最低…',
      '港式麻將通常要求最低…'
    ),
    options: [
      { id: 'three', label: L('Three faan', '三番', '三番') },
      { id: 'one', label: L('One yaku only', '只要一番役', '只要一番役') },
      { id: 'eight', label: L('Eight points (MCR)', '八番（国标）', '八番（國標）') },
      { id: 'zero', label: L('No minimum', '没有最低分', '沒有最低分') }
    ],
    answerId: 'three',
    why: L(
      'Hong Kong mahjong commonly uses a three-faan minimum before a hand may win.',
      '港式常见三番起胡；低于三番不能和。',
      '港式常見三番起胡；低於三番不能和。'
    ),
    link: { type: 'blog', slug: 'mahjong-scoring-system-explained' }
  },
  {
    id: 'rule-solitaire',
    kind: 'rule',
    group: 'rules',
    prompt: L(
      'Mahjong solitaire (matching tiles) compared to four-player mahjong is…',
      '麻将消消乐 / 接龙相对四人麻将是…',
      '麻將消消樂 / 接龍相對四人麻將是…'
    ),
    options: [
      {
        id: 'different',
        label: L('A different game that shares the artwork', '另一款游戏，只是共用牌面', '另一款遊戲，只是共用牌面')
      },
      { id: 'same', label: L('The exact same rules', '规则完全一样', '規則完全一樣') },
      { id: 'nmjl', label: L('Official American NMJL hands', '美式 NMJL 官方牌型', '美式 NMJL 官方牌型') },
      { id: 'riichi', label: L('Japanese riichi only', '只有日本立直', '只有日本立直') }
    ],
    answerId: 'different',
    why: L(
      'Solitaire is a single-player matching puzzle; four-player mahjong is draw-and-discard.',
      '消消乐是单人配对解谜；四人麻将是摸打弃牌的对战。',
      '消消樂是單人配對解謎；四人麻將是摸打棄牌的對戰。'
    ),
    link: { type: 'blog', slug: 'what-is-mahjong' }
  },
  {
    id: 'rule-american',
    kind: 'rule',
    group: 'rules',
    prompt: L(
      'American mahjong differs from Chinese styles mainly because it uses…',
      '美式麻将相对中式，主要多了…',
      '美式麻將相對中式，主要多了…'
    ),
    options: [
      {
        id: 'card',
        label: L('Jokers + a yearly hand card', '百搭 + 年度牌卡', '百搭 + 年度牌卡')
      },
      { id: 'no_wall', label: L('No tile wall', '没有牌墙', '沒有牌牆') },
      { id: 'two_players', label: L('Only two players', '只能两人玩', '只能兩人玩') },
      { id: 'same', label: L('Identical scoring to Hong Kong', '计分与港式完全相同', '計分與港式完全相同') }
    ],
    answerId: 'card',
    why: L(
      'American play adds jokers and card-defined hands; Chinese styles build melds and a pair.',
      '美式有百搭和牌卡定型；中式是面子加将的经典结构。',
      '美式有百搭和牌卡定型；中式是面子加將的經典結構。'
    ),
    link: { type: 'blog', slug: 'american-vs-chinese-mahjong' }
  }
];

export function questionsByKind(kind: ChallengeQuestion['kind']): ChallengeQuestion[] {
  return CHALLENGE_BANK.filter((q) => q.kind === kind);
}
