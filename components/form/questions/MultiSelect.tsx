'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
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
    <div className="space-y-3">
      <div ref={containerRef} className="flex flex-wrap gap-2.5">
        {options.map((option, i) => {
          const selected = value.includes(option);
          const focused = focusedIdx === i;
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              onFocus={() => setFocusedIdx(i)}
              className={cn(
                'group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                selected
                  ? 'border-primary bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(81,46,248,0.5)]'
                  : focused
                    ? 'border-primary/60 bg-card/80 text-foreground'
                    : 'border-border bg-card/40 text-foreground/80 hover:border-primary/50 hover:bg-card/70 hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                  selected ? 'border-primary-foreground/40 bg-primary-foreground/20' : 'border-border bg-background/40'
                )}
              >
                {selected && <Check className="h-3 w-3" />}
              </span>
              {option}
              <span className="hidden text-[10px] text-muted-foreground/70 sm:inline">
                <Kbd>{i + 1}</Kbd>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Select all that apply <span className="hidden sm:inline"> -  click to toggle</span>
      </p>
    </div>
  );
}
