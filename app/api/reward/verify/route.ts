import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/require-user';
import { prisma } from '@/lib/db';
import { verifyGrant } from '@/lib/reward-token';
import { adsEnabled } from '@/lib/flags';
import { ITEM_TYPES, type ItemType } from '@/lib/mahjong-solitaire/items';
import { isConnectRewardItem } from '@/lib/cocos/connect-rewards';

export const dynamic = 'force-dynamic';

/**
 * S2S reward receipt. The client cannot mint a valid token.
 * Until an ad network is connected, this only accepts server-signed grants
 * and never issues them itself.
 *
 * Supports solitaire itemTypes and Connect placements (hint/shuffle/extra_time).
 * Cocos Connect grants go through window.MahjongHub.grantReward after verify
 * (or the mock path in lib/ads/rewarded.ts when ads are disabled).
 */
export async function POST(req: NextRequest) {
  if (!adsEnabled()) {
    return NextResponse.json({ error: 'ads_not_configured' }, { status: 501 });
  }

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
  const token = (body as { token?: unknown }).token;
  if (typeof token !== 'string' || token.length > 2000) {
    return NextResponse.json({ error: 'invalid token' }, { status: 400 });
  }

  const verified = verifyGrant(token, { userId });
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 403 });
  }

  const itemType = verified.grant.itemType;
  const isSolitaire = (ITEM_TYPES as string[]).includes(itemType);
  const isConnect = isConnectRewardItem(itemType);
  if (!isSolitaire && !isConnect) {
    return NextResponse.json({ error: 'invalid itemType' }, { status: 400 });
  }

  const nonceKey = `reward:${verified.grant.nonce}`;
  try {
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
        itemType: isSolitaire ? (itemType as ItemType) : `connect:${itemType}`,
        delta: 0,
        reason: nonceKey
      }
    });
    return NextResponse.json({
      ok: true,
      itemType,
      slot: verified.grant.slot,
      sessionUse: true,
      game: isConnect ? 'connect' : 'solitaire'
    });
  } catch (err) {
    console.error('[reward/verify] failed', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
