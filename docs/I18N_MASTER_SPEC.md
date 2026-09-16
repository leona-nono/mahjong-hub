# 多语言规范与实施方案 · 总纲

> **本文件是多语言（i18n / l10n）领域唯一权威文档。**
> 用途：直接交给 Cursor 执行；后续所有多语言工具、JSON 格式、翻译、门禁的规范变更**一律更新到本文件**，不再另开文档。
>
> 版本：`v1.0` · 2026-09-16
> 适用仓库：`D:\mahjonggamebox\mahjong-hub\mahjong-hub`（GitHub `leona-nono/mahjong-hub`）
> ⚠️ C 盘同名目录是落后镜像，**不要读、不要改**。

---

## 0. 五分钟速查（Cursor 先读这一节）

### 0.1 铁律

| # | 铁律 | 违反后果 |
|---|---|---|
| 1 | **英文是唯一源语言**。中文/繁中/日韩等一律从英文重写，**不得**从另一语种转译 | 双重翻译失真，门禁查不出 |
| 2 | **节数 / 段数 / `tiles` / FAQ 条数必须与英文逐项相等** | `build` 直接失败 |
| 3 | 改内容**必须同时改 9 个 locale JSON**（漏一个 → build throw） | 构建失败 |
| 4 | 新增 slug 的权威源是 `Object.keys(data/blog-i18n/en.json)` | 缺 slug → build throw |
| 5 | **第 1 节的第 1、2 段不得删改**（内链自动注入落点） | 静默丢内链，测试不报 |
| 6 | 改 `localization-spec.ts` 里的任何规则 → **必须 bump `SPEC_VERSION`** | 旧缓存命中 = 改动等于没做 |
| 7 | 术语不得同义替换，同一篇内不得混用两种写法 | 门禁 error |
| 8 | `readMinutes` 是用户可见字段，**优先保持原值** | 阅读时长显示错乱 |
| 9 | 不手写内链、不改 CTA 链接 | 内链重复/失效 |
| 10 | 内容管线是**字符串数组**管线 → **禁止**任何 AST / MDX 改造 | 静默打断内链注入 |

### 0.2 常用命令

```bash
npm run gate               # 🔴 提交前必跑：verify:en + 门禁四层 + 全量单测（唯一的拦截点）
npm run gate:i18n          # 仅 i18n 门禁：结构 + 完整性 + 游戏 + 语言
npm run verify:en          # TS 英文源 ↔ en.json 一致性
npm run lint:zh-prose      # 中文体检（报告模式，不拦人）
npm run i18n:spec          # 导出本地化规范全文
npm run test               # 全量单测
```

> ⚠️ **门禁不在 Vercel 构建上**（§3.1）。构建归构建、门禁归门禁 —— Vercel 不会替你拦内容问题。

### 0.3 出问题时按这个顺序查

1. `npm run verify:en` → 英文源和 JSON 是否对得上
2. `npm run validate:blog-i18n` → 三语结构是否对齐
3. `npm run lint:zh-prose -- --slug <slug>` → 是否有错译/翻译腔
4. `npm run test` → 全量断言

---

## 1. 数据架构（真源在哪、谁是基线）

### 1.1 六个 i18n 域

| 域 | 英文源（真源） | 其他语种 | Studio 可改英文 | 结构基线 |
|---|---|---|---|---|
| **blog** | `data/blog.ts` + `data/blog.cornerstone.ts`（TS）| `data/blog-i18n/{locale}.json` | ✅ 已解锁 | **TS `post.sections`** |
| **games** | `data/games.ts`（TS）| `data/games-i18n/{locale}.json` | ✅ 已解锁 | TS 对象 |
| **about** | `data/about-i18n/en.json` | `data/about-i18n/{locale}.json` | ✅ | en.json |
| **home-guide** | `data/home-guide-i18n/en.json` | `data/home-guide-i18n/{locale}.json` | ✅ | en.json |
| **messages**（UI 文案）| `messages/en.json` | `messages/{locale}.json` | ✅ | en.json |
| **glossary**（术语库）| `data/glossary/terms.json` | 同文件内嵌 `i18n` 字段 | ✅ | 同文件 |

