# AI 教练方案审查 · 遗漏与闭环缺口

> **审查对象**：`D:\mahjonggamebox\mahjong-hub\mahjong-hub\docs\AI_COACH_IMPLEMENTATION_SPEC.md`（v2，2,285 行）
> **审查日期**：2026-09-17
> **审查方法**：逐节通读规格 + 逐项核对仓库实际状态（`lib/locales.ts` / `prisma/schema.prisma` / `lib/achievements.ts` / `lib/appearance.ts` / `messages/` / `prisma/migrations/`）
> **结论**：**26 处问题**。规格的**认知基准已落后于仓库**——它假设"9 语"和"成就系统为零"，而仓库实际是"3 语"且"成就已半成品落地"。这导致部分要求**工作量虚高 3 倍**，且有 1 条要求**会破坏已上线的决策**。

---

## 摘要：三个结构性误判

| # | 规格假设 | 仓库实际 | 危害 |
|---|---|---|---|
| **①** | i18n 有 **9 个 locale**（反复强调 11 次） | **只有 3 个**（en/zh/zh-TW），其余 6 个已退役 | 🔴 执行者会**复活已退役 locale**；工作量虚高 3 倍 |
| **②** | 成就系统"**完全为零**" | 已落地 `lib/achievements.ts`(158行) + `achievements-server.ts`(60行) + 皮肤侧接线 | 规格 §1.2 / §F1.1 的现状描述过时，执行者会重做已有代码 |
| **③** | 契约层"**最大公约数**，不让强者被削平" | 契约保留了 `risk`/`note`，但 **B1 的反馈卡不消费它们** | 美式的差异化能力（risk/joker/outs）**在 UI 上无落点** → 设计原则在演出层退化为"最小公分母" |

---

## 一、P0 · 事实性错误（6 条 · 照做必错）

### P0-1 🔴 i18n：9 locale → 实际 3 locale（**最严重，会破坏线上**）

规格出现位置：§2 红线 10、§2.1、§6 头部、§6.4、§5-B1/C1/C2/C3 验收清单 —— **共 11 处**要求"全部 9 个 locale"。

仓库实际（`lib/locales.ts`）：

```ts
export const INDEXABLE_LOCALES = ['en', 'zh', 'zh-TW'] as const;          // ← UI 只有 3 个
export const RETIRED_LOCALES  = ['ja','ko','es','fr','de','pt-BR'] as const; // ← 6 个已退役
```

`messages/` 目录实况：`en.json` / `zh.json` / `zh-TW.json` + `_retired/`（内含 de/es/fr/ja/ko/pt-BR 六个）。

**危害（不只是工作量的错）**：
- 执行者按"9 locale"在 `messages/` **顶层**新建 `ja.json` / `ko.json` / `es.json` / `fr.json` / `de.json` / `pt-BR.json` → **等于复活已退役的 locale**
- 这 6 个 locale 的 URL 已被 **308 重定向到 /en**（见 `RETIRED_LOCALES` 注释）。顶层出现同名消息文件会让 i18n 路由**产生歧义**
- 工作量虚高 3 倍（3 ns × 9 locale → 实为 3 ns × 3 locale）

**⚠️ 规格自相矛盾**：§6.4 的自检脚本写法**是对的**（"真源是 `messages/` 目录下实际存在的文件"），它会输出 `parity: 3 locales checked` —— **脚本与正文打架**。

**修正**：把全文的"9 个 locale"改为"**3 个 locale（en / zh / zh-TW）**"，并注明"其余 6 语已退役，消息文件在 `messages/_retired/`，**不要复活**"。§2 红线 10 的理由也应改为"缺 key → next-intl 整页 500"（这条本身仍成立）。

> 📌 注：`data/blog-i18n/` **确实有 9 个 locale**（博客内容）。规格疑似**把 blog-i18n 的语种集错套到 messages 上**。

### P0-2 🔴 `AchievementUnlock` 的规格 DDL 与实现完全不同（4 处偏差）

