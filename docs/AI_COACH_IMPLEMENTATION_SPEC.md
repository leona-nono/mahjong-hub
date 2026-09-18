# AI 教练系统 · 实施总纲（Cursor 执行规格）

> **文件用途**：本文件是 AI 教练（含每日一题、算番工具、教练席演出层、结算复盘）**唯一的实施事实源**。
> 执行者（Cursor / 协作者）**只需读本文件**，无需翻阅其它设计文档。
> **仓库**：`D:\mahjonggamebox\mahjong-hub\mahjong-hub`
> **生成日期**：2026-09-16
> **最近修订**：2026-09-16（积分 → 成就重构；详见下方修订块）
> **上游设计文档**（仅追溯用，不必读）：见 §10
> **角色定位**：游戏设计 / 产品设计交付物。本文件不 commit、不 push，由执行者落地。

> ## 实施切片 · Phase E（2026-09-18）
>
> 港麻 MVP 已按 E1→E2→E3 落地：`ScoreResult` 扩展、`CoachReview` / `buildCoachReview`、`CoachReviewPanel`、ResultBanner 入口（silent 桌面静态链）、高频 Evidence + 三套 formula。立直/国标 B 层标 partial；美式/川台未接 Panel。不依赖 Phase D 立绘席。

---

> ## 🔴 修订块 · v2（2026-09-16）：积分 → 成就重构
>
> **本文件的 Phase F 与前版有结构性变化。** 若你读的是旧版（Phase F 标注"阻塞：等 sink 扩容"），**以本版为准**。
>
> **核心决策**：**删掉积分的「货币属性」，保留它的「行为记录属性」。**
>
> | 前版 | 本版 |
> |---|---|
> | 成就发放积分（Gold 100 / Platinum 300，共 1,600） | 成就发放**皮肤**（现有 5 件 premium / limited） |
> | 需要先扩积分 sink（§F1.8 三条优先级） | **不需要 sink** —— 没有货币即没有通胀 |
> | 碎片通道是成就的候选出口 | **碎片通道整条删除** |
> | `PointTransaction`（货币账本） | `ActionLog`（行为日志，`@@map` 旧表名，零迁移风险） |
> | `UserPoint` 缓存表 | **删除**（并发覆盖源头消失） |
> | 道具用 `ITEM_PRICE` 购买 | **每日免费额度**（复用 `SolitaireDaily` 加 4 列计数） |
>
> **三条设计支柱**（后续每个决策用它过审）：
> 1. **P1 · 零新增美术** —— 本次重构不允许新增任何图片/SVG/sprite
> 2. **P2 · 无货币即无通胀** —— 不引入任何需要 sink 治理的累积量
> 3. **P3 · 紧扣 free-play 定位** —— 任何机制不得让玩家卡在付费/登录墙
>
> ### 本版对前版的修订清单
>
> | 本文件位置 | 处置 |
> |---|---|
> | §0.1 执行顺序 | Phase F 去掉"阻塞"标注 |
> | §2 红线 4 | 措辞改为"行为记录与成就判定" |
> | §2 红线 10 | 从"三语齐"改为"**全部 locale 齐**"（⚠️ **v3 已更正**：仓库实为 **3 个** locale，v2 此处写的"9 语"是错的，见 v3 块） |
> | §4.2 `RankedOption` | **扩 `distance` + `metric` 字段**（见 §4.4 修订块） |
> | §4.4 `american.ts` | **4 处字段映射修正**（详见 doc 内修订块） |
> | §4.4 `hongkong.ts` / `regional.ts` | 无变化 |
> | §5 Phase F 标题 | 去掉"阻塞，等 sink 扩容" |
> | §F1.1 / §F1.3 / §F1.4 / §F1.8 | **整节重写或删除**（见 F1 内文） |
> | §F1.2 `LearningStat` DDL | **删 streak 三字段**（职责统一到 `SolitaireStreak`） |
> | §8 P-2 | **整条删除** |
> | §8 P-4 / P-6 / P-7 | 改为"已实证，见对应修订块" |
> | §9 风险 2 | **整条删除**（通胀风险消失） |
> | §9 风险 14 | 对策由"补偿封顶 1.15"改为"改 `lg` 尺寸" |
> | §10 交付物索引 | 新增执行规格文件 |
> | §附 Phase 依赖总表 | `Phase F ←── 无阻塞` |
>
> **执行规格**（Phase A–D 共 17 个工作包，含 schema / 多语文案 / 验收脚本）：
> 工作区 `积分转成就系统_重构方案_给Cursor_2026-09-16.md`（**Phase A–D 以那份为准**；本文件负责 Phase A–G 的教练侧内容）。

---

## 0. 怎么用这份文档

### 0.1 执行顺序

**不要按编号顺序做，要按 Phase 顺序做。** Phase 之间有硬依赖：

```
Phase A  止血 + 地基      ← 必须先做，后面积木都建在 A2 的契约上
   ↓
Phase B  教练会说话（局中）  ← 用户感知最强的改动，一周内可见
   ↓
Phase C  每日一题 + 外链工具  ← SEO 收益最大的改动
   ↓
Phase D  第五角色（位置 + 演出）← 需要美术资产，可并行准备
   ↓
Phase E  结算复盘
   ↓
Phase F  成就（无阻塞 —— 成就发皮肤，不发积分）
   ↓
Phase G  玩法能力补齐（P1/P2）
```

每个工作包（WP）都是一个**可独立提交、可独立回滚**的单位。

### 0.2 每个 WP 的读法

| 字段 | 含义 |
|---|---|
| **目标** | 做完后玩家/系统获得什么 |
| **依赖** | 必须在它之前完成的 WP |
| **文件** | 改哪些文件、新建哪些文件 |
| **锚点** | **搜索用的字符串/函数名**（⚠️ 行号会漂移，一律以锚点定位） |
| **实施** | 代码或步骤 |
| **验收** | 完成判据（不能通过的，不算完成） |
| **commit** | 建议的提交拆分 |
| **回滚** | 出问题怎么退 |

### 0.3 术语表

| 术语 | 含义 |
|---|---|
| **教练 / `Sen`** | 站点的 AI 陪练人格。**不是第 4 个竞争对手**，是站在桌外右边的第 5 个人（产品线 `The Fourth Player` 降级为功能叙事，不作角色名） |
| **教练席 / Coach Rail** | 牌桌右侧的 180px 独立列，教练立绘、气泡、反馈卡都住在这里 |
| **五级输出 L0–L4** | 教练反馈的强度分级，见 §5-B2 |
| **反馈预算** | 每局自动展开 ≤2 次、开口 ≤4 次（局中稀缺；**局末解除**，见 B2 与 D1 的局末总结清单） |
| **`capability`** | `full` / `partial` / `unsupported`。把"教练在某玩法下不确定"变成一等公民 |
| **`CoachVerdict`** | 局中契约（每手一次判断） |
| **`CoachReview`** | 局末契约（结算复盘） |
| **WDS** | Weighted Decision Score，道场色带的输入（P1，本期不做） |

---

## 1. 现状基线

### 1.1 三层架构（这是全文的骨架）

```
┌─ 演出层 CoachStage / CoachRail ────────────────────┐
│  不认识玩法。只消费 CoachVerdict / CoachReview      │
│  五级输出 · 状态机 · 反馈预算 · 序列帧 · 音效        │
└──────────────────── ▲ ─────────────────────────────┘
                      │ 统一契约（本层是统一的唯一位置）
┌─ 接入层 CoachAdapter ──────────────────────────────┐
│  每个玩法一个薄适配器，把已有算法包成 CoachVerdict   │
│  hongkong / riichi / mcr / american / regional     │
└──────────────────── ▲ ─────────────────────────────┘
                      │ 各玩法的真实算法（已存在，不重写）
┌─ 算法层 lib/mahjong/ ─────────────────────────────┐
│  coach.ts judgeDiscard/rankDiscards（向听+进张）    │
│  american.ts americanCoachAdvice（NMJL 牌型距离）   │
│  regional.ts judgeRegionalDiscard（⚠️ 见 A1）       │
│  scoring/ scoreHand（122 番种 × 3 玩法）            │
└───────────────────────────────────────────────────┘
```

> **核心设计原则**：**契约层统一，算法层分治。**
> 不能用"一个算法算所有玩法"——美式是匹配 NMJL 卡片牌型（向听无意义），四川要缺门约束，台湾 16 张。硬塞 = 毁掉。
> 统一必须取**最大公约数**，不是最小公分母：契约包含全部字段，各玩法能填多少填多少。**不让强者（美式）被削平，让弱者诚实承认。**

### 1.2 已有资产 vs 缺口

| 系统 | 已有资产（实测） | 真实缺口 |
|---|---|---|
| **教练算法** | `lib/mahjong/coach.ts`：`rankDiscards()` / `judgeDiscard()` / `unseenCounts()` / `acceptance()` / `DiscardGrade` | 输出只有 `{grade, best, played}`——**没说为什么、差多少** |
| **教练 UI** | `CoachControls.tsx`（三档 `<select>`）、`coach-prefs.ts`（持久化） | 反馈是一行 `<span>`，与"难度下拉"同挤在一个 flex 里 |
| **玩法接入** | 港式/立直/国标走 `MahjongTable` → `HongKongTable`（`coach` prop 注入）；美式/区域各自实现 | **3 套互不相干的返回结构**（`best` vs `suggested`）；**移动端无教练** |
| **每日一题** | `lib/daily/seed.ts`（`dailySeed` FNV-1a）、`streak.ts`（`planDailyStreak` 含周冻结）、`HomeDailyHand.tsx`（已跑通 + 复制分享） | `DAILY_PUZZLES = []` 空数组；分享卡内容太弱；**streak 要求"赢"** |
| **算番** | `lib/mahjong/scoring/` 完整：`scoreHand()` + `VALUES` **122 番种 × 3 玩法** + `LIMIT` | **无 `/tools` 路由、无 `tools` ns、零页面** |
| **成就** | `AppearanceUnlock` 表（`source` 列已是 `String`，可扩枚举值）。⚠️ v2 已删 `FragmentLedger` 与 `points-ledger.ts` | **成就系统完全为零** |
| **结算** | `ScorePanel.tsx` 的 `ResultBanner`（番种一行 + 点数） | 无结构分解、无门槛说明、**无"为什么没胡"** |
| **音效** | `features/table/sound.ts`——**Web Audio 程序化合成**（`tone()` 振荡器，11 个音效名） | 缺 `coach-note` / `coach-ack` |
| **动画** | 无动画库（**19 个依赖，只有 tailwindcss**）。已有先例 `animate-pulse` | 无序列帧播放器 |
| **牌桌** | `BoardScaleFrame`（`designWidth={980}` prop 可动态改）；`ai-avatars-default.webp` 已是 2×2 sprite sheet | 手牌不排序；缩放只按宽度；装饰伪装成控件 |

### 1.3 六玩法覆盖矩阵

| 玩法 | 引擎 | ① 算法层 | ② 接入层 | ③ 演出层 | 目标 capability |
|---|---|---|---|---|---|
| 港式 hongkong | `GameState` | ✅ 真实向听 + 进张 | ✅ | ⚠️ 一行 span | `full` |
| 立直 riichi | `GameState` | ⚠️ **无役种门槛** | ✅ | ⚠️ | `partial` → 补门槛后 `full` |
| 国标 chinese-official | `GameState` | ⚠️ **无 8 番门槛** | ✅ | ⚠️ | `partial` → 补门槛后 `full` |
| 美式 american | `AmericanGameState` | ✅ `americanCoachAdvice`（**能力最全**：risk/joker/outs） | ✅ | ⚠️ 文本面板 | `partial` |
| 四川 sichuan | `RegionalGameState` | 🔴 **bot 启发式，会冤枉玩家** | ✅ | ⚠️ | **`unsupported`（先止血）** |
| 台湾 taiwan | `RegionalGameState` | 🔴 同上 | ✅ | ⚠️ | **`unsupported`（先止血）** |

移动端：**港式/立直/国标 无教练**（`HongKongTable` 渲染 `MobileMahjongTable` 时未传 `coach` prop）；美式/区域有。

> ### 🔴 v3 裁决 · A2 会连带静默立直/国标（原 P1-1）
>
> §4.4 的适配器写法是 `if (capability !== 'full') return { grade: null, capability }`。立直/国标是 `partial`，**会被一并静默** —— 从"有（可能不准的）反馈"变成"**零反馈**"，这是玩家可感知的**功能回退**。A1 只声明了"区域桌降级"，未覆盖这条。
>
> **裁决：按 capability 分三档行为，不再用 `!== 'full'` 一刀切。**
>
> | capability | 玩法 | 反馈行为 | 演出态 |
> |---|---|---|---|
> | `full` | 港式 | 完整反馈 | 在场 |
> | `partial` | 立直 / 国标 / 美式 | **照常出反馈，但附限定语**（立直/国标："⚠️ 未校验役种门槛"；美式：走 `note`） | 在场 |
> | `unsupported` | 四川 / 台湾 | **零 grade**，只出 L1 记号 | `watching`（在场不评价） |
>
> **理由**：诚实 ≠ 沉默。诚实 ＝ **把边界说清**。立直/国标的缺陷维度单一（只缺役种门槛），效率维度的建议仍然有效，说清限定语即可；而四川/台湾是**算法本身会判错**，说了就是误导，必须闭嘴。这与 §1.1"让弱者诚实承认"一致，也保住了 A1 止血建立的信任。

---

## 2. 硬约束（15 条红线）

> 违反任意一条 = 该 WP 验收失败，无论功能是否"看起来能用"。
> ⚠️ **编号权威在 §2 表（1–12）+ §2.2 表（13–15），共 15 条**。文末的"红线速记"是**本节的子集**，不是独立清单。

| # | 红线 | 为什么 |
|---|---|---|
| 1 | **`lib/mahjong/` 保持零外部依赖** | 它将来要被 Cocos 侧共享。一行 `import { cookies } from 'next/headers'` 会让 Cocos 静默编译失败 |
| 2 | **`coach.ts` 只做纯函数，不含任何文案** | 返回语义码，措辞在渲染层。否则多语种（现为 **3 个 locale**）无法维护 |
| 3 | **`coach.ts` 只追加，不改动现有导出签名** | `rankDiscards` / `judgeDiscard` / `acceptance` / `unseenCounts` 必须原样。改签名会同时炸掉牌桌、工具页、每日一题 |
| 4 | **所有行为记录 / 成就判定在服务端** | 客户端只上报 `{handId, moves[]}` 或 `{seed, moves[]}`；服务端用确定性引擎重放。⛔ 客户端绝不上报进度或"已解锁"。**⛔ 客户端也不上报任何统计指标**（`handsPlayed` / `grade` 全部服务端自算） |
| 5 | **🔴 教练永远不显示对手手牌**（含"调试模式"） | 玩家一旦发现他能看穿暗牌，全部信任归零。局末亮牌是唯一例外，且**必须显式声明**（见 E2） |
| 6 | **⛔ 不用红色 / ❌ / "你打错了"** | `better` 用琥珀；措辞先肯定再优化（"也不错，但…"）。禁止"错误音效" |
| 7 | **不用颜色单独传达信息** | grade 用图标 + 文字双通道（`✓ 好选择` / `~ 可以` / `▸ 也不错，但…`）；逐巡块用形状 `●◍○` |
| 8 | **新页面 / 新组件必须用 `portal-*` 令牌类** | 零硬编码色值。全站 6 套主题（rainbow/jade/amber/porcelain/vermilion/ink）必须跟随 |
| 9 | **不引入任何新依赖**（含动画库） | 所有动效 CSS / Tailwind / WAAPI 实现 |
| 10 | **i18n namespace 必须全部 locale 齐**（en / zh / zh-TW / ja / ko + 扩展 4 语，**共 9 个**） | `next-intl` 缺 key 会**整页 500**，不是局部缺字。⚠️ 前版写"三语齐"是**低估**——真源是 `messages/` 目录下实际存在的 locale 文件 |
| 11 | **结构分解必须从 `scoreHand` 内部带出** | 立直/国标有 `selectBest*` 选优，外部重算会得到与算番不一致的解释 = 信任崩塌 |
| 12 | **牌桌布局改动不得改 `GameState`** | 手牌排序等一律是展示层纯函数 |

### 2.1 三条最容易被漏的

- **红线 10**：新增 ns（`coachFb` / `tools`）**3 个 locale 必须同批**。⚠️ `achievements` **不是新增 ns**——它已在 `messages/en.json` 里（当前顶层 ns = **29 个**）。缺任一 locale 的 key = 该语种页面 500。
- **红线 6**：这条最容易被"顺手加个红色"破坏。Code review 时专门看一眼。
- **红线 3**：`explainDiscard()` 是**追加**，`git diff` 应**只有新增行**。

### 2.2 新增红线（v2 积分重构引入）

| # | 红线 | 为什么 |
|---|---|---|
| 13 | **⛔ 不引入任何形式的中间货币** | 无货币即无通胀（支柱 P2）。"学习币""成就点""道场币"一律禁止——任何需要 sink 治理的累积量都会把复杂度带回来 |
| 14 | **⛔ 不新增美术资产来支撑系统** | 支柱 P1。奖励只能用**已存在的** 5 件皮肤 + 徽章 + 进度条表达。⛔ 不得因为"成就需要奖励"而画新皮肤 |
| 15 | **⛔ 不得让玩家卡在付费 / 登录墙** | 支柱 P3。未登录必须能玩、能签到、能拿成就；登录只增加**跨设备可见性**，不增加能力 |

---

## 3. 开工前置（每个 WP 开工前都要跑）

D 盘工作区**长期有协作者在途改动**（60+ 文件修改、5 新目录、4 删除）。**行号会漂移。**

```bash
cd D:/mahjonggamebox/mahjong-hub/mahjong-hub
git status --short      # 看 M / ?? / D
git log --oneline -5    # 记下当前 HEAD
```

| 检查项 | 为什么 |
|---|---|
| `lib/mahjong/coach.ts` 是否被改过 | B1 直接改它；A1/A2 也动它 |
| `components/games/MahjongTable.tsx` 是否被改过 | B1/B3/D1 都改它 |
| `components/HomeDailyHand.tsx` 是否被改过 | C1/C2 改它 |
| `lib/mahjong/engine.ts` → `engine/` 拆分是否已合并 | 影响 C2 的 import 路径（两种写法见 C2） |
| `messages/*.json` 是否加过 `coachFb` / `tools` / `achievements` | 避免 namespace 冲突 |
| `prisma/schema.prisma` 是否加过 `AchievementUnlock` / `LearningStat` | F1。⚠️ **两者已在 schema 与迁移 `20260916120000` 里** → 先查再动，**已存在则不要重复建** |

