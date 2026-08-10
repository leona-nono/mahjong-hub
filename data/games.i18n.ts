import type { GameContent } from './games';

/**
 * 5-language content overrides for games.
 *
 * The English base lives in `data/games.ts`; anything keyed here overrides it
 * for a specific locale. `getLocalizedGame(slug, locale)` merges them and falls
 * back to English for any missing key, so partial translations are safe.
 *
 * `content` is a partial override of GameContent — any field you omit (e.g.
 * `faq`) keeps the English version.
 */
export type LocaleCode = 'en' | 'zh' | 'zh-TW' | 'ja' | 'ko';

export interface GameI18n {
  title?: Partial<Record<LocaleCode, string>>;
  description?: Partial<Record<LocaleCode, string>>;
  content?: Partial<Record<LocaleCode, Partial<GameContent>>>;
}

/* ------------------------------------------------------------------------- */
/*  经典四人麻将                                                                */
/* ------------------------------------------------------------------------- */

const HONGKONG_CONTENT: Record<LocaleCode, Partial<GameContent>> = {
  en: {
    intro:
      'Hong Kong Old Style is the most widely played four-player mahjong ruleset outside Japan, and the easiest one to learn first. You build a hand of four sets and one pair, and you need at least three faan to declare a win. This table gives you three computer opponents, an optional readiness hint, and a breakdown of how every winning hand scored.',
    howToPlay: [
      'Each player starts with 13 tiles. On your turn you draw one tile and then discard one, keeping your hand at 13.',
      'A winning hand is four sets plus one pair. A set is either three identical tiles or three consecutive tiles in the same suit.',
      'When another player discards a tile you need, you may call it: pong for a triplet, chi for a sequence (from the player to your left only), or kong for all four copies.',
      'Calling a tile makes your hand open, which costs you some scoring patterns. Take the call only when it genuinely moves you forward.',
      'Declare a win by self-draw or on another player’s discard, provided the hand meets the three faan minimum.'
    ],
    tips: [
      'Discard lone honour tiles early. They are the hardest tiles to pair up and the least flexible thing in your hand.',
      'Track your distance to ready rather than staring at individual tiles. Two away is a normal mid-game position; one away is when you start playing carefully.',
      'A hand of all one suit is worth far more than the sum of its parts. Dealt seven or eight tiles in a single suit, committing early usually pays.',
      'Watch the other seats. Three players throwing away the same suit means the tiles you need are probably still live.'
    ],
    faq: [
      { question: 'Do I need to download anything?', answer: 'No. The game runs entirely in your browser on desktop and mobile, and nothing is installed.' },
      { question: 'Is this real mahjong or the tile-matching game?', answer: 'This is real four-player mahjong with drawing, discarding, calling and scoring. The tile-matching game most Western sites call "mahjong" is mahjong solitaire, which is a different game.' },
      { question: 'What does the three faan minimum mean?', answer: 'Hong Kong rules require a hand to be worth at least three faan before you may declare a win. A hand that is technically complete but scores less cannot be declared, so you keep playing to improve it.' },
      { question: 'Is there any real-money gambling?', answer: 'No. There is no wagering, no purchasable currency and no cash prize of any kind. Scores track your own progress only.' }
    ]
  },
  zh: {
    intro:
      '香港老章是日本以外最广为流行的四人麻将玩法，也是最容易上手的一种。你只需凑出四组搭子加一对将牌，并至少有三番即可胡牌。本桌提供三位电脑对手、可选听牌提示，以及每把胡牌分数的明细。',
    howToPlay: [
      '每位玩家起手十三张牌。轮到你时摸一张、打一张，保持手牌十三张。',
      '胡牌型为四组搭子加一对将牌。搭子可以是三张相同的牌，也可以是同花色三张连续的牌。',
      '当别的玩家打出你需要的牌时，可以叫牌：碰（三张相同）、吃（顺子，只能吃上家的牌）、杠（全部四张）。',
      '叫牌会使手牌亮开，从而损失部分番型。只在确实能推进手牌时才叫牌。',
      '自摸或别家放铳均可胡牌，但必须满足三番的最低要求。'
    ],
    tips: [
      '尽早打出孤张字牌。它们最难成对，也是手牌中最不灵活的牌。',
      '多关注距离听牌还有多远，而不是盯着一两张牌看。离听两张是常见的中局位置；离听一张时就要开始谨慎了。',
      '清一色手牌的价值远超其各部分之和。起手就拿到七八张同花色的牌，尽早朝清一色做通常是划算的。',
      '注意其他三家。三人都打同一花色的牌，说明你要的牌多半还在牌山里。'
    ],
    faq: [
      { question: '需要下载任何东西吗？', answer: '不需要。游戏完全在浏览器中运行，桌面端和移动端都可以玩，无需安装。' },
      { question: '这是真麻将还是配对消除游戏？', answer: '这是真正的四人麻将，包括摸牌、打牌、吃碰杠和计分。大多数西方网站上被称为"麻将"的配对消除游戏其实是麻将接龙，是完全不同的游戏。' },
      { question: '"三番最低要求"是什么意思？', answer: '香港规则要求胡牌前手牌至少值三番。技术上已经成型但分数不足的手牌不能胡，所以你要继续打牌改进它。' },
      { question: '有没有真钱赌博？', answer: '没有。不存在下注、可购买的货币或任何现金奖励。分数只记录你自己的进度。' }
    ]
  },
  'zh-TW': {
    intro:
      '香港老章是日本以外最廣為流行的四人麻將玩法，也是最容易上手的一種。你只需湊出四組搭子加一對將牌，並至少有番三番即可胡牌。本桌提供三位電腦對手、可選聽牌提示，以及每把胡牌分數的明細。',
    howToPlay: [
      '每位玩家起手十三張牌。輪到你時摸一張、打一張，保持手牌十三張。',
      '胡牌型為四組搭子加一對將牌。搭子可以是三張相同的牌，也可以是同花色三張連續的牌。',
      '當別的玩家打出你需要的牌時，可以叫牌：碰（三張相同）、吃（順子，只能吃上家的牌）、槓（全部四張）。',
      '叫牌會使手牌亮開，從而損失部分番型。只在確實能推進手牌時才叫牌。',
      '自摸或別家放銃均可胡牌，但必須滿足三番的最低要求。'
    ],
    tips: [
      '盡早打出孤張字牌。它們最難成對，也是手牌中最不靈活的牌。',
      '多關注距離聽牌還有多遠，而不是盯著一兩張牌看。離聽兩張是常見的中局位置；離聽一張時就要開始謹慎了。',
      '清一色手牌的價值遠超其各部分之和。起手就拿到七八張同花色的牌，盡早朝清一色做通常是划算的。',
      '注意其他三家。三人都打同一花色的牌，說明你要的牌多半還在牌山裡。'
    ],
    faq: [
      { question: '需要下載任何東西嗎？', answer: '不需要。遊戲完全在瀏覽器中執行，桌面端和行動端都可以玩，無需安裝。' },
      { question: '這是真麻將還是配對消除遊戲？', answer: '這是真正的四人麻將，包括摸牌、打牌、吃碰槓和計分。大多數西方網站上被稱為「麻將」的配對消除遊戲其實是麻將接龍，是完全不同的遊戲。' },
      { question: '「三番最低要求」是什麼意思？', answer: '香港規則要求胡牌前手牌至少值三番。技術上已經成型但分數不足的手牌不能胡，所以你要繼續打牌改進它。' },
      { question: '有沒有真錢賭博？', answer: '沒有。不存在下注、可購買的貨幣或任何現金獎勵。分數只記錄你自己的進度。' }
    ]
  },
  ja: {
    intro:
      '香港スタイルは日本以外で最も広く遊ばれている四人麻雀のルールで、最初に学ぶのに最も簡単です。四組の面子と一組の雀頭を作り、最低三飜で和了できます。この卓では三人のコンピューター対戦相手、オプションの聴牌ヒント、そして和了した手の点数内訳を提供します。',
    howToPlay: [
      '各プレイヤーは13枚の牌を持って始めます。自分の番では1枚引いて1枚切るので、手牌は常に13枚です。',
      '和了形は四組の面子と一組の雀頭です。面子は同じ牌3枚か、同種の連続した3枚です。',
      '他のプレイヤーが切った牌を鳴くことができます：ポン（刻子）、チー（順子、左隣のみ）、カン（4枚すべて）。',
      '鳴くと手牌が開き、いくつかの役が消えます。本当に手が進む時だけ鳴きましょう。',
      'ツモまたはロンで和了できますが、最低三飜を満たす必要があります。'
    ],
    tips: [
      '孤立した字牌は早めに切る。対子にしにくく、手の中で最も融通がききません。',
      '個々の牌ではなく聴牌までの距離を見る。2枚残りは中盤の普通の位置、1枚残りになると慎重に打ちます。',
      '一色の手は各部分の合計をはるかに上回る価値があります。7〜8枚同じ種類を配られたら、早めに染めると得です。',
      '他の席を見る。3人とも同じ種類を切っていたら、あなたの欲しい牌はまだ残っている可能性が高いです。'
    ],
    faq: [
      { question: '何かをダウンロードする必要がありますか？', answer: 'いいえ。ゲームは完全にブラウザ上で動作し、デスクトップでもモバイルでも、何もインストールする必要はありません。' },
      { question: 'これは本物の麻雀ですか、それとも牌合わせゲームですか？', answer: 'これは引く・切る・鳴く・点数のある本物の四人麻雀です。西洋の多くのサイトで「マージャン」と呼ばれる牌合わせゲームは麻雀ソリティアであり、別のゲームです。' },
      { question: '「最低三飜」とはどういう意味ですか？', answer: '香港ルールでは、和了を宣言するには手が最低三飜の価値を持つ必要があります。技術的に完成していても三飜未満の手は和了できず、手を良くするために打ち続けます。' },
      { question: '実際のお金がかかる賭け事はありますか？', answer: 'いいえ。賭け、購入できる通貨、現金賞品は一切ありません。点数は自分の進行状況を記録するだけです。' }
    ]
  },
  ko: {
    intro:
      '홍콩 구식은 일본 밖에서 가장 널리 즐기는 4인 마작 룰로, 처음 배우기에 가장 쉽습니다. 네 세트와 한 쌍을 만들고 최소 3판(팬)으로 승리 선언을 하면 됩니다. 이 테이블은 컴퓨터 상대 3명, 선택적 텐파이 힌트, 그리고 이긴 패의 점수 내역을 제공합니다.',
    howToPlay: [
      '각 플레이어는 13장으로 시작합니다. 자신의 차례에 한 장을 뽑고 한 장을 버려 항상 13장을 유지합니다.',
      '이기는 패는 네 세트와 한 쌍입니다. 세트는 같은 패 3장 또는 같은 무늬의 연속 3장입니다.',
      '다른 플레이어가 버린 패가 필요하면 선언할 수 있습니다: 퐁(삼중), 치(순자, 왼쪽 상대에게만), 캉(4장 모두).',
      '선언하면 패가 공개되어 일부 역이 사라집니다. 정말 패가 진행될 때만 선언하세요.',
      '쯔모 또는 론으로 승리 선언을 할 수 있지만, 최소 3판을 충족해야 합니다.'
    ],
    tips: [
      '외로운 자패는 일찍 버리세요. 짝을 만들기 가장 어렵고 패에서 가장 유연하지 않습니다.',
      '개별 패보다는 텐파이까지의 거리를 보세요. 2장 남은 것은 중반의 일반적인 위치이고, 1장 남으면 조심히 플레이합니다.',
      '한 무늬로만 이루어진 패는 각 부분의 합보다 훨씬 가치가 큽니다. 같은 무늬 7~8장을 받았다면 일찍 올인하는 것이 보통 이득입니다.',
      '다른 자리를 관찰하세요. 세 명이 같은 무늬를 버리고 있다면, 당신이 필요한 패가 아직 살아있을 가능성이 높습니다.'
    ],
    faq: [
      { question: '무언가를 다운로드해야 하나요?', answer: '아니요. 게임은 브라우저에서 완전히 실행되며 데스크톱과 모바일 모두 아무것도 설치할 필요가 없습니다.' },
      { question: '진짜 마작인가요, 아니면 타일 맞추기 게임인가요?', answer: '이것은 뽑기, 버리기, 선언, 점수가 있는 진짜 4인 마작입니다. 서양 사이트에서 "마작"이라 부르는 타일 맞추기 게임은 마작 솔리테어로, 완전히 다른 게임입니다.' },
      { question: '"최소 3판"은 무슨 뜻인가요?', answer: '홍콩 룰은 승리 선언 전에 패가 최소 3판의 가치가 있어야 합니다. 기술적으로 완성되었지만 점수가 부족한 패는 선언할 수 없으므로, 패를 개선하기 위해 계속 플레이합니다.' },
      { question: '실제 돈 도박이 있나요?', answer: '아니요. 베팅, 구매 가능한 화폐, 현금 상품은 전혀 없습니다. 점수는 자신의 진행 상황을 기록할 뿐입니다.' }
    ]
  }
};