| 项 | 规格 §F1.2 | 实际（schema.prisma:201-210） |
|---|---|---|
| 主键 | `id String @id @default(cuid())` | **无 `id`**，`@@id([userId, achievementId])` 复合主键 |
| 字段名 | `achievement String` | **`achievementId`** |
| 唯一约束 | `@@unique([userId, achievement])` | 无（复合主键已保证） |
| 判重方式 | `evidence Json?` | **无 `evidence` 列** |

⚠️ §9 只记录了 `evidence` 一项偏差 → **另 3 处未记**。

**修正**：§F1.2 的 DDL 整块替换为 `schema.prisma` 的实际定义，或删除 DDL 改为"见 `schema.prisma:201`"。

### P0-3 🔴 `LearningStat.patternsSeen` 类型不一致

| 来源 | 类型 |
|---|---|
| 规格 §F1.2 | `patternsSeen String[] @default([])` |
| 实际 `schema.prisma:195` | `patternsSeen Json?` |
| 迁移 `20260916120000` | `"patternsSeen" JSONB` |

**修正**：规格改为 `Json?`，并补一句"存 `string[]` 数组的 JSON"（否则实现者会写 `String[]` 语法）。

### P0-4 🔴 `AppearanceUnlock.source` 枚举清单错误

| 来源 | 值集 |
|---|---|
| 规格 §F1.1 | `'free' \| 'seasonal_checkin' \| 'achievement'` |
| 实际 `schema.prisma:178` | `seasonal_checkin \| achievement \| legacy \| grant` |

**两处不符**：① 实现有 `legacy` 和 `grant`，规格没写 ② 规格多了 `free`（实现里没有）。

**关键**：迁移 `20260916120000` 第 63 行正是 `UPDATE "AppearanceUnlock" SET "source"='legacy' WHERE "source"='points'` —— **`legacy` 是这次迁移新造的值，规格完全没提**。

**修正**：补上 `legacy`（历史 points 购买遗留）与 `grant`（管理端发放）。

### P0-5 🔴 `ActionLog.value` 是 NOT NULL，但规格示例代码没写

```prisma
model ActionLog {
  value Int @map("amount")   // ← NOT NULL，无默认值
}
```

规格 §F1.2b 示例代码：
```ts
await tx.actionLog.create({ data: { userId, action: 'hand_finish', meta: { seed: payload.seed } } });
//                                                                  ↑ 缺 value
```
→ **照抄会运行时违反 NOT NULL**。

✅ 实际 `lib/points-server.ts` 写的是 `value: 0`（正确）。**规格示例会误导实现者**。

**修正**：示例补 `value: 0`，并加注释"该列保留是为免生产迁移，恒写 0，**它不是余额**"。

### P0-6 🔴 `ScoreResult.handShape` 缺可选标记（语法错误）

规格 §E1：
```ts
// —— 新增：全部可选，避免影响现有 5 处调用点 ——
handShape: 'standard' | 'sevenPairs' | 'thirteenOrphans';   // ← 没有 `?`
```
注释声称"全部可选"，但**该字段没有 `?`**。照抄会让现有 5 处 `ScoreResult` 调用点**全部编译失败**——恰好违反本 WP 自己的验收标准。

**修正**：改为 `handShape?: ...`。

---

## 二、P1 · 逻辑不闭环（13 条 · 做出来会不对）

### 组 A：跨阶段契约（4 条）

#### P1-1 🔴 A2 落地会让**立直/国标教练静默**（功能回退，风险表未记）

- §1.3 现状：立直/国标 `partial`，但**有输出**（`⚠️ 一行 span`）
- §4.4 `hongkong.ts`：
  ```ts
  if (capability !== 'full') return { grade: null, capability };   // ← 立直/国标 = partial → 静默
  ```
- A1 只声明"**区域桌**降级静默"，**没意识到 A2 会连带静默立直/国标**

**后果**：立直/国标从"有（可能不准的）反馈"变成"**零反馈**"。这是**用户可感知的功能回退**，风险登记表 §9 里**没有这一条**。

**修正**：在 §9 新增风险条目，明确"A2 生效后立直/国标教练进入 `watching`，属**有意降级**"，并绑定 G1 的恢复承诺。或在 A2 加过渡策略（如立直/国标保留 L1 记号 + 标注"未校验役种门槛"）。

