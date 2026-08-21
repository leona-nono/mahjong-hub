import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const TTL_MS = 10 * 60 * 1000;

export type RewardGrant = {
  userId: string;
  slot: string;
  itemType: string;
  nonce: string;
  exp: number;
};

function secret(): string {
  const s =
    process.env.AD_S2S_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    (process.env.NODE_ENV === 'production' ? '' : 'mahjong-hub-dev-insecure-secret');
  return s;
}

export function signGrant(grant: RewardGrant): string {
  const payload = Buffer.from(JSON.stringify(grant), 'utf8').toString('base64url');
  const mac = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

export function issueGrant(input: {
  userId: string;
  slot: string;
  itemType: string;
  now?: number;
}): { token: string; grant: RewardGrant } {
  const grant: RewardGrant = {
    userId: input.userId,
    slot: input.slot,
    itemType: input.itemType,
    nonce: randomBytes(16).toString('hex'),
    exp: (input.now ?? Date.now()) + TTL_MS
  };
  return { token: signGrant(grant), grant };
}

export function verifyGrant(
  token: string,
  expected: { userId: string; now?: number }
): { ok: true; grant: RewardGrant } | { ok: false; error: string } {
  if (!secret()) return { ok: false, error: 'not_configured' };
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, error: 'malformed' };
  const [payload, mac] = parts;
  const expectedMac = createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expectedMac);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: 'bad_signature' };
  }
  let grant: RewardGrant;
  try {
    grant = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as RewardGrant;
  } catch {
    return { ok: false, error: 'malformed' };
  }
  if (grant.userId !== expected.userId) return { ok: false, error: 'user_mismatch' };
  if (grant.exp < (expected.now ?? Date.now())) return { ok: false, error: 'expired' };
  if (!grant.nonce || !grant.slot || !grant.itemType) {
    return { ok: false, error: 'malformed' };
  }
  return { ok: true, grant };
}
