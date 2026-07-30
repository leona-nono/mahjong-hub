# 后端架构（Phase 0 已落地）

## 现状

- **前端**：Next.js 15 App Router + next-intl，5 语 SSG；登录/积分走模块级 store + `localStorage`（mock login 兜底）。游戏 iframe 外链。
- **后端**（Phase 0 新增）：Auth.js v5（数据库 session）+ Prisma 5 + Neon Postgres。`/api/points` 已实现 GET/POST 鉴权 + reason 白名单 + 日上限 + 事务写入。`/api/auth/[...nextauth]` 暴露 OAuth handlers。`middleware.ts` 保护 `/api/points`、`/api/leaderboard`。

## 文件结构（新增/改动）

```
mahjong-hub/
├── prisma/
│   └── schema.prisma                 ← User / Account / Session / UserPoint / PointTransaction / DailyBonus
├── lib/
│   └── db.ts                          ← Prisma client singleton（dev 热重载友好）
├── auth.config.ts                     ← Edge-safe Auth.js 共享配置
├── auth.ts                            ← NextAuth({ adapter: PrismaAdapter, session: 'database', providers })
├── middleware.ts                      ← Edge middleware，matcher: /api/points, /api/leaderboard
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   ← export { GET, POST } from handlers
│   │   └── points/route.ts               ← GET 总分 / POST 发放（鉴权 + reason 白名单 + 日上限 + 事务）
├── components/
│   └── providers.tsx                ← + SessionProvider（UI 切到 useSession 留待 Phase 1）
└── .env.local.example                ← + DATABASE_URL / AUTH_SECRET / AUTH_TRUST_HOST / AUTH_*_ID&SECRET
```

## 启动步骤

1. 在 [Neon](https://neon.tech) 建一个 free tier 项目，复制连接串到 `.env.local` 的 `DATABASE_URL`。
2. `openssl rand -base64 32` 生成 `AUTH_SECRET`。
3. （可选）填入 Google / Facebook / X 的 OAuth client id + secret。
4. 部署到 Vercel：把同样的环境变量填到项目 Settings → Environment Variables（**Production / Preview / Development 三段都要**），并启用 `AUTH_TRUST_HOST=true`。
5. 首次部署后，本地或 Vercel 一键式控制台执行：
   ```bash
   npx prisma migrate deploy   # 应用 migrations（见 prisma/migrations/）
   ```
   之后任何 schema 改动走 `npx prisma migrate dev --name <描述>` 生成迁移并提交。

## 防作弊设计

- `POST /api/points` 要求 Auth.js session（middleware + handler 双层 401）。
- `amount` 强制 1–100 的正整数；`reason` 必须命中白名单（`start_game | daily_visit | leaderboard_view | achievement`）。
- 每个 `reason` 有日累计上限（`start_game` 200 / `daily_visit` 50 / `achievement` 100），超出返 429。
- 写 `UserPoint.total` + 插 `PointTransaction` 在同一 Prisma 事务，失败回滚。
- 高价值动作（未来）可加 Cloudflare Turnstile。

## 为什么不立刻切 UI

- Phase 0 故意只铺基础设施：API 已可被调用，但 LoginModal / Header / lib/auth 仍走 mock 路径。
- 这样上线零回归：未配 `DATABASE_URL` / `AUTH_SECRET` 时，所有 API 401，mock 路径完全不受影响。
- **Phase 1** 把 LoginModal 改为 `signIn('google' | 'facebook' | 'x')`，Header 读 `useSession()` 优先 + `useAuth()` 兜底，把积分/登录从 localStorage 升级到数据库。

## 排期

- Phase 0（基础设施）：6–8h ✅ 已完成
- Phase 1（真实登录 UI）：10–12h（依赖 OAuth 凭证到位）
- Phase 2（积分后端化 + 防作弊）：8–10h
- Phase 3（排行榜 + 跨设备）：6–8h