**语种清单（9 个）**：`en`（源）、`zh`、`zh-TW`、`ja`、`ko`、`es`、`fr`、`de`、`pt-BR`。
> 其中 `zh` / `zh-TW` 由 `CONTENT_LOCALES` 单独划定，是**结构测试强制校验**的两个语种。

### 1.2 🔴 基线分裂（最容易踩的坑）

```
英文真源        = data/blog-i18n/en.json          ← 内容真源
结构测试基线    = data/blog.cornerstone.ts 的 post.sections   ← 结构真源
```

**两者不是同一个东西。** 推论：

- 在 Studio 里改 `en.json` 的**节数**，不会触发结构测试 → **改坏了也不会被发现**。
- 节数改动必须同步改 TS，否则测试基线还是旧的。
- 判断一篇文章「是否真的落库」，不能只看 `en.json`，必须：
  1. 看 `data/blog-i18n/en.json` 里该 slug 的形状（节数/段数/tiles/FAQ）
  2. 看 `git log` 该文件有无对应提交

> **交付包 ≠ 落库。** 历史事故：`rules` 篇扩写交付包早已写好放在工作区，但从未写进 D 盘主仓，MEMORY 却记成「已完成」。本轮已修正。

### 1.3 内容对象形状

```jsonc
{
  "title": "string",
  "description": "string",
  "sections": [
    {
      "heading": "string",
      "body": ["段1", "段2"],        // 字符串数组，逐段校验长度
      "tiles": ["1w","2w","3w"]      // 可选；存在即渲染牌图，spec 非法直接 build 失败
    }
  ],
  "faq": [{ "question": "string", "answer": "string" }]
}
```

---

## 2. 内容写作硬约束（9 条）

> 全部为**已实际发生过的故障**总结，不是预防性建议。

1. **三语同源**
   `tests/blog-i18n-structure.test.ts` 校验每一节的段数数组 + `tiles` 有无 + FAQ 条数，全部以英文为基准。`zh` / `zh-TW` 任一不对齐 → CI 挂。

2. **第 1 节保留 ≥2 段**
   `lib/article-links.ts:43-48`：第 1 节第 1 段挂**同簇链接**、第 2 段挂**桥接链接**。删减段落 → 内链静默丢失，**测试不报错**。新增章节一律往后加，不动第 1 节。

3. **内链不手写**
   术语链全站上限 6 条/篇、每段 ≤1 条、**逐字匹配**标签。CTA 由 `ctaHrefFor()` 接管，不要动。

4. **`readMinutes` 优先保持原值**
   用户可见。改字数后若必须调整，需人工确认。

5. **新文章必须写全 9 个 locale JSON**
   slug 权威源 = `Object.keys(data/blog-i18n/en.json)`，缺任一 → build throw。

6. **`section.tiles` 非法 spec 会直接 build 失败**
   美术真源 = `lib/mahjong/tile-art.ts`（游戏与文章**共用**同一份）。

7. **中繁不做直译**
   见 §4 本地化规范。

8. **字符串数组管线不可换格式**
   内链在**纯字符串层**注入。任何 AST / MDX / markdown 解析方案都会**静默打断**内链。MDX 已明确不做。

9. **`tsconfig.json` 的 `exclude` 含 `scripts` / `tests`**
   → `tsc --noEmit` **不检查**这两个目录，必须实跑脚本/测试才算验证。

---

## 3. 工具链（Cursor 的执行接口）

### 3.1 门禁链（🔴 **不挂 Vercel 构建**，由 Cursor 在提交前手动跑）

