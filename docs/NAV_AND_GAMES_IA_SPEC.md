# NAV_AND_GAMES_IA_SPEC · 导航与游戏区信息架构改造

**创建**：2026-09-22
**执行方**：Cursor
**状态**：
- 结构定案已由用户确认（2026-09-22 18:49 / 19:05）
- **2026-09-22 19:00 修订**：新增 §2.5 品类核查（Connect 不属于 solitaire）、§4.2 重写、§5.1 中文名已解（无需用户定）、§7 自噬风险重新校准
- **2026-09-22 19:30 修订**：用户定案 IA 模型 —— **接龙与连连看平级**，Connect **移出** `/games/solitaire` 页内（不做次级区），入口由 `/games` 承担；§2.5、§4.2、§8 同步
- 🔴 **2026-09-22 20:15 修订（重要：一条结论被推翻）**：用户提出 **「`/games/solitaire` 直接嵌牌桌 + 下方文字说明 + FAQ」**。实测证实「两页嵌同一副牌 → 重复内容」**不成立**（游戏 `ssr: false`，不参与 SSR，线上 HTML 686 词全来自文字）→ **D2 改为「页内嵌入牌桌」**，并新增两条硬约束（文字必须在游戏之前 / 牌型切换不落 URL）。§3、§4.2、§7、§8、§9 同步
- 🔴 **2026-09-22 22:00 修订（用户新增两条结构约定，已固化为站点规则）**：
  - **R5** 写入 `docs/SITE_RULES.md` —— 游戏区 **URL 只有两层**（`/games` 与 `/games/*`），`classic`/`solitaire` 与 8 个玩法页**完全平级**；「大厅 → 类目 → 玩法」只是**内容层**概念，`navGroup` 不产生 URL 层级。§2.2 已按此重写（原「三层结构」标题作废）
  - **R6** 写入 `docs/SITE_RULES.md` —— 游戏页统一**三段式**：**① 文字（游戏名 + 玩法简介）→ ② 牌桌 → ③ 文字（FAQ / What / How / Tips + 内链）**。⚠️ **本条已于 22:12 收窄为「仅适用玩法页 `/games/{slug}`」**，类目页改走 R7
- 🔴 **2026-09-22 22:12 修订（重要：20:15 的结论再次被推翻）**：用户定案 —— **「类目页不需要加入牌桌，我希望在类目页加入简单的玩法介绍、FAQ、内链（链接到 blog），提高收录页面和权重。」**
  - **D2 再次翻转**：`/games/solitaire` **⛔ 不嵌牌桌**，改为「玩法介绍 + FAQ + 内链（→ blog）」。三次定案留痕见 §4.2.1
  - **R6 拆分为两条规则**（写入 `docs/SITE_RULES.md`）：**R6 = 玩法页**三段式（文字→牌桌→文字，仅 `/games/{slug}`）；**R7 = 类目页**模板（文字→卡片→文字，适用于 `/games`、`/games/classic`、`/games/solitaire`，**⛔ 不嵌牌桌**）
  - 新增 **§4.2.3 内链 → blog 的 `CTA_HREF` 反查表**、**§5.5 `catalog` 命名空间键规划**、**§4.5(b) 内容缺口（缺一篇 solitaire 基石文章）**
  - §3、§4.2、§4.3、§4.4、§5.5、§6、§7、§8 同步
- **§5 文案已全部 ✅，无待签字项**
**关联**：`docs/SITE_RULES.md`（**R1–R7**，R5 管 URL 层级、R6 管玩法页三段式、R7 管类目页模板）、工作区 `自研玩法与solitaire词匹配核查_mahjonggame.org_2026-09-22.md`、工作区 `Sitemap与标题核验报告_mahjonggame.org_2026-09-22.md`

---

## 0. 🔴 冻结期硬约束（先读这条，再读任何变更）

站点正处于 **GSC 索引重建期**（2026-09-21 起，预期 2–6 周）。铁律：

> **同 URL 内的「内容 + 元数据 + 站内链接」改动可以做；任何 URL 结构、跳转、语种改动全部按住。**

据此，本 spec 中：

| 允许 ✅ | 禁止 ⛔ |
|---|---|
| 改 `<h1>`／`<title>`／description 文案 | 新增或修改任何 301／302／307／308 |
| 改组件里的站内 `href`（导航链接） | 重命名任何路由目录 |
| 加厚页面静态内容、加 FAQ／JSON-LD | 新增／退役语种、改 locale 前缀 |
| 改 i18n 文案值 | 改 `next.config.mjs` 的 `redirects()` |

---

## 1. 背景：为什么改这三个页面

2026-09-22 用 Googlebot UA 实测（`_verify/gsc-sitemap-20260922/check_pages.py`）：

- **导航第 1、2 项指向的两个页面，是全站最薄的两页**（133 词 / 103 词），比同级玩法页（473–698 词）薄 **4–7 倍**。而它们位于全站内链权重最集中的位置。
- **总大厅 `/games`（207 词）没有任何导航入口** —— 全站唯一的泛类目汇总页拿不到导航权重。
- 三个页面的 `<h1>` 均为**零关键词**短语（`Game Hall` / `Play vs AI` / `More Mahjong Games`）。

---

## 2. 现状实测（2026-09-22 19:00，Googlebot UA，直接响应）

### 2.1 导航结构

来源：`components/Header.tsx:30-35`

| # | i18n 键 | EN 文案 | zh 文案 | 当前 href | 落点页词数 |
|---|---|---|---|---|---|
| 1 | `nav.classic` | `Play vs AI` | 人机对战 | `/games/classic` | 133 |
| 2 | `nav.solitaire` | `More Mahjong Games` | 更多麻将休闲游戏 | `/games/solitaire` | 103 |
| 3 | `nav.tools` | `Tools` | 工具 | `/tools` | 537 |
| 4 | `nav.beginners` | `Learn` | 学习 | `/blog` | 849 |

桌面版（`Header.tsx:57-67`）与移动版（`Header.tsx:125-136`）**共用同一个 `links` 数组** → 改一处两边同时生效。

### 2.2 🔴 游戏区：URL 只有两层，「大厅 → 类目 → 玩法」是**内容层**

> **规则已固化**：`docs/SITE_RULES.md` **R5**。本节只记实测数据。

```
/en/games                     ⛔ 无导航入口                208 词  h1=Game Hall
├── /en/games/classic         ★ 导航第 1 项                133 词  h1=Play vs AI
├── /en/games/solitaire       ★ 导航第 2 项 · 全站最薄页   103 词  h1=More Mahjong Games
└── 8 个玩法页（473–698 词，带牌桌）
    hong-kong 698 / mahjong-solitaire-classic 686 / american 561 /
    sichuan 546 / taiwan 519 / mahjong-connect-classic 473 / riichi · chinese-official
```

