import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { START_GAME_POINTS } from '@/lib/points-rules';
import { checkinStateForUser, grantFirstLoginIfNeeded } from '@/lib/points-server';

async function requireUserId() {
  const session = await auth();
  const userId = session?.user && (session.user as { id?: string }).id;
  return userId || null;
}

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

// Browser-only game state cannot prove a win. Game-win points will return only
// after the server match service issues a one-time settlement receipt.
const AWARD_REASONS = ['start_game'] as const;
type AwardReason = (typeof AWARD_REASONS)[number];

const DAILY_CAP: Record<AwardReason, number> = {
  start_game: 50,
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

  const gameSlug = null;
  const amount = START_GAME_POINTS;

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
