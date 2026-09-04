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
    // Do not fall back to English CMS copy for translated locales — that left
    // CJK/EU game pages with English "About" bodies while chrome looked localized.
    if (feature?.content?.trim()) return feature.content;
    return null;
  } catch {
    return null;
  }
}
