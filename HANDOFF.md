# mahjong-hub 交接文档

面向 Claude Code 的落地说明。仓库 `D:\AICode\leona-nono-mahjong-hub`，线上 https://mahjonggame.org。

---

## 一、先把这批代码落到本地

补丁基于 commit `4466c2c`（`Integrate Google, Facebook, and X OAuth (#1)`）。如果你本地已经领先于这个 commit，跳到「1B 冲突处理」。

### 1A 正常路径

PowerShell，在仓库根目录执行：

```powershell
cd D:\AICode\leona-nono-mahjong-hub

# 确保工作区干净，并新开分支
git status
git checkout -b feat/native-mahjong-games

# 把 mahjong-native-games.patch 放到仓库根目录后：
git apply --check .\mahjong-native-games.patch   # 先试跑，无输出即可
git apply .\mahjong-native-games.patch

git status   # 应该看到 27 个文件变更
```

### 1B 冲突处理

如果 `git apply --check` 报错，改用三方合并：

```powershell
git apply --3way .\mahjong-native-games.patch
```

再冲突就直接用 `native-games-files.zip`：里面是**全部新增文件**（`lib/mahjong/`、`lib/connect/`、`components/games/`、两个测试文件），直接解压覆盖即可，这些路径在原仓库不存在，不会冲突。剩下 13 个被修改的既有文件需要手工合并，改动点在下面第三节列清楚了。

### 1C 验证

```powershell
npm install
npx vitest run          # 应为 65 passed（原有 30 + 新增 35）
npx tsc --noEmit        # 只应剩 prisma 相关的既有报错
npm run build           # 需要能跑 prisma generate（本机网络没问题就行）
npm run dev             # 打开 http://localhost:3000/zh/games/hong-kong-mahjong
```

`npm run build` 之前记得本地 `.env.local` 里要有 `DATABASE_URL`，否则 `prisma generate` 之后的构建仍会在 admin 页面降级——这是既有行为，不是这批代码引入的。

---

## 二、建议在仓库根目录创建 CLAUDE.md

Claude Code 每次会话会自动读这个文件。把下面内容存成 `CLAUDE.md` 提交上去，之后所有会话都自带背景，不用反复解释：

````markdown
# mahjong-hub

面向海外市场的麻将游戏站。Next.js 15 App Router + next-intl 五语 SSG，部署在 Vercel，
域名 mahjonggame.org。

## 产品定位

两类用户几乎不重叠，站点两类都收：
- **Mahjong Solitaire / Connect 消除类**——欧美搜索量的绝大部分在这里，做流量入口。
- **四人真麻将**（港麻 / 日麻 / 国标）——垂直、竞争小，是差异化和留存的来源。

## 架构约定

- `data/games.ts` 是游戏目录的唯一真相来源。两种条目：
  - `gameType: 'native'`——自研游戏，代码在 `lib/mahjong/` 和 `lib/connect/`，
    页面 `index: true`，带完整规则文案和结构化数据，**只有这类进 sitemap**。
  - `gameType: 'iframe'`——第三方外链嵌入，页面保持 `noindex`（内容不是我们的）。
- `lib/mahjong/` 是纯 TS、不依赖 React 的引擎，方便将来搬到服务端做多人对战。
  UI 层在 `components/games/`，不允许把游戏规则逻辑写进组件。
- 所有对局用种子化 PRNG（`createRng`），保证可复现，测试和回放都依赖这一点。
- 新增游戏分类时，**必须同步改四处**：`data/games.ts` 的 `GameCategory`、
  `lib/admin-validators.ts` 的 `GAME_CATEGORIES`、`app/admin/games/page.tsx` 的
  `CATEGORY_LABELS`、以及 `components/admin/{NewGameForm,GameEditorForm}.tsx` 的选项列表。
  漏掉任何一处 `tsc` 会报错。
- 新增 UI 文案要同时补 `messages/` 下五个语言文件（en / zh / zh-TW / ja / ko）。

## 合规红线