🔴 **上面画的缩进是「内容层」的从属关系，不是 URL 层级。**
`classic`、`solitaire` 与 8 个玩法页在 URL 上**完全平级**，都是 `/games/` 下的一级。⛔ 不存在 `/games/classic/{slug}`。

| URL 层 | 内容层 | 载体 |
|---|---|---|
| `/games` | 大厅（hub） | 静态页，列全部 |
| `/games/classic`、`/games/solitaire` | 类目（列表页） | 静态页，**URL 名 == 内容名，不是玩法页** |
| `/games/{slug}` × 8 | 玩法 | 动态页 `[slug]`，数据来自 `data/games.ts` |
| **（无 URL）** | 分组 | `data/games.ts → navGroup` —— **纯虚拟层** |

- `/games/classic` 正文：「Play real four-player mahjong — Chinese, Japanese, American, Taiwanese and Sichuan rulesets.」+ 6 张 4 人玩法卡
- `/games/solitaire` 正文：「Casual tile-matching and elimination games for a quick, relaxing break.」+ 2 张卡

### 2.3 数据层：整站游戏 IA 由 `navGroup` 驱动

`data/games.ts`：

- `navGroup?: NavGroup` 字段（第 78 行定义）
- `navGroup: 'classic'` → 6 个四人玩法（行 106 / 172 / 228 / 279 / 324 / 367）
- `navGroup: 'solitaire'` → 2 个休闲玩法（行 410 / 460）
- `getGamesByNavGroup(navGroup)`（行 583）—— 过滤掉 `gameType === 'coming-soon'`

### 2.4 🔴 矛盾的真正根因

`nav.solitaire` 这**一个 i18n 键**同时被用在三个地方：

| 用处 | 代码位置 | 当前值 |
|---|---|---|
| 导航第 2 项标签 | `components/Header.tsx:32` | `More Mahjong Games` |
| `/games/solitaire` 的 `<h1>` | `app/[locale]/(public)/games/solitaire/page.tsx:52` | `t('solitaire')` |
| `/games/solitaire` 的 `<title>` | 同文件 `:19` | `${t('solitaire')} \| Mahjong Hub` |

**所以问题不在 URL 层，而在键名与语义的错配**：键名 / 路由名 / 目录名都叫 `solitaire`（读起来像具体玩法），但它承载的是**泛类目**（休闲游戏组）。

⚠️ **这也解释了为什么 `/games/solitaire` 的 title 有品牌后缀而 `/tools` 系没有** —— 它是**手工拼** `${t('solitaire')} | ${brandName(site)}`，绕过了 `lib/seo.ts:108` 的 `title:{absolute}` 缺陷。两个缺陷是独立的两件事。

### 2.5 🔴 品类核查：`navGroup: 'solitaire'` 下两个游戏不是同一品类（2026-09-22 19:00）

> **核验方法**：读引擎规则代码 + Googlebot UA 直取线上页 + 第三方品类定义交叉验证。
> 详见工作区 `自研玩法与solitaire词匹配核查_mahjonggame.org_2026-09-22.md`。

| # | 游戏 | slug | 引擎规则（代码证据） | 真实品类 | 对应 `solitaire`？ |
|---|---|---|---|---|---|
| A | Mahjong Solitaire Classic | `mahjong-solitaire-classic` | `lib/mahjong-solitaire/layouts.ts:28` `layer: number`（**多层堆叠**）<br>`board.ts:44` `isFree = isExposed`（上方无压牌 + 同层左右至少一侧空）<br>`generator.ts:2` 反推生成、保证可解 | **Mahjong Solitaire**（接龙） | ✅ 完全对应 |
| B | Mahjong Connect | `mahjong-connect-classic` | `lib/connect/board.ts:1-10` 注释自称 `Onet / 连连看`<br>`board.ts:5-6` **平面**网格 + 外圈一格空边<br>`board.ts:132-133` BFS 寻路，`if (turns > 2) continue` | **Mahjong Connect**（Onet／连连看／Shisen-Sho） | ❌ **不对应** |

**站内内容自己早已声明这是两种游戏** —— `data/games.ts:431` Connect 页 FAQ 问 `How is this different from mahjong solitaire?`，`:484` Solitaire 页 FAQ 反向问同一问题，两处答案都是「Different puzzle, same tiles」。

**第三方一致**：`mahjongsolitaire.games` FAQ 直言 `Is Mahjong Connect the same as Mahjong Solitaire? No.`；`nointernetgame.com` 把品类分为 solitaire／connect／triple-match 三类。

**量级差**：`mahjong` 全球 673K/月（Semrush 2026-03）；`Mahjong Solitaire` 站内热度 7,145k 局/月 vs `Mahjong Connect` 1,091.8k 局/月 → **solitaire ≈ 6.5× connect**。

#### 🔴 因此本 spec 的一条核心前提被修正

`data/games.ts:410` 把 `mahjong-connect-classic` 的 `navGroup` 标成 `'solitaire'` —— **这是分类错误，不是游戏做错**。三个独立事实佐证：

1. 引擎规则是两套完全不同的判定（层叠取自由牌 vs 平铺寻路）
2. 站内 FAQ 自己承认两者不同
3. 站内中英文名**其实早就分对了**：`Mahjong Solitaire Classic` → `经典麻将接龙`；`Mahjong Connect` → `麻将连连看`

**⛔ 但 `navGroup` 本轮不能改** —— `NavGroup` 只有 4 个值（`data/games.ts:22`：`'classic' | 'solitaire' | 'beginners' | 'set'`），把 Connect 移出去需要**新增一个 navGroup 值**，进而牵出**新 URL**（如 `/games/casual`）→ **冻结期禁止**。

#### ✅ 用户定案的 IA 模型（2026-09-22 19:30）

> 用户原话：**「connect 连连看挪出来，放在 more mahjong games 下边，连连看和接龙是独立的游戏页面，作为 2 级子页面都放在更多麻将游戏下」**

即：**接龙与连连看是平级兄弟，不是父子**。两者都直接挂在你定的泛类目「More Mahjong Games」下，各自是独立的 2 级游戏页：

```
/games  ←「More Mahjong Games」泛类目（D1 导航第 2 项落点）
├── /games/classic                     「4 人对战」类目
│   └── 6 个四人玩法页（473–698 词）
├── /games/solitaire               ★ 接龙 Mahjong Solitaire —— 独立游戏页，打大词
│   └── /games/mahjong-solitaire-classic   具体变体（turtle／pyramid）
└── /games/mahjong-connect-classic ★ 连连看 Mahjong Connect —— 独立游戏页
```

**→ 本轮处置**：`navGroup` 数据**不动**（§6 第 4 条），只在**呈现层**把 Connect 从 `/games/solitaire` 页内**彻底移出**，改为**平级兄弟**，入口由 `/games` 总大厅承担（见 §4.2）。

---

## 3. 定案（用户 2026-09-22 确认，可直接执行）