**规则**：本文档给的行号**只作定位参考**。找不到行号时，**按 §0.2 的「锚点」字符串搜索**。

**开工前先确认自己在干净分支**：所有 §5 的 WP 都必须在协作者在途改动**合并之后**再开分支，否则行号与 import 路径全废。

---

## 4. 契约层（地基，Phase A2）

> 这一节是**所有工作包的共同前置**。先做，不要跳。

### 4.1 目录结构（新建）

```
lib/mahjong/coach/
├── contract.ts        ← 统一契约（Verdict + Adapter + 能力注册表）
├── review.ts          ← 结算契约（CoachReview + Evidence）
├── explain.ts         ← 局中解释层（explainDiscard + 原因码）
└── adapters/
    ├── hongkong.ts    ← 港式 / 立直 / 国标（共用 GameState）
    ├── american.ts    ← 美式（AmericanGameState）
    └── regional.ts    ← 四川 / 台湾（RegionalGameState）
```

⛔ **`lib/mahjong/coach/` 下同样禁止任何外部 import**（红线 1）。
✅ 允许：`import type { GameState } from '../engine'` 等**相对路径 + 类型**。

### 4.2 `lib/mahjong/coach/contract.ts`

```ts
/**
 * The one contract every mahjong variant speaks.
 *
 * The performance layer (CoachStage / CoachRail / feedback budget / sound)
 * consumes ONLY this file's types — it must never learn which ruleset is
 * running. That is what makes "the same coach everywhere" true.
 */

export type CoachGrade = 'best' | 'acceptable' | 'better';

/**
 * How much this variant's coach actually knows.
 * Turn the word "uncertain" into a first-class value instead of hiding it
 * behind a branch.
 *   full        -> full L0-L4 output + settlement review
 *   partial     -> L1 markers + directional info only; NEVER judge a grade
 *   unsupported -> `watching` state: present, blinks, nods, does not evaluate
 */
export type CoachCapability = 'full' | 'partial' | 'unsupported';

/** Discard danger. American already computes this; others may fill it later. */
export type CoachRisk = 'low' | 'medium' | 'high';

export interface CoachVerdict {
  /** null = the coach declines to judge (silence). */
  grade: CoachGrade | null;
  capability: CoachCapability;

  /** The better tile. Unified name — replaces the old best/suggested split. */
  suggested?: string;
  /** What the player actually discarded. */
  played?: string;
  /**
   * Quantified gap. <= 0 means the player's discard was worse than `suggested`.
   * 🔴 Sign convention: for `metric === 'ukeire'` a larger number is better;
   * for `metric === 'distance'` a SMALLER number is better. Read `metric`
   * before comparing. Default when absent: 'ukeire'.
   */
  gap?: number;
  shanten?: number;
  ukeire?: number;

  /** Deal-in risk. American fills it; a P1 item for the others. */
  risk?: CoachRisk;
  /** Variant-specific note: american exposure/joker, MCR fan shortfall, etc. */
  note?: string;
}

/**
 * One ranked discard option.
 *
 * 🔴 `metric` exists because not every variant ranks by "more is better".
 * American ranks by pattern `distance` — SMALLER is better. Without this
 * field every caller has to remember the direction, and one of them will
 * get it wrong (the first draft of the American adapter did).
 * Direction is a first-class value here for the same reason `capability`
 * is: "the coach is uncertain" and "the numbers run backwards" are both
 * facts the renderer must know, not trivia to memorise.
 */
export interface RankedOption<T = string> {
  tile: T;
  shanten: number;
  /** Ukeire count. Larger is better. Used when `metric` is 'ukeire' or absent. */
  ukeire: number;
  /** American / inverted metrics: smaller is better. */
  distance?: number;
  /** Tells the performance layer how to read the numbers. Default 'ukeire'. */
  metric?: 'ukeire' | 'distance';
}

/**
 * One thin adapter per variant. Adapters do NOT contain algorithms —
 * they wrap the ones that already exist in lib/mahjong/*.ts.
 */
export interface CoachAdapter<S, T = string> {
  ruleset: string;
  capability: CoachCapability;
  judge(state: S, seat: number, tile: T): CoachVerdict;
  rank(state: S, seat: number): RankedOption<T>[];
}
```

### 4.3 能力注册表 `lib/mahjong/coach/contract.ts`（同文件追加）

> 让"哪个玩法的教练懂多少"变成**可查询的数据**，而不是散落各处的 `if`。

```ts
import type { CoachCapability } from './contract';

/**
 * Single source of truth for per-variant coach ability.
 * Update this BEFORE writing any variant-specific UI branch.
 */
export const COACH_CAPABILITIES = {
  hongkong: 'full',
  riichi: 'partial',
  'chinese-official': 'partial',
  american: 'partial',
  sichuan: 'unsupported',
  taiwan: 'unsupported',
} as const satisfies Record<string, CoachCapability>;

export type CoachRuleset = keyof typeof COACH_CAPABILITIES;

export function resolveCoachCapability(ruleset: string): CoachCapability {
  return (COACH_CAPABILITIES as Record<string, CoachCapability>)[ruleset] ?? 'unsupported';
}
```

**升级路径**（写进注释，防止后人乱改）：
- `riichi` / `chinese-official`：接入 `scoring/` 门槛校验后 → `'full'`（见 G1）
- `sichuan` / `taiwan`：实现真向听（缺门 / 16 张）后 → `'full'`（见 G3）

### 4.4 三个适配器

#### `lib/mahjong/coach/adapters/hongkong.ts`

```ts
import { judgeDiscard, rankDiscards } from '../../coach';
import type { GameState, Seat, Tile } from '../../engine';
import type { CoachAdapter, CoachVerdict } from '../contract';
import { resolveCoachCapability } from '../contract';

/**
 * Hong Kong / Riichi / Chinese Official share GameState.
 * The capability differs per ruleset — read it from the registry, don't hardcode.
 */
export function makeGameStateAdapter(ruleset: string): CoachAdapter<GameState, Tile> {
  const capability = resolveCoachCapability(ruleset);

  return {
    ruleset,
    capability,
    judge(state, seat, tile): CoachVerdict {
      // 🔴 v3: three-way branch, NOT `!== 'full'`. See §1.3 裁决.
      //   unsupported (sichuan/taiwan) → stay silent: the algorithm itself can be wrong.
      //   partial (riichi/chinese-official) → DO judge, but disclose the missing gate.
      if (capability === 'unsupported') {
        return { grade: null, capability };
      }
      const { grade, best, played } = judgeDiscard(state, seat, tile);
      return {
        grade,
        capability,
        suggested: best.tile,
        played: played.tile,
        gap: played.ukeire - best.ukeire,
        shanten: best.shanten,
        ukeire: best.ukeire,
        // Semantic code, not copy (红线 2). The renderer maps it to
        // "⚠️ 本判断只看效率，未校验役种门槛".
        ...(capability === 'partial' ? { note: 'noYakuGate' } : {}),
      };
    },
    rank(state, seat) {
      return rankDiscards(state, seat).map(({ tile, shanten, ukeire }) => ({
        tile, shanten, ukeire,
      }));
    },
  };
}
```

#### `lib/mahjong/coach/adapters/american.ts`

> ### 🔴 修订块 · v2：前版有 4 处字段映射错误（已实证）
>
> 前版代码是**按猜测写的**，读 `lib/mahjong/american.ts` 后确认全部错误。**逐条对照下表**：
>
> | # | 前版写法 | 实测正确写法 | 不改的后果 |
> |---|---|---|---|
> | ① | `suggested: advice.keep?.[0]` | `suggested: advice.discard` | `keep[]` 是**最该留的牌**，语义恰好相反 → **教练指着玩家最该留的牌说"打这张"** |
> | ② | `risk: advice.discardRisk as CoachRisk` | `risk: advice.discardRisk?.level` | 裸强转把**对象当枚举** → `risk === 'high'` **永远 false**，风险提示静默失效 |
> | ③ | `tile: String(r.tile)` / `ukeire: Number(r.distance ?? 0)` | `tile: r.card.id` / `distance: r.distance` / `metric: 'distance'` | `rankings[]` 里是 `{card, distance}`，**没有 `r.tile`** → 渲染成 `"undefined"`；且 `distance` **越小越好**，与 `ukeire` 方向相反 → **排名表整个颠倒** |
> | ④ | `judge(state, seat, tile)` / `americanCoachAdvice(state, seat, tile)` | `judge(state, seat)` / `americanCoachAdvice(state, seat)` | 真实签名**没有第三个参数**，多传被忽略 |
>
> ⚠️ 错误 ③ 需要 §4.2 的 `RankedOption.metric` 才能正确表达 —— 这是**契约层改动**，不是适配器局部修正。
>
> 📌 §8 P-4 已由此修订块关闭。

```ts
import { americanCoachAdvice } from '../../american';
import type { CoachAdapter, CoachVerdict } from '../contract';

/**
 * American is the RICHEST implementation (risk / joker / outs).
 * Do NOT flatten it into {grade, suggested} — the whole point of the
 * "greatest common denominator" decision is that the strong variant
 * is not weakened by unification.
 *
 * 🔴 Signatures are (state, seat) — there is NO third `tile` argument.
 * 🔴 `rankings[]` entries are `{card, distance}` where SMALLER distance is
 *    better. We surface that with `metric: 'distance'` so the renderer does
 *    not have to remember it. See contract.ts `RankedOption`.
 */
export function makeAmericanAdapter(): CoachAdapter<unknown, string> {
  return {
    ruleset: 'american',
    capability: 'partial',
    judge(state, seat): CoachVerdict {
      const advice = americanCoachAdvice(state as never, seat as never);
      return {
        grade: null,                 // American ranks patterns, it does not grade a tile
        capability: 'partial',
        suggested: advice.discard,   // ✅ NOT keep[0] — keep[] is what to HOLD
        risk: advice.discardRisk?.level, // ✅ .level, not the object itself
        note: advice.jokerExchange ? 'joker' : undefined,
      };
    },
    rank(state, seat) {
      const advice = americanCoachAdvice(state as never, seat as never);
      return (advice.rankings ?? []).map((r) => ({
        tile: r.card.id,             // ✅ `card`, not `tile`
        shanten: 0,
        ukeire: 0,                   // not meaningful for this variant
        distance: r.distance,
        metric: 'distance' as const, // ✅ tells the renderer: smaller is better
      }));
    },
  };
}
```

#### `lib/mahjong/coach/adapters/regional.ts`

```ts
import { judgeRegionalDiscard } from '../../regional';
import type { CoachAdapter, CoachVerdict } from '../contract';

/**
 * 🔴 Sichuan / Taiwan: the existing `judgeRegionalDiscard` derives its
 * "best discard" from `chooseRegionalDiscard` — that is the AI bot's
 * greedy heuristic, NOT an optimal solution. It does not compute shanten,
 * so it WILL wrongfully mark a player's good discards as `better`.
 *
 * Until a real regional shanten exists, these rulesets stay `unsupported`
 * and the coach goes into the `watching` state.
 *
 * 🔴 Do not "improve" this adapter by wiring the heuristic back in.
 * Silence is safe; a wrong verdict destroys trust.
 */
export function makeRegionalAdapter(ruleset: 'sichuan' | 'taiwan'): CoachAdapter<unknown, string> {
  return {
    ruleset,
    capability: 'unsupported',
    judge(): CoachVerdict {
      return { grade: null, capability: 'unsupported' };
    },
    rank() {
      return [];
    },
  };
}
```

### 4.5 `lib/mahjong/coach/review.ts`（结算契约）

```ts
import type { HandSet, Tile } from '../engine';
import type { CoachCapability } from './contract';

/** A machine-readable reason a fan is awarded. Templates live in i18n. */
export type Evidence =
  | { kind: 'allTiles'; predicate: 'simple'|'terminal'|'honour'|'green'|'reversible'|'oneSuit'; hits: Tile[] }
  | { kind: 'setComposition'; all: 'triplet'|'run'; sets: HandSet[] }
  | { kind: 'specificSets'; what: 'dragon'|'wind'|'concealed'; count: number; sets: HandSet[] }
  | { kind: 'waitShape'; shape: 'twoSided'|'closed'|'edge'|'single'; set: HandSet; winningTile: Tile }
  | { kind: 'winCondition'; condition: 'selfDraw'|'haitei'|'rinshan'|'robKong'|'lastTile' }
  | { kind: 'declaration'; what: 'riichi'|'doubleRiichi'|'ippatsu'|'concealed' }
  | { kind: 'doraCount'; groups: { indicator: Tile; dora: Tile; hits: Tile[] }[] }
  | { kind: 'specialShape'; shape: 'sevenPairs'|'thirteenOrphans'|'nineGates'; tiles: Tile[] }
  | { kind: 'sequencePattern'; pattern: 'ittsuu'|'sanshoku'|'iipeikou'; sets: HandSet[] }
  | { kind: 'kongCount'; concealed: number; melded: number }
  | { kind: 'flowerCount'; tiles: Tile[] }
  | { kind: 'gate'; required: number; actual: number; passed: boolean; reason?: string }
  /** No generator yet -> render the fan name only. */
  | { kind: 'fallback'; fanId: string };

/**
 * What the coach says at settlement. Structurally parallel to CoachVerdict:
 * same capability field, same "performance layer doesn't know the ruleset" rule.
 */
export interface CoachReview {
  capability: CoachCapability;
  outcome: 'iWon' | 'opponentWon' | 'draw';

  /** A layer: hand shape + the decomposition actually used for scoring. */
  shape?: { kind: 'standard'|'sevenPairs'|'thirteenOrphans'; sets?: HandSet[]; winningTile?: Tile };
  /** B layer: minimum-win gate. */
  gate?: { kind: 'yaku'|'minFan'; required: number; actual: number; passed: boolean;
           reasonKey?: 'noYaku'|'belowMinimum'|'flowersExcluded' };
  /** C layer: fans + machine-readable evidence. */
  fans?: { id: string; value: number; evidence: Evidence }[];
  /** D layer: payment formula, structured (never translate a whole sentence). */
  formula?: { items: { labelKey: string; value: number }[]; total: number; note?: string };
  /** When the player did not win: from coach.ts, not from ScoreResult. */
  missInfo?: { shanten: number; waits: Tile[]; note?: string };
  /** First-ever settlement review: disclose that tiles are revealed now. */
  discloseReveal?: boolean;
}
```

### 4.6 一致性单测（防未来再分裂）

**新建 `tests/coach-contract.test.ts`**

必须断言：

1. **每个 adapter 都返回合法的 `CoachVerdict` 结构**：`capability` ∈ 三值；`grade` ∈ 四值（含 null）；当 `capability !== 'full'` 时 `grade === null`。
2. **`COACH_CAPABILITIES` 覆盖全部 `Ruleset` 成员**——用类型断言或显式清单比对，**新增玩法时忘记登记会编译失败**。
3. **`capability !== 'full'` 的 adapter，其 `judge()` 永不返回非空 `grade`**（这是 A1 止血的防回归锁）。
4. **字段名唯一性**：断言全树不再出现裸 `suggested` 之外的命名（grep `\.best\b` 在 adapter 层为 0）。

> 这四条是"防止三套实现再次分裂"的机制。没有它们，半年后又会分裂。

---

## 5. 工作包

### Phase A — 止血与地基

---

#### A1 · 区域桌降级沉默（止血，**1 行量级**）

| 字段 | 内容 |
|---|---|
| **目标** | 四川/台湾的教练**停止冤枉玩家**。它能算错，但不能再说话 |
| **依赖** | 无 |
| **文件** | `lib/mahjong/coach/adapters/regional.ts`（新建，见 §4.4）。若暂不建适配器，最短路径是让 `RegionalMahjongTable` 不渲染教练反馈 |
| **锚点** | 搜 `judgeRegionalDiscard`、搜 `RegionalMahjongTable` 里声明但从未赋值的 `coachGrade` |
| **实施** | 走 §4.4 的 `makeRegionalAdapter()`，`capability: 'unsupported'`，`judge()` 直接返回 `{ grade: null }` |
| **验收** | 四川/台湾桌出牌后**不再出现任何 grade 文本**；教练头像仍在（`watching` 态，会眨眼不评价） |
| **commit** | `fix(coach): stop evaluating discards for sichuan and taiwan (bot heuristic)` |
| **回滚** | 单 commit revert |

> **为什么不直接修算法**：实现区域真向听（缺门约束 / 台湾 16 张）是中–高成本（见 G3）。而**错误建议正在持续损害信任**——止血优先于治本。

---

#### A2 · 契约层（**所有后续 WP 的地基**）

| 字段 | 内容 |
|---|---|
| **目标** | 五个玩法说同一种语言；演出层从此不需要知道玩法 |
| **依赖** | A1（同一批文件，建议 A1+A2 一个 PR） |
| **文件** | 新建 §4.1 全部文件；新建 `tests/coach-contract.test.ts` |
| **实施** | 照抄 §4.2–4.5。**不改任何现有算法**，只做薄封装 |
| **验收** | ① `npm run build` 通过 ② `tests/coach-contract.test.ts` 全绿 ③ `git diff lib/mahjong/coach.ts` **为空**（本 WP 不动老文件）④ `grep -r "from 'next" lib/mahjong/coach/` 无结果（红线 1） |
| **commit** | `feat(coach): add unified CoachVerdict contract and per-variant adapters` |
| **回滚** | 删新增目录即可，零副作用 |

---

### Phase B — 教练会说话（局中）

---

#### B1 · `explainDiscard()` + 反馈卡

| 字段 | 内容 |
|---|---|
| **目标** | 反馈从"3 个词"升级为"更优是哪张 / 差多少 / 为什么"。**零新算法**——数据全在 `judgeDiscard()` 里 |
| **依赖** | A2 |
| **文件** | ① `lib/mahjong/coach.ts` **文件末尾追加**（或按 A2 放 `lib/mahjong/coach/explain.ts`，推荐后者）② 新建 `components/games/table/CoachPanel.tsx` ③ `components/games/MahjongTable.tsx` ④ `messages/{en,zh,zh-TW}.json` |
| **锚点** | `coach.ts` 现有最后一行是 `judgeDiscard` 的 `return { grade: 'better', best, played };`；`MahjongTable.tsx` 搜 `setCoachGrade(` 与 `coachIntensity === 'live' \|\| coachAsked` |

**实施：`explainDiscard()`**

