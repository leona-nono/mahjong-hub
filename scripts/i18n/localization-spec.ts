/**
 * Localization spec — one source of truth for "how we write" in every locale we ship.
 *
 * Two consumers, deliberately kept in sync by living in the same module:
 *   - scripts/i18n/deepseek-client.ts  → builds the translator's system prompt
 *   - scripts/i18n/lint-zh-prose.ts    → builds the wrong-term gate
 *
 * The reason this file exists at all: machine translation of this site produced
 * Chinese that was *correct* and *unreadable* — 板块 for a tile, 图形 for a hand,
 * 抽牌 for drawing, and English clause order preserved clause for clause. Locking
 * terminology in data/glossary.ts fixed the nouns; it could not fix the sentences.
 * This spec governs sentences.
 *
 *   npx tsx scripts/i18n/localization-spec.ts              # 人类可读全文
 *   npx tsx scripts/i18n/localization-spec.ts --locale zh  # 单语种
 *   npx tsx scripts/i18n/localization-spec.ts --markdown   # 交给写手/PR 的文档
 *
 * Canonical reference for the whole i18n toolchain (data layout, gates, workflow,
 * known gaps): docs/I18N_MASTER_SPEC.md. Change a rule here, bump SPEC_VERSION below,
 * and update that document — it is the only place these rules are described.
 */
import { GLOSSARY, type GlossaryLocale } from '../../data/glossary';

/**
 * Spec revision. Bump on ANY change to DOCTRINE / CALQUE_FINGERPRINTS / LOCALE_SHEETS /
 * red lines / calibration examples — i.e. anything that would make previously generated
 * text wrong.
 *
 * Do not bump this by hand in two places: `deepseek-client.ts` derives its cache key from
 * this constant, so a single edit here retires the translation cache everywhere. The old
 * design kept a separate `PROMPT_VERSION` in the client, which silently drifted from the
 * spec — the spec could be rewritten while the cache kept serving pre-change output, and
 * nobody would notice because both numbers looked plausible.
 */
export const SPEC_VERSION = 'v3-locale-spec';

export type Severity = 'error' | 'warn';

export type TermRedLine = {
  /** Matches the wrong form. Must carry the `g` flag when used by the linter. */
  pattern: RegExp;
  /** The string writers must use instead. */
  right: string;
  severity: Severity;
  /** Why it is wrong. Shown in the linter report. */
  why: string;
};

export type LocaleSheet = {
  label: string;
  /** Who is reading, and how the text should sound. */
  register: string[];
  /** Locale-specific do/avoid, most important first. */
  rules: string[];
  /** Wrong-form table, shared with the linter. */
  redLines: TermRedLine[];
  /** One real sentence: literalism in, localization out. */
  calibration?: { source: string; literal: string; localized: string; why: string };
};

/**
 * Applies to every locale. These are the rules that were actually violated in
 * shipped copy, not a general style wishlist.
 */
export const DOCTRINE: string[] = [
  'This is a localization rewrite, not a translation. Every fact, number, name and promise in the source must survive; the shape of the sentences must not.',
  'Rewrite the sentence, not the paragraph. Keep the paragraph count identical — the caller matches arrays by length and a merged or split paragraph breaks the build.',
  'Never add a fact, number, example or claim that is not in the source. If the source is vague, stay vague.',
  'Numbered and bulleted lines stay parallel in structure across the whole list; they are UI-adjacent, not prose.',
  'Locked terminology (below) is not a suggestion. Never substitute a synonym, and never mix two forms of the same term in one article.',
  'Prefer concrete verbs over nominalisations. English hides actions inside nouns ("make a decision", "perform a calculation"); most target languages do not.',
  'Reorder to the target language\'s information order rather than carrying English word order across. Splitting one long English sentence into two short ones is usually the single biggest readability gain.',
  'The target text is normally 10–30% shorter than the English for the same information. Do not pad to match length, and do not compress by dropping facts.',
  'Keep brand names, URLs, href paths and separator glyphs (→) byte-identical.',
  'Tone: clear written game-site copy for someone learning mahjong. Not slang, not marketing, not an encyclopedia.'
];

