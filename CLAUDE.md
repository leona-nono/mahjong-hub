# CLAUDE.md

本文件是 Claude Code 在此仓库工作时需要遵守的项目约定。改动代码前先读，避免踩已知的坑。

## 定位

面向海外的麻将站（online mahjonggame.org）。Solitaire / Connect 消除类是流量入口，四人真麻将（本库自研引擎）是差异化卖点。两类用户几乎不重叠：休闲消除用户和真麻将用户各取所需，不要为了迎合一类用户而破坏另一类的核心体验。

## 游戏目录

- `data/games.ts` 是游戏目录的**唯一真相来源**，所有游戏（自研 native + 外嵌 iframe）都在这里配置。
- `gameType: 'native'` 的自研游戏可被搜索引擎索引，并带 `content` 完整规则文案（intro / howToPlay / tips / faq）；`gameType: 'iframe'` 的外嵌页保持 noindex。
- `gameType: 'coming-soon'` 表示尚未上线的 ruleset（美国/台湾/四川麻将），由 `components/ComingSoonGame.tsx` 渲染可索引介绍页。
- `app/sitemap.ts` 通过 `isGamePageIndexable` 收录可索引游戏（native + coming-soon），iframe 游戏不进 sitemap。
- 新增/改游戏后跑 `npm run validate:games`（build 前置）；校验 `navGroup` / `region` / `gameType` 组合、i18n 覆盖与 sitemap 一致性。

### 导航分组（4 一级目录）

- 每个游戏必须带 `navGroup`：`'classic'`（4 人真麻将）/ `'solitaire'`（休闲消除）/ `'beginners'`（blog，无游戏条目）/ `'set'`（亚马逊联盟，无游戏条目）。
- `classic` 组的游戏还要带 `region`：`china` / `japan` / `america` / `taiwan` / `sichuan`（五国麻将）。
- 分组路由：`app/[locale]/(public)/games/{classic,solitaire,beginners,set}/page.tsx`（静态段优先于 `[slug]`）。
- `CLASSIC_REGIONS` / `getClassicByRegion()` / `getGamesByNavGroup()` 是分组取数的唯一入口，改分组别绕过它们。
- 新增一个游戏若属于 classic 组，必须同时：① 打 `navGroup: 'classic'` ② 打 `region` ③ 若未上线用 `gameType: 'coming-soon'`。

### 新游戏接入清单

1. 在 `data/games.ts` 加一条配置（`slug` / `navGroup` / `gameType`；classic 必带 `region`）。
2. 英文 `title` / `description` / `content` 写在 `data/games.ts`。
3. 在 `data/games-i18n/` 为每个非英文 locale 补覆盖（或跑翻译脚本），由 `data/games.i18n.ts` 加载。
4. `GameCard` 渲染时传 `locale` prop。
5. `npm run validate:games` 必须通过。

## lib/mahjong/ 引擎边界

`lib/mahjong/` 与 `lib/mahjong-solitaire/`（纯逻辑部分）是**纯 TypeScript 引擎**，禁止引入 React、DOM 或任何 UI 依赖。所有状态转移是确定性纯函数 `(state, action) -> state`，可单测、可复现（seed 一致则牌局一致）。这条边界是给将来服务端多人对战预留的：同一套引擎可以原样跑在 Node 服务端。

- 客户端逻辑（声音、遥测、预载 hook）放在 `features/table/`、`features/solitaire/`。
- 游客 localStorage 账本放在 `features/guest/`。
- 护栏：`tests/engine-boundary.test.ts` 扫描引擎目录，禁止 `'use client'` / `react` / `window` / `document`。

Prisma 客户端使用默认 `@prisma/client`（经 `lib/db.ts` 导出），**无**自定义 `lib/generated/` 输出。

## 规则差异（重要，连踩过两次坑）

三套规则 `hongkong` / `riichi` / `chinese-official` 在七对子、双荣等处有**实质差异**，例如：

- 七对子：riichi 严格，四张同牌只算一对，必须七种不同的牌；港麻/国标宽松，四张同牌算两对。
- 双荣：riichi 两家同时荣和、放铳者一人包赔；港麻/国标只判座位号最小的单赢。

任何规则相关改动**必须按 ruleset 区分**，并**为两种规则各补一条测试**——两次 Bug 都是因为共用逻辑漏掉了规则差异。

## 新增游戏分类

运营后台（`app/admin/`）已移除。新增一个 `GameCategory` 只需改：

1. `data/games.ts` — 类型定义 + 游戏配置
2. `lib/game-cover.ts` — 分类封面映射（若新增分类需要默认封面）
3. 跑 `npm run validate:games` 确认目录合法

## 多语言

站点路由 locale（3 个）：`en`、`zh`、`zh-TW`。已下线的 `ja` / `ko` / `es` / `fr` / `de` / `pt-BR` 由 `next.config` 301 到对应英文路径，文案文件在 `messages/_retired/`，不再进路由。

**UI 文案**（按钮/导航/标签）：新增文案必须同步 `messages/` 下**全部三个**路由语言文件。`i18n/request.ts` 会把缺 key 深合并回落到英文，但 build 会跑 messages key 对齐校验。新增语言 = 加 1 个 `messages/{locale}.json` + 跑翻译脚本 + 在 `i18n/routing.ts` / `lib/locales.ts` 注册 locale。

**游戏内容文案**（标题/描述/intro/教程/提示/FAQ）：
- 英文基准在 `data/games.ts`（`title`/`description`/`content`）。
- 非英文覆盖在 `data/games-i18n/*.json`（由 `data/games.i18n.ts` 组装 `GAME_I18N`），按 locale 提供字段。
- about / home-guide / games / blog 一律**字段级回退英文**（某语言缺某个字段就显示英文，不会崩）。
- 取数一律走 `getLocalizedGame(slug, locale)` / `getLocalizedGames(list, locale)` / `getAboutDoc` / `getHomeGuideDoc`。
- 规则：**新增或修改游戏内容时，务必同步非英文 locale 覆盖**；`GameCard` 渲染卡片时要传 `locale` prop，否则卡片显示英文。

## 合规红线

- **不实现美式 NMJL 牌型**：NMJL 持有商标，官方牌型卡有版权，不做。
- 站点**不得**出现真钱下注或可购买的博彩货币，纯免费娱乐。

## 验收门槛

提交前跑：

```bash
npm run test && npx tsc --noEmit && npm run build
```

> 注：本机 Windows 上 `npm run build` 偶发权限扫描问题属环境问题，CI（Vercel/Linux）不受影响。测试与 `tsc --noEmit` 是全绿参考。
