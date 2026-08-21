import 'server-only';
import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db';

type Db = PrismaClient | Prisma.TransactionClient;

/** Balance is the sum of the append-only ledger (P0-E1). */
export async function ledgerTotal(db: Db, userId: string): Promise<number> {
  const agg = await db.pointTransaction.aggregate({
    where: { userId },
    _sum: { amount: true }
  });
  return agg._sum.amount ?? 0;
}

export async function syncCachedTotal(db: Db, userId: string): Promise<number> {
  const total = await ledgerTotal(db, userId);
  await db.userPoint.upsert({
    where: { userId },
    create: { userId, total },
    update: { total }
  });
  return total;
}

export async function publicLedgerTotal(userId: string): Promise<number> {
  return ledgerTotal(prisma, userId);
}