| # | 定案 |
|---|---|
| D1 | 导航第 2 项标签**保持** `More Mahjong Games`（泛类目），**href 改指 `/games`（总大厅）**，不再指向 `/games/solitaire` |
| D2 | `/games/solitaire` **重定位为 `Mahjong Solitaire` 类目页** —— **⛔ 不嵌牌桌**；改为补齐「**玩法介绍 + FAQ + 内链（→ /blog）**」三段内容，提升可收录面积与内链权重（见 §4.2）。<br>⚠️ **本条推翻 2026-09-22 20:15 的「页内嵌入牌桌」定案** —— 用户 22:12 定案原话：**「类目页不需要加入牌桌，我希望在类目页加入简单的玩法介绍、FAQ、内链（链接到 blog），提高收录页面和权重。」** 见 §4.2「决策留痕」 |
| D3 | 导航第 1 项 `Play vs AI` **href 不变**（`/games/classic`），**只改 `<h1>`** |

---

## 4. 变更清单

### 4.1 导航第 2 项 href（`components/Header.tsx:32`）

```diff
   const links = [
     { href: '/games/classic', label: tn('classic') },
-    { href: '/games/solitaire', label: tn('solitaire') },
+    { href: '/games', label: tn('solitaire') },
     { href: '/tools', label: tn('tools') },
     { href: '/blog', label: tn('beginners') }
   ];
```

- **输入**：无
- **输出**：导航第 2 项落点由 103 词的类目页改为 207 词的总大厅
- **副作用**：桌面版 + 移动版同时生效（共用数组）
- **边界**：⛔ 不改 `label: tn('solitaire')` —— 文案已是 `More Mahjong Games`，符合 D1
- ⚠️ `key={item.href}` 用的是 href 作 React key —— 检查改后 4 个 href 仍互不相同（`/games/classic`、`/games`、`/tools`、`/blog` ✅ 无冲突）

### 4.2 `/games/solitaire` 重定位为 Mahjong Solitaire 类目页（⛔ 不嵌牌桌）

> 📐 **页面结构固定为三段式** —— `docs/SITE_RULES.md` **R7**（类目页模板）：
> **① 文字（类目名 + 定位简介）→ ② 卡片（玩法卡）→ ③ 文字（玩法介绍 + FAQ + 内链）**
> ⛔ **类目页不嵌牌桌** —— 牌桌只属于玩法页（R6）。下文的「③ 段内容要求」就是 R7 在本页的落地。

文件：`app/[locale]/(public)/games/solitaire/page.tsx`（现 64 行）

| 项 | 现状 | 目标 |
|---|---|---|
| `<h1>`（`:52`） | `t('solitaire')` = `More Mahjong Games` | 新键 `nav.mahjongSolitaire`（见 §5） |
| `<title>`（`:19`） | `${t('solitaire')} \| Mahjong Hub` | `${t('mahjongSolitaire')} \| Mahjong Hub` |
| `description`（`:24`） | `t('solitaireSubtitle')` | 新键 `nav.mahjongSolitaireDesc`（见 §5） |
| 面包屑（`:42-49`） | 末级 `t('solitaire')` | 改为 `t('mahjongSolitaire')` |
| ③-a 玩法介绍 | **无** | 新增 **2–3 段**静态文字，≥150 词（见「③ 段内容要求」） |
| ③-b FAQ | **无** | 新增 **≥4 问**，i18n 键 ＋ `FAQPage` JSON-LD |
| ③-c 内链 → blog | **无**（全站游戏页最缺的一环） | 新增 **3 条** `<Link href="/blog/{slug}">`，目标见 §4.2.3 |
| JSON-LD | 无 | 新增 `CollectionPage` + `FAQPage` |
| 正文总词数 | **103** | **≥ 400** |
| 🔴 **游戏卡片** | `getGamesByNavGroup('solitaire')` 2 张**平铺**（含 Connect） | **只放 `mahjong-solitaire-classic` 一张**；Connect 卡片**整张移出本页**（见下） |
| ⛔ **牌桌** | 本页**从未**嵌入游戏（只有标题＋2 段文字＋2 张卡） | **保持不嵌入** —— 本页 ⛔ 不得引入 `NativeGameLazy` |

#### 4.2.1 决策留痕：本页为何**不**嵌牌桌（2026-09-22 22:12）

D2 前后经历三次定案。为避免 Cursor 或后人照旧稿实现，留痕如下：

| 时间 | 定案 | 状态 |
|---|---|---|
| 09-22 19:05 | 本页做「上位词 hub」文字页，⛔ 不嵌牌桌 | 被 20:15 推翻 |
| 09-22 20:15 | 用户提出「直接渲染游戏内容 + 下方加文字 + FAQ」→ 改为**页内嵌牌桌** | **被 22:12 推翻** |
| **09-22 22:12** | 用户定案：**「类目页不需要加入牌桌」** → 改为「玩法介绍 + FAQ + 内链（→ blog）」 | ✅ **现行** |

> 用户 22:12 原话：**「类目页不需要加入牌桌，我希望在类目页加入简单的玩法介绍、FAQ、内链（链接到 blog），提高收录页面和权重。」**

**采纳。** 理由：

1. **嵌牌桌不增加任何可索引内容** —— 牌桌是 `ssr:false` 的客户端容器，对爬虫等于零（§7.1 实测）。类目页的价值在**承接长尾 + 分发权重**，不在「少跳一次」。
2. **站内已有同类先例** —— `/tools`（537 词）就是「介绍段 + FAQ + 内链到 blog + JSON-LD」，⛔ 无任何交互组件。这是本项目**已验证过**的类目页形态。
3. **嵌牌桌会让两页的产品差异消失** —— 玩法词由 `/games/mahjong-solitaire-classic`（686 词）专责承接，本页只打上位词（§7.2）。两页都嵌牌桌 → 回到关键词自噬。

> ⚠️ 若将来仍希望类目页能直接开局，**须单独立项**并先解决与 `/games/mahjong-solitaire-classic` 的分工 —— 不在本 spec 范围。

#### 4.2.2 ③ 段内容要求（= R7 的落地点，🔴 必须 SSR 静态文本）

🔴 **定位＝品类总览页 —— 不是规则百科，也不是游戏页。** 规则的详细说明归子页（`/games/mahjong-solitaire-classic` 686 词已写全）。本页只写它**没有**的东西：

