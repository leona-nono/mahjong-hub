# 站点硬规则 · SITE_RULES

> **站点级、跨功能的不可妥协约定。** 任何功能规格与本文件冲突时，**以本文件为准**。
> 文案真源：`data/site.json`；规则真源：本文件。
> 已确立：2026-09-17（R1–R3）／2026-09-18（R4 语种范围）／2026-09-18（R1 改回港麻首屏）／2026-09-22（R5 URL 层级、R6 玩法页三段式、R7 类目页模板）

---

## R1 · 首屏第一区块 = 港麻一键开局

**规则**
各 locale 首页（`/`）的**第一个内容区块**必须是可立即上手的**四人港麻练习桌**（`HomeDailyHand`：当日种子墙 + `MahjongTable`）。访客进站即可打牌，不必先点进别的游戏页。

**为什么**
站点差异化卖点是自研四人真麻将（见 `CLAUDE.md`）；Solitaire / Connect 是流量入口，**不得**占首页第一块。`Instant play, no download` 在此落实为「牌桌已在眼前」，而不是跳转到消除页。

**要求**
- 第一区块：`components/HomeDailyHand.tsx`（由 `app/[locale]/(public)/page.tsx` 置顶）
- 规则集：Hong Kong（`lockRuleset` + daily seed）；文案走 `dailyHand.*`
- ⛔ Solitaire / Connect 主 CTA、签到、公告、推广位、游戏墙**一律不得**占据首屏第一区块（可出现于第二区块及以后）
- ⛔ 不要把 `HomeHero`（solitaire 主 CTA，见提交 `a81ea11`）再挂回首页第一块

**现状（2026-09-18）**
首页顺序：站点定位 `<h1>` + **`HomeDailyHand`** → SEO / Learn / FAQ → 游戏墙。`HomeHero` 不挂首页。

---

## R2 · 首页 `<h1>` = 站点定位 SEO 关键词

**规则**
首页**有且仅有一个** `<h1>`，其文本 = 站点定位关键词。

- 真源：`data/site.json → homeH1`（当前值 `"Play Mahjong Online Free – Mahjong Solitaire, Riichi & Chinese Mahjong"`）
- 同值 i18n 键：`messages/*.json → home.heroTitle`
- 功能模块标题（游戏墙 / 学习卡片 / 术语表入口 …）**一律 `<h2>` 及以下**；港麻桌区块不另挂可见功能标题（桌面即入口）

**为什么**
`<h1>` 是页面主题最强的相关性信号位，而首页是站点权重最高的页面。把它让给一个次要功能的标题，等于**浪费首页最强的关键词位**。

> ⚠️ **澄清（防止误判方向）**：`<h1>` **不影响爬取（crawl）** —— 抓取由 URL / 链接 / robots 决定。它影响的是**相关性信号**与 SERP 展示。
> 所以这条**不是**"爬虫读不到"的问题，是"**读到了，但读错了主题**"的问题。不要把它当成抓取优化去修。

**要求**
- ⛔ 功能组件内**不得**出现 `<h1>`（页面标题层级由路由层决定，不由组件决定）
- ⛔ 任何页面不得出现两个及以上 `<h1>`（见 R3）

**现状（2026-09-18）**

| # | 位置 | 状态 |
|---|---|---|
| 1 | `app/[locale]/(public)/page.tsx` | **唯一 `<h1>`** = `home.heroTitle`（与港麻桌同属第一区块文案头） |
| 2 | `components/HomeDailyHand.tsx` | **无可见标题**（仅 `aria-label`；牌桌紧接站点 `<h1>`） |
| 3 | `components/HomeHero.tsx` | **不挂首页**；内含 solitaire CTA，仅作备用 |
| 4 | `data/site.json → homeH1` / `home.heroTitle` | EN 同值；由首页路由渲染 |

**R1 + R2 同时满足**
1. 第一区块 = 站点 `<h1>` + `HomeDailyHand`（牌桌即开局）
2. `HomeDailyHand` 内不放可见功能标题 / `<h1>`（桌面即开局）
3. 不要为了 SEO 再把 solitaire `HomeHero` 插回第一块

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

## R5 · 游戏区 URL 只有两层 —— 「大厅 → 类目 → 玩法」是**内容层**概念，不是 URL 层

> 已确立：2026-09-22（用户拍板）。**本条用于终止反复出现的「三层 IA」误判。**

**规则**
游戏区的 **URL 层级只到 `/games/` 下的一级**：

```
/en/games              ← 大厅（hub）
/en/games/classic      ┐
/en/games/solitaire    ├ 全部平级，都是 /games/ 下的一级
/en/games/{8 个 slug}  ┘
```