- **不要实现美式 NMJL 牌型。** National Mah Jongg League 持有 NMJL 商标，
  每年那张官方牌型卡是有版权的作品，复刻即侵权。美式麻将人群走电商和教学内容变现。
- 不接入第三方游戏源码，只做已验证可嵌入的 iframe 外链。
- 站点**不得**出现真钱下注、可购买的博彩货币或现金奖励，任何形式都不行。
  这条同时关系到 AdSense 政策和各国博彩监管。
- 面向欧美需要 GDPR / CCPA 隐私政策和 Cookie 提示。

## 命令

```
npm run dev          # 本地开发
npm run build        # prisma generate + next build
npx vitest run       # 单测
npx tsc --noEmit     # 类型检查
```
````

---

## 三、这批代码改了什么

### 新增：自研麻将引擎 `lib/mahjong/`

纯 TS，无 React 依赖，可整体搬到服务端。

| 文件 | 职责 |
|---|---|
| `tiles.ts` | 136 张牌模型、34 位计数数组编码、种子化 PRNG、牌面显示与 aria 名称 |
| `shanten.ts` | 向听数（标准型 / 七对子 / 国士）、胡牌判定、听牌枚举、和牌拆解 |
| `engine.ts` | 状态机：摸打、吃碰杠、荣和自摸、claim 优先级仲裁、流局、三套规则配置 |
| `scoring.ts` | 番种识别与计分，三套规则各自的番值表和起胡门槛 |
| `ai.ts` | 机器人：按向听数选打，ukeire（进张数）做 tie-break，三档难度 |

关键设计：`shanten.ts` 用穷举拆解而不是查表。14 张牌规模下速度足够，而且正确性肉眼可验证——
这在规则边界上会省掉大量调试时间。`ai.ts` 的两段式（先按向听数筛，再只对并列候选算 ukeire）
是为了把浏览器端的计算量压到 150 次左右调用，否则单步会卡到几百毫秒。

### 新增：连连看 `lib/connect/board.ts`

BFS 在 `(格子, 方向, 转弯数)` 状态空间上搜路径，转弯数上限 2。棋盘带一圈空边框，
所以允许绕外圈走——这是这个品类的通行规则。死局自动重排。

### 新增：UI `components/games/`

`TileFace.tsx`（花色分色 + aria-label）、`MahjongTable.tsx`（四人牌桌，含听牌提示）、
`MahjongConnect.tsx`（三档棋盘 + 计时 + 提示）、`NativeGameMount.tsx`（把胜局接到积分系统）。

### 修改的既有文件

| 文件 | 改动 |
|---|---|
| `data/games.ts` | 加 `'four-player'` 分类、`gameType: 'iframe' \| 'native'`、`GameContent` 长文案结构；新增 4 款自研游戏；`getRelatedGames` 改为优先同分类；新增 `getNativeGames` / `getGamesByCategory` |
| `app/[locale]/(public)/games/[slug]/page.tsx` | 自研游戏走 `NativeGameMount`；自研页 `index: true` + VideoGame/FAQPage 结构化数据 + canonical + hreflang；渲染玩法/策略/FAQ 区块 |
| `app/sitemap.ts` | 只收自研游戏页（iframe 页是 noindex，进 sitemap 会给 Search Console 相互矛盾的信号），带 hreflang alternates |
| `app/[locale]/page.tsx` | 首页新增「自研游戏」板块，放在 Featured 之上 |
| `components/GameCard.tsx` | Original 徽标、玩家数徽标、分类色带 |
| `components/IframeSection.tsx` | `gameIframeUrl` 变可选后加空值兜底 |
| `lib/admin-validators.ts`、`app/admin/games/page.tsx`、两个 admin 表单 | 同步 `'four-player'` 分类 |
| `messages/*.json` ×5 | 新增 `mahjong` / `connect` 命名空间和 `game.howToPlay` / `tips` / `faq` |

### 测试

`tests/mahjong-engine.test.ts`（21 例）+ `tests/connect-board.test.ts`（14 例）。
覆盖牌墙完整性、向听数各形态、听牌枚举、和牌拆解、种子可复现、AI 不会打坏自己的牌、
连连看路径的绕边与转弯上限。

