# 麻将知识挑战 · Mahjong Challenge · 执行规格

> **给 Cursor 执行。** 所有未经 playtest 的数值标 `[PLACEHOLDER · 验证路径]`。
> 已定决策：2026-09-17（用户拍板，见 §1）
> 路由：`/challenge`

---

## §0 一句话定位

**Fun hypothesis**
> 这玩法好玩的核心是「**用 30 秒确认自己到底懂不懂麻将，并把这个结果拿去挑战朋友**」。
> 它卖的不是难度，是 **"我懂" 的自我确认 + 可比的社交货币**。

**Design pillars**（每条决策用它过审）

| # | Pillar | 含义 |
|---|---|---|
| P1 | **新手能参与** | 目标用户是 SEO 教学博客带来的麻将新手 —— 题目必须"看得懂、答得出" |
| P2 | **每个结果都值得分享** | **包括答得很差**。分享是传播引擎，只有高分者愿意发 = 传播量减半 |
| P3 | **零门槛零惩罚** | 无失败、无倒计时、无需注册 |
| P4 | **答案有权威出处** | 每题答完都链到站内术语表 / 教学文章（E-E-A-T） |

---

## §1 已定决策

| # | 议题 | 决定 | 依据 |
|---|---|---|---|
| 1 | 首屏与 H1 | 一键开局置顶；H1 还给站点定位 | 已成站点规则 → `docs/SITE_RULES.md` R1 / R2 |
| 2 | 题型 | **复合型**：知识题 **+ 看图认牌** | 纯文字题对新手太干，看图题更友好、可复用现有牌面组件 |
| 3 | 节奏 | **两者都要**：每日一套（回访）+ 挑战链接随时玩（传播） | 回访与传播是两个不同的钩子，不互相替代 |
| 4 | 称号 | **仅分享展示层** —— 不落库、不进个人中心 | 零系统债；避免在刚删完货币属性后再开一个"称号经济" |
| 5 | 路由 | **`/challenge`** | — |

---

## §2 题库来源（全部是已有资产）

🔴 **重要事实：麻将术语表/词典已经存在，不是待建。**

| 现有资产 | 规模 | 位置 |
|---|---|---|
| 术语词条 | **38 个**（3 语） | `data/glossary/terms.json` |
| 术语定义 | **32 条**一句话定义 | `data/glossary/definitions.ts` |
| 术语分组 | **6 组** | `data/glossary/definitions.ts → GLOSSARY_GROUPS` |
| 术语页 | 已上线，含 `DefinedTermSet` JSON-LD | `app/[locale]/(public)/learn/glossary/page.tsx` |
| 术语内链基建 | 已存在 | `lib/glossary-autolink.ts`、`lib/article-links.ts` |
| 教学文章 | **13 篇** cornerstone | `data/blog-i18n/en.json` |
| 牌面命名 i18n | 3 语 | `messages/*.json → tiles` ns |

**6 个分组 → 题型映射**

| 分组 | 词条 | 数量 | 适合题型 |
|---|---|---|---|
| `tiles` | mahjong_tile / number_tiles / character_tiles / bamboo_tiles / dot_tiles | 5 | **看图认牌** |
| `honours` | honor_tiles / wind_tiles / dragon_tiles | 3 | **看图认牌** |
| `calls` | chow / pong / kong / exposed_kong / concealed_kong / draw_tile / discard_tile | 7 | 术语释义 |
| `winning` | win_hand / waiting_hand / self_draw_win / deal_in_win / rob_kong_win / kong_bloom_win / last_tile_win / single_tile_wait | 8 | 术语释义 |
| `patterns` | pure_one_suit / mixed_one_suit / seven_pairs / all_pungs_hand / four_triplets / all_simple_tiles / all_sequences_hand | 7 | 术语释义 |
| `table` | player_hand / tile_wall | 2 | 术语释义 |

→ **8 个牌面词条支撑看图认牌；24 个规则词条支撑术语题。**

> ⚠️ 注意：`terms.json` 有 38 词条，但 `definitions.ts` 只有 32 条定义 —— 差的 6 条是**营销类词条**（`easy_learn_play` / `beginner_friendly` / `casual_relaxing_gameplay` / `improve_winning_chance` / `multiplayer_real_time_game` / `clear_simple_rules`），故意不给定义。**出题只能用那 32 条。**

`[PLACEHOLDER · 首期题量]` 目标 **60 题**（32 个术语 × 1–2 题 + 13 篇博客 × 2 题），每日抽 5 题 → **约 12 天不重复**。
`[PLACEHOLDER · 若首期太重]` 可先出 **20 题** 验证循环，再扩。**出题 + 审校是持续运营工作，不是一次性开发任务。**