```ts
export type DiscardReason =
  | 'same-tile'                    // you played the best tile
  | 'equal-shanten-close-ukeire'   // same shanten, ukeire gap <= 2
  | 'fewer-ukeire'                 // same shanten but clearly fewer improving tiles
  | 'worse-shanten';               // you moved a step away from ready

export interface DiscardExplanation {
  grade: DiscardGrade;
  played: RankedDiscard;
  best: RankedDiscard;
  /** played.ukeire - best.ukeire — always <= 0 */
  ukeireGap: number;
  /** played.shanten - best.shanten — always >= 0 */
  shantenGap: number;
  reason: DiscardReason;
}

export function explainDiscard(state: GameState, seat: Seat, tile: Tile): DiscardExplanation {
  const { grade, best, played } = judgeDiscard(state, seat, tile);
  const ukeireGap = played.ukeire - best.ukeire;
  const shantenGap = played.shanten - best.shanten;
  const reason: DiscardReason =
    played.tile === best.tile ? 'same-tile'
    : shantenGap > 0 ? 'worse-shanten'
    : Math.abs(ukeireGap) <= 2 ? 'equal-shanten-close-ukeire'
    : 'fewer-ukeire';
  return { grade, best, played, ukeireGap, shantenGap, reason };
}
```

**设计说明（写给 reviewer）**：
- `reason` 是 `grade` 的**细化**，不是平行概念：`acceptable` ⟺ `equal-shanten-close-ukeire`；`better` 分裂为 `fewer-ukeire` / `worse-shanten`。**保留两个字段是刻意的**——`grade` 驱动视觉（只有一个维度），`reason` 驱动文案（四种措辞）。加第 5 种措辞时**不用动 grade 枚举**。
- 阈值 `<= 2` 与 `judgeDiscard()` 内部完全一致（`best.ukeire - played.ukeire <= 2`）。**两处必须同步改**，在代码注释里标注。

**反馈卡 UI（`CoachPanel.tsx`）**

```
┌──────────────────────────────────────┐
│ ✓ 好选择                              │  ← best=绿 / acceptable=灰 / better=琥珀
│                                      │     ⚠️ better 用琥珀，⛔ 绝不用红色/❌
│ 打 7 Dot                             │
│                                      │
│ ⚠ 点炮风险 中                          │  ← 🔴 v3 新增：消费 `CoachVerdict.risk`
│                                      │     低=灰 / 中=琥珀 / 高=琥珀加粗
│ ⓘ 只看了效率，未校验役种门槛            │  ← 🔴 v3 新增：消费 `CoachVerdict.note`
│                                      │     语义码 → `coachFb.note.*` 文案
│ ▸ 为什么不更优                        │  ← 默认折叠；点击展开
│   打 3 Dot 可多留 5 张改良牌          │
│   当前进张 7 张 → 12 张               │
│   仍 2 向听                           │
│                                      │
│ [ 看这手牌的番 ] [ 再来一局 ]          │
└──────────────────────────────────────┘
```

| 规则 | 说明 |
|---|---|
| `same-tile` | **不显示"为什么不更优"折叠区**（没有更优可讲） |
| `better` + `worse-shanten` | 折叠区**默认微展开一行摘要**，完整对比需点击 |
| 其余 | 默认折叠 |
| **`risk` 有值** | 🔴 **必须渲染**："点炮风险 低/中/高"，位置在**牌名下方、折叠区上方**（比解释更紧急，不能藏进折叠区）。**无 `risk` 的玩法不占位、不显示"无数据"** |
| **`note` 有值** | 🔴 **必须渲染**为一行 `ⓘ` 说明。`note` 是**语义码**（红线 2：不含文案），查 `coachFb.note.*` 取措辞。**未知码** → 原样显示码本身（便于发现遗漏），**不要静默丢弃** |
| `silent`（禅）档 | **完全不出卡**（教练席此时不存在，见 B3 澄清） |
| 无障碍 | `role="status"` + `aria-live="polite"`；折叠按钮 `<button aria-expanded>` |
| 宽度 | ≤ 320px |

> 🔴 **为什么 `risk` / `note` 必须在这张卡里（v3 裁决）**
> §1.1 定的是"**不让强者（美式）被削平**"。而美式**唯一**能表达差异化的通道就是 `risk`（点炮风险）与 `note`（joker / exposure / 役种门槛）。
> 卡片不消费它们 → 美式渲染出来和港式一模一样（都是"三个词 + 差多少"）→ **契约里多出来的字段等于白填**，设计原则在演出层退化成最小公分母。
> 这不是"锦上添花的 UI 细节"，是**契约层存在意义的兑现点**。

**验收清单**

- [ ] 出 `best` → 绿色确认句，**无折叠区**
- [ ] 出 `acceptable` → 灰色 + 措辞**必须承认差距小**（"但差距很小"）
- [ ] 出 `better` → 琥珀色（**不是红色**）+ 折叠区可展开，显示 `best.tile` 与两个数字
- [ ] **3 个 locale**（`en` / `zh` / `zh-TW`）切换文案跟随（**硬编码英文 = 验收失败**）
- [ ] 🔴 **`risk` 有值时卡片显示风险行**（用美式桌验证：`americanCoachAdvice` 的 `discardRisk`）
- [ ] 🔴 **`note` 有值时卡片显示说明行**（用立直桌验证：`noYakuGate`）；未知语义码**原样显示**，⛔ 不静默丢弃
- [ ] 禅档下卡片不出现（教练席本身也不渲染）
- [ ] `git diff lib/mahjong/coach.ts` **只有新增行，无修改/删除行**
- [ ] 6 套主题下卡片颜色跟随（用 `portal-*` 类，⛔ 无硬编码 hex）

**commit**
```
feat(coach): add explainDiscard() returning semantic reason codes
feat(coach): add CoachPanel feedback card with expandable reasoning
i18n(coach): add coachFb namespace (en/zh/zh-TW)
```

**回滚**：纯增量 + 一个组件替换。`git revert` 单 commit；旧行为不受影响（新函数无人调用即成死代码）。

---

#### B2 · 五级输出与反馈预算

| 字段 | 内容 |
|---|---|
| **目标** | 教练学会**沉默**。一局 13–18 巡不可能逐手点评——那是批改作业 |
| **依赖** | B1 |
| **文件** | `components/games/table/CoachPanel.tsx`（扩）、新建 `features/table/coach-session.ts`（预算 state + 纯函数）、`MahjongTable.tsx` |
| **锚点** | 搜 `coachGrade`、搜 `coachAsked` |

**五级输出**

| 级别 | 形态 | 打断度 | 触发条件 | 预算 |
|---|---|---|---|---|
| **L0 静默** | 无 | 0 | 禅档；或非关键牌 | — |
| **L1 记号** | 8px 圆点 / ✓ | ≈0（不占位） | **每次出牌后无条件出现** | 不限 |
| **L2 一行** | chip 一行文字 | 低 | `better`；或连续 3 次 `best` | 不限（4s 后降级为 L1） |
| **L3 卡片** | 展开的解释卡 | 中 | ① 玩家点击 chip ② `better` 且（`ukeireGap ≤ -4` 或 `shantenGap ≥ 1`） | **每局自动 2 次**（点击不受限） |
| **L4 开口** | 音效 + 头像点亮 | 中 | 仅在 **L3 自动**展开时 | **每局 4 次** |

**每个预算的 rationale**

| 值 | 依据 |
|---|---|
| 自动 L3 = **2 次/局** | 一局里"真正值得说"的牌的数量级。超过后降级 L2 → **不重复说同一件事 = 尊重感** |
| L4 = **4 次/局** | ≈ 每 4 巡最多响一次 → 音效不变成噪音 |
| 显著阈值 `ukeireGap ≤ -4` | B1 已定"差距 ≤2 视为接近"，则 ≥4 是"明显"的自然下界 |
| 连续 **3** 次 best 才表扬 | **廉价表扬摧毁表扬的价值**。首次 best 不出彩 |

> ### 🔑 本节最重要的一条：**沉默必须是可区分的**
> 如果"没有反馈"既可能是"打对了"也可能是"教练没在看"，玩家会**学会无视教练**——这是所有提示型系统的死法。
> **对策：L1 记号每次出牌后无条件出现。** 它不占位、不打断、不出声，但保证"我看过你这张牌"这个信号永远存在。
> 玩家因此能区分：**有记号** = 看过没问题 / **有 L2/L3** = 有问题或值得表扬 / **什么都没有** = 禅档（教练离席）。

**情绪曲线**

| 时刻 | 设计 | 理由 |
|---|---|---|
| 开局 | 教练**不发言** | 避免"又来了"的印象 |
| 第 1 次 `best` | **只有 L1 记号** | 首次成功不出彩 |
| 连续 3 次 `best` | L2 chip："连续 3 手最佳" | 稀缺表扬才有价值 |
| 首次显著 `better` | **L3 自动 + L4 开口** | 「教学时刻」，整局最高价值 |
| 同局第 3 次显著错误 | **降级为 L2** | 不重复说 |
| **听牌时** | **教练沉默**（除 L1） | ⚠️ 最高压时刻不该被打扰 |
| 局末 | 总结卡（唯一"多话"的时刻） | 叙事收束 |

**验收**
- [ ] L1 记号**每次出牌都出现**（含 `best`/`acceptable`）
- [ ] 自动 L3 第 3 次触发时**降级为 L2**，日志可见
- [ ] L4 音效每局不超过 4 次
- [ ] **听牌时**（`shanten <= 0`）**无 L2**；但 `better`（尤其 `worse-shanten`）**仍触发 L3**
- [ ] 刷新页面局预算归零（预算是 per-hand，不进 localStorage）

> ### 🔴 v3 裁决 · 听牌时到底静不静（原 P1-11）
>
> 原规则自相矛盾：L2 的触发条件是"`better` **或**连续 3 次 `best`"，而情绪曲线又写"听牌时教练沉默（除 L1）"。
>
> **冲突场景**：玩家已听牌，却打出一张**拆听**的牌（`better` + `worse-shanten`）——**这是整局最该提醒的一手，原规则却要求闭嘴。**
>
> | 听牌时的情形 | 原规则 | **v3 裁决** |
> |---|---|---|
> | 连续 3 次 `best`（表扬） | 被沉默 ✅ 合理 | **仍沉默**（不表扬） |
> | `better` + 拆听（`worse-shanten`） | 被沉默 ❌ **有害** | 🔴 **出 L3** |
> | 玩家点 Ask | 出 L3 | **照常**（主动问，不受沉默约束） |
>
> **理由**：沉默的目的是"不在高压时刻**打扰**"。而"一手打丢听牌"不是打扰，是**救火**。把表扬和救火塞进同一条规则，等于为了安静而放弃教学。
> **代价吸收**：听牌阶段的这次 L3 **消耗已有的自动 L3 预算**（每局 2 次），⛔ 不新增预算项——否则总量失控。

**commit**
```
feat(coach): add five-level feedback with per-hand attention budget
feat(coach): add L1 always-on marker so silence stays distinguishable
```

---

#### B3 · 三档重命名 + `live` 收紧 + Ask 常驻

| 字段 | 内容 |
|---|---|
| **目标** | ① 止住 `live` 档的"学习泄漏" ② 把技术参数改成玩家能读懂的玩法 |
| **依赖** | B1（可独立上线：B3 的删除部分不依赖 B1） |
| **文件** | `components/games/table/CoachControls.tsx`、`messages/*.json`、`components/games/MahjongTable.tsx` |
| **锚点** | 搜 `coachIntensity === 'live'`、搜 `rankDiscards(state, HUMAN)`、搜 `t('coachSilent')`；`CoachControls.tsx` 三档 `silent \| ask \| live` |

**3-1 三档改名（不改类型，只改呈现）**

| 值 | 新名 | 玩法定位 | 反馈形态 |
|---|---|---|---|
| `silent` | **Zen / 禅** | 独立打牌，教练离席 | 无（连 L1 都没有） |
| `ask` | **Review / 复盘**（默认） | 我出牌，事后我想知道 | L1 常驻；按 Ask → L3 卡 |
| `live` | **Partner / 陪练** | 有人全程陪着我 | L1 + 自动 L2/L3（受预算约束） |

> **为什么必须改名**：`silent / ask / live` 是**技术参数**（静默/询问/实时），玩家无法推出"我要什么体验"。
> **禅不是"关闭功能"**：它应该是"我想安静练手"——一种**被认可的打法**。给它成就价值（`zen-10`），沉默就有了游戏意义。

> ### 🔴 v3 澄清 · "教练不在"有**三种**，别混（原 P1-10）
>
> 全文有四处描述"教练不存在"，它们**不是同一个状态**。原稿三处互相矛盾，实现者无法判断教练席组件到底渲不渲染：
>
> | 状态 | 触发条件 | 教练席组件 | 牌桌宽度 | "查看牌型说明"入口 |
> |---|---|---|---|---|
> | **`silent`（禅）** | 玩家主动选禅档 | 🚫 **不渲染（离席）** | **980**（恢复满宽，牌变大） | **牌桌内独立按钮** |
> | **`unsupported`（watching）** | 川/台/立直/国标能力不足 | ✅ **在场**，眨眼点头，不评价 | 1160（教练席占宽） | 教练席内 |
> | **`absent`（D3 演出态）** | 禅档下的演出层状态 | 同 `silent`，不播任何帧 | 980 | 同上 |
>
> **三条裁决**（实现直接照此做）：
> 1. **禅档 = 离席**。教练席**整个不渲染**，牌桌 `designWidth={980}`（§D1 的"恢复满宽"因此成立）。
> 2. **`unsupported` = 在场 `watching`**。教练席**照常渲染**（§4.3 的 `watching` 定义成立），只是不出 grade。
> 3. 🔴 **无教练时的静态入口必须挂在牌桌自己身上**，⛔ 不能挂在教练席里 —— 禅档下教练席根本不存在，挂在里面等于**入口随教练一起消失**（§E2-D7 的"保留玩家获取信息的权利"就落空了）。

**3-2 `live` 档出牌前收紧（🔴 修改已拍板项，必须做）**

现状：`live` 档**出牌前**就显示 `rankDiscards()[0].tile`，等于**直接给答案**。
同时牌桌**已有一个独立的 `hints` 开关**，显示的正是 `shanten` / `waits`——两者功能重叠。

```tsx
// 现状：出牌前把最优牌名摊开
{(coachIntensity === 'live' || coachAsked) && myTurn && (() => {
  const best = rankDiscards(state, HUMAN)[0];
  …
  {tileFace(best.tile)}          // 🔴 删掉这一行
})()}
```

改为**零数字**：

```tsx
// 修正后：出牌前不显示任何数字，仅头像微光呼吸（存在性暗示，不是信息）
{(coachIntensity === 'live' || coachAsked) && myTurn && (
  <CoachStage mood="thinking" reducedMotion={prefersReducedMotion} />
)}
```

| | 原方案 | **修正方案** |
|---|---|---|
| 出牌前 | 显示 `shanten` / `ukeire` / `waits` 数字 | **零数字**，仅头像微光（存在性暗示） |
| 点击后 | — | L3 卡给**方向性引导**："这张可以考虑一下——你有更宽的进张"（**连牌名都不给**） |
| 数字归属 | 教练面板 | **完全交还 `hints`**（那是信息工具，不是"人"） |

> ⚠️ `best.ukeire`（进张数）**也要一起拿掉**——进张数配合"打哪张"等价于泄露答案。

**3-3 `Ask` 按钮常驻**

现状 `Ask` 只在 `intensity === 'ask'` 渲染。**改为常驻**——"我想问"是玩家的权利，不是某个模式的属性。

**验收**
- [ ] `live` 档下牌桌**任何位置都不出现具体牌名建议**
- [ ] 出牌后仍给完整解释（走 B1）
- [ ] 三档名称在 UI 显示为 禅 / 复盘 / 陪练
- [ ] Ask 按钮在三种档位下都可见
- [ ] UI 加一行说明："难度管对手强度，教练管反馈密度"

**commit**
```
refactor(coach): rename intensity modes to Zen/Review/Partner
fix(coach): stop revealing the best tile before the discard in live mode
feat(coach): make the Ask button always available
```

**回滚**：3-2 是"删一行 + 加一个示意"，回滚成本极低。

---

### Phase C — 每日一题与外链工具

---

#### C1 · streak 完成条件修正（**1 行 + 3 条文案**）

| 字段 | 内容 |
|---|---|
| **目标** | streak 与运气脱钩。**技术好的人不该因 AI 自摸而断 streak** |
| **依赖** | 无（最小改动，可最先上） |
| **文件** | `components/HomeDailyHand.tsx`、`messages/{en,zh,zh-TW}.json` |
| **锚点** | 搜 `if (!info.won \|\| !dateKey) return;`、搜 `dailyHand.subtitle` |

```ts
// 现状 —— 这一行让 streak 由运气决定
const onHandOver = (info: { won: boolean; discards: number }) => {
  setResult(info);
  if (!info.won || !dateKey) return;   // 🔴
  …
```

```ts
// 修正 —— 完成即续（和牌或流局都算）
const onHandOver = (info: { won: boolean; discards: number }) => {
  setResult(info);
  if (!dateKey) return;                // ✅
  …
```

> **rationale**：**streak 的功能是"行为习惯"，不是"技能门槛"。** 技能门槛应做进成就（`daily-seven` / `daily-thirty`）。把两者混在一起，两边都受损。`won` 保留用于额外正反馈（C2）。

**🔴 必须同批改文案**：`dailyHand.subtitle` 现为 *"…**Win the hand to keep the streak.** No account required."* 逻辑改了文案不改 = **文案在说谎**。

**验收**
- [ ] 打赢 / 打输 / 流局，**三种结局都续上 streak**
- [ ] 改系统时间不刷 streak
- [ ] **9 个 locale** 的 `subtitle` 都已改

**commit**：`fix(daily): count a finished hand as complete, not only a win`

---

#### C2 · 今日一题（两层结构）+ 分享卡

| 字段 | 内容 |
|---|---|
| **目标** | ① 30 秒可完成 ② 可分享（传播起点）③ 保留完整对局做深度 |
| **依赖** | C1 |
| **文件** | 新建 `lib/daily/puzzle.ts`、`lib/daily/score.ts`、`components/HomeDailyPuzzle.tsx`；改 `components/HomeDailyHand.tsx`、`messages/*.json` |
| **锚点** | 搜 `navigator.clipboard.writeText`、搜 `dailyHand.subtitle` |

**结构（首页每日区拆两层）**

```
首页每日区
├── 上层「今日一题」  ← 30 秒 · 单次决策 · 计 streak · 出分享卡
│     给固定局面的 14 张手牌，问「打哪张？」
└── 下层「今日一局」  ← 8–15 分钟 · 完整对局 · 可选 · 不计 streak
      即现有 HomeDailyHand 全量功能
```

> **两层共用同一份种子**（`dailySeed(utcDateString())`）→ 上层展示的正是下层那局的开局。玩家先花 30 秒答完，再打完整局时**会认出这个开局**——这是"**已知答案后亲身验证**"的学习闭环，零额外成本。

**🔑 技术简化：今日一题不需要 `DAILY_PUZZLES`，不需要服务端**