const RIICHI_CONTENT: Record<LocaleCode, Partial<GameContent>> = {
  en: {
    intro:
      'Riichi is the Japanese ruleset that most of the modern competitive mahjong scene plays. It rewards concealed hands and rich pattern-building rather than raw speed, which makes it the deepest of the three rulesets on this site and the most rewarding to study.',
    howToPlay: [
      'The core loop is the same as any four-player mahjong: draw a tile, discard a tile, and build four sets plus a pair.',
      'Riichi puts a premium on keeping your hand concealed. Calling tiles from other players closes off many scoring patterns.',
      'A hand needs at least one scoring pattern to be declared, so a hand that is merely complete is not always a winning hand.',
      'Seven pairs and thirteen orphans count as alternative winning shapes, both of which require a fully concealed hand.'
    ],
    tips: [
      'Concealed hands score much better here than under Hong Kong rules. Resist calling unless the call takes you straight to ready.',
      'All-simples is the workhorse pattern: no terminals, no honours. It is reachable from almost any starting hand.',
      'Dealt four or more pairs early, seven pairs is often a faster route to ready than forcing four sets.',
      'Late in the hand, watch which tiles the other seats have stopped discarding. That is usually where their wait is.'
    ],
    faq: [
      { question: 'How is Riichi different from Chinese mahjong?', answer: 'Riichi requires a scoring pattern before a win can be declared, values concealed hands more highly, and uses a different scoring table. The draw-and-discard core is the same, so the two transfer easily.' },
      { question: 'Is this a good place to learn Riichi?', answer: 'It is a good place to get comfortable with the flow, the calls and the common patterns. The readiness hint shows how far you are from a complete hand, which is the single most useful thing for a new player to see.' }
    ]
  },
  zh: {
    intro:
      '立直是日式麻将的核心——听牌后可以宣言立直，一旦和牌可加一番。日麻还有役种限制、宝牌与振听等规则，让每一局都充满策略。本桌提供三位电脑对手、听牌提示与得分明细。',
    howToPlay: [
      '核心流程与任何四人麻将相同：摸一张、打一张，凑出四组搭子加一对将牌。',
      '立直高度重视保持手牌门前（不鸣牌）。从别家叫牌会让许多役种失效。',
      '胡牌至少需要一个役种，所以仅仅成型的手牌并不总是能胡。',
      '七对子和国士无双是两种特殊胡牌形，两者都要求手牌完全门前。'
    ],
    tips: [
      '在立直规则下，门清手牌远比香港规则得分高。除非叫牌能直接听牌，否则尽量不叫。',
      '断幺九是最常用的役：没有幺九牌、没有字牌。几乎任何起手牌都能做成。',
      '起手就有四对以上时，七对子往往比强行凑四组搭子更快听牌。',
      '牌局后期，注意其他三家不再打出的牌。那通常就是他们的听牌张。'
    ],
    faq: [
      { question: '立直和国标麻将有什么不同？', answer: '立直要求胡牌前必须有一个役种，更看重门清手牌，且计分表不同。摸打核心相同，所以两者很容易互相迁移。' },
      { question: '这是学立直的好地方吗？', answer: '这里是熟悉流程、叫牌和常见役的好地方。听牌提示会显示你离成型还有多远，这是新手能看到的最有用的信息。' }
    ]
  },
  'zh-TW': {
    intro:
      '立直是日式麻將的核心——聽牌後可以宣告立直，一旦和牌可加一番。日麻還有役種限制、寶牌與振聽等規則，讓每一局都充滿策略。本桌提供三位電腦對手、聽牌提示與得分明細。',
    howToPlay: [
      '核心流程與任何四人麻將相同：摸一張、打一張，湊出四組搭子加一對將牌。',
      '立直高度重視保持手牌門前（不鳴牌）。從別家叫牌會讓許多役種失效。',
      '胡牌至少需要一個役種，所以僅僅成型的手牌並不總是可以胡。',
      '七對子和國士無雙是兩種特殊胡牌形，兩者都要求手牌完全門前。'
    ],
    tips: [
      '在立直規則下，門清手牌遠比香港規則得分高。除非叫牌能直接聽牌，否則盡量不叫。',
      '斷么九是最常用的役：沒有么九牌、沒有字牌。幾乎任何起手牌都能做成。',
      '起手就有四對以上時，七對子往往比強行湊四組搭子更快聽牌。',
      '牌局後期，注意其他三家不再打出的牌。那通常就是他們的聽牌張。'
    ],
    faq: [
      { question: '立直和國標麻將有什麼不同？', answer: '立直要求胡牌前必須有一個役種，更看重門清手牌，且計分表不同。摸打核心相同，所以兩者很容易互相遷移。' },
      { question: '這是學立直的好地方嗎？', answer: '這裡是熟悉流程、叫牌和常見役的好地方。聽牌提示會顯示你離成型還有多遠，這是新手能看到的最有用的資訊。' }
    ]
  },
  ja: {
    intro:
      '立直は日本麻雀の中心となるルールです。聴牌時にリーチを宣言でき、和了すると一飜加算されます。役の制限、ドラ、振聴など、戦略性の高いルールが詰まっています。この卓では三人のコンピューター対戦相手、聴牌ヒント、得点内訳を提供します。',
    howToPlay: [
      '基本の流れは四人麻雀と同じです：牌を引き、切って、四組の面子と一組の雀頭を作ります。',
      '立直では手牌を門前で保つことが重要です。鳴くと多くの役が閉ざされます。',
      '和了には最低一つの役が必要なので、単に完成した手でも必ずしも和了できません。',
      '七対子と国士無双は特殊な和了形で、どちらも完全な門前手が必要です。'
    ],
    tips: [
      '門前の手は香港ルールよりもはるかに高得点です。リーチに直行する時以外は鳴きを我慢しましょう。',
      '断幺九は定番の役です：幺九牌も字牌もなし。ほとんどどんな配牌からでも狙えます。',
      '初めから4つ以上の対子があれば、七対子が4面子を組むより早く聴牌できることが多いです。',
      '終盤、他の席が切り止めた牌を見てください。そこが彼らの待ちであることが多いです。'
    ],
    faq: [
      { question: '立直と中国麻雀はどう違いますか？', answer: '立直は和了に役を要求し、門前の手をより高く評価し、点数表も異なります。引く・切るの基本は同じなので、移行は簡単です。' },
      { question: 'ここで立直を学べますか？', answer: '流れ、鳴き、一般的な役に慣れるのに良い場所です。聴牌ヒントが完成までの距離を示し、初心者にとって最も有用な情報です。' }
    ]
  },
  ko: {
    intro:
      '리치는 일본 마작의 핵심입니다. 텐파이 시 리치를 선언하고, 화료하면 1판이 추가됩니다. 역 제한, 도라, 후리텐 등 전략적인 룰이 가득합니다. 컴퓨터 상대 3명, 텐파이 힌트, 점수 내역을 제공합니다.',
    howToPlay: [
      '기본 흐름은 다른 4인 마작과 같습니다: 패를 뽑고 버리며 네 세트와 한 쌍을 만듭니다.',
      '리치는 패를 숨겨서(문전) 유지하는 것을 중요시합니다. 다른 플레이어의 패를 선언하면 많은 역이 사라집니다.',
      '화료하려면 최소 한 개의 역이 필요하므로, 단순히 완성된 패가 항상 이기는 패는 아닙니다.',
      '치토이츠(7쌍)와 국사무쌍은 특별한 화료 형태로, 둘 다 완전히 문전인 패가 필요합니다.'
    ],
    tips: [
      '문전 패는 홍콩 룰보다 훨씬 높은 점수를 받습니다. 리치로 직행하는 경우가 아니면 선언을 자제하세요.',
      '탕야오(전부 중간패)는 가장 흔한 역입니다: 1·9패도 자패도 없음. 거의 어떤 시작 패에서도 노릴 수 있습니다.',
      '시작부터 쌍이 4개 이상이라면, 억지로 4세트를 만드는 것보다 치토이츠가 더 빨리 텐파이에 도달할 수 있습니다.',
      '후반에는 다른 자리가 버리기를 멈춘 패를 관찰하세요. 그것이 보통 그들의 대기입니다.'
    ],
    faq: [
      { question: '리치와 중국 마작은 어떻게 다른가요?', answer: '리치는 화료 전에 역을 요구하고, 문전 패를 더 높이 평가하며, 점수표가 다릅니다. 뽑고 버리는 기본은 같아서 쉽게 배울 수 있습니다.' },
      { question: '여기서 리치를 배우기 좋은가요?', answer: '흐름, 선언, 흔한 역에 익숙해지기 좋은 곳입니다. 텐파이 힌트가 완성까지의 거리를 보여주며, 초보자에게 가장 유용한 정보입니다.' }
    ]
  }
};