```jsonc
// ✅ 现在的 build：只做构建，不含任何校验
"build": "prisma generate && next build"

// 门禁拆成独立命令，人工/CI 调用
"gate":      "npm run verify:en && npm run gate:i18n && npm run test"
"gate:i18n": "validate:blog-i18n && validate:content-i18n && validate:games && validate:zh-prose && vitest (4 个文件)"
```

> **为什么从 `build` 里摘出来**：原先 `build` 链上挂着 4 道校验，而 Vercel 跑的就是 `build` → 任何内容瑕疵都会让**线上部署失败**，属于用部署管道当门禁。现在构建归构建、门禁归门禁：**Cursor 在提交前跑 `npm run gate`，跑过才算完成**。
>
> **提交前必跑 `npm run gate`（三件事一次过）**：
> 1. `verify:en` —— TS 英文源 ↔ `en.json` 一致
> 2. `gate:i18n` —— 结构 + 完整性 + 游戏 + 语言（错译/翻译腔）
> 3. `test` —— 全量单测
>
> 全绿才允许交付。这是**唯一的拦截点**，没有第二道防线。

**门禁分层**

| 层 | 命令 | 查什么 | 断言数 |
|---|---|---|---|
| EN 一致 | `verify:en` | TS 英文源 ↔ `en.json` | 13/13 + 8/8 |
| 结构 | `validate:blog-i18n` | 三语节/段/tiles/FAQ 对齐 | — |
| 完整性 | `validate:content-i18n` | 9 语 × 4 域无空串/空数组 | 86 |
| 游戏 | `validate:games` | games i18n 结构 | — |
| **语言** | `validate:zh-prose` | 0 错译 + 翻译腔密度 ≤3/千字 | — |
| 单测 | `vitest run` | 全量 | 489 |

**任何一层不过 → `npm run gate` 退出码非 0 → 不允许提交。**

> 仓库**没有 `.github/workflows/`**，所以没有 PR 级自动拦截 —— 门禁的可靠性完全依赖「提交前手动跑 `npm run gate`」这个纪律。若要自动化，加约 20 行 YAML（见 §6.3）。

### 3.2 语言体检 CLI

```bash
npx tsx scripts/i18n/lint-zh-prose.ts [选项]

  --locale <zh|zh-TW>    指定语种（默认两个都跑）
  --slug <slug>          只查一篇
  --errors-only          有错译即退出码 1
  --max-density <n>      翻译腔密度上限（每千字）
  --min-chars <n>        低于此字数不参与密度统计（默认 800）
```

三档用法：

| 场景 | 命令 | 退出码 |
|---|---|---|
| 日常报告 | `npm run lint:zh-prose` | 恒 0 |
| **门禁** | `--errors-only --max-density 3 --min-chars 800` | 有错译或超密度 → 1 |
| 回归上限 | `--max-density 0.1` | 用于验证门禁**真的会拦** |

### 3.3 翻译执行器

```bash
npx tsx scripts/i18n/translate-content-i18n.ts \
  --domain <about|home-guide|games|blog|messages> \
  --locales <es,fr,de,pt-BR> \
  [--dry-run] [--force]
```

行为要点：

- 默认只翻**缺失**的 key（增量）；`--force` 全量重翻。
- 走 `translateTree()` → 按 key 名判定 `prose` / `label`，分别用不同温度（0.35 / 0.1）。
- 结果写入 `.cache/i18n-memory.json` 缓存，缓存键 = `SPEC_VERSION + tier + locale + source`。
- **`--force` 是唯一能让已缓存文本被重写的开关**（改了 prompt 但没 bump `SPEC_VERSION`，`--force` 也只会拿到旧值）。

### 3.4 Studio（可视化编辑）

- 入口：`npm run i18n:studio`
- store：`lib/i18n-studio/store.ts`，**路径白名单** `ALLOWED_PREFIXES`；越界抛 400。
- `enEditable` 白名单已含 `blog` / `games`。
- ⚠️ **数组不展开问题**：`lib/i18n-studio/fields.ts:45-65` 对**对象数组**（`sections` / `faq`）压成一个 JSON textarea → 逐句左右对照失效。修复方案见 §6.2，**必须同时改 `setAtPath`（fields.ts:124）**，否则数组会被建成 `{"0":{...}}`，结构全毁。

