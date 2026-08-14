import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GAME_WIN_MAX, START_GAME_POINTS } from '@/lib/points-rules';
import { checkinStateForUser, grantFirstLoginIfNeeded } from '@/lib/points-server';
import { requireUserId } from '@/lib/require-user';

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    await grantFirstLoginIfNeeded(userId);
    const row = await prisma.userPoint.findUnique({ where: { userId } });
    const checkIn = await checkinStateForUser(userId);
    return NextResponse.json({
      total: row?.total ?? 0,
      checkIn
    });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}

const AWARD_REASONS = ['start_game', 'game_win'] as const;
type AwardReason = (typeof AWARD_REASONS)[number];

const DAILY_CAP: Record<AwardReason, number> = {
  start_game: 50,
  game_win: 200
};

function isAwardReason(value: unknown): value is AwardReason {
  return (
    typeof value === 'string' &&
    (AWARD_REASONS as readonly string[]).includes(value)
  );
}

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
  const b = body as { amount?: unknown; reason?: unknown; gameSlug?: unknown };

  if (!isAwardReason(b.reason)) {
    return NextResponse.json({ error: 'invalid reason' }, { status: 400 });
  }
  const reason = b.reason;

  const gameSlug =
    typeof b.gameSlug === 'string' && b.gameSlug.length > 0 && b.gameSlug.length <= 64
      ? b.gameSlug
      : null;

  if (reason === 'game_win' && !gameSlug) {
    return NextResponse.json({ error: 'gameSlug required' }, { status: 400 });
  }

  const amount =
    reason === 'start_game'
      ? START_GAME_POINTS
      : Math.min(GAME_WIN_MAX, Math.max(1, Math.floor(Number(b.amount) || 0)));

  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: 'invalid amount' }, { status: 400 });
  }

  const cap = DAILY_CAP[reason];
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);

  try {
    const today = await prisma.pointTransaction.aggregate({
      where: { userId, reason, createdAt: { gte: since } },
      _sum: { amount: true }
    });
    const used = today._sum.amount ?? 0;
    if (used + amount > cap) {
      const row = await prisma.userPoint.findUnique({ where: { userId } });
      return NextResponse.json(
        { error: 'daily cap exceeded', cap, used, total: row?.total ?? 0, granted: false },
        { status: 429 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.userPoint.upsert({
        where: { userId },
        create: { userId, total: amount },
        update: { total: { increment: amount } }
      });
      await tx.pointTransaction.create({
        data: { userId, amount, reason, gameSlug }
      });
      return row;
    });

    return NextResponse.json({ total: updated.total, granted: true, amount });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