const CHINESE_OFFICIAL_CONTENT: Record<LocaleCode, Partial<GameContent>> = {
  en: {
    intro:
      'Chinese Official, also called Mahjong Competition Rules, is the ruleset used for international tournament play. Its eight-point minimum forces you to build a hand with real structure rather than racing to the first complete shape, which makes it the most demanding of the three rulesets here.',
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
    ],
    faq: [
      { question: 'Why can I not declare a win on a complete hand?', answer: 'Chinese Official requires eight points minimum. If your completed hand scores less, the win cannot be declared and play continues.' },
      { question: 'Is the scoring here complete?', answer: 'It covers the common patterns rather than the full official table. It is built for learning and casual play, not for tournament adjudication.' }
    ]
  },
  zh: {
    intro:
      '国标麻将，即中国麻将竞赛规则，是国际赛事使用的规则。它要求至少八番才能胡牌，迫使你构建真正有结构的牌型，而不是抢第一个成型的手牌——这也是三种规则中最考验功力的。',
    howToPlay: [
      '标准的四人麻将：摸牌、打牌，凑出四组搭子加一对将牌。',
      '胡牌前手牌至少值八番。没有番型的简单手牌不能胡。',
      '番来自各种牌型——清一色、碰碰胡、箭牌和风牌刻子等——它们可以叠加。',
      '由于门槛很高，靠叫牌凑一副弱牌通常不是好主意。'
    ],
    tips: [
      '开局几手就选定方向。清一色和碰碰胡是凑够八番最可靠的途径。',
      '箭牌和门风刻子值得吃，即使损失一手牌，因为它们能搭配几乎所有其他牌型。',
      '差一张就成型但只值六番的手牌还不算完成。继续改进它。'
    ],
    faq: [
      { question: '为什么手牌成型了却不能胡？', answer: '国标要求最低八番。如果成型的手牌分数不足，不能宣布胡牌，游戏继续。' },
      { question: '这里的计分完整吗？', answer: '它覆盖常见番型，而非完整的官方番种表。它面向学习和娱乐，不是赛事裁判用。' }
    ]
  },
  'zh-TW': {
    intro:
      '國標麻將，即中國麻將競賽規則，是國際賽事使用的規則。它要求至少八番才能胡牌，迫使你構建真正有結構的牌型，而不是搶第一個成型的手牌——這也是三種規則中最考驗功力的。',
    howToPlay: [
      '標準的四人麻將：摸牌、打牌，湊出四組搭子加一對將牌。',
      '胡牌前手牌至少值八番。沒有番型的簡單手牌不能胡。',
      '番來自各種牌型——清一色、碰碰胡、箭牌和風牌刻子等——它們可以疊加。',
      '由於門檻很高，靠叫牌湊一副弱牌通常不是好主意。'
    ],
    tips: [
      '開局幾手就選定方向。清一色和碰碰胡是湊夠八番最可靠的途徑。',
      '箭牌和門風刻子值得吃，即使損失一手牌，因為它們能搭配幾乎所有其他牌型。',
      '差一張就成型但只值六番的手牌還不算完成。繼續改進它。'
    ],
    faq: [
      { question: '為什麼手牌成型了卻不能胡？', answer: '國標要求最低八番。如果成型的手牌分數不足，不能宣布胡牌，遊戲繼續。' },
      { question: '這裡的計分完整嗎？', answer: '它涵蓋常見番型，而非完整的官方番種表。它面向學習和娛樂，不是賽事裁判用。' }
    ]
  },
  ja: {
    intro:
      '中国式競技麻雀（MCR）は国際大会で使われるルールです。和了には最低八飜が必要で、最初に完成した手で勝つよりも、本当に構造のある手を作ることを要求されます。この3つのルールの中で最も要求が高いものです。',
    howToPlay: [
      '標準的な四人麻雀：牌を引き、切り、四組の面子と一組の雀頭を作ります。',
      '和了には最低八飜の価値が必要です。役のない単純な手は対象外です。',
      '飜は役から来ます——一色、対々和、三元牌・風牌の刻子など——そして積み重なります。',
      '最低点が高いため、弱い手を鳴いて急ぐのは通常損な計画です。'
    ],
    tips: [
      '最初の数手で方向を決めましょう。一色手と対々和は八飜をクリアする最も確実な方法です。',
      '三元牌と自風の刻子は一手損しても取る価値があります。他のほとんどの役と組み合わさるからです。',
      '完成まで一枚足りないが六飜しかない手はまだ手ではありません。改善し続けましょう。'
    ],
    faq: [
      { question: '完成したのに和了できないのはなぜ？', answer: '中国式競技麻雀は最低八飜を要求します。完成しても八飜未満なら和了できず、プレイは続きます。' },
      { question: 'ここでの計算は完全ですか？', answer: '公式の全役表ではなく一般的な役を網羅しています。学習とカジュアルプレイ向けで、大会の判定用ではありません。' }
    ]
  },
  ko: {
    intro:
      '중국 공식 마작(MCR)은 국제 대회에서 사용되는 룰입니다. 최소 8판이 있어야 화료할 수 있어, 서두르지 않고 진짜 구조를 갖춘 패를 만들어야 합니다. 세 룰 중 가장 까다롭습니다.',
    howToPlay: [
      '표준 4인 마작: 패를 뽑고 버리며 네 세트와 한 쌍을 만듭니다.',
      '화료하려면 패가 최소 8판의 가치가 있어야 합니다. 역이 없는 단순한 패는 화료할 수 없습니다.',
      '판은 역에서 나옵니다 — 청일색, 대삼원·대대화, 용·바람패 삼중 등 — 그리고 쌓입니다.',
      '최소 기준이 높기 때문에, 약한 패를 선언하며 서두르는 것은 보통 손해입니다.'
    ],
    tips: [
      '첫 몇 턴에 방향을 정하세요. 청일색과 대대화(올 트리플) 패가 8판을 채우는 가장 확실한 방법입니다.',
      '용패와 자풍 삼중은 한 턴을 희생하더라도 가져갈 가치가 있습니다. 거의 모든 다른 역과 조합되기 때문입니다.',
      '완성까지 한 장 남았지만 6판밖에 안 되는 패는 아직 패가 아닙니다. 계속 개선하세요.'
    ],
    faq: [
      { question: '패가 완성됐는데 왜 화료를 못 하나요?', answer: '중국 공식 마작은 최소 8판을 요구합니다. 완성된 패가 8판 미만이면 화료를 선언할 수 없고 플레이가 계속됩니다.' },
      { question: '여기 점수 계산은 완전한가요?', answer: '공식 역표 전체가 아니라 일반적인 역을 다룹니다. 학습과 캐주얼 플레이용으로 만들어졌으며, 대회 판정용이 아닙니다.' }
    ]
  }
};

