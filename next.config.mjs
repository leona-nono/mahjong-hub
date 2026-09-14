import createNextIntlPlugin from 'next-intl/plugin';
import { fileURLToPath } from 'node:url';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      // Next.js + Auth.js + GA/GTM. Iframe games are third-party hosts.
      // Cocos web-mobile (same-origin /cocos/*) needs wasm-unsafe-eval + blob workers.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com",
      "worker-src 'self' blob:",
      "connect-src 'self' blob: https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com",
      "frame-src 'self' https: https://www.googletagmanager.com"
    ].join('; ')
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep production file tracing inside this repository. On this Windows
  // workspace the inferred parent can include a protected "My Documents"
  // junction, which otherwise makes `next build` fail while scanning files.
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  // Prisma discovers its native engine at runtime. Keep it external to the
  // webpack server bundle so the production compiler does not crawl protected
  // Windows profile junctions while resolving that binary.
  serverExternalPackages: ['@prisma/client', '@prisma/engines', '@vercel/blob'],
  // Image Optimization evaluation (P5): covers use plain <img> + long-cache
  // headers on /images|/covers|/assets. Turning on next/image would require
  // migrating GameCard/CatalogGameCard off <img>, and on Vercel bills Image
  // Optimization transforms. Keep unoptimized until that migration is intentional.
  // Cocos Connect stays behind NEXT_PUBLIC_COCOS_CONNECT + dynamic import.
  images: {
    unoptimized: true
  },
  async headers() {
    const immutableAsset = [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
    ];
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      },
      // Long-cache hashed / versioned static art & game packs (CDN hit → cut Origin Transfer).
      {
        source: '/assets/:path*',
        headers: immutableAsset
      },
      {
        source: '/images/:path*',
        headers: immutableAsset
      },
      {
        source: '/cocos/:path*',
        headers: immutableAsset
      },
      {
        source: '/icons/:path*',
        headers: immutableAsset
      },
      {
        source: '/covers/:path*',
        headers: immutableAsset
      },
      {
        source: '/:path*.(js|css|png|jpg|jpeg|webp|svg|ico|wasm|atlas|plist|bin|mem|data|json)',
        headers: immutableAsset
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' }
        ]
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Content-Type', value: 'application/manifest+json' }]
      }
    ];
  },
  async redirects() {
    return [
      // Bare `/` → `/en` lives in middleware (also collapses www → apex in one hop).
      {
        // Beginner guides moved to the canonical /blog/ hub.
        source: '/:locale/games/beginners',
        destination: '/:locale/blog',
        permanent: true
      },
      {
        source: '/:locale/games/beginners/:slug',
        destination: '/:locale/blog/:slug',
        permanent: true
      },
      {
        // Wardrobe UI paused — keep equity on locale home.
        source: '/:locale/wardrobe',
        destination: '/:locale',
        permanent: true
      },
      {
        source: '/privacy-policy',
        destination: '/en/privacy',
        permanent: true
      },
      {
        source: '/:locale/privacy-policy',
        destination: '/:locale/privacy',
        permanent: true
      },
      // Retired third-party iframes — nearest in-house game, not the category hub.
      {
        source: '/:locale/games/bee-connect',
        destination: '/:locale/games/mahjong-connect-classic',
        permanent: true
      },
      {
        source: '/:locale/games/aloha-mahjong',
        destination: '/:locale/games/mahjong-solitaire-classic',
        permanent: true
      },
      {
        source: '/:locale/games/8x8-match-tiles',
        destination: '/:locale/games/mahjong-solitaire-classic',
        permanent: true
      },
      {
        source: '/:locale/games/tile-guru',
        destination: '/:locale/games/mahjong-solitaire-classic',
        permanent: true
      },
      {
        source: '/:locale/games/mahjong-connect',
        destination: '/:locale/games/mahjong-connect-classic',
        permanent: true
      },
      {
        source: '/:locale/games/onet-connect-classic',
        destination: '/:locale/games/mahjong-connect-classic',
        permanent: true
      },
      {
        source: '/:locale/games/mahjong-solitaire',
        destination: '/:locale/games/mahjong-solitaire-classic',
        permanent: true
      },
      {
        source: '/:locale/games/mahjong-classic',
        destination: '/:locale/games/mahjong-solitaire-classic',
        permanent: true
      },
      {
        source: '/:locale/games/mahjong-3d',
        destination: '/:locale/games/mahjong-solitaire-classic',
        permanent: true
      },
      {
        source: '/:locale/games/tile-journey',
        destination: '/:locale/games/mahjong-solitaire-classic',
        permanent: true
      },
      ...['ja', 'ko', 'es', 'fr', 'de', 'pt-BR'].flatMap((locale) => [
        { source: `/${locale}`, destination: '/en', permanent: true },
        { source: `/${locale}/:path*`, destination: '/en/:path*', permanent: true }
      ])
    ];
  },
  async rewrites() {
    return [
      { source: '/ads.txt', destination: '/api/public/ads-txt' },
      { source: '/sellers.json', destination: '/api/public/sellers-json' }
    ];
  }
};

export default withNextIntl(nextConfig);
