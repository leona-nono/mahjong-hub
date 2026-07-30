# 麻将出海项目 · SEO + GEO 内容建设框架

> 更新日期：2026-07-30
> 定位：在《SEO Phase 0 调研交付.md》（关键词库 / 竞品矩阵 / IA / KPI）基础上，升级为 **「SEO + GEO 双引擎」可执行内容框架**。
> 核心前提（用户定调）：**网站自然流量与转化，与「爬虫能否抓取并索引内容」完全相关**——可抓取可索引的优质内容是地基，没有这一步，后面一切排名/点击/转化都是零。

---

## 0. 一句话因果链（为什么"抓取"是命门）

```
内容被机器读取（无 JS 阻断 / 语义清晰）
   → 被爬虫抓取（robots 放行 / sitemap / 内链可达）
      → 被索引（canonical 正确 / noindex 无误 / 无重复）
         → 参与排名（相关性 + 权威 + 体验）
            → 用户点击（标题 / 富媒体 / CTR）
               → 落地页转化（内容→游戏→广告 / 电商）
```

**用户洞察的本质**：链条前两段（被读取 → 被抓取 → 被索引）是 0/1 问题。一旦内容因 SPA 纯客户端渲染、robots 误封、canonical 错乱、noindex 漏标而"抓不到/没索引"，无论内容质量多高、外链多强，**自然流量 = 0**。所以本框架把"技术可抓取性"列为 P0 地基，与"内容质量"并列，而非后置优化。

GEO（生成式引擎优化）同理：ChatGPT / Perplexity / Gemini 的实时检索也依赖抓取与结构化——抓不到的内容，AI 也不会引用。

---

## 1. 双引擎框架总览

| 引擎 | 目标对象 | 优化核心 | 与对方关系 |
|------|----------|----------|------------|
| **SEO** | Google / Bing 等传统爬虫 | 可抓取 + 可索引 + 相关性 + 权威 + 体验 | 同一份结构化内容，两者共用地基 |
| **GEO** | ChatGPT / Perplexity / Gemini 等 AI 引擎 | 事实准确 + 实体清晰 + 可被直接引用 + 被权威源链接 | 复用 SEO 的结构化数据与原创深度 |

**结论**：不做"两套内容"。一份**机器可读、事实准确、结构清晰、原创深入**的内容，同时服务 SEO 与 GEO。框架按"地基层 → 内容层 → GEO 增强层 → 权威层 → 转化层 → 监控层"六层组织。

---

## 2. 地基层（P0 · 技术可抓取 / 可索引）—— 一切前提

> 直接对应"爬虫抓取内容完全相关"。本层不过关，内容再好也无流量。

### 2.1 渲染正确性（最关键）
- **内容站 `web/` 必须用 SSG/SSR 渲染正文**（Next 14 App Router 的 Server Component 默认服务端渲染，正确）。**严禁纯 CSR 把正文塞进 JS 异步拉取**——Google 能跑 JS，但 AI 引擎的实时检索器（Perplexity 等）多数不执行重 JS，会丢失正文。
- 检查方法：`view-source:` 看 HTML 里是否已有 `<article>` 正文；用 Google 的 **URL Inspection / Rich Results Test** 验证"渲染后 HTML 含正文"。

### 2.2 抓取可达性
- `robots.txt`：放行 `/learn`、`/rules`、`/culture`、`/ai-coach`、`/play` 等；禁止无内容的管理/参数页。
- `sitemap.xml`：**分语言提交**（en / zh-TW / ja / ko / zh-CN），通过 Next 14 的 `app/sitemap.ts` 自动生成，提交到各 GSC 属性。
- **内部链接**：所有内容页必须能从首页/支柱页经 ≤3 次点击到达（Pillar-Cluser 内链模型见 §3）。孤立页不索引。
- **canonical**：每个页正确自引 canonical，跨语言用 `hreflang` 互链而非 canonical 去重。

### 2.3 索引正确性
- 关键 Pillar 页、Cluster 页 **严禁误加 `noindex`**（常见事故：草稿/模板页带 noindex 上线，整站不收录）。
- 重复内容（如中美两套相似页）用 `hreflang` 区分，不靠 noindex 砍。
- 上线后 30 天内用 GSC **覆盖率报告**确认核心页"已收录率 ≥ 90%"。

### 2.4 体验（Core Web Vitals）
- 美区流量以**移动为主**（参考 mahjong.com 移动占比 68%）→ 移动优先索引，必须移动友好。
- LCP（首屏文字/图）、CLS（iframe 游戏区用**固定尺寸占位**防跳动）、INP（交互响应）。
- iframe 游戏资源：**懒加载 + 压缩**，避免拖慢内容页 LCP（内容页是 SEO 主战场，游戏 iframe 是附加）。

---

## 3. 内容层（Pillar–Cluster 模型 · 基于 Phase 0 关键词库）

> 直接复用《SEO Phase 0》的 4 大 Pillar 与 30 关键词。内容生产按"支柱页 + 集群页"组织，内链成网。

### 3.1 四大支柱（Pillar）
| Pillar | 路径 | 主攻意图 | 差异化（对 Wikipedia / heymahjong 的错位） |
|--------|------|----------|---------------------------------------------|
| Learn Mahjong | `/learn` | 入门信息 | 比维基更友好、能立刻上手玩 |
| Rules by Variant | `/rules` | 变体规则 | 美式麻将热窗口（Yelp +819%）蓝海 |
| AI Coach | `/ai-coach` | 陪练/策略 | 与 heymahjong 直接错位（我们免费 + 自有 H5） |
| Culture | `/culture` | 文化/情感 | 电商站（OH MY / TML）不做的空白 |

