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
| T2 | **算得对是唯一的护城河** | 竞品只做"番符→点数"换算器（**不算牌型**）→ 我们**从牌型真算**；且我们是**港式**，竞品全是**立直** |
| T3 | **答案带解释** | 不只要结果，要"为什么"。结果都链到术语表 / 教学文章 |
| T4 | **与引擎同源** | 工具**必须调** `lib/mahjong/` 的既有函数，⛔ 绝不重写算法（否则"游戏说 3 番、工具说 4 番"＝信任崩塌） |
| T5 | **能分享的 URL** | 手牌编码进 URL → 可粘贴到论坛提问（**这是外链与自然分享的源头**） |

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

   **它们不算牌型，要用户自己数番。** 而本站 `scoreHand` 是**从牌型真算**。

**→ 对外文案的差异化主张（写进静态段）：**
> *"Most calculators ask you to count han and fu yourself. Ours reads your hand and tells you what it's worth."*
> 中文：「别的计算器要你先数番数。我们直接读你的牌。」

**✅ 主张已验证（09-18）**：实测港式在 `values.ts` 中有 **24 个非零番种**（清单见 §4.2），覆盖大三元/清一色/七对子/混一色等新手全部常见牌型 → **"真算牌型"这个主张站得住**。

**→ 第二个差异化（比第一个更锋利）**：我们是**港式**，竞品全是**立直**。
搜 `hong kong mahjong scoring` 的人**在竞品那里找不到答案** —— 这是个**没人占的空位**。

> 主推词优先级：`hong kong mahjong` 相关 > `mahjong calculator`（泛词，竞品多）。
> ⛔ **不主推** `riichi score calculator` —— 正面撞竞品主力。

`[PLACEHOLDER · 待验证]` 需实测确认港式算番能覆盖新手常见手牌；未覆盖的番种要在 UI 明示，⛔ **不假装支持**。

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
| **Mahjong Hand Checker** | 查听牌/向听 | `shanten` / `waitingTiles` | `/tools/waits` |
| **Mahjong Score Calculator** | 算番/算点 | `scoreHand` + 122 番种 | `/tools/score` |
| **Mahjong Tile Identifier** | 认这张牌 | `tileName` / `tileSuit` / `tileRank` | `/tools/tile-identifier` |

🔴 **`Calculator` 是上位词，另三个是它的下级** —— 硬拆成 4 个平级页 = **内耗（cannibalization）**，4 个都做不深。故 Hub 独占上位词，子页各占具体词。

⚠️ **H1 与竞品不撞**：竞品（`mjlab.app` / `tsumoron.com` / 等）清一色**立直**，且自认**不算牌型**。我们做**港式 + 真算牌型**，`Mahjong Calculator` 的 `<h1>` 是安全的（详见 §2）。

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

### 4.0 共享规范（三个工具都要遵守）

#### 页面结构（自上而下，顺序不可换）

```
1. Breadcrumbs           Home / Tools / <Tool>
2. <h1>                  含目标关键词（一页一 h1，见 SITE_RULES R3）
3. <p> 一句话说明          工具干什么，≤2 行
4. 【交互区】             第一屏内可见，不需滚动
5. <h2> How to use        ≥300 词的 SSR 静态说明（爬虫主粮）
6. <h2> <知识段>           术语/规则讲解，链到 /learn/glossary
7. <h2 id="faq"> FAQ       ≥5 条，配 FAQPage JSON-LD
8. <h2> Related            Hub 内其他工具 + 相关博客
```

#### 必须的 meta（全部走 `lib/seo.ts` 的 `pageMeta`）

```ts
return pageMeta({
  locale,
  path: '/tools/waits',          // ← 必须与真实路由一致
  title,
  description,
  ogImage: site.ogImage,
  siteName: brandName(site)
});
```

🔴 **`pageMeta` 已自动带**：`canonical`（自引用）、全量 `hreflang` + `x-default`、完整 OG/Twitter card（`lib/seo.ts:85-115`）。
**不要手写 `alternates`** —— 漏写 `languages` 会静默丢掉全部 hreflang（`lib/seo.ts:68-70` 有注释警告）。

#### 必须的 JSON-LD

每个工具页至少 2 个 JSON-LD 块：

| 类型 | 内容 |
|---|---|
| `SoftwareApplication`（**不是 `WebApplication`**） | `name` / `applicationCategory: "GameApplication"` / `offers: { price: "0", priceCurrency: "USD" }` |
| `FAQPage` | 与页面可见 FAQ **逐条对应** |

> ⚠️ `WebApplication` 主要用于富结果申请且需满足更多门槛；`SoftwareApplication` 是免费在线工具的正确类型。**以 `SoftwareApplication` 为准。**