#### P1-2 🔴 "Phase F 无阻塞" ↔ "唯一必须串行的点" 自相矛盾

| 位置 | 表述 |
|---|---|
| §0.1 执行顺序 | `Phase F 成就（**无阻塞** —— 成就发皮肤，不发积分）` |
| §附 v2 跨文档串行点 | `F1.2 LearningStat 建表 ←── ⚠️ **必须先做**「教练 D2：删 streak 三字段」` + "**唯一必须串行的点**" |

**且引用章节号错误**：`D2` 是 `<CoachStage>` 序列帧演出层，**与 streak 三字段毫无关系**。删 streak 是 **F1.2 自己**的事。

**修正**：统一为"Phase F 无外部阻塞；仅 F1.2 内部需先定 streak 归属（已在 v2 定案）"，删除对 D2 的错误引用。

#### P1-3 🔴 奖励映射**双源**，无权威源

| 文件 | 映射方向 |
|---|---|
| `lib/appearance.ts:119-132` | 皮肤 → 成就（`unlock:'achievement'` + `achievementId:'clean-hand'`） |
| `lib/achievements.ts:86-92` | 成就 → 皮肤（`ACHIEVEMENT_REWARDS['clean-hand']='deep-sea-blue'`） |

**同一关系两份数据，规格 §F1.4 只给了一份对照表，未规定谁是权威源** → 改一边忘另一边就漂移。

**修正**：明示"**权威源 = `lib/appearance.ts` 的 `achievementId`**；`ACHIEVEMENT_REWARDS` 是它的反向索引，必须同步"，或在 §7.2 加一条单测断言两表互逆。

#### P1-4 🔴 契约保留 `risk`/`note`，但 B1 的反馈卡**不显示** → 美式优势被削平

- 契约 `CoachVerdict` 有 `risk?: CoachRisk` 和 `note?: string`
- 美式 adapter 填了这两个字段（§4.4）
- **但 §5-B1 的 `CoachPanel` 卡片布局只显示**：grade 徽标 / `suggested` / gap / shanten / ukeire
  → **`risk` 与 `note` 没有落点**

**这直接违反 §1.1 的核心原则**："统一必须取最大公约数，**不让强者（美式）被削平**"。

**修正**：B1 的卡片加一行"风险"展示（`risk` → 低/中/高 三色文字），并规定 `note` 的渲染位置。否则美式最有价值的能力（点炮风险）全站不可见。

### 组 B：成就动机链（5 条）

动机链设计为：**行为 → 成就 → 皮肤 → 装备**。审查发现这条链在实现层**断了 3 个环节**。

#### P1-5 🔴 F1.4 档位表 ↔ 奖励表**数量对不上**

| 档 | 规格 §F1.4 写的 | 实际可发皮肤数 |
|---|---|---|
| Gold | 7 项 → "徽章 + **1 件 premium 皮肤**" | **只有 3 件**（`clean-hand`/`all-sequences`/`half-flush`） |
| Platinum | 3 项 → "徽章 + **限定皮肤**" | **只有 2 件**（`big-dragons`/`daily-thirty`）→ `thirteen-orphans` **无皮肤** |

实现是 `Partial<Record<AchievementId, AppearanceId>>`（**刻意只发 5 项**）✅ 实现是对的。

**问题在规格文字**：读起来像"每项都发皮肤"。Gold 7 项只有 3 件可发、Platinum 3 项只有 2 件可发 —— **差额（4 项 Gold + 1 项 Platinum）无奖励**。

**修正**：档位表的"回报"列改为「**徽章 + 进度条**（其中 3 项另发皮肤）」，并附完整 5 条映射（不遗漏说明哪些无皮肤）。

#### P1-6 🔴 F1.5 的"四组 A/B/C/D"与 F1.4 的"四档 B/S/G/P"是**两套分类，映射表缺失**

- §F1.4 按**档位**分：Bronze 10 / Silver 12 / Gold 7 / Platinum 3
- §F1.5 按**主题组**分：A 里程碑 5 / B 决策质量 8 / C 番种探索 12 / D 玩法坚持 7