/* ------------------------------------------------------------------------- */
/*  休闲麻将（连看 / 接龙）                                                    */
/* ------------------------------------------------------------------------- */

const CONNECT_CONTENT: Record<LocaleCode, Partial<GameContent>> = {
  en: {
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
      { question: 'How is this different from mahjong solitaire?', answer: 'Solitaire stacks tiles in layers and you match tiles that are free on one side. Connect lays them flat and asks you to join pairs with a path. Different puzzle, same tiles.' },
      { question: 'What counts as a turn in the path?', answer: 'Every change of direction. A straight line has no turns, an L shape has one, and a Z or U shape has two. Three or more is not allowed.' }
    ]
  },
  zh: {
    intro:
      '麻将连连看，又称 Onet，是一种用麻将牌做的连线消除谜题。用最多两次转弯的路径连接一对相同的牌，清空整个棋盘。休闲模式没有计时，可以慢慢玩。',
    howToPlay: [
      '点击两张相同的牌。',
      '如果两张牌可以用一条最多转两次弯的空路径连接，就能消除。路径可以绕棋盘外圈走。',
      '消除全部牌即获胜。连续消除会累积连击加成。',
      '没有可消除的牌对时，棋盘会自动重洗，永远不会卡住。'
    ],
    tips: [
      '先从边缘下手。外侧的牌可走的路径最多，消除后会打开中间的区域。',
      '相邻的两张相同牌总能消除——但消除它们可能是打通其他路径的唯一办法，所以先看清楚再下手。',
      '提示按钮会花掉几点分数。在计时模式里，这笔交易几乎总是值得的。'
    ],
    faq: [
      { question: '这和麻将接龙有什么不同？', answer: '接龙把牌堆叠成层，只能消除一侧空闲的牌。连连看把牌平铺，要求用路径连接一对牌。谜题不同，牌相同。' },
      { question: '路径里"转弯"怎么算？', answer: '每次改变方向算一次。直线不转弯，L 形一次，Z 形或 U 形两次。三次及以上不允许。' }
    ]
  },
  'zh-TW': {
    intro:
      '麻將連連看，又稱 Onet，是一種用麻將牌做的連線消除謎題。用最多兩次轉彎的路徑連接一對相同的牌，清空整個棋盤。休閒模式沒有計時，可以慢慢玩。',
    howToPlay: [
      '點擊兩張相同的牌。',
      '如果兩張牌可以用一條最多轉兩次彎的空路徑連接，就能消除。路徑可以繞棋盤外圈走。',
      '消除全部牌即獲勝。連續消除會累積連擊加成。',
      '沒有可消除的牌對時，棋盤會自動重洗，永遠不會卡住。'
    ],
    tips: [
      '先從邊緣下手。外側的牌可走的路徑最多，消除後會打開中間的區域。',
      '相鄰的兩張相同牌總能消除——但消除它們可能是打通其他路徑的唯一辦法，所以先看清楚再下手。',
      '提示按鈕會花掉幾點分數。在計時模式裡，這筆交易幾乎總是值得的。'
    ],
    faq: [
      { question: '這和麻將接龍有什麼不同？', answer: '接龍把牌堆疊成層，只能消除一側空閒的牌。連連看把牌平鋪，要求用路徑連接一對牌。謎題不同，牌相同。' },
      { question: '路徑裡「轉彎」怎麼算？', answer: '每次改變方向算一次。直線不轉彎，L 形一次，Z 形或 U 形兩次。三次及以上不允許。' }
    ]
  },
  ja: {
    intro:
      'マージャンコネクト（オネット）は麻雀牌を使った線つなぎのパズルです。最大2回曲がる道で同じ牌のペアをつなぎ、盤面を全て消します。リラックスモードは時間制限なしで、ゆっくり遊べます。',
    howToPlay: [
      '同じ絵柄の牌を2枚タップまたはクリックします。',
      '最大2回曲がる空き道でつなげれば消せます。盤の外側の縁を通ることもできます。',
      '全ての牌を消すと勝利です。連続マッチでストリークボーナスが付きます。',
      '動かせるペアがなくなると自動でシャッフルされるので、行き詰まることはありません。'
    ],
    tips: [
      '最初に端から消しましょう。外側の牌は経路が最も多く、消えると中央が開きます。',
      '隣り合う同じ牌は常に消せますが、それらを消すことが別の道を開く唯一の方法かもしれないので、先に見てから取りましょう。',
      'ヒントボタンは数点かかりますが、時間制モードではほぼ常にその価値があります。'
    ],
    faq: [
      { question: '麻雀ソリティアとはどう違いますか？', answer: 'ソリティアは牌を重ねて置き、片側が空いた牌だけを消します。コネクトは平らに置き、道でペアをつなぎます。パズルは違いますが、牌は同じです。' },
      { question: '道の「曲がり」とは何ですか？', answer: '方向を変えるたびに1回です。直線は0回、L字は1回、Z字やU字は2回です。3回以上はできません。' }
    ]
  },
  ko: {
    intro:
      '마작 커넥트(오넷)는 마작 타일로 만든 연결 맞추기 퍼즐입니다. 최대 두 번 꺾이는 경로로 같은 타일 쌍을 연결해 보드를 모두 지웁니다. 휴식 모드는 시간 제한이 없어 천천히 즐길 수 있습니다.',
    howToPlay: [
      '같은 그림의 타일 두 장을 탭하거나 클릭하세요.',
      '최대 두 번 꺾이는 빈 경로로 연결할 수 있으면 쌍이 지워집니다. 경로는 보드 바깥 가장자리를 지날 수 있습니다.',
      '모든 타일을 지우면 승리합니다. 연속 매치는 스트릭 보너스를 쌓습니다.',
      '움직일 쌍이 없으면 보드가 자동으로 다시 섞여, 막히는 일이 없습니다.'
    ],
    tips: [
      '먼저 가장자리를 처리하세요. 바깥 타일은 경로가 가장 많고, 지워지면 중앙이 열립니다.',
      '나란히 있는 같은 타일은 항상 제거할 수 있지만, 그것을 지우는 것이 다른 경로를 여는 유일한 방법일 수 있으니 먼저 확인하세요.',
      '힌트 버튼은 약간의 점수를 소모하지만, 시간 제한 보드에서는 거의 항상 그만한 가치가 있습니다.'
    ],
    faq: [
      { question: '마작 솔리테어와 어떻게 다른가요?', answer: '솔리테어는 타일을 층으로 쌓고 한쪽이 비어 있는 타일만 짝지웁니다. 커넥트는 타일을 평평하게 놓고 경로로 쌍을 연결합니다. 퍼즐은 다르지만 타일은 같습니다.' },
      { question: '경로에서 "꺾임"은 무엇인가요?', answer: '방향을 바꿀 때마다 한 번입니다. 직선은 0번, L자는 1번, Z자나 U자는 2번입니다. 3번 이상은 허용되지 않습니다.' }
    ]
  }
};

