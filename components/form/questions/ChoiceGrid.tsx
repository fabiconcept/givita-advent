'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { Check } from 'lucide-react';

interface ChoiceGridProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export function ChoiceGrid({ options, value, onChange }: ChoiceGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < options.length) {
        e.preventDefault();
        onChange(options[idx]);
        const btn = containerRef.current?.querySelectorAll<HTMLButtonElement>('button[data-choice]')[idx];
        btn?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [options, onChange]);

  return (
    <div ref={containerRef} role="radiogroup" className="grid gap-2.5 sm:gap-3">
      {options.map((option, i) => {
        const selected = value === option;
        return (
          <button
            key={option}
            data-choice
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            title={option}
            className={cn(
              'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-card/40 px-4 py-4 text-left transition-all duration-200 ease-out',
              'hover:border-primary/50 hover:bg-card/70 hover:shadow-[0_8px_30px_-12px_rgba(81,46,248,0.4)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              selected
                ? 'border-primary bg-primary/[0.08] shadow-[0_8px_30px_-12px_rgba(81,46,248,0.5)]'
                : 'border-border'
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background/40 text-muted-foreground group-hover:border-primary/50 group-hover:text-primary'
              )}
            >
              {selected ? <Check className="h-4 w-4" /> : LETTERS[i] ?? String(i + 1)}
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
  );
}