**两套各 32 项，但交叉映射从未给出** → 实现者无法知道"`clean-hand` 属于哪一组、哪一档"。

✅ 实际 `lib/achievements.ts:47-84` 的 `ACHIEVEMENT_TIERS` 已解决档位问题。**但"组"信息在代码里不存在** → 成就墙 UI（§F1.7 "分四组 Tab"）**无数据支撑**。

**修正**：规格补一张 32 项的「id → 组 → 档 → 奖励」总表（可直接从 `ACHIEVEMENT_TIERS` + `ACHIEVEMENT_IDS` 注释生成）；若放弃分组 Tab，则删掉 §F1.7 的"分四组"。

#### P1-7 🔴 `recordHandOutcome` 未实现 → **30/32 项成就无触发入口**

现状（实测）：
- ✅ `evaluateCheckInAchievements(userId, streak)` 存在 → 只覆盖 `daily-seven` / `daily-thirty`（**2 项**）
- ❌ §F1.2b 的 `recordHandOutcome` **不存在** → A 组（5 项里程碑）+ B 组（8 项决策质量）+ C 组（12 项番种）全部**无法触发**

**即成就系统目前是半成品**：表在、定义在、签到在，**局末判定主干缺失**。

**修正**：把 §F1.2b 提为 **F1 的第一优先 WP**（当前它写在 F1.2 之后，容易被当成补充说明）。并给出 `replayGame` / `stateBeforeMove` 的实际导入路径（规格未给）。

#### P1-8 🔴 F1.7 进度条**全为 null** → "奖励前置展示"的动机闭环断裂

`lib/achievements-server.ts`：
```ts
progress: null,   // ← 全部 null，注释：Placeholder until LearningStat-backed progress lands
```

规格 §F1.7 的两条 🔴 要求：
1. "未解锁的成就**必须显示进度**（`7 / 10 局`），不要灰掉一片"
2. "v2 新增：未解锁的成就**必须显示解锁什么皮肤**"

第 2 条 ✅ 已实现（`rewardAppearanceId`）。**第 1 条 ❌ 未实现**。

**设计影响**：§F1.7 的排序规则"未完成按**完成度降序**（制造'就差一点'的心理拉力）"**也无法实现**——没有完成度数据。

**修正**：F1.7 依赖 `LearningStat` 的 5 个计数器，需在 F1.2b 落地后补一个 `progressFor(id, stat, streak)` 纯函数。规格应明确这个依赖，并标 [PLACEHOLDER] 说明"进度条在 LearningStat 落地前显示'未解锁'"。

#### P1-9 🔴 `guest_merge` 幂等机制**不成立**

§F1.6：
> 游客本地事件批量写入 `ActionLog`，以 `action: 'guest_merge'` 作**哨兵行**保证幂等

但 `PointTransaction`（`ActionLog` 的物理表）**没有唯一约束**：
- 主键是 `id`（cuid，每次新建都不同）
- 索引只有 `[userId, reason, createdAt]` 和 `[reason, createdAt]`

→ **多条 `guest_merge` 行无法被识别为"同一批"** → 幂等不成立，重复上报会重复计数。

**修正**：要么改用 `meta.mergeKey` + 查询判重（先查后写），要么在迁移里加唯一约束。规格必须写明机制，否则实现者会照抄一个不工作的方案。

### 组 C：教练行为定义（4 条）

#### P1-10 🔴 "禅档"的定义**三处冲突**

| 位置 | 对"禅档"的描述 |
|---|---|
| §5-B3 | `silent` = Zen = "**教练离席**" |
| §5-D1 | 禅模式 → 教练离席 → `designWidth 980`，**牌桌变宽 14%** |
| §5-E2 D7 | "禅档关闭教练的**打扰**，不关闭玩家获取信息的权利" → **保留静态入口** |
| §4.3 | `unsupported` = "**watching** 态：present, blinks, nods, does not evaluate" → **教练在场** |

**核心矛盾**：禅档的教练是 **①不渲染（离席）** 还是 **②在场但沉默（watching）**？

- 若①，则 §E2 D7 的"静态入口"没有宿主（教练席不存在了）
- 若②，则 §D1 的"牌桌变宽 14%"不成立（教练还在，列宽不变）