/** Shared by every locale: the failure modes seen in shipped copy. */
export const CALQUE_FINGERPRINTS: string[] = [
  'Nominalisation: "进行…操作 / 作出…决定" style frames where the source has a plain verb.',
  '"对于…而言 / 就…来说" framing that delays the subject.',
  'Passive voice used where the target language prefers an active subject.',
  'Abstract nouns ending in -ity / -ness carried across as …性 / …化.',
  'Filler transitions lifted from English essay style ("值得一提的是", "事实上", "换句话说").',
  '"makes it possible to…" carried across as "使得…成为可能".',
  'Chains of three or more possessives/attributives ("…的…的…的").',
  'Articles rendered as 一个 / 这个 before abstract nouns where the target language would drop them.'
];

export const LOCALE_SHEETS: Record<GlossaryLocale, LocaleSheet> = {
  zh: {
    label: 'Simplified Chinese',
    register: [
      '教学文体，第二人称直接对话读者（「你坐东家，摸 14 张」）。这是教学场景，不用「您」。',
      '短句优先，一句话讲一件事。英文的从句后置改成中文的条件/时间前置。',
      '可以口语，但不滑；不写营销腔（极致、赋能、打造、一站式）。'
    ],
    rules: [
      '牌 = 牌，永远不是「板块」「棋子」「方块」。',
      '摸牌 / 打出、打掉；不写「抽牌」「弃掉」「丢牌」。',
      '牌型、手牌 = 成型的牌；不写「图形」（只有指牌面图案时才用）「组合」「图案」。',
      '白板 / 红中 / 发财；不写「白龙」「红龙」「绿龙」。',
      '花色与牌名：万子、条子、筒子；面子、顺子、刻子、将牌、门清、听牌、自摸、点炮。',
      '「番」为通用计数单位（港式、国标都用番）；只有专指日本立直时才写「飜」，且同一篇内必须统一。',
      '数字用半角并与单位之间留一空格：144 张、13 张、9 筒、1-2-3 万。序数可用汉字（四组、三张）。',
      '标点用全角；破折号用 ——；不保留英文的 em dash 前后空格。',
      '引号用「」或用直角引号视上下文；避免英文直角双引号裸穿。'
    ],
    redLines: [
      { pattern: /板块/g, right: '牌', severity: 'error', why: '板块 是 tile 的硬翻译，读者会以为在讲棋盘' },
      { pattern: /白龙|白龍/g, right: '白板', severity: 'error', why: '白板才是这张箭牌的名字' },
      { pattern: /红龙|红龍/g, right: '红中', severity: 'error', why: '红中才是这张箭牌的名字' },
      { pattern: /绿龙|綠龍/g, right: '发财', severity: 'error', why: '发财才是这张箭牌的名字' },
      { pattern: /抽牌/g, right: '摸牌', severity: 'error', why: '麻将里没有「抽牌」这个动作' },
      { pattern: /弃牌|弃掉|棄牌|棄掉/g, right: '打出 / 打掉', severity: 'warn', why: '英文 discard 在中文是打出' }
    ],
    calibration: {
      source:
        'Strip away the rulesets and every turn follows the same rhythm: draw a tile, work out what it does to your shape, then let one go.',
      literal:
        '抛开规则集不谈，每一轮操作都遵循相同的节奏：抽取一块板块，判断它会对你的图形产生什么影响，之后弃掉一块板块。',
      localized: '不管玩哪套规则，一个回合的动作都是固定的：摸一张牌，看它能把手牌变成什么样，再打掉一张。',
      why: '板块/图形/抽牌 三个硬译 + 进行…操作 的名词化 + 英文从句顺序全部照搬'
    }
  },
  'zh-TW': {
    label: 'Traditional Chinese (Taiwan)',
    register: [
      '與 zh 同一種教學語氣，但用台灣麻將的詞，不是簡體版的字形轉換。',
      '台灣讀者熟悉「將牌」「聽牌」「門清」「暗槓」「碰碰胡」，這些優先於大陸用詞。',
      '句子可以更短；台灣書面語容許「其實」「反正」這類口語連接詞，但不濫用。'
    ],
    rules: [
      '牌永遠不是「板塊」「方塊」。',
      '摸牌 / 打出、打掉；不寫「抽牌」「棄掉」。',
      '牌型、手牌；不寫「圖形」（只有指牌面圖案時才用）。',
      '白板 / 紅中 / 發財；不寫「白龍」「紅龍」「綠龍」。',
      '花色用萬子、索子、筒子（竹子花色在台灣叫索子，不叫條子）。',
      '面子、順子、刻子、將牌、門清、聽牌、自摸、暗槓、明槓、碰碰胡、七對子、斷么九。',
      '「番」為通用計數單位；講台灣麻將自身的台數時才寫「台」。專指日本立直可寫「飜」。',
      '數字用半角並與單位留一空格：144 張、13 張、9 筒。',
      '標點用全角，引號用「」；台灣正體字形（裡、牆、麼、為、隻）。'
    ],
    redLines: [
      { pattern: /板塊/g, right: '牌', severity: 'error', why: '板塊 是 tile 的硬翻譯' },
      { pattern: /白龍/g, right: '白板', severity: 'error', why: '白板才是這張箭牌的名字' },
      { pattern: /紅龍/g, right: '紅中', severity: 'error', why: '紅中才是這張箭牌的名字' },
      { pattern: /綠龍|綠龍/g, right: '發財', severity: 'error', why: '發財才是這張箭牌的名字' },
      { pattern: /抽牌/g, right: '摸牌', severity: 'error', why: '麻將裡沒有「抽牌」這個動作' },
      { pattern: /棄掉/g, right: '打出', severity: 'warn', why: '英文 discard 的動詞是打出；名詞用「打出的牌」或「牌河」' }
    ],
    calibration: {
      source:
        'Strip away the rulesets and every turn follows the same rhythm: draw a tile, work out what it does to your shape, then let one go.',
      literal:
        '拋開規則集不談，每一輪操作都遵循相同的節奏：抽取一塊板塊，判斷它會對你的圖形產生什麼影響，之後棄掉一塊板塊。',
      localized: '不管玩哪一套規則，一個回合的動作都固定不變：摸一張牌，看它能把手牌變成什麼樣子，再打掉一張。',
      why: '同 zh；另外「規則集」在台灣口語是「規則」或「玩法」'
    }
  },
  ja: {
    label: 'Japanese',
    register: [
      'です・ます調を基本にする。問いかけは「〜です」「〜でしょう」で短く。',
      '主語を明示しすぎない。「あなた」は原則使わない。',
      '一文一義。英語の関係節は日本語では前に置くか、文を分ける。'
    ],
    rules: [
      '牌は「牌（はい）」。タイルと呼ぶのはソリティアなどコンピュータ上の牌だけ。',
      '色は萬子・筒子・索子、字牌は風牌と三元牌。',
      'ポン・チー・カンはカタカナ、それ以外の用語は漢字（面子・順子・刻子・対子・テンパイ・ツモ・ロン）。',
      '数値は半角（144 枚、13 枚）。助数詞は枚。',
      '句読点は全角。中黒・かっこの使い方を日本語の慣例に合わせる。'
    ],
    redLines: [
      { pattern: /タイルを引く/g, right: '牌を引く / ツモる', severity: 'error', why: '牌的動作語はツモ・引く' }
    ]
  },
  ko: {
    label: 'Korean',
    register: [
      '합니다체를 기본으로 하고, 설명이 길어지는 곳은 해요체로 풀어 쓴다.',
      '「당신」은 쓰지 않는다. 주어가 필요하면 「플레이어」로 지칭한다.',
      '영어의 관계절은 앞으로 옮기거나 문장을 나눈다.'
    ],
    rules: [
      '패(牌)를 기본으로 하고, 마작패·손패·버림패처럼 합성어로 쓴다.',
      '용어는 data/glossary.ts 와 messages/*.json 의 기존 표기를 따른다. 새 표기를 만들지 않는다.',
      '숫자는 반각(144장, 13장). 단위는 붙여 쓴다.',
      '문장부호는 한국어 관례를 따른다. 영어 대시(—)는 그대로 쓰지 않는다.'
    ],
    redLines: []
  },
  es: {
    label: 'Spanish (neutral LatAm, tuteo)',
    register: [
      'Neutral Spanish with tuteo ("tú"), understandable in both LatAm and Spain.',
      'Avoid Spain-only colloquialisms (coger, ordenador) and LatAm-only slang. Prefer neutral nouns: computadora/ordenador → "el ordenador" is Spain-only, so say "tu navegador" or "el dispositivo".',
      'Sentences are usually longer than English in Spanish by clause count; split an English sentence with two ideas into two.',
      'Personal "a", subjunctive after "cuando" for future events: use them — omitting them reads as translated English.'
    ],
    rules: [
      'Tiles: "ficha" consistently; never mix "ficha" and "baldosa" in one article.',
      'Palos: caracteres (wan), bambú (tiao), círculos (tong). Honores: vientos y dragones.',
      'Numbers: thousands separator ".", decimal ",". Half-width digits with a space before the unit: 144 fichas.',
      'Inverted opening punctuation (¿ ¡) is mandatory.',
      'Do not carry English capitalisation into Spanish; only proper nouns are capitalised.'
    ],
    redLines: []
  },
  fr: {
    label: 'French',
    register: [
      'Vouvoiement ("vous") — c\'est un guide, pas un réseau social.',
      'Éviter les anglicismes quand un mot français existe (télécharger, navigateur, score).',
      'Une idée par phrase. La subordination longue est typique de l\'anglais traduit.'
    ],
    rules: [
      'Tuiles : "tuile". Couleurs : caractères (wan), bambou (tiao), cercles (tong).',
      'Nombres : espace insécable fine comme séparateur de milliers (1 234) et virgule décimale.',
      'Espace insécable avant : ; ! ? et à l\'intérieur des guillemets français « ».',
      'Ne pas capitaliser les noms communs, contrairement à l\'anglais.'
    ],
    redLines: []
  },
  de: {
    label: 'German',
    register: [
      'Sie-Form durchgehend; keine Du-Form in Anleitungen.',
      'Substantive groß, aber keine Substantivketten bilden — lieber einen Nebensatz.',
      'Deutsche Wortstellung: Verb am Ende im Nebensatz. Englische Wortstellung ist der häufigste Fehler.'
    ],
    rules: [
      'Steine: "Stein" einheitlich (nicht "Kachel"). Farben: Zeichen (wan), Bambus (tiao), Kreise (tong).',
      'Zahlen: Punkt als Tausendertrennzeichen (1.234), Komma als Dezimaltrenner. Halbbreite Ziffern mit Leerzeichen vor der Einheit: 144 Steine.',
      'Zusammengesetzte Begriffe nur bilden, wenn sie im Deutschen üblich sind (Handstein, Mauer, Ablegen).',
      'Anführungszeichen: „…" — nicht das englische "…".'
    ],
    redLines: []
  },
  'pt-BR': {
    label: 'Brazilian Portuguese',
    register: [
      'Tratamento "você", registro neutro brasileiro (não europeu).',
      'Evitar construções nominais ("realizar uma ação"); usar o verbo direto.',
      'Uma ideia por frase; cortar orações relativas encadeadas do inglês.'
    ],
    rules: [
      'Peças: "peça" de forma consistente. Naipes: caracteres (wan), bambu (tiao), círculos (tong).',
      'Números: ponto como separador de milhar (1.234), vírgula decimal. Dígitos meio-fio com espaço antes da unidade: 144 peças.',
      'Ortografia brasileira: "projeto", "time", "registro"; nunca "projecto".',
      'Evitar o gerúndio em série ("está fazendo") onde o português prefere o presente simples.'
    ],
    redLines: []
  }
};

