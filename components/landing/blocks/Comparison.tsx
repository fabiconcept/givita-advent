'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Check, ArrowRight } from 'lucide-react';

interface ComparisonItem {
  before: string;
  after: string;
}

const ITEMS: ComparisonItem[] = [
  { before: 'A donation page',           after: 'A community around a cause' },
  { before: 'One-time support',          after: 'Ongoing belonging and recognition' },
  { before: 'Hidden progress',           after: 'Shared milestones and updates' },
  { before: 'Trust through branding',    after: 'Trust through verification and reporting' },
  { before: 'Contributors are donors',   after: 'Contributors are champions' },
];

export function Comparison() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const h = () => setReduced(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  return (
    <div className="mt-12">
      <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-6 lg:gap-10">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className="col-span-full grid grid-cols-subgrid items-center gap-6 lg:gap-10"
          >
            <BeforeCard item={item} index={i} reduced={reduced} />
            <div className="hidden sm:flex sm:justify-center" aria-hidden>
              <ArrowRight className="h-5 w-5 text-primary/60" />
            </div>
            <AfterCard item={item} index={i} reduced={reduced} />
          </div>
        ))}
      </div>

      <div className="space-y-3 sm:hidden">
        {ITEMS.map((item, i) => (
          <div key={i} className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
            <div className="flex items-start gap-2 text-sm text-muted-foreground line-through decoration-muted-foreground/30">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
              <span>{item.before}</span>
            </div>
            <div className="mt-2 flex items-start gap-2 text-sm font-medium text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item.after}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BeforeCard({ item, index, reduced }: { item: ComparisonItem; index: number; reduced: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-muted/30 p-5',
        reduced ? '' : 'transition-all duration-500',
      )}
      style={reduced ? undefined : { transitionDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="flex mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Before Givita
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {item.before}
          </p>
        </div>
      </div>
    </div>
  );
}

function AfterCard({ item, index, reduced }: { item: ComparisonItem; index: number; reduced: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-primary/30 bg-primary/[0.04] p-5',
        reduced ? '' : 'transition-all duration-500',
      )}
      style={reduced ? undefined : { transitionDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="flex mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            With Givita
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            {item.after}
          </p>
        </div>
      </div>
    </div>
  );
}
