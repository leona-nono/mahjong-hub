import { SITE_BASE_URL } from '@/lib/seo';

const HOST = SITE_BASE_URL.replace(/^https?:\/\//, '');

export function privacyEmail(): string {
  return process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || 'privacy@mahjonggame.org';
}

/**
 * IAB ads.txt 1.1 for the publisher origin.
 * Extra DIRECT/RESELLER rows come from ADS_TXT_ROWS (newline-separated)
 * and optionally a Google AdSense publisher id.
 */
export function buildAdsTxt(): string {
  const lines = [
    `# ads.txt for ${HOST}`,
    `# IAB Tech Lab ads.txt 1.1`,
    `OWNERDOMAIN=${HOST}`,
    `MANAGERDOMAIN=${HOST}`,
    `CONTACT=${privacyEmail()}`,
    '# Authorized digital sellers. Uncomment / add rows when an ad network is live.'
  ];

  const pub = process.env.ADSENSE_PUB_ID?.trim();
  if (pub) {
    lines.push(`google.com, ${pub}, DIRECT, f08c47fec0942fa0`);
  }

  const extra = process.env.ADS_TXT_ROWS?.trim();
  if (extra) {
    for (const row of extra.split(/\r?\n/)) {
      const trimmed = row.trim();
      if (trimmed && !trimmed.startsWith('#')) lines.push(trimmed);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/** IAB sellers.json 1.0 — we sell only our own inventory (publisher). */
export function buildSellersJson(): Record<string, unknown> {
  return {
    contact_email: privacyEmail(),
    contact_address: HOST,
    version: '1.0',
    identifiers: [
      {
        name: 'Mahjong Hub',
        value: HOST
      }
    ],
    sellers: [
      {
        seller_id: HOST,
        name: 'Mahjong Hub',
        domain: HOST,
        seller_type: 'PUBLISHER',
        is_confidential: 0
      }
    ]
  };
}
