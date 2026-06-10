'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  maxScore?: number;
}

export function RatingInput({ value, onChange, maxScore = 5 }: RatingInputProps) {
  const [hover, setHover] = useState(0);
  const scores = Array.from({ length: maxScore }, (_, i) => i + 1);
  const display = hover || value;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= maxScore) {
        e.preventDefault();
        onChange(n);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onChange(Math.min(maxScore, (value || 0) + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onChange(Math.max(0, (value || 0) - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [maxScore, value, onChange]);

  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-2 sm:gap-3"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
      >
        {scores.map((score) => {
          const filled = display >= score;
          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={value === score}
              aria-label={`${score} out of ${maxScore}`}
              title={`${score} out of ${maxScore}`}
              onMouseEnter={() => setHover(score)}
              onClick={() => onChange(score)}
              className={cn(
                'group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-200 sm:h-16 sm:w-16',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                value === score
                  ? 'scale-110 border-primary bg-primary/[0.08]'
                  : filled
                    ? 'border-primary/50 bg-card/70'
                    : 'border-border bg-card/40 hover:-translate-y-0.5 hover:border-primary/40'
              )}
            >
              <Star
                className={cn(
                  'h-7 w-7 transition-all sm:h-8 sm:w-8',
                  filled ? 'fill-primary text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground'
                )}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {display > 0 ? (
          <span className="text-foreground">{display} of {maxScore}</span>
        ) : (
          'Tap a star to rate'
        )}
        <span className="ml-2 hidden sm:inline">-  use number keys or arrow keys</span>
      </p>
    </div>
  );
}