#### 静态渲染

```ts
export const dynamic = 'force-static';
```

**必须有**（参考 `app/[locale]/(public)/games/classic/page.tsx:9`、`app/[locale]/(public)/learn/glossary/page.tsx:11`）。

⚠️ **关键边界**：`force-static` 下页面**不能读 `searchParams`**。若工具要做"分享链接预填"（如 `?hand=...`），该预填**必须在客户端 `useEffect` 里读 `window.location.search`**，不能用 Next 的 `searchParams` prop —— 否则 build 报错或静默失效。

#### 客户端组件边界

- 页面 `page.tsx` 保持 **server component**（负责 meta、JSON-LD、静态文案）
- 交互部分抽成 `'use client'` 子组件（如 `components/tools/WaitsTool.tsx`）
- 牌面渲染统一用 **`components/games/TileFace.tsx`**，⛔ 不另造牌
  - `size` 支持：`'xs' | 'sm' | 'md' | 'lg' | 'table' | 'xl'`
  - 触控目标 **≥44px** → 用 `md` 及以上

---

### 4.1 `/tools/waits` · Mahjong Hand Checker（第一期首选）

**面向**：新手问"我还差什么才能和"

#### 用户流程

```
① 玩家看到 34 种牌面网格（万/筒/条/字，分 4 行）
② 点选牌面 → 加入手牌区（最多 14 张）
③ 手牌区实时显示：已选张数 / 当前向听 / 听牌结果
④ 结果区展示：
     ┌─────────────────────────────────┐
     │  听牌中！等你的是：              │
     │  [3万] [6万]      各剩 4 张 / 3 张│
     │  ────────────────────            │
     │  有效进张（改善向听）：12 种 38 张 │
     └─────────────────────────────────┘
⑤ 「清空」/「撤销上一张」按钮
```

#### 输入

- **点选牌面**（主路径，新手友好）—— 复用 `TileFace`
- `[PLACEHOLDER]` 文本输入（备）—— `123m456p789s1112z` 记法，**标注"进阶"**，默认折叠
- 张数 **3n+1**（13 / 10 / 7 / 4）—— 其余张数**给提示，不报错**

🔴 **边界细节（09-18 实现时踩到，执行者必看）**：

| 输入张数 | 行为 | 理由 |
|---|---|---|
| **14** | ⛔ **不计算** → 「现在是 14 张——拿掉一张」 | 14 = 刚摸牌还没打。`waitingTiles` 只在 **3n+1** 上有定义，对 14 张跑会答非所问 |
| **1** | ⛔ **不计算** → 提示补牌 | 1 虽是 3n+1，但单手牌算不出有意义的向听 → 判定下界设 **4** |
| 2 / 3 / 5 / 6 / 8 / 9 / 11 / 12 | 不计算，提示还差几张 | 非 3n+1 |
| 4 / 7 / 10 / 13 | ✅ 计算 | 合法的门清 / 少副露手牌 |

⚠️ **反推"还差几张"时不要用 `Math.min(candidate, 14)`** —— 14 张时会把目标算成 14（自己），出现"还差 0 张"却仍不计算的死循环。必须先判 `% 3 === 1` 再算目标值。

🔴 **一期只做门清手牌**（`meldCount = 0`）。⛔ **不做副露输入**：带副露的向听/听牌需要额外 UI 与正确性论证，放 Phase 2。

#### 引擎调用（T4：必须用这些函数）

```ts
import { shanten, waitingTiles, isWinningHand } from '@/lib/mahjong/shanten';
import { toCounts, TILE_KINDS, COPIES_PER_TILE, tileFromIndex } from '@/lib/mahjong/tiles';

const counts = toCounts(hand);              // hand: Tile[]，13 张
const dist   = shanten(counts, 0, 'hongkong');
const waits  = waitingTiles(counts, 0, 'hongkong');
```

**签名确认（已核实源码）**：
```ts
shanten(counts: number[], meldCount = 0, ruleset: Ruleset = 'hongkong'): number
waitingTiles(counts: number[], meldCount = 0, ruleset: Ruleset = 'hongkong'): Tile[]
isWinningHand(counts: number[], meldCount = 0, ruleset: Ruleset = 'hongkong'): boolean
```

**剩余张数**：
```ts
const remaining = COPIES_PER_TILE - counts[i];   // 4 - 手上张数
```

⚠️ **一期不算"已打出多少"** —— 那需要牌河输入，超出一期范围。页面上**必须明确写**：
> 「剩余张数按你的手牌计算，不含已打出的牌」

**这是诚实性要求，不能让用户误以为是全场剩余数。**

