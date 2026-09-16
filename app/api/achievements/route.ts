import { NextResponse } from 'next/server';
import { rewardsMap } from '@/lib/achievements';
import { listAchievementsForUser } from '@/lib/achievements-server';
import { requireUserId } from '@/lib/require-user';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({
      unlocked: [] as string[],
      rewards: rewardsMap(),
      guest: true
    });
  }

  try {
    const { unlocked } = await listAchievementsForUser(userId);
    return NextResponse.json({
      unlocked,
      rewards: rewardsMap(),
      guest: false
    });
  } catch (err) {
    console.error('[achievements] list failed', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
