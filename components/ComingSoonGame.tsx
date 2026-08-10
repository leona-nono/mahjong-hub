import type { GameConfig } from '@/data/games';

export default function ComingSoonGame({ game }: { game: GameConfig }) {
  return (
    <section className="rounded-3xl border border-amber-200 bg-white/80 p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">??</div>
      <h2 className="text-xl font-black text-slate-800">{game.title} ? Coming soon</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        This ruleset is being implemented as an in-house game engine. The page will
        include a complete rules guide, AI opponents, scoring, and replay support.
      </p>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
        Rules research in progress
      </p>
    </section>
  );
}
