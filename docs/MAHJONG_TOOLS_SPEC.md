# 麻将工具集 · MAHJONG TOOLS · 执行规格

> **给 Cursor 执行。** 所有未经 playtest 的数值标 `[PLACEHOLDER · 验证路径]`。
> 已定决策：2026-09-18（用户拍板）
> 路由：`/tools`（Hub）＋ 每工具独立子页

---

## §0 一句话定位

**Fun hypothesis**
> 这玩法好玩的核心是「**把不会算的东西交给我，你只要会打就行**」。
> 工具不是玩法，是**承诺** —— "在你学会之前，我先帮你算对"。

**Design pillars**

| # | Pillar | 含义 |
|---|---|---|
| T1 | **新手能自己用** | 目标用户是 SEO 博客带来的新手 → 输入用**点牌面**，不用 `123m` 记法 |
| T2 | **算得对是唯一的护城河** | 竞品只做"番符→点数"换算器（**不算牌型**）→ 我们的差异化是**从牌型真算** |
| T3 | **答案带解释** | 不只要结果，要"为什么"。每题结果都链到术语表 / 教学文章 |
| T4 | **能分享的 URL** | 手牌编码进 URL → 可粘贴到论坛提问（**这是外链与自然分享的源头**） |

---

## §1 已定决策

| # | 议题 | 决定 |
|---|---|---|
| 1 | 形态 | **B：Hub ＋ 每工具独立 page** |
| 2 | 目标用户 | **新手**（进阶放 Phase 2） |
| 3 | 玩法范围 | **一期只港式**；顺序 = 国标 → 美式 → 四川 → 台湾 → 日式 |
| 4 | `/challenge` | **让给每日挑战**（知识挑战）→ 连连看需重新修改命名 |
| 5 | `tools` ns | 新建（3 个 locale） |

---

## §2 🔴 竞品调研结论（决定差异化）

调研了排名靠前的 5 个竞品，**清一色是立直麻将**：

| 竞品 | 做什么 |
|---|---|
| `mjlab.app` | 立直向听 / 听牌 / 最佳弃牌 |
| `tsumoron.com` | 立直向听 + 浮牌；**seed 编码进 URL 可分享** |
| `mahjongo.com` | 立直算番（宝牌 / 里宝 / 场风自风） |
| `riichiscore.com` | 立直听牌型教学 |

**两个关键结论**

1. **立直赛道已被占死** —— 用同一批词拼立直 = 新站打老站，赢不了。
2. **差异化机会明确** —— 竞品 FAQ 原话：
   > *"Does this calculator evaluate tile patterns directly? **No.** This tool is a scoring converter: it assumes you already counted han and fu."*

   **它们不算牌型，要用户自己数番。** 而本站 `scoreHand` 是**从牌型真算**（122 番种 × 3 玩法）。

**→ 对外文案的差异化主张（写进 §3 静态段）：**
> *"Most calculators ask you to count han and fu yourself. Ours reads your hand and tells you what it's worth."*

`[PLACEHOLDER · 待验证]` 此主张需实测确认港式算番能覆盖新手常见手牌；未覆盖的番种要在 UI 明示，⛔ **不假装支持**。

---

## §3 页面结构

```
/tools                      ← Hub（吃 "Mahjong Calculator" 上位词）
├── /tools/waits            ← "Mahjong Hand Checker"（向听 / 听牌 / 有效牌）
├── /tools/score            ← "Mahjong Score Calculator"（算番 / 算点）
└── /tools/tile-identifier  ← "Mahjong Tile Identifier"（认牌）
```

### 3.1 关键词 → 页面映射

| 关键词 | 意图 | 引擎能力（已存在） | 页面 |
|---|---|---|---|
| **Mahjong Calculator** | 最泛，**上位词** | — | **Hub**（`/tools`，`<h1>` = `Mahjong Calculator`） |
| **Mahjong Hand Checker** | 查听牌/向听 | `shanten` / `waitingTiles` / `acceptance` | `/tools/waits` |
| **Mahjong Score Calculator** | 算番/算点 | `scoreHand` + 122 番种 | `/tools/score` |
| **Mahjong Tile Identifier** | 认这张牌 | `tileName` / `tileSuit` / `tileRank` | `/tools/tile-identifier` |