---

## 四、接下来的任务队列

按价值排序。每条都是可以直接粘进 Claude Code 的 prompt。

### T1 · 补日麻立直机制（引擎）

> 在 lib/mahjong/ 里为 riichi 规则补齐立直机制。需要：PlayerState 增加立直状态与立直巡目；
> 只有门清且听牌时可宣言立直，宣言后手牌锁定（除暗杠外只能摸切）；实现一发和振听判定；
> scoring.ts 增加立直、一发、门前清自摸和、平和、断幺九、役牌的役种识别，并加入 riichi
> 的最低役要求判定。所有新逻辑都要在 tests/mahjong-engine.test.ts 里补测试。
> 注意：engine.ts 是纯 TS 无 React 依赖，保持这个约束。

### T2 · 机器人防守（引擎）

> 给 lib/mahjong/ai.ts 增加防守逻辑。当有对家立直或明显听牌（副露三组以上、牌河后段
> 停止打某一色）时，机器人应切换到防守模式：优先打现物（该家牌河里已有的牌），
> 其次按筋牌和壁牌估算危险度。难度 hard 才启用完整防守，normal 只打现物。
> 补测试验证机器人在对家立直后确实优先选择现物。

### T3 · 麻将单人消除（自研，替换 iframe）

> 参考 lib/connect/board.ts 的写法，在 lib/mahjong-solitaire/ 新建自研的麻将单人消除
> （Mahjong Solitaire）引擎：多层牌堆布局（至少龟甲和金字塔两种）、"某张牌左右有一侧
> 空且顶部无遮挡"的可点击判定、洗牌保证可解、提示与撤销。UI 放 components/games/。
> 然后在 data/games.ts 加一条 native 条目（category 用 'solitaire'），配完整
> GameContent 文案。这是站点流量最大的品类，目前全靠 iframe，优先级高。
> 记得同步五个语言文件。

### T4 · SEO 内容站

> 在 app/[locale]/(public)/ 下新建 guides 板块：列表页 + 详情页，内容用 MDX 或
> data/ 下的结构化数据都可以，你选更好维护的那个。首批写这几篇（英文优先，
> 其余语言先留空回退到英文）：How to Play Mahjong for Beginners、Mahjong Solitaire
> vs Real Mahjong（这个搜索意图区分是我们的核心差异点）、Hong Kong vs Riichi vs
> Chinese Official Rules Compared、Mahjong Tile Guide。每篇要有 Article 结构化数据、
> canonical、hreflang，并加进 sitemap。文章要内链到对应的自研游戏页。

### T5 · 后端 Phase 1 接真实登录

> 把 components/LoginModal.tsx、components/Header.tsx 和 lib/points.tsx 从
> localStorage mock 切到真实 Auth.js session 与 /api/points。保留未登录用户
> 可自由游玩、只在发积分时提示登录的现有产品规则。前置条件：Vercel 和本地
> .env.local 已配好 DATABASE_URL 与 OAuth 凭证。

**T5 卡在你手上的三个外部依赖**——Neon 建库拿 `DATABASE_URL`、三家 OAuth 凭证、
Shopify 店铺。这三项不解决，后端 Phase 1 和商业化都动不了，8 月底软启动的主要风险就在这里，
建议排在写代码之前处理。

---

## 五、给 Claude Code 用的几条实操建议

- 每个任务开一个分支，做完让它跑 `npx vitest run && npx tsc --noEmit && npm run build` 再提交。
  这三条命令是这个仓库的完整验收门槛。
- 让它改 `data/games.ts` 的分类时，明确提醒「四处同步」那条规则，否则很容易漏掉 admin 侧。
- 引擎类改动（T1/T2）要求它**先写测试再写实现**。麻将规则的边界条件极多，
  没有测试兜底的话，改一个役种很容易悄悄弄坏向听数计算。
- 如果它想给 `lib/mahjong/` 引入 React 或任何 UI 依赖，拒绝——这个边界是为将来的服务端
  多人对战留的。
