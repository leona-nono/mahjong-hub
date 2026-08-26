'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { APPEARANCES, applyAppearance, savedAppearance, type AppearanceId } from '@/lib/appearance';

function isAvailable(id: AppearanceId) {
  const item = APPEARANCES[id];
  if (!item.availableFrom || !item.availableUntil) return true;
  const today = new Date().toISOString().slice(0, 10);
  return today >= item.availableFrom && today <= item.availableUntil;
}

export default function AppearanceCabinet() {
  const t = useTranslations('wardrobe');
  const [selected, setSelected] = useState<AppearanceId>('jade');
  const ids = useMemo(
    () => (Object.keys(APPEARANCES) as AppearanceId[]).filter(isAvailable),
    []
  );
  useEffect(() => {
    const saved = savedAppearance();
    setSelected(isAvailable(saved) ? saved : 'jade');
  }, []);
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
