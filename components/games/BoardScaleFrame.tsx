'use client';

import type { ReactNode } from 'react';
import { useBoardScale } from '@/hooks/use-board-scale';

export default function BoardScaleFrame({
  designWidth = 980,
  designHeight,
  children,
  className = ''
}: {
  designWidth?: number;
  designHeight: number;
  children: ReactNode;
  className?: string;
}) {
  const scale = useBoardScale(designWidth);
  const scaled = scale < 1;

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={scaled ? { height: designHeight * scale } : undefined}
    >
      <div
        className="origin-top-left"
        style={{
          width: scaled ? designWidth : '100%',
          minWidth: designWidth,
          transform: scaled ? `scale(${scale})` : undefined
        }}
      >
        {children}
      </div>
    </div>
  );
}