🔴 **`Calculator` 是上位词，另三个是它的下级** —— 硬拆成 4 个平级页 = **内耗（cannibalization）**，4 个都做不深。故 Hub 独占上位词，子页各占具体词。

### 3.2 🔴 上线顺序与硬规则（09-18 用户拍板）

**两条规则：**

1. **Hub 必须有 ≥1 个能用的子工具才允许上线**（否则 Hub 是"列出 N 张开发中卡片"的薄内容页 —— 站点已有 3 张 Coming soon，再声明一个空 hub 是负资产）。
2. 🔴 **子工具不允许独立上线 —— 必须先有 `/tools` Hub 作为父级容器。**
   理由：没有父级的孤立工具页会**丧失内部链接权重传递**（Hub 是子页的权重入口），且用户看到"一个孤零零的计算器"无从发现其他工具。

**→ 两条规则合起来的执行顺序：**

| 步 | 动作 | 说明 |
|---|---|---|
| 1 | 开发 `/tools/waits` | 可独立开发与自测 |
| 2 | 建 `/tools` Hub（挂上 waits ＋另两个位置标 "in development"） | **Hub 与 waits 必须同批上线** |
| 3 | `/tools/tile-identifier` | 实现最简单，可快速补齐 |
| 4 | `/tools/score` | 工程最重（见 §4.2），最后做 |

⚠️ **第 2 步是关键**：`/tools/waits` 不允许单独发布。代码可以先写、可以先合并，但**上线必须与 Hub 同批**（Hub 上只挂 1 个真工具 + 2 个开发中位置，是允许的；反之 waits 无 Hub 单独上线，不允许）。

> 未上线的子页：⛔ **不建路由**、⛔ **不进 sitemap**、⛔ **不被正文链接**。

---

## §4 各工具设计

### 4.1 `/tools/waits` · Mahjong Hand Checker（第一期首选）

**面向**：新手问"我还差什么才能和"

**输入**
- **点选牌面**（主）—— 复用 `TileFace`，点一下加入手牌
- `[PLACEHOLDER]` 文本输入（备）—— `123m456p789s1112z` 记法，**标注"进阶"**，不默认显示
- 张数模式：**13 张**（看向听/听牌）或 **14 张**（比较各弃牌）

**输出**（全部已有能力）

| 输出 | 来源 |
|---|---|
| 向听数（标准 / 七对 / 国士，取最小） | `shanten()` |
| 听牌列表（哪些牌能胡） | `waitingTiles()` |
| 剩余有效牌张数 | `acceptance()` / `unseenCounts()` |
| 14 张时：每张弃牌的对比 | `rankDiscards()` |
| 是否已和牌 | `isWinningHand()` |

**UI 关键**
- 每个数字**配一句"这是什么"**（新手不懂"向听"）
- 13 张 / 14 张**必须有明确提示**（用户最容易错的地方）
- ⛔ 不做红色警示 → 用 `portal-*` 语义色

### 4.2 `/tools/score` · Mahjong Score Calculator

**面向**：新手问"我这手值多少分"

**输入**
- 手牌（点选）+ 和牌张 + 门清/副露 + 自摸/荣和

**输出**
- 命中的番种清单（`ScoreResult.patterns`）
- 总番数 / 总点数

🔴 **技术难点（必须写清，避免执行者踩坑）**：`scoreHand(input: ScoreInput)` 的入参是
```ts
interface ScoreInput {
  state: GameState;   // ← 需要完整对局状态
  seat: Seat;
  winningTile: Tile;
  selfDrawn: boolean;
}
```
它需要 `GameState`，而工具页只有"一手牌"。**`GameState` 含 `seed` 且可完全序列化重建**（`lib/mahjong/engine/state.ts:161`）→ 可行路径：用 `createGame` 造一个确定性的最小 state，再把用户手牌写入对应 seat。
`[PLACEHOLDER · 待验证]` 需实测这条路径对"仅手牌、无对局上下文"的算番是否准确（**特别是场风/自风类番种**）。**若不可行，`/tools/score` 降级为只算"手牌本身能确定的番种"，并在 UI 明示。⛔ 不假装算全。**

### 4.3 `/tools/tile-identifier` · Mahjong Tile Identifier

**面向**：新手拿着一手牌问"这张是什么"

