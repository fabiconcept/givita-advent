'use client';

import { cn } from '@/lib/utils';
import { LiveBackground, type BackgroundVariant } from '@/components/landing/LiveBackground';

export function Section({
  id, children, variant, tone = 'plain', align = 'default', density = 'default',
}: {
  id: string;
  children: React.ReactNode;
  variant?: BackgroundVariant;
  tone?: 'plain' | 'muted';
  align?: 'default' | 'wide';
  density?: 'default' | 'roomy';
}) {
  return (
    <section id={id} className={cn('relative overflow-hidden scroll-mt-16', tone === 'muted' && 'bg-muted/30')}>
      {variant && <LiveBackground variant={variant} />}
      <div className={cn('relative mx-auto w-full px-5 sm:px-8', align === 'wide' ? 'max-w-6xl' : 'max-w-5xl', density === 'roomy' ? 'py-32 sm:py-44' : 'py-24 sm:py-32')}>
        {children}
      </div>
    </section>
  );
}
