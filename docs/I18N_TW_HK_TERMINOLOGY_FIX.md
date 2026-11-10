# 中/繁中術語雙軌制 · 落地執行規格（給 Cursor）

> 站點 `mahjonggame.org` · 主體 `Mahjong Hub`
> 倉庫 `D:\mahjonggamebox\mahjong-hub\mahjong-hub`
> 定案日期 **2026-09-22** · 規則真源 `docs/I18N_MASTER_SPEC.md` **§4.4.1**
> ⛔ 本文件不重複已完成的改動；§3 列出的項目**已完成，請勿重做**。

---

## 1. 背景：為什麼不能只做「繁簡轉換」

站內同時存在兩個**正交**的軸：

| 軸 | 取值 | 由誰承載 |
|---|---|---|
| **字形軸** | 簡體 / 繁體 | `zh` vs `zh-TW` |
| **術語地區軸** | 大陸 / 台灣 / 香港粵 | 由 §4.4.1 規則決定 |

**「繁體中文」≠「台灣用詞」**：香港、澳門用繁體但術語屬粵語系統；廣東、廣西用簡體也講粵語術語。三地對 `deal-in` 就有三個詞：**點炮（陸）／放槍（台）／出銃（港）**。

原本 `zh-TW` 的 `label` 寫死成 `Traditional Chinese (Taiwan)`，但術語庫卻給 `zh-TW` 填了**港式**的「放銃」——規範與術語庫互相打臉，而術語庫贏了：因為它是 `buildLocalePrompt()` 注入翻譯提示詞的**鎖定表**（`"use these exact strings, never synonyms"`），所有機器翻譯的語料都被指示照抄港式詞。

---

## 2. 判斷規則（唯一判據）

> **有桌面歸屬的文案，用該桌面的原生術語；無桌面歸屬的通用文案，用宿主語種的預設地區術語。**

| 文案歸屬 | 術語域 | 例 |
|---|---|---|
| **港式桌**（**任何**語種，含 `zh` / `zh-TW`） | **香港粵語** | 食糊、出銃、叫糊、三番起糊、例牌、番子 |
| 台灣十六張桌 | 台灣 | 放槍、聽牌、台數、三元牌、索子 |
| 國標 MCR 桌 | 大陸（該規則官方術語） | 番種、箭牌、定缺、點炮 |
| 四川血戰桌 | 大陸（川麻原生） | 定缺、換三張、點炮 |
| 立直桌 | 日式漢字術語 | 飜、榮和、立直 |
| **通用文案**（工具 · 教練 · 結算 · 導航 · 類目頁 · 博客 · 首頁） | 隨語種：`zh`→大陸、`zh-TW`→台灣 | `zh`：点炮／听牌／条子；`zh-TW`：放槍／聽牌／索子 |

**港式桌是唯一跨語種的例外**：本站旗艦玩法是香港老章麻將，「食糊」「出銃」既係品牌識別符號，也是 SEO 差異化（競品幾乎全做日式立直）。

**🔴 凍結期約束**：⛔ 不新增 `/zh-HK`。新增語種＝新增約 41 個 URL，會重置 Google 站點評估。

---

## 3. ✅ 本輪已完成（**請勿重做**）