`/games/classic`、`/games/solitaire` 与 8 个玩法页 `/games/{slug}` **在 URL 上完全同级**。⛔ 不存在 `/games/classic/{slug}` 这类更深路径。

**「大厅 → 类目 → 玩法」只在内容层成立：**

| 层 | URL | 实现 | 本质 |
|---|---|---|---|
| 大厅 | `/games` | 静态页 `app/[locale]/(public)/games/page.tsx` | hub，列全部 |
| 类目 | `/games/classic`、`/games/solitaire` | 静态页 | **列表页**（URL 名 == 内容名，**不是玩法页**） |
| 玩法 | `/games/{slug}` × 8 | 动态页 `games/[slug]/page.tsx` | 数据来自 `data/games.ts` |
| 分组 | **无 URL** | `data/games.ts → navGroup` | `classic` 6 个 / `solitaire` 2 个 —— **纯虚拟层** |

**为什么必须钉死这条**
- 误判「三层」会按**父子关系**去设计内链与关键词分工，而真实关系是**平级** → 内链方向、关键词归属、h1 分工会全部做错。
- `navGroup` 分组很容易被误读成 URL 也分组 —— **它不产生任何 URL 层级**。

**要求**
- ⛔ 冻结期内**不得**在 `/games/` 下新增路由层级（不新增 `/games/{cat}/{slug}`）
- ⛔ 不得重命名 `classic` / `solitaire` 目录（要 308 → 触发 Google 重评）
- ✅ 任何层级讨论**必须写明是「URL 层」还是「内容层」** —— 两者不是一回事

---

## R6 · 游戏**玩法页**三段式模板 —— 文字 → 牌桌 → 文字

> 已确立：2026-09-22（用户拍板）。**仅适用于带牌桌的玩法页 `/games/{slug}`。**
> ⛔ **类目页 —— `/games`、`/games/classic`、`/games/solitaire` —— 不适用本条**，改用 R7（类目页不嵌牌桌）。

**规则**
任何玩法页的内容顺序固定为三段：

```
① 文字 —— 游戏名 + 玩法简介
② 牌桌 —— 可玩区域（客户端渲染）
③ 文字 —— FAQ / What / How / Tips + 内链
```

**为什么**
- **① 必须在 ② 之前** —— 09-14 首页曝光归零的根因就是「第一内容区块被客户端组件占据」，SSR 只剩 `Loading table…`，Google 抓到空首屏。游戏是 `ssr:false`，**牌桌排第一 = 首屏对爬虫为空**。
- **① 负责被收录** —— `<h1>` + 简介段构成首屏**唯一**能被索引的实质文字。
- **③ 负责长尾与内链** —— FAQ / how / tips 承接长尾查询，内链把权重导向平级兄弟页与相关玩法页。

**要求**

| 位置 | 内容 | 硬性 |
|---|---|---|
| ① 文字 | `<h1>`（游戏名）＋ 定位/玩法简介段 **≥60 词** | ✅ 必须 **SSR 静态文本**，排在牌桌**之上** |
| ② 牌桌 | `NativeGameLazy` / `IframeSection` / `ComingSoonGame` | 客户端渲染可以，⛔ 不得排在 `<h1>` 之前 |
| ③ 文字 | `How to play` / `Features` / `Tips` / `FAQ` / 内链 | ✅ 必须 **SSR 静态文本** |

- ⛔ **禁止**把牌桌放在 `<h1>` 之前，或让它成为第一内容区块
- ⛔ **禁止**让整页只剩牌桌（纯交互 = 空盒子，爬虫陷阱）
- ⛔ 牌型／模式切换**不落 URL**（用客户端 state）—— 参数化会派生可索引副本

**现状核对（2026-09-22 实测）**

| 页面 | 状态 |
|---|---|
| `/games/[slug]` × 8 | ✅ **已符合** —— `page.tsx:186-203`（h1 + intro）→ `:139-161` 牌桌 → `:228-297`（How to play / Features / Tips / FAQ） |

> 类目页（`/games`、`/games/classic`、`/games/solitaire`）见 **R7**。

---

## R7 · 游戏**类目页**模板 —— 文字 → 卡片 → 文字（介绍 + FAQ + 内链）

> 已确立：2026-09-22（用户拍板）。**适用于 `/games` 与 `/games/{类目}`（`classic` / `solitaire`）。**
> ⛔ **类目页一律不嵌牌桌** —— 牌桌只属于玩法页（R6）。

**规则**
类目页内容顺序固定为三段：

```
① 文字 —— 类目名（<h1>）+ 定位简介
② 卡片 —— 该类目下的玩法卡（链接到 /games/{slug}）
③ 文字 —— 玩法介绍 + FAQ + 内链（→ /blog）
```

