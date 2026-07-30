import 'server-only';
import { prisma } from './db';

/**
 * Lightweight DB connectivity probe.
 *
 * Runs `SELECT 1` against the shared Prisma client — does NOT call
 * `$connect` / `$disconnect` because those tear down the singleton's
 * connection pool on every probe.
 *
 * Use this anywhere a page/server-component needs a real "is the DB
 * reachable?" signal without conflating it with "does the table have rows?"
 */
export async function isDbConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`select 1`;
    return true;
  } catch {
    return false;
  }
}
