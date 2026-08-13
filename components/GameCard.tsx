import { Link } from '@/i18n/navigation';
import type { GameConfig } from '@/data/games';

/** Category accent so the grid is scannable at a glance. */
const ACCENT: Record<string, string> = {
  'four-player': 'from-rose-400 via-amber-400 to-emerald-400',
  connect: 'from-sky-400 via-indigo-400 to-violet-400',
  solitaire: 'from-emerald-400 via-teal-400 to-sky-400',
  mahjong: 'from-amber-400 via-orange-400 to-rose-400',
  'tile-match': 'from-violet-400 via-pink-400 to-rose-400'
};

export default function GameCard({
  game,
  locale = 'en'
}: {
  game: GameConfig;
  locale?: string;
}) {
  // The parent (page) already passes a merged DB-overlay + localized game.
  // Re-localizing here would silently drop CMS edits (title/description), so
  // we trust the caller. `locale` is kept for API compatibility.
  const g = game;
  const isNative = g.gameType === 'native';
  const isComingSoon = g.gameType === 'coming-soon';

  return (
    <Link
      href={`/games/${g.slug}`}
      className="group block overflow-hidden rounded-2xl rainbow-card transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className={`relative h-24 bg-gradient-to-r opacity-80 transition group-hover:opacity-100 ${
          ACCENT[g.category] ?? 'rainbow-bar'
        }`}
      >
        {isComingSoon ? (
          <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            Coming Soon
          </span>
        ) : (
          isNative && (
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-700">
              Original
            </span>
          )
        )}
        {g.players && g.players > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold text-white">
            {g.players}P
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800">{g.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {g.description}
        </p>
      </div>
    </Link>
  );
}