依据：`MahjongTable.tsx` 有 `const HUMAN: Seat = 0`（东家，**先手**）→ `createGame()` 返回 13 张 → `drawTile()` 一次即到 14 张决策点。

```ts
// lib/daily/puzzle.ts
import { createGame, drawTile, type GameState } from '@/lib/mahjong/engine';
import { judgeDiscard, type DiscardGrade } from '@/lib/mahjong/coach';

/**
 * Today's single-decision puzzle, derived from the same seed as the full hand.
 * Seat 0 is East and acts first, so the position is exactly two pure calls away
 * — no simulation, no bot moves, no server round-trip.
 */
export function todaysPuzzle(seed: number): GameState | null {
  const opened = drawTile(
    createGame({ ruleset: 'hongkong', humanSeat: 0, seed, hongKongMode: 'casual' })
  );
  return opened.players[0].hand.length === 14 ? opened : null;
}

export function scorePuzzleAnswer(state: GameState, tile: string): {
  grade: DiscardGrade; bestTile: string;
} {
  const { grade, best } = judgeDiscard(state, 0, tile as never);
  return { grade, bestTile: best.tile };
}
```

> ⚠️ **import 路径二义性**（`engine` 正在拆目录）：先看 §3 的 `git status`。若 `engine.ts` 未拆 → `from '@/lib/mahjong/engine'`；若已拆 → 同路径（index re-export）或 `from '@/lib/mahjong/engine/state'`。

**玩法归属：港式休闲（不是立直）**

| 玩法 | "最优切牌"是否唯一 | 结论 |
|---|---|---|
| **港麻休闲**（有鸡胡） | ✅ **是**——不需凑役种，纯效率最优 → `ukeire` 是唯一权威答案，评分可比 | ✅ **首发** |
| 立直 | ⚠️ 否——为凑役可**合法牺牲效率**，"最优"有前提 | 第二阶段（进阶题） |

且港麻与线上零冲突：`HomeDailyHand` 已传 `lockRuleset`，`defaultRuleset='hongkong'` + `hongKongMode='casual'` → **保持一致才是零改动路径**。

**分享卡（`lib/daily/score.ts`）**

```ts
import type { DiscardGrade } from '@/lib/mahjong/coach';

export interface DailyScore {
  decisions: number;
  grades: DiscardGrade[];
  best: number; acceptable: number; better: number;
  accuracy: number;              // 0-100, best=1 / acceptable=0.5
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  bestStreak: number;
  discards: number;
}

const WEIGHT: Record<DiscardGrade, number> = { best: 1, acceptable: 0.5, better: 0 };

export function computeScore(grades: DiscardGrade[], discards: number): DailyScore {
  const n = grades.length;
  const best = grades.filter((g) => g === 'best').length;
  const acceptable = grades.filter((g) => g === 'acceptable').length;
  const better = grades.filter((g) => g === 'better').length;
  const accuracy = n === 0 ? 0 : Math.round((grades.reduce((s, g) => s + WEIGHT[g], 0) / n) * 100);
  let bestStreak = 0, run = 0;
  for (const g of grades) { run = g === 'best' ? run + 1 : 0; bestStreak = Math.max(bestStreak, run); }
  return { decisions: n, grades, best, acceptable, better, accuracy, bestStreak, discards,
           grade: gradeAccuracy(accuracy) };
}

export function gradeAccuracy(accuracy: number): DailyScore['grade'] {
  if (accuracy >= 95) return 'S';
  if (accuracy >= 85) return 'A';
  if (accuracy >= 70) return 'B';
  if (accuracy >= 50) return 'C';
  return 'D';
}

const BLOCK: Record<DiscardGrade, string> = { best: '🟢', acceptable: '🟡', better: '🟠' };

/** ⛔ emoji, never images — images get flattened into thumbnails on social platforms. */
export function buildShareCard(opts: {
  score: DailyScore; streak: number; dateKey: string; rulesLabel: string; url: string;
}): string {
  const { score, streak, dateKey, rulesLabel, url } = opts;
  const lines: string[] = [];
  for (let i = 0; i < score.grades.length; i += 8) {
    lines.push(score.grades.slice(i, i + 8).map((g) => BLOCK[g]).join(''));
  }
  return [
    `🀄 ${rulesLabel} · ${dateKey}`,
    `${score.grade} · ${score.accuracy}%`,
    '',
    ...lines,
    '',
    `${streak}🔥 · ${url}`
  ].join('\n');
}
```

**单决策分享卡形态**（只有一手，方块矩阵无意义）：
```
🀄 Mahjong Daily · 2026-09-14
Hong Kong · opening discard
🟢
3🔥 · mahjonggame.org
```

| 元素 | 作用 |
|---|---|
| 🟢🟡 逐手色块 | 一眼可比、零剧透（借鉴 Wordle，**已被证明有效**） |
| `A · 85%` | 可量化锚点（单看方块不知好坏） |
| **emoji 而非图片** | 图片在社交平台会被压成缩略图；emoji 是纯文本，**能贴进任何地方** |
| URL | **外链传播的落点** |

**⛔ 色块必须不剧透**：不出现最优牌名、不出现手牌。

**验收清单**
- [ ] 今日一题：答完 **30 秒内**出评级 + 解释 + 可复制分享卡
- [ ] 分享卡是**纯文本 emoji**，粘贴到微信 / Discord / X 不变形
- [ ] **色块不剧透**
- [ ] 今日一题与今日一局**种子一致**（同一开局）
- [ ] 首页仍 `force-static`：所有计算在 `useEffect` / `useMemo`（客户端），⛔ 不在 RSC 里算
- [ ] 首页仍只有**一个 `<h1>`**（另一层降为 `<h2>`，与 i18n 文案表一致）

**commit**
```
feat(daily): add score model and emoji share card generator
feat(daily): add 30-second daily puzzle derived from the same seed
i18n(daily): add puzzle and full-hand copy
```

**回滚**：拆两个 commit——① 完成条件 + 文案（可独立回滚）② 今日一题 + 分享卡（回滚 = 删组件 + 还原首页区块）。

---

#### C3 · 听牌计算器 `/tools/waits`（**第一个外链磁铁**）

| 字段 | 内容 |
|---|---|
| **目标** | 上线可被论坛引用的工具页。**平均排名 42.4 位的唯一解药是外链** |
| **依赖** | A2（`coach.ts` 导出本来就够，故可早于 B 上线） |
| **文件** | 新建 `app/[locale]/(public)/tools/waits/page.tsx`、`components/tools/WaitsCalculator.tsx`、`components/tools/ToolsShell.tsx`；改 `app/sitemap.ts`、`messages/*.json` |

**⚠️ 页面渲染模式与首页相反**：必须**动态**（读 `?h=`）。⛔ 不要写 `force-static`。

| 页面 | 索引策略 |
|---|---|
| `/tools/waits`（无参数） | **可索引** |
| `/tools/waits?h=…` | `robots: { index: false, follow: true }` |

> 既要能被分享，又不让搜索引擎吞掉几千个变体。

**核心逻辑（零新算法）**

| 展示 | 用哪个导出 |
|---|---|
| 每行：牌名 / 向听 / 进张数 | `rankDiscards(state, 0)` → `{ tile, shanten, ukeire }` |
| "第 0 项 = 最优" | `ranked[0]` |
| "该牌还剩 N 枚" | `unseenCounts(state, seat)` ⚠️ **不是 `unrankedCounts`（该名不存在）** |
| 单张进张明细（可选） | `acceptance(state, seat, hand, melds)` |

**可分享 URL 编码**
```
/tools/waits?h=123456789m123p11z&r=hongkong
```
| 参数 | 格式 |
|---|---|
| `h` | `{ranks}{suit}…`，`m`=Crak 萬 / `p`=Dot 筒 / `s`=Bam 条 / `z`=字牌 |
| `r` | `hongkong \| riichi \| chinese-official` |

**⛔ 四条硬约束**
1. 工具页必须用 **`portal-*` 令牌类**，零硬编码色值（否则 6 套主题失效）
2. **必须显示诚实声明**：*"This tool covers the common patterns. It is not a tournament scorer — always defer to your club's rules."*（E-E-A-T 加分，比假装权威有效）
3. 🔴 **v3 新增 —— `r=riichi` / `r=chinese-official` 时必须追加第二行声明**：*"Ranking is by tile efficiency only. Yaku / fan requirements are NOT checked."*
   **为什么**：教练对这两个玩法是 `partial`（不校验役种门槛）。**同一个站、同一手牌，工具页说"这是最优"，牌桌教练却附限定语** —— 玩家若不理解区别，会认定系统自相矛盾，A1 止血建立的诚实性直接归零。声明的作用是让两者**立场一致**：工具页的"最优"只在效率维度成立。
   ⛔ 这句不是免责套话，是**产品一致性要求**。
4. `tools` ns **3 个 locale 齐**（`en` / `zh` / `zh-TW`），否则该语种整页 500

**验收清单**
- [ ] `/en/tools/waits` 返回 200，**HTML 里没有 `noindex`**
- [ ] `/en/tools/waits?h=…` 返回 200，**HTML 里有 `noindex, follow`**
- [ ] 6 套主题下配色跟随
- [ ] **全部 9 个 locale 无 `MISSING_MESSAGE`**
- [ ] 复制 URL → 新标签打开 → **牌局完全一致**
- [ ] sitemap 出现 `/tools/waits`（3 语各 1 条），总条数 87 → **90**
- [ ] **与牌桌内教练面板对同一手牌给出相同最优牌**（同源验证）

**commit**
```
feat(tools): add wait finder page backed by rankDiscards()
feat(tools): add shareable ?h= hand encoding with noindex variants
i18n(tools): add tools namespace (en/zh/zh-TW)
```

---

#### C4 · 算番器 `/tools/scorer` + 番种速查 `/tools/patterns`（W3）

| 字段 | 内容 |
|---|---|
| **依赖** | C3（复用 `ToolsShell` 与 `tools` ns） |

**算番器输入方式**：**点击式选牌**（`123m456p789s11z` 文本对欧美用户不友好）+ 单行文本只读同步显示（用于分享 URL）。⛔ 不做截图识别（成本高、准确率风险）。

**输出三层（第 3 层才是差异化）**
```
第 1 层：总分     4 Fan · 320 points
第 2 层：逐番拆解  Half Flush +3 / Dragon Triplet +1 / 合计 4
第 3 层：为什么    "你的牌只有 Dot 和 Dragons，没有 Bam 和 Crak → Half Flush"
```
第 3 层 = `explainPatterns()`（与 `explainDiscard()` 同思路：返回语义码，渲染层措辞）。

**番种速查**：**一页 + 可搜索，⛔ 不拆 122 个 URL**（薄页互稀释权重，与 glossary 38 条同理）。按档位分组 + **显示三玩法对照列**（竞品没有）。

**🔴 Amazon 红线**：联盟链接**禁止**放进 PDF / 印刷品 / 邮件。
- ✅ HTML 工具页**可以**带联盟链接
- ❌ 可打印速查卡的 **PDF 版本绝对不能**带

> 这条约束反过来证明**做 HTML 工具页而非 PDF** 是唯一正确选择。

---

### Phase D — 第五角色（位置 + 演出）

---

#### D1 · `<CoachRail>` 教练席（牌桌右侧独立列）

| 字段 | 内容 |
|---|---|
| **目标** | 教练**不在牌桌上**——这个区别必须靠**结构**，不靠美术风格暗示 |
| **依赖** | B1（反馈卡要挂进列里） |
| **文件** | 新建 `components/games/table/CoachRail.tsx`；改 `components/games/HongKongTable.tsx`（shell 改双列） |

**为什么必须独立成列（实测证伪过程）**

牌桌设计稿 980×720。实测右下角真实可用垂直区间 = 右暗牌底边 `y=460` → 手牌顶 `y=610` = **只有 150px**，而能看清手势的立绘至少需 **320 高**。
→ **桌内无解**，除非压成 160×140 的小图标——那就又变回 widget 了。

```
┌─ shell（designWidth 980 → 1160）────────────────┐
│ toolbar                                          │
│ ┌─ board 980×720 ──────────┐ ┌─ coach rail 180 ─┐ │
│ │  （布局百分比完全不动）   │ │   立绘 160×320   │ │
│ │                          │ │   气泡 / L3 卡   │ │
│ └──────────────────────────┘ └──────────────────┘ │
│ footer                                            │
└───────────────────────────────────────────────────┘
```

**三重收益**

| # | 收益 |
|---|---|
| 1 | **语义是结构的**，不靠裁切视觉技巧——他真的不在桌上 |
| 2 | 有 720px 整列 → 可画**全身立绘 160×320**，手势有空间 |
| 3 | **L3 卡零遮挡**——此前 L3 卡浮在牌桌上必然盖住牌河与中央块，这个矛盾消失 |

**缩放代价（实测公式）**

`hooks/use-board-scale.ts` → `setScale(Math.min(1, width / designWidth))`，**上限 1、永不放大**。

| 容器宽 | 现状 980 | **+180 列 (1160)** |
|---|---|---|
| 1200 | 1.00 | **1.00（零代价）** |
| 1100 | 1.00 | 0.948（−5.2%） |
| 1000（最小 lg） | 1.00 | **0.862（−13.8%）** |

> 容器 ≥ designWidth 时**零代价**；港式桌本来是 `hidden lg:block`，所以最差情况是 1000px 时牌缩 14%。

**⚡ 抵消代价的关键设计：教练离席 → 牌桌变宽**

`designWidth` 是 `BoardScaleFrame` 的 **prop**，`useBoardScale` 的 `useEffect` 依赖它 → **运行时动态改可行**。

| 教练状态 | designWidth | 效果 |
|---|---|---|
| 在场（默认） | 1160 | 牌桌略小，教练在 |
| **离席（禅模式）** | **980** | **牌桌恢复满宽**。⚠️ 尺寸增幅**以 §D1 v2 补充块的 `xl`→`lg` 为准**（P-7）——"变大 14%"是纯缩放理论值，受手牌宽度上限约束，照字面做会溢出 |

**这让"请教练离席"从关开关变成一个有回报的选择。** 禅模式因此不再是"关掉一个功能"，而是"选一种玩法"——这正是 `zen-10` 成就成立的前提。

**六项视觉区分（给美术的硬约束）**

| 维度 | 3 个 AI 配练 | 教练 |
|---|---|---|
| **形态** | 56px 圆角方块头像框（`rounded-xl border-4 bg-[#f7f1df]`） | **160×320 全身立绘，无边框** |
| **位置语言** | 四边围坐轴线 | **右侧独立列，不在座位轴上** |
| **视线** | 正视牌桌中心 | **斜下 15–20°，朝向你的手牌** |
| **活跃标识** | 轮到他 → `border-yellow-300` | 🔴 **禁用黄框**，用冷色 teal 微光（`box-shadow`） |
| **称呼** | 风位 / P1–P3 | 具名 `Sen` |
| **分数** | 有 `G` + 分数条 | **无分数**（P1 的视觉证明——他不下场） |

**其他约束**
- 触控热区**只有头部 + 气泡可点**（约 96×96），不是整个立绘。`scale=0.862` 时 ≈83×83 → **满足 44px**（牌桌按钮在 scale 0.7 时只有 30.8px，教练不能重蹈覆辙）
- 立绘锚点：列宽 180、立绘 160（左右各 10）；底部对齐 `y=660`；**头部中心约 `y=380`**（与中央块略低、与手牌同侧偏高 → 视线自然落左下）；气泡挂**左侧**（朝向牌桌），L3 卡挂**上方**
- `ai-avatars-default.webp` 是 **2×2 = 4 格、已被 4 座位占满**（`DEFAULT_PORTRAIT_BY_SEAT`）→ **无第 5 格**，教练必须**独立资产文件**

> ### 🔴 v2 补充 · D1 开工前必须先清掉两个已实证的坑
>
> **坑 1（P-7 · 手牌溢出）—— 前版判断有根本误判，必须改尺寸**
>
> 前版写 `14 × 68.6px ≈ 960px vs 980 板宽`，对策"补偿封顶 `1.15`"。**实测**：
>
> ```
> xl 牌面宽        = 4.25rem × 16 = 68px
> 14 张手牌        = 14 × 68 + 13 × 2(gap) = 978px
> 板宽             = 980px
> 剩余             = 2px                  ← 几乎为零
>
> 开启"大牌面"后   = 978 × 1.1  = 1075.8px → 溢出 95.8px（被 overflow-hidden 硬切）
> 按前版"封顶 1.15" = 978 × 1.15 = 1124.7px → 溢出 144.7px  ← ⛔ 比原本更严重
> ```
>
> → **问题不在补偿倍率，在 `xl` 尺寸本身已占满板宽 99.8%。倍率无论怎么调都救不了。**
> → **唯一解：手牌 `xl` 改 `lg`（`h-[4.5rem] w-14` = 56px）→ 14 张 = 812px，留 168px 余量。**
> 📌 同时须修 §9 风险 14 的对策（前版写的"补偿封顶 1.15"是错的）。
>
> **坑 2（P-6 · 教练浮层与 `DiscardPool` 重叠）—— 只要旧代码还在，风险就在**
>
> `components/games/HongKongTable.tsx:210`：
> ```tsx
> {coach && <div className="absolute left-3 top-14 z-40 max-w-sm">{coach}</div>}
> ```
> 浮层 `top-14` = **56px**，toolbar 高 `h-11` = **44px** → **浮层起点紧贴 toolbar 下沿，与 `DiscardPool` 上方排布必然相撞**。
> → **D1 拆双列时必须顺手改成：`watching` 态不渲染该浮层**（教练席已接管展示，旧浮层应整体废弃）。
> ⚠️ 不要因为"新方案已规避"就保留这段代码 —— 它是可复现的重叠源。

**验收**
- [ ] `BoardScaleFrame designWidth={coachPresent ? 1160 : 980}` 生效；切禅档时牌桌**平滑变宽**（列宽 `width` 260ms 过渡）
- [ ] board 内**所有百分比布局零回归**（对拍改动前后的 6 张截图）
- [ ] 教练不在 `BoardScaleFrame` 的缩放容器内（现在浮层与牌桌缩放脱节）
- [ ] L3 卡挂在教练席内 → **不遮挡牌河**
- [ ] 大屏（≥1160 容器）**牌桌尺寸与改动前一致**

**commit**
```
refactor(table): split HongKongTable shell into board + coach rail
feat(coach): widen the board when the coach steps away
```

**回滚**：shell 双列 + 一个新组件，`git revert` 后布局回到单列。

---

#### D2 · `<CoachStage>` 序列帧演出层