---

## 4. 本地化规范（写「句子」的规则）

> 真源：`scripts/i18n/localization-spec.ts` → 导出文档见 `多语言本地化规范_2026-09-16.md`
> 🔴 **一个文件，两个消费者**：翻译工具 system prompt 与中文体检错译规则**都从这里取**。改一处，两端同时生效。
> 历史上规则只写在 prompt 里、检测器另有一套 → prompt 改了检测器不知道 = **等于没改**。这是本轮修掉的病根。

### 4.1 通用准则（DOCTRINE）

1. 这是**本地化重写，不是翻译**。事实/数字/名称/承诺必须全部保留；**句子形状必须重写**。
2. 重写**句子**，不重写**段落**。段数必须与源文一致（调用方按数组长度匹配）。
3. 不得增加源文没有的事实、数字、例子、论断。源文含糊，译文就含糊。
4. 编号/项目符号行全列表保持结构平行（属 UI 邻近文本，非散文）。
5. 锁定术语不是建议。不得替换同义词，同一篇内不得混用两种写法。
6. **具体动词优先**，反对名词化（英文把动作藏在名词里，多数目标语言不是）。
7. 按目标语言的**信息顺序**重排。把一句长英文拆成两句短句，通常是可读性收益最大的一步。
8. 目标文本通常比英文**短 10–30%**。不要为凑长度注水，也不要为压缩而丢事实。
9. 品牌名、URL、href 路径、分隔符 `→` 保持逐字节一致。
10. 语气：给学麻将的人看的、清晰的游戏站书面语。不俚俗、不营销、不百科。

### 4.2 翻译腔指纹（8 类，检测器按此告警）

- 名词化：源文是普通动词，译文写成「进行…操作 / 作出…决定」。
- 「对于…而言 / 就…来说」式框架，主语被推迟。
- 目标语言偏好主动主语处使用被动语态。
- `-ity` / `-ness` 抽象名词照搬为「…性 / …化」。
- 英文议论文填充词：「值得一提的是」「事实上」「换句话说」。
- makes it possible to… 照搬为「使得…成为可能」。
- 三个以上「…的…的…的」定语链。
- 抽象名词前照搬冠词「一个 / 这个」，目标语言本可省略。

### 4.3 中文（`zh`）用词红线

| 严重度 | 错误写法 | 必须改成 | 原因 |
|---|---|---|---|
| **error** | `板块` | 牌 | tile 的硬翻译 |
| **error** | `白龙\|白龍` | 白板 | 白板才是这张箭牌的名字 |
| **error** | `红龙\|红龍` | 红中 | 红中才是这张箭牌的名字 |
| **error** | `绿龙\|綠龍` | 发财 | 发财才是这张箭牌的名字 |
| **error** | `抽牌` | 摸牌 | 麻将里没有「抽牌」这个动作 |
| warn | `弃牌\|弃掉\|棄牌\|棄掉` | 打出 / 打掉 | 英文 discard 在中文是打出 |

**其余中文规矩**

- 教学文体，第二人称直接对话读者。这是教学场景，**不用「您」**。
- 牌 = 牌，永远不是「板块」「棋子」「方块」。牌型/手牌 ≠「图形」（只有指**牌面图案**时才用）。
- 花色与牌名：万子、条子、筒子；面子、顺子、刻子、将牌、门清、听牌、自摸、点炮。
- 「番」为通用计数单位（港式、国标都用番）；**只有专指日本立直时才写「飜」**，同一篇内必须统一。
- 数字半角 + 与单位间留一空格：`144 张`、`13 张`、`9 筒`。序数可用汉字（四组、三张）。
- 标点全角；破折号 `——`；不保留英文 em dash 前后空格。
- 不写营销腔：极致、赋能、打造、一站式。

