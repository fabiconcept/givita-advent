'use client';

import { Reveal } from '@/components/landing/Reveal';
import { ScrollInView } from '@/components/landing/ScrollInView';
import { Section } from '@/components/landing/blocks/Section';
import { Joint } from '@/components/landing/blocks/Joint';
import { Eyebrow } from '@/components/landing/blocks/Eyebrow';
import { Comparison } from '@/components/landing/blocks/Comparison';

export function Shift() {
  return (
    <Section id="shift" variant="shift">
      <div className="pointer-events-none absolute right-4 top-16 hidden w-32 -rotate-[4deg] opacity-90 sm:block lg:right-10 lg:w-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/Buffer-bro.png" alt="" aria-hidden className="h-auto w-full object-contain transition-transform duration-500 hover:rotate-2 hover:scale-105" loading="lazy" />
      </div>
      <div className="mx-auto max-w-3xl text-center">
        <Reveal><Eyebrow number="03" label="The shift" /></Reveal>
        <Reveal delay={100}>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Givita is not a tool. It is a translation of culture.
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            We didn&apos;t start with a product. We started with how Africans already give - and built the platform backward from there. Toggle to see the shift.
          </p>
        </Reveal>
      </div>
      <ScrollInView delay={240} entrance="flipIn"><Comparison /></ScrollInView>
      <Joint tone="mute" />
    </Section>
  );
}
