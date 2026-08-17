import { revalidatePath, revalidateTag } from 'next/cache';
import { routing } from '@/i18n/routing';
import { games } from '@/data/games';
import { getBlogPosts } from '@/data/blog';

export function revalidateSiteSettings() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/games`);
    revalidatePath(`/${locale}/games/classic`);
    revalidatePath(`/${locale}/games/solitaire`);
    revalidatePath(`/${locale}/blog`);

    for (const game of games) {
      revalidatePath(`/${locale}/games/${game.slug}`);
    }
    for (const post of getBlogPosts()) {
      revalidatePath(`/${locale}/blog/${post.slug}`);
    }
  }

  revalidatePath('/api/public/analytics');
  revalidatePath('/sitemap.xml');
  revalidateTag('site-settings');
}
