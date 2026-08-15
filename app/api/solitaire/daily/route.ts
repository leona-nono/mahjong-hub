import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/require-user';
import { dailyStateForUser, progressForUser } from '@/lib/solitaire-progress';

export async function GET() {
  const userId = await requireUserId();
  try {
    const daily = await dailyStateForUser(userId);
    if (!daily) {
      return NextResponse.json({ error: 'unavailable' }, { status: 503 });
    }
    const progress = userId ? await progressForUser(userId) : null;
    return NextResponse.json({ ...daily, progress });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
