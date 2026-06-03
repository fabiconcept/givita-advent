'use client';

import { Reveal } from '@/components/landing/Reveal';
import { ScrollInView } from '@/components/landing/ScrollInView';
import { HoverDepth } from '@/components/landing/HoverDepth';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { Section } from '@/components/landing/blocks/Section';
import { Joint } from '@/components/landing/blocks/Joint';
import { Eyebrow } from '@/components/landing/blocks/Eyebrow';
import {
  IllustCommunity,
  IllustBroken,
  IllustShield,
} from '@/components/landing/illustrations';

export function Gap() {
  const items = [
    { n: '01', title: 'Local currencies get lost in conversion',  body: "Cross-border donations arrive with fees and rates that don't reflect the reality of contributors.", Illust: IllustBroken,    strokeWidth: 2.4 },
    { n: '02', title: 'Trust is harder to establish',             body: 'Verification, oversight, and transparency are not first-class features - they are afterthoughts.',     Illust: IllustShield,    strokeWidth: 2.4 },
    { n: '03', title: 'Culture is treated as decoration',         body: 'The social dynamics that actually drive giving get flattened into one-time transactions.',             Illust: IllustCommunity, strokeWidth: 2.4 },
  ];
  return (
    <Section id="gap" variant="fragment" tone="muted" align="wide">
      <HangingFlower className="right-8 top-0 sm:right-16 lg:right-24" side="right" size={68} ropeLength={56} delay={0.4} tone="muted" />
      <div className="pointer-events-none absolute inset-0 -z-10 hidden items-center justify-center sm:flex">
        <div className="w-72 opacity-[0.05]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/empty-box 1.png" alt="" aria-hidden className="h-auto w-full object-contain" loading="lazy" />
        </div>
      </div>
      <Reveal><Eyebrow number="02" label="The gap" tone="primary" /></Reveal>
      <Reveal delay={100}>
        <h2 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Most platforms were not built with African communities in mind.
        </h2>
      </Reveal>
      <div className="mt-16 grid gap-10 sm:grid-cols-3">
        {items.map((item, i) => (
          <ScrollInView key={item.n} delay={150 + i * 100} entrance={i === 0 ? 'slideUp' : i === 1 ? 'rotateIn' : 'scaleIn'}>
            <HoverDepth maxTilt={3} lift={3} scale={1.01}>
              <article className="group">
                <item.Illust strokeWidth={item.strokeWidth} className="h-24 w-24 text-foreground/70 transition-transform duration-500 group-hover:-translate-y-1" />
                <p className="mt-6 font-mono text-xs text-muted-foreground">{item.n}</p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            </HoverDepth>
          </ScrollInView>
        ))}
      </div>
      <Joint tone="leave" />
    </Section>
  );
}
