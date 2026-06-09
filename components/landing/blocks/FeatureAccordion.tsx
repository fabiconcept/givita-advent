'use client';

import { useState, useRef, useEffect, useCallback, type ComponentType } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

export function FeatureAccordion({
  features,
  autoRotate = false,
  autoRotateInterval = 6000,
  pauseAfterInteraction = 2500,
}: {
  features: { icon: ComponentType<{ className?: string }>; Illust: ComponentType<{ className?: string }>; title: string; body: string }[];
  autoRotate?: boolean;
  autoRotateInterval?: number;
  pauseAfterInteraction?: number;
}) {
  const [open, setOpen] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastInteraction = useRef(Date.now());
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback((i: number, isOpen: boolean) => {
    lastInteraction.current = Date.now();
    setOpen(isOpen ? -1 : i);
  }, []);

  useEffect(() => {
    if (!autoRotate || !inView) return;
    const id = setInterval(() => {
      if (Date.now() - lastInteraction.current < pauseAfterInteraction) return;
      setOpen((prev) => {
        const next = prev + 1;
        return next >= features.length ? 0 : next;
      });
    }, autoRotateInterval);
    return () => clearInterval(id);
  }, [autoRotate, autoRotateInterval, pauseAfterInteraction, features.length, inView]);

  return (
    <div ref={rootRef} className="mt-12 divide-y divide-border border-y border-border">
      {features.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.title}>
            <button
              type="button"
              onClick={() => handleClick(i, isOpen)}
              aria-expanded={isOpen}
              className="grid w-full grid-cols-[64px_1fr_24px] items-center gap-5 py-5 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className={cn('h-12 w-16 transition-all duration-300', isOpen ? 'text-foreground' : 'text-muted-foreground/70')}>
                <f.Illust className="h-full w-full" />
              </span>
              <span className="text-lg font-semibold">{f.title}</span>
              {isOpen ? <Minus className="h-4 w-4 text-muted-foreground" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
            </button>
            <div className={cn('grid grid-cols-[64px_1fr_24px] gap-5 overflow-hidden transition-all duration-500', isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0')}>
              <div />
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              <div />
            </div>
          </div>
        );
      })}
    </div>
  );
}
