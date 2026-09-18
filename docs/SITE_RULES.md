# 站点硬规则 · SITE_RULES

> **站点级、跨功能的不可妥协约定。** 任何功能规格与本文件冲突时，**以本文件为准**。
> 文案真源：`data/site.json`；规则真源：本文件。
> 已确立：2026-09-17（R1–R3）／2026-09-18（R4 语种范围）

---

## R1 · 首屏第一区块 = 一键开局

**规则**
各 locale 首页（`/`）的**第一个内容区块**必须是「立即开局」入口：一个主 CTA，点击即进入可玩牌局。

**为什么**
站点定位就是 *Instant play, no download*（`data/site.json → siteDescription`、`messages/*.json → home.instantPlay`）。访客进站的第一诉求是"马上玩一局"，且本站所有牌局**无失败惩罚** —— 没有任何理由让人先做别的事。

**要求**
- 主 CTA 文案走 i18n（现成键：`home.playSolitaire`）
- 落点：`/games/mahjong-solitaire-classic`（与历史实现一致，见 `components/HomeHero.tsx:14`）
- ⛔ 签到、公告、推广位、每日挑战**一律不得**占据首屏第一区块（可出现于第二区块及以后）

**现状偏差**
~~`app/[locale]/(public)/page.tsx` 的第一区块是 `<HomeDailyHand />`~~ → **已修（2026-09-17）**：第一区块改为 `<HomeHero />`（Play CTA → solitaire classic），每日一局排第二。

---

## R2 · 首页 `<h1>` = 站点定位 SEO 关键词

**规则**
首页**有且仅有一个** `<h1>`，其文本 = 站点定位关键词。

- 真源：`data/site.json → homeH1`（当前值 `"Play Mahjong Online Free – Mahjong Solitaire, Riichi & Chinese Mahjong"`）
- 同值 i18n 键：`messages/*.json → home.heroTitle`
- 功能模块标题（每日挑战 / 游戏墙 / 学习卡片 / 术语表入口 …）**一律 `<h2>` 及以下**

**为什么**
`<h1>` 是页面主题最强的相关性信号位，而首页是站点权重最高的页面。把它让给一个次要功能的标题，等于**浪费首页最强的关键词位**。

> ⚠️ **澄清（防止误判方向）**：`<h1>` **不影响爬取（crawl）** —— 抓取由 URL / 链接 / robots 决定。它影响的是**相关性信号**与 SERP 展示。
> 所以这条**不是**"爬虫读不到"的问题，是"**读到了，但读错了主题**"的问题。不要把它当成抓取优化去修。

**要求**
- ⛔ 功能组件内**不得**出现 `<h1>`（页面标题层级由路由层决定，不由组件决定）
- ⛔ 任何页面不得出现两个及以上 `<h1>`（见 R3）

**现状（已修 · 2026-09-17）**

| # | 位置 | 状态 |
|---|---|---|
| 1 | `components/HomeDailyHand.tsx` | `<h2>`（不再占用首页唯一 h1） |
| 2 | `components/HomeHero.tsx` | **已挂回首页第一区块**；h1 = `home.heroTitle`；已去掉积分/签到/AchievementsWall |
| 3 | `HomeDailyChallenge` / `DailyChallengeCard` | **已删除**（原为零引用死代码） |
| 4 | `data/site.json → homeH1` / `home.heroTitle` | 经 `HomeHero` 渲染；EN 与 `homeH1` 同值 |

**🔑 修复路径（推荐：恢复，而不是新建）**

首页**曾经**有 Hero（h1 = 定位词 + Play Now + 三分入口 + 签到）。提交 `c9658df`（*"Focus the homepage on a seeded Hong Kong hand and an advisory coach"*）把它整体换成了 `HomeDailyHand`，**但没删 `HomeHero`**。所以 R1 + R2 可以**一次同时满足**：

1. 把 `HomeHero`（或按其结构写一个更瘦的 Hero）挂回首页**第一区块** → 同时满足 R1
2. 清掉 `HomeHero` 内的**积分/签到残留**：`usePoints` / `claimDailyCheckIn` / `home.checkInTitle` / `home.emailBonusHint` / `home.pointsBalance` 等 —— 均属**已废弃的积分经济**（v2 已删货币属性，见 `积分转成就系统_重构方案`）。`AchievementsWall` 若不需要展示也一并移除
3. 移除 `HomeDailyHand` 的 `<h1>` → 降为 `<h2>`
4. 删除 `HomeDailyChallenge.tsx` / `DailyChallengeCard.tsx`（两者均全仓零引用）