**修正**：明确定义三者关系。建议：`silent`(禅) = **离席，牌桌变宽**；`unsupported` = **在场 watching**；静态入口改为**牌桌内的独立按钮**（不依赖教练席）。三者需在同一张表里列清。

#### P1-11 🔴 "听牌时教练沉默" 与 L2 触发条件**冲突**

| 规则 | 内容 |
|---|---|
| §5-B2 L2 触发 | `better` **或**连续 3 次 `best` |
| §5-B2 情绪曲线 | **听牌时**：教练沉默（除 L1） |
| §5-B2 验收 | 听牌时（`shanten <= 0`）**无 L2/L3** |

**冲突场景**：玩家已听牌，却打出一张**拆听**的牌（`better` + `worse-shanten`）——**这是整局最该提醒的一手，但规则要求沉默。**

**规格没有解释这个 trade-off**（"最高压时刻不该被打扰"只覆盖了"正确打牌"的情况，没覆盖"听牌时犯错"）。

**修正**：改为"听牌时**不为 `best` 出 L2**（去掉'连续3次best'的表扬），但 `better` **仍触发** L3"。或明确写出"接受'听牌时犯错也不提醒'的代价"并给出理由。

#### P1-12 🔴 `discloseReveal` 的判定机制**缺失**

`CoachReview.discloseReveal?: boolean` 注释："First-ever settlement review: disclose that tiles are revealed now."

**但"首次"靠什么判定？** 规格未给：
- localStorage key？—— 与 D3 的 `mahjong-hub.coach-onboarded.v1` 是同一个还是两个？
- DB 字段？—— `LearningStat` 里没有对应字段

**修正**：明确存储位置。建议复用 `mahjong-hub.coach-onboarded.v1` 拆成两个键（`coach-onboarded.v1` 与 `coach-reveal-disclosed.v1`），并写入 `coach-prefs.ts`。

#### P1-13 🔴 工具页与教练**立场不一致**（同一手牌，两种态度）

- §5-B1：`capability !== 'full'` → `judge()` 返回 `{grade: null}` → **立直/国标教练沉默**
- §5-C3：`/tools/waits` 的 `r` 参数支持 `hongkong | riichi | chinese-official` → **对三者都给出 `rankDiscards` 的排名**

→ **同一手牌**：牌桌里教练说"我不评价"，工具页却给出"这是最优牌"。

**后果**：玩家会认为"教练说不确定，工具页说最优"= **系统自相矛盾**，削弱 A1 止血建立的诚实性。

**修正**：工具页对 `riichi`/`chinese-official` 加**显式声明**（"本工具的进张计算**不含役种门槛**，'最优'仅在效率维度成立"），与教练的 `partial` 立场对齐。

---

## 三、P2 · 表述与维护性（7 条）

| # | 问题 | 位置 | 修正 |
|---|---|---|---|
| **P2-1** | **红线数量三处不一致**：标题"12 条" / 表格 12 条 + §2.2 新增 3 条 = **15** / 文末"三条实现红线"+1 = **4** | §2 标题、§2.2、文末附 | 统一编号为 **15 条**（或重组为"12 硬约束 + 3 支柱约束"），文末"三条实现红线"改为"红线速记"并标注它是 **§2 的子集** |
| **P2-2** | §1.2 说成就系统"**完全为零**" | §1.2 表格 | 改为"已落地 `achievements.ts` / `achievements-server.ts`；**缺口 = 局末判定入口 + 进度条**" |
| **P2-3** | §6 说"现有 ns = **28**"、"新增 3 个 ns（coachFb/tools/**achievements**）" | §6 头部 | 实际 **29** 个，**`achievements` 已存在** → 改为"新增 2 个 ns（`coachFb` / `tools`）" |
| **P2-4** | §8 P-3（立直/国标是否有役种门槛）标"待验证" | §8 | §1.3 已明确"⚠️ **无役种门槛**" → P-3 应为"**已确认：未考虑**"，改为阻塞 G1 的已知前提 |
| **P2-5** | §8 P-1 说"中位数 < 2 则 **v1.1** 必须提前" | §8 P-1 | "v1.1"**全文未定义** → 需说明 v1.1 指什么（立直进阶题？多巡题？） |
| **P2-6** | `COACH_CAPABILITIES` 用 `satisfies Record<string, CoachCapability>` | §4.3 | `Record<string,...>` 太宽，**类型层不保证 key 完整性** → 应改 `Record<Ruleset, CoachCapability>`（需先确认全局 `Ruleset` 与 6 玩法一致） |
| **P2-7** | 美式**如何升级到 `full`** 未写 | §4.3 升级路径 | 只写了 riichi/mcr/sichuan/taiwan 的升级路径 → 补美式（或明确"美式**永久 `partial`**，因其不判 grade"） |