#### 输出状态机（4 态，互斥）

| 状态 | 触发 | 主文案 |
|---|---|---|
| `incomplete` | 张数不是 3n+1 | 「还需要 N 张牌才能判断」（显示已选张数） |
| `winning` | `shanten === -1` | 「这手牌已经胡了！」（罕见但必须处理） |
| `tenpai` | `shanten === 0` | 「听牌中！等你的是…」+ 听牌列表 + 各剩张数 |
| `away` | `shanten >= 1` | 「还差 **N** 张牌听牌」+ 有效进张列表 |

**`away` 态的有效进张**（差异化重点）：

```ts
function improvements(counts: number[]): { tile: Tile; next: number }[] {
  const current = shanten(counts, 0, 'hongkong');
  const out: { tile: Tile; next: number }[] = [];
  const work = [...counts];
  for (let i = 0; i < TILE_KINDS; i += 1) {
    if (work[i] >= COPIES_PER_TILE) continue;
    work[i] += 1;
    const next = shanten(work, 0, 'hongkong');
    work[i] -= 1;
    if (next < current) out.push({ tile: tileFromIndex(i), next });
  }
  return out;
}
```

> 逻辑与 `lib/mahjong/coach.ts:36` 的 `acceptance()` 同源（那里多乘了 `unseen` 权重）。
> ⚠️ **不要直接调 `acceptance()` / `unseenCounts()` / `rankDiscards()`** —— 它们都要求 `GameState`，工具页没有对局。
> ⚠️ **一期不做 14 张弃牌对比**（原 §4.1 的 `rankDiscards()` 输出**已取消**）—— 理由同上：`rankDiscards` 依赖 `GameState`。弃牌对比是 Phase 2 的事。

#### 性能边界

- `shanten` 自带 5000 条 memo 缓存（`shanten.ts:48`）→ **不要自己再包一层缓存**
- 14 张输入时全量扫描 34 种牌 = 34 次 `shanten`，**应在一帧内完成**
- ⚠️ **不要凭感觉加 `useMemo`** —— 直接算；若确实卡，先测再加

#### UI 关键
- 每个数字**配一句"这是什么"**（新手不懂"向听"）
- ⛔ 不做红色警示 → 用 `portal-*` 语义色
- ⛔ 零硬编码色值（6 套主题必须跟随）

#### 分享链接（一期可选，落地简单）

```
/tools/waits?hand=m1m1m2m3p4p5p6s7s8s9z1z1
```
- 编码：拼接式 tile id 字符串（引擎原生格式，`tiles.ts:21`）
- **客户端读**（`force-static` 禁止 `searchParams`，见 §4.0）
- 读取后**必须校验**：非法字符 / 超 14 张 → **忽略并留空，不报错**
- ⚠️ 分享链接页 **不设 `noindex`** —— 它是工具正常路径，不是 `/challenge` 那种一次性参数

---

### 4.2 `/tools/score` · Mahjong Score Calculator

**面向**：新手问"我这手值多少分"

⚠️ **三个工具里工程最重**，排在最后做（见 §3.2）。下面把难点写透。

#### 🔴 核心技术难点：`scoreHand` 需要完整 `GameState`

`ScoreInput` 的真实定义（`lib/mahjong/scoring/types.ts:28`）：

```ts
export interface ScoreInput {
  state: GameState;      // ← 需要完整对局状态
  seat: Seat;
  winningTile: Tile;
  selfDrawn: boolean;
}
```

而 `scoreHand` 实际读的 `state` 字段（**已逐行核实**）：

| 字段 | 用途 | `score-hand.ts` 行号 |
|---|---|---|
| `state.ruleset` | 决定番种取值 | `:66` |
| `state.players[seat].hand` | 手牌 | `:67` |
| `state.players[seat].melds` | 副露（含 `concealed` 标记） | `:73`、`:76` |
| `state.players[seat].seatWind` | **门风番** | `:253`、`:422` |
| `state.roundWind` | **圈风番** | `:256`、`:423` |
| `state.wallIndex` / `state.deadWallIndex` | 海底 / 河底判定 | `:318`、`:337`、`:346` |
| `state.players[seat].lastDrawWasReplacement` | 杠上开花 | `:331`、`:334` |
| `state.players[seat].doubleReady` 等 | 立直类番种 | `:98` |

#### → 重建路径：`createGame` 造最小 state