---

## §3 玩法

### 3.1 两个入口

| 入口 | seed 来源 | 钩子类型 |
|---|---|---|
| **每日一套** | `hash(utcDate)` | 回访 —— "今天全球同题" |
| **挑战链接** | `?c=<seed>` | 传播 —— 好友答**同一套题** |

⛔ 同一 seed 必须产出**完全相同**的题目与选项顺序（跨设备、跨时区一致）。

### 3.2 单局结构

`[PLACEHOLDER · 题量]` 每套 **5 题**，逐题即时反馈（对/错 + 一句解释），5 题后出结果卡。

| 序 | 题型 | 配比 `[PLACEHOLDER]` | 交互 |
|---|---|---|---|
| 1–2 | **看图认牌** | 2 | 展示一张牌（复用现有 `Tile` 组件），4 个文字选项 |
| 3–4 | **术语释义** | 2 | 给出定义，4 个术语选项（或反向） |
| 5 | **规则 / 番种** | 1 | 取材自 13 篇核心文章 |

**每题答完必给一句"为什么" + 一条站内链接**（见 §6.2）。

### 3.3 抽题算法（必须确定性）

```
seed → PRNG（⛔ 不用 Math.random）
     → 按题型配比从池中抽题
     → 每题的选项顺序同样由 seed 决定
```

- ⛔ **不使用 `Math.random`** —— 与 `lib/mahjong/` 的「零 `Math.random`、可重放」原则一致
- `[PLACEHOLDER · 循环上限]` 抽题循环上限 **64 次**；超限则降级为「按固定顺序取前 5 题」
- ⚠️ **降级路径也必须是确定性的** —— 否则不同设备会拿到不同题目

### 3.4 URL 结构

| 场景 | URL |
|---|---|
| 每日 | `/challenge`（内部用当天 seed） |
| 挑战链接 | `/challenge?c=<seed>` |

- `?c=` **只含 seed** —— 不带题目、不带答案、不带分数
- 分享者的成绩**由分享文本携带**，不写入 URL（避免"结果可被伪造/篡改"的观感）
- `[PLACEHOLDER]` seed 编码需短（≤10 字符）；必要时加校验位以防手改

---

## §4 称号系统（仅分享展示层）

### 4.1 为什么这么做

不落库 = **零系统债**（无新表、无稀有度定义、无防刷逻辑），且每次答题都是**独立的结果描述**，天然可重复获得。称号不是资产，是**当下的自我描述**。

### 4.2 设计原则（关键）

> **每一个成绩都必须有一个值得分享的称号 —— 包括 0 分。**

理由：分享是传播引擎。如果只有高分者愿意发，**传播量直接减半**。所以称号分两类：
- **荣誉型**（3 分及以上）→ 炫耀驱动
- **趣味型**（2 分及以下）→ 自嘲驱动（传播力常常更强，因为它不招人烦）

### 4.3 主称号（按答对数，6 档）

| 答对 | EN | ZH | zh-TW | 类型 |
|---|---|---|---|---|
| 5/5 | **Grand Master** | 麻将通 | 麻將通 | 荣誉 |
| 4/5 | **Tile Scholar** | 牌理学者 | 牌理學者 | 荣誉 |
| 3/5 | **Steady Hand** | 稳健之手 | 穩健之手 | 荣誉 |
| 2/5 | **Still Learning** | 入门学徒 | 入門學徒 | 趣味 |
| 1/5 | **Lucky Guess** | 蒙对一手 | 矇對一手 | 趣味 |
| 0/5 | **Blank Tile** | 白板一块 | 白板一塊 | 趣味（梗） |

**设计说明**
- 5/5 选 **Grand Master** 而非更花哨的词：目标用户对麻将不熟，**直白的"大师"最易理解、最易炫耀**
- 0/5 选 **Blank Tile / 白板一块**：0 分 → 白板。麻将梗、**自嘲但不羞辱**、且是最好记的一档。**这一档是刻意设计的，不是凑数** —— 它让最差的结果也有分享理由（对应 P2）
- 中英不直译：`Blank Tile` 与「白板一块」各自是本地梗，不是互译

### 4.4 专精标签（可叠加 1 个）

若 5 题中答对 ≥2 题集中在同一题材，追加一个专精标签：

| 条件 | EN | ZH |
|---|---|---|
| `tiles` + `honours` 答对 ≥2 | **Tile Spotter** | 认牌高手 |
| `calls` 答对 ≥2 | **Call Master** | 鸣牌行家 |
| `winning` 答对 ≥2 | **Win Reader** | 和牌通 |
| `patterns` 答对 ≥2 | **Pattern Reader** | 番种解读者 |

