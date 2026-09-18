'use client';

import { useEffect, useState } from 'react';
import type { CoachIntensity } from '@/lib/mahjong/coach';

const INTENSITY_KEY = 'mahjong-hub.coach-intensity.v1';
const REVEAL_KEY = 'mahjong-hub.coach-reveal-disclosed.v1';

export function useCoachIntensity(): [CoachIntensity, (next: CoachIntensity) => void] {
  const [intensity, setIntensity] = useState<CoachIntensity>('ask');

  useEffect(() => {
    const saved = window.localStorage.getItem(INTENSITY_KEY);
    if (saved === 'silent' || saved === 'ask' || saved === 'live') setIntensity(saved);
  }, []);

  const update = (next: CoachIntensity) => {
    setIntensity(next);
    window.localStorage.setItem(INTENSITY_KEY, next);
  };

  return [intensity, update];
}

/** Whether the settlement reveal disclosure has been shown once. */
export function useCoachRevealDisclosed(): [boolean, () => void] {
  const [disclosed, setDisclosed] = useState(false);

  useEffect(() => {
    setDisclosed(window.localStorage.getItem(REVEAL_KEY) === '1');
  }, []);

  const markDisclosed = () => {
    window.localStorage.setItem(REVEAL_KEY, '1');
    setDisclosed(true);
  };

  return [disclosed, markDisclosed];
}
