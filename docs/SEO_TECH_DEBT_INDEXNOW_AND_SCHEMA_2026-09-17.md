# SEO 技术债：IndexNow 接入 + 结构化数据补全

> **交接对象**：Cursor
> **撰写**：AI（策划/运营）｜**日期**：2026-09-17
> **背景**：Bing Webmaster Tools 已提交 sitemap，30 天拿到 46 次点击 / 1.3K 曝光 / CTR 3.48%（同期 GSC 28 天为 25 次点击 / 2,206 曝光 / CTR 1.1%）。Bing 侧 CTR 是 Google 的 3.16 倍，说明内容与收录都没问题。本文档只处理**两个卡在技术侧的动作**。
> **只读本文档即可执行**，不需要额外背景资料。

---

## 0. 读前须知（硬约束）

1. ⛔ **不要 commit / push / 部署**。改完告诉我，我来拆提交（工作区常年有 20–30 个协作者在途文件）。
2. 🔴 **提交前必须跑 `npm run gate`**（= `verify:en` + 四层门禁 + 全量单测）。仓库没有 `.github/workflows`，Vercel 也不会替你拦内容问题。
3. ⚠️ 本文档的行号是 2026-09-17 的实测值，**行号会漂移 → 请按函数名/字符串搜索定位**。
4. 🔴 **`tsconfig.json` 的 `exclude` 含 `scripts` 和 `tests`** → `tsc --noEmit` 不会检查它们，**必须实际跑一遍**才算验证。

---

## 1. 任务总览

| ID | 任务 | 主要文件 | 优先级 | 预估 |
|---|---|---|---|---|
| T1 | 接入 IndexNow（Bing 即时收录） | 新增 `scripts/indexnow.mjs`、`public/<key>.txt`、`package.json` | P0 | 0.5 天 |
| T2 | 补全 Article 结构化数据的 3 个缺陷 | `app/[locale]/(public)/blog/[slug]/page.tsx` | P0 | 0.5 天 |
| T3 | `/blog` 与 `/games` 两个 hub 补 `ItemList` | `app/[locale]/(public)/blog/page.tsx`、`app/[locale]/(public)/games/page.tsx` | P1 | 0.5 天 |

---

## 2. T1 · 接入 IndexNow

### 2.1 为什么做

Bing 的索引更新周期是 **7–14 天**（Google 是 24–48 小时）。IndexNow 是唯一能把这个压到**小时级**的通道，且协议被 **Bing / Yandex / Naver / Seznam 四家共用**——一次接入，四个引擎。

### 2.2 协议事实（照此实现，不要自行发明字段）

- **端点**：`POST https://api.indexnow.org/indexnow`
- **Header**：`Content-Type: application/json; charset=utf-8`
- **Body**：
  ```json
  {
    "host": "mahjonggame.org",
    "key": "<KEY>",
    "keyLocation": "https://mahjonggame.org/<KEY>.txt",
    "urlList": ["https://mahjonggame.org/en/blog/what-is-mahjong"]
  }
  ```
- **Key 规则**：8–128 位十六进制字符；**文件名必须与 key 完全相同**，内容也是该 key 明文。
- **单次上限**：10,000 条 URL。
- **响应码含义**：`200` 成功｜`202` key 校验中（正常，非错误）｜`400` 格式错｜`403` key 无效｜`422` URL 不属于该 host 或 key 不匹配｜`429` 请求过频。

### 2.3 实现要求

| 项 | 要求 |
|---|---|
| Key 来源 | 优先 `process.env.INDEXNOW_KEY`，缺失时自动扫描 `public/` 下的 key 文件（见下方澄清）；两者都无才非 0 退出。**不要把 key 字符串写死在脚本里** |
| Key 文件 | `public/<KEY>.txt`，内容为 key 明文，`Content-Type: text/plain` |
| URL 来源 | **从线上 `https://mahjonggame.org/sitemap.xml` 解析**（单一真源，避免和 `app/sitemap.ts` 两处逻辑漂移） |
| 落地文件 | `scripts/indexnow.mjs`（Node ESM，与本目录现有脚本同风格） |
| npm script | `"seo:indexnow": "node scripts/indexnow.mjs"` |
| 调用方式 | 部署完成后手动跑一次；支持 `--urls=<逗号分隔>` 做增量单页提交 |