| # | 内容 | 说明 |
|---|---|---|
| ①-a | `Mahjong Solitaire` 是什么 | 保留并**扩写**现有 `solitaireSubtitle`（1 句 → ≥60 词），含「海外用户搜 mahjong 多半指这个」的市场事实 |
| ①-b | 🔴 **`solitaire` ≠ `connect`** ← **本页独有、价值最高的一段** | 层叠取自由牌 vs 平铺 ≤2 转折连线。收 `mahjong solitaire vs mahjong connect` 长尾，并**出链到兄弟页** `/games/mahjong-connect-classic`（该页已移出本页卡片区，这一句就是它的站内正文入口） |
| ①-c | 变体目录 | turtle／pyramid 各 1–2 句**特征描述**（层数、形状、难度手感）。⛔ 不写逐条操作步骤 |
| ①-d | 与传统四人麻将的区别 | 1 段 |
| ③-b | **FAQ ≥ 4 问** | 聚焦**选择类问题**：`该玩 solitaire 还是 connect？`／`哪个更适合新手？`／`和四人麻将有什么关系？`／`需要下载或注册吗？`<br>⛔ **不要**回答「自由牌怎么判定」「是否保证可解」—— 那些归子页，重复即自噬 |
| ③-c | 🔴 **内链 → blog（3 条）** | 见 §4.2.3。**这是全站游戏页最缺的一环** |
| ③-d | 向下内链 | `/games/mahjong-solitaire-classic` —— 写**信息性内链**（如「想玩固定的经典牌型（turtle／pyramid），见 Mahjong Solitaire Classic」） |

> 💡 判据：本页回答「**这是什么、我该玩哪个**」；子页回答「**怎么玩**」。意图不同才不互相抢词。

#### 4.2.3 🔴 内链 → blog：目标**必须**由 `CTA_HREF` 反查（⛔ 勿自创）

站内**已存在**「文章 → 游戏页」的定向表：`data/blog-clusters.ts` 的 `CTA_HREF`。实测统计（20 条映射）：

| 目标页 | 指向它的文章数 |
|---|---|
| `/games/hong-kong-mahjong` | **14 篇** |
| `/games/mahjong-solitaire-classic` | 3 篇 |
| `/games/classic` | 3 篇 |
| **`/games/solitaire`** | **🔴 0 篇** ← 这就是本轮要补的原因 |
| `/games`（大厅） | 0 篇 |

本轮补的是它的**反向链路** —— 游戏页 → blog。

**反查结果：**

| 类目页 | 应链的 blog 文章 | 依据 |
|---|---|---|
| `/games/solitaire` | ① `what-is-mahjong`<br>② `mahjong-tiles-meaning-guide`<br>③ `types-of-mahjong-games` | 🔴 **本页无专属文章** —— 只能选**正文提及 solitaire** 的。① 含 `Mahjong Solitaire vs. Four-Player Mahjong` 段（`data/blog.ts:111`）；②③ 分别有 solitaire 相关段/FAQ |
| `/games/classic` | ① `types-of-mahjong-games`（variants 簇 pillar）<br>② `american-vs-chinese-mahjong`<br>③ `how-to-play-american-mahjong` | ✅ 这 3 篇的 `CTA_HREF` **全部指向本页** → 精准反向 |
| `/games`（大厅） | ① `what-is-mahjong`<br>② `how-to-play-mahjong`<br>③ `types-of-mahjong-games` | — |

- ✅ 三个目标已实测 **HTTP 200**：`/en/blog/what-is-mahjong`、`/en/blog/types-of-mahjong-games`、`/en/learn/glossary`
- ✅ 渲染写法照抄 `/tools`：`components`… 见 `app/[locale]/(public)/tools/page.tsx:166-186`（`relatedReading` 区块 + `<Link href="/blog/{slug}">`）
- ⛔ **不要**凭空指定文章 —— 链到主题无关的文章＝权重白流 + 稀释本页相关性

> 🔴 **内容缺口（本条收益最大的一步）**：站内 20 篇博客**无一篇专讲 `mahjong solitaire`**，而它是站内搜索热度最高的词。本页的内链目前只能「借」主题部分相关的文章。**补一篇 solitaire 基石文章**（三语）是让本页真正吃到权重的**前提条件** —— 见 §4.5。

#### 🔴 Connect 的处置（用户定案：移出，做平级兄弟）

`navGroup: 'solitaire'` 下混了两个不同品类（§2.5）。用户定案的 IA 模型是**接龙与连连看平级**，所以：

| 动作 | 内容 |
|---|---|
| **移出** | `/games/solitaire` 页内**不再出现** Connect 卡片。⛔ 不留「Also try」次级区——那仍是父子关系，与定案不符 |
| **保留为独立页** | `/games/mahjong-connect-classic`（473 词）**一个字不改**，它仍是干净的独立游戏页 |
| **入口改由 `/games` 承担** | ✅ **已实测**：`/games` 总大厅本来就直接引用 Connect 与 Solitaire 各 1 次（Featured 卡）→ **Connect 不会变孤立页**，无需补链接 |
| **兄弟互链** | ✅ **已实测**：`/games/mahjong-connect-classic` 正文已有「Try another game → Mahjong Solitaire Classic」，`/games/mahjong-solitaire-classic` 亦然 → 两页互为兄弟入口，**天然成立** |

#### 🔴 数据层需要的最小改动（否则 Connect 卡片还会渲染出来）

`/games/solitaire/page.tsx:38` 现在调 `getGamesByNavGroup('solitaire')` —— 该函数（`data/games.ts:583`）返回的是**整个 navGroup 的 2 个游戏**。要让它只出 1 张卡，**不改 navGroup 数据**的前提下，在页面层过滤即可：

```diff
- const games = getLocalizedGames(getGamesByNavGroup('solitaire'), locale);
+ // navGroup 'solitaire' 里混了 Connect（不同品类）——本页只出接龙，
+ // Connect 作为平级兄弟由 /games 总大厅承载，见 docs/NAV_AND_GAMES_IA_SPEC.md §2.5
+ const games = getLocalizedGames(getGamesByNavGroup('solitaire'), locale).filter(
+   (g) => g.slug === 'mahjong-solitaire-classic'
+ );
```

- **输入**：无
- **输出**：本页游戏卡 2 张 → 1 张
- **边界**：⛔ **不改** `data/games.ts` 的 `navGroup` 值（§6 第 4 条）；⛔ 不写死 slug 之外的猜测
- ⚠️ **须验证 `/games` 上 Connect 仍可见** —— 它是 Connect 的唯一入口来源（§8 验收已含此项）

### 4.3 `/games/classic` 类目页补齐 ③ 段（R7）

文件：`app/[locale]/(public)/games/classic/page.tsx`（现 76 行）

| 项 | 现状 | 目标 |
|---|---|---|
| `<h1>`（`:65`） | `t('classic')` = `Play vs AI`（**零关键词**） | 新键 `nav.classicH1`（见 §5） |
| ① 简介（`:67`） | `t('classicSubtitle')` = 1 句 ≈ 20 词 | 扩写至 **≥60 词** |
| ② 卡片（`:69-73`） | 6 张 4 人玩法卡 | ✅ **保留** |
| ③-a 玩法介绍 | **无** | 新增 2–3 段 **≥150 词**：港／日／中／川／台／美 6 个 ruleset 各 1–2 句差异说明 |
| ③-b FAQ | **无** | 新增 **≥4 问** ＋ `FAQPage` JSON-LD |
| ③-c 内链 → blog | **无** | **3 条**：`types-of-mahjong-games`／`american-vs-chinese-mahjong`／`how-to-play-american-mahjong`（依据见 §4.2.3） |
| JSON-LD | **无** | 新增 `CollectionPage` ＋ `FAQPage` |
| 正文词数 | **133** | **≥ 400** |
| ⛔ 牌桌 | 无 | **保持无**（R7：类目页不嵌牌桌） |

