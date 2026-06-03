'use client';

import { Reveal } from '@/components/landing/Reveal';
import { ScrollInView } from '@/components/landing/ScrollInView';
import { Counter } from '@/components/landing/Counter';
import { HoverDepth } from '@/components/landing/HoverDepth';
import { Section } from '@/components/landing/blocks/Section';
import { Joint } from '@/components/landing/blocks/Joint';
import { Eyebrow } from '@/components/landing/blocks/Eyebrow';

export function Trust() {
  return (
    <Section id="trust" tone="plain" density="roomy">
      <div className="relative">
        <div className="pointer-events-none absolute -right-2 -top-6 hidden w-44 rotate-6 opacity-90 sm:block lg:w-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/Private data-pana.png" alt="" aria-hidden className="h-auto w-full object-contain" loading="lazy" />
        </div>
        <div className="pointer-events-none absolute -left-4 bottom-0 hidden w-32 -rotate-[8deg] opacity-80 sm:block lg:w-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/ID Card-bro.png" alt="" aria-hidden className="h-auto w-full object-contain" loading="lazy" />
        </div>
        <div className="mx-auto max-w-2xl">
          <Reveal><Eyebrow number="07" label="Trust is the foundation" tone="primary" /></Reveal>
          <Reveal delay={100}>
            <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Built with verification, transparency, and community oversight.
            </h2>
          </Reveal>
        </div>
      </div>
      <div className="mt-20 grid gap-12 sm:grid-cols-3">
        {[
          { value: 3,   suffix: ' layers', label: 'of identity & campaign verification' },
          { value: 100, suffix: '%',       label: 'of fund-usage reports expected per campaign' },
          { value: 24,  suffix: '/7',      label: 'community-driven risk monitoring' },
        ].map((s, i) => (
          <ScrollInView key={s.label} delay={150 + i * 80} entrance={i === 0 ? 'slideUp' : i === 1 ? 'slideDown' : 'scaleIn'}>
            <HoverDepth maxTilt={3} lift={3} scale={1.01}>
              <div>
                <p className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
                <div className="mt-5 h-px w-12 bg-primary/40" />
              </div>
            </HoverDepth>
          </ScrollInView>
        ))}
      </div>
      <Joint tone="leave" />
    </Section>
  );
}
