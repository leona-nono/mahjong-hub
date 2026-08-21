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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com",
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
  // We do not use next/image yet. Leaving optimization on with a wildcard
  // remote host would both weaken security and bill Image Optimization.
  images: {
    unoptimized: true
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      },
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
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
      {
        // Prefer /en as the English home URL; / is only an entry hop.
        source: '/',
        destination: '/en',
        permanent: true
      },
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
        source: '/privacy-policy',
        destination: '/en/privacy',
        permanent: true
      },
      {
        source: '/:locale/privacy-policy',
        destination: '/:locale/privacy',
        permanent: true
      }
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