| 字段 | 内容 |
|---|---|
| **目标** | 教练"活了"——而且**不引入任何依赖** |
| **依赖** | D1 |
| **文件** | 新建 `components/games/table/CoachStage.tsx`、`features/table/coach-stage.ts`；改 `features/table/coach-prefs.ts`、`features/table/sound.ts`、`app/globals.css` |

**技术选型：序列帧 + Web Animations API**

| | **① 序列帧 + WAAPI** ✅ | ② Lottie | ③ Cocos 运行时 |
|---|---|---|---|
| 新增运行时 | **0 KB** | ~250 KB gzip | 3–8 MB + 第二个 WebGL |
| PS 直接产出 | ✅ | ⚠️ 需 AE | ⚠️ 需导入 |
| **可可靠中断** | ✅ `cancel()` / `finished` | ✅ | ✅ |
| 可访问性 | ✅ 纯装饰 | ✅ | ❌ canvas 读屏不可见 |
| 与现有 sprite 机制 | ✅ 同源 | ❌ | ❌ |

> **决定性理由不是体积，是两点**：① 它与站里已在跑的机制同源（`DefaultPlayerPortrait` 已在用 `left: ${-column*100}%` 切 2×2 sprite）；② **WAAPI 能 `cancel()`，CSS 的 `steps()` 不能**——教练的状态切换是**抢占式**的（idle 播到一半玩家出牌，要立刻切 note，硬切会闪回第 0 帧）。

**🔑 Cocos 的正确位置：生产工具，不是页面运行时**

```
Cocos Creator（骨骼动画 / 时间轴）
   │ 导出 → 逐帧 PNG
   ▼
Python 拼 sprite sheet（复用 美术生产工具/pipeline_run.py → emit_coach.py）
   ▼
public/images/coach/*.webp
   ▼
React <CoachStage> 播放
```

> **Cocos 应该在构建时运行，不应该在用户浏览器里运行。** 这既吃到 Cocos 产能，又绕开"Connect 通路未跑通"这个未验收的地基。

**分层：把帧数从 44 降到 14（本方案最省钱的一招）**

| 层 | 内容 | 帧数 | 单帧（设计稿） | 导出 1.5× |
|---|---|---|---|---|
| 躯干 | 全身静态 | **1** | 160×320 | 240×480 |
| 头 | 眨眼 / 微表情 | **7** | 96×96 | 144×144 |
| 手 | 6 种手势 | **6** | 160×120 | 240×180 |

```
head.webp  : 7 帧横排 = 1008 × 144  ≈ 22 KB
hands.webp : 6 帧横排 = 1440 × 180  ≈ 26 KB
body.webp  : 1 帧     =  240 × 480  ≈ 12 KB
                          合计 ≈ 60 KB（不分层 44 帧约 150–250 KB）
```

> 🔑 **呼吸不要做成帧。** 躯干 `transform: scaleY(1 → 1.016)` + `translateY(0 → -2.5px)` 用 CSS 做——**0 帧成本**，且天然支持 `prefers-reduced-motion`。

**组件骨架**

```tsx
// components/games/table/CoachStage.tsx
type CoachMood = 'idle' | 'thinking' | 'note' | 'ack' | 'explain' | 'absent';

interface CoachStageProps {
  mood: CoachMood;
  onOneShotDone?: () => void;   // 一次性动画播完的回调
  reducedMotion?: boolean;      // 只切静态帧，不播循环
  size?: number;
}
```

序列帧必须配 `steps(N, end)` 缓动，否则会线性插值成"滑动"：

```ts
el.animate(
  [{ backgroundPositionX: '0px' }, { backgroundPositionX: `-${frameW * N}px` }],
  { duration: N / fps * 1000, easing: `steps(${N}, end)`, iterations: Infinity }
);
```

**优先级仲裁（否则动画会打架）**

| 优先级 | 状态 | 行为 |
|---|---|---|
| 5 | `absent` | 禅模式，切断一切（连 idle 都不播）。⚠️ 禅档下**教练席整个不渲染**，故此态实际不可观察（见 §B3 v3 澄清）；保留它是为未来的临时隐身需求（如移动端 drawer 打开时） |
| 4 | `explain` | L3 卡打开期间保持；卡片关闭即释放 |
| 3 | `note` | 一次性，**抢占** idle/thinking，播完回 idle |
| 2 | `ack` | 一次性，同 note；与 note 互斥（取先到者） |
| 1 | `thinking` | 你的回合且停留 >1200ms |
| 0 | `idle` | 默认兜底 |

**三条仲裁规则**
1. **一次性动画不可打断一次性动画**（note 播完前收到 ack → 排队，避免"抽搐"）
2. **同局预算优先于动画**——L4 预算耗尽时 `note` 根本不触发。**动画层不自己做预算，只消费仲裁结果**
3. **状态冻结快照**——`explain` 期间玩家继续出牌，教练**不切换**（与 L3 卡内容冻结同步）

**音效（零素材成本）**

`features/table/sound.ts` 是 Web Audio 程序化合成（`tone(freq, start, duration, gain, type)` 振荡器）。

| 事件 | 音效 | 合成 |
|---|---|---|
| L3 **自动**展开 | **新增 `coach-note`** | `520Hz` + `660Hz` sine，各 40ms，gain `.03` → "旁边有人轻敲了一下桌面" |
| 连续 3 次 best | **新增 `coach-ack`** | `784Hz` triangle，90ms |
| L1 记号 | **无声** | 避免噪音 |
| 任何"错误类" | **无音效** | 🔴 红线 |

实现 = `MahjongSound` 联合类型加 **2 个字面量 + 2 个 `case`**。必须走现有 `soundEnabled` 开关。

**⛔ 不做的事**

| 不做 | 理由 |
|---|---|
| **配音 / TTS** | 与"稀缺性"直接冲突（声音是最强打断），TTS 音质与人格背道而驰 |
| **口型动画** | 无配音却做口型 = 恐怖谷 |
| 给教练分数条 | 违反 P1（他不下场） |

**分阶段（可以先上线 C0，当天可见）**

| 阶段 | 内容 | 依赖 |
|---|---|---|
| **C0** | 三张静态图 + `<CoachStage>` 只切不播 | 无（**可以今天做**） |
| **C1** | idle 呼吸（CSS）+ 眨眼 3 帧 + WAAPI 驱动器 | C0 |
| **C2** | note / ack 一次性动画 + 两个音效 | C1 + B1 |
| **C3** | thinking / explain / absent + 优先级仲裁 | C2 |
| **C4** | 手势层、道场色带徽章 | C3 + 生涯统计 |

> **美术出来之前**：先做 **SVG 占位教练形象**，让整条管线（位置、裁切、气泡挂点、列宽联动）先跑通。

**验收**
- [ ] `CoachStage` 在 `prefers-reduced-motion` 下**只切静态帧**（气泡仍出现，只是不动）
- [ ] 抢占切换**不闪回第 0 帧**
- [ ] 三层合并体积 **≤ 180 KB**（超了先降 q80→72，再砍帧）
- [ ] 音效走 `soundEnabled`；L1 无声
- [ ] 新增音效只改了联合类型 + `case`（**没有新的音频素材文件**）

---

#### D3 · 状态机与交互时序（挂进 `CoachPanel` / `CoachStage`）

**8 状态**

```
Idle(观察中) → Signaling(L1) → Speaking(L2) → Explaining(L3) → Acting(CTA)
Beckoning(出牌前示意) → Explaining
Onboarding(首次引导)
Interrupted(出牌后卡片仍开着)
```

> ### ⚠️ 最易做错的状态：`Interrupted`
> **玩家可以在卡片开着时继续出牌。** 此时卡片**不关闭、不更新**——内容**冻结在触发它的那一巡**。
> 理由：若卡片跟随牌局实时更新，玩家读到一半发现"这句话变了"，**信任就没了**。冻结 + 不关闭，玩家自己决定何时关。

**时序常量（落成 `const COACH_TIMING`）**

| 事件 | 延迟 | 动画 |
|---|---|---|
| 出牌 → L1 记号 | **500ms** | `opacity 0→1` 150ms ease-out（先让牌落定，别抢注意力） |
| L1 记号 | — | **常驻不移除**（保证"沉默可区分"） |
| L2 chip 自动降级 | **4000ms** | `opacity 1→0.55` + 高度收缩（**不消失，只是变小**） |
| L3 卡出现 | 0（接在 L2 上） | `translateY(-4px)→0` + opacity 180ms |
| L3 卡关闭 | — | **仅由用户触发**（× / 再点 chip / 出下一手） |
| 出牌前示意（陪练档） | 停留 **>1200ms** | 头像 `opacity .45→1` + 呼吸（**响应式，不是常驻**） |
| 数字变化 | — | **600ms** 数字滚动（全站唯一"爽点"） |
| 局末总结卡 | 结算后 **800ms** | 与现有 `ResultBanner` 队列错开 |
| `prefers-reduced-motion` | — | **全部降级为即时切换**（含数字滚动） |

**输入路径**

| 输入 | 行为 |
|---|---|
| 鼠标 | 点击 L1 记号 / L2 chip → 展开；× 关闭 |
| 键盘 | `?` = Ask；`Esc` 关闭卡；卡内 `Tab`：关闭 → 主 CTA → 次 CTA |
| 触屏 | L1 记号触控目标 ≥ 44px（视觉仍是 8px 圆点，透明 padding 撑开） |
| 读屏 | L2 = `role="status"` + `aria-live="polite"`；L3 带 `aria-expanded`；**不用 `assertive`** |

**焦点管理**：L3 展开**不抢焦点**（不调 `focus()`）；仅键盘 `Esc` 关闭时把焦点还给触发元素。

**首次引导（一句话，仅一次）**

> *"这是你的陪练。它会在关键处提醒你，其余时候看着。（可随时在设置里关掉）"*

localStorage key 沿用 `mahjong-hub.coach-onboarded.v1`。
**目的**：让"教练会沉默"这件事**在首次就被解释**，否则玩家会以为这是 bug。

**局末总结卡（新增，此前完全缺失）**

```
┌────────────────────────────────────┐
│  这局教练看完了                       │
│       B+     78% 最佳决策            │
│  ●●●○● ●●●○● ●●● ○●              │  ← 形状：●最佳/◍可接受/○有更优
│  ⚑ 第 7 巡                           │
│    打 7 Dot 比 3 Dot 少 5 张进张       │
│  [ 回看第 7 巡 ]   [ 再来一局 ]        │
└────────────────────────────────────┘
```

> 🔑 **只标 1 个失误**：**列出全部失误 = 羞辱；只列 1 个 = 训练提示。** 这是"教练"与"成绩单"的区别。
> 挑选标准 = **「最有教育价值」而非「最严重」**：优先选 `ukeireGap` 最大且该巡正确答案有明确原理可讲的那一手。
> **逐巡块用形状不用颜色**（`●◍○`），色盲可读。

**🔴 v2 补充：局末总结是「反馈预算的例外」，必须给足内容清单**

局中预算（L3 ≤2 次/局）是为**不打断牌局节奏**；**局末无节奏可破坏 → 预算解除**。若不这样处理，教练永远讲不清任何事，玩家会体感"教练没在看"（风险 22）。

| 局末输出 | 内容 | 来源（全部已有，零新算法） |
|---|---|---|
| **本局最佳率** | `78% 最佳` | `grades` 统计 |
| **最有价值的一手** | 高亮 `ukeireGap` 最大的那次 `best` | `rankDiscards` |
| **最该改的一手** | 高亮 `ukeireGap ≤ -4` 的那次（**只列 1 条**） | `explainDiscard` |
| **番种收获** | 本局新见的 `patterns[]` | `ScoreResult` |

> ⛔ **不要靠调高 L3 预算来解决"教练太安静"** —— 预算 2 次/局的理由（"超过后就变成批改作业"）是对的。缺的是这个清单。
> 📌 局末与局中互补：**局中稀缺 / 局末充分**，二者不矛盾。
>
> **局末亮牌是红线 5 的唯一例外，但必须显式声明**：首次在局末评论对家手牌时，加一句固定声明 —— *"牌已经亮开了，我才能讲这些 —— 局中我看不到对家的牌。"* **把红线转成信任资产**：主动交代知识边界，而不是等玩家怀疑。

---

### Phase E — 结算复盘

---

#### E1 · `ScoreResult` 扩展（**纯增量**）

| 字段 | 内容 |
|---|---|
| **目标** | 把 `scoreHand()` 里**已经算出来但没返回**的东西带出来 |
| **依赖** | 无（可最先做） |
| **文件** | `lib/mahjong/scoring/types.ts`、`lib/mahjong/scoring/score-hand.ts` |
| **锚点** | 搜 `const sets = ruleset === 'riichi'`、搜 `return { grade`、搜 `fu` 的内联计算段 |

```ts
export interface ScoreResult {
  // —— 现有字段全部保留，不改动 ——
  total: number; qualifyingTotal?: number; patterns: ScorePattern[]; limit: boolean;
  legalYaku?: boolean; han?: number; fu?: number; points?: number;
  paymentLabel?: string; yakumanCount?: number;

  // —— 新增：全部可选，避免影响现有 5 处调用点 ——
  /** A 层：和牌形分类 */
  handShape: 'standard' | 'sevenPairs' | 'thirteenOrphans';
  /** A 层：算番实际使用的那个分解。七对子/国士为 undefined */
  decomposition?: HandSet[];
  /** B 层：起胡门槛判定 */
  gate?: {
    kind: 'yaku' | 'minFan';
    required: number;   // yaku: 1 ; minFan: 8 / 3 / 1
    actual: number;
    passed: boolean;
    reasonKey?: 'noYaku' | 'belowMinimum' | 'flowersExcluded';
  };
  /** D 层：是否被封顶 */
  capped?: { from: number; to: number; capKey: 'hkFan' | 'riichiHan' | 'mcrNone' };
  /** C 层：立直符数明细 */
  fuBreakdown?: { labelKey: string; value: number }[];
  /** C 层：立直宝牌明细 */
  doraDetail?: { indicator: Tile; dora: Tile; hits: Tile[] }[];
}
```

**🔴 实现约束（红线 11 的落地）**
- `decomposition` **必须**取 `selectBestRiichiDecomposition` / `selectBestMcrDecomposition` **之后**的那个（港式用 `decompositions[0]`）。⛔ **绝对不要在 UI 侧调 `decomposeWin()` 重算**——那会得到"第一个 DFS 结果"而非"算番用的那个"，界面解释与算番不一致 = **信任立刻归零**。
- `HandSet.tile` 是**最低张**，UI 需 `expandSet(set) => Tile[]` 展开（run: r, r+1, r+2；triplet: ×3；pair: ×2）
- 七对子 / 国士：`decomposition = undefined`，靠 `handShape` 走专门渲染

**⚠️ 顺带处理一个英文泄漏点**：`MahjongTable.tsx` 里有一个**同名 `ResultBanner`**，用 `describeScore()`（**英文硬编码、不走 i18n**）。因 `:255` 对三种玩法提前 return，当前**不可达**——但将来新玩法走到那条分支会突然变英文。**建议一并删除或改走 `formatPatternList`。**

**验收**
- [ ] 现有 5 处 `ScoreResult` 调用点全部编译通过（新增字段全可选）
- [ ] **单测**：对同一手牌，`decomposition` 展开后与 `patterns` 的判定**一致**（针对立直/国标各一组会触发 `selectBest*` 的用例）
- [ ] `describeScore()` 未改动

---

#### E2 · 复盘面板（A 结构层 + B 门槛层）+ 没胡覆盖

| 字段 | 内容 |
|---|---|
| **依赖** | E1 |
| **文件** | 新建 `components/games/table/CoachReviewPanel.tsx`；改 `ScorePanel.tsx`（`ResultBanner`） |

**四层模型**

| 层 | 问题 | 答案形态 | 可验证性 | 现状 |
|---|---|---|---|---|
| **A 结构层** | 这手牌为什么是和牌形？ | 4 组 + 雀头的**可视化分解**（或七对子/国士） | **玩家能自己数** | ❌ 完全没有 |
| **B 门槛层** | 为什么允许我和？ | 立直：有役 / MCR：≥8 番（花牌不计）/ 港式：休闲 ≥1、标准 ≥3 | **引擎已判定** | ❌ 完全没有 |
| **C 番种层** | 值多少番？ | 番种清单 + **为什么成立** | 可查表 | ⚠️ 有名字无释义 |
| **D 点数层** | 为什么是这个点数？ | 换算式（番→底→支付） | 可推导 | ⚠️ 只有结果数字 |

**为什么必须分层**：① 学习价值不同（A 教新手"什么牌能胡"，C 教进阶"什么牌值钱"）② 可靠性不同（**C 层在区域桌不可信**）③ **没胡的时候，A 和 B 才是答案**。

**`capability` 在结算语境的复用**

| capability | 玩法 | A | B | C | D |
|---|---|---|---|---|---|
| `full` | 港式 | ✅ | ✅ | ✅ | ✅ |
| `partial` | **立直 / 国标** | ✅ | ⚠️ **门槛未校验**（教练已带此限定语，见 §1.3 v3 裁决） | ✅ | ✅ |
| `partial` | **美式** | ✅ 牌型匹配 | ✅ NMJL 卡片 | ⚠️ 卡片分值 | ✅ transfers |
| `unsupported` | 川 / 台 | ✅ | ⚠️ 待确认 | 🔴 **不给** | ✅ tai |

> ⚠️ **v3 更正**：原表把"立直/国标"并列在 `full` 行 —— 与 §1.3 覆盖矩阵矛盾（两者实为 `partial`，因为**没有役种/番种门槛校验**）。已在结算语境拆成独立行，因为**局末**这个缺陷的表现和局中不同：结构（A）与番种（C）**仍然可信**，只有门槛（B）需要标注"未校验"。

> **同一个字段，局中控制"判不判级"，局末控制"讲不讲番种"。** 区域桌可以诚实地说"结构是这样、值 3 台"，但不假装在做番种评价。

**八条设计决策**

| # | 决策 | 理由 |
|---|---|---|
| **D1** | **结算是反馈预算的例外** | 局中稀缺是因为打断会破坏节奏；局末无节奏可破坏。**局中稀缺、局末充分** |
| **D2** | 结构分解必须从 `scoreHand` 内部带出 | 红线 11 |
| **D3** | 用**证据模板**替代手写 107 条释义 | 见 E3 |
| **D4** | 必须覆盖"你为什么没胡" | 玩家输/流局次数远多于赢。**核心数据是 `coach.ts` 的 `shanten + waits`，不是 `ScoreResult`** |
| **D5** | 局末亮牌是 P2 红线的例外，但**必须显式声明** | 见下方 |
| **D6** | 入口在教练席，内容在复盘面板 | 180px 列装不下；教练**主动 offer**，不是系统弹窗 |
| **D7** | 禅档关闭"教练的打扰"，不关闭"玩家获取信息的权利" | 保留无教练人格的静态入口"查看牌型说明" |
| **D8** | 算式结构化，不翻译整句 | `{ items: [{labelKey, value}], total, rounded }`，只翻译 `labelKey` |

