import { NextResponse } from 'next/server';
import { pointsSnapshotForUser } from '@/lib/points-server';
import { requireUserId } from '@/lib/require-user';

export const dynamic = 'force-dynamic';

/** Check-in / streak snapshot. Points currency awards are removed. */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const snapshot = await pointsSnapshotForUser(userId);
    return NextResponse.json(snapshot);
  } catch (err) {
    console.error('[points] GET failed', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