- ⛔ **href 不动**、⛔ **`nav.classic` 的值不动**（导航第 1 项标签保持 `Play vs AI`）

> 💡 为什么 h1 要用**新键**而不是直接改 `nav.classic`：`nav.classic` 同时是导航标签，改它会连带改导航。D3 只授权改 h1。

### 4.4 `/games` 总大厅补齐 ③ 段（R7）

文件：`app/[locale]/(public)/games/page.tsx`（现 88 行）

D1 之后它是导航第 2 项的**落点** → 必须先修好再接流量：

| 项 | 现状 | 目标 |
|---|---|---|
| `<h1>`（`:68`） | `Game Hall`（**零关键词**） | 新键 `nav.gameHallH1`（见 §5） |
| ② 卡片 | Browse by category 3 类 ＋ Featured 8 卡 | ✅ **保留** |
| ③-a 玩法介绍 | **无** | 新增 2–3 段 **≥150 词**：站点有哪些品类、怎么选 |
| ③-b FAQ | **无** | 新增 **≥4 问** ＋ `FAQPage` JSON-LD |
| ③-c 内链 → blog | **无** | **3 条**：`what-is-mahjong`／`how-to-play-mahjong`／`types-of-mahjong-games` |
| JSON-LD | **已有** `CollectionPage`（`lib/hub-jsonld.ts:4`） | ➕ **补** `FAQPage` |
| 正文词数 | **207** | **≥ 400** |
| ⛔ 牌桌 | 无 | **保持无**（R7） |

- 🔴 **修自指链接**：该页「More puzzles」卡片的 href 现为 `/games`（**指向自己**）→ 改为 `/games/solitaire`
- ⛔ 不改「Browse by category」中指向 `/games/classic` 与 `/games/solitaire` 的两张卡（结构正确，保留）
- 🔴 **确认 Connect 可见**：`/games` 是 Connect（`/games/mahjong-connect-classic`）移出 `/games/solitaire` 后的**唯一入口来源**。✅ 已实测该页直接引用它 1 次（Featured 卡）；Cursor 改版时⛔ **不得**在精简/重排卡片时把 Connect 卡删掉。建议把它与 `/games/solitaire` 在「配对拼图」区并列展示，体现二者**平级**

> ⚠️ **技术提醒**：`lib/hub-jsonld.ts:4` 的 `hubCollectionJsonLd` 的 `path` 参数类型被限定为 `'/blog' | '/games'`，**不能直接给 `/games/classic`、`/games/solitaire` 用**。两个类目页的 `CollectionPage` 请**照 `/tools` 的内联写法**（`tools/page.tsx:65-82`）自行构造，⛔ **不要**去扩大共享的类型定义 —— 那会牵动 `/blog` 与 `/games` 两个已上线的页面。

### 4.5 关联项与内容缺口（不在本次代码改动范围）

#### (a) ⛔ 不要顺手改
`lib/seo.ts:108` 的 `title: { absolute }` 缺陷导致 18 个 URL 缺品牌后缀 → 见工作区 `Sitemap与标题核验报告_mahjonggame.org_2026-09-22.md` §三。**单独提交处理**，⛔ 不要和本 spec 混在一个 commit。

#### (b) 🔴 内容缺口：站内缺一篇 `mahjong solitaire` 基石文章（**建议优先级最高，但须另立任务**）

| 项 | 事实 |
|---|---|
| 现状 | 站内 **20 篇博客**（17 篇 `blog.cornerstone.ts` + 3 篇 `blog.ts`）中，**无一篇**以 `mahjong solitaire` 为主题 |
| 已有的只是「提及」 | `what-is-mahjong` 有一段 `Mahjong Solitaire vs. Four-Player Mahjong`（`data/blog.ts:111`）；`mahjong-tiles-meaning-guide`、`types-of-mahjong-games` 只在 FAQ 里带过 |
| 为什么必须补 | `solitaire` 是**站内搜索热度最高的词**（行业量级 ≈ `mahjong connect` 的 6.5 倍），但（1）它现在**没有专属内容页**；（2）§4.2.3 里三个类目页的 blog 内链**只能「借」主题部分相关的文章** —— 缺了这篇文章，内链链出去的相关性就是打折的 |
| 不做的后果 | 类目页的 ③-c 内链虽有 3 条，但**没有一条真正对齐本页主题**；等于是「有内链但权重不精准」 |

**建议**：把它作为 **R7 配套内容任务** 单独立项（走 `mahjong-hub-blog-expansion` skill 的 11 条硬约束：同挂簇、三语、撇号 U+2019、行尾探测…），⛔ 不要塞进本次 IA 改动。

#### (c) 2026-09-22 22:00 实测新发现 —— **待用户定案，本轮不动**

| # | 发现（Googlebot UA 实测） | 影响 |
|---|---|---|
| 1 | **首页 `Featured games` 只有 6 张**（hong-kong / riichi / chinese-official / sichuan / taiwan / american），比 `/games` 的 8 张**少 Connect 与 Solitaire Classic** | 首页**一条链接都不指向** `/games/mahjong-solitaire-classic`（686 词，solitaire 大词的真实承载页） |
| 2 | **两个类目页正文互不相链** —— `/games/classic` 与 `/games/solitaire` 仅靠 Header 导航互通 | 类目间无横向权重流动 |
| 3 | **面包屑只到 `Games`**，末级为纯文本非链接（`Home › Games`） | 轻微，可忽略 |

⛔ **未定案前不得顺手改** —— 尤其 #1 涉及首页区块，落在 R1 保护范围内。

---

## 5. 文案

> ⚠️ Cursor 注意：标 🖊️ 的项在用户签字前**不得**写入。签字后把 🖊️ 改为 ✅ 再执行。
> **2026-09-22 19:00 更新**：原「中文名待用户定」的阻塞项**已由站内既有译法解出**（见 §5.1 说明），无需用户再定。

### 5.1 新增 i18n 键（`messages/{en,zh,zh-TW}.json`，`nav` 命名空间）

| 键 | EN | zh | zh-TW |
|---|---|---|---|
| `mahjongSolitaire` ✅ | `Mahjong Solitaire` | **麻将接龙** | **麻將接龍** |
| `mahjongSolitaireDesc` ✅ | `Play free Mahjong Solitaire — match identical tiles, clear the board. Every deal is generated solvable.` | **免费在线玩麻将接龙——配对相同牌面，清空整个牌局。每局保证可解。** | **免費線上玩麻將接龍——配對相同牌面，清空整個牌局。每局保證可解。** |
| `classicH1` ✅ | `Play Mahjong vs AI` | **人机对战麻将** | **人機對戰麻將** |
| `gameHallH1` ✅ | `Free Mahjong Games` | **免费麻将游戏** | **免費麻將遊戲** |