### 4.4 繁体中文（`zh-TW`）用词红线

| 严重度 | 错误写法 | 必须改成 | 原因 |
|---|---|---|---|
| **error** | `板塊` | 牌 | tile 的硬翻譯 |
| **error** | `白龍` | 白板 | — |
| **error** | `紅龍` | 紅中 | — |
| **error** | `綠龍` | 發財 | — |
| **error** | `抽牌` | 摸牌 | — |
| warn | `棄掉` | 打出 | 動詞用打出；名詞用「打出的牌」或「牌河」 |

**台湾用语优先于大陆用语**（这是 zh-TW 的核心，不是简体转字形）：

- 花色：**索子**（`bamboo` 在 zh 是**条子**、在 zh-TW 是**索子**）、萬子、筒子。
- 术语：將牌、聽牌、門清、暗槓、明槓、碰碰胡、七對子、斷么九、放槍、自摸。
- 三元牌（**不是**「箭牌」）。1 条在台湾叫「么雞」。
- 「番」為通用單位；**講台灣麻將自身的台數時才寫「台」**；專指日本立直可寫「飜」。
- 台灣正體字形：裡、牆、麼、為、隻。
- 标点全角，引号用「」。

### 4.5 其他 5 语要点（摘要）

> 全文以 `scripts/i18n/localization-spec.ts` 为准；此处只摘最容易出错的点。

| 语种 | 关键点 |
|---|---|
| `ja` | です・ます調；不用「あなた」；牌は「牌」、タイル仅指电脑牌；ポン・チー・カン 用片假名；助数詞「枚」 |
| `ko` | 합니다체 기본；不用「당신」，用「플레이어」；패(牌)、마작패・손패・버림패；术语沿用 `terms.json` 既有写法 |
| `es` | 中性西语 + tuteo；ficha 统一（不混 baldosa）；¿ ¡ 必须有；不作英文式大写 |
| `fr` | vouvoiement；tuile；千位用不换行细空格（1 234）；« » 内加不换行空格 |
| `de` | Sie-Form；Stein（不写 Kachel）；千位用点（1.234）；从句动词后置；引号 „…" |
| `pt-BR` | você；peça；ponto 千位（1.234）；巴葡拼写（projeto/time/registro，非 projecto） |

### 4.6 校准例句（写手与模型共用）

- **英文原文**：Strip away the rulesets and every turn follows the same rhythm: draw a tile, work out what it does to your shape, then let one go.
- **直译（错误）**：抛开规则集不谈，每一轮操作都遵循相同的节奏：抽取一块板块，判断它会对你的图形产生什么影响，之后弃掉一块板块。
- **本地化（目标）**：不管玩哪套规则，一个回合的动作都是固定的：摸一张牌，看它能把手牌变成什么样，再打掉一张。
- **问题**：`板块`/`图形`/`抽牌` 三个硬译 + `进行…操作` 名词化 + 英文从句顺序全部照搬。

---

## 5. 提示词与缓存版本（🔴 高危区）

### 5.1 唯一真源

```ts
// scripts/i18n/localization-spec.ts
export const SPEC_VERSION = 'v3-locale-spec';
```

`deepseek-client.ts` **从这里导入**，不再自带版本常量：

```ts
import { buildLocalePrompt, LOCALE_SHEETS, SPEC_VERSION } from './localization-spec';
```

### 5.2 必须 bump `SPEC_VERSION` 的改动

- `DOCTRINE` / `CALQUE_FINGERPRINTS` 增删改
- `LOCALE_SHEETS` 任一语种的 register / rules / redLines / calibration
- `data/glossary/terms.json` 术语锁定值
- 温度、模型名等影响输出的参数

### 5.3 为什么这个 bug 极其危险

旧实现里 `deepseek-client.ts` 自带 `PROMPT_VERSION = 'v2-localize'`，与 spec 各改各的：