| # | 文件 | 改動 |
|---|---|---|
| 1 | `data/glossary/terms.json` | `deal_in_win.i18n["zh-TW"]`：放銃 → **放槍**；`dragon_tiles.i18n["zh-TW"]`：箭牌 → **三元牌** |
| 2 | `data/glossary/definitions.ts` | `dragon_tiles` / `honor_tiles` 的 `zh-TW`：箭牌 → **三元牌** |
| 3 | `scripts/i18n/localization-spec.ts` | `SPEC_VERSION` → **`v4-locale-spec-dual-track-tw`**（翻譯快取全量作廢）；`zh-TW` sheet 的 `label` / `rules` / `redLines` 寫入雙軌規則；新增 `箭牌`（error）與 `條子\|条子`（warn）紅線；放寬 `弃牌`（名詞可用，只留動詞 `弃掉`）；修掉 `綠龍\|綠龍` 重複 |
| 4 | `docs/I18N_MASTER_SPEC.md` | 新增 **§4.4.1 雙軌制**；§4.3 / §4.4 紅線表同步；**附錄 B 擴為三地對照**（+香港粵語列）；變更記錄 `v1.1` |
| 5 | `lib/locales.ts` | `OG_LOCALE['zh-TW']`：`zh_TW` → **`zh_Hant`** |
| 6 | `tests/home-seo.test.ts:69`、`tests/glossary-locales.test.ts:52` | 斷言同步改為 `zh_Hant`（**必須同改，否則測試掛**） |
| 7 | `data/blog-i18n/zh-TW.json` | 箭牌 ×12 → 三元牌；條子 ×4 → 索子（L835 引述句保留） |
| 8 | `data/games-i18n/zh-TW.json` | 台灣桌：放銃 → 放槍 ×2；港式桌：`風、箭` → `風、番子`；國標/四川桌（讀者＝台灣）：箭牌 → 三元牌 ×3、條 → 索、點炮 → 放槍 ×2 |
| 9 | `data/games-i18n/zh.json` | 港式桌：`条、箭` → `索、番子`；台灣桌（讀者＝大陸）：放铳 → 点炮 ×2 |
| 10 | `messages/zh-TW.json` | `winOnDiscardLabel` 食糊→**放槍**；`payMcrDiscard` / `payFromDiscarder` / `scoreTaiwanSettlement` / `riskLow·Medium·High`：放銃 → **放槍**；L1252 簡體字「条子」→「索子」 |
| 11 | `messages/zh.json` | 同鍵同步：`winOnDiscardLabel` 食糊→**点炮**；其餘 放铳 → **点炮** |

**保留不動（正確）**：
- 港式桌的「食糊／放銃／三番／數番」——`messages/*:259`、`games-i18n/*:12`、`*:21`，這是雙軌制的正確形態
- 立直桌的「雙榮／榮和／放銃」——`messages/*:190`（`Double ron` 的日式術語）
- 國標桌與四川桌在 `zh` 側的「箭牌／條」——`zh` 讀者＝大陸，原生術語正確
- `messages/*:1411` `classicAboutP1` 的「食糊」——描述港式桌，正確

**驗證結果**：`vitest` **108 passed**（5 檔）· `validate:games` OK · `validate:zh-prose` **0 錯譯** · `verify:en` PASS · `i18n:check` 與改動前**完全一致**（8 error 為既存，見 T1）。

---

## 4. ⬜ 待執行

### T1 · 🔴 P0：`data/blog-i18n/en.json` 段數錯配（**會讓 `npm run gate` 掛**）

`git diff --numstat` 顯示 `data/blog-i18n/en.json` **17 增 / 1 刪**（未提交、非本次改動引入），且：

| slug | en `sections` | zh / zh-TW `sections` |
|---|---|---|
| `how-to-play-mahjong-online` | **7**（bodies `[4,7,8,5,3,7,4]`） | 6（`[4,7,8,5,7,4]`） |
| `types-of-mahjong-games` | **9**（bodies `[3,4,5,5,4,4,5,4,3]`） | 8（`[3,4,5,5,4,4,5,4]`） |

→ EN 側各多了一節，中文未跟上。

🔑 **線索（2026-09-22 實測 `git diff --numstat`）**：工作區同時存在 **`data/blog.cornerstone.ts`（17 增/1 刪）** 與 **`data/blog-i18n/en.json`（17 增/1 刪）** 兩筆未提交改動，以及 `app/[locale]/(public)/games/page.tsx`（83/9）、`app/[locale]/(public)/games/classic/page.tsx`（92/5）、`components/HomeCategoryCards.tsx`（28/11）—— 後三者正是**遊戲區 IA（R7 類目頁）派單**的改動範圍。
⇒ **T1 幾乎可確定是 IA 派單執行時新增了博客節、但中文沒跟上。**

✅ `npm run verify:en` 為 **PASS**（`blog: 20/20 identical`）→ **不是 TS 與 en.json 雙寫不一致**，是**中文缺節**。

**修法**：把 EN 新增的那一節翻譯補進 `zh` / `zh-TW`（段數與 `tiles` 形狀都要對齊）。

驗證：`npm run --silent validate:blog-i18n`（現有 **8 個 error**，修完應為 0）＋ `npx vitest run tests/blog-i18n-structure.test.ts`。

### T2 · 港式桌動詞「放銃」→「出銃」（可選，更地道）

香港麻雀大師賽官方規則通篇用 **「出銃」**（動作）／「銃牌」（那張牌）；「放銃」是「出衝」的近音變體。