```ts
import { createGame, type Meld } from '@/lib/mahjong/engine';
import { sortTiles } from '@/lib/mahjong/tiles';

const state = createGame({
  ruleset: 'hongkong',
  hongKongMode: 'standard',   // ← 'standard' = 3 番起胡；'casual' = 鸡胡可胡
  seed: 1
});
state.players[0].hand = sortTiles(userHand);   // 覆盖发牌结果
state.players[0].melds = userMelds;            // 一期可为空数组 []
state.turn = 0;
```

**`Meld` 结构**（`engine/state.ts:83`，副露时用）：
```ts
interface Meld {
  kind: 'chi' | 'pon' | 'kan';
  tiles: Tile[];              // sorted
  from?: Seat;                // 吃/碰来源；暗杠为 undefined
  concealed?: boolean;        // 暗杠为 true
}
```

**默认值的语义**（必须在 UI 明确写出）：

| 字段 | `createGame` 默认 | UI 必须提示 |
|---|---|---|
| 门风（`seatWind`） | 东（`WINDS[0]`，`state.ts:265`） | 「按**东家**计」 |
| 圈风（`roundWind`） | 东（`state.ts:303`） | 「按**东风圈**计」 |
| 自摸 | 用户勾选 | 影响 `selfDraw` / `fullyConcealed` 等 |
| 门清 | 手牌全暗 | 影响 `concealed` 番种 |
| 牌山剩余 | **满牌山**（`wallIndex` 不触底） | 海底/河底番种**不会触发**（这是正确的：工具场景没有"最后一张"） |

🔴 **开工前必做实测**：写一个测试脚本，喂 **3–5 手已知答案的牌**走 `createGame` 路径，**确认输出番数与预期一致**。建议用例：

| 用例 | 手牌 | 预期命中的番种 |
|---|---|---|
| 1 | 三张白板 + 三张红中 + 三张发财 + 其余 | `bigThreeDragons` = 8 番 |
| 2 | 全万子，含 2 组顺子 + 1 刻子 + 对子 | `fullFlush` = 7 番 |
| 3 | 四组顺子 + 非役牌对子，门清，荣和 | `pinfu` = 0（港式 base 0）⚠️ **注意港式无平和** |
| 4 | 七对子，门清 | `sevenPairs` = 4 番 |

> ⚠️ **用例 3 的教训**：港式规则下 `pinfu` 的 `value('pinfu','hongkong')` = `base: 0`（`values.ts:32`）→ **港式不算平和**。写用例时**必须按 `values.ts` 的港式取值表校验预期值**，不要照搬日式直觉。

**若实测不通过**（尤其场风/圈风类番种无法正确重建）→ **降级**：
- 页面明确标注「本计算器**不判定场风/圈风相关番种**（门风番、圈风番）」
- ⛔ **不得**算出一个错误番数然后不告知 —— **不假装算全**

> 这正是竞品自认"不算牌型"的原因 —— 他们绕开了。我们要真算，但**必须先把这条路径验通**。

#### 输入

1. 手牌（点选，3n+2 张）—— 同 `waits` 的牌面网格
2. 副露（一期可空）—— 有 `Meld` 结构可直接复用（`state.ts:83`）
3. 胡牌方式：自摸 / 荣和（单选，对应 `selfDrawn`）
4. 胡的那张牌（从手牌里点一张标为 `winningTile`）
5. 高级选项（默认折叠）：门风 / 圈风 / 杠上开花

#### 🔑 港式实际只有 24 个非零番种（别按"122 番种"做工作量估算）

⚠️ 站点常说"`scoring/` 122 番种 ×3 玩法"，但那是**三种玩法的并集**。**一期只做港式**，实测 `values.ts` 中港式取值 ≠ 0 的番种**只有 24 个**：

| 番数 | 番种（`pattern.id`） |
|---|---|
| **10** | `smallFourWinds` · `bigFourWinds` · `allTerminals` · `allHonours` · `fourConcealedTriplets` · `thirteenOrphans` |
| **8** | `bigThreeDragons` |
| **7** | `fullFlush` |
| **5** | `littleThreeDragons` |
| **4** | `sevenPairs` |
| **3** | `allTriplets` · `halfFlush` |
| **1** | `chickenHand` · `selfDraw` · `replacementWin` · `lastTileWin` · `robbingKong` · `concealed` · `allSimples` · `allSequences` · `dragonTriplet` · `seatWind` · `roundWind` · `allTerminalsHonours` |

🔑 **这是好消息**：
- 翻译工作量从「~100 个 id」降到 **24 条**（3 语 = 72 条文案）
- 起胡底线 **3 番** 意味着：1 番/2 番的手牌**根本不能胡** → UI 要能说清"你只有 2 番，还差 1 番"

