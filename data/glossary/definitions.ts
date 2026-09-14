export type GlossaryDefinitions = { en: string; zh: string; 'zh-TW': string };

/** One-sentence definitions for public glossary terms. Marketing `type: "text"` keys are excluded. */
export const GLOSSARY_DEFINITIONS: Record<string, GlossaryDefinitions> = {
  mahjong_tile: {
    en: 'A mahjong tile is one piece in the 144-tile set used to build melds and a pair.',
    zh: '麻将牌是一副 144 张牌里的一张，用来凑成面子和将牌。',
    'zh-TW': '麻將牌是一副一百四十四張裡的一張，用來湊成面子和將牌。'
  },
  character_tiles: {
    en: 'Character tiles are the numbered suit marked 萬, running from 1 to 9.',
    zh: '万子是写着“万”的数牌，从一万到九万。',
    'zh-TW': '萬子是寫著「萬」的數牌，從一萬到九萬。'
  },
  bamboo_tiles: {
    en: 'Bamboo tiles are the suit drawn as sticks, numbered 1 through 9.',
    zh: '条子是画成竹条的数牌，从一条到九条。',
    'zh-TW': '索子是畫成竹條的數牌，從一索到九索。'
  },
  dot_tiles: {
    en: 'Dot tiles are the suit drawn as circles, numbered 1 through 9.',
    zh: '筒子是画成圆点的数牌，从一筒到九筒。',
    'zh-TW': '筒子是畫成圓點的數牌，從一筒到九筒。'
  },
  wind_tiles: {
    en: 'Wind tiles are the four honour tiles: East, South, West and North.',
    zh: '风牌是东、南、西、北四张字牌。',
    'zh-TW': '風牌是東、南、西、北四張字牌。'
  },
  dragon_tiles: {
    en: 'Dragon tiles are the three honour tiles: Red, Green and White.',
    zh: '箭牌是中、发、白三张字牌。',
    'zh-TW': '箭牌是中、發、白三張字牌。'
  },
  honor_tiles: {
    en: 'Honour tiles are the winds and dragons. They do not form numbered sequences.',
    zh: '字牌是风牌和箭牌，不能按数字组成顺子。',
    'zh-TW': '字牌是風牌和箭牌，不能按數字組成順子。'
  },
  number_tiles: {
    en: 'Number tiles are the three suits — characters, bamboo and dots — each numbered 1 to 9.',
    zh: '数牌是万、条、筒三种花色，每种从 1 到 9。',
    'zh-TW': '數牌是萬、索、筒三種花色，每種從 1 到 9。'
  },
  player_hand: {
    en: 'A hand is the tiles in front of one player, usually 13 before the draw and 14 when that player may win.',
    zh: '手牌是一位玩家面前的牌，摸牌前通常是 13 张，轮到自己时可到 14 张。',
    'zh-TW': '手牌是一位玩家面前的牌，摸牌前通常是十三張，輪到自己時可到十四張。'
  },
  tile_wall: {
    en: 'The wall is the face-down stack of tiles players draw from.',
    zh: '牌墙是扣着堆好、供玩家摸牌的那叠牌。',
    'zh-TW': '牌牆是扣著堆好、供玩家摸牌的那疊牌。'
  },
  draw_tile: {
    en: 'A draw is taking the next tile from the wall.',
    zh: '摸牌是从牌墙取下一张牌。',
    'zh-TW': '摸牌是從牌牆取下一張牌。'
  },
  discard_tile: {
    en: 'A discard is the tile a player places face-up for others to call or ignore.',
    zh: '打牌是把一张牌正面朝上打出，别人可以吃碰杠，也可以不要。',
    'zh-TW': '打牌是把一張牌正面朝上打出，別人可以吃碰槓，也可以不要。'
  },
  chow: {
    en: 'A chow is a sequence of three tiles in the same suit, usually called from the player on your left.',
    zh: '吃是同一花色连续三张组成的顺子，通常只能吃上家打出的牌。',
    'zh-TW': '吃是同一花色連續三張組成的順子，通常只能吃上家打出的牌。'
  },
  pong: {
    en: 'A pung is three identical tiles, called from any player’s discard.',
    zh: '碰是三张相同的牌，任何人打出都可以碰。',
    'zh-TW': '碰是三張相同的牌，任何人打出都可以碰。'
  },
  kong: {
    en: 'A kong is four identical tiles. It is exposed or concealed, and it draws a replacement tile.',
    zh: '杠是四张相同的牌，分明杠和暗杠，杠完要补一张牌。',
    'zh-TW': '槓是四張相同的牌，分明槓和暗槓，槓完要補一張牌。'
  },
  waiting_hand: {
    en: 'A waiting hand, or tenpai, is one tile away from a complete winning shape.',
    zh: '听牌是只差一张就能凑成胡牌牌型。',
    'zh-TW': '聽牌是只差一張就能湊成胡牌牌型。'
  },
  win_hand: {
    en: 'A winning hand is a complete set of melds and a pair that also meets the ruleset’s minimum score.',
    zh: '胡牌是面子和将牌已经凑齐，并且达到该玩法最低分数的牌。',
    'zh-TW': '胡牌是面子和將牌已經湊齊，並且達到該玩法最低分數的牌。'
  },
  all_pungs_hand: {
    en: 'An all-pungs hand is built from triplets and a pair, with no sequences.',
    zh: '碰碰胡是由刻子和一对将牌组成，没有顺子。',
    'zh-TW': '碰碰胡是由刻子和一對將牌組成，沒有順子。'
  },
  pure_one_suit: {
    en: 'A pure one-suit hand uses only one numbered suit, with no honour tiles.',
    zh: '清一色只用一种数牌，没有字牌。',
    'zh-TW': '清一色只用一種數牌，沒有字牌。'
  },
  mixed_one_suit: {
    en: 'A mixed one-suit hand uses one numbered suit plus honour tiles.',
    zh: '混一色是一种数牌加上字牌。',
    'zh-TW': '混一色是一種數牌加上字牌。'
  },
  seven_pairs: {
    en: 'Seven pairs is a special winning shape made of seven pairs instead of four melds and a pair.',
    zh: '七对子是七个对子的特殊胡牌，不是四组加一对。',
    'zh-TW': '七對子是七個對子的特殊胡牌，不是四組加一對。'
  },
  four_triplets: {
    en: 'Four triplets is a high-value hand of four pungs or kongs plus a pair.',
    zh: '四暗刻或四组刻子是四组刻子再加一对将牌的高番牌型。',
    'zh-TW': '四暗刻或四組刻子是四組刻子再加一對將牌的高番牌型。'
  },
  all_simple_tiles: {
    en: 'All simples is a hand with no terminals (1 or 9) and no honour tiles.',
    zh: '断幺九的手牌没有 1、9，也没有字牌。',
    'zh-TW': '斷么九的手牌沒有 1、9，也沒有字牌。'
  },
  kong_bloom_win: {
    en: 'A kong-draw win is a win on the replacement tile taken after declaring a kong.',
    zh: '杠上开花是杠完补牌，补到的那张正好胡了。',
    'zh-TW': '槓上開花是槓完補牌，補到的那張正好胡了。'
  },
  last_tile_win: {
    en: 'A last-tile win is winning on the last drawable tile of the wall.',
    zh: '海底捞月是摸到牌墙最后一张并胡牌。',
    'zh-TW': '海底撈月是摸到牌牆最後一張並胡牌。'
  },
  all_sequences_hand: {
    en: 'An all-sequences hand is four chows and a pair, with no pungs.',
    zh: '平胡是四组顺子加一对将牌，没有刻子。',
    'zh-TW': '平胡是四組順子加一對將牌，沒有刻子。'
  },
  single_tile_wait: {
    en: 'A single-tile wait is a ready hand that can win on only one tile.',
    zh: '单钓是听牌时只差某一张牌才能胡。',
    'zh-TW': '單釣是聽牌時只差某一張牌才能胡。'
  },
  self_draw_win: {
    en: 'A self-draw win is a win on a tile you drew yourself, not a discard.',
    zh: '自摸是摸到的牌让自己胡了，不是别人打出来的。',
    'zh-TW': '自摸是摸到的牌讓自己胡了，不是別人打出來的。'
  },
  deal_in_win: {
    en: 'A deal-in win is a win on another player’s discard. That player pays in most rulesets.',
    zh: '点炮是别人打出的牌让你胡了，多数玩法由打出的人付钱。',
    'zh-TW': '放槍是別人打出的牌讓你胡了，多數玩法由打出的人付錢。'
  },
  rob_kong_win: {
    en: 'Robbing a kong is winning on the tile someone just added to turn a pung into a kong.',
    zh: '抢杠是别人用一张牌加杠时，你用这张牌胡了。',
    'zh-TW': '搶槓是別人用一張牌加槓時，你用這張牌胡了。'
  },
  exposed_kong: {
    en: 'An exposed kong is four identical tiles that include a discard or that were opened from a pung.',
    zh: '明杠是四张相同的牌，其中有别人打出的牌，或是碰后再加杠。',
    'zh-TW': '明槓是四張相同的牌，其中有別人打出的牌，或是碰後再加槓。'
  },
  concealed_kong: {
    en: 'A concealed kong is four identical tiles taken entirely from your own hand and draws.',
    zh: '暗杠是四张相同的牌都来自自己的手牌和摸牌，没有用别人打出的牌。',
    'zh-TW': '暗槓是四張相同的牌都來自自己的手牌和摸牌，沒有用別人打出的牌。'
  }
};

export const GLOSSARY_GROUPS: { id: string; keys: string[] }[] = [
  { id: 'tiles', keys: ['mahjong_tile', 'number_tiles', 'character_tiles', 'bamboo_tiles', 'dot_tiles'] },
  { id: 'honours', keys: ['honor_tiles', 'wind_tiles', 'dragon_tiles'] },
  { id: 'calls', keys: ['chow', 'pong', 'kong', 'exposed_kong', 'concealed_kong', 'draw_tile', 'discard_tile'] },
  { id: 'winning', keys: ['win_hand', 'waiting_hand', 'self_draw_win', 'deal_in_win', 'rob_kong_win', 'kong_bloom_win', 'last_tile_win', 'single_tile_wait'] },
  { id: 'patterns', keys: ['pure_one_suit', 'mixed_one_suit', 'seven_pairs', 'all_pungs_hand', 'four_triplets', 'all_simple_tiles', 'all_sequences_hand'] },
  { id: 'table', keys: ['player_hand', 'tile_wall'] }
];

export function glossaryDefinition(key: string, locale: string): string {
  const entry = GLOSSARY_DEFINITIONS[key];
  if (!entry) return '';
  if (locale === 'zh' || locale === 'zh-TW') return entry[locale];
  return entry.en;
}
