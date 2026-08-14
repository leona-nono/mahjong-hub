import { NextResponse } from 'next/server';
import { claimDailyCheckInForUser } from '@/lib/points-server';
import { requireUserId } from '@/lib/require-user';

export async function POST() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await claimDailyCheckInForUser(userId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
