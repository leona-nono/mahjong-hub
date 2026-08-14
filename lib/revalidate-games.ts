import { revalidatePath } from 'next/cache';
import { routing } from '@/i18n/routing';

const GAME_LIST_PATHS = ['/games', '/games/classic', '/games/solitaire'];

/**
 * Mark every public page that renders game content stale so the next request
 * re-renders from the merged catalogue (static base + CMS overlay).
 *
 * Called after any admin write — create/update/delete of a game, its FAQs or
 * its features — so CMS edits appear on the frontend without waiting for the
 * ISR interval (`revalidate = 86400`) or a redeploy.
 *
 * @param slug The affected game. When omitted (new game) only the listing /
 *             home pages are purged, since the detail page does not exist yet.
 */
export function revalidateGamePaths(slug?: string) {
  const locales = routing.locales;
  for (const locale of locales) {
    revalidatePath(`/${locale}`); // home — renders featured/all games
    for (const path of GAME_LIST_PATHS) {
      revalidatePath(`/${locale}${path}`);
    }
    if (slug) revalidatePath(`/${locale}/games/${slug}`);
  }
  revalidatePath('/sitemap.xml');
}
