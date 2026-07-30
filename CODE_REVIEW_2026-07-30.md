# 代码评审报告 — 运营后台（Admin Backend）

评审范围：`lib/admin-guard.ts`、`lib/db.ts`、7 个 `/api/admin/*` 路由、4 个 `components/admin/*` 客户端组件、`app/admin/**` 页面、`auth.ts` + `middleware.ts` + `auth.config.ts`、`prisma/schema.prisma`。
评审日期：2026-07-30
结论：**骨架可用，但有 1 个会导致数据丢失的必改 bug + 1 个生产安全 fail-open 风险，需在接 Neon DB 前修掉。**

---

## 🔴 必须修（影响数据/安全）

### 1. `SettingsForm` 把 `site` 配置写成了硬编码默认值，用户编辑全部丢失
文件：`components/admin/SettingsForm.tsx:44-57`

```ts
const payload = {
  site: DEFAULTS,                       // ❌ 写的是常量默认值，不是用户输入
  social: { facebook: form.facebook, ... },
  analytics: { ga: form.ga, gtm: form.gtm }
};
```

`payload.site` 直接用了模块常量 `DEFAULTS`，而 `DEFAULTS` 里是 `'Mahjong Hub · Rainbow...'` 那些占位值。结果：用户改了站点标题/描述/默认语言/OG 图并点保存后，后端 `site` 这一条 `SiteSetting` 被覆盖成默认值 —— **用户输入被丢弃且回写默认值**。这是确认的数据丢失 bug。

**修复**：改为读取表单值
```ts
site: {
  siteTitle: form.siteTitle,
  siteDescription: form.siteDescription,
  defaultLocale: form.defaultLocale,
  ogImage: form.ogImage
}
```

### 2. `SettingsForm` 从不读取已存配置，永远显示默认值
文件：`components/admin/SettingsForm.tsx:32`

`useState(DEFAULTS)` 初始化，页面没有任何服务端拉取 `SiteSetting` 的动作。即使 #1 修好，用户每次进页面看到的也是默认值，无法看到/继续编辑已保存内容。需要在页面里 `GET /api/admin/settings` 注入初始值（参考 `GameEditorForm` 的 `initial` 模式）。

### 3. `requireAdmin` 在生产环境 fail-open（未设 ADMIN_EMAILS 即放行）
文件：`lib/admin-guard.ts:18-23`

```ts
const allowList = process.env.ADMIN_EMAILS;
if (!allowList) {
  return null; // 任何已登录用户都是管理员
}
```

Vercel 生产环境若忘记配置 `ADMIN_EMAILS`，**任何能登录的人都能写后台**。必须 fail-closed：生产环境缺失白名单时应返回 403。

**修复建议**：
```ts
if (!allowList) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 403 });
  }
  return null; // 仅 dev 放行
}
```
同时在 `.env.example` / README 明确标注「生产必须设 ADMIN_EMAILS」。

---

## 🟠 重要（功能缺口 / 健壮性）

### 4. `app/admin/games/new` 新建页面是死页，无法真正创建
文件：`app/admin/games/new/page.tsx`（整页）
- 「创建游戏」按钮只有 `disabled={!dbConnected}`，**没有任何 onClick / form 提交逻辑**，也没接 `/api/admin/games`（POST 已实现却没人调）。
- 建议：复用 `GameEditorForm` 改成「新建模式」（`slug` 可编辑、提交用 POST），或在 `new/page.tsx` 内置一个 client 表单调 `POST`。这是此前 pending 项，建议优先。

### 5. Slug 格式未校验 —— URL/查找注入风险
文件：`app/api/admin/games/route.ts:30`、`[slug]/route.ts`、`PUT` 也接受任意 slug`
`slug` 直接存入 DB 并参与 URL 生成与静态 `getGame` 查找。未限制 `^[a-z0-9-]+$`。管理员若填入大写、空格、`..` 等会造成路由异常或模板渲染问题。
**修复**：在 POST/PUT 处加 `if (!/^[a-z0-9-]+$/.test(slug)) return 400`。

### 6. 后端缺乏输入长度 / 类型边界校验
文件：`features/[locale]/route.ts:23`、`faqs` 路由、games 路由
- `content`（MDX）和 `answer` 无最大长度限制，可被写入超大字符串（存储/DoS）。
- 建议：对 `content`/`answer`/`question` 加 `length <= N`（如 64KB）校验；`sortOrder` 应 `Number.isInteger` 后再存。

### 7. `dbConnected` 判定逻辑有盲区
文件：`app/admin/games/page.tsx:31`
```ts
dbConnected: dbGames.length > 0
```
若 DB 已连但表为空（0 条游戏），会误报「未连接」并刷警告。建议加一个独立的轻量健康检查（如 `prisma.$queryRaw\`select 1\``）而非用行数推断。

