import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  ITEM_PRICE,
  ITEM_TYPES,
  STARTER_PACK,
  emptyInventory,
  type ItemInventory,
  type ItemType
} from '@/lib/mahjong-solitaire/items';

async function requireUserId() {
  const session = await auth();
  const userId = session?.user && (session.user as { id?: string }).id;
  return userId || null;
}

function isItemType(v: unknown): v is ItemType {
  return typeof v === 'string' && (ITEM_TYPES as string[]).includes(v);
}

async function balanceForUser(userId: string): Promise<ItemInventory> {
  const rows = await prisma.itemLedger.groupBy({
    by: ['itemType'],
    where: { userId },
    _sum: { delta: true }
  });
  const inv = emptyInventory();
  for (const row of rows) {
    if (isItemType(row.itemType)) {
      inv[row.itemType] = Math.max(0, row._sum.delta ?? 0);
    }
  }
  return inv;
}

async function ensureStarter(userId: string): Promise<void> {
  const existing = await prisma.itemLedger.findFirst({
    where: { userId, reason: 'starter' },
    select: { id: true }
  });
  if (existing) return;
  await prisma.itemLedger.createMany({
    data: ITEM_TYPES.filter((t) => STARTER_PACK[t] > 0).map((itemType) => ({
      userId,
      itemType,
      delta: STARTER_PACK[itemType],
      reason: 'starter'
    }))
  });
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    await ensureStarter(userId);
    const inventory = await balanceForUser(userId);
    return NextResponse.json({ inventory });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}

type Action = 'buy' | 'consume' | 'ad_grant';

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const b = body as { action?: unknown; itemType?: unknown };

  if (!isItemType(b.itemType)) {
    return NextResponse.json({ error: 'invalid itemType' }, { status: 400 });
  }
  const itemType = b.itemType;
  const action = b.action as Action;
  if (action !== 'buy' && action !== 'consume' && action !== 'ad_grant') {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 });
  }

  try {
    await ensureStarter(userId);

    if (action === 'ad_grant') {
      // Session one-shot token: do NOT enter permanent inventory (design §3).
      // Client applies effect immediately; we only audit the grant.
      await prisma.itemLedger.create({
        data: {
          userId,
          itemType,
          delta: 0,
          reason: 'ad_grant_audit'
        }
      });
      const inventory = await balanceForUser(userId);
      return NextResponse.json({ ok: true, inventory, sessionUse: true });
    }

    if (action === 'buy') {
      const price = ITEM_PRICE[itemType];
      const result = await prisma.$transaction(async (tx) => {
        const pointRow = await tx.userPoint.findUnique({ where: { userId } });
        const total = pointRow?.total ?? 0;
        if (total < price) {
          return { error: 'insufficient_points' as const, total };
        }
        const updated = await tx.userPoint.upsert({
          where: { userId },
          create: { userId, total: 0 },
          update: { total: { decrement: price } }
        });
        // Guard against race going negative
        if (updated.total < 0) {
          throw new Error('insufficient_points');
        }
        await tx.pointTransaction.create({
          data: {
            userId,
            amount: -price,
            reason: `item_buy_${itemType}`,
            gameSlug: 'mahjong-solitaire'
          }
        });
        await tx.itemLedger.create({
          data: {
            userId,
            itemType,
            delta: 1,
            reason: 'buy'
          }
        });
        return { error: null as null, total: updated.total };
      });

      if (result.error) {
        return NextResponse.json(
          { error: result.error, total: result.total },
          { status: 402 }
        );
      }
      const inventory = await balanceForUser(userId);
      return NextResponse.json({
        ok: true,
        inventory,
        points: result.total
      });
    }

    // consume
    const inv = await balanceForUser(userId);
    if ((inv[itemType] ?? 0) < 1) {
      return NextResponse.json(
        { error: 'insufficient_items', inventory: inv },
        { status: 402 }
      );
    }
    await prisma.itemLedger.create({
      data: { userId, itemType, delta: -1, reason: 'consume' }
    });
    const inventory = await balanceForUser(userId);
    return NextResponse.json({ ok: true, inventory });
  } catch (e) {
    if (e instanceof Error && e.message === 'insufficient_points') {
      return NextResponse.json({ error: 'insufficient_points' }, { status: 402 });
    }
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