**D5 的信息声明（把红线变成信任资产）**

结算时四家亮牌，教练评论对家的牌**不违反 P2**——他不是因为作弊才知道。但**玩家分不清这个区别**。

对策：教练在局末**首次**开口时说一句固定声明（`discloseReveal: true`）：

> "牌已经亮开了，我才能讲这些 —— **局中我看不到对家的牌**。"

**主动交代知识边界，而不是等玩家来怀疑。**

**没胡时给什么（D4 落地）**

| 结果 | 教练讲什么 | 数据源 |
|---|---|---|
| **你胡了** | A→B→C→D 四层全讲 | `ScoreResult` 扩展字段 |
| **别人胡了** | ① 你的牌差几向听、听什么 ② **若你点炮**：那张牌为什么危险 ③ 赢家那手值多少（简短） | `coach.ts` shanten/waits + `result.loser` |
| **流局** | ① 流局原因（4 种已有文案）② 你离听牌多远 ③ 已听牌者的听牌 | `result.reason` + `coach.ts` |

**UI 结构（渐进披露）**

```
┌─────────────────────────────────────────────┐
│  [教练头像 explaining]  这手牌我讲一下？      │  ← 教练席入口
│                          [讲讲看] [不用了]    │
└─────────────────────────────────────────────┘
                     ↓ 点击
│  A 为什么能胡                        [默认展开] │
│  │ 123m │ 456m │ 789m │ 中中中 │ 發發(雀头) │   │  ← 真实牌面，可点高亮
│  4 组 + 1 雀头 —— 和了                        │
│  B 为什么允许和    立直：有役 ✔（立直 +1）      │
│  C 值多少番  7 番                    [展开 ▾]  │
│    ├ All Simples        +1  ▸ 你的 14 张全是 2–8│
│  D 为什么是 8 分                    [展开 ▾]   │
```

**默认展开策略**（存进 `coach-prefs`，与三档同级持久化）

| 玩家状态 | 默认展开 | 理由 |
|---|---|---|
| 首次（未完成引导） | A + B | 新手最需要"什么能胡" |
| 常规 | A + C | 结构已会，关心值多少 |
| 禅档 | 无入口气泡（教练席不渲染），**牌桌内**静态入口默认折叠 | D7 |

**状态机衔接**：新增 `explainingScope: 'turn' | 'settlement'`。
- 局中 `explaining`：受预算约束，**可被 `Interrupted` 冻结**
- 局末 `explaining`：**不受预算**、**不可被 Interrupted**（没有下一巡了）、**不自动关闭**

**可访问性**
- 分解区用 `<ol>`，每组一个 `<li>` + `aria-label`（"第一组：一萬二萬三萬，顺子，暗"）
- 番种列表用 `<dl>`（名 `<dt>` / 证据 `<dd>`）
- 明/暗用 `●/○` 形状 + 文字，和牌张用 `▸` 标记
- 移动端：复盘面板 → **底部 drawer**（复用 D 的移动端 drawer，不再新建）；四层改**手风琴**（一次只开一层）

**验收**
- [ ] 赢 / 别人胡 / 流局**三种结局都有内容**（不是只有赢家才渲染）
- [ ] A 层分解与 `patterns` 一致（E1 的单测覆盖）
- [ ] 禅档下仍有静态"查看牌型说明"入口
- [ ] 局末首次开口含信息声明

---

#### E3 · C 层证据模板 + D 层三套算式

| 字段 | 内容 |
|---|---|
| **依赖** | E2 |
| **文件** | 新建 `features/table/coach-evidence.ts`（fan id → Evidence 生成器）；`messages/*.json` 加 `review.evidence.*` |

**🔴 不要手写 107 条番种释义**

`messages/en.json` 的 `mahjong.fan` 有 **107 个键，但值全是番种名**（`"allSimples": "All Simples"`），**零释义**。手写 107 × 3 语 = 321 条，且必然与代码判定脱节（**代码改了文案没改 = 错误说明，比没说明更糟**）。

**解法**：每个番种挂一个 **`Evidence` 结构化证据**（§4.5 的 13 类），UI 用模板生成句子。

**收益**
- 文案 **321 条 → ~18 模板 × 3 语 = 54 条**
- **永不与代码不一致**（证据由代码生成，不是人写的）
- 番种名继续复用现有 `mahjong.fan.*` 107 条（**零新增**）
- 天然支持"点击查看细节"（`hits` 里是真实牌，可高亮）

**降级策略**：`{ kind: 'fallback' }` 的番种**只显示名字不显示释义**。**先覆盖高频 30–40 个**，不要一次性做完 107 个。

**D 层三套算式（必须分治）**

| 玩法 | 番/飜 | 门槛 | 点数公式 | 封顶 |
|---|---|---|---|---|
| **港式** | `Σ patterns.value` | 休闲 ≥1（无番自动鸡胡 +1）／标准 ≥3 | `base = 2^min(fan,10)`；自摸 `base×2 × 3 家`；点炮 `base×4` | **10 番**（`HONG_KONG_FAN_CAP`） |
| **立直** | `Σ patterns.value` = han | **至少一个役**（dora 不算） | `base = min(fu × 2^(han+2), 2000)`；阶梯：5飜/4飜40符/3飜70符 → 2000；6→3000；8→4000；11→6000；13+→8000 | 役满 `8000 × n` |
| **国标** | `Σ patterns.value` | **≥8 番**，**花牌不计入门槛** | `8 + total`（自摸各家）／`total + 8×2`（点炮） | 无总上限（88 是单项上限） |

**三条必须讲清的"反直觉点"**（说明的最大价值）

1. **港式鸡胡**：结构完整但 0 番 → 休闲模式自动 +1（`isHongKongCasualChickenHand`）→ 解释"为什么我什么番都没有也能胡"
2. **国标花牌不算门槛**：`qualifyingTotal` 排除 `flower`。花牌给分，但不帮你过 8 番门
3. **立直 dora 不算役**：`legalYaku` 明确排除 `dora/uraDora/akaDora`。一堆 dora 但无役 = **和不了**。这解释了"我明明听牌了为什么不让我和"

**美式 / 区域**：`settlement.transfers`（NMJL 卡片分值）／`state.result.tai`（台）——**不是 fan/patterns 体系** → 走 `capability` 分治，不硬套四层。

---

### Phase F — 成就（**无阻塞**）

> ## 🔴 修订块 · v2：本 Phase 与前版有结构性变化
>
> **前版把 Phase F 标为"阻塞：等积分 sink 扩容"，前提是"成就发放积分"。**
> **本版成就发放皮肤，不发积分 → 阻塞消失，整块可立即开工。**
>
> | 前版 | 本版 |
> |---|---|
> | 成就发积分（Gold 100 / Platinum 300，共 1,600 分） | 成就发**现有 5 件皮肤**（4 premium + 1 limited） |
> | 需要先扩 sink（§F1.8） | **不需要 sink** —— 没有货币即没有通胀 |
> | 碎片通道是候选出口（§F1.3 说它是阻塞项） | **碎片通道整条删除**（复杂度远超产出：1 件皮肤） |
> | `PointTransaction` 作为发放账本 | 删除货币语义 → `ActionLog`（行为日志） |
>
> ---

#### F1 · 学习成就系统

**F1.1 复用已有基础设施（不新建体系）**

| 已有 | 复用方式 |
|---|---|
| `AppearanceUnlock` 表 | **新增结构同形的 `AchievementUnlock`**，不改已有表 |
| `AppearanceUnlock.source` | **枚举值现为 `seasonal_checkin` / `achievement` / `legacy` / `grant`**（v3 更正）。⚠️ 该列在 Prisma 里是 `String`，**无需 migration**，只改注释。🔴 `legacy` 是迁移 `20260916120000` **新造的值**（`UPDATE "AppearanceUnlock" SET "source"='legacy' WHERE "source"='points'`），原稿完全没提；`points` / `fragments` **已不存在**，⛔ 不要再用 |
| ~~`points-ledger.ts` append-only 账本~~ | **⛔ 不再复用** —— 无货币即无账本。行为记录改走 `ActionLog`（见 Phase A2） |
| ~~`UnlockRule: 'points' / 'fragments'`~~ | **删除这两个值**。v3 更正后的完整值集 = `'seasonal_checkin' \| 'achievement' \| 'legacy' \| 'grant'`（⚠️ **没有 `'free'`** —— 原稿写错了） |

**F1.2 Prisma（新增 2 张表）**

> 🔴 **`LearningStat` 的 DDL 已修正**：前版含 `dailyLastClear` / `dailyStreak` / `dailyFreezeWeek` 三个 streak 字段，与**已在生产**的 `SolitaireStreak`（`dailyStreak` / `lastDailyDate` / `freezeWeekKey`）**职责重叠** —— 会导致玩家看到两个不同的"连续天数"。
>
> **决策：streak 全部读 `SolitaireStreak`，`LearningStat` 删掉这三个字段。**
>
> ⚠️ **必须在建表之前确定**，否则要写 migration 改表。

```prisma
/// v3 校正：以下 DDL 已与 `prisma/schema.prisma` 逐字对齐。
/// Per-user learning counters. NOT a currency — there is no spendable balance.
/// Streak lives on SolitaireStreak / DailyBonus — intentionally absent here.
model LearningStat {
  userId         String   @id
  handsPlayed    Int      @default(0)
  discardsPlayed Int      @default(0)
  coachFeedbacks Int      @default(0)
  bestGrades     Int      @default(0)
  patternsSeen   Json?
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AchievementUnlock {
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([userId, achievementId])
  @@index([userId])
}
```

> 🔴 **v3 校正 · 上面这块 DDL 原稿有 4 处与实现不符（原 P0-2 / P0-3）**
>
> | 项 | 原稿写法 | 仓库实际 |
> |---|---|---|
> | `AchievementUnlock` 主键 | `id String @id @default(cuid())` | **无 `id`**，用 `@@id([userId, achievementId])` **复合主键** |
> | 字段名 | `achievement` | **`achievementId`** |
> | 唯一约束 | `@@unique([userId, achievement])` | **无**（复合主键已保证唯一） |
> | `evidence` 列 | `evidence Json?` | **不存在** |
> | `LearningStat.patternsSeen` | `String[] @default([])` | **`Json?`**（迁移里是 `JSONB`），存 `string[]` 的 JSON |
>
> 🔑 **复合主键是刻意的设计**，不是简化：`unlockAchievement()` 靠**主键冲突**返回 `false` 实现幂等（`lib/achievements.ts:124`）。⛔ **不要"改回"自增 id + 唯一约束** —— 那会让幂等逻辑失去依赖。
>
> 🔑 **`evidence` 列不存在也是刻意的**：原稿想用它做"反作弊追溯"，但实现走的是**服务端重放**（见 F1.6）——重放本身就是证据，且比"存一个自报的 evidence 字段"强得多（后者可被伪造）。⛔ **不要为了"补上 evidence"去加列**：本仓库的生产迁移成本极高（见 §3 与修订块），而反作弊已有更强机制。
>
> ⚠️ **`patternsSeen` 写的是 JSON 数组里的 `string[]`**，⛔ 不是 Prisma 的 `String[]` 语法 —— 写错会在 `generate` 阶段失败。

**迁移注意**：给 `User` 加两个反向关系字段（`achievements AchievementUnlock[]`、`learningStat LearningStat?`）。

**F1.2b 写入时机（前版漏掉的关键决策）**

> 🔴 **决策：局末批量写（方案 A）**，不选每手增量。

| 方案 | 何时写 | trade-off | 采纳 |
|---|---|---|---|
| **A** | 每局结束一次事务写（`hand-over` 事件带 `{seed, moves[]}`） | 一次事务最省；一局中断（关标签页）该局统计全丢 | ✅ |
| B | 每次出牌增量写 | 统计最准；但**每手一次 DB 写**，成本 ×13~18 | ❌ |
| C | 前端周期 flush | 引入客户端上报中间态，**违反红线 4** | ❌ |

**依据**：① 成就判定本来就是**局末事件**（`ScoreResult.patterns[]` 只在和牌时存在）② `handsPlayed` 丢一局对 `ten-hands` 这类条件影响可忽略 ③ **必须显式写进 GDD**，否则实现者会选 B 然后被 DB 写放大打脸。

```ts
// 局末写入（落到 app/api/progress/hand/route.ts 或并入现有结算路由）
export async function recordHandOutcome(userId: string, payload: {
  seed: number; moves: Move[]; ruleset: Ruleset;
}): Promise<{ newAchievements: string[] }> {
  // 1. 服务端重放（引擎完全确定性，零 Math.random）
  const state = replayGame(payload.seed, payload.moves, payload.ruleset);

  // 2. 自己算 grade（⛔ 不信任客户端上报的 grade）
  const grades = payload.moves
    .filter((m) => m.type === 'discard')
    .map((m) => judgeDiscard(stateBeforeMove(m), 0, m.tile).grade);

  // 3. 一次事务写入
  return prisma.$transaction(async (tx) => {
    await tx.learningStat.upsert({
      where: { userId },
      create: { userId, handsPlayed: 1, discardsPlayed: grades.length, /* … */ },
      update: { handsPlayed: { increment: 1 }, discardsPlayed: { increment: grades.length } }
    });
    await tx.actionLog.create({ data: { userId, action: 'hand_finish', meta: { seed: payload.seed } } });
    // 4. 判定成就（零额外计算：C 组只需在 ScoreResult.patterns[].id 里查表）
    return evaluateAchievements(tx, userId, grades, state);
  });
}
```

**F1.3 ~~碎片通道是阻塞项~~ → 已作废（碎片通道整条删除）**

> ⛔ **本节原内容作废。** 碎片通道（`FragmentLedger`）已被删除，理由：
> - 复杂度（per-`fragmentId` 铸造 + ISO week 幂等 + 硬编码 `fragmentId`）**远超其产出（1 件皮肤）**
> - 限定外观目录只有 1 件，且现在改为成就解锁 → **碎片没有任何东西可解锁**
>
> **删除清单**（交付给执行者，见 §Phase B2）：
>
> | 项 | 位置 |
> |---|---|
> | `FragmentLedger` 表 | `prisma/schema.prisma` |
> | `fragmentBalance()` | `lib/wardrobe-server.ts` |
> | `craftAppearanceWithFragments()` | `lib/wardrobe-server.ts` |
> | `grantCheckInCosmetics()` 内的碎片发放段 | `lib/wardrobe-server.ts` |
> | `unlock: 'fragments'` 分支 | `components/Wardrobe.tsx` |
> | `craft` action / `fragments` 字段 | `app/api/wardrobe/route.ts` |
> | `wardrobe.fragmentProgress` / `needMoreFragments` / `craftFor` / `limitedBadge` | `messages/*.json` |
>
> **保留**：`grantCheckInCosmetics()` 的**季节皮肤发放段**（`isSeasonalCurrentlyOffered` 逻辑），只删碎片部分。

**F1.4 成就数值（32 项，四档）—— 去掉积分列**

> 🔴 **前版的积分列整表作废。** 前版 Gold 100 / Platinum 300，总计 1,600 分 —— 这就是"必须先扩 sink"的源头。**本版不发分，改发皮肤。**

**修正后**

| 档 | 名称 | 数量 | 回报 | rationale |
|---|---|---|---|---|
| B | Bronze | 10 | 徽章 + 进度条（**无皮肤**） | "你来了"的确认。签到已在奖励"来"了，成就不再重复 |
| S | Silver | 12 | 徽章 + 进度条（**无皮肤**） | "你入门了"的确认 |
| G | Gold | 7 | 徽章 + 进度条；其中 **3 项**另发 premium 皮肤 | ⚠️ **不是每项都发皮肤** —— 见下方对应表 |
| P | Platinum | 3 | 徽章 + 进度条；其中 **2 项**另发限定皮肤 | ⚠️ **3 项里只有 2 项有皮肤** |

> 🔴 **v3 更正 · 回报列原写法会误导（原 P1-5）**
> 原表 Gold 写"徽章 + 1 件 premium 皮肤"、Platinum 写"徽章 + 限定皮肤"，读起来像"**每项都发**"。
> 实际可发皮肤只有 **5 件**——`ACHIEVEMENT_REWARDS` 是 `Partial<Record<AchievementId, AppearanceId>>`，**刻意只映射 5 项**：
>
> | 档 | 项数 | 有皮肤 | 只有徽章+进度条 |
> |---|---|---|---|
> | Gold | 7 | **3**（`clean-hand` / `all-sequences` / `half-flush`） | 4 |
> | Platinum | 3 | **2**（`big-dragons` / `daily-thirty`） | 1（`thirteen-orphans`） |
> | **合计** | 32 | **5** | **27** |
>
> 这是**有意设计**，不是遗漏：支柱 P1 规定"零新增美术"，只能用现存的 5 件皮肤。⛔ **不要为了"让每项都有奖励"去补画皮肤**（违反红线 14）。没有皮肤的项，其回报就是**徽章 + 进度条**本身——这在成就系统里是成立的回报。

**皮肤 ↔ 成就对应表**（给文案用）

| 皮肤 | 解锁成就 | 达成条件 | 难度感知 | 为什么挂它 |
|---|---|---|---|---|
| `deep-sea-blue` （premium） | `clean-hand` | 单局 100% 最佳率 | 中 | 三项 800 档都挂"努力可达"的技术成就，形成**梯度而非断崖** |
| `sakura-pink` （premium） | `all-sequences` | 做出一次一气通贯 | 中 | 同上 |
| `bamboo-green` （premium） | `half-flush` | 做出一次混一色 | 中 | 同上 |
| `gold-dynasty` （premium，原 2,500 分旗舰） | `big-dragons` | 做出一次大三元 | **高** | **贵的东西必须挂硬成就**，否则稀缺性失效（大三元＝3 个箭刻，C 组最难） |
| `ink-wash` （limited） | `daily-thirty` | 连续签到 30 天 | **高（时间门槛）** | 30 天是**时间门槛而非技术门槛** → 覆盖"技术弱但坚持"的玩家，保证不同类型都能拿到一件限定皮肤 |

**为什么这个改法更好**

| 维度 | 前版（发积分） | 本版（发皮肤） |
|---|---|---|
| 是否需扩 sink | **需要**（1,600 分无处可花） | **不需要**（皮肤就是终点） |
| 是否需要新美术 | **需要**（4–6 件） | **不需要**（复用现有 5 件） |
| 奖励感知 | "我有 1,600 分"（虚） | "我解锁了金色皮肤"（实） |
| 稀缺性 | 削弱（4,900 分买完就不值钱） | **增强**（大三元只有一次机会感） |
| 通胀风险 | **高** | **不存在** |