#### ⚠️ 关于 key 的两点澄清（先读，否则会做成无效功）

1. **key 文件必须提交进仓库**，且文件名里就含 key——这与"不要硬编码"**不矛盾**。IndexNow 协议要求 `keyLocation` 是公开可访问的 URL，key 本身不是密钥（它只证明"你有权代表这个 host 提交"，不授予任何写权限）。所以：`public/<KEY>.txt` → 正常 commit；**但不要在 `scripts/indexnow.mjs` 里写死字符串**。
2. **脚本内的读取顺序**：先读 `process.env.INDEXNOW_KEY`；缺失时**回退为扫描 `public/` 目录下内容形如 `/^[a-f0-9]{8,128}$/` 的 `.txt` 文件自动取 key**；两者都拿不到才以非 0 退出并打印原因。这样本地与 CI 都不必额外配环境变量，也避免"忘记配 env 导致脚本静默跳过"。

### 2.4 边界（重要）

- ✅ **只提交 sitemap 里的 URL**（即 200 状态的规范 URL）。
- ⛔ **不要提交 `/games/beginners/*`**——它们是 308 重定向地址（`next.config.mjs` 中的永久重定向），提交会被判为无效。
- ⛔ 不要按 `locale` 拆分多次请求（`en/zh/zh-TW` 全部一次提交即可）。
- ⛔ 不要在 `next build` 里挂这个调用（构建期网络失败会拖垮构建）。

### 2.5 验收

#### 🔴 执行时序（**不能颠倒，颠倒会误判成"key 无效"**）

IndexNow 的 `keyLocation` 指向**线上**文件，所以本地代码写完、脚本能跑，**不代表能提交成功**。必须按此顺序：