⚠️ **港式无平和（Pinfu）**：`pinfu` 在 `values.ts:32` 是 `base: 0` → 港式**不算平和**。同理 `reversibleTiles`（`base: 0`）港式也不计。写测试用例和 FAQ 时**必须按 `values.ts` 的港式列校验**，不要照搬日式直觉。

#### 输出

```
┌────────────────────────────────────────┐
│  3 番  ·  底分 8                          │
│  ────────────────────────────            │
│  ✓ 平和            Pinfu          1 番    │
│  ✓ 门前清          Fully Concealed 1 番   │
│  ✓ 断幺九          All Simples    1 番    │
│  ────────────────────────────            │
│  ⓘ 东家东风，门风/圈风未计番              │
└────────────────────────────────────────┘
```

**渲染 `ScoreResult.patterns`**（`ScorePattern[]`：`id` / `label` / `value`）：

🔴 **`label` 是英文硬编码**（`score-hand.ts` 里 `push('pinfu', 'Pinfu')`）→ **不能直接显示给中文用户**。

处理方式：
- 用 `pattern.id` 去 `tools` ns 查本地化标签
- **兜底**：查不到就用英文 `p.label`（用 `next-intl` 的 `t.has()` 或 try/catch）
- 📋 **待办**：港式只需 **24 条** 翻译（见上表），3 语共 **72 条** —— **这是小工作量，不再是"运营瓶颈"**

> ⚠️ 若 Phase 2 扩展到国标（MCR），MCR 在 `values.ts` 里有约 70 个非零番种 → 那时才是真正的内容工作量。

#### 边界（必须处理）

| 情况 | 行为 |
|---|---|
| 手牌没胡（`shanten !== -1`） | 「这手牌还不能胡」+ 引导去 `/tools/waits` |
| 番数低于起胡底线 | `minimumWinScore()`（港式 standard = **3 番**，`state.ts:228`）→ 「不够 3 番，不能胡」 |
| 张数非法 | 不计算，给张数提示 |
| `scoreHand` 抛异常 | **捕获** → 「暂时算不出这手牌」+ ⛔ 不显示任何数字 |

---

### 4.3 `/tools/tile-identifier` · Mahjong Tile Identifier

**面向**：新手拿着一手牌问"这张是什么"

⚠️ 按 §3.2 顺序排第 3（实现最简单，但必须等 waits + Hub 上线之后）。

#### 输入 / 输出

**输入**：34 张牌面网格（点选**即出结果**，无需提交按钮）

**输出**（一次点击全展示）：
```
        [牌面大图]
        ─────────────
  名称     Three of Bamboo
  别名     Bams / 3 Sou / 三条
  花色     Bamboo（条子）
  点数     3
  类型     数牌（非么九）
  ─────────────
  · 与 1、2、4、5 条组成顺子
  · 集齐三张同牌 → 刻子（Pong）
  · 集齐四张 → 杠（Kong）
  · 清一色只需这一种花色
```

#### 引擎调用

```ts
import {
  tileName, tileFace, tileSuit, tileRank, isRedFive,
  isHonour, isTerminal, isTerminalOrHonour
} from '@/lib/mahjong/tiles';

tileName('s3')       // → "3 of Bamboo"    （tiles.ts:259）
tileSuit('s3')       // → 's'              （tiles.ts:71）
tileRank('s3')       // → 3                （tiles.ts:75）
isTerminal('s3')     // → false            （tiles.ts:107）
isHonour('z5')       // → true             （tiles.ts:94）
```

**牌面渲染**：直接 `<TileFace tile="s3" size="xl" />`。

⛔ **一期只做 34 种牌**（不含红五 / 花牌）。红五与花牌是立直/MCR 概念，与"新手认牌"目标无关。

#### 🔑 别名对照表（新手痛点，本站差异点）

新建数据文件 **`data/tools/tile-aliases.ts`**：

| 类别 | 别名 |
|---|---|
| Characters / 万子 | **Cracks / Craks** / 萬 / Man |
| Bamboo / 条子 | **Bams** / Sou / 索子 |
| Dots / 筒子 | **Circles** / Pins / 饼 |
| White Dragon / 白板 | **Soap / Po** / 白 |
| Red Dragon / 红中 | **Chung / Red** / 中 |
| Green Dragon / 发财 | **Hatsu / Green** / 發 |
| Winds | East / South / West / North = 東南西北 |

⚠️ **用词红线**（`docs/I18N_MASTER_SPEC.md`）：
- 白板/红中/发财 **≠** 白/红/绿龙
- **可以**列 `Soap / Po`（这是**美式玩家真实叫法**），但 ⛔ **不得把它写成「白龙」**
- `bamboo` 的 zh 译 = **条子**，zh-TW 译 = **索子**