**其他页面不受影响**：`about` / `blog` / `blog/[slug]` / `games` / `games/*` / `learn/glossary` / `privacy` / `cookies` / `not-found` 的 `<h1>` = 该页主题，**现状正确，无需改动**。

---

## R3 · 一页一 H1（通用）

任何页面 `<h1>` 有且仅有一个，且描述该页主题。子区块用 `<h2>`，层级不跳级。
（由 R2 派生的通用约束，适用于全站而非仅首页。）

---

## R4 · 内容只生产「运营语种」——3 个

> 已确立：2026-09-18（用户拍板）。**本条覆盖此前任何「9 语种同步」的表述。**

**规则**
博客 / 长文内容的**生产与翻译范围 = `INDEXABLE_LOCALES`，即 `en` / `zh` / `zh-TW` 三语**。
`RETIRED_LOCALES`（`ja` / `ko` / `es` / `fr` / `de` / `pt-BR`）**内容冻结，不再同步翻译**。

**为什么**
- 这 6 个语种的 URL **已 308 永久重定向到 `/en`**，消息文件也已移入 `messages/_retired/` → 它们的内容**永远不会被任何用户或搜索引擎读到**，翻译投入产出为零。
- 语言切换器只暴露 3 种语言 → 用户**无法**进入退役语种页面。
- ⛔ **不要**把「站内有 9 个语种」当成「要维护 9 个语种」。

**⚠️ 最容易误读的一点（会直接搞挂 build）**
「只做 3 语」**不等于**「可以删掉另外 6 个文件里的 slug」。

`data/blog-i18n/*.json` 的 **9 个文件必须继续存在，且每个文件必须包含全部 slug**
—— 真源 `data/blog.i18n.ts:79` 对任一缺失 slug **直接 `throw`**，`tests/content-i18n-integrity.test.ts` 也会断言各语种 slug 集与 `en` 一致。

| 要改的 | 不要碰的 |
|---|---|
| 新建文章 → 只需写 `en` / `zh` / `zh-TW` 三份**真实内容** | 6 个退役语种**文件本身** |
| 扩写已有文章 → 只需重写这 3 份 | 退役语种文件里的**结构**（节数 / 段数 / FAQ 条数）|
| — | 退役语种文件的**文件名、slug 集合** |

**退役语种文件怎么处理（两种都合法，二选一即可）**
1. **原样不动**（推荐）—— 最省事，且天然满足结构一致性校验。
2. **跟随英文结构同步**：把英文新正文原样贴进去（它们本来也常是英文占位），保证节段数/FAQ 数与 EN 一致。

⛔ **绝对禁止**：让退役语种文件的节段数与 `en` 不一致 —— `blog-i18n-structure.test.ts` 的校验范围是 `CONTENT_LOCALES`（仅 `zh`/`zh-TW`），所以**退役语种失配不会被测试捕获**，但一旦该语种将来重新上线，页面会渲染错位。

**判据口诀**：**「3 个语种写内容，9 个文件保结构。」**

---

## 附 · 验收方式

```bash
# 1. 线上首页：期望恰好 1 个 <h1>，且文本 == data/site.json.homeH1
curl -s https://mahjonggame.org/en | grep -o '<h1[^>]*>[^<]*</h1>'

# 2. 静态检查：功能组件（components/Home*）不应再出现 <h1>
grep -rn "<h1" components/HomeDailyHand.tsx components/HomeDailyChallenge.tsx

# 3. R4 验收：9 个 blog-i18n 文件仍存在，且 slug 集与 en 完全一致
node -e "const fs=require('fs');const L=['en','zh','zh-TW','ja','ko','es','fr','de','pt-BR'];const J={};for(const l of L)J[l]=JSON.parse(fs.readFileSync('data/blog-i18n/'+l+'.json','utf8'));const e=Object.keys(J.en);for(const l of L){const k=Object.keys(J[l]);const miss=e.filter(s=>!k.includes(s));console.log(l.padEnd(7),k.length,miss.length?'MISSING '+miss:'ok')}"
```

**验收清单**
- [x] 首页第一区块 = 主 CTA「立即开局」，点击进入牌局
- [x] 首页恰好 1 个 `<h1>`，文本 = `site.json.homeH1`（经 `home.heroTitle`）
- [x] `HomeDailyHand` / 已删 challenge 组件内无 `<h1>`
- [x] 首页功能标题用 `<h2>` 及以下
- [x] Hero 配色走 `portal-*` 令牌
- [x] 3 个 locale（`en` / `zh` / `zh-TW`）已有 `home.heroTitle` / `playSolitaire` 等键
