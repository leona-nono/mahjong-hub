'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Scale a fixed-width board down to fit its frame (never upscale above 1). */
export function useBoardScale(designWidth = 980, container?: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = container?.current ?? null;
    const update = () => {
      const width = el && el.clientWidth > 0 ? el.clientWidth : window.innerWidth;
      setScale(Math.min(1, width / designWidth));
    };
    update();
    if (el && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [designWidth, container]);

  return scale;
}