### 3.2 内容生产标准（每篇必检）
- **标题/H1**：含主关键词（如 `How to Play Mahjong: A Beginner's Step-by-Step Guide`）。
- **结构**：H2/H3 层次清晰，列表/表格多，便于 AI 直接引用与富媒体摘要（featured snippet）。
- **EEAT 信号**：作者署名 + 真实经验（如"we tested this on our H5 table"）、引用权威源（Wikipedia / NMJL 官方卡）、更新日期。
- **内链**：正文自然链向同 Pillar 其他页 + Glossary（pung/chow 长尾入口）+ 规则页末尾 CTA → `/play`、`/table`（"学完立刻玩"）。
- **CTA 闭环**：每篇末尾固定 `Play Free Mahjong → /play` 与 `4-Player vs AI → /table`，把内容流量沉淀到游戏（广告变现主路径）。
- **结构化数据**：文章页用 `Article` + `FAQPage`（直接喂 GEO 与 rich result）；BreadcrumbList 贯通 IA。

### 3.3 第一批启动内容（成本最低、见效最快）
- **Glossary 长尾批量**（≥15 个术语词：pung / chow / charleston / flower tiles / dragon tiles …）：难度低、意图明确（正在学牌的人），用统一模板批量覆盖，单篇短但内链成网。
- **American Mahjong 全簇**（4 页）：差异化蓝海，承接上升流量。
- **`/learn` 全簇**（9 页）：入门刚性需求，与 H5 教学强相关。

---

## 4. GEO 增强层（生成式引擎优化）

> 面向 ChatGPT / Perplexity / Gemini。让内容"被 AI 直接引用"成为流量第二曲线。

### 4.1 GEO 内容特征（在 §3 基础上叠加）
- **直接问答式段落**：每段开头用一句话直接回答问题（AI 最爱抽取这种）。如"**What is a Pung in Mahjong?** A Pung is three identical tiles…"。
- **事实 / 数据表格**：明确数字、对比表（变体规则对比、美式 vs 中麻），AI 检索器优先引用结构化事实。
- **清晰实体**：品牌 / 玩法 / 概念作为**实体**明确标注（"American Mahjong (NMJL standard)"），便于 AI 知识图谱关联。
- **FAQ 区块**：每篇 3–5 个真实搜索问题，配 `FAQPage` 结构化数据——同时吃 SEO rich result 与 GEO 引用。
- **原创独家数据**：如我们 H5 的对局统计、玩家调研——AI 倾向引用有独家证据的内容。

### 4.2 GEO 权威信号（让 AI 信任你）
- **被权威源链接**：争取被 Wikipedia 相关条目、mahjong 协会、媒体引用（外链也是 GEO 信号）。
- **品牌实体一致**：全站品牌名 / 玩法名拼写统一，便于 AI 跨页聚合。
- **多模态 alt 文本**：教学图 / 牌面示意图带描述性 alt + 上下文，AI 多模态检索可引用。

### 4.3 GEO 监控（新增 KPI）
- 在 Perplexity / ChatGPT 用核心问题（"how to play mahjong"、"best american mahjong guide"）手动/API 验证是否被引用。
- 品牌词 + 玩法词在 AI 回答中的出现率（季度追踪）。

---

## 5. 权威层（外链 / 实体建设）
- **长尾术语词**天然易获论坛（Reddit r/mahjong）、社区外链。
- **American Mahjong 内容**争取被犹太社区 / 名流麻将博主引用（美式热的核心人群）。
- **文化内容**（`/culture/mahjong-in-america`）做可分享的"Did you know?"信息图，引社交与外链。
- **联盟 / 媒体**：不硬广，以"教学权威"姿态被引用。

---

## 6. 转化层（内容 → 游戏 → 广告 / 电商）
- **内容页 → 游戏**：固定 CTA 把教学内容流量导入 `/play`、`/table`（广告变现）。
- **内容页 → 电商**：`/culture` 文化情感页软植入 Shopify 实物牌具（虚实联动，蓝海壁垒）。
- **漏斗指标**：内容页→游戏 CTA 点击率目标 ≥ 8%；游戏页广告曝光随会话增长。

---

## 7. 与 `web/` 技术栈的落地映射（Next 14 App Router）

| 框架需求 | Next 14 实现 |
|----------|--------------|
| 服务端渲染正文 | App Router Server Component（默认） |
| 每页 SEO 元信息 | `generateMetadata()`（title / description / openGraph / alternates.hreflang） |
| 结构化数据 | 页内 `<script type="application/ld+json">`（Article / FAQPage / BreadcrumbList） |
| sitemap | `app/sitemap.ts` 自动生成 + 分语言 |
| robots | `app/robots.ts` |
| 多语言 hreflang | next-intl 或 manual `alternates.languages` |
| 速度优化 | `next/image`、iframe 懒加载 + 尺寸占位 |

---

## 8. 执行排期（Phase 1 内容启动）

| 周次 | 动作 | 交付 |
|------|------|------|
| W1 | 地基审计：robots / sitemap / canonical / noindex / 渲染验证 | 技术 SEO 清单过检 |
| W2–W3 | Glossary 长尾批量（≥15 篇）+ `/learn` 全簇（9 页） | 内容上线 + 内链成网 |
| W4–W5 | `/rules/american-mahjong` 全簇（4 页）+ FAQ 结构化数据 | 差异化蓝海页 |
| W6+ | `/culture` 支柱 + GEO 增强（问答/数据表/实体） | GEO 信号铺设 |

> 所有内容必须经 §2 地基层验证（可被抓取 + 索引）后再发布，否则等于没发。
