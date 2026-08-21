import { Link } from '@/i18n/navigation';
import type { GameConfig } from '@/data/games';

const ART: Record<string, { icon: string; label: string; tone: string }> = {
  'four-player': { icon: '🀄', label: 'TABLE', tone: 'from-[#234b50] to-[#4f8275]' },
  connect: { icon: '⌘', label: 'CONNECT', tone: 'from-[#285774] to-[#77a1a8]' },
  solitaire: { icon: '◈', label: 'SOLITAIRE', tone: 'from-[#6a5541] to-[#b99a64]' },
  mahjong: { icon: '◉', label: 'MAHJONG', tone: 'from-[#8d5146] to-[#c58c67]' },
  'tile-match': { icon: '✦', label: 'TILE MATCH', tone: 'from-[#515a78] to-[#9299a5]' }
};

export default function GameCard({ game }: { game: GameConfig }) {
  const isNative = game.gameType === 'native';

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-2xl rainbow-card transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2d756a]"
    >
      <div
        className={`relative flex h-28 items-center justify-center bg-gradient-to-br transition group-hover:brightness-110 ${ART[game.category]?.tone ?? 'from-[#2d756a] to-[#c9973d]'}`}
      >
        <span className="text-4xl text-white/95 drop-shadow-sm" aria-hidden="true">{ART[game.category]?.icon ?? '◈'}</span>
        <span className="absolute bottom-2 left-3 text-[10px] font-bold tracking-[.18em] text-white/80">{ART[game.category]?.label ?? 'PLAY'}</span>
        {isNative && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-700">
            Original
          </span>
        )}
        {game.players && game.players > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold text-white">
            {game.players}P
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800">{game.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {game.description}
        </p>
      </div>
    </Link>
  );
}