→ 结果卡展示：`答对 4/5 · Tile Scholar · Pattern Reader`

叠加标签让结果**个人化**（"我擅长番种"），比单一分数更愿意分享。

**i18n 成本**：主称号 6 × 3 语 = 18 条；专精标签 4 × 3 语 = 12 条。**合计 30 条。**

### 4.5 ⛔ 明确不做

**全球稀有度百分比**（"只有 2.3% 的玩家达成"）—— 这是 Steam 成就**最强的分享杠杆**，但本方案不落库 → **拿不到真实数据**。一期显示即等于编造。
→ 后续若接入匿名计数（G0 门控已有此基建），作为二期增强。

`[PLACEHOLDER · 待确认]` 档位命名需人工过一遍语感，尤其 `Blank Tile` / 「白板一块」这类梗的接受度因人而异。

---

## §5 分享

### 5.1 分享文本（Wordle 式纯文本）

⛔ **不做成图片**（社交平台会把图压成缩略图，纯文字反而完整可读）
⛔ **不剧透**：不出现题目、不出现答案

```
🀄 TileDojo · Mahjong Challenge
I got 4/5 — Tile Scholar, Pattern Reader
Think you know mahjong? Beat me ↓
mahjonggame.org/challenge?c=7f3a91
```

中文：
```
🀄 TileDojo · 麻将挑战
我答对 4/5 —— 牌理学者 · 番种解读者
你比我更懂麻将吗？来试试 ↓
mahjonggame.org/challenge?c=7f3a91
```

**三个要点**
1. 末句是**挑战**不是**通知**（"你能超过我吗" > "我得了 4 分"）
2. 链接只带 seed → 好友拿到**同一套题**
3. **低分模板同样提供**（只换称号为趣味型）—— 对应 P2

### 5.2 每日成绩分享

每日一套额外带日期，便于日常对话（"今天你答了吗"）：
```
🀄 TileDojo · Mahjong Challenge #2026-09-17
I got 3/5 — Steady Hand
```

### 5.3 渠道

- 主：`navigator.share()`（移动端系统面板，覆盖 WhatsApp / X / FB）
- 备：`navigator.clipboard.writeText()` + "已复制"提示
- ⛔ 不自建社交按钮组（维护成本高、覆盖差）

---

## §6 SEO 与内链

### 6.1 `/challenge` 页结构

页面骨架**必须服务端渲染**（不依赖日期），否则对爬虫是空盒子：

- `<h1>` = 本页主题（⛔ 不是首页；首页规则见 `docs/SITE_RULES.md`）
- 静态说明段：这玩法是什么、怎么答、共几题
- **静态考点范围段**：说明会考哪些方面（术语 / 认牌 / 规则）—— **不泄露具体题目**
- FAQ + `FAQPage` JSON-LD
- 题目本身可由客户端按 seed 计算（依赖日期），但**骨架必须 SSR**

### 6.2 内链 —— 本方案的核心 SEO 增值

**每题答完的"为什么"必须带一条站内链**：

| 题型 | 链到 |
|---|---|
| 术语释义 | `/{locale}/learn/glossary#{termKey}` ← **精确锚点**（术语页已有 `id={key}`） |
| 看图认牌 | `/{locale}/learn/glossary#{tileKey}` |
| 规则 / 番种 | 对应核心文章 `/{locale}/blog/{slug}` |

**这是双向闭环**：题目 → 术语表锚点；术语表 → 建议加"练一题"反向链。

> 说明：站内已有 `lib/glossary-autolink.ts`（术语自动内链基建）。本方案**不需要新基建** —— explicit 锚点链接即可，且**比自动内链更精准**（用户刚答完这一题，正好想看这一条）。

### 6.3 sitemap

`/challenge` × 3 locale = **+3 条**（87 → **90**）。
⛔ `?c=` 带参 URL **不进 sitemap**、**必须 `noindex, follow`**（无限参数组合）。

---

## §7 与现有资产的关系