#### 🔑 中文名为何定「接龙」—— 不是拍的，是站内已有译法

原本的顾虑是：`messages/zh.json:562` 已把 `solitaire` 译为**「消除」**，会与 `Mahjong Connect`＝**「麻将连连看」**打架。

**核查后发现站内其实已经译对了，只是没对齐：**

| 位置 | 键 | zh | zh-TW |
|---|---|---|---|
| **游戏页标题**（权威） | `data/games-i18n/zh.json:276` | **经典麻将接龙** | **經典麻將接龍** |
| **游戏页标题** | `data/games-i18n/zh.json:240` | 麻将连连看 | 麻將連連看 |
| 门户分类标签（错） | `messages/zh.json:562` | 消除 🔴 | 消除 🔴 |

→ **站内既有正确译法＝「接龙」。** 采用它一石三鸟：① 与游戏页标题一致 ② 与「连连看」不冲突（接龙／连连看恰好对应 solitaire／connect）③ 无需发明新词。

> ✅ **本节全部文案已可执行**（🖊️ 已清空）。若用户对「接龙」有异议，再单独回退。

### 5.2 改动后的 h1 / title 对照

| URL | h1（改后） | title（改后） |
|---|---|---|
| `/games` | `Free Mahjong Games` | `Free Online Mahjong Games – Solitaire & 4-Player \| Mahjong Hub`（不变） |
| `/games/classic` | `Play Mahjong vs AI` | `Play vs AI \| Mahjong Hub`（不变） |
| `/games/solitaire` | `Mahjong Solitaire` | `Mahjong Solitaire \| Mahjong Hub` |

### 5.3 三语同步要求

- `messages/*.json` 顶层只有 **3 个语种**（`en` / `zh` / `zh-TW`）—— 退役 6 语在 `messages/_retired/`，⛔ 绝不在顶层新建
- 🔴 **撇号只用 `’`(U+2019)**；EN 文案若同时存在于 TS 与 `data/blog-i18n/en.json`，须**两处同改**（`verify:en` 逐字节校验）

### 5.4 🔴 关联修正：`messages/zh.json` / `zh-TW.json` 里 solitaire 的「消除」译名

**本轮核查新增。** 站内把 `solitaire` 译成「消除」共 20 处，且已污染 SEO 元数据 —— 中文用户搜「消除」想的是**三消**（糖果传奇类），不是接龙，**核心词完全错配**。

| 行 | 键 | 现值 | 应改为 |
|---|---|---|---|
| `:562` | `portal.categories.solitaire` | 消除 | **接龙 / 接龍** |
| `:61` | `catSolitaire` | 麻将消除 | **麻将接龙** |
| `:69` | `seoLinkSolitaire` | 麻将消除游戏 | **麻将接龙游戏** |
| `:101` | `title`（分区） | 麻将消除游戏合集 | **麻将接龙游戏合集** |
| `:675` | `meta.homeTitle` | …– 麻将消除、立直麻将… | **…– 麻将接龙、立直麻将…** |
| `:679` | `meta.gamesTitle` | …— 消除与四人麻将… | **…— 接龙与四人麻将…** |
| `:558` | `challenge.moreSolitaire` | 更多消除 → | **更多接龙 →** |
| `:32` `:41` | `heroTitle` / `playSolitaire` | 麻将消除 / 玩麻将消除 | **麻将接龙 / 玩麻将接龙** |
| `:14` | `nav.solitaireSubtitle` | 休闲配对与消除小游戏… | 休闲配对与**接龙**小游戏… |

⛔ **保留不改**（语义正确，玩家确实在消除牌）：`:443` `:456` 游戏内「全部消除！{n} 分。」、`:160` `solitaire_clear` 行为名、`:513` 说明文字。

**判据**：指**分类／页面标题／导航／卡片名**（品类名）→ 改「接龙」；指**玩法动作结果** → 保留「消除」。

⚠️ 本项属**文案值改动**（不涉 URL），冻结期内可做。**建议单独 commit**，⛔ 不与 §4 的页面改版混在一起。

### 5.5 🔴 新增命名空间 `catalog` —— 承载三个类目页的 ③ 段长文

三个类目页要新增的「介绍段 + FAQ + 内链锚文本」共约 **30 个键**。⛔ **不要**塞进 `nav`（它是导航标签专用，职责不同）。

**照 `/tools` 页的先例**：`tools` 命名空间同时承载 Hub 与 3 个子工具的长文（`hubIntro` / `hubAboutP2` / `hubFaqQ1..4` …）。类目页同理，新建顶层命名空间 **`catalog`**。

| 用途 | 键名 | 数量 | 备注 |
|---|---|---|---|
| ③-a 介绍段标题 | `{id}AboutTitle` | 1／页 | — |
| ③-a 介绍段正文 | `{id}AboutP1` … `P3` | 2–3／页 | 合计 ≥150 词 |
| ③-b FAQ 区标题 | `{id}FaqTitle` | 1／页 | — |
| ③-b FAQ 问答 | `{id}FaqQ{n}` / `{id}FaqA{n}` | 4／页（`n`=1..4） | 照 `tools` 的 `hubFaqQ{n}` 写法 |
| ③-c 内链区标题／说明 | `relatedReading` / `readingNote` | **各 1（三页共用）** | ⚠️ `tools` 命名空间已有同名键，**但跨命名空间不可共享** → 在 `catalog` 下新建同名键 |
| ③-c 内链锚文本 | `reading{Something}` | 3／页 | 如 `readingWhatIs` / `readingTypes` |

其中 `{id}` ∈ `hall`（`/games`）、`classic`（`/games/classic`）、`solitaire`（`/games/solitaire`）。

**要求**
- 🔴 三个语种（`en` / `zh` / `zh-TW`）**都必须补齐全部键**（R4：只写 3 语，但这 3 语要全）
- ⛔ 退役 6 语（`messages/_retired/`）**不动**
- 🔴 撇号只用 `’`(U+2019)
- ✅ 键名保持**幂等**：同一键在三个页面间语义一致（如 `relatedReading` 三页共用一个值）

---

## 6. 边界（⛔ 明确不做）

1. ⛔ **不重命名任何路由目录** —— `/games/classic`、`/games/solitaire` 的目录名与内容不符（类目页却用玩法名），但这需要 308，**冻结期内禁止**
2. ⛔ **不加任何 redirect**
3. ⛔ **不动 `/games/[slug]` 下 8 个玩法页的 h1 / title** —— 它们已是干净的 `{Name} | Mahjong Hub`，且是页面权重来源
4. ⛔ **不删** `getGamesByNavGroup('solitaire')` 的数据，⛔ **也不改 `data/games.ts` 的 `navGroup` 值** —— 只改**呈现位置 + 分区**。
   - **原因（2026-09-22 19:00 补充）**：核查证实 `navGroup: 'solitaire'` 下混了两个不同品类（§2.5），理应把 `mahjong-connect-classic`（`:410`）移出。但 `NavGroup` 只有 4 个值（`data/games.ts:22`），移出去必须**新增枚举值**，进而必须**新建一个类目 URL**（如 `/games/casual`）→ **URL 级动作，冻结期禁止**。故本轮只在页面呈现层拆分（§4.2）。