1. 有人改了 spec 的规则 → 忘了改 client 的版本号
2. 缓存键没变 → **所有已翻过的字符串继续命中旧缓存**
3. 重跑翻译 → 输出与改动前**逐字相同**
4. 现象：**「我明明改了规范，怎么没效果？」** —— 而且两个版本号都长得合理，肉眼 review 看不出来

**本轮修复**：版本号下沉到 spec，客户端导入。改规范必须动 spec 文件，而版本号就在同一个文件顶部 —— 改规则时**必然会看见它**。

### 5.4 缓存

- 位置：`.cache/i18n-memory.json`
- 键：`sha256(SPEC_VERSION + tier + locale + source)`
- tier：`prose`（温度 0.35）/ `label`（温度 0.1），由 `isProseKey()` 按 key 名判定
- **清缓存**：bump `SPEC_VERSION`（推荐）或删 `.cache/i18n-memory.json`

---

## 6. 已知缺口与修复方案（给 Cursor 的待办）

### 6.1 状态总表

| # | 项 | 状态 | 说明 |
|---|---|---|---|
| 1 | 门禁从 Vercel 构建摘出 | ✅ **已完成** | `build` 已改为纯构建；门禁独立为 `npm run gate`，提交前手动跑（§3.1）|
| 2 | Studio 对象数组展开 | ✅ **已完成** | 提交 `941723b`：`flattenFields` 按下标展开 + `setAtPath` 数组穿透，成对改好 |
| 3 | `messages/*.json` 63 条未译 | ⬜ 待办 | zh-TW 50（含整个 `wardrobe.*`）+ zh 13（含 4 条 `seo.*Title`，会渲染进 `<title>`）|
| 4 | 剩余 9 篇短文未按新规范重写 | ⬜ 待办 | 全站翻译腔残留 3 处（均在这批短文里）|
| 5 | `translateText()` 一次只发一段 | ⬜ 待办 | 模型看不到标题与上下文 → 跨段衔接做不出来（最大的结构性原因）|
| 6 | `data/blog.i18n.ts:61` slug 锚点取 `zh.json` | ⬜ 待办 | 英文才是真源，新增文章应先有英文；1 行 |

**✅ 完成项 #2 实现说明（供 review 参考）** —— `lib/i18n-studio/fields.ts`：

```ts
// flattenFields：对象数组按下标展开为 sections.0.heading / sections.0.body.1 / faq.2.answer
const JSON_BLOB_KEYS = new Set(['tiles', 'heroTiles']);   // 牌图仍保留单框，避免 14 张牌炸成 28 个输入
if (value.length === 0 || !value.every(isPlainObject)) { /* 非纯对象数组 → 维持单框 */ }
value.forEach((item, index) => out.push(...flattenFields(domain, item, `${prefix}.${index}`)));

// setAtPath：数组必须「穿透」而非重建 —— 少了这一支，sections 会变成 {"0":{...}}，结构全毁
if (Array.isArray(next)) {
  cur[p] = structuredClone(next);
} else if (next === null || typeof next !== 'object') {
  cur[p] = {};
}
```

UI 侧（`components/dev/I18nStudioClient.tsx`）已有对应渲染分支：`string` → input/textarea，`string[]` → **逐段输入框**。
→ 结果：一篇文章 = `title` + `description` + 逐节 `heading` + **逐段 body 输入框** + 逐个 FAQ 问答，**左右并排逐句对照成立**。

**给 review 的用法**：Studio 里 `en` 与 `zh`/`zh-TW` 并排，每个段落是独立输入框，逐句比对即可；`sections` / `faq` 不再是巨型 JSON 框。

### 6.2 若要 PR 级自动拦截（可选）

仓库当前**无 `.github/workflows/`**，门禁靠「提交前手动跑」的纪律。若要自动化：

新增 `.github/workflows/i18n-gate.yml`：

```yaml
name: i18n gate
on: [pull_request]
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run gate:i18n
```

