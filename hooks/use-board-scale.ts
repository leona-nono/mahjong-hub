'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Fit a fixed-size board inside the available frame. Never scale above 1.
 * Height is ignored when it was not requested, or when the frame has not been
 * laid out yet (clientHeight 0), so the result cannot collapse to 0.
 */
export function boardScale(
  width: number,
  height: number,
  designWidth: number,
  designHeight?: number
): number {
  const widthRatio = width / designWidth;
  const heightRatio =
    designHeight && height > 0 ? height / designHeight : Number.POSITIVE_INFINITY;
  return Math.min(1, widthRatio, heightRatio);
}

export function useBoardScale(
  designWidth = 980,
  designHeight?: number,
  container?: RefObject<HTMLElement | null>
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = container?.current ?? null;

    const apply = (width: number, height: number) => {
      const safeWidth = width > 0 ? width : window.innerWidth;
      setScale(boardScale(safeWidth, height, designWidth, designHeight));
    };

    const measure = () => {
      const width = el && el.clientWidth > 0 ? el.clientWidth : window.innerWidth;
      const height = el ? el.clientHeight : 0;
      apply(width, height);
    };

    measure();

    if (el && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (!rect) {
          measure();
          return;
        }
        apply(rect.width, rect.height);
      });
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [designWidth, designHeight, container]);

  return scale;
}