**输入**：36 个按钮（34 种牌 + 红五）或 8 个花牌
**输出**：牌名（中/英）+ 所属花色 + 序数 + **在哪些玩法里有别名**

- 复用 `tileName()` / `tileSuit()` / `tileRank()` / `tileFace()` / `TILE_ART_*`
- 🔑 **差异化点：别名对照**。调研发现新手最大的困惑是"同一张牌有多个名字"：
  - 白板 / White Dragon / **Soap** / 零（美式）
  - 条子 / Bamboo / **Bams**（美式）/ 索子（台湾）
  - 万子 / Characters / **Craks**（美式）
- ⚠️ **必须尊重已有用词红线**：白板≠白龙、红中≠红龙、发财≠绿龙
- 链到 `learn/glossary#{tileKey}` 对应锚点

**为什么这个工具值得做**：它是**最容易被外部链接**的形态（"麻将牌大全"类内容常年被引用），且实现成本最低。

---

## §5 🔴 工具页的 SEO 陷阱（必须解决）

> **纯交互工具对爬虫是空盒子。** 若页面主体只是"输入框 + JS 算出的结果区"，爬虫抓到的是空壳，**零可索引文本**。

**所以每个工具页必须有服务端渲染的静态层**（不是可选项，是成立前提）：

| 层 | 内容 | 服务谁 |
|---|---|---|
| 工具本体 | 交互计算（客户端） | 用户 → 外链吸引力 |
| **静态说明段** | 这是什么、怎么用、**麻将有几种向听** | 🕷️ 爬虫 |
| **静态知识段** | 向听 / 听牌 / 有效牌 完整解释（取自 glossary） | 🕷️ 爬虫 + 用户 |
| **FAQ + `WebApplication` JSON-LD** | 常见问题 | 🕷️ 富结果 |
| **内链** | → glossary 锚点、→ 教学文章、→ `/challenge` | 全站权重 |

`[PLACEHOLDER · 字数门槛]` 每个工具页静态文本 **≥ 300 词**（否则视为薄内容，`noindex` 处理）。

### 内链规则

- 工具页 → `learn/glossary#{key}`（**精确锚点**，术语页已有 `id={key}`）
- 工具页 → 对应教学文章（如 `/blog/mahjong-scoring-system-explained`）
- 工具页 → `/challenge`（"想测测你懂多少？"）
- **反向**：glossary 词条 → 相关工具（可选）
- ⛔ 不手写自动术语链（`lib/article-links.ts` 的 `appendLink` **硬编码 `/blog/`**，用于工具页会链错）

### sitemap

- `/tools` × 3 locale = **+3**
- 每个**已上线**子页 × 3 = **+3**
- 未上线子页 ⛔ **不进**
- **baseline 87**；因 §3.2 规定 Hub 与 waits 必须同批上线 → **首次上线即 87 + (1 Hub + 1 子页) × 3 = 93**

| 阶段 | sitemap 总数 |
|---|---|
| 当前 | 87 |
| Hub + `waits` 同批上线 | **93** |
| + `tile-identifier` | **96** |
| + `score` | **99** |

`[PLACEHOLDER]` 按实际上线数核算；baseline 87 需在改动前用线上 sitemap 实测确认。

---

## §6 玩法路线图（用户定序）

| 阶段 | 玩法 | 说明 |
|---|---|---|
| **Phase 1** | **港式** | 一期只做这个。`Ruleset = 'hongkong'` |
| Phase 2+ | **国标** → **美式** → **四川** → **台湾** → **日式** | 按此顺序扩展 |

🔴 **重要工程事实**：`Ruleset` 联合类型**只有 3 个值**
```ts
export type Ruleset = 'hongkong' | 'riichi' | 'chinese-official';
```
**美式 / 四川 / 台湾不在此类型内**，是独立实现（`american.ts` / `regional.ts`）→ 后续扩展**不是加枚举值那么简单**，需各自适配。执行者不要假设只是加个值。

**玩法切换的 UI**：一期**不给切换器**（只有港式）。二期加切换器时，未支持玩法必须显示说明而不是空结果 —— 沿用 `CoachCapability` 已确立的 **"unsupported 就不假装支持"** 原则。

---

## §7 🔴 与 `/challenge` 的命名冲突（需处理）

