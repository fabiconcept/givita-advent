'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface HoverDepthProps {
  children: React.ReactNode;
  className?: string;
  /** Max tilt in degrees on each axis (default 4) */
  maxTilt?: number;
  /** Translate-Z lift in px on hover (default 4) */
  lift?: number;
  /** Scale on hover (default 1.015) */
  scale?: number;
  /** Return transition duration in ms (default 500) */
  duration?: number;
}

/**
 * Subtle 3D depth on hover. Tracks the mouse to tilt the element
 * toward the cursor, lifts it on the Z axis, and scales it slightly.
 * Lightweight: no re-renders, direct DOM updates.
 */
export function HoverDepth({
  children,
  className,
  maxTilt = 4,
  lift = 4,
  scale = 1.015,
  duration = 500,
}: HoverDepthProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (x - 0.5) * 2;
      const ry = (y - 0.5) * 2;
      const tiltX = -ry * maxTilt;
      const tiltY = rx * maxTilt;
      el.style.transition = 'none';
      el.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${lift}px) scale(${scale})`;
    },
    [maxTilt, lift, scale]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transition = `transform ${duration}ms ${ease}`;
    // Force a reflow so the new transition is committed before the
    // transform change, guaranteeing a smooth eased return instead of a snap.
    void el.offsetWidth;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
  }, [duration]);

  return (
    <div
      ref={ref}
      className={cn('transition-transform will-change-transform', className)}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