export function redLinesFor(locale: GlossaryLocale): TermRedLine[] {
  return LOCALE_SHEETS[locale].redLines;
}

function glossaryLockTable(locale: GlossaryLocale): string {
  return Object.entries(GLOSSARY)
    .map(([key, entry]) => {
      const locked = entry.i18n[locale] ?? entry.source;
      return `- ${key}: EN "${entry.source}" → ${locked}`;
    })
    .join('\n');
}

/** The translator's system prompt for one locale. */
export function buildLocalePrompt(locale: GlossaryLocale, prose = false): string {
  const sheet = LOCALE_SHEETS[locale];
  const lines = [
    `You localize Mahjong Hub content from English into ${sheet.label}.`,
    'English is the only source language. Never reverse-translate from another locale.',
    'Locked terminology — use these exact strings, never synonyms:',
    glossaryLockTable(locale),
    'Localization doctrine:',
    ...DOCTRINE.map((rule) => `- ${rule}`)
  ];

  if (prose) {
    lines.push(
      `Register and locale rules for ${sheet.label}:`,
      ...sheet.register.map((rule) => `- ${rule}`),
      'Do this when writing:',
      ...sheet.rules.map((rule) => `- ${rule}`),
      'Do not reproduce these English habits:',
      ...CALQUE_FINGERPRINTS.map((rule) => `- ${rule}`)
    );
    if (sheet.calibration) {
      const c = sheet.calibration;
      lines.push(
        'Calibration — one source sentence, first translated literally, then localized:',
        `SOURCE: "${c.source}"`,
        `LITERAL (wrong): "${c.literal}"`,
        `  Why it is wrong: ${c.why}`,
        `LOCALIZED (target): "${c.localized}"`
      );
    }
  } else {
    lines.push('Short label or UI string: keep it tight and keep it parallel with the source.');
  }

  lines.push(
    'Output ONLY the localized text. Preserve JSON structure, href paths, punctuation used as UI separators (→) and the brand name "Mahjong Hub".',
    'Tone: clear written game-site copy, not slang.'
  );

  return lines.join('\n');
}