5. ⛔ **不改 `nav.solitaire` / `nav.classic` 的现有值**（它们是导航标签）
6. ⛔ **不新增／退役语种**，不改 locale 前缀
7. ⛔ **不动 `/games/mahjong-solitaire-classic` 的任何内容** —— 它是 686 词的权威规则页。父页（`/games/solitaire`）**⛔ 不得复制**它的规则段（自由牌判定／turtle-pyramid 操作步骤／可解性说明）。抄过去两页会被判同题，**双双掉排名**（§7）
8. ⛔ **类目页一律不嵌牌桌**（`SITE_RULES.md` R7）—— `/games`、`/games/classic`、`/games/solitaire` 三页 ⛔ **不得**引入 `NativeGameLazy` / `IframeSection` / `ComingSoonGame`。想玩的用户从 ③ 段 CTA 进 `/games/{slug}`（**多一次点击**，22:12 定案明确接受的代价）
9. ⛔ **不给牌型／模式切换加 URL 参数或新路由** —— 若将来在任何页面实现，须用客户端 state；参数化会派生可被索引的重复 URL（`?layout=` 会凭空造出 15 个同页副本）

---

## 7. 🔴 自噬风险与化解（必读）

### 7.1 风险的准确形态（2026-09-22 22:12 三次校准）

**先排除两种不存在的风险：**

1. **「重复内容惩罚」—— 从未存在。** §4.2 实测：游戏不参与 SSR（`components/games/NativeGameMount.tsx:12` 的 `dynamic(…, { ssr: false })`），线上 HTML 里那 686 词**全部来自文字区块**，游戏区在可见 DOM 中是空的。⛔ 不要再以「两页嵌同一副牌 → 重复内容」为由做任何设计决策。
2. **「类目页嵌牌桌与子页争牌局」—— 已由 R7 消除。** 22:12 定案后类目页**不嵌牌桌**，两页在「是否可玩」上的差异不再有争议。

**真风险只剩一种 ——「关键词自噬」（keyword cannibalization）：**

`/games/solitaire` 改成 `Mahjong Solitaire` 后，会与现存的 `/games/mahjong-solitaire-classic` 争同一批查询。Google 遇到两个同主题 URL 时会自行挑一个给排名，另一个的权重被浪费 —— **页面本身不会被罚，但两页加起来的曝光小于一个页面**。

🔴 **为什么这个风险很实**：查 `data/games.ts:466-513`，子页那 686 词里已经包含「什么算 free」的判定、turtle／pyramid 牌型、hint／undo／reshuffle、`generated solvable` 保证可解。**如果父页也写这些，就是逐段同质** → 直接被判同题。

> ✅ **22:12 定案同时把化解难度降低了**：类目页不嵌牌桌 → 两页的**产品形态天然不同**（一个纯文字类目页、一个带牌桌的玩法页），Google 更容易识别为不同用途。剩下的只是**文字题材差异**，靠 §7.2 处理即可。

### 7.2 化解方案 —— 按「用户意图」分工，不是按「词的长短」

| 页面 | 用户意图 | 页内可玩 | 本页专属内容 | 目标词 | h1 |
|---|---|---|---|---|---|
| `/games/solitaire` | **「Mahjong Solitaire 是什么、有哪些玩法」** | ⛔ **否**（R7：类目页不嵌牌桌） | 品类定位、**solitaire vs connect 对比**、变体目录、选择建议、**内链到 blog** | `mahjong solitaire`（+ `mahjong solitaire games`） | `Mahjong Solitaire` |
| `/games/mahjong-solitaire-classic` | **「经典牌型具体怎么玩」** | ✅ 是（固定 turtle／pyramid） | 自由牌规则细节、turtle／pyramid 操作步骤、hint／undo／reshuffle、可解性说明、FAQ | `mahjong solitaire classic`、`turtle layout` | `Mahjong Solitaire Classic` |

**要点：**

- 两者是**父子关系**：父页回答「是什么／有哪些玩法」，子页回答「经典牌型具体怎么玩」。**文字题材不同才不互抢**；只靠「词长词短」区分是不够的
- 🔴 **父页 ⛔ 不写规则细节** —— 自由牌怎么判定、是否保证可解，这些**只**写在子页。父页提到时用一句话带过并**立即内链下探**
- `/games/solitaire` **必须向下内链** `/games/mahjong-solitaire-classic`，并在正文里明确「本页讲的是这类玩法的总览，Classic 是其中一种牌型」
- `/games/mahjong-solitaire-classic` 的 h1 / title **一个字都不改**（§6 第 3 条）
- ⛔ **两页的文字题材必须不同** —— 一旦父页也逐段写自由牌规则／操作步骤，就变成同题页，必然互抢（这才是本节的真实约束）
- 🎯 **「怎么玩」的入口安排**：类目页不放牌桌 → 想玩的用户从 ③ 段的 **CTA 按钮**进 `/games/mahjong-solitaire-classic`（**多一次点击**）。这是 22:12 定案明确接受的代价，换来的是本页能以「内容页」身份独立承接长尾查询
- ✅ **父页的独有内容其实很硬**：`solitaire ≠ connect` 这个对比，站内两个玩法页的 FAQ 都只各写了一半，**没有任何一页完整讲过**。这是本页可以独占的一段（同时是通往兄弟页 `/games/mahjong-connect-classic` 的内链）

### 7.3 4 周后验证分流是否成功

索引恢复期结束后（约 10 月中），在 GSC 搜 `mahjong solitaire` 看：

| 观察 | 判读 | 动作 |
|---|---|---|
| 父页排名 ↑，子页稳 | ✅ 分流成功 | 不动 |
| 子页排名 ↑，父页不出现 | ⚠️ Google 认为两者同题 | **改文字、不删页**：加强父页的 `solitaire vs connect` 对比段，删掉与子页重叠的段落，让题材差异更明显 |
| 两页都排在同一查询的 1–2 位且互替 | ✅ 可接受 | 不动 |

⛔ **不要在冻结期内根据短期波动就改回去** —— 索引重建期数据不可信。

---

## 8. 验收（Cursor 交付前必须全部实测）

### 8.1 命令