> 先确认 `npm ci` 在无 `.env` 环境下能过（`prisma generate` 是否需 `DATABASE_URL`）。若不能，改为只跑 `validate:*` 三件套 + `vitest` 指定文件。

### 6.3 门禁升级为多语（缺口 #3 完成后可做）

当前语言门禁只覆盖 `zh` / `zh-TW`（`CONTENT_LOCALES`）。`messages/*.json` 补齐后，可把 `lint-zh-prose` 的 `--locale` 扩到其他语种 —— 但**需要先为每个语种写 redLines**，否则检测器无规则可依。

---

## 7. 交付与验收流程

### 7.1 内容类改动的标准动作

```
1. 改 TS 英文源（data/blog.cornerstone.ts 或 data/blog.ts）
2. npx tsx scripts/export-en-json.ts        # 从 TS 重建 en.json（禁止手抄）
3. 写 zh / zh-TW（本地化重写，非直译）
4. 其余 6 语种：缺失走 translate-content-i18n，已有内容不强制重写
5. npm run gate                             # 🔴 提交前必跑：verify:en + 四层门禁 + 全量单测
6. 拆提交（见 7.2）
```

> 🔴 **第 5 步是唯一的拦截点。** 门禁已从 `build` 摘出（§3.1），Vercel 不会再拦你 —— 跑过 `npm run gate` 才算完成。

### 7.2 提交拆分原则

工作区常驻 20–30 个未提交文件（协作者在途）。**交付时必须提醒拆提交**，建议分组：

| 组 | 内容 |
|---|---|
| 内容-EN | TS 源 + `en.json` |
| 内容-中繁 | `zh.json` + `zh-TW.json` |
| 工具 | `localization-spec.ts` + `deepseek-client.ts` + `lint-zh-prose.ts` + `package.json` |
| 测试 | `*.test.ts` |

> ⚠️ `localization-spec.ts`（新文件）与 `deepseek-client.ts`（改了 import）**必须同一次提交** —— 单独提交任一个都会 `tsc` 报错。

> 内容-EN 与内容-中繁**不要合并**：合并后整篇看起来都是新增，diff 无法 review「这篇改了哪几句」。

### 7.3 验收清单

- [ ] **`npm run gate` 退出码 0**（含 verify:en + 四层门禁 + 全量单测）
- [ ] `npm run test` 全绿（489/30）
- [ ] `npm run build` → `✓ Compiled successfully` + 静态页数不变（`111/111`）
- [ ] `lint:zh-prose` 新写的内容 **0 错译**
- [ ] 随机抽样一段：**读起来像中文原创，不像翻译**
- [ ] 提交已按 7.2 拆分

---

## 8. 环境与陷阱（Windows）

```bash
# 🔴 PATH 里必须同时有 coreutils 与 node，否则 bash 退化到连 ls/grep/git 都找不到
export PATH="/c/Users/zyj/.workbuddy/binaries/PortableGit/versions/1.2.0/usr/bin:/c/Users/zyj/.workbuddy/binaries/PortableGit/versions/1.2.0/bin:/c/Program Files/nodejs:/c/Windows/System32:/c/Windows:$PATH"

# WorkBuddy 删除守卫会拦 .next 清理 → 构建失败但报错与代码无关
unset NODE_OPTIONS CODEBUDDY_SAFE_DELETE_BULK_STATE_DIR CODEBUDDY_TOOL_CALL_ID
```

