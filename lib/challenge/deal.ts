import { createRng, shuffle } from '@/lib/mahjong/tiles';
import { questionsByKind } from './bank';
import type { ChallengeDeal, ChallengeQuestion, DealtQuestion } from './types';

const IDENTIFY_COUNT = 2;
const TERM_COUNT = 2;
const RULE_COUNT = 1;
const PICK_ATTEMPTS = 64;

function pickUnique(
  pool: ChallengeQuestion[],
  count: number,
  rng: () => number,
  used: Set<string>
): ChallengeQuestion[] {
  if (pool.length === 0 || count <= 0) return [];
  const available = pool.filter((q) => !used.has(q.id));
  const source = available.length >= count ? available : pool;

  for (let attempt = 0; attempt < PICK_ATTEMPTS; attempt += 1) {
    const copy = [...source];
    shuffle(copy, rng);
    const picked = copy.slice(0, Math.min(count, copy.length));
    if (picked.length === count || source.length < count) {
      for (const q of picked) used.add(q.id);
      return picked;
    }
  }

  // Deterministic fallback: stable id order, first N unused then wrap.
  const ordered = [...source].sort((a, b) => a.id.localeCompare(b.id));
  const out: ChallengeQuestion[] = [];
  for (const q of ordered) {
    if (out.length >= count) break;
    if (!used.has(q.id)) {
      used.add(q.id);
      out.push(q);
    }
  }
  let i = 0;
  while (out.length < count && ordered.length > 0) {
    const q = ordered[i % ordered.length]!;
    out.push(q);
    used.add(q.id);
    i += 1;
  }
  return out;
}

function withShuffledOptions(q: ChallengeQuestion, rng: () => number): DealtQuestion {
  const options = shuffle([...q.options], rng);
  return { ...q, options };
}

/**
 * Build today's (or shared) five-question deal from a numeric seed.
 * Never uses Math.random — same seed ⇒ same questions and option order.
 */
export function dealChallenge(seed: number): ChallengeDeal {
  const rng = createRng(seed >>> 0);
  const used = new Set<string>();

  const identify = pickUnique(questionsByKind('identify'), IDENTIFY_COUNT, rng, used);
  const term = pickUnique(questionsByKind('term'), TERM_COUNT, rng, used);
  const rule = pickUnique(questionsByKind('rule'), RULE_COUNT, rng, used);

  const ordered = [...identify, ...term, ...rule];
  const questions = ordered.map((q) => withShuffledOptions(q, rng));

  return { seed: seed >>> 0, questions };
}
