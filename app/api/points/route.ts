import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/points
 *   Returns the authenticated user's authoritative points total from the
 *   database. Client store keeps using localStorage as an optimistic cache,
 *   but treats this response as the source of truth on each page load.
 *
 * POST /api/points
 *   Awards points server-side. Guards:
 *     • session required (401 otherwise — middleware also enforces this)
 *     • amount: positive integer ≤ 100
 *     • reason: must be in the whitelist (forwarded by client modules)
 *     • reason/day cap to limit blast radius of any client-side bug or
 *       abusive script (e.g. max 200 from `start_game` per day)
 *   Writes are wrapped in a transaction so the running total in
 *   UserPoint and the row in PointTransaction either both land or both
 *   roll back.
 */

const REASON_WHITELIST = [
  'start_game',
  'daily_visit',
  'leaderboard_view',
  'achievement'
] as const;
type Reason = (typeof REASON_WHITELIST)[number];

// Per-reason cap (points/day). Tuned low enough that an attacker
// scripting the API cannot drain anything meaningful, high enough that
// a real player never trips it.
const DAILY_CAP: Record<Reason, number> = {
  start_game: 200,
  daily_visit: 50,
  leaderboard_view: 0, // read-only, no points awarded
  achievement: 100
};

function isReason(value: unknown): value is Reason {
  return (
    typeof value === 'string' &&
    (REASON_WHITELIST as readonly string[]).includes(value)
  );
}

export async function GET() {
  const session = await auth();
  const userId = session?.user && (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const row = await prisma.userPoint.findUnique({ where: { userId } });
  return NextResponse.json({ total: row?.total ?? 0 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user && (session.user as { id?: string }).id;
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

  const amount = Number(b.amount);
  if (!Number.isInteger(amount) || amount <= 0 || amount > 100) {
    return NextResponse.json({ error: 'invalid amount' }, { status: 400 });
  }
  if (!isReason(b.reason)) {
    return NextResponse.json({ error: 'invalid reason' }, { status: 400 });
  }
  const gameSlug =
    typeof b.gameSlug === 'string' && b.gameSlug.length > 0 && b.gameSlug.length <= 64
      ? b.gameSlug
      : null;

  const cap = DAILY_CAP[b.reason];
  if (cap === 0) {
    return NextResponse.json({ error: 'reason does not award points' }, { status: 400 });
  }

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);

  const today = await prisma.pointTransaction.aggregate({
    where: { userId, reason: b.reason, createdAt: { gte: since } },
    _sum: { amount: true }
  });
  const used = today._sum.amount ?? 0;
  if (used + amount > cap) {
    return NextResponse.json(
      { error: 'daily cap exceeded', cap, used },
      { status: 429 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await prisma.$transaction(async (tx: any) => {
    const row = await tx.userPoint.upsert({
      where: { userId },
      create: { userId, total: amount },
      update: { total: { increment: amount } }
    });
    await tx.pointTransaction.create({
      data: { userId, amount, reason: b.reason, gameSlug }
    });
    return row;
  });

  return NextResponse.json({ total: updated.total, granted: true });
}