> ⚠️ `npm run *` 需要 `bash` 在 PATH 上。shell 若只留 Windows 路径（缺 `/usr/bin`），会报
> `/usr/bin/env: 'bash': No such file or directory`，或 `ls` / `grep` / `head`: command not found。
> 上面的 PortableGit `usr/bin` 就是修复项。
> 另：本机 **不存在** `C:\Program Files\Git\`；git 实际在
> `C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe`。

| 陷阱 | 现象 | 处理 |
|---|---|---|
| Git Bash PATH 缺失 | `node: command not found` | 用上面的 PATH 导出 |
| WorkBuddy 删除守卫 | build 报删除错误 | `unset` 三个环境变量 |
| `core.autocrlf=true` | 编辑后整文件 diff | 属正常；不要手动转 LF |
| `tsc --noEmit` 不查 scripts/tests | 类型错误漏检 | **必须实跑脚本与测试** |
| 行号漂移 | 改错位置 | 一律**按函数名搜索**，不按行号 |
| Studio 保存 | 多余空行存成空字符串 | 会触发完整性门禁 → 保存后必跑 `validate:content-i18n` |

---

## 附录 A · 文件索引

| 路径 | 作用 |
|---|---|
| `data/blog.ts` / `data/blog.cornerstone.ts` | 博客英文源（TS，结构基线）|
| `data/blog-i18n/{locale}.json` | 博客 9 语译文 |
| `data/games.ts` / `data/games-i18n/` | 游戏内容 |
| `data/glossary/terms.json` | 术语库（38 条，锁定值）|
| `messages/{locale}.json` | UI 文案 |
| `scripts/i18n/localization-spec.ts` | **规范唯一真源** + `SPEC_VERSION` |
| `scripts/i18n/deepseek-client.ts` | 翻译客户端（缓存、温度）|
| `scripts/i18n/translate-content-i18n.ts` | 翻译执行器 |
| `scripts/i18n/lint-zh-prose.ts` | 中文体检 / 门禁 |
| `scripts/export-en-json.ts` | TS → en.json（禁止手抄）|
| `scripts/verify-en-json-parity.ts` | TS ↔ en.json 一致性 |
| `lib/article-links.ts` | 内链自动注入（第 1 节契约）|
| `lib/mahjong/tile-art.ts` | 牌图美术真源（游戏+文章共用）|
| `lib/i18n-studio/` | Studio store / fields / taxonomy |
| `tests/blog-i18n-structure.test.ts` | 结构门禁（28 断言）|
| `tests/content-i18n-integrity.test.ts` | 完整性门禁（86 断言）|

## 附录 B · 术语对照速查

| EN | zh | zh-TW | 备注 |
|---|---|---|---|
| tile | 牌 | 牌 | **禁止**板块 / 板塊 / 棋子 / 方塊 |
| draw | 摸牌 | 摸牌 | **禁止**抽牌 |
| discard | 打出 / 打掉 | 打出 | **禁止**弃掉 / 棄掉 |
| hand | 手牌 | 手牌 | 指成型牌型时用「牌型」；**禁止**图形 / 圖形 |
| bamboo | 条子 | **索子** | 🔴 两语不同，最易错 |
| dragons | 白板 / 红中 / 发财 | 白板 / 紅中 / 發財 | **禁止**白龙 / 红龙 / 绿龙 |
| faan | 番 | 番 / 台 | 通用用番；台湾自身台数用「台」；立直用「飜」 |
| wait | 听牌 | 聽牌 | |
| concealed hand | 门清 | 門清 | |
| self-draw | 自摸 | 自摸 | |
| deal-in | 点炮 | 放槍 | |
| honour tiles | 字牌 / 箭牌 | **三元牌** | zh-TW 不用「箭牌」 |
| 1-bamboo | 一条 | **么雞** | 台湾叫法 |

---

> **维护约定**：本文件是 i18n 领域唯一权威。任何多语言工具、JSON 格式、翻译规范、门禁阈值的变更 → **只更新本文件**，不另开新文档。每次更新递增版本号并在此处记录。
>
> **变更记录**
> - `v1.0` 2026-09-16 · 合并 `i18n内容管理_从代码粘贴到JSON工作流`、`多语言本地化规范`、`中文译文质量_诊断与解决方案`、`JSON工作流_第1+2步_PR说明与证据` 四份文档；修复 `PROMPT_VERSION` 与 spec 版本号漂移（改为导入 `SPEC_VERSION`）。