---

## 四、修复优先级（建议执行顺序）

```
立即（阻断型，改规格不改代码）
├─ P0-1  9 locale → 3 locale（含"不要复活 _retired"警告）    ← 最优先
├─ P0-2  AchievementUnlock DDL 整块替换
├─ P0-3  patternsSeen → Json?
├─ P0-4  source 枚举补 legacy / grant
├─ P0-5  ActionLog 示例补 value: 0
└─ P0-6  handShape 加 ?

随后（规格逻辑补全，仍不改代码）
├─ P1-2  统一"无阻塞"表述 + 修 D2 错误引用
├─ P1-5  F1.4 档位表回报列改准
├─ P1-6  补 32 项「id→组→档→奖励」总表
├─ P1-10 明确 silent / unsupported / 静态入口 三者关系
├─ P1-11 听牌沉默规则收敛
└─ P1-13 工具页加 riichi/mcr 诚实声明

落地时处理（涉及实现）
├─ P1-7  recordHandOutcome 提为 F1 首优先
├─ P1-8  进度条依赖 LearningStat（当前 null）
├─ P1-9  guest_merge 幂等机制重设计
├─ P1-12 discloseReveal 存储位置
├─ P1-1  A2 的立直/国标降级写入风险表
├─ P1-3  奖励映射标注权威源 + 加互逆单测
└─ P1-4  B1 卡片消费 risk/note
```

---

## 五、无问题项（已核对通过，可放心执行）

避免过度修正，以下经实测**与规格一致**：

| 项 | 核对结果 |
|---|---|
| 6 个迁移目录名 | ✅ 与 §附依赖表引用一致 |
| `AchievementUnlock` 用复合主键 `@@id([userId, achievementId])` | ✅ 幂等正确（`unlockAchievement` 靠 PK 冲突返回 false） |
| 32 项成就 id 与四档分布（10/12/7/3） | ✅ `lib/achievements.ts` 完全一致 |
| 5 件皮肤（4 premium + 1 limited） | ✅ `lib/appearance.ts` 一致 |
| 美式适配器 4 处修正 | ✅ 已写入 §4.4 修订块 |
| P-6 / P-7 两个实证结论 | ✅ 数字核对无误（978px vs 980px；`top-14` vs `h-11`） |
| `lib/mahjong/coach/` 不存在 | ✅ A2 未开工，符合预期，可正常开工 |
| `coachFb` / `tools` ns 不存在 | ✅ 需新增（`achievements` 已有） |
| 红线 1/2/3（纯函数 / 零依赖 / 只追加） | ✅ 设计无懈可击 |

---

## 附：核对方法与证据

```bash
# 语种集（证明只有 3 个）
cat lib/locales.ts            # INDEXABLE_LOCALES / RETIRED_LOCALES
ls messages/ messages/_retired/

# schema 与规格 DDL 对比
grep -n "^model " prisma/schema.prisma
sed -n '189,210p' prisma/schema.prisma

# 成就定义与奖励映射
sed -n '1,158p' lib/achievements.ts
cat lib/achievements-server.ts    # progress: null 占位

# 皮肤侧接线（双源证据）
grep -n "unlock\|achievementId" lib/appearance.ts

# ns 集（证明 29 个、achievements 已存在）
node -e "console.log(Object.keys(require('./messages/en.json')).length)"

# 迁移内容
cat prisma/migrations/20260916120000_action_log_achievements/migration.sql
```