**F1.5 成就清单（32 项）**——id 与判定条件见 §6.3（i18n 文案表已含全部 name/desc × 3 语）

四组：**A 里程碑 5 项 / B 决策质量 8 项 / C 番种探索 12 项 / D 玩法与坚持 7 项**

> **实现要点**：和牌结算时 `ScoreResult.patterns[]` 已含全部命中番种的 `id`。C 组判定只需在这些 id 里查表，**零额外计算**。
> ⛔ **成就 `id` 一旦上线不可改**（改 = 老玩家成就丢失）。

**F1.6 服务端权威与防刷（红线 4）**

| 威胁 | 对策 |
|---|---|
| 重复上报同一局 | 事件携带 `handId`，服务端幂等去重 |
| 伪造 grade | 服务端**重放**该局（引擎完全确定性），自己算 `judgeDiscard` |
| 刷 `streak-ten` 靠重复出牌 | 事件按 `handId` 分组，同局内连续计数 |
| ~~游客刷分~~ | ~~登录时走 `guest-merge` 的取 max 不叠加~~ → **改为**：游客本地事件批量写入 `ActionLog`，以 `action: 'guest_merge'` 作**哨兵行**保证幂等（无货币，故无"取 max"问题） |
| 每日一题改系统时间 | 种子由**服务端 UTC 时间**决定 |

> **技术前提**：`lib/mahjong/ai.ts` 中**零 `Math.random`**，`GameState` 是纯可序列化对象 → **服务端只存 `{seed, moves[]}` 就能完整重放任何一局**。这意味着防刷**不需要信任客户端任何指标**。

> 🔴 **v3 注 · `guest_merge` 的幂等怎么真正成立（原 P1-9）**
>
> 原方案"以 `action: 'guest_merge'` 作**哨兵行**保证幂等"**不成立**。理由：`PointTransaction`（`ActionLog` 的物理表）**没有唯一约束** —— 主键是 `id`（cuid，每次新建都不同），索引只有 `[userId, reason, createdAt]` 与 `[reason, createdAt]`。**多条 `guest_merge` 行无法被识别为"同一批"**，重复上报就会重复计数。
>
> **改用主键作幂等键**（零 schema 变更、零竞态）：
>
> ```ts
> // 客户端在开始合并时生成一次 mergeKey（同一批事件共用一个）
> const id = `guest_merge_${mergeKey}`;
> try {
>   await tx.actionLog.create({
>     data: { id, userId, action: 'guest_merge', value: 0, meta: { events } },
>   });
> } catch (e) {
>   if (isUniqueViolation(e)) return;   // P2002 → 这批已经合并过了
>   throw e;
> }
> ```
>
> **为什么这样成立**：`id` 是 `@id`，**天然有唯一约束**。重复请求 → 主键冲突 → 直接 return。**在数据库层保证幂等**，不依赖"先查后写"（那有竞态窗口，两个并发重试会同时通过检查）。
> `mergeKey` 由客户端生成（UUID），**服务端不信任其内容**，只当去重键用 —— 伪造 `mergeKey` 只会让自己少合并一次，无法刷分。
> ⛔ **不要退回"查 `action='guest_merge'` 判重"** —— 那是这次被否掉的方案。

**F1.7 成就墙 UI**

- 分四组 Tab；每条卡片：图标位 + 名称 + 描述 + **进度条** + 已完成标记
- 🔴 **未解锁的成就必须显示进度**（`7 / 10 局`），**不要灰掉一片**——看得见的部分进度显著提升动力；灰掉的只产生"这跟我无关"
- **排序：已完成在前，未完成按完成度降序**（离达成最近的排最前，制造"就差一点"的心理拉力）
- 🔴 **v2 新增**：**未解锁的成就必须显示"解锁什么皮肤"**。这是把"皮肤"和"成就"绑成动机闭环的关键 —— 玩家不是"为了徽章而努力"，是"为了那件金色皮肤而努力，顺便拿了徽章"

```
┌─────────────────────────────────────────┐
│  B  Bronze  ·  3 / 10                    │
├─────────────────────────────────────────┤
│  ✓ Clean Hand              [装备深海蓝]  │  ← 已解锁且有奖励，显示装备入口
│    ✓ 已完成                              │
├─────────────────────────────────────────┤
│  ▸ All Sequences        ▓▓▓▓▓░░░ 5 / 8   │  ← 未解锁显示进度
│    做出一次一气通贯 · 解锁樱花粉          │  ← 🔑 奖励前置展示，制造目标感
├─────────────────────────────────────────┤
```

**F1.8 ~~积分 sink 扩容（必须先做）~~ → 已作废**

> ⛔ **本节整节删除。**
>
> 前版的三条优先级（新增 4–6 件 points 档外观 / 给 `ITEM_PRICE` 填真值 / 提高产出）全部建立在"成就发积分"这个前提上。
>
> **本版成就发皮肤 → 没有货币 → 没有 sink → 不需要扩容。**
>
> 前版的通胀测算（"满勤玩家约 2.2 个月买完所有 premium"）也已失效：实测在线来源只有签到 4,300/月 + 开局日封顶 50×30 = 1,500/月，**满勤玩家实际 25 天就能买完 4,900 分的外观** —— 比前版估算更严重。**这正是删掉货币的根本理由，而不是"再多画几件皮肤"。**
>
> 道具同理：`ITEM_PRICE`（hint 200 / undo 200 / shuffle 300 / rescue 500）购买渠道**实际已半死** —— 玩家几乎攒不到 500 分买 rescue。本版改为**每日免费额度**（复用 `SolitaireDaily` 加 4 列计数），见执行规格 Phase A5。

---

### Phase G — 玩法能力补齐（P1/P2）

| # | 任务 | 说明 | 成本 |
|---|---|---|---|
| **G1** | 立直 / 国标接 `scoring/` 门槛校验 | 教练判级时调 `scoreHand()` 校验役种/番数门槛 → capability 升 `full`。**已有能力没接上** | 中 |
| **G2** | 移动端教练 drawer | 港式/立直/国标移动端**零教练**（`HongKongTable` 渲染 `MobileMahjongTable` 时未传 `coach` prop）。复用同一 `CoachVerdict` | 中 |
| **G3** | 区域桌实现真向听 | 四川需缺门约束、台湾 16 张 → 向听算法两个变体。完成后 `unsupported` 升 `full` | 中–高 |
| **G4** | 港式等补放铳风险 | 用 `unseenCounts` + 对手弃牌读牌，对齐美式的 `discardRisk` | 高 |
| **G5** | 道场色带段位（P1） | 教练 = 师范，段位 = 道场色带。输入 WDS（`best` 1.0 / `acceptable` 0.6 / `better` 按 gap 折扣）。6 档 White→Black | 中（依赖生涯统计） |

**G5 两条硬红线**：① 色带名**不叫"新手/菜鸟"**（段位是身份资产，不是评级羞辱）② **必须有文字标签**（色盲 + 不靠颜色单独传达）
**G5 ⚠️ 依赖**：需要**生涯统计**这个新数据源（v2 后由 `LearningStat` 提供 —— 决策质量累计，替代已删除的 `points-ledger`）→ **F1 落地后即具备**，但色带本身仍不进 P0。

---

## 6. i18n 键总表

> **目标文件**：**`messages/` 目录下全部 9 个 locale 文件**（en / zh / zh-TW / ja / ko + 扩展 4 语）
> ⚠️ **前版写"三语"是低估。** 仓库实为 9 个 locale（EN 真源 + 简中 + 繁中 + 日 + 韩 + 扩展 4 语）。缺任一 locale 的 key → 该语种页面 **整页 500**。
> **现有顶层 namespace = 28 个**（无 `coachFb` / `tools` / `achievements`）
> **本批新增 3 个 ns**（`coachFb` / `tools` / `achievements`），**修改 2 个**（`dailyHand` / `daily`）
>
> ### 🔴 v2（积分重构）对 i18n 的额外要求
>
> | ns / key | 处置 | 原因 |
> |---|---|---|
> | `daily.todayReward` / `claimedReward` / `todayRewardShort` / `claimedRewardShort` | **删**（或改为无积分措辞） | 文案含积分数字，**逻辑改了文案不改 = 文案在说谎** |
> | `daily.streakLine` / `streakLineShort` | **改写** | 去掉"tomorrow +{n} points" |
> | `daily.yourPoints` / `pointsTip` / `tipBody` | **删** | 无余额可显示，整个 tip 区块作废 |
> | `points.*` 整个 ns | **删**（`youHave` + `ledger.*` 7 条） | 无货币即无账本 UI |
> | `wardrobe.fragmentProgress` / `needMoreFragments` / `craftFor` / `limitedBadge` | **删** | 碎片通道整条删除 |
> | `achievements.loginValue.*` | **新增** | 首登价值说明（替代 `FIRST_LOGIN_BONUS`） |
>
> 具体改后文案（含 DOCTRINE 合规检查）见执行规格 Phase A1.4。

### 6.1 `coachFb`（新增）—— 反馈卡

**原因码 → 文案键映射**（与 `explainDiscard().reason` 一一对应）

| `reason` | 文案键 | 徽标色（按 `grade`） |
|---|---|---|
| `same-tile` | `best` | 绿 |
| `equal-shanten-close-ukeire` | `acceptable` | 灰 |
| `fewer-ukeire` | `fewerUkeire` | 琥珀 |
| `worse-shanten` | `worseShanten` | 琥珀 |

**占位符**：`{best}` = 更优牌名（**渲染层先用 `tileFace()` 本地化再传入**）｜`{n}` = `|ukeireGap|`｜`{s}` = `best.shanten`｜`{from}`/`{to}` = 进张数前后

```json
// en
"coachFb": {
  "ariaLabel": "Coach feedback",
  "best": "Strong choice — best availability.",
  "acceptable": "Fine — {best} keeps {n} more tiles live, but it's close.",
  "fewerUkeire": "Also fine, but {best} keeps {n} more tiles improving your hand.",
  "worseShanten": "Careful — this moves you one step further from ready. {best} keeps you {s} away.",
  "whyNotBetter": "Why not better",
  "compare": "Discarding {best} keeps {n} more tiles ({from} → {to} improving tiles).",
  "stillShanten": "Still {s} away.",
  "viewPatterns": "See this hand's patterns",
  "playAgain": "New hand"
}
```

```json
// zh
"coachFb": {
  "ariaLabel": "教练反馈",
  "best": "好选择——进张最多。",
  "acceptable": "可以——打 {best} 多留 {n} 张，但差距很小。",
  "fewerUkeire": "也不错，但打 {best} 能多留 {n} 张改良牌。",
  "worseShanten": "注意——这一步离听牌远了一点。打 {best} 仍是 {s} 向听。",
  "whyNotBetter": "为什么不更优",
  "compare": "打 {best} 可多留 {n} 张（进张 {from} → {to}）。",
  "stillShanten": "仍 {s} 向听。",
  "viewPatterns": "看这手牌的番",
  "playAgain": "再来一局"
}
```

```json
// zh-TW
"coachFb": {
  "ariaLabel": "教練回饋",
  "best": "好選擇——進張最多。",
  "acceptable": "可以——打 {best} 多留 {n} 張，但差距很小。",
  "fewerUkeire": "也不錯，但打 {best} 能多留 {n} 張改良牌。",
  "worseShanten": "注意——這一步離聽牌遠了一點。打 {best} 仍是 {s} 向聽。",
  "whyNotBetter": "為什麼不更優",
  "compare": "打 {best} 可多留 {n} 張（進張 {from} → {to}）。",
  "stillShanten": "仍 {s} 向聽。",
  "viewPatterns": "看這手牌的番",
  "playAgain": "再來一局"
}
```

**⚠️ 三条措辞红线（改文案前必读）**
1. `worseShanten` 用**"注意"不用"错误"**，且**没有红色、没有 ❌**。`better` 类一律"先肯定再优化"
2. `acceptable` **必须承认差距小**（"but it's close" / "但差距很小"）。过度纠正会打击 45+ 用户
3. `same-tile` **不夸张**：用 "Strong choice"，⛔ 不用 "Perfect!"（每手都喊完美 = 完美失去意义）

### 6.2 `dailyHand`（修改）+ `tools`（新增）

**🔴 必须改的一条**（逻辑改了，文案不改就是说谎）

| key | en | zh | zh-TW |
|---|---|---|---|
| `subtitle` | Same opening wall worldwide, UTC day. Finish the hand — win or draw — to keep your streak. No account required. | 全球同一副牌，按 UTC 日期。打完即续（和牌或流局都算），无需账号。 | 全球同一副牌，依 UTC 日期。打完即續（和牌或流局都算），無需帳號。 |

**新增键（两层结构 + 分享卡）**

| key | en | zh | zh-TW |
|---|---|---|---|
| `puzzleEyebrow` | Today's puzzle | 今日一题 | 今日一題 |
| `puzzleTitle` | One decision | 一手决策 | 一手決策 |
| `puzzleSubtitle` | Same opening worldwide. Pick a tile to discard — 30 seconds. | 全球同一开局。选一张打掉，30 秒。 | 全球同一開局。選一張打掉，30 秒。 |
| `puzzleDone` | Answered | 已作答 | 已作答 |
| `puzzleBest` | Best discard — that was it. | 最优打——就是这张。 | 最優打——就是這張。 |
| `puzzleOther` | Playable, but {best} keeps {n} more tiles live. | 可以，但打 {best} 能多留 {n} 张。 | 可以，但打 {best} 能多留 {n} 張。 |
| `puzzleStreak` | {n}-day streak | 连续 {n} 天 | 連續 {n} 天 |
| `fullHandTitle` | Today's full hand | 今日一局 | 今日一局 |
| `fullHandSubtitle` | Prefer the whole game? Play the same opening to the end. | 想打完整局？用同一个开局打到终局。 | 想打完整局？用同一個開局打到終局。 |
| `shareTitle` | Mahjong Daily | 麻将每日 | 麻將每日 |
| `sharePuzzleLine` | {date} · {rules} · opening discard | {date} · {rules} · 开局第一手 | {date} · {rules} · 開局第一手 |

> ⚠️ `dailyHand.title` 现为 `<h1>`。拆两层后**首页仍只能有一个 `<h1>`** → 建议 `h1` 给 `puzzleTitle`，`fullHandTitle` 降 `<h2>`，由 C2 决定并保持一致。

**`tools`（新增）**

```json
// en
"tools": { "eyebrow": "Tool", "waits": {
  "title": "Wait Finder",
  "subtitle": "Read a hand and see which discard keeps the most tiles live.",
  "shanten": "Shanten {n}", "ukeire": "{n} improving tiles", "waits": "{n} waits",
  "best": "Best discard", "discard": "Discard", "keeps": "Keeps {n} tiles live",
  "remaining": "{n} left unseen", "copyLink": "Copy hand link", "copied": "Link copied",
  "empty": "Pick a hand to analyse.",
  "disclaimer": "This tool covers the common patterns. It is not a tournament scorer — always defer to your club's rules."
}}
```

```json
// zh
"tools": { "eyebrow": "工具", "waits": {
  "title": "听牌计算器",
  "subtitle": "读一手牌，看看打哪张能留住最多的进张。",
  "shanten": "{n} 向听", "ukeire": "进张 {n} 张", "waits": "听 {n} 张",
  "best": "最优打", "discard": "打", "keeps": "留住 {n} 张进张",
  "remaining": "还有 {n} 张未见", "copyLink": "复制牌局链接", "copied": "链接已复制",
  "empty": "选一手牌开始分析。",
  "disclaimer": "本工具覆盖常见牌型，非比赛级算番器 —— 请以你所在牌馆的规则为准。"
}}
```

```json
// zh-TW
"tools": { "eyebrow": "工具", "waits": {
  "title": "聽牌計算器",
  "subtitle": "讀一手牌，看看打哪張能留住最多的進張。",
  "shanten": "{n} 向聽", "ukeire": "進張 {n} 張", "waits": "聽 {n} 張",
  "best": "最優打", "discard": "打", "keeps": "留住 {n} 張進張",
  "remaining": "還有 {n} 張未見", "copyLink": "複製牌局連結", "copied": "連結已複製",
  "empty": "選一手牌開始分析。",
  "disclaimer": "本工具覆蓋常見牌型，非比賽級算番器 —— 請以你所在牌館的規則為準。"
}}
```

### 6.3 `achievements`（新增，F1 用）

结构：
```json
"achievements": {
  "title": "Learning achievements",
  "progress": "{done} / {total}",
  "tiers": { "bronze": "Bronze", "silver": "Silver", "gold": "Gold", "platinum": "Platinum" },
  "items": { "<id>": { "name": "...", "desc": "..." } }
}
```

**32 个 id（与 F1 的判定表逐一对齐，⛔ 改 id = 老玩家成就丢失）**

| 组 | id |
|---|---|
| A 里程碑（5） | `first-hand` · `first-win` · `ten-hands` · `fifty-hands` · `fifty-discards` |
| B 决策质量（8） | `sharp-eye` · `clean-hand` · `no-regrets` · `streak-ten` · `streak-thirty` · `efficient` · `comeback` · `coach-graduate` |
| C 番种探索（12） | `chicken` · `all-sequences` · `all-triplets` · `seven-pairs` · `pure-straight` · `mixed-triple` · `half-flush` · `full-flush` · `little-dragons` · `big-dragons` · `thirteen-orphans` · `nine-gates` |
| D 玩法与坚持（7） | `hk-casual` · `hk-standard` · `riichi-declare` · `riichi-win` · `mcr-qualified` · `daily-seven` · `daily-thirty` |

> **完整 name / desc 文案**（约 100 行）在工作区 `i18n文案表_教练反馈与32成就_2026-09-14.md` §4，**直接复制即可**。本文件不重复以避免双份维护。
> ⚠️ **该文案表只有 en / zh / zh-TW 三语** → 剩下 6 个 locale 需按 `scripts/i18n/localization-spec.ts` 的 DOCTRINE 补译。**这是 F1 最容易被漏的成本项。**

**两处文案纪律**
1. **成就名称用"行话"**（碰碰胡 / 大三元 / 九莲宝灯）——这是刻意的，成就墙是身份资产，行话给玩家"我懂这门手艺"的归属感。但 **`desc` 必须用大白话解释牌型**。两者分工不能混
2. **`desc` 一律用"完成/累计/连续"等可观测动词**，⛔ 不用"尝试""努力"——成就描述就是**验收条件的人类语言版**

**🔴 v2 新增：奖励前置展示（与皮肤接线）**

未解锁的成就卡片**必须显示解锁什么皮肤**（见 F1.7）。对应关系：

