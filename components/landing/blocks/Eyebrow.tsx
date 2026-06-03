'use client';

import { cn } from '@/lib/utils';

export function Eyebrow({ number, label, tone = 'default' }: { number: string; label: string; tone?: 'default' | 'primary' }) {
  return (
    <p className={cn('inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]', tone === 'primary' ? 'text-primary' : 'text-muted-foreground')}>
      <span className="font-mono opacity-70">{number}</span>
      <span className="h-px w-8 bg-current opacity-30" />
      <span>{label}</span>
    </p>
  );
}
