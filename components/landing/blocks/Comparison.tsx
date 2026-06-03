'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Comparison() {
  const [view, setView] = useState<'before' | 'after'>('after');
  const items = [
    { before: 'A donation page',           after: 'A community around a cause' },
    { before: 'One-time support',          after: 'Ongoing belonging and recognition' },
    { before: 'Hidden progress',           after: 'Shared milestones and updates' },
    { before: 'Trust through branding',    after: 'Trust through verification and reporting' },
    { before: 'Contributors are donors',   after: 'Contributors are champions' },
  ];
  return (
    <div className="mt-12">
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full border border-border bg-card/60 p-1 text-sm backdrop-blur">
          {(['before', 'after'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'h-9 rounded-full px-5 text-sm font-medium transition-all duration-300',
                view === v ? 'bg-primary text-primary-foreground shadow-[0_6px_20px_-8px_rgba(81,46,248,0.5)]' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v === 'before' ? 'Before Givita' : 'With Givita'}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div
            key={i}
            className={cn('flex items-start gap-3 rounded-2xl border border-border bg-card/40 p-5 transition-all duration-500', view === 'after' && 'border-primary/40 bg-primary/4')}
            style={{ transitionDelay: `${i * 30}ms` }}
          >
            <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-mono transition-colors', view === 'after' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-base leading-relaxed text-foreground/90">
              {view === 'after' ? it.after : it.before}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
