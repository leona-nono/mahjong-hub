import { NextResponse } from 'next/server';
import { APPEARANCES, appearanceOf, freeAppearanceIds, type AppearanceId } from '@/lib/appearance';
import { requireUserId } from '@/lib/require-user';
import {
  craftAppearanceWithFragments,
  fragmentBalance,
  listOwnedAppearances,
  redeemAppearanceWithPoints
} from '@/lib/wardrobe-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({
      owned: freeAppearanceIds(),
      fragments: {} as Record<string, number>,
      guest: true
    });
  }

  try {
    const owned = await listOwnedAppearances(userId);
    const fragmentIds = [
      ...new Set(
        (Object.keys(APPEARANCES) as AppearanceId[])
          .map((id) => appearanceOf(id).fragmentId)
          .filter((id): id is string => Boolean(id))
      )
    ];
    const fragments: Record<string, number> = {};
    await Promise.all(
      fragmentIds.map(async (id) => {
        fragments[id] = await fragmentBalance(userId, id);
      })
    );
    return NextResponse.json({ owned, fragments, guest: false });
  } catch (err) {
    console.error('[wardrobe] list failed', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { appearanceId?: string; action?: string };
  try {
    body = (await req.json()) as { appearanceId?: string; action?: string };
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const appearanceId = body.appearanceId;
  if (!appearanceId || !(appearanceId in APPEARANCES)) {
    return NextResponse.json({ error: 'unknown_appearance' }, { status: 400 });
  }
  const id = appearanceId as AppearanceId;
  const action = body.action === 'craft' ? 'craft' : 'redeem';

  try {
    if (action === 'craft') {
      const result = await craftAppearanceWithFragments(userId, id);
      if (!result.ok) {
        const status =
          result.error === 'insufficient'
            ? 402
            : result.error === 'already_owned'
              ? 409
              : 400;
        return NextResponse.json(result, { status });
      }
      return NextResponse.json(result);
    }

    const result = await redeemAppearanceWithPoints(userId, id);
    if (!result.ok) {
      const status =
        result.error === 'insufficient'
          ? 402
          : result.error === 'already_owned'
            ? 409
            : 400;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error('[wardrobe] redeem failed', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