1. 代码完成 → 用户 commit / push（见 §6 的拆分边界）
2. 等 Vercel 部署完成
3. **先验证 key 文件线上可访问**：
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://mahjonggame.org/<KEY>.txt
   # 期望 200；若 404 → 部署未完成或文件名不符，此时跑脚本必然 403
   ```
4. **再**跑 `npm run seo:indexnow`
5. 打开 Bing Webmaster Tools → `IndexNow` 页，确认提交数增长

⚠️ 若在第 3 步之前跑脚本并收到 `403`，那是**时序问题不是代码问题**——不要回头去改 key 逻辑。

#### 通过标准

- 首轮全量提交后，控制台输出 `200` 或 `202`，并打印**提交条数 = 90**（与线上 sitemap 的 `<url>` 数一致）。
- **`202` 属于成功**（key 校验中），不要把它当错误处理或加重试逻辑。
- 用不存在的 key 跑一次，应明确报 `403` 而不是静默成功（可用 `INDEXNOW_KEY=deadbeef` 临时覆盖测试）。
- Bing `IndexNow` 页显示"已提交 URL 数"增长。

---

## 3. T2 · Article 结构化数据补全

### 3.1 🔴 先看清现状：Article schema 已经存在且在线上

**不要再新增一个 Article schema**，那会变成重复标记。实测证据：

- 源码：`app/[locale]/(public)/blog/[slug]/page.tsx`，`jsonLd` 数组（约 72–99 行）已输出 `Article` + `FAQPage` 两个块。
- 该文件是**所有文章的统一模板**（`generateStaticParams` 遍历 `getBlogPosts()`），因此**13 篇教程全部已覆盖**——"教程全部都有"这件事已经完成。
- 线上核验（2026-09-17，curl 实测 `/en/blog/mahjong-rules-beginners-complete-guide`）：该页输出 **6 个 `ld+json` 块**，包含 `Article`、`FAQPage`、`BreadcrumbList`、`ListItem`、`WebPage`、`Organization`。

**已具备的 Article 字段**（全部保留，不要删）：
`headline`、`description`、`url`、`inLanguage`、`isAccessibleForFree`、`author`、`publisher`、`datePublished`、`dateModified`、`mainEntityOfPage`、`wordCount`。

### 3.2 需要修的 3 个缺陷

#### D1 🔴 `publisher` 是**悬空引用**

- 现状：`publisher: { '@id': \`${SITE_BASE_URL}/#organization\` }`
- 问题：`#organization` 节点**只在 `lib/home-jsonld.ts` 里定义**（约 26–38 行，`homeJsonLd()`，仅首页使用）。文章页自身只输出 `Article` + `FAQPage` → **这个 `@id` 在文章页上指不到任何实体**。
- 修法（**方案 A，推荐**）：在文章页的 `jsonLd` 数组里**同时输出一个 `@id` 与首页完全一致的 `Organization` 节点**（从 `lib/home-jsonld.ts` 抽出复用，不要复制粘贴出新对象）。这样全站实体一致，`publisher` 的引用也落到实处。
- 备选（方案 B）：改成内联 `{ '@type': 'Organization', name: brand, url: SITE_BASE_URL }`。简单但会让首页与文章页成为两个不同实体，**优先选 A**。

#### D2 `image` 缺失

- 现状：Article 没有任何 `image` 字段。
- 事实核对：仓库**没有** per-page 的 `opengraph-image` 路由；`public/covers/` 里只有游戏封面 SVG，**没有文章封面**；全站只有 `public/og-default.png`（实测 **1200×630 = 756,000 px**，16:9，满足 Google「≥50K 像素、建议 16:9」的要求）。
- 修法：`image: [absoluteUrl('/og-default.png')]`（用 `lib/seo.ts` 里已有的 `absoluteUrl()`，输出绝对 URL）。
- ⚠️ **不要只改代码就收工**：Google 文档明确要求"图片须代表所标记的内容，不得用徽标替代"。站点通用 OG 图是**短期折中**，请在改动处留 `// TODO(per-article cover)` 注释，并在本文档末尾的"后续项"里登记。

#### D3 `datePublished` / `dateModified` 是裸日期，且带**假默认值**

- 现状（该文件约 62–63 行）：
  ```ts
  const publishedAt = post.publishedAt ?? '2026-08-18';
  const updatedAt = post.updatedAt ?? publishedAt;
  ```
- 两个问题：
  1. 格式不是带时区的 ISO 8601（Google 建议 `2024-01-05T08:00:00+08:00` 这种形式）。
  2. 🔴 **`?? '2026-08-18'` 的兜底值是编的**——任何缺 `publishedAt` 的文章都会被声称发布于该日期，这是对搜索引擎的事实性错误陈述。
- 修法：
  - 输出前统一规范化：`${date}T00:00:00+00:00`（UTC，全站一致）。
  - **去掉硬编码兜底**：缺 `publishedAt` 时**不输出 `datePublished`**（字段缺失优于错误字段）。若担心批量缺失，先跑一次统计确认有多少篇缺该字段，再决定是回填数据还是允许缺省。

### 3.3 边界

- ⛔ 不把 `author` 从 `Organization` 改成 `Person`（当前合规；改为 Person 需要真实作者页与 `url`，属内容决策，不在本次范围）。
- ⛔ 不动 `FAQPage`、`BreadcrumbList`、`wordCount`、`linkArticleSections` 的内链逻辑。
- ⛔ 不改 `headline` 的取值来源（`post.title` 即渲染标题，必须一致）。
- 🔴 **D1 方案 A 会触碰 `lib/home-jsonld.ts`，而该模块被首页依赖** → 只允许**新增导出**（抽出可复用的 `Organization` 节点构造函数/常量），⛔ **不允许修改已有节点的 `@id`、字段名或取值**。首页的 `ld+json` 输出必须保持**逐字节不变**（见 3.4 第 4 条）。若做不到"零影响"，退回方案 B（内联 Organization），并在交付说明里写明原因。

### 3.4 验收

1. 新增 `tests/blog-jsonld.test.ts`，至少 4 条断言：
   - `Article` 块存在且 `@type === 'Article'`；
   - `image` 为绝对 URL 且以 `https://mahjonggame.org/` 开头；
   - `publisher` 引用的 `@id` **在同一份 JSON-LD 输出里能找到对应节点**（防悬空引用回归）；
   - `datePublished` 匹配 `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/`，或该字段不存在。
2. 线上核验：`curl -s https://mahjonggame.org/en/blog/mahjong-rules-beginners-complete-guide | grep -o '"@type":"[A-Za-z]*"' | sort -u` → 应包含 `Article` 且 `ld+json` 块数由 6 变 7。
3. 三个 locale（`en` / `zh` / `zh-TW`）各抽 1 篇跑同样命令。
4. 🔴 **首页回归（D1 方案 A 的连带风险，必须做）**：改 `lib/home-jsonld.ts` 之前先存基线，改完对比——
   ```bash
   # 改前（基线）
   curl -s https://mahjonggame.org/en | grep -o '"@type":"[A-Za-z]*"' | sort -u > /tmp/home.before
   # 部署后（回归）
   curl -s https://mahjonggame.org/en | grep -o '"@type":"[A-Za-z]*"' | sort -u > /tmp/home.after
   diff /tmp/home.before /tmp/home.after && echo "首页 JSON-LD 无回归"
   ```
   预期：`Organization` / `SoftwareApplication` / `WebSite` / `FAQPage` 四类**全部仍在**，无新增无缺失。

---

## 4. T3 · 两个 hub 页补 `ItemList`

### 4.1 现状（实测）

| 页面 | 线上 `ld+json` 块数 | 现有 `@type` |
|---|---|---|
| `/en/blog` | 2 | 仅 `BreadcrumbList`、`ListItem` |
| `/en/games` | 2 | 仅 `BreadcrumbList`、`ListItem` |

对照已达标页面：`/en`（Organization + SoftwareApplication + WebSite + FAQPage）、`/en/games/<slug>`（VideoGame + FAQPage + Offer）、`/en/learn/glossary`（DefinedTermSet）、文章页（Article + FAQPage）。

### 4.2 修法

- `/blog` hub：输出 `CollectionPage`，内嵌 `ItemList`，`itemListElement` 为 13 篇文章的 `{ '@type': 'ListItem', position, url, name }`。
- `/games` hub：同上，条目来自 `data/games.ts`，**只包含 `isGamePageIndexable()` 为真的游戏**（与 `app/sitemap.ts` 使用同一判断函数，不要另写一套过滤逻辑）。
- 两个列表的 `url` 必须使用**当前 locale 前缀**（`/zh/blog/...` 而不是永远 `/en/...`）。

### 4.3 边界

- ⛔ 不要给 `/about`、`/privacy`、`/cookies` 加结构化数据（无富结果价值，属无效工作量）。
- ⛔ 不要在 `ItemList` 里塞全部 90 条 URL（只需当前 locale 下的子页）。

---

## 5. 本次明确不做

| 项 | 原因 |
|---|---|
| 新增 Article schema | **已存在且在线上**，新增会造成重复标记 |
| 给三个法务页加 JSON-LD | 无富结果价值 |
| 网站级 `SearchAction` | 站内搜索未上线，标了就是虚假标记 |
| 改 `author` 为 Person | 需先有作者页，属内容决策 |

---

## 6. 全局验收清单

验收分两层，**代码层过了不等于生效**——JSON-LD 只有部署到线上才能 curl 到。

### 6.1 代码层（提交前，本地可验）

- [ ] `npx tsc --noEmit` → EXIT 0
- [ ] `npm run gate` → 全绿（⚠️ 不是可选，仓库门禁不挂 Vercel，不跑就是没验）
- [ ] 新增测试文件通过（T2 的 `tests/blog-jsonld.test.ts`）
- [ ] `package.json` 新增 `"seo:indexnow": "node scripts/indexnow.mjs"`
- [ ] 本地跑 `npm run seo:indexnow` **预期失败并报 key 缺失/403**——这是**正确**行为（key 文件尚未上线），不要为了让它"过"而写死 key

### 6.2 线上层（部署完成后才能验，见 §2.5 时序）

- [ ] `curl https://mahjonggame.org/<KEY>.txt` → `200`
- [ ] `npm run seo:indexnow` → `200`/`202`，提交 **90** 条
- [ ] 文章页 `ld+json` 块数 **6 → 7**，含 `Article` 且 `image` 为绝对 URL
- [ ] 文章页 `publisher` 的 `@id` 能在同页找到对应节点（无悬空引用）
- [ ] hub 页 `/en/blog`、`/en/games` 块数 **2 → 3**，含 `ItemList`
- [ ] 🔴 首页 `/en` JSON-LD 四类齐全且无回归（见 §3.4 第 4 条）

### 6.3 commit 拆分边界（文件级，供用户拆提交）

工作区常年有 20–30 个协作者在途文件，**必须按文件拆**，不要 `git add -A`。

| commit | 文件 | 说明 |
|---|---|---|
| ① `feat(seo): 接入 IndexNow` | `scripts/indexnow.mjs`（新增）<br>`public/<KEY>.txt`（新增）<br>`package.json`（仅 +1 行 script） | 独立可合，不依赖 ②③ |
| ② `fix(seo): 修正 Article 结构化数据` | `app/[locale]/(public)/blog/[slug]/page.tsx`<br>`lib/home-jsonld.ts`（仅新增导出）<br>`tests/blog-jsonld.test.ts`（新增） | 含首页连带改动，回归测必备 |
| ③ `feat(seo): hub 页补 ItemList` | `app/[locale]/(public)/blog/page.tsx`<br>`app/[locale]/(public)/games/page.tsx` | P1，可后置 |

✅ **建议先单独推 ①**：IndexNow 生效后 Bing 立刻开始重抓，与 ②③ 的部署时间无关，不必等三个都完成才让 Bing 动起来。

---

## 7. 确定性边界表

| 项 | 确定性 | 说明 |
|---|---|---|
| IndexNow 端点与响应码 | **确定** | 协议规范，四引擎共用 |
| Bing 索引更新 7–14 天 | **确定** | 与 Google 24–48h 的对比是行业共识 |
| Article schema 已在线上 | **确定** | curl 实测 6 个块含 `Article` |
| `publisher` 悬空 | **确定** | `#organization` 仅定义于 `lib/home-jsonld.ts` |
| `og-default.png` 1200×630 | **确定** | 读 PNG IHDR 实测 |
| Google Article 建议字段清单 | **确定** | Google Search Central 现行文档（**已取消"必需"字段**，全部为"建议"） |
| IndexNow 带来的收录提升幅度 | **不确定** | 取决于抓取配额，不做承诺 |
| `ItemList` 对排名的实际增益 | **不确定** | 无直接排名因子证据，价值在富结果展示与实体消歧 |
| 缺 `publishedAt` 的文章数量 | **待统计** | 实施前需先跑一次计数 |

---

## 8. 后续项（本次不做，登记备查）

1. **每篇文章独立封面图** → 有了之后替换 Article 的 `image`（当前用站点通用 OG 图，属折中）。
2. **`/tools` hub + 听牌计算器** → 路由不存在，在此之前**任何正文都不得链接 `/tools`**。
3. **英文 `<title>` 品牌名** → 线上仍是 `American Mahjong | Mahjong Hub`，品牌 `TileDojo` 未进 title。Bing 对精确匹配关键词权重高于 Google，此项对 Bing 侧 CTR 是直接见效项，建议排到 T1/T2 之后立刻做。
