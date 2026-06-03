'use client';

import { useState, type ComponentType } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

export function FeatureAccordion({
  features,
}: {
  features: { icon: ComponentType<{ className?: string }>; Illust: ComponentType<{ className?: string }>; title: string; body: string }[];
}) {
  const [open, setOpen] = useState(0);
  return (
    <div className="mt-12 divide-y divide-border border-y border-border">
      {features.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.title}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="grid w-full grid-cols-[64px_1fr_24px] items-center gap-5 py-5 text-left transition-colors hover:bg-muted/30"
            >
              <span className={cn('h-12 w-16 transition-all duration-300', isOpen ? 'text-foreground' : 'text-muted-foreground/70')}>
                <f.Illust className="h-full w-full" />
              </span>
              <span className="text-lg font-semibold">{f.title}</span>
              {isOpen ? <Minus className="h-4 w-4 text-muted-foreground" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
            </button>
            <div className={cn('grid grid-cols-[64px_1fr_24px] gap-5 overflow-hidden transition-all duration-500', isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0')}>
              <div />
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              <div />
            </div>
          </div>
        );
      })}
    </div>
  );
}
