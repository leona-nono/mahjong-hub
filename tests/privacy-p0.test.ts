import { describe, expect, it } from 'vitest';
import { buildAdsTxt, buildSellersJson } from '@/lib/ads-inventory';
import { issueGrant, verifyGrant } from '@/lib/reward-token';
import { colorblindLabel, colorblindMark } from '@/lib/colorblind-mark';
import { adsQuietForFirstVisit } from '@/lib/flags';

describe('ads.txt / sellers.json', () => {
  it('emits IAB owner and contact lines', () => {
    const body = buildAdsTxt();
    expect(body).toContain('OWNERDOMAIN=mahjonggame.org');
    expect(body).toContain('CONTACT=privacy@mahjonggame.org');
    expect(body).not.toContain('google.com');
  });

  it('lists the site as a PUBLISHER in sellers.json', () => {
    const json = buildSellersJson();
    expect(json.version).toBe('1.0');
    const sellers = json.sellers as Array<{ seller_type: string; domain: string }>;
    expect(sellers[0].seller_type).toBe('PUBLISHER');
    expect(sellers[0].domain).toBe('mahjonggame.org');
  });
});

describe('reward S2S token', () => {
  it('round-trips a signed grant', () => {
    const { token, grant } = issueGrant({
      userId: 'user-1',
      slot: 'solitaire_tool',
      itemType: 'hint',
      now: 1_000
    });
    const verified = verifyGrant(token, { userId: 'user-1', now: 2_000 });
    expect(verified.ok).toBe(true);
    if (verified.ok) expect(verified.grant.nonce).toBe(grant.nonce);
  });

  it('rejects the wrong user and expiry', () => {
    const { token } = issueGrant({
      userId: 'user-1',
      slot: 'solitaire_tool',
      itemType: 'hint',
      now: 1_000
    });
    expect(verifyGrant(token, { userId: 'other', now: 2_000 }).ok).toBe(false);
    expect(verifyGrant(token, { userId: 'user-1', now: 1_000 + 11 * 60 * 1000 }).ok).toBe(
      false
    );
    expect(verifyGrant('not-a-token', { userId: 'user-1' }).ok).toBe(false);
  });
});

describe('colorblind marks', () => {
  it('encodes suits as letters independent of color', () => {
    expect(colorblindMark('m5')).toEqual({ suit: 'C', rank: '5' });
    expect(colorblindMark('p9')).toEqual({ suit: 'D', rank: '9' });
    expect(colorblindMark('s1')).toEqual({ suit: 'B', rank: '1' });
    expect(colorblindLabel('z1')).toBe('E');
    expect(colorblindLabel('z7')).toBe('R');
    expect(colorblindLabel('f2')).toBe('Sn2');
    expect(colorblindLabel('f6')).toBe('Fl6');
  });
});

describe('first-day ad quiet', () => {
  it('stays quiet for 24h after first seen', () => {
    expect(adsQuietForFirstVisit(0, 1000)).toBe(true);
    expect(adsQuietForFirstVisit(1000, 1000 + 60_000)).toBe(true);
    expect(adsQuietForFirstVisit(1000, 1000 + 25 * 60 * 60 * 1000)).toBe(false);
  });
});
