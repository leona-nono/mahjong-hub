import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { AMERICAN_WALL, AMERICAN_PRACTICE_SEASONS, evaluateOriginalPracticeHand, getPracticeCard, replayAmericanActions, type AmericanGameState } from '@/lib/mahjong/american';

const VERSION = 'american-practice-replay-v1';
const secret = () => process.env.AMERICAN_REPLAY_SECRET ?? (process.env.NODE_ENV === 'production' ? '' : 'american-practice-dev-secret');
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const decode = <T,>(value: string) => JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

function hasPhysicalWall(state: AmericanGameState) {
  const actual = [...state.wall, ...state.players.flatMap((player) => [...player.hand, ...player.discards, ...player.melds.flatMap((meld) => meld.tiles)])].sort();
  return actual.length === AMERICAN_WALL.length && actual.every((tile, index) => tile === [...AMERICAN_WALL].sort()[index]);
}
function validState(state: unknown): state is AmericanGameState {
  if (!state || typeof state !== 'object') return false;
  const game = state as AmericanGameState;
  if (!AMERICAN_PRACTICE_SEASONS.some((season) => season.id === game.seasonId) || typeof game.initialCardId !== 'string' || !Array.isArray(game.actions) || !Array.isArray(game.activeCardIds) || !Array.isArray(game.players) || game.players.length !== 4 || !Array.isArray(game.wall)) return false;
  try { game.activeCardIds.forEach(getPracticeCard); } catch { return false; }
  if (!hasPhysicalWall(game)) return false;
  if (game.settlement?.winner !== undefined) {
    const winner = game.players[game.settlement.winner];
    if (!winner || !game.activeCardIds.some((cardId) => evaluateOriginalPracticeHand(getPracticeCard(cardId), [...winner.hand, ...winner.melds.flatMap((meld) => meld.tiles)]).valid)) return false;
  }
  return true;
}

/** Fields which must be reproduced exactly; the submitted event list itself is excluded. */
function replayProjection(game: AmericanGameState) {
  const { actions: _actions, ...projection } = game;
  return projection;
}
function strictlyReplays(state: unknown): state is AmericanGameState {
  if (!validState(state)) return false;
  try {
    const replayed = replayAmericanActions(state);
    return JSON.stringify(replayProjection(replayed)) === JSON.stringify(replayProjection(state));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const key = secret();
  if (!key) return NextResponse.json({ error: 'replay_signing_unavailable' }, { status: 503 });
  let body: { action?: string; state?: unknown; token?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  if (body.action === 'issue') {
    if (!strictlyReplays(body.state)) return NextResponse.json({ error: 'invalid_replay_state' }, { status: 400 });
    const payload = encode({ v: VERSION, exp: Date.now() + 1000 * 60 * 60 * 24 * 30, state: body.state });
    return NextResponse.json({ token: `${payload}.${sign(payload)}` });
  }
  if (body.action === 'verify' && typeof body.token === 'string') {
    const [payload, signature] = body.token.split('.');
    if (!payload || !signature) return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
    const expected = sign(payload);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
    try {
      const decoded = decode<{ v: string; exp: number; state: unknown }>(payload);
      if (decoded.v !== VERSION || decoded.exp < Date.now() || !strictlyReplays(decoded.state)) return NextResponse.json({ error: 'invalid_replay' }, { status: 400 });
      return NextResponse.json({ state: decoded.state });
    } catch { return NextResponse.json({ error: 'invalid_token' }, { status: 400 }); }
  }
  return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
}