**为什么**
- 类目页现状是「`<h1>` + 1~2 句话 + 几张卡」＝ **100~200 词**，除导航与面包屑外**没有任何内容信号** → 既接不住长尾查询，也拿不到外链，却**占据导航第 1、2 位**（全站内链权重最集中的落点）。
- 补上 ③ 段后，类目页从「纯导航页」变成「**有内容可索引的页**」：可收录的 URL 面积扩大、内链形成闭环（`blog → 类目页 → 玩法页`）。
- ⛔ **不嵌牌桌**：类目页的主题是「**这一组**游戏」，嵌一张牌桌会让它退化成某个具体玩法页的副本，与 R6 玩法页**争同一批词**（关键词自噬）。

**要求**

| 位置 | 内容 | 硬性 |
|---|---|---|
| ① 文字 | `<h1>`（类目名）+ 定位简介 **≥60 词** | ✅ 必须 **SSR 静态文本** |
| ② 卡片 | 该类目的玩法卡（`CatalogGameCard`），href → `/games/{slug}` | ✅ SSR |
| ③-a 玩法介绍 | 该类目「是什么 / 有哪些玩法 / 怎么选」**2–3 段 ≥150 词** | ✅ 必须 **SSR 静态文本** |
| ③-b FAQ | **≥4 问**，i18n 键 `{ns}FaqQ{n}` / `{ns}FaqA{n}` | ✅ SSR ＋ `FAQPage` JSON-LD |
| ③-c 内链 → blog | **3 条** `<Link href="/blog/{slug}">`，目标见下表 | ✅ SSR |
| JSON-LD | `CollectionPage` ＋ `FAQPage` | ✅ 须能在 HTML 源码中搜到 |
| **正文总词数** | **≥400**（①≥60 ＋ ③-a≥150 ＋ ③-b 4 问 ≈120 ＋ 卡片文案） | 剥 `<script>` 后计，见验收 #6 |

- ⛔ **不得**嵌入 `NativeGameLazy` / `IframeSection` / `ComingSoonGame`
- ⛔ **不得**出现第二个 `<h1>`（见 R3）
- ⛔ 内链目标**不得凭空指定** —— 必须来自 `data/blog-clusters.ts` 的 `CTA_HREF` **反查**（否则会链到主题无关的文章，权重白流）
- ⛔ 内容文案**只写 3 语**（`en` / `zh` / `zh-TW`，见 R4）

**内链目标（由 `CTA_HREF` 反查得出，⛔ 勿自创）**

| 类目页 | 应链的 blog 文章（`CTA_HREF` 中指向本页的） |
|---|---|
| `/games/classic` | `types-of-mahjong-games`（variants 簇 pillar）、`american-vs-chinese-mahjong`、`how-to-play-american-mahjong` |
| `/games/solitaire` | ⚠️ **无专属文章** —— 退用「正文提及 solitaire」的：`what-is-mahjong`（含 `Mahjong Solitaire vs. Four-Player Mahjong` 段）、`mahjong-tiles-meaning-guide`、`types-of-mahjong-games` |
| `/games`（大厅） | `what-is-mahjong`、`how-to-play-mahjong`、`types-of-mahjong-games` |

🔴 **内容缺口（本条收益最大的一步）**：站内 20 篇博客**无一篇专讲 `mahjong solitaire`**，而它是站内搜索热度最高的词（行业量级 ≈ connect 的 6.5 倍）。`/games/solitaire` 的内链目前只能「借」主题部分相关的文章。**补一篇 solitaire 基石文章**（三语）是让本类目页真正吃到权重的前提。

**范本（⛔ 不要另起结构）**
`app/[locale]/(public)/tools/page.tsx` —— 已完整实现本模板的**全部**要素，直接照抄：

| 本模板要素 | tools 页位置 |
|---|---|
| ③-a 玩法/工具介绍 | `:147-152`（`hubAboutTitle` + 3 段静态文字） |
| ③-b FAQ（4 问，i18n 键） | `:34` `HUB_FAQ_COUNT = 4`；`:154-164` 渲染 |
| ③-c 内链 → blog（3 条） | `:166-186`（`relatedReading` 区块） |
| JSON-LD（CollectionPage + FAQPage） | `:65-97` |
| 文案数据源 | `messages/*.json` 的 `tools` 命名空间 |

**现状核对（2026-09-22 实测）**

| 页面 | 词数 | 现状 | 待办 |
|---|---|---|---|
| `/games/solitaire` | 103 | 无 FAQ／无内链／无 JSON-LD | 🔴 补 ③ 段全部 |
| `/games/classic` | 133 | 同上 | 🔴 补 ③ 段全部 |
| `/games`（大厅） | 207 | 无 FAQ／无内链；**已有** `CollectionPage`（`hub-jsonld.ts`） | 🔴 补 ③-a/③-b/③-c ＋ `FAQPage` |

