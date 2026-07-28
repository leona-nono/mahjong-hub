export type GameCategory = 'mahjong' | 'connect' | 'solitaire' | 'tile-match';

export interface GameConfig {
  /** URL-safe unique id, also used as the game page slug. */
  slug: string;
  /** Display id (for reference). */
  pageName: string;
  /** English display title (used as default; localized via page copy). */
  title: string;
  /** English short description (default; localized via page copy). */
  description: string;
  category: GameCategory;
  gameType: 'iframe';
  /** External embed URL (verified embeddable: no X-Frame-Options / CSP frame-ancestors). */
  gameIframeUrl: string;
  /** Highlight on the home page. */
  featured?: boolean;
}

/**
 * Curated mahjong elimination collection.
 * Embed URLs are external game hosts (1games.io / Google GameSnacks) that were
 * technically verified as iframe-embeddable. These are facts (links), not copied code.
 */
export const games: GameConfig[] = [
  {
    slug: 'mahjong-connect',
    pageName: 'mahjong-connect',
    title: 'Mahjong Connect',
    description:
      'Match pairs of free mahjong tiles connected by a path. A relaxing connect-style elimination game.',
    category: 'connect',
    gameType: 'iframe',
    gameIframeUrl: 'https://1games.io/embed/mahjong-connect',
    featured: true
  },
  {
    slug: 'mahjong-classic',
    pageName: 'mahjong-classic',
    title: 'Mahjong Classic',
    description:
      'The timeless mahjong solitaire. Clear the board by matching open tile pairs.',
    category: 'mahjong',
    gameType: 'iframe',
    gameIframeUrl:
      'https://mahjongclassic.h5games.usercontent.goog/v/390ce075-68ea-41ab-b192-b120b5647b61/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks',
    featured: true
  },
  {
    slug: 'mahjong-solitaire',
    pageName: 'mahjong-solitaire',
    title: 'Mahjong Solitaire',
    description:
      'A beautiful solitaire layout of mahjong tiles. Match and clear the tower at your own pace.',
    category: 'solitaire',
    gameType: 'iframe',
    gameIframeUrl:
      'https://4erks8385j9eo.h5games.usercontent.goog/v/1ff4p4m8ilme8/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks',
    featured: true
  },
  {
    slug: 'mahjong-3d',
    pageName: 'mahjong-3d',
    title: 'Mahjong 3D',
    description:
      'A three-dimensional take on mahjong matching with depth and a calm rainbow palette.',
    category: 'mahjong',
    gameType: 'iframe',
    gameIframeUrl:
      'https://mahjong3d.h5games.usercontent.goog/v/eba0837e-4855-4bb2-b762-5dd6d8982cac/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'onet-connect-classic',
    pageName: 'onet-connect-classic',
    title: 'Onet Connect Classic',
    description:
      'The classic Onet link game. Connect identical tiles with a line of at most two turns.',
    category: 'connect',
    gameType: 'iframe',
    gameIframeUrl:
      'https://onetconnectclassic.h5games.usercontent.goog/v/3548fcd4-da1a-47bd-ac18-01488239c660/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'bee-connect',
    pageName: 'bee-connect',
    title: 'Bee Connect',
    description:
      'A cute bee-themed connect game. Link the little tiles and clear the honeycomb board.',
    category: 'connect',
    gameType: 'iframe',
    gameIframeUrl:
      'https://beeconnect.h5games.usercontent.goog/v/06c7e297-3e6d-4512-9fb2-e491ae2b2fb9/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'aloha-mahjong',
    pageName: 'aloha-mahjong',
    title: 'Aloha Mahjong',
    description:
      'A tropical twist on mahjong matching with a sunny, laid-back vibe.',
    category: 'mahjong',
    gameType: 'iframe',
    gameIframeUrl:
      'https://02ef7fb7guapg.h5games.usercontent.goog/v/13knu9k9rm8go/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: '8x8-match-tiles',
    pageName: '8x8-match-tiles',
    title: '8x8 Match Tiles',
    description:
      'A compact 8x8 tile-match puzzle. Connect same tiles and chase the high score.',
    category: 'tile-match',
    gameType: 'iframe',
    gameIframeUrl:
      'https://75njrrvim9kq0.h5games.usercontent.goog/v/1v57mtiv2ele0/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'tile-guru',
    pageName: 'tile-guru',
    title: 'Tile Guru',
    description:
      'A zen tile-matching puzzle. Find and connect matching tiles in a soothing layout.',
    category: 'tile-match',
    gameType: 'iframe',
    gameIframeUrl:
      'https://5en3tugq69tdo.h5games.usercontent.goog/v/4pu6to0p0cgrg/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  },
  {
    slug: 'tile-journey',
    pageName: 'tile-journey',
    title: 'Tile Journey',
    description:
      'A journey through tile-matching levels. Plan your connections and clear each board.',
    category: 'tile-match',
    gameType: 'iframe',
    gameIframeUrl:
      'https://0i1jh8boqif48.h5games.usercontent.goog/v/1643ot8on0v9g/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks'
  }
];

export function getGames(): GameConfig[] {
  return games;
}

export function getGame(slug: string): GameConfig | undefined {
  return games.find((g) => g.slug === slug);
}

export function getFeaturedGames(): GameConfig[] {
  return games.filter((g) => g.featured);
}

export function getRelatedGames(slug: string, limit = 4): GameConfig[] {
  return games.filter((g) => g.slug !== slug).slice(0, limit);
}
