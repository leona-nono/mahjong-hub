import { NextRequest, NextResponse } from 'next/server';
import { AMERICAN_PRACTICE_SEASONS, ORIGINAL_PRACTICE_CARDS } from '@/lib/mahjong/american';
import { validateAmericanCardDraft, type AmericanCardDraft } from '@/lib/mahjong/american-card-validator';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const drafts = await prisma.americanPracticeCard.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ cards: ORIGINAL_PRACTICE_CARDS, seasons: AMERICAN_PRACTICE_SEASONS, drafts });
  } catch {
    // The static, reviewed card catalog remains usable before the migration is
    // applied; saving is intentionally unavailable rather than silently lost.
    return NextResponse.json({ cards: ORIGINAL_PRACTICE_CARDS, seasons: AMERICAN_PRACTICE_SEASONS, drafts: [], persistenceAvailable: false });
  }
}

/** Validates and saves product-owned card drafts; publication remains reviewed. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  let payload: { action?: string; draft?: unknown } | unknown;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const isEnvelope = Boolean(payload && typeof payload === 'object' && ('action' in payload || 'draft' in payload));
  const envelope = isEnvelope ? payload as { action?: string; draft?: unknown } : undefined;
  const draft = envelope?.draft ?? payload;
  const result = validateAmericanCardDraft(draft as Parameters<typeof validateAmericanCardDraft>[0]);
  if (!result.valid || envelope?.action !== 'save') return NextResponse.json(result, { status: result.valid ? 200 : 400 });
  const card = draft as AmericanCardDraft;
  try {
    const saved = await prisma.americanPracticeCard.upsert({
      where: { id: card.id },
      create: { id: card.id, version: card.version, title: card.title, difficulty: card.difficulty, points: card.points, description: card.description, groups: card.groups as object[], concealed: Boolean(card.concealed), status: card.status ?? 'draft', seasonIds: card.seasonIds ?? [] },
      update: { version: card.version, title: card.title, difficulty: card.difficulty, points: card.points, description: card.description, groups: card.groups as object[], concealed: Boolean(card.concealed), status: card.status ?? 'draft', seasonIds: card.seasonIds ?? [] }
    });
    return NextResponse.json({ ...result, saved }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'persistence_unavailable', message: 'Apply the AmericanPracticeCard migration before saving drafts.' }, { status: 503 });
  }
}