---

## 附 · 验收方式

```bash
# 1. 线上首页：期望恰好 1 个 <h1>，且文本 == data/site.json.homeH1
curl -s https://mahjonggame.org/en | grep -o '<h1[^>]*>[^<]*</h1>'

# 2. 静态检查：功能组件（components/Home*）不应再出现 <h1>
grep -rn "<h1" components/HomeDailyHand.tsx components/HomeDailyChallenge.tsx

# 3. R4 验收：9 个 blog-i18n 文件仍存在，且 slug 集与 en 完全一致
node -e "const fs=require('fs');const L=['en','zh','zh-TW','ja','ko','es','fr','de','pt-BR'];const J={};for(const l of L)J[l]=JSON.parse(fs.readFileSync('data/blog-i18n/'+l+'.json','utf8'));const e=Object.keys(J.en);for(const l of L){const k=Object.keys(J[l]);const miss=e.filter(s=>!k.includes(s));console.log(l.padEnd(7),k.length,miss.length?'MISSING '+miss:'ok')}"

# 4. R5 验收：游戏区 URL 深度只到 /games/{一层}
curl -s https://mahjonggame.org/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' \
  | grep '/games' | awk -F/ '{print NF}' | sort -u
# 期望：仅两行（5 = /en/games，6 = /en/games/{slug}），⛔ 不得出现 7

# 5. R6 验收：①文字 必须排在 ②牌桌 之前（**只对玩法页 `/games/{slug}`** —— 类目页无牌桌，见 R7）
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
# 期望：全部 PASS，且词数 ≥300（①②③ 三段都有 SSR 文本）

# 6. R7 验收：类目页须有 ③ 段（介绍 + FAQ + 内链）且无牌桌
python - <<'PY'
import re,urllib.request
def get(u):
    r=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'})
    return urllib.request.urlopen(r,timeout=30).read().decode('utf-8','replace')
for p in ['/en/games','/en/games/classic','/en/games/solitaire']:
    s=get('https://mahjonggame.org'+p)
    body=re.sub(r'(?is)<script[^>]*>.*?</script>',' ',s)   # 剥离 script（RSC payload 不算）
    w=len(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',body)).split())
    h1=len(re.findall(r'(?i)<h1',body))
    faq='FAQPage' in s
    blog=len(set(re.findall(r'href="(?:/[a-z-]+)?/blog/[a-z0-9-]+"',s)))
    has_table=bool(re.search(r'Start Game|Loading game|min-h-\[520px\]',body))
    print(f'{p:26s} h1={h1} 词数≈{w:<5} blog内链={blog} FAQPage={faq} 牌桌={has_table}')
PY
# 期望：h1=1｜词数 ≥400｜blog内链 ≥3｜FAQPage=True｜牌桌=False
```

**验收清单**
- [x] 首页第一区块 = 港麻 `HomeDailyHand`（牌桌即开局）
- [x] 首页恰好 1 个 `<h1>`，文本 = `site.json.homeH1`（经 `home.heroTitle`，在路由层渲染）
- [x] `HomeDailyHand` 内无可见功能标题 / `<h1>`（桌面紧接站点 `<h1>`）
- [x] `HomeHero`（solitaire CTA）**不**挂在首页第一块
- [x] 3 个 locale（`en` / `zh` / `zh-TW`）已有 `home.heroTitle` / `dailyHand.*` 等键
- [ ] **R5**：sitemap 里 `/games` 相关 URL 深度只到 `/en/games/{slug}`（无三级路径）
- [ ] **R5**：`classic` / `solitaire` 目录名未改（无新增 URL 级 308）
- [ ] **R6**：每个**玩法页**（`/games/{slug}`）`</h1>` 位置 **早于** 第一个牌桌闸门（`Start Game` / `Loading game`）
- [ ] **R6**：每个玩法页剥离 `<script>` 后词数 **≥300**（①②③ 三段均有 SSR 文本）
- [ ] **R6**：牌型／模式切换未落 URL（无 `?layout=` 之类可索引参数）
- [ ] **R7**：每个类目页剥离 `<script>` 后词数 **≥400**（①③ 两段均有 SSR 文本）
- [ ] **R7**：每个类目页含 **≥4 问 FAQ**，且 HTML 里有 `FAQPage` JSON-LD
- [ ] **R7**：每个类目页含 **≥3 条 `/blog/{slug}` 内链**，目标来自 `CTA_HREF` 反查表
- [ ] **R7**：每个类目页**不含**牌桌（无 `Start Game` / `Loading game` / `NativeGameLazy`）
