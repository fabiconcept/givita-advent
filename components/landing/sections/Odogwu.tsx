'use client';

import { ScrollInView } from '@/components/landing/ScrollInView';
import { HoverDepth } from '@/components/landing/HoverDepth';
import { Section } from '@/components/landing/blocks/Section';
import { Joint } from '@/components/landing/blocks/Joint';
import { Eyebrow } from '@/components/landing/blocks/Eyebrow';
import { OdogwuWord } from '@/components/landing/OdogwuWord';
import { Quote } from 'lucide-react';

export function Odogwu() {
  return (
    <Section id="odogwu" tone="muted" density="roomy">
      <div className="grid items-center gap-10 lg:grid-cols-[1.8fr_1fr]">
        <ScrollInView entrance="scaleIn">
          <div>
            <Eyebrow number="06" label="Odogwu" />
            <HoverDepth maxTilt={4} lift={5} scale={1.015}>
              <div className="mt-14 max-w-3xl rounded-3xl border border-border bg-card/60 p-8 backdrop-blur sm:p-12">
                <Quote className="h-7 w-7 text-primary" />
                <p className="mt-6 text-balance text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
                  Across Nigeria and many African societies, support comes from strong community networks - the spirit often proudly called the{' '}
                  <OdogwuWord /> mentality. Givita embraces this culture and turns it into a modern digital experience.
                </p>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  People contribute because they believe in someone, want their community to succeed, feel connected to a shared goal, want to make an impact, and want to be remembered as a contributor to something meaningful.
                </p>
              </div>
            </HoverDepth>
          </div>
        </ScrollInView>
        <ScrollInView delay={180} entrance="slideLeft">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/Self confidence-rafiki 1.png" alt="Confidence and community" className="h-auto w-full object-contain" loading="lazy" />
          </div>
        </ScrollInView>
      </div>
      <Joint tone="enter" />
    </Section>
  );
}
