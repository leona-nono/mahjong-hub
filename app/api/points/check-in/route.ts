import { NextResponse } from 'next/server';
import { claimDailyCheckInForUser } from '@/lib/points-server';
import { requireUserId } from '@/lib/require-user';
import { grantCheckInCosmetics } from '@/lib/wardrobe-server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await claimDailyCheckInForUser(userId);
    let cosmetics: Awaited<ReturnType<typeof grantCheckInCosmetics>> | null = null;
    if (result.granted || result.alreadyClaimed) {
      try {
        cosmetics = await grantCheckInCosmetics(userId);
      } catch (err) {
        console.error('[points] check-in cosmetics failed', err);
      }
    }
    return NextResponse.json({ ...result, cosmetics });
  } catch (err) {
    console.error('[points] check-in failed', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
