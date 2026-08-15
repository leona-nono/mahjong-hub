import { getTranslations } from 'next-intl/server';
import type { GameConfig } from '@/data/games';
import GameCard from '@/components/GameCard';
import { Link } from '@/i18n/navigation';

export default async function GameCategoryRow({
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

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-portal-text sm:text-xl">
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
      <div className="portal-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {games.map((g) => (
          <div key={g.slug} className="w-[168px] shrink-0 sm:w-[200px]">
            <GameCard game={g} size="sm" />
          </div>
        ))}
      </div>
    </section>
  );
}
