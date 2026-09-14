'use client';

import { useEffect, useState } from 'react';
import type { CoachIntensity } from '@/lib/mahjong/coach';

const KEY = 'mahjong-hub.coach-intensity.v1';

export function useCoachIntensity(): [CoachIntensity, (next: CoachIntensity) => void] {
  const [intensity, setIntensity] = useState<CoachIntensity>('ask');

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === 'silent' || saved === 'ask' || saved === 'live') setIntensity(saved);
  }, []);

  const update = (next: CoachIntensity) => {
    setIntensity(next);
    window.localStorage.setItem(KEY, next);
  };

  return [intensity, update];
}