### 8. 中间件只验「已登录」，不验「管理员」—— 非管理员可见后台 HTML
文件：`auth.config.ts:19-27`、`middleware.ts:13-18`
`/admin` 仅被 `authorized` 拦截为「有 session 即可」。真正的写保护靠 API 层的 `requireAdmin`。结果是：**已登录的非管理员能打开 `/admin/*` 页面看到结构（只是 API 写会 403）**。属低危信息暴露，但建议：在 admin layout/page 里也做 admin 判定，或在文档明确「页面可见、操作受限」的设计取舍。

---

## 🟡 建议（代码质量 / 体验 / 一致性）

### 9. 类型 `any` 绕过检查
- `app/admin/games/[slug]/page.tsx:12` `let dbGame: any` → 应声明为 Prisma `Game` 类型。
- `GameEditorForm.tsx:45` `(v as any)` 可改用受控联合类型。
- 这些不影响运行，但会掩盖字段拼写错误。

### 10. `tags` / `downloadUrl` / `thumbnail` 字段已实现却无 UI
`schema` 有 `tags String[]`、`downloadUrl`、`thumbnail`，但 `PUT /games/[slug]` 的白名单（route.ts:34-43）和表单都没覆盖。要么补 UI，要么在注释里标注「二期」。当前属于未接入口，非 bug。

### 11. `new/page.tsx` 的 `prisma.$connect()` + `$disconnect()`
`checkDb()` 调用 `$disconnect()` 会关闭全局单例连接。Serverless 下下次请求会重连，通常没问题，但更稳妥的做法是只 `$queryRaw\`select 1\`` 测活，不主动 disconnect。低优先级。

### 12. i18n 编辑器仍是占位
`app/admin/settings/i18n/page.tsx` 整个是「待实现」提示，但 `/api/admin/i18n` 已可用。是已知 pending 项，建议排期。

### 13. 无测试
整个 admin 模块无任何单测/集成测。建议在接 DB 后补：slug 唯一性、requireAdmin 白名单、SettingsForm 写读往返（可用 `vitest` + Prisma 的内存/测试库）。

---

## ✅ 做得好的地方

- **Prisma 单例**（`lib/db.ts`）用 `globalThis` 缓存，dev 不爆连接，正确。
- **admin 守卫集中**（`requireAdmin`）统一了 401/403，避免每个路由重复鉴权。
- **`force-dynamic`** 用在 admin 全部页面/接口，避开 SSG 缓存脏数据，也几乎不增加 Vercel 成本（后台流量极小）。
- **Prisma 参数化查询**：所有 `where` 都走 ORM，无 SQL 拼接注入风险。
- **`features` upsert** 用复合主键 `gameId_locale`，幂等且无竞态。
- **FAQ 删除/更新** 的 `confirm` + 乐观更新 + `router.refresh()` 模式干净。
- **schema 关系加了 `onDelete: Cascade`**，删游戏级联清 FAQ/Features，不会留孤儿行。

---

## 建议修复顺序（与 8 月底目标对齐）

1. **P0**：#1 + #2 `SettingsForm` 数据丢失（写默认值 / 不读已有）→ 立刻改。
2. **P0**：#3 `requireAdmin` 生产 fail-closed + 文档标注 ADMIN_EMAILS 必填。
3. **P1**：#4 新建游戏页接上 POST（否则「96 游戏」无法从后台录入）。
4. **P1**：#5 slug 格式校验 + #6 输入长度/整数校验（接 DB 前一次性加）。
5. **P2**：#7 健康检查、#10/#12 补齐 tags/thumbnail/i18n UI、#13 加测试。
