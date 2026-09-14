'use client';

import { useRef, type ReactNode } from 'react';
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
  const frameRef = useRef<HTMLDivElement>(null);
  const scale = useBoardScale(designWidth, frameRef);
  const scaled = scale < 1;

  return (
    <div
      ref={frameRef}
      className={`w-full min-w-0 overflow-hidden ${className}`}
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
