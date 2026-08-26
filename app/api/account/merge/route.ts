import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/require-user';
import { mergeGuestIntoUser, type GuestMergePayload } from '@/lib/guest-merge';
import { ITEM_TYPES, type ItemType } from '@/lib/mahjong-solitaire/items';

export const dynamic = 'force-dynamic';

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
  const b = body as GuestMergePayload;
  const inventory: Partial<Record<ItemType, number>> = {};
  if (b.inventory && typeof b.inventory === 'object') {
    for (const type of ITEM_TYPES) {
      if (type in b.inventory) inventory[type] = Number(b.inventory[type]);
    }
  }

  try {
    const result = await mergeGuestIntoUser(userId, {
      inventory,
      daily: b.daily,
      progress: b.progress,
      points: typeof b.points === 'number' ? b.points : Number(b.points) || 0
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[guest-merge] failed', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
