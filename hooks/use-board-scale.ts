'use client';

import { useEffect, useState } from 'react';

/** Scale a fixed-width board down to fit the viewport (never upscale above 1). */
export function useBoardScale(designWidth = 980) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setScale(Math.min(1, width / designWidth));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [designWidth]);

  return scale;
}
