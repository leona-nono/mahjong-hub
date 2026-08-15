import { Link } from '@/i18n/navigation';
import type { GameConfig } from '@/data/games';
import { resolveGameCover } from '@/lib/game-cover';

export default function GameCard({
  game,
  size = 'md'
}: {
  game: GameConfig;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const cover = resolveGameCover(game);
  const isComingSoon = game.gameType === 'coming-soon';
  const isNative = game.gameType === 'native';
  const aspect =
    size === 'lg' ? 'aspect-[16/10]' : size === 'sm' ? 'aspect-[16/11]' : 'aspect-[16/10]';

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-portal-accent"
    >
      <div
        className={`relative overflow-hidden rounded-xl border border-portal-border bg-portal-panel shadow-portal ${aspect}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
          <h3 className="font-display text-sm font-semibold leading-snug text-white line-clamp-2 sm:text-base">
            {game.title}
          </h3>
        </div>
        {isComingSoon ? (
          <span className="absolute left-2 top-2 rounded-md bg-amber-400/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">
            Soon
          </span>
        ) : (
          isNative && (
            <span className="absolute left-2 top-2 rounded-md bg-portal-accent/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">
              Original
            </span>
          )
        )}
        {game.players && game.players > 1 && (
          <span className="absolute right-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {game.players}P
          </span>
        )}
      </div>
    </Link>
  );
}
