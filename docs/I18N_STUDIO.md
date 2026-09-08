# Dev Content Studio（文案检查）

本地网页工具：对照英文根文本、切换语种、字段化编辑、规则检查（残稿/术语）。仅 `development` 可用。

## 一键打开（推荐）

双击仓库根目录 **`打开文案Studio.cmd`**（或 `scripts\open-i18n-studio.cmd`）。

会启动/复用 `npm run dev`，并打开：

`http://localhost:3000/dev/i18n`

保持弹出的 **mahjong-hub-dev** 窗口不要关。首次需已 `npm install`。

## 界面怎么用

1. 顶栏：Domain 按钮 + Locale；分类筛选；**Run check** / **Save locale**  
2. 左：条目列表（按当前语种的错误数排序，红/黄角标）  
3. 中：EN ∥ 当前语字段；红框=英文残稿，黄=术语/警告；可标 `locale_idiom`  
4. **底部 Issues 面板（全量）**：默认列出全部 Errors（可切 Warnings / All）  
   - 按 locale / domain / path / message 筛选与排序  
   - 语种芯片快速过滤（Errors by locale）  
   - 每行编号 `#001…`，点击跳转到对应 domain / locale / 字段  
   - **Copy list** / **Download TSV** 导出当前筛选结果  
5. 批量：Copy EN→empty / Clear residual / Replace / Undo / JSON

打开页面会自动跑一次 check。Advanced 折叠里仍可编辑 raw JSON。

## 规则（与 CI 共用 `lib/i18n-rules`）

| 级别 | 内容 |
|------|------|
| 硬错误 | 结构对齐、缺 key、CJK(zh/zh-TW/ja/ko) 与 EN 完全相同（无 override）、games/about 既有同文规则 |
| 黄灯 | 长度异常、非 CJK 残稿、glossary 英文词残留、messages 缺 key |

口语合法偏离：locale 条目 `_meta.overrides[field].reason = locale_idiom | brand_voice | …`

## CLI

```bash
npm run i18n:check
npm run validate:blog-i18n
npm run validate:content-i18n
```

## 生产

`/dev/i18n` 与 `/api/dev/i18n/*` 不可用（middleware + `assertDevOnly` + page `notFound`）。

## 相关路径

- UI：`app/dev/i18n`、`components/dev/I18nStudioClient.tsx`
- API：`app/api/dev/i18n/*`
- 规则：`lib/i18n-rules`
- 站点：`data/site.json`
