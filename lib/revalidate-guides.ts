import { revalidatePath } from 'next/cache';
import { routing } from '@/i18n/routing';

export function revalidateGuidePaths(slug?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/blog`);
    revalidatePath(`/${locale}/games/beginners`);
    if (slug) {
      revalidatePath(`/${locale}/blog/${slug}`);
      revalidatePath(`/${locale}/games/beginners/${slug}`);
    }
  }
  revalidatePath('/sitemap.xml');
}
