import createNextIntlPlugin from 'next-intl/plugin';
import { fileURLToPath } from 'node:url';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep production file tracing inside this repository. On this Windows
  // workspace the inferred parent can include a protected "My Documents"
  // junction, which otherwise makes `next build` fail while scanning files.
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  // Prisma discovers its native engine at runtime. Keep it external to the
  // webpack server bundle so the production compiler does not crawl protected
  // Windows profile junctions while resolving that binary.
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  }
};

export default withNextIntl(nextConfig);
