'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Minus, Hash } from 'lucide-react';

interface NumberInputProps {
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
}

export function NumberInput({ value, onChange, placeholder = '0', min, max, unit }: NumberInputProps) {
  const raw = value === '' || value === undefined ? '' : String(value);
  const num = raw === '' ? NaN : Number(raw);
  const [focused, setFocused] = useState(false);

  const clamp = (n: number) => {
    if (Number.isNaN(n)) return n;
    if (typeof min === 'number' && n < min) return min;
    if (typeof max === 'number' && n > max) return max;
    return n;
  };

  const step = (delta: number) => {
    const base = Number.isNaN(num) ? 0 : num;
    onChange(clamp(base + delta));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-2">
        <div className="group relative flex-1">
          <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
            <Hash className="h-5 w-5" />
          </div>
          <input
            type="number"
            value={raw}
            placeholder={placeholder}
            min={min}
            max={max}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') onChange(NaN as unknown as number);
              else onChange(clamp(Number(v)));
            }}
            className={cn(
              'w-full border-0 border-b-2 bg-transparent py-4 pl-8 pr-3 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl',
              'placeholder:font-normal placeholder:text-muted-foreground/40',
              'transition-all duration-200',
              focused ? 'border-primary' : 'border-border',
              'focus:border-primary focus:outline-none focus:ring-0'
            )}
          />
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-[#7a5cfa] transition-transform duration-300',
              focused && 'scale-x-100'
            )}
          />
        </div>
        {unit && (
          <span className="flex items-center self-end pb-4 text-base font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full border border-border bg-card/40 p-1">
          <button
            type="button"
            onClick={() => step(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Decrease"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="inline-flex min-w-[2.5rem] items-center justify-center px-2 text-sm font-medium tabular-nums">
            {Number.isNaN(num) ? '-' : num}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {(typeof min === 'number' || typeof max === 'number') && (
          <p className="text-xs text-muted-foreground">
            {typeof min === 'number' ? `Min ${min}` : ''}
            {typeof min === 'number' && typeof max === 'number' ? ' - ' : ''}
            {typeof max === 'number' ? `Max ${max}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
