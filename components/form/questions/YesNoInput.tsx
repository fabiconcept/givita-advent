'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';

interface YesNoInputProps {
  value: string;
  onChange: (value: string) => void;
}

const OPTIONS = [
  { value: 'yes', label: 'Yes', Icon: Check, tone: 'text-[#16a34a] dark:text-[#22c55e]' },
  { value: 'no', label: 'No', Icon: X, tone: 'text-destructive' },
] as const;

export function YesNoInput({ value, onChange }: YesNoInputProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '1' || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        onChange('yes');
      } else if (e.key === '2' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onChange('no');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onChange]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((opt, i) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              title={opt.label}
              className={cn(
                'group flex items-center gap-3 rounded-2xl border bg-card/40 p-4 text-left transition-all duration-200',
                'hover:border-primary/50 hover:bg-card/70',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                selected
                  ? 'border-primary bg-primary/[0.08] shadow-[0_8px_30px_-12px_rgba(81,46,248,0.5)]'
                  : 'border-border'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : cn('border-border bg-background/40', opt.tone)
                )}
              >
                <opt.Icon className="h-5 w-5" />
              </span>
              <span className="flex-1 text-lg font-medium">{opt.label}</span>
              <span className="hidden sm:inline-flex">
                <Kbd>{i + 1}</Kbd>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Press <Kbd>1</Kbd> for yes, <Kbd>2</Kbd> for no
      </p>
    </div>
  );
}
