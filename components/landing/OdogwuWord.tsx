'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const VARIANTS = ['Ọdọgwụ', 'Odogwu', 'O-dog-wu', 'Ọ́dọ́gwụ́'];

export function OdogwuWord({ className }: { className?: string }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!hovered) return;
    setShowTooltip(true);
    const t = window.setTimeout(() => setShowTooltip(false), 1800);
    return () => window.clearTimeout(t);
  }, [hovered]);

  useEffect(() => {
    if (!hovered) return;
    const id = window.setInterval(() => {
      setVariantIndex((i) => (i + 1) % VARIANTS.length);
    }, 600);
    return () => window.clearInterval(id);
  }, [hovered]);

  return (
    <span className={cn('relative inline-block', className)}>
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setVariantIndex(0);
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onClick={() => setVariantIndex((i) => (i + 1) % VARIANTS.length)}
        title="Click to cycle pronunciation"
        className={cn(
          'relative inline-block text-primary transition-all duration-300',
          'hover:tracking-wider',
          pressed && 'scale-95'
        )}
        style={{ letterSpacing: hovered ? '0.04em' : 'normal' }}
      >
        <span
          aria-hidden
          className={cn(
            'absolute -inset-x-2 -inset-y-1 -z-10 rounded-lg transition-all duration-500',
            hovered ? 'bg-accent/30' : 'bg-transparent'
          )}
        />
        <span
          className={cn(
            'absolute -bottom-1 left-0 h-px bg-linear-to-r from-primary via-accent to-primary transition-all duration-500',
            hovered ? 'w-full opacity-100' : 'w-0 opacity-0'
          )}
        />
        <span className="relative">
          {hovered ? VARIANTS[variantIndex] : 'Odogwu'}
        </span>
      </button>

      {showTooltip && (
        <span
          role="tooltip"
          className="pointer-events-none whitespace-nowrap absolute -top-10 left-1/2 z-20 -translate-x-1/2 animate-[slideUp_300ms_ease-out]"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground shadow-lg backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-primary" />
            /ɔ́.dɔ́.ɡwʊ́/ · Igbo · &ldquo;champion / strong one&rdquo;
          </span>
        </span>
      )}
    </span>
  );
}
