'use client';

import { cn } from '@/lib/utils';

export function Joint({ tone }: { tone: 'enter' | 'leave' | 'mute' }) {
  return (
    <div aria-hidden className="pointer-events-none relative mx-auto -mt-px flex h-12 items-center justify-center">
      <div className={cn('h-px w-32 transition-colors', tone === 'enter' && 'bg-linear-to-r from-transparent via-primary/30 to-transparent', tone === 'leave' && 'bg-linear-to-r from-transparent via-border to-transparent', tone === 'mute' && 'bg-border/50')} />
      <span className={cn('absolute h-1.5 w-1.5 rounded-full', tone === 'enter' ? 'bg-primary/40' : 'bg-border')} />
    </div>
  );
}
