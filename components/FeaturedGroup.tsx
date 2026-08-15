import { getTranslations } from 'next-intl/server';
import type { GameConfig } from '@/data/games';
import GameCard from '@/components/GameCard';
import { Link } from '@/i18n/navigation';

/** 1 large + up to 4 small cards — FaFaFa GameGroup pattern. */
export default async function FeaturedGroup({
  title,
  href,
  games
}: {
  title: string;
  href?: string;
  games: GameConfig[];
}) {
  if (!games.length) return null;
  const t = await getTranslations('portal');
  const [hero, ...rest] = games;
  const side = rest.slice(0, 4);

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-portal-text sm:text-2xl">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-sm font-medium text-portal-accent hover:underline"
          >
            {t('viewAll')}
          </Link>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <GameCard game={hero} size="lg" />
        <div className="grid grid-cols-2 gap-3">
          {side.map((g) => (
            <GameCard key={g.slug} game={g} size="sm" />
          ))}
        </div>
      </div>
    </section>
  );
}