- 每张牌链到 `learn/glossary#{tileKey}` 对应锚点（锚点已存在，`glossary/page.tsx:85` 的 `id={key}`）

#### 这一页的 SEO 价值（被低估）

`Mahjong Tile Identifier` 是**真需求**：新手看到牌不认识就来搜。

🔑 **每张牌一个锚点** `#s3` → 34 个可分享锚点，**且天然是长尾词**（`what is the 3 of bamboo`）。

🔴 **必须做**：34 张牌**全部 SSR 渲染**在同一页（不只渲染交互区）→ 爬虫抓到的是一页完整的"麻将牌全图解"。**这是本页最大的 SEO 资产。**

**为什么这个工具值得做**：它是**最容易被外部链接**的形态（"麻将牌大全"类内容常年被引用），且实现成本最低。

---

## §5 🔴 工具页的 SEO 陷阱（必须解决）

> **纯交互工具对爬虫是空盒子。** 若页面主体只是"输入框 + JS 算出的结果区"，爬虫抓到的是空壳，**零可索引文本**。

**对比**：

| | 只有交互区 | 必须有 |
|---|---|---|
| 正文词数 | ~30（按钮文字） | **≥300 词** |
| 可索引内容 | 无 | 说明段 + 知识段 + FAQ |
| 结构化数据 | 无 | 2 个 JSON-LD |
| 内链入 | 无 | Hub 链入 + 正文链出 |

**→ 结论：SSR 静态层是前提，不是可选。**

### 每个工具页的静态层清单

- [ ] `<h2>How to use` ≥300 词，**目标关键词自然出现**（如 `mahjong hand checker`）
- [ ] `<h2>` 知识段：讲向听 / 听牌 / 有效牌概念，术语链到 `/learn/glossary`
- [ ] `<h2 id="faq">` FAQ ≥5 条 + `FAQPage` JSON-LD
- [ ] `SoftwareApplication` JSON-LD
- [ ] 内链到 **Hub** + **至少 1 篇相关博客**
- [ ] ⛔ FAQ **不得**用 `display:none` 藏内容（会被判作弊）
- [ ] ⛔ 静态段**不得**是交互区的复述（要讲概念，不是讲操作）

### 内链规则

| 从 | 到 | 形式 |
|---|---|---|
| `/tools` Hub | 每个子工具 | 卡片 |
| 每个子工具 | `/tools` | Breadcrumb + 页脚「All tools」 |
| 每个子工具 | 相邻工具 | 「Related」段 |
| 子工具 → glossary | `/learn/glossary#{key}` | **精确锚点**，锚点已存在（`glossary/page.tsx:85` 的 `id={key}`） |
| 子工具 → 博客 | `/blog/<slug>` | 相关教学文章 |
| 子工具 → 挑战 | `/challenge` | 「想测测你懂多少？」 |
| `/tools/waits` → `/tools/score` | 前置引导 | 「知道听什么了？算算几番」 |
| glossary 词条 → 工具 | 可选（反向） | — |

⛔ **不手写自动术语链**：`lib/article-links.ts` 的 `appendLink` **硬编码 `/blog/`**，用于工具页会链错。
✅ 工具页若要用术语链，用 **`lib/glossary-autolink.ts`** 的 `glossaryLabels(locale)` + `autolinkParagraph()` —— 它链到 `/learn/glossary#<key>`，正是我们要的目标（`glossary-autolink.ts:82`）。

### sitemap（`app/sitemap.ts`）

现有结构：静态路由在 `:45-90` 区间循环 `INDEXABLE_LOCALES` 生成（参考 `:53` 的 games hub 写法）。**加工具页 = 在静态段加一处循环**：

```ts
// 只登记已上线的工具
const TOOL_PATHS = ['/tools', '/tools/waits'] as const;   // ← 按上线进度递增
for (const toolPath of TOOL_PATHS) {
  entries.push({
    url: `${BASE}/${locale}${toolPath}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: toolPath === '/tools' ? 0.75 : 0.7,
    alternates: { languages: alternatesFor(toolPath) }
  });
}
```

**计数**：

- `/tools` × 3 locale = **+3**
- 每个**已上线**子页 × 3 = **+3**
- 未上线子页 ⛔ **不进**
- ✅ **baseline 已实测（09-18）**：线上 `sitemap.xml` = **96 条**（32 路径 × 3 语），**不含 tools**
  > ⚠️ 旧稿写的 87 是**过时值** —— 站点在 09-18 扩到 Blog 20 篇后已增至 96。
  > 🔑 **核对方法**：`curl -s https://mahjonggame.org/sitemap.xml | grep -c "<loc>"`