**用户决定：`/challenge` 归每日挑战（知识挑战）；连连看要重新修改。**

**当前冲突状态**：
- `challenge` i18n ns 现属**连连看每日板**（`title: "Daily Challenge"` / `moreSolitaire: "More solitaire →"`）
- 其消费者 `HomeDailyChallenge.tsx` / `DailyChallengeCard.tsx` **均为死代码**，且含积分遗留 `reward: "+{n} points"`
- 而 `docs/MAHJONG_CHALLENGE_SPEC.md` 已规划 `/challenge` 为知识挑战路由

**处理（待用户/后续确认）**：

| 对象 | 动作 |
|---|---|
| `/challenge` 路由 | ✅ 归知识挑战（`MAHJONG_CHALLENGE_SPEC.md`） |
| `challenge` i18n ns | **接管重定义**为知识挑战（清连连看遗留 key） |
| 连连看每日板 | **需重新修改命名** —— 用户将另行给方向；在定之前 ⛔ **不动** |
| 两个死组件 | 待连连看方向确定后再决定删或改（⛔ 不抢先删） |

⚠️ **本规格不阻塞**：`/tools` 与 `/challenge` 无路由或 ns 冲突，可并行推进。

---

## §8 i18n

- **新建 `tools` ns** —— **3 个 locale**：`en` / `zh` / `zh-TW`（真源 `lib/locales.ts → INDEXABLE_LOCALES`）
  - ⛔ **不是 9 个**。`ja`/`ko`/`es`/`fr`/`de`/`pt-BR` 已退役（`messages/_retired/`）→ 按 9 语建文件 = **复活退役 locale**
- 工具页静态知识段也是 i18n 内容（不是纯数据）
- 未知模块的页码/术语从 `learn` ns 复用（`glossaryTitle` / `whatIs` 等）

`[PLACEHOLDER · 文案量]` 3 个工具页 × (UI 文案 + 静态说明 + 知识段 + FAQ) × 3 语 —— 预估 **~200 条**。

---

## §9 验收

**通用**
- [ ] 每个工具页 `<h1>` 描述该工具主题（一页一 h1，见 `docs/SITE_RULES.md` R3）
- [ ] 6 套主题配色跟随（`portal-*` 令牌，⛔ 零硬编码色值）
- [ ] 3 个 locale 无 `MISSING_MESSAGE`
- [ ] 移动端可用（点选牌面 44px 以上触控目标）
- [ ] ⛔ 未上线子页：无路由 / 无 sitemap / 无正文链

**SEO**
- [ ] 每页 SSR HTML 含静态说明段（≥300 词，非空盒子）
- [ ] `WebApplication` + `FAQPage` JSON-LD 存在且通过校验
- [ ] 每页 → glossary 锚点链接**可点且锚点存在**
- [ ] sitemap 数量 = 87 + 已上线页数 × 3（按 §3.2 的阶段表核对）
- [ ] 🔴 `/tools/waits` **不与 Hub 单独上线**（Hub 缺失时不得发布子页）

**功能**
- [ ] 同一手牌多次输入 → **结果完全一致**（确定性；零 `Math.random`）
- [ ] 手牌编码进 URL → 复制 → 新标签打开 → **完全一致**
- [ ] `/tools/waits`：13 张输入不出弃牌建议；14 张输入出对比
- [ ] `/tools/score`：**明示能算与不能算的番种范围**（不假装）
- [ ] `/tools/tile-identifier`：别名对照**不违反用词红线**（白板≠白龙 等）

---

## 附 · 待办与依赖

| # | 事项 | 类型 | 备注 |
|---|---|---|---|
| 1 | `tools` ns 新建 | 小 | 3 语 |
| 2 | 静态知识段文案（每页 ≥300 词 × 3 语） | 内容 | 可复用 glossary 定义扩写 |
| 3 | `/tools/score` 的 `GameState` 重建路径验证 | 🔴 技术 | **决定该工具能否成立** |
| 4 | 连连看每日板重命名 | 决策 | 用户另给方向 |
| 5 | 进阶用户功能 | Phase 2 | — |
| 6 | 玩法扩展（国标→美式→四川→台湾→日式） | Phase 2+ | 注意 `Ruleset` 类型限制 |