function toMarkdown(locales: GlossaryLocale[]): string {
  const out: string[] = [
    '# 多语言本地化规范',
    '',
    '> 本文件由 `scripts/i18n/localization-spec.ts` 生成，是唯一真源。',
    '> 翻译工具（系统提示词）与中文体检（门禁）都从这里取规则，改这里即同时生效。',
    '',
    '## 一、所有语种通用准则（DOCTRINE）',
    ''
  ];
  DOCTRINE.forEach((rule, i) => out.push(`${i + 1}. ${rule}`));
  out.push('', '## 二、翻译腔指纹（CALQUE_FINGERPRINTS）', '');
  CALQUE_FINGERPRINTS.forEach((rule) => out.push(`- ${rule}`));

  for (const locale of locales) {
    const sheet = LOCALE_SHEETS[locale];
    out.push('', `## 三、${sheet.label}（\`${locale}\`）`, '', '**读者与文体**', '');
    sheet.register.forEach((rule) => out.push(`- ${rule}`));
    out.push('', '**用词与格式**', '');
    sheet.rules.forEach((rule) => out.push(`- ${rule}`));
    if (sheet.redLines.length) {
      out.push('', '**错译红线（门禁 error / 警告 warn）**', '');
      out.push('| 严重度 | 错误写法 | 必须改成 | 原因 |', '|---|---|---|---|');
      for (const line of sheet.redLines) {
        out.push(`| ${line.severity} | \`${line.pattern.source}\` | ${line.right} | ${line.why} |`);
      }
    }
    if (sheet.calibration) {
      const c = sheet.calibration;
      out.push(
        '',
        '**校准例句**',
        '',
        `- 英文原文：${c.source}`,
        `- 直译（错误）：${c.literal}`,
        `- 本地化（目标）：${c.localized}`,
        `- 问题：${c.why}`
      );
    }
  }
  out.push('');
  return out.join('\n');
}

const isMain = process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/i18n/localization-spec.ts');
if (isMain) {
  const args = process.argv.slice(2);
  const localeArg = args.includes('--locale') ? (args[args.indexOf('--locale') + 1] as GlossaryLocale) : undefined;
  const locales = (localeArg ? [localeArg] : Object.keys(LOCALE_SHEETS)) as GlossaryLocale[];
  if (args.includes('--markdown')) console.log(toMarkdown(locales));
  else if (localeArg) console.log(buildLocalePrompt(localeArg, true));
  else console.log(toMarkdown(locales));
}