```ts
// lib/achievements.ts
export const ACHIEVEMENT_REWARDS: Partial<Record<string, AppearanceId>> = {
  'clean-hand': 'deep-sea-blue',
  'all-sequences': 'sakura-pink',
  'half-flush': 'bamboo-green',
  'big-dragons': 'gold-dynasty',
  'daily-thirty': 'ink-wash'
};

/** Called inside the settlement transaction. Grants skin atomically with the badge. */
export async function grantAchievementReward(
  tx: Prisma.TransactionClient, userId: string, achievementId: string
): Promise<void> {
  const appearanceId = ACHIEVEMENT_REWARDS[achievementId];
  if (!appearanceId) return;
  try {
    await tx.appearanceUnlock.create({
      data: { userId, appearanceId, source: 'achievement' }
    });
  } catch { /* already owned — idempotent */ }
}
```

**新增 i18n 键**（首登价值说明，替代 `FIRST_LOGIN_BONUS`）：

```json
"achievements": {
  "loginValue": {
    "title": "Save your progress",
    "body": "Register to keep your achievements and stats across devices. No download, no password — just your email.",
    "cta": "Save my progress"
  }
}
```

### 6.4 交付前自检

```bash
# key 集合全 locale 一致（缺 key → next-intl 运行时报错）
# 🔴 不要硬编码语种列表 —— 真源是 messages/ 目录下实际存在的文件
node -e "
const fs=require('fs');
const L=fs.readdirSync('./messages').filter(f=>f.endsWith('.json')).map(f=>f.replace('.json',''));
const keys=o=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'&&!Array.isArray(v)?keys(v).map(s=>k+'.'+s):[k]);
const sets=Object.fromEntries(L.map(l=>[l,new Set(keys(require('./messages/'+l+'.json')))]));
const en=sets['en'];
L.forEach(l=>{ if(l==='en')return;
  const miss=[...en].filter(k=>!sets[l].has(k));
  const extra=[...sets[l]].filter(k=>!en.has(k));
  if(miss.length)console.log(l,'MISSING',miss.length,miss.slice(0,5));
  if(extra.length)console.log(l,'EXTRA',extra.length,extra.slice(0,5));
});
console.log('parity: '+L.length+' locales checked');"
```

- [ ] `dailyHand.subtitle` **全部 locale** 都已改（**最容易漏**）
- [ ] `coachFb` 的 `{best}` 传入前已用 `tileFace()` 本地化（⛔ 不能塞 `Tile` 原始值）
- [ ] `achievements.items` 的 32 个 id 与 `lib/achievements.ts` 判定表对齐
- [ ] `tools` ns **全 locale 齐**（缺 key 会让工具页**整页 500**，不是局部缺字）
- [ ] **v2·积分残留检查**（必须全空）：
      `grep -rn "CHECKIN_REWARDS\|FIRST_LOGIN_BONUS\|START_GAME_POINTS\|GAME_WIN_MAX\|syncCachedTotal\|ledgerTotal\|ITEM_PRICE\|usePoints\|pointsBalance" lib/ app/ components/`
- [ ] **v2·碎片残留检查**（必须全空）：`grep -rn "fragment\|Fragment" lib/ app/ components/`
- [ ] **v2·教练契约红线**：`grep -rn "from 'next" lib/mahjong/coach/` 必须无结果；`git diff lib/mahjong/coach.ts` 必须为空

---

## 7. 测试与验收

### 7.1 每个 WP 完成必跑

```bash
npm run build              # 必须通过
npx vitest run             # 单测
npx tsc --noEmit           # ⚠️ tsconfig exclude 含 scripts/tests，必须实跑专项
```

### 7.2 本批次要求的专项单测

| 文件 | 断言 |
|---|---|
| `tests/coach-contract.test.ts` | §4.6 四条的完整实现 |
| `tests/coach-explain.test.ts` | `reason` 与 `grade` 的映射关系（`acceptable` ⟺ `equal-shanten-close-ukeire`）；阈值 `<=2` 与 `judgeDiscard` 内部一致 |
| `tests/coach-budget.test.ts` | 自动 L3 第 3 次降级；L4 ≤4；听牌时无 L2/L3 |
| `tests/daily-score.test.ts` | `computeScore` 权重（best=1 / acceptable=0.5 / better=0）；`gradeAccuracy` 五档边界；`buildShareCard` 每 8 手换行 |
| `tests/score-review.test.ts` | **🔴 关键**：对会触发 `selectBest*` 的立直/国标用例，`decomposition` 展开后与 `patterns` 判定**一致**（防"解释与算番不一致"） |
| `tests/hand-sort.test.ts` | `sortHand()` 第 14 张保持分离；不改原数组 |

### 7.3 人工验收（每 Phase 一次）

| Phase | 验收 |
|---|---|
| A | 四川/台湾桌出牌后**无任何 grade** |
| B | 禅/复盘/陪练三档行为差异可感知；`live` 出牌前**无牌名** |
| C | 分享卡贴进微信不变形；`/tools/waits` 的 `?h=` 链接可还原牌局 |
| D | 拖宽视口看 scale 实时变化；禅档牌桌变宽 |
| E | 赢/别人胡/流局三种结局都有内容 |
| F | 成就墙未解锁项**有进度条**（不是灰掉） |

---

## 8. PLACEHOLDER（待验证，不许当已知值用）

| # | 待验证 | 验证方式 | 阻塞什么 |
|---|---|---|---|
| **P-1** | **第 1 巡题目是否有教学价值** | 跑 30 天种子统计 `best - second` 的 ukeire 差分布。**中位数 < 2 则 v1.1 必须提前** | C2 的 v1 是否够用 |
| ~~**P-2**~~ | ~~**积分 sink 扩容方案**~~ | ✅ **已作废（v2）** —— 无货币即无 sink。见 §F1.8 作废块 | ~~F1 能否上线~~ → **F1 无阻塞** |
| **P-3** | 立直/国标教练门槛 | 逐变体验证 `rankDiscards` 是否考虑了役种门槛 | G1 |
| ~~**P-4**~~ | ~~`americanCoachAdvice` 的真实字段名~~ | ✅ **已实证并修入 §4.4 修订块**（4 处错误：`keep[0]` / `.level` / `r.card` / 无第三参） | ~~A2 的美式适配器~~ |
| **P-5** | sprite sheet 三层合并体积 | 实测，预算 ≤180 KB | D2 |
| ~~**P-6**~~ | ~~教练浮层与 `DiscardPool seat=0` 重叠~~ | ✅ **已实证存在**：`HongKongTable:210` 浮层 `top-14`(56px) vs toolbar `h-11`(44px) **必然相撞**。对策：`watching` 态不渲染该浮层 | ~~D1~~ → **A1 顺手改** |
| ~~**P-7**~~ | ~~手牌 14 张在 `xl` 尺寸下的溢出~~ | ✅ **已实证，且前版判断有误**：`xl`=68px，14 张 + 13×2 gap = **978px**，板宽 980px **仅剩 2px**；开"大牌面" → 1075.8px（溢出 95.8px）；前版对策"补偿封顶 1.15" → 1124.7px **更严重**。**唯一解：`xl` 改 `lg`（56px → 812px，留 168px）** | D1 的牌面尺寸决策 |
| **P-8** | 移动端双运行时内存（若将来上 Cocos） | 真机实测 | 与本期无关 |
| **P-9** | 每日免费道具额度（`ITEM_DAILY_FREE`） | 假设日均通关 2–3 关、每关 1–2 道具 → hint 3 / undo 5 / shuffle 2 / rescue 1。**上线后统计"额度耗尽率"**：>30% 说明偏紧，<5% 说明形同虚设 | A5 |

---

## 9. 风险登记（汇总）

| # | 风险 | 概率 | 影响 | 对策 |
|---|---|---|---|---|
| 1 | **`Interrupted` 语义做错**（卡内容跟随牌局更新） | 中 | **高** | 卡内容**快照化**，绑在触发的 `moveIndex`（D3） |
| ~~2~~ | ~~**积分通胀**~~ | — | — | ✅ **v2 已消除** —— 无货币即无通胀。整条风险删除（原对策"扩 sink"随之作废） |
| 3 | **解释与算番不一致**（外部重算分解） | 中 | **高** | 红线 11 + `tests/score-review.test.ts`（E1） |
| 4 | **教练反馈被 45+ 用户当成"被批评"** | 中 | 高 | 措辞"也不错，但…"；`better` 用琥珀不用红；禅档一键关闭 |
| 5 | **区域桌继续给错建议** | 高（现状如此） | 高 | A1 立即降级 `unsupported` |
| 6 | **移动端零教练**（港式） | 高（现状如此） | 中 | G2（P1） |
| 7 | 成就判定被刷 | 中 | 中 | 服务端重放（引擎确定性是前提，F1.6） |
| 8 | 算番器被拿去对实际牌局且结果不符 | 中 | 中 | 显式声明"非比赛级算番器"（C4） |
| 9 | 参数化 URL 导致索引爆炸 | 中 | 中 | `?h=` 页面 `noindex, follow`（C3） |
| 10 | **预算过低导致"教练不说话"** | 中 | 中 | 上线后统计每局 L2/L3 次数分布，**中位数 < 1 就调高上限**（B2）。⚠️ **v2 补充：不要用"调高预算"解决体感问题**，先补**局末总结内容清单**（见风险 22） |
| 11 | **L1 记号被忽略**（不占位的东西容易消失） | 中 | 中 | 固定位置 + `opacity` 仅在 `0.55–1` 变化，**永不为 0**（B2） |
| 12 | 移动端 drawer 与现有弹层抢焦点 | 中 | 中 | 现有胜利弹窗是 `role="dialog"` → z-index 分层并互斥（G2） |
| 13 | 教练浮层与 `DiscardPool seat=0` / `TurnHintsBar` 重叠 | **已确认（v2）** | 中 | ⚠️ 前版说"D1 的教练席已结构性规避"，但**只要 `HongKongTable:210` 那段浮层代码还在，风险就在** → **A1 顺手改成 `watching` 态不渲染** |
| 14 | 手牌"反向补偿"后溢出 | **已确认（v2）** | **高** | ⛔ **前版对策"补偿封顶 1.15"是错的**（会到 1124.7px，比原本更糟）。**改为 `xl` → `lg`（56px，14 张 = 812px，留 168px 余量）**（P-7） |
| 15 | sprite sheet 体积超预算 | 中 | 中 | 降 `q80→72`；砍眨眼帧；手势层用更小区域（D2） |
| 16 | 分层导出流程没跑通（PS → 三层 sheet） | 中 | 中 | **先手工导一次验证**，再写 `emit_coach.py` 自动化（D2） |
| 17 | `prefers-reduced-motion` 下教练变"死图"，失去人格 | 中 | 中 | 降级为**静态帧 + 气泡仍出现**，只是不动 |
| 18 | 今日一题评分被误读为"同一副牌公平竞技" | 中 | 中 | 文案只说"同一开局"，**不承诺竞技公平**；评分只衡量**你的决策准确率** |
| 19 | 多语种同步成本 | 中 | 低 | 文案键统一，先英文化再译（§6 已交付）。⚠️ 从三语扩到 **9 语**，成本 ×3 |
| 20 | 道场色带与 6 套主题配色冲突 | 中 | 中 | 色带用**独立命名空间**，不与 `--sem-*` 混用；必须有文字标签（G5） |
| 21 | 教练美术风格与暗色门户/彩虹主题冲突 | 中 | 高 | 教练走**中性 + 一个强调色**（teal `--portal-accent`），**不参与彩虹渐变** |
| **22** | **🆕 v2 · 教练"太安静"的体感漏洞**（一局 13–18 巡只说 2 次 L3） | 高 | 中 | ⛔ **不要调高 L3 预算**（"超过就变成批改作业"的理由是对的）。**补局末总结内容清单**：本局最佳率 / 最有价值的一手 / 最该改的一手 / 番种收获 —— 四项来源全部已有，成本 = 一个组件 |
| **23** | **🆕 v2 · 两套 streak 存储**（`LearningStat` vs `SolitaireStreak`） | **确定会发生** | **高** | 玩家会看到两个不同的"连续天数" → 信任崩塌。**`LearningStat` 删 streak 三字段，统一读 `SolitaireStreak`**。⚠️ **必须在建 `LearningStat` 表之前做**，晚了要写 migration |
| **24** | **🆕 v2 · 美式适配器方向颠倒** | **确定会发生** | **高** | `distance` 越小越好，与 `ukeire` 相反 → 排名表整个颠倒。对策：**`RankedOption.metric` 一等公民化**（§4.2） |
| **25** | **🆕 v2 · 未登录玩家被成就系统排除** | 中 | **高** | 违反支柱 P3。成就墙对未登录显示**预览态**（已解锁可见 + "登录后查看你的进度"），**能力不因未登录而减少** |

---

## 10. 交付物索引

本文件是**实施事实源**。以下文件是它的源材料（追溯细节时才读，日常不必打开）：

| 文件 | 覆盖内容 |
|---|---|
| **`积分转成就系统_重构方案_给Cursor_2026-09-16.md`**（工作区） | 🆕 **v2 执行规格**：Phase A–D 共 17 个工作包（积分删除清单 / `ActionLog` schema / 多语文案 / 皮肤↔成就映射 / `LearningStat` 写入时机 / 五条验收脚本）。**Phase A–D 以那份为准** |
| `AI教练_每日一题_算番工具_GDD_2026-09-14.md` | 系统设计：解释层 / 每日一题 / 算番工具 / 成就 32 项 / 经济总账（⚠️ §5.2 经济总账、§3.6 数值设计、§2.7 Prisma DDL **已被 v2 作废**）/ 排期 |
| `AI教练_交互设计与游戏性规格_2026-09-14.md` | 五级输出 / 反馈预算 / 8 状态机 / 时序 / a11y / 引导 |
| `AI教练演出层与牌桌体验优化_2026-09-15.md` | 资产管线 / 序列帧选型 / 优先级仲裁 / 牌桌布局诊断 |
| `AI教练_第五角色定义与接入规格_2026-09-15.md` | 教练席方案 / 缩放代价实测 / 六项视觉区分 / 美术 brief |
| `AI教练_玩法覆盖排查与统一方案_2026-09-15.md` | 六玩法三层矩阵 / 三套分裂证据 / 契约层方案 |
| `AI教练_结算复盘_胡牌说明与算番讲解_2026-09-16.md` | 四层模型 / `ScoreResult` 扩展 / `Evidence` 13 类 / 三套算式 / 八条决策 |
| `PR队列_W1W3_教练解释层与每日一题与听牌计算器_2026-09-14.md` | 3 个 PR 的可执行规格（与 §5 Phase B/C 重叠，以本文件为准） |
| `i18n文案表_教练反馈与32成就_2026-09-14.md` | **32 成就完整 name/desc × 3 语**（约 100 行，直接复制）。⚠️ 需补其余 6 个 locale |

**可点击原型**（验证手感，非规格）：`AI教练交互原型_v8` · `教练演出层与牌桌布局原型_v9` · `教练第五角色_教练席方案原型_v10` · `教练结算复盘原型_v11` · `教练每日一题算番工具原型_v7`

---

## 附：Phase 依赖总表（贴在编辑器旁边用）

```
Phase A  止血 + 地基
  A1 区域桌降级沉默 ─┐
  A2 契约层          ─┴─→ 后面全部依赖 A2
        │
Phase B  教练会说话（用户感知最强）
  B1 解释层 + 反馈卡 ←── A2
  B2 五级输出 + 预算 ←── B1
  B3 三档改名 + live 收紧 ←── B1（可独立上线删除部分）
        │
Phase C  每日一题 + 外链工具（SEO 收益最大）
  C1 streak 完成条件  ←── 无依赖（可最先上）
  C2 今日一题 + 分享卡 ←── C1
  C3 听牌计算器       ←── A2
  C4 算番器 + 番种速查 ←── C3
        │
Phase D  第五角色（位置 + 演出）
  D1 教练席           ←── B1（卡要挂进列里）
  D2 演出层序列帧      ←── D1
  D3 状态机与交互      ←── B2 + D2
        │
Phase E  结算复盘
  E1 ScoreResult 扩展  ←── 无依赖（可最先做）
  E2 复盘面板 A/B + 没胡 ←── E1
  E3 证据模板 + 三套算式 ←── E2
        │
Phase F  成就  ←── ✅ 无阻塞（v2：成就发皮肤，不发积分）
        │
Phase G  玩法能力补齐（G1 立直国标门槛 / G2 移动端 / G3 区域向听 / G4 放铳风险 / G5 道场色带）
```

**可以并行的三条线**（若有多人）：
- **线 1（局中体验）**：A1 → A2 → B1 → B2 → B3
- **线 2（SEO / 外链）**：C1 → C3 → C4（C3 只需 A2）
- **线 3（结算）**：E1 → E2（E1 无依赖，可最先开工）

**唯一不能并行的是 D1**：它改 `HongKongTable` 的 shell 结构，与线 1 的 B1/B3 都动 `MahjongTable.tsx` → **必须串行，且要重新对拍布局无回归**。

### 🔴 v2 跨文档串行点（与「积分转成就」执行规格的交叉依赖）

```
积分重构 Phase A（删货币）
  A1 删积分常量 ─┐
  A2 ActionLog  ─┼─→ 教练 Phase F 全部依赖
  A4 前端显示    ─┤   （成就表建在 A2 之后）
  A5 道具额度    ─┘
        │
教练 Phase F
  F1.2 LearningStat 建表 ←── ⚠️ 必须先做「教练 D2：删 streak 三字段」
  F1.4 皮肤↔成就对应     ←── 积分重构 B1（外观解锁条件迁移）
```

> ⚠️ **唯一必须串行的点**：**`LearningStat` 去 streak 字段必须在建表之前做**。晚了就要写 migration 改表。

---

## 附：三条实现红线（每个 PR 描述里都要写）

1. **`coach.ts` 只做纯函数，不含文案** —— 返回语义码，措辞在渲染层。多语种（**现为 9 个 locale**）无法维护。
2. **所有行为记录 / 成就判定在服务端** —— 客户端只上报 `{seed, moves[]}`；服务端用确定性引擎重放验证。⛔ 客户端绝不上报进度、统计指标或"已解锁"。
3. **新页面必须用 `portal-*` 令牌类** —— 零硬编码色值。已有 20 条硬编码泄漏清单，**工具页与教练席是新代码，不要重犯**。

> **v2 追加一条（第 4 条）**：
> 4. **⛔ 不引入中间货币、不新增美术资产** —— 任何"成就币 / 学习点 / 道场币"或"为了奖励而画的皮肤"都是回退（支柱 P1 + P2）。奖励只能用**已存在的 5 件皮肤 + 徽章 + 进度条**表达。