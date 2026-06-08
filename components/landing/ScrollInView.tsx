'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type ScrollPreset =
  | 'fade'
  | 'slideUp' | 'slideDown'
  | 'slideLeft' | 'slideRight'
  | 'scaleIn'
  | 'rotateIn'
  | 'flipIn';

interface ScrollInViewProps {
  children: React.ReactNode;
  entrance?: ScrollPreset;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

const P: Record<string, { from: React.CSSProperties; to: React.CSSProperties }> = {
  fade:       { from: { opacity: 0 },                                          to: { opacity: 1 } },
  slideUp:    { from: { opacity: 0, transform: 'translateY(28px)' },            to: { opacity: 1, transform: 'translateY(0)' } },
  slideDown:  { from: { opacity: 0, transform: 'translateY(-28px)' },           to: { opacity: 1, transform: 'translateY(0)' } },
  slideLeft:  { from: { opacity: 0, transform: 'translateX(28px)' },            to: { opacity: 1, transform: 'translateX(0)' } },
  slideRight: { from: { opacity: 0, transform: 'translateX(-28px)' },           to: { opacity: 1, transform: 'translateX(0)' } },
  scaleIn:    { from: { opacity: 0, transform: 'scale(0.88)' },                 to: { opacity: 1, transform: 'scale(1)' } },
  rotateIn:   { from: { opacity: 0, transform: 'rotate(-5deg) scale(0.95)' },   to: { opacity: 1, transform: 'rotate(0) scale(1)' } },
  flipIn:     { from: { opacity: 0, transform: 'perspective(600px) rotateX(10deg) translateY(24px)' }, to: { opacity: 1, transform: 'perspective(600px) rotateX(0) translateY(0)' } },
};

export function ScrollInView({
  children,
  entrance = 'fade',
  className,
  delay = 0,
  duration = 700,
  threshold = 0.05,
  as: Tag = 'div',
}: ScrollInViewProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -2% 0px' }
    );

    io.observe(el);
    return () => { io.disconnect(); };
  }, [duration, delay, threshold]);

  const p = P[entrance] || P.fade;

  const Component = Tag as unknown as React.ElementType;
  return (
    <Component
      ref={ref}
      className={cn(className)}
      style={{
        ...(visible ? p.to : p.from),
        transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </Component>
  );
}
