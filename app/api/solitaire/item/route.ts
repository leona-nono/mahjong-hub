import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { verifyGrant } from '@/lib/reward-token';
import { adsEnabled } from '@/lib/flags';
import { ledgerTotal, syncCachedTotal } from '@/lib/points-ledger';
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
  const b = body as { action?: unknown; itemType?: unknown; grantToken?: unknown };

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
      if (!adsEnabled()) {
        return NextResponse.json({ error: 'ads_not_configured' }, { status: 501 });
      }
      if (typeof b.grantToken !== 'string') {
        return NextResponse.json({ error: 'grant_required' }, { status: 403 });
      }
      const verified = verifyGrant(b.grantToken, { userId });
      if (!verified.ok || verified.grant.itemType !== itemType) {
        return NextResponse.json({ error: 'invalid_grant' }, { status: 403 });
      }
      const nonceKey = `reward:${verified.grant.nonce}`;
      const replay = await prisma.itemLedger.findFirst({
        where: { userId, reason: nonceKey },
        select: { id: true }
      });
      if (replay) {
        return NextResponse.json({ error: 'replay' }, { status: 409 });
      }
      await prisma.itemLedger.create({
        data: {
          userId,
          itemType,
          delta: 0,
          reason: nonceKey
        }
      });
      const inventory = await balanceForUser(userId);
      return NextResponse.json({ ok: true, inventory, sessionUse: true });
    }

    if (action === 'buy') {
      const price = ITEM_PRICE[itemType];
      const result = await prisma.$transaction(async (tx) => {
        const total = await ledgerTotal(tx, userId);
        if (total < price) {
          return { error: 'insufficient_points' as const, total };
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
        const next = await syncCachedTotal(tx, userId);
        return { error: null as null, total: next };
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
