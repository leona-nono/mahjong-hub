'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  APPEARANCES,
  applyAppearance,
  freeAppearanceIds,
  readLocalOwnedAppearances,
  savedAppearance,
  type AppearanceId
} from '@/lib/appearance';

export default function AppearanceCabinet() {
  const t = useTranslations('wardrobe');
  const { status } = useSession();
  const [selected, setSelected] = useState<AppearanceId>('jade');
  const [owned, setOwned] = useState<AppearanceId[]>(() => freeAppearanceIds());

  useEffect(() => {
    const saved = savedAppearance();
    const local = readLocalOwnedAppearances();
    setOwned(local);
    setSelected(local.includes(saved) ? saved : 'jade');
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    void (async () => {
      try {
        const res = await fetch('/api/wardrobe', { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = (await res.json()) as { owned?: string[] };
        const next = (data.owned ?? []).filter(
          (id): id is AppearanceId => id in APPEARANCES
        );
        if (next.length) setOwned(next);
      } catch {
        /* keep local */
      }
    })();
  }, [status]);

  const ids = useMemo(() => owned, [owned]);

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            applyAppearance(id);
            setSelected(id);
          }}
          className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 ${
            selected === id ? 'border-[#1e554d] ring-2 ring-[#a8cfc5]' : 'border-[#d8d7cd]'
          }`}
        >
          <span
            className="block h-20 bg-cover bg-center"
            style={{ backgroundImage: `url('${APPEARANCES[id].table}')` }}
          />
          <span className="flex items-center justify-between bg-[#fffdf7] px-3 py-2 text-sm font-bold text-[#1d2a44]">
            {t(`items.${id}`)}
            {selected === id && <b className="text-[#1e554d]">✓</b>}
          </span>
        </button>
      ))}
    </div>
  );
}