| 阶段 | sitemap 总数 |
|---|---|
| 当前（实测） | **96** |
| Hub + `waits` 同批上线 | **102** |
| + `tile-identifier` | **105** |
| + `score` | **108** |

### 导航接入（✅ 09-18 用户拍板 = 方案 B）

⚠️ **先纠正一个易错前提**：导航**不是 4 组，是 3 项**。
`components/Header.tsx:30-34` 的 `links` 数组实测只有：

```ts
const links = [
  { href: '/games/classic',   label: tn('classic') },     // 人机对战 / Play vs AI
  { href: '/games/solitaire', label: tn('solitaire') },   // 更多麻将休闲游戏 / More Mahjong Games
  { href: '/blog',            label: tn('beginners') }    // 学习 / Learn
];
```

⚠️ `nav.set`（Shop）**存在于 i18n 但不在导航里** —— 不要因为它有 key 就以为导航有 4 项。

**→ 用户拍板：新增 `tools` 为第 4 项**（方案 B），插在 `solitaire` 与 `beginners` 之间：

```ts
const links = [
  { href: '/games/classic',   label: tn('classic') },
  { href: '/games/solitaire', label: tn('solitaire') },
  { href: '/tools',           label: tn('tools') },      // ← 新增
  { href: '/blog',            label: tn('beginners') }
];
```

**位置理由**：`classic`（打牌）→ `solitaire`（休闲）→ **`tools`（工具）** → `beginners`（学习）。
工具是「打牌遇到问题时的即时求助」，放在休闲与学习之间，符合**从玩到查再到学**的路径。

**i18n 已同步**（3 语，`nav` ns）：

| locale | `tools` | `toolsSubtitle` |
|---|---|---|
| `en` | Tools | Free mahjong calculators — check your hand, count your score and identify any tile. |
| `zh` | 工具 | 免费麻将计算器——查听牌、算番数、认牌面。 |
| `zh-TW` | 工具 | 免費麻將計算器——查聽牌、算番數、認牌面。 |

✅ `scripts/i18n-check.ts` 实测：**0 error**，三语 `nav` 键数均为 23、完全对齐。

⚠️ **导航链接与路由必须同批**：`/tools` 路由**当前尚不存在**（已实测：`app/[locale]/(public)/tools/` 无此目录）。
🔴 **导航改动必须与 §3.2 的第 2 步（Hub + waits 同批上线）一起发布** ——
⛔ **不允许**先加导航项、后建页面 → 否则用户点击导航得到 404。

**当前风险状态（✅ 09-18 已解除）**：

| 项 | 状态 |
|---|---|
| `Header.tsx` 已加 `/tools` 链接 | ✅ **已落地** |
| `messages/*.json` 3 语 `nav.tools` | ✅ **已落地** |
| `app/[locale]/(public)/tools/page.tsx`（Hub） | ✅ **已建** |
| `app/[locale]/(public)/tools/waits/page.tsx` | ✅ **已建** |
| `components/tools/WaitsTool.tsx` | ✅ **已建** |
| `app/sitemap.ts` 加 `/tools` + `/tools/waits` | ✅ **已落地**（96 → 102） |

🔑 **→ 导航与页面已同批**：`next build` 实测三语各生成 `tools.html` + `tools/waits.html`，
导航 `<a href="/en/tools">` 与页面同时存在 → ⛔ **不再有 404 窗口**。
⚠️ 但仍受 §3.2 约束：**Hub 与 waits 必须同时上线**，不可只发其中一个。

⚠️ 站点已有 `app/[locale]/not-found.tsx` 兜底页 → 最坏情况是**友好的 404**，不是白屏。但仍属**不该出现的用户体验事故**。

**移动端**：`Header.tsx:126` 的移动菜单直接复用同一个 `links` 数组 → **无需额外改动**，自动同步。

---

### 🔴 改动清单（本次导航接入所动文件）

| 文件 | 改动 |
|---|---|
| `components/Header.tsx` | `links` 数组插入 `{ href: '/tools', label: tn('tools') }`（桌面 + 移动共用） |
| `messages/en.json` | `nav` ns 加 `tools` / `toolsSubtitle` |
| `messages/zh.json` | 同上 |
| `messages/zh-TW.json` | 同上 |

⛔ **不要动**：`nav.set`（Shop 未接入导航，保持现状）。

⚠️ **发布顺序**：本改动**必须与 `/tools` + `/tools/waits` 同一批发布**（见 §3.2）。

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

