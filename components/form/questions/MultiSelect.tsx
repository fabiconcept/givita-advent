'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultiSelect({ options, value, onChange }: MultiSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIdx, setFocusedIdx] = useState(0);

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIdx((i) => Math.min(options.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIdx((i) => Math.max(0, i - 1));
      } else {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < options.length) {
          e.preventDefault();
          toggle(options[idx]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, value]);

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary">
        <Plus className="h-3 w-3" />
        Select all that apply
      </div>

      <div ref={containerRef} className="grid gap-2.5 sm:gap-3" role="group" aria-label="Multiple choice options">
        {options.map((option, i) => {
          const selected = value.includes(option);
          const focused = focusedIdx === i;
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              onFocus={() => setFocusedIdx(i)}
              title={option}
              className={cn(
                'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-card/40 px-4 py-4 text-left transition-all duration-200 ease-out sm:py-5',
                'hover:border-primary/50 hover:bg-card/70 hover:shadow-[0_8px_30px_-12px_rgba(81,46,248,0.4)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                selected
                  ? 'border-primary bg-primary/[0.08] shadow-[0_8px_30px_-12px_rgba(81,46,248,0.5)]'
                  : focused
                    ? 'border-primary/60'
                    : 'border-border'
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-colors',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background/40 text-muted-foreground group-hover:border-primary/50 group-hover:text-primary'
                )}
              >
                {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 opacity-40" />}
              </span>
              <span
                className={cn(
                  'flex-1 text-base sm:text-lg',
                  selected ? 'text-foreground font-medium' : 'text-foreground/90'
                )}
              >
                {option}
              </span>
              <span className="hidden sm:inline-flex">
                <Kbd>{i + 1}</Kbd>
              </span>
              {selected && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-primary/40"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
