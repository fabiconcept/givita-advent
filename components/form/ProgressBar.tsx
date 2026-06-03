'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ProgressBarProps {
  value: number;
  step: number;
  total: number;
  onRestart?: () => void;
}

export function ProgressBar({ value, step, total, onRestart }: ProgressBarProps) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setPct(Math.min(100, Math.max(0, value))), 50);
    return () => window.clearTimeout(id);
  }, [value]);

  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-3">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[#7a5cfa] transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
          <div
            className="pointer-events-none absolute top-0 h-full w-12 -translate-x-1/2 rounded-full bg-white/30 blur-md transition-[left] duration-500 ease-out"
            style={{ left: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          <span className="text-foreground">{String(step).padStart(2, '0')}</span>
          <span className="mx-1">/</span>
          <span>{String(total).padStart(2, '0')}</span>
        </span>
        {onRestart && (
          <Button
            onClick={onRestart}
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8 rounded-full text-muted-foreground hover:text-foreground')}
            aria-label="Restart form"
            title="Restart"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