const SOLITAIRE_CONTENT: Record<LocaleCode, Partial<GameContent>> = {
  en: {
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
      { question: 'How is this different from mahjong connect?', answer: 'Connect lays tiles flat and asks you to join matching pairs with a path. Solitaire stacks tiles in layers, and you match tiles that are free on one side and uncovered on top. Different puzzle, same tiles.' },
      { question: 'What does "free" mean here?', answer: 'A tile is free when nothing rests directly on top of it and at least one of its left or right neighbours at the same level is empty. The outer edge tiles of a layer are always free on the outside.' },
      { question: 'Is every game guaranteed solvable?', answer: 'Yes. Deals are built in reverse — the game repeatedly picks two free tiles, removes them and records the match — so every layout has a known solution path you can find with thought.' },
      { question: 'Is there any real-money gambling?', answer: 'No. This is a pure puzzle with no wagering, no purchasable currency and no cash prize of any kind.' }
    ]
  },
  zh: {
    intro:
      '麻将接龙是一款用麻将牌做的经典单人配对消除谜题。匹配两张空闲的牌——顶部没有压牌且至少一侧敞开——来清空整个牌面。这里的每一局都是保证可解的，所以一定存在完整的清除方案。包含两种经典牌型——乌龟和金字塔——外加提示、撤销，以及卡住时重洗。',
    howToPlay: [
      '点击两张相同的牌进行匹配。只有空闲的牌才能匹配：顶部没有压牌，且同层至少一侧是敞开的。',
      '上层牌会压住下层牌，所以要自上而下地清除。顶层始终可操作；下层会随着清除而打开。',
      '清空所有牌即获胜。乌龟阵在盘面上铺开宽大的壳；金字塔则堆叠五个居中的三角形，从边缘向中心剥离。',
      '每局都是保证可解的，所以一定存在解法。卡住时用提示、撤销仓促的匹配，或重洗剩余牌。',
      '没有计时器也没有分数压力——想玩多久都行。'
    ],
    tips: [
      '先处理外围。一层外边缘的牌天然有一侧敞开，清除周边会打开中间。',
      '在拿走明显的一对之前，先看看它会释放什么。两张相邻的相同牌容易匹配，但清除它们可能是解开高层堆的唯一办法。',
      '善用金字塔的层级：它的边缘牌一开始就能操作，只有到达对应层才能碰到塔尖牌。',
      '如果没有可匹配的牌，重洗而不是重开——剩余牌会以新的可解排列重新发牌。'
    ],
    faq: [
      { question: '这和麻将连连看有什么不同？', answer: '连连看把牌平铺，要求用路径连接一对牌。接龙把牌堆成层，匹配一侧空闲且顶部无压的牌。谜题不同，牌相同。' },
      { question: '这里的"空闲"是什么意思？', answer: '一张牌空闲是指顶部没有直接压着任何牌，且同一层左右邻居至少有一个是空的。一层的边缘牌外侧始终是空闲的。' },
      { question: '每局都保证可解吗？', answer: '是的。牌局是逆向构建的——游戏反复挑选两张空闲的牌、移除并记录匹配——所以每个牌面都有已知的解法路径，你可以用心找到它。' },
      { question: '有没有真钱赌博？', answer: '没有。这是纯谜题，没有下注、可购买的货币或任何现金奖励。' }
    ]
  },
  'zh-TW': {
    intro:
      '麻將接龍是一款用麻將牌做的經典單人配對消除謎題。匹配兩張空閒的牌——頂部沒有壓牌且至少一側敞開——來清空整個牌面。這裡的每一局都是保證可解的，所以一定存在完整的清除方案。包含兩種經典牌型——烏龜和金字塔——外加提示、復原，以及卡住時重洗。',
    howToPlay: [
      '點擊兩張相同的牌進行匹配。只有空閒的牌才能匹配：頂部沒有壓牌，且同層至少一側是敞開的。',
      '上層牌會壓住下層牌，所以要自上而下地清除。頂層始終可操作；下層會隨著清除而打開。',
      '清空所有牌即獲勝。烏龜陣在盤面上鋪開寬大的殼；金字塔則堆疊五個居中的三角形，從邊緣向中心剝離。',
      '每局都是保證可解的，所以一定存在解法。卡住時用提示、復原倉促的匹配，或重洗剩餘牌。',
      '沒有計時器也沒有分數壓力——想玩多久都行。'
    ],
    tips: [
      '先處理外圍。一層外邊緣的牌天然有一側敞開，清除周邊會打開中間。',
      '在拿走明顯的一對之前，先看看它會釋放什麼。兩張相鄰的相同牌容易匹配，但清除它們可能是解開高層堆的唯一辦法。',
      '善用金字塔的層級：它的邊緣牌一開始就能操作，只有到達對應層才能碰到塔尖牌。',
      '如果沒有可匹配的牌，重洗而不是重開——剩餘牌會以新的可解排列重新發牌。'
    ],
    faq: [
      { question: '這和麻將連連看有什麼不同？', answer: '連連看把牌平鋪，要求用路徑連接一對牌。接龍把牌堆成層，匹配一側空閒且頂部無壓的牌。謎題不同，牌相同。' },
      { question: '這裡的「空閒」是什麼意思？', answer: '一張牌空閒是指頂部沒有直接壓著任何牌，且同一層左右鄰居至少有一個是空的。一層的邊緣牌外側始終是空閒的。' },
      { question: '每局都保證可解嗎？', answer: '是的。牌局是逆向構建的——遊戲反覆挑選兩張空閒的牌、移除並記錄匹配——所以每個牌面都有已知的解法路徑，你可以用心找到它。' },
      { question: '有沒有真錢賭博？', answer: '沒有。這是純謎題，沒有下注、可購買的貨幣或任何現金獎勵。' }
    ]
  },
  ja: {
    intro:
      '麻雀ソリティアは麻雀牌を使った定番の一人用パズルです。空いている牌——上に何も載っておらず、少なくとも一辺が開いている牌——を同じ絵柄でペアにして盤面を全て消します。ここでは全ディールが解けることが保証されているので、必ず解消方法があります。定番の2種類（亀とピラミッド）に加え、ヒント、アンドゥ、行き詰まった時のシャッフルがあります。',
    howToPlay: [
      '同じ絵柄の牌を2枚タップしてマッチさせます。マッチできるのは空いている牌だけです：上に何も載っておらず、同じ層で少なくとも一辺が開いています。',
      '上の牌は真下の牌を覆うので、上から下へと消していきます。最上層は常に操作可能で、消すほど下の層が開きます。',
      '全ての牌を消すと勝利です。亀は盤面に広い甲羅を広げ、ピラミッドは5つの中央寄りの三角形を端から内側に向かって剥がしていきます。',
      '全てのディールは解けることが保証されているので、必ず解法があります。詰まったらヒント、慌てたマッチはアンドゥ、残りはシャッフルできます。',
      'タイマーもスコアのプレッシャーもありません——時間をかけて楽しめます。'
    ],
    tips: [
      '最初に外側を処理しましょう。層の外縁の牌は片側が空いているので、周囲を消すと中央が開きます。',
      '明らかなペアを取る前に、それが何を解放するかを見てください。隣り合う同じ牌は簡単にマッチしますが、それらを消すことが高い山を解く唯一の方法かもしれません。',
      'ピラミッドの層を活用しましょう：端の牌は最初から使え、頂点の牌はその層に達した時だけ触れます。',
      'マッチがなくなったら再開ではなくシャッフルを——残りの牌が新しい解ける配置で再配されます。'
    ],
    faq: [
      { question: '麻雀コネクトとはどう違いますか？', answer: 'コネクトは牌を平らに置き、道でペアをつなぎます。ソリティアは牌を重ね、片側が空いて上に何もない牌をマッチさせます。パズルは違いますが、牌は同じです。' },
      { question: '「空いている」とはどういう意味ですか？', answer: '上に直接何も載っておらず、同じレベルの左右どちらかが空いていれば空いています。層の外縁の牌は外側が常に空いています。' },
      { question: '全てのゲームが解けることを保証されていますか？', answer: 'はい。ディールは逆から作られます——空いている2枚を選び、取り除き、マッチを記録する——ので、どの配置にも論理的に見つけられる解き方が存在します。' },
      { question: '実際のお金がかかる賭け事はありますか？', answer: 'いいえ。賭け、購入できる通貨、現金賞品のない純粋なパズルです。' }
    ]
  },
  ko: {
    intro:
      '마작 솔리테어는 마작 타일로 만든 고전적인 1인 타일 맞추기 퍼즐입니다. 비어 있는 타일(위에 아무것도 없고 한쪽 이상이 열린 타일)을 같은 그림으로 짝지어 보드를 모두 지웁니다. 여기의 모든 딜은 풀 수 있게 생성되므로 완전한 제거가 항상 가능합니다. 거북이와 피라미드 두 가지 고전 레이아웃과 힌트, 실행 취소, 막혔을 때 다시 섞기가 포함됩니다.',
    howToPlay: [
      '같은 그림의 타일 두 장을 탭해 짝지으세요. 비어 있는 타일만 짝지을 수 있습니다: 위에 아무것도 없고 같은 층에서 한쪽 이상이 열려 있어야 합니다.',
      '위 타일은 바로 아래 타일을 덮으므로, 위에서 아래로 지웁니다. 맨 위 층은 항상 사용 가능하며, 지우면서 아래 층이 열립니다.',
      '모든 타일을 지우면 승리합니다. 거북이는 넓은 등껍질을 펼치고, 피라미드는 가운데 5개의 삼각형을 쌓아 가장자리에서 안쪽으로 벗겨냅니다.',
      '모든 딜은 풀 수 있게 생성되므로 항상 해법이 존재합니다. 막히면 힌트를, 성급한 매치는 실행 취소를, 남은 타일은 다시 섞기를 사용하세요.',
      '타이머도 점수 압박도 없습니다——시간을 충분히 들여 즐기세요.'
    ],
    tips: [
      '먼저 바깥쪽을 처리하세요. 층의 바깥 가장자리 타일은 한쪽이 열려 있어, 주변을 지우면 중앙이 열립니다.',
      '분명한 쌍을 가져가기 전에 그것이 무엇을 해제하는지 보세요. 나란한 같은 타일은 쉽게 짝지을 수 있지만, 그것을 지우는 것이 높은 더미를 푸는 유일한 방법일 수 있습니다.',
      '피라미드 층을 활용하세요: 가장자리 타일은 처음부터 사용할 수 있고, 정점 타일은 그 층에 도달했을 때만 접근할 수 있습니다.',
      '매치가 없으면 다시 시작하지 말고 다시 섞으세요——남은 타일이 새로운 풀 수 있는 배열로 재배치됩니다.'
    ],
    faq: [
      { question: '마작 커넥트와 어떻게 다른가요?', answer: '커넥트는 타일을 평평하게 놓고 경로로 쌍을 연결합니다. 솔리테어는 타일을 층으로 쌓고 한쪽이 열리고 위에 없는 타일을 짝짓습니다. 퍼즐은 다르지만 타일은 같습니다.' },
      { question: '"비어 있다"는 것은 무슨 뜻인가요?', answer: '타일 위에 직접 아무것도 없고, 같은 레벨의 왼쪽·오른쪽 중 하나가 비어 있으면 비어 있는 것입니다. 층의 바깥 가장자리 타일은 바깥쪽이 항상 열려 있습니다.' },
      { question: '모든 게임이 풀 수 있다고 보장되나요?', answer: '네. 딜은 역으로 만들어집니다——비어 있는 타일 두 장을 골라 제거하고 매치를 기록——그래서 모든 배치에는 논리적으로 찾을 수 있는 해법이 있습니다.' },
      { question: '실제 돈 도박이 있나요?', answer: '아니요. 베팅, 구매 가능한 화폐, 현금 상품이 전혀 없는 순수한 퍼즐입니다.' }
    ]
  }
};

