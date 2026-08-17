import 'server-only';
import { prisma } from '@/lib/db';
import { cmsLocaleForSite } from '@/lib/cms-locale';

export async function getGameFeatureMarkdown(
  slug: string,
  locale: string
): Promise<string | null> {
  const cmsLocale = cmsLocaleForSite(locale);
  try {
    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true }
    });
    if (!game) return null;

    const feature = await prisma.gameFeature.findUnique({
      where: { gameId_locale: { gameId: game.id, locale: cmsLocale } },
      select: { content: true }
    });
    if (feature?.content?.trim()) return feature.content;

    if (cmsLocale !== 'en') {
      const fallback = await prisma.gameFeature.findUnique({
        where: { gameId_locale: { gameId: game.id, locale: 'en' } },
        select: { content: true }
      });
      return fallback?.content?.trim() || null;
    }

    return null;
  } catch {
    return null;
  }
}