| 现有资产 | 处理 |
|---|---|
| `data/glossary/`（38 词条 / 32 定义 / 6 组） | ✅ **直接复用，不新建词典** |
| `lib/glossary-autolink.ts` | ✅ 已有基建，本方案不新增内链逻辑 |
| `app/[locale]/(public)/learn/glossary/page.tsx` | ✅ 已上线，仅需加"反向链到挑战"（可选） |
| `components/HomeDailyHand.tsx` | **每日一局（打牌）与知识挑战是两件事**。按 `SITE_RULES.md` R1/R2，首页首屏让给开局入口；每日挑战降为第二区块卡片或整体迁入 `/challenge` |
| `components/HomeDailyChallenge.tsx` | ❌ **死代码**（全仓零引用）且含 `<h1>` → 删除 |
| `components/DailyChallengeCard.tsx` | ❌ **死代码** → 删除 |
| `components/HomeHero.tsx` | ⚠️ 死代码，但**结构正是 R1/R2 要的**（h1 = 定位词 + Play Now）→ 见 `SITE_RULES.md R2 修复路径` |
| `lib/daily/puzzles.ts` | `DAILY_PUZZLES: []` 空壳、零消费方 → **确认不做**（知识题不走 `{seed, moves[]}` 重放模型） |
| `messages/*.json → challenge` ns | ⚠️ **已存在但语义被占用** —— 现属"连连看每日板"（消费者 `HomeDailyChallenge` / `DailyChallengeCard` **均为死代码**），且含积分遗留 `reward: "+{n} points"`。**已定（09-18）：`/challenge` 归本知识挑战**，ns 需接管重定义（见 §8）。连连看每日板**由用户重新修改命名**，方向未定前 ⛔ 不动 |
| `messages/*.json → home` 死 key | `pointsBalance` / `dailyCheckInLine` / `checkInTitle` / `todayCheckIn` / `checkInClaimed` / `checkInNow` / `checkInDone` / `emailBonusHint` —— **积分时代遗留**（文案含 "pts"）→ 清 i18n 时一并删 |
| `messages/*.json → dailyHand` 死 key | `better` / `ok` / `best` / `shanten` / `ukeire` / `waits` —— 已被 `coachFb` ns 取代 → 删 |

---

## §8 i18n

- **`challenge` ns 需清理重定义**（清掉连连看遗留 key，加入本玩法的题目 / 称号 / 分享模板 / 页面文案）
  - ✅ **已定（09-18）：`/challenge` 路由与 `challenge` ns 均归本知识挑战**（用户拍板）
  - ⚠️ 连连看每日板**由用户重新修改命名**，方向未定前 ⛔ **不动**其代码与 i18n；两个死组件的删除也**暂缓**
  - ⚠️ 这是**接管既有 ns**，不是新建
- **3 个 locale**：`en` / `zh` / `zh-TW`（真源 `lib/locales.ts → INDEXABLE_LOCALES`）
  - ⛔ **不是 9 个**。`ja` / `ko` / `es` / `fr` / `de` / `pt-BR` 已退役（`messages/_retired/`），按 9 语建文件 = **复活退役 locale**
- **题目文案也是 i18n 的一部分**（题面 + 选项 + 解释），不是纯数据

`[PLACEHOLDER · 文案量]` 60 题 × 3 语 × (题面 + 4 选项 + 1 解释) ≈ **1,080 条**。若首期太重 → 先 20 题 ≈ 360 条。

---

## §9 验收

- [ ] 首页第一区块 = 一键开局；`<h1>` = `site.json.homeH1`（`SITE_RULES.md` R1/R2）
- [ ] `/challenge` 返回 200，**SSR HTML 含静态说明段**（非空盒子）
- [ ] `/challenge?c=<seed>` 返回 200 且带 `noindex, follow`
- [ ] 同一 seed 在 3 个不同浏览器/时区得到**完全一致**的 5 题与选项顺序
- [ ] 每题的"为什么"链接可点，落到术语表对应锚点 `#key`
- [ ] **低分档（0–2 分）也能生成分享文案**（P2 验收点）
- [ ] ⛔ 分享文本与 URL 中**不含题目、不含答案、不含分数参数**
- [ ] 6 套主题下配色跟随（用 `portal-*` 令牌，⛔ 零硬编码色值）
- [ ] 3 个 locale 无 `MISSING_MESSAGE`
- [ ] sitemap 87 → 90
- [ ] `npm run gate` 通过

---

## 附 · 待办与依赖

| # | 事项 | 类型 | 阻塞谁 |
|---|---|---|---|
| 1 | **出题 + 审校**（60 题 / 首期 20 题） | **运营（持续成本）** | 整个玩法 |
| 2 | 称号档位语感确认 | 设计（待用户过目） | 分享文案 |
| 3 | `challenge` ns 接管确认（连连看每日板是否彻底不做） | 决策 | i18n |
| 4 | 题量与配比调优 | `[PLACEHOLDER]` 待 playtest | — |
| 5 | 稀有度百分比 | 依赖匿名计数（G0 基建） | 二期 |
| 6 | 术语表 → 挑战的反向链 | 小改，可同期 | — |
