import { Link } from '@/i18n/navigation';
import type { GameConfig } from '@/data/games';

export default function GameCard({ game }: { game: GameConfig }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-2xl rainbow-card transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="rainbow-bar h-24 opacity-80 transition group-hover:opacity-100" />
      <div className="p-4">
        <h3 className="font-bold text-gray-800">{game.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {game.description}
        </p>
      </div>
    </Link>
  );
}