**Hub + waits（同批上线）**
- [ ] 🔴 `/tools` 与 `/tools/waits` **同批上线**
- [ ] 🔴 `/tools/waits` **不与 Hub 单独上线**
- [ ] `/tools` 上只挂 1 个真可用工具 + 2 个 "in development" 位置
- [ ] 导航含 `/tools` 项（第 3 位，`solitaire` 与 `beginners` 之间）—— ✅ **代码已落地**（见 §5）
- [ ] 🔴 导航 `/tools` 与页面**同批上线**，⛔ 不存在"导航有项但页面 404"的窗口
- [ ] 两页各 `export const dynamic = 'force-static'`
- [ ] 两页各用 `pageMeta`（带 canonical + 全量 hreflang）
- [ ] `curl -s https://mahjonggame.org/en/tools/waits | grep -o '<h1[^>]*>[^<]*'` **有输出**

**waits 功能**
- [ ] 张数 3n+1 才计算；其余给提示**不报错**
- [ ] 4 态（`incomplete` / `winning` / `tenpai` / `away`）全部可达且互斥
- [ ] 调 `shanten()` / `waitingTiles()`，⛔ **未重写算法**
- [ ] 「剩余张数」旁有**免责说明**
- [ ] 分享链接非法输入**不报错**

**通用**
- [ ] 每个工具页 `<h1>` 描述该工具主题（一页一 h1，见 `docs/SITE_RULES.md` R3）
- [ ] 6 套主题配色跟随（`portal-*` 令牌，⛔ 零硬编码色值）
- [ ] 3 个 locale 无 `MISSING_MESSAGE`
- [ ] 移动端可用（点选牌面 **≥44px** 触控目标）
- [ ] ⛔ 未上线子页：无路由 / 无 sitemap / 无正文链

**SEO**
- [ ] 每页 SSR HTML 含静态说明段（**≥300 词**，非空盒子）
- [ ] `SoftwareApplication` + `FAQPage` JSON-LD 存在且通过校验
- [ ] 每页 → glossary 锚点链接**可点且锚点存在**
- [ ] sitemap 数量 = 87 + 已上线页数 × 3（按 §5 阶段表核对）

**功能 / 确定性**
- [ ] 同一手牌多次输入 → **结果完全一致**（零 `Math.random`）
- [ ] 手牌编码进 URL → 复制 → 新标签打开 → **完全一致**

**score（第 4 步）**
- [ ] 🔴 **`createGame` 重建路径已实测**（≥3 手已知答案的牌型）
- [ ] 未通过则**降级 + UI 明示**，⛔ 不得静默给错误番数
- [ ] 番种明细用 `pattern.id` 查 `tools` ns，查不到回退英文
- [ ] 未胡 / 不够起胡番 / 异常，三种边界都有文案

**tile-identifier（第 3 步）**
- [ ] 34 张牌**全部 SSR 渲染**（爬虫可抓全图解）
- [ ] 每张牌有锚点 `#<tileId>`
- [ ] 别名表落地 `data/tools/tile-aliases.ts`
- [ ] ⛔ 别名不违反用词红线（`Soap` 可列，但不得写成「白龙」）

**门禁**
- [ ] `npm run gate` 通过
- [ ] `npm run gate:i18n` 通过（改了文案）
- [ ] `tools` ns 只有 `en` / `zh` / `zh-TW` **三份**
- [ ] ⛔ 未触碰 `challenge` ns 与连连看相关代码

---

## 附 · 待办与依赖

| # | 事项 | 类型 | 备注 |
|---|---|---|---|
| 1 | `tools` ns 新建 | 小 | **3 语**（非 9 语） |
| 2 | 静态知识段文案（每页 ≥300 词 × 3 语） | 内容 | 可复用 glossary 定义扩写 |
| 3 | 🔴 `/tools/score` 的 `createGame` 重建路径**实测** | 技术 | **决定该工具能否成立，开工前必做** |
| 4 | 港式 **24 个** `pattern.id` 的 3 语翻译 | 内容 | 已实测确认共 24 条 × 3 语 = 72 |
| 5 | ~~导航入口方案 A / B 选择~~ | ✅ **已定** | **方案 B 已落地**：`Header.tsx` 加 `/tools`，3 语 `nav.tools` 已补（§5） |
| 6 | `data/tools/tile-aliases.ts` 别名表内容 | 内容 | 34 牌 × 别名 |
| 7 | baseline sitemap 87 的线上实测 | 技术 | 改动前确认 |
| 8 | 连连看每日板重命名 | 决策 | 用户另给方向，⛔ 现在不动 |
| 9 | 带副露的向听/听牌（waits Phase 2） | Phase 2 | 一期只做门清 |
| 10 | 玩法扩展（国标→美式→四川→台湾→日式） | Phase 2+ | 注意 `Ruleset` 类型限制 |