/* ------------------------------------------------------------------------- */
/*  完整 GAME_I18N                                                            */
/* ------------------------------------------------------------------------- */

export const GAME_I18N: Record<string, GameI18n> = {
  // ── classic: 4 人麻将 ────────────────────────────────────────────────────
  'hong-kong-mahjong': {
    title: {
      zh: '香港麻将',
      'zh-TW': '香港麻將',
      ja: '香港麻雀',
      ko: '홍콩 마작'
    },
    description: {
      zh: '与三位对手玩真正的四人麻将。香港老章计分，免费，无需下载。',
      'zh-TW': '與三位對手玩真正的四人麻將。香港老章計分，免費，無需下載。',
      ja: '三人の対戦相手と本格的な四人麻雀を。香港スタイルの計算、無料、ダウンロード不要。',
      ko: '세 명의 상대와 진짜 4인 마작을 즐기세요. 홍콩 구식 스코어링, 무료, 다운로드 불필요.'
    },
    content: HONGKONG_CONTENT
  },
  'riichi-mahjong': {
    title: {
      zh: '日本麻将',
      'zh-TW': '日本麻將',
      ja: '日本麻雀',
      ko: '일본 마작'
    },
    description: {
      zh: '与三位对手打日式立直麻将——现代竞技麻将背后的规则。',
      'zh-TW': '與三位對手打日式立直麻將——現代競技麻將背後的規則。',
      ja: '三人の対戦相手と日本式立直麻雀を。現代競技麻雀の基礎となるルール。',
      ko: '세 명의 상대와 일본 리치 마작을 플레이하세요. 현대 경기 마작의 룰.'
    },
    content: RIICHI_CONTENT
  },
  'chinese-official-mahjong': {
    title: {
      zh: '中国麻将（国标）',
      'zh-TW': '中國麻將（國標）',
      ja: '中国麻雀（国標）',
      ko: '중국 공식 마작'
    },
    description: {
      zh: '国标麻将（MCR）——国际竞赛规则，胡牌至少八番。',
      'zh-TW': '國標麻將（MCR）——國際競賽規則，胡牌至少八番。',
      ja: '中国式競技麻雀（MCR）——国際大会ルール。和了には最低八飜が必要。',
      ko: '중국 공식 마작(MCR)——국제 대회 룰. 최소 8판이 있어야 화료 가능.'
    },
    content: CHINESE_OFFICIAL_CONTENT
  },

  // ── classic: coming-soon rulesets ───────────────────────────────────────
  'sichuan-mahjong': {
    title: { zh: '四川麻将', 'zh-TW': '四川麻將', ja: '四川麻雀', ko: '쓰촨 마작' },
    description: {
      zh: '血流成河的四川麻将：定缺一门、换三张，胡牌后继续战斗。',
      'zh-TW': '血流成河的四川麻將：定缺一門、換三張，胡牌後繼續戰鬥。',
      ja: '四川麻雀（血戦）：缺門を決め、三枚交換し、和了後も続行するルール。',
      ko: '쓰촨 피의 전투 마작: 결장 원색, 3장 교환, 화료 후에도 계속 플레이.'
    }
  },
  'taiwan-mahjong': {
    title: { zh: '台湾麻将', 'zh-TW': '台灣麻將', ja: '台湾麻雀', ko: '대만 마작' },
    description: {
      zh: '十六张台湾麻将：花牌补花、台数计分。',
      'zh-TW': '十六張台灣麻將：花牌補花、台數計分。',
      ja: '台湾麻雀（16枚）：花牌の補花と台数による計算。',
      ko: '대만 16장 마작: 꽃패 보충과 대수(타이) 점수.'
    }
  },
  'american-mahjong': {
    title: { zh: '美国麻将', 'zh-TW': '美國麻將', ja: 'アメリカ麻雀', ko: '미국 마작' },
    description: {
      zh: '美国麻将：查尔斯顿换牌、百搭牌、花牌与年度卡牌牌型。',
      'zh-TW': '美國麻將：查爾斯頓換牌、百搭牌、花牌與年度卡牌牌型。',
      ja: 'アメリカ麻雀：チャールストン、ジョーカー、花牌と年次カードの役。',
      ko: '미국 마작: 찰스턴, 조커, 꽃패와 연간 카드 패턴.'
    }
  },

  // ── solitaire: 休闲消除 ─────────────────────────────────────────────────
  'mahjong-connect-classic': {
    title: {
      zh: '麻将连连看',
      'zh-TW': '麻將連連看',
      ja: '麻雀コネクト',
      ko: '마작 커넥트'
    },
    description: {
      zh: '用最多两次转弯的路径连接相同麻将牌。三种盘面大小、提示，休闲模式无计时。',
      'zh-TW': '用最多兩次轉彎的路徑連接相同麻將牌。三種盤面大小、提示，休閒模式無計時。',
      ja: '最大2回曲がる道で同じ麻雀牌をつなぐ。3サイズの盤面、ヒント、リラックスモードは時間制限なし。',
      ko: '최대 두 번 꺾이는 경로로 같은 마작 타일을 연결하세요. 세 가지 보드 크기, 힌트, 휴식 모드는 시간 제한 없음.'
    },
    content: CONNECT_CONTENT
  },
  'mahjong-solitaire-classic': {
    title: {
      zh: '经典麻将接龙',
      'zh-TW': '經典麻將接龍',
      ja: '麻雀ソリティアクラシック',
      ko: '클래식 마작 솔리테어'
    },
    description: {
      zh: '经典分层配对消除。乌龟与金字塔牌型、保证可解的牌局、提示与撤销。',
      'zh-TW': '經典分層配對消除。烏龜與金字塔牌型、保證可解的牌局、提示與復原。',
      ja: '定番の重ね消しパズル。亀とピラミッドの配置、解けることが保証されたディール、ヒントとアンドゥ。',
      ko: '고전적인 층층 타일 맞추기. 거북이·피라미드 레이아웃, 풀 수 있는 딜, 힌트와 실행 취소.'
    },
    content: SOLITAIRE_CONTENT
  },

  // ── solitaire: iframe 游戏标题/描述 ─────────────────────────────────────
  'mahjong-connect': {
    title: { zh: '麻将连连看精简版', 'zh-TW': '麻將連連看精簡版', ja: '麻雀コネクトライト', ko: '마작 커넥트 라이트' },
    description: {
      zh: '匹配由路径相连的免费麻将牌。一款轻松的连连看消除游戏。',
      'zh-TW': '匹配由路徑相連的免費麻將牌。一款輕鬆的連連看消除遊戲。',
      ja: '道でつながる空いた麻雀牌をペアで消すリラックスできるコネクトゲーム。',
      ko: '경로로 연결된 비어 있는 마작 타일을 짝지으세요. 편안한 커넥트 스타일 소거 게임.'
    }
  },
  'mahjong-classic': {
    title: { zh: '经典麻将', 'zh-TW': '經典麻將', ja: 'クラシック麻雀', ko: '클래식 마작' },
    description: {
      zh: '经典麻将接龙。匹配敞开的牌对，清空棋盘。',
      'zh-TW': '經典麻將接龍。匹配敞開的牌對，清空棋盤。',
      ja: '定番の麻雀ソリティア。開いた牌のペアを消して盤面をクリア。',
      ko: '고전적인 마작 솔리테어. 열린 타일 쌍을 맞춰 보드를 지우세요.'
    }
  },
  'mahjong-solitaire': {
    title: { zh: '麻将接龙', 'zh-TW': '麻將接龍', ja: '麻雀ソリティア', ko: '마작 솔리테어' },
    description: {
      zh: '美丽的麻将塔牌型。按自己的节奏匹配并清除高塔。',
      'zh-TW': '美麗的麻將塔牌型。按自己的節奏匹配並清除高塔。',
      ja: '美しい麻雀の配置。自分のペースでタイルを消して塔をクリア。',
      ko: '아름다운 마작 타워 레이아웃. 자신의 속도로 타일을 맞춰 탑을 지우세요.'
    }
  },
  'mahjong-3d': {
    title: { zh: '麻将 3D', 'zh-TW': '麻將 3D', ja: '麻雀3D', ko: '마작 3D' },
    description: {
      zh: '三维麻将消除，带景深和宁静的彩虹色调。',
      'zh-TW': '三維麻將消除，帶景深和寧靜的彩虹色調。',
      ja: '奥行きのある3Dの麻雀消し。落ち着いた虹色のパレット。',
      ko: '깊이감과 차분한 레인보우 팔레트를 갖춘 3D 마작 맞추기.'
    }
  },
  'onet-connect-classic': {
    title: { zh: 'Onet 连连看经典', 'zh-TW': 'Onet 連連看經典', ja: 'オネットクラシック', ko: '오넷 커넥트 클래식' },
    description: {
      zh: '经典 Onet 连线游戏。用最多两次转弯的线连接相同牌。',
      'zh-TW': '經典 Onet 連線遊戲。用最多兩次轉彎的線連接相同牌。',
      ja: '定番のオネット。最大2回曲がる線で同じ牌をつなぐ。',
      ko: '고전적인 오넷 연결 게임. 최대 두 번 꺾이는 선으로 같은 타일을 연결하세요.'
    }
  },
  'bee-connect': {
    title: { zh: '蜜蜂连连看', 'zh-TW': '蜜蜂連連看', ja: 'ビーコネクト', ko: '비 커넥트' },
    description: {
      zh: '可爱的蜜蜂主题连连看。连接小牌块，清空蜂巢棋盘。',
      'zh-TW': '可愛的蜜蜂主題連連看。連接小牌塊，清空蜂巢棋盤。',
      ja: 'かわいい蜂をテーマにしたコネクト。小さな牌をつないでハニカム盤面をクリア。',
      ko: '귀여운 벌 테마 커넥트 게임. 작은 타일을 연결해 벌집 보드를 지우세요.'
    }
  },
  'aloha-mahjong': {
    title: { zh: '阿罗哈麻将', 'zh-TW': '阿羅哈麻將', ja: 'アロハ麻雀', ko: '알로하 마작' },
    description: {
      zh: '充满热带风情的麻将消除，阳光明媚、慵懒自在。',
      'zh-TW': '充滿熱帶風情的麻將消除，陽光明媚、慵懶自在。',
      ja: 'トロピカルな雰囲気の麻雀消し。明るくてのんびりした気分。',
      ko: '햇살 가득한 편안한 분위기의 트로피컬 마작 맞추기.'
    }
  },
  '8x8-match-tiles': {
    title: { zh: '8x8 匹配砖块', 'zh-TW': '8x8 匹配磚塊', ja: '8x8 マッチタイル', ko: '8x8 매치 타일' },
    description: {
      zh: '紧凑的 8x8 砖块匹配谜题。连接相同砖块，冲击高分。',
      'zh-TW': '緊湊的 8x8 磚塊匹配謎題。連接相同磚塊，衝擊高分。',
      ja: 'コンパクトな8x8タイルマッチ。同じタイルをつないでハイスコアを狙う。',
      ko: '컴팩트한 8x8 타일 매치 퍼즐. 같은 타일을 연결해 하이스코어를 노리세요.'
    }
  },
  'tile-guru': {
    title: { zh: '砖块大师', 'zh-TW': '磚塊大師', ja: 'タイルグル', ko: '타일 구루' },
    description: {
      zh: '禅意砖块匹配谜题。在宁静的布局中寻找并连接匹配的砖块。',
      'zh-TW': '禪意磚塊匹配謎題。在寧靜的佈局中尋找並連接匹配的磚塊。',
      ja: '禅のようなタイルマッチパズル。落ち着いた配置で同じタイルを見つけてつなぐ。',
      ko: '젠 스타일 타일 매치 퍼즐. 차분한 레이아웃에서 같은 타일을 찾아 연결하세요.'
    }
  },
  'tile-journey': {
    title: { zh: '砖块之旅', 'zh-TW': '磚塊之旅', ja: 'タイルジャーニー', ko: '타일 저니' },
    description: {
      zh: '穿越砖块匹配关卡的旅程。规划你的连接，清空每一关。',
      'zh-TW': '穿越磚塊匹配關卡的旅程。規劃你的連接，清空每一關。',
      ja: 'タイルマッチのレベルを巡る旅。つなぎ方を計画して各ボードをクリア。',
      ko: '타일 매치 레벨을 지나는 여정. 연결을 계획하고 각 보드를 지우세요.'
    }
  }
};