```bash
# 1. 导航 href 已改（应出现 /games，不再有指向 /games/solitaire 的导航项）
curl -s https://mahjonggame.org/en | grep -o 'href="/en/games[^"]*"'

# 2. 三个页面 h1 数量 = 1，且文案符合 §5
python _verify/gsc-sitemap-20260922/check_pages.py

# 3. 🔴 R7 类目页三段式 —— ③ 段（介绍 + FAQ + 内链）齐全，且 ⛔ 无牌桌
python - <<'PY'
import re,urllib.request
def get(u):
    r=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'})
    return urllib.request.urlopen(r,timeout=30).read().decode('utf-8','replace')
for p in ['/en/games','/en/games/classic','/en/games/solitaire']:
    s=get('https://mahjonggame.org'+p)
    body=re.sub(r'(?is)<script[^>]*>.*?</script>',' ',s)   # 剥离 RSC payload
    w=len(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',body)).split())
    blog=len(set(re.findall(r'href="(?:/[a-z-]+)?/blog/[a-z0-9-]+"',s)))
    table=bool(re.search(r'Start Game|Loading game|min-h-\[520px\]',body))
    print(p, '| h1 =', len(re.findall(r'(?i)<h1',body)), '| 词数 ≈', w,
          '| blog内链 =', blog, '| FAQPage =', 'FAQPage' in s, '| 牌桌 =', table)
PY
# 期望：h1 = 1｜词数 ≥400｜blog内链 ≥3｜FAQPage = True｜牌桌 = False

# 4. /games 上「More puzzles」不再自指（href 应指向 /games/solitaire）
# 5. /games/solitaire 页内已无 Connect 卡片；且 /games 上 Connect 仍可见（唯一入口）
# 6. 三语同步：/zh、/zh-TW 同样通过 1–5

# 7. ✅ R6 玩法页**不受影响** —— 8 个 /games/{slug} 仍须「文字 → 牌桌 → 文字」
python - <<'PY'
import re,urllib.request
def get(u):
    r=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'})
    return urllib.request.urlopen(r,timeout=30).read().decode('utf-8','replace')
for p in ['/en/games/hong-kong-mahjong','/en/games/mahjong-solitaire-classic']:
    s=re.sub(r'(?is)<script[^>]*>.*?</script>',' ',get('https://mahjonggame.org'+p))
    h1=s.find('<h1')
    g=[i for i in (s.find('Start Game'),s.find('Loading game'),s.find('min-h-[520px]')) if i>=0]
    gate=min(g) if g else -1
    w=len(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',s)).split())
    print(f'{p:42s} h1@{h1:<6} 牌桌@{gate:<6} {"PASS" if 0<=h1<gate else "CHECK"} 词数≈{w}')
PY
# 期望：PASS（文字仍在牌桌之前），词数 ≥300
```

### 8.2 验收清单

| 验收项 | 通过标准 |
|---|---|
| 导航 | 4 个 href = `/games/classic`、`/games`、`/tools`、`/blog`，互不重复 |
| h1 | 三页各**恰好 1 个** h1（R3 一页一 h1） |
| 🔴 **R7 类目页三段式** | 三个类目页内容顺序 = **① 文字（类目名 + 简介）→ ② 卡片（玩法卡）→ ③ 文字（介绍 + FAQ + 内链）** |
| **类目页词数** | `/games` ≥400｜`/games/classic` ≥400｜`/games/solitaire` ≥400 |
| **③-a 玩法介绍** | 每页 **≥150 词**静态文字（剥离 `<script>` 后可见） |
| **③-b FAQ** | 每页 **≥4 问**，且 HTML 里能搜到 `FAQPage` JSON-LD |
| **③-c 内链 → blog** | 每页 **≥3 条** `/blog/{slug}` 链接，目标符合 §4.2.3 的 `CTA_HREF` 反查表 |
| ⛔ **类目页无牌桌** | 三页均**不含** `NativeGameLazy` / `Start Game` / `Loading game` |
| ✅ **R6 玩法页不变** | 8 个 `/games/{slug}` 仍为「h1 + intro → 牌桌 → How to play / Tips / FAQ」 |
| 🔴 **R5 URL 层级** | sitemap 中 `/games` 相关 URL 深度只到 `/en/games/{slug}`，**无三级路径**；未新增/重命名 `/games/` 下任何路由目录 |
| **品类纯度** | `/games/solitaire` 的 h1／title／正文主段**三处同为 solitaire**；页内**不出现** Connect 卡片 |
| **Connect 不孤立** | `/games` 上 Connect 卡片仍在；`/games/mahjong-connect-classic` 与 `/games/mahjong-solitaire-classic` 互为入口（两边「Try another game」都通） |
| **无规则重复** | `/games/solitaire` 正文**不出现**自由牌判定细节／turtle-pyramid 操作步骤／可解性说明（这些只归 `/games/mahjong-solitaire-classic`） |
| 自指链接 | `/games` 页内不再有指向自身的卡片链接（「More puzzles」卡须指向 `/games/solitaire`） |
| JSON-LD | 三个类目页各有 `CollectionPage` + `FAQPage`（`/games` 已有 `CollectionPage`，**只需补 `FAQPage`**） |
| robots | 三页均含 `index, follow`，无 noindex |
| 语种 | en / zh / zh-TW 三语全部通过（R4：只写 3 语） |
| 回归 | `npm run gate` 通过（提交前必跑） |

---

## 9. 影响面

| 项 | 说明 |
|---|---|
| 触发 GSC 重评？ | **否** —— 全部是同 URL 内的内容/元数据/站内链接改动（未新增、未改动、未重定向任何 URL） |
| 预期收益 | ① 导航头两位不再把权重导向 100 词薄页，总大厅获得导航权重；② 三页 h1 从零关键词变为含关键词；③ **三个类目页从「纯导航页」变成「有内容可索引的页」** —— 每页 +≥300 词、+4 条 FAQ、+3 条指向 blog 的内链，**收录面积与内链闭环同时扩大**；④ `solitaire`（站内最高价值词，热度 ≈ connect 的 6.5 倍）从「挂在全站最薄页」转为「有专属内容页 + 强父子内链」 |
| 风险 | ① 主风险＝D2 与 `/games/mahjong-solitaire-classic` 抢词（§7 已给分工与 4 周验证方案）② **已消除**：20:15 的「牌桌放错位置 → 空首屏」风险随 22:12 定案（类目页不嵌牌桌）**自动消失** ③ 改 h1 / 加文字后短期排名波动（正常，1–2 周内收敛） |
| 提交建议 | 拆成 **5 个 commit**：① Header href（§4.1）② `/games/solitaire` 重定位 + Connect 移出（§4.2）③ `/games` + `/games/classic` 补 ③ 段 + 修自指链接（§4.3、§4.4）④ `catalog` 命名空间三语文案（§5.5）⑤ `messages/zh*.json` 的「消除」→「接龙」译名修正（§5.4）。⛔ 禁止 `git add -A`（工作区还有 20+ 未提交文件） |
| ⛔ 未含在本 spec | 补一篇 `mahjong solitaire` 基石文章（§4.5(b)）—— 须另立任务，走 `mahjong-hub-blog-expansion` 的硬约束 |
