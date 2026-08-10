# CLAUDE.md

本文件是 Claude Code 在此仓库工作时需要遵守的项目约定。改动代码前先读，避免踩已知的坑。

## 定位

面向海外的麻将站（online mahjonggame.org）。Solitaire / Connect 消除类是流量入口，四人真麻将（本库自研引擎）是差异化卖点。两类用户几乎不重叠：休闲消除用户和真麻将用户各取所需，不要为了迎合一类用户而破坏另一类的核心体验。

## 游戏目录

- `data/games.ts` 是游戏目录的**唯一真相来源**，所有游戏（自研 native + 外嵌 iframe）都在这里配置。
- `gameType: 'native'` 的自研游戏可被搜索引擎索引，并带 `content` 完整规则文案（intro / howToPlay / tips / faq）；`gameType: 'iframe'` 的外嵌页保持 noindex。
- `gameType: 'coming-soon'` 表示尚未上线的 ruleset（美国/台湾/四川麻将），由 `components/ComingSoonGame.tsx` 渲染可索引介绍页。
- `app/sitemap.ts` 只收录 `gameType === 'native'` 的游戏，iframe 游戏不进 sitemap。

### 导航分组（4 一级目录）

- 每个游戏必须带 `navGroup`：`'classic'`（4 人真麻将）/ `'solitaire'`（休闲消除）/ `'beginners'`（blog，无游戏条目）/ `'set'`（亚马逊联盟，无游戏条目）。
- `classic` 组的游戏还要带 `region`：`china` / `japan` / `america` / `taiwan` / `sichuan`（五国麻将）。
- 分组路由：`app/[locale]/(public)/games/{classic,solitaire,beginners,set}/page.tsx`（静态段优先于 `[slug]`）。
- `CLASSIC_REGIONS` / `getClassicByRegion()` / `getGamesByNavGroup()` 是分组取数的唯一入口，改分组别绕过它们。
- 新增一个游戏若属于 classic 组，必须同时：① 打 `navGroup: 'classic'` ② 打 `region` ③ 若未上线用 `gameType: 'coming-soon'`。

## lib/mahjong/ 引擎边界

`lib/mahjong/`（engine / shanten / scoring / tiles / ai）是**纯 TypeScript 引擎**，禁止引入 React、DOM 或任何 UI 依赖。所有状态转移是确定性纯函数 `(state, action) -> state`，可单测、可复现（seed 一致则牌局一致）。这条边界是给将来服务端多人对战预留的：同一套引擎可以原样跑在 Node 服务端。

## 规则差异（重要，连踩过两次坑）

三套规则 `hongkong` / `riichi` / `chinese-official` 在七对子、双荣等处有**实质差异**，例如：

- 七对子：riichi 严格，四张同牌只算一对，必须七种不同的牌；港麻/国标宽松，四张同牌算两对。
- 双荣：riichi 两家同时荣和、放铳者一人包赔；港麻/国标只判座位号最小的单赢。

任何规则相关改动**必须按 ruleset 区分**，并**为两种规则各补一条测试**——两次 Bug 都是因为共用逻辑漏掉了规则差异。

## 新增游戏分类

新增一个 `GameCategory` 必须**同步四处**，只改一处会导致后台表单与列表不一致：

1. `data/games.ts` — 类型定义 + 游戏配置
2. `lib/admin-validators.ts` — 相关校验
3. `app/admin/games/page.tsx` — 分类标签渲染
4. `components/admin/NewGameForm.tsx` 和 `components/admin/GameEditorForm.tsx` — 分类下拉选项

## 多语言

**UI 文案**（按钮/导航/标签）：新增文案必须同步 `messages/` 下**五个**语言文件：`en.json`、`ja.json`、`ko.json`、`zh-TW.json`、`zh.json`。只加一种语言会导致 next-intl 缺 key。

**游戏内容文案**（标题/描述/intro/教程/提示/FAQ）：
- 英文基准在 `data/games.ts`（`title`/`description`/`content`）。
- 非英文覆盖在 `data/games.i18n.ts` 的 `GAME_I18N[slug]`，按 locale 提供 `title`/`description`/`content`（content 可只覆盖部分字段，如只给 `intro`）。
- 取数一律走 `getLocalizedGame(slug, locale)` / `getLocalizedGames(list, locale)`——**逐词回退英文**：某语言缺某个字段就显示英文，不会崩。
- 规则：**新增或修改游戏内容时，务必同步 `data/games.i18n.ts` 里该游戏的 4 个非英文语言（zh/zh-TW/ja/ko）**；`GameCard` 渲染卡片时要传 `locale` prop，否则卡片显示英文。

## 合规红线

- **不实现美式 NMJL 牌型**：NMJL 持有商标，官方牌型卡有版权，不做。
- 站点**不得**出现真钱下注或可购买的博彩货币，纯免费娱乐。

## 验收门槛

提交前跑：

```bash
npm run test && npx tsc --noEmit && npm run build
```

> 注：本机 Windows 上 `npm run build` 可能因 Prisma 自定义 output（`lib/generated/`）扫描 `%LOCALAPPDATA%\Microsoft\WindowsApps` 触发 EACCES 失败，属环境问题，CI（Vercel/Linux）不受影响。测试与 `tsc --noEmit` 是全绿参考。
