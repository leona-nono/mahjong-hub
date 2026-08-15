import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/require-user';
import { completeSolitaireForUser } from '@/lib/solitaire-progress';

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { error: 'unauthorized', guest: true, awarded: false },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const b = body as {
    levelId?: unknown;
    seed?: unknown;
    score?: unknown;
    itemUses?: unknown;
    durationMs?: unknown;
  };

  if (typeof b.levelId !== 'string' || b.levelId.length > 32) {
    return NextResponse.json({ error: 'invalid_level' }, { status: 400 });
  }

  try {
    const result = await completeSolitaireForUser(userId, {
      levelId: b.levelId,
      seed: Number(b.seed),
      score: Number(b.score),
      itemUses: Number(b.itemUses),
      durationMs: Number(b.durationMs)
    });
    if (!result.ok) {
      const status = result.error === 'unknown_level' ? 404 : 400;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
