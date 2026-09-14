export type BlogClusterId = 'learn' | 'variants' | 'play' | 'culture' | 'buy';

export type BlogCluster = {
  id: BlogClusterId;
  pillar: string;
  members: string[];
  /** Buying guides stay linked, but the list page does not highlight them. */
  muted?: boolean;
};

export const BLOG_CLUSTERS: BlogCluster[] = [
  {
    id: 'learn',
    pillar: 'what-is-mahjong',
    members: [
      'how-to-play-mahjong',
      'mahjong-rules-beginners-complete-guide',
      'mahjong-tiles-meaning-guide',
      'mahjong-scoring-system-explained'
    ]
  },
  {
    id: 'variants',
    pillar: 'types-of-mahjong-games',
    members: ['american-vs-chinese-mahjong']
  },
  {
    id: 'play',
    pillar: 'how-to-win-mahjong',
    members: ['how-to-play-mahjong-online']
  },
  {
    id: 'culture',
    pillar: 'mahjong-history-cultural-guide',
    members: ['mahjong-etiquette-tips']
  },
  {
    id: 'buy',
    pillar: 'best-mahjong-sets-for-beginners',
    members: ['where-to-buy-mahjong-set'],
    muted: true
  }
];

const CTA_HREF: Record<string, string> = {
  'mahjong-tiles-meaning-guide': '/games/mahjong-solitaire-classic',
  'mahjong-rules-beginners-complete-guide': '/games/hong-kong-mahjong',
  'how-to-play-mahjong': '/games/hong-kong-mahjong',
  'what-is-mahjong': '/games/hong-kong-mahjong',
  'mahjong-scoring-system-explained': '/games/hong-kong-mahjong',
  'how-to-win-mahjong': '/games/hong-kong-mahjong',
  'types-of-mahjong-games': '/games/classic',
  'american-vs-chinese-mahjong': '/games/classic'
};

/** Cross-cluster bridge, rendered as one inline link in the second paragraph. */
const BRIDGE: Record<string, string> = {
  'mahjong-tiles-meaning-guide': 'mahjong-scoring-system-explained',
  'mahjong-rules-beginners-complete-guide': 'types-of-mahjong-games',
  'mahjong-scoring-system-explained': 'how-to-win-mahjong',
  'what-is-mahjong': 'types-of-mahjong-games',
  'how-to-play-mahjong': 'mahjong-tiles-meaning-guide',
  'types-of-mahjong-games': 'what-is-mahjong',
  'how-to-win-mahjong': 'mahjong-scoring-system-explained',
  'how-to-play-mahjong-online': 'what-is-mahjong',
  'american-vs-chinese-mahjong': 'types-of-mahjong-games',
  'mahjong-history-cultural-guide': 'what-is-mahjong',
  'mahjong-etiquette-tips': 'how-to-play-mahjong',
  'best-mahjong-sets-for-beginners': 'mahjong-tiles-meaning-guide',
  'where-to-buy-mahjong-set': 'best-mahjong-sets-for-beginners'
};

export function clusterOf(slug: string): BlogCluster | undefined {
  return BLOG_CLUSTERS.find((cluster) => cluster.pillar === slug || cluster.members.includes(slug));
}

export function clusterSlugs(cluster: BlogCluster): string[] {
  return [cluster.pillar, ...cluster.members];
}

export function ctaHrefFor(slug: string, fallback = '/games/classic'): string {
  return CTA_HREF[slug] ?? fallback;
}

export function bridgeSlug(slug: string): string | undefined {
  return BRIDGE[slug];
}

export function relatedSlugs(slug: string, limit = 3): string[] {
  const cluster = clusterOf(slug);
  const picked: string[] = [];
  if (cluster) {
    for (const candidate of clusterSlugs(cluster)) {
      if (candidate !== slug) picked.push(candidate);
    }
  }
  const bridge = bridgeSlug(slug);
  if (bridge && !picked.includes(bridge)) picked.push(bridge);
  if (picked.length < limit) {
    for (const cluster of BLOG_CLUSTERS) {
      for (const candidate of clusterSlugs(cluster)) {
        if (candidate !== slug && !picked.includes(candidate)) picked.push(candidate);
        if (picked.length >= limit) return picked.slice(0, limit);
      }
    }
  }
  return picked.slice(0, limit);
}
