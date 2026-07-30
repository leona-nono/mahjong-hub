import { PrismaClient } from './generated/prisma';

/**
 * Single PrismaClient instance, cached on globalThis during dev so that
 * Next.js hot reload does not spawn a new connection pool on every save
 * (which would exhaust Neon's connection limit within minutes).
 *
 * In production (Vercel) each serverless invocation gets a fresh module
 * scope, so caching is unnecessary but harmless.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}