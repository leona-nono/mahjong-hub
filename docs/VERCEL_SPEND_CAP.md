# Vercel Pro spend cap (mahjong-hub)

Goal: keep monthly spend at the **Pro seat fee only** ($20/seat, which includes $20 usage credit). Public SEO pages are **force-static SSG** so crawler traffic should hit CDN Fast Data Transfer / Edge Requests, not Functions or ISR.

## Required console settings

1. **Spend Management** (Team → Settings → Billing / Spend Management)
   - Set a hard cap so **on-demand usage cannot bill beyond $0** (or total = seats × $20).
   - Without this, Pro will keep serving traffic after the credit is gone and invoice overages.

2. **Do not enable**
   - Image Optimization (repo already uses `images.unoptimized: true` in `next.config.mjs`)
   - Web Analytics Plus
   - Speed Insights Plus
   - Extra seats you do not need

3. **Preview deployments**
   - Prefer deploying only `main` to Production.
   - Disable or limit automatic Preview builds for every PR/push — Build CPU minutes draw down the credit.

4. **Watch these meters** (after SSG ship they should stay near zero for public traffic)
   - ISR Reads / Writes
   - Function Invocations / Active CPU / Fast Origin Transfer
   - Blob / Image Optimization

Public HTML should show primarily:
- Fast Data Transfer (1 TB included)
- Edge Requests (10M included)

## What code already does

- Public routes under `app/[locale]/(public)` use `export const dynamic = 'force-static'`.
- Catalogue / blog / about / home-guide copy comes from `data/*` JSON — no Prisma on the request path.
- `getPublicSiteSettings()` is sync defaults (+ optional `NEXT_PUBLIC_*` env); admin still uses `getSiteSettings()` (DB).
- `?play=daily` and homepage daily level id are resolved **client-side**.
- `SessionProvider` starts with `session={null}` and only calls `/api/auth/session` when a session cookie exists.

## Acceptance checklist

```bash
npm run build
# Confirm public [locale] routes are ○ Static (not ƒ / λ)

# After deploy, HTML must contain localized copy without running game JS:
curl -sL https://mahjonggame.org/zh | findstr /i "麻将"
curl -sL https://mahjonggame.org/ja/about | findstr /i "麻雀"
curl -sL https://mahjonggame.org/en/blog/how-to-play-mahjong | findstr /i "Mahjong"
curl -sL https://mahjonggame.org/zh/games/hong-kong-mahjong | findstr /i "香港"
```

View Source / disable JS: rules and FAQ paragraphs must still be present.

One week post-deploy: Vercel Usage should show public traffic as Data Transfer + Edge Requests; ISR writes and public Function duration near zero; invoice ≤ seat fees.