- `messages/zh.json:259`、`messages/zh-TW.json:259`（`tipHkDiscardWin`）
- `data/games-i18n/zh.json:12`、`data/games-i18n/zh-TW.json:12`

⚠️ 屬**語感優化**非錯誤，可不做。若做，`zh` 與 `zh-TW` 必須同步。

### T3 · 門禁擴展（防復發）——**需要先解決一個設計問題**

現狀：`lint:zh-prose` **只掃 `data/blog-i18n/*.json`**（`lint-zh-prose.ts` 的掃描範圍），`messages/*.json` 與 `data/*-i18n/*.json` **沒有任何用詞門禁**——這就是「口徑在門禁覆蓋到的地方是對的，在沒覆蓋的地方是錯的」的原因。

**建議做法**：
1. 把掃描範圍擴到 `messages/{zh,zh-TW}.json` ＋ `data/{games,blog}-i18n/*.json`
2. 🔴 **但不要加「同一語種內術語互斥」檢測**（例如禁止「放銃」與「放槍」共存）——**雙軌制下這是正常現象**：港式桌鍵用「放銃」、通用鍵用「放槍」，同一個 `zh-TW.json` 裡必然共存。要做就只能**按桌面歸屬分區檢測**，成本高、易誤報
3. 建議只擴展 **error 級硬錯**（`板塊`、`白龍/紅龍/綠龍`、`抽牌`、`zh-TW` 的 `箭牌`）——這些是**無條件錯誤**，不分桌面

### T4 · 剩餘未審命名空間

- `messages/zh.json`：`tools` 189 · `american` 103 · `achievements` 73 · `wardrobe` 55 · `auth` 17
- 4 個 `data/*-i18n/zh.json` 未做全量直譯審（本輪只處理術語軸）；`games-i18n` 優先級最高（8 個玩法頁正文主體）

### T5 · 送審確認（已完成，僅記錄）

- `winOnDiscardLabel`（通用結算標籤，與 `selfDrawLabel`「自摸」對仗）最終取 `zh`＝「点炮」、`zh-TW`＝「放槍」
- `棄牌` 名詞**保留不動**：它是中文麻將通行行話，非錯譯 → 已把 `zh` sheet 的紅線由 `/弃牌|弃掉|棄牌|棄掉/` 放寬為 `/弃掉|棄掉/`

---

## 5. 驗收命令（⛔ 別跑全量 `npm run gate`，20 分鐘未完）

```bash
# 一次性驗證（約 10 秒）
npx vitest run tests/score-copy.test.ts tests/games-i18n.test.ts \
  tests/home-seo.test.ts tests/glossary-locales.test.ts tests/content-i18n-integrity.test.ts
npm run --silent validate:games        # games catalogue OK (8 games)
npm run --silent validate:zh-prose     # 0 處錯譯 / 18 處翻譯腔
npm run --silent verify:en             # blog 20/20 · games 8/8
npm run --silent i18n:check            # 現為 8 error（全屬 T1），修完 T1 後應 ok=true
```

**提交拆分**：`data/glossary` + `scripts/i18n` + `docs/I18N_MASTER_SPEC.md`（規則本體）／`lib/locales.ts` + 2 個 test（OG locale）／`messages/*`（UI 文案）／`data/*-i18n/*`（內容文案）—— **⛔ 禁 `git add -A`**。

---

## 附 · 三地術語速查

| EN | 大陆 | 台湾 | 香港（粤·仅港式桌） |
|---|---|---|---|
| deal-in | 点炮 | 放槍 | 出銃（术语库作「放銃」） |
| win | 胡牌 / 和牌 | 胡牌 | 食糊 |
| tenpai | 听牌 | 聽牌 | 叫糊 |
| bamboo | 条子 | 索子 | 索子 |
| dragons | 白板 / 红中 / 发财 | 白板 / 紅中 / 發財 | 白板 / 紅中 / 發財 |
| honour tiles | 字牌 / 箭牌 | 三元牌 | 番子 |
| faan | 番 | 番 / 台 | 番 |
| cap | 封顶 | —（本桌 0 台） | 例牌 |
| 一炮多响 | 一炮多响 | 雙響 | 雙響／三響 |

> 完整表見 `docs/I18N_MASTER_SPEC.md` **附錄 B**。
