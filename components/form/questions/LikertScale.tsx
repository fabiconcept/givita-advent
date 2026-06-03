'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Frown, Meh, Smile } from 'lucide-react';

interface LikertScaleProps {
  value: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  maxScore: number;
}

const MOOD_FACES = [Frown, Frown, Meh, Smile, Smile, Smile];
const MOOD_LABELS = ['Awful', 'Bad', 'Okay', 'Good', 'Great', 'Amazing'];

export function LikertScale({ value, onChange, minLabel, maxLabel, maxScore }: LikertScaleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scores = Array.from({ length: maxScore }, (_, i) => i + 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const idx = parseInt(e.key, 10);
      if (idx >= 1 && idx <= maxScore) {
        e.preventDefault();
        onChange(idx);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [maxScore, onChange]);

  const currentFace = value > 0 ? MOOD_FACES[Math.min(value, MOOD_FACES.length - 1)] : null;
  const currentLabel = value > 0 ? MOOD_LABELS[Math.min(value, MOOD_LABELS.length - 1)] : null;

  return (
    <div className="space-y-5">
      <div
        ref={containerRef}
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${maxScore}, minmax(0, 1fr))` }}
        role="radiogroup"
      >
        {scores.map((score) => {
          const selected = value === score;
          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(score)}
              className={cn(
                'group relative flex aspect-square w-full flex-col items-center justify-center rounded-2xl border text-2xl font-semibold transition-all duration-200 sm:text-3xl',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                selected
                  ? 'scale-[1.04] border-primary bg-primary text-primary-foreground shadow-[0_12px_30px_-12px_rgba(81,46,248,0.6)]'
                  : 'border-border bg-card/40 text-foreground/80 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card/70 hover:text-foreground hover:shadow-[0_8px_24px_-12px_rgba(81,46,248,0.4)]'
              )}
            >
              <span className="leading-none">{score}</span>
              {selected && currentFace && (
                <currentFace className="mt-1 h-4 w-4 opacity-90 sm:h-5 sm:w-5" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{minLabel || 'Strongly disagree'}</span>
        {currentLabel && value > 0 ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {currentLabel}
          </span>
        ) : (
          <span className="text-muted-foreground/60">Pick a number</span>
        )}
        <span>{maxLabel || 'Strongly agree'}</span>
      </div>
    </div>
  );
}
