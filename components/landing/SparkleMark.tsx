'use client';

import { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingHeart {
  id: number;
  x: number;
  drift: number;
  duration: number;
  size: number;
  delay: number;
}

let nextId = 0;

export function SparkleMark({ className }: { className?: string }) {
  const [hovered, setHovered] = useState(false);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  function emit(count: number, e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const newHearts: FloatingHeart[] = Array.from({ length: count }, () => ({
      id: nextId++,
      x: originX,
      drift: (Math.random() - 0.5) * 140,
      duration: 1400 + Math.random() * 900,
      size: 10 + Math.random() * 8,
      delay: Math.random() * 120,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    setToast('thanks for stopping by ♡');
    window.setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.includes(h)));
    }, 2600);
  }

  return (
    <>
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => emit(7, e)}
        aria-label="A little easter egg"
        className={cn(
          'group relative inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/50 transition-all duration-300',
          'hover:scale-125 hover:text-primary',
          className
        )}
      >
        <span
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-500',
            hovered ? 'scale-[2.5] bg-primary/10' : 'scale-100 bg-transparent'
          )}
        />
        <Sparkles
          className={cn(
            'relative h-3 w-3 transition-transform duration-500',
            hovered && 'rotate-180'
          )}
        />
      </button>

      {hearts.map((h) => (
        <span
          key={h.id}
          className="pointer-events-none fixed z-[100]"
          style={{
            left: h.x,
            top: window.innerHeight - 40,
            animation: `easterHeart ${h.duration}ms cubic-bezier(0.2, 0.6, 0.3, 1) ${h.delay}ms forwards`,
            ['--drift' as string]: `${h.drift}px`,
          }}
        >
          <Heart
            className="text-primary"
            fill="currentColor"
            style={{ width: h.size, height: h.size }}
          />
        </span>
      ))}

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[101] -translate-x-1/2 animate-[slideUp_400ms_ease-out]">
          <div className="rounded-full border border-border bg-card/90 px-4 py-2 text-xs text-foreground shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] backdrop-blur">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
