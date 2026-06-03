'use client';

import { ScrollInView } from '@/components/landing/ScrollInView';
import { HoverDepth } from '@/components/landing/HoverDepth';
import { Section } from '@/components/landing/blocks/Section';
import { Joint } from '@/components/landing/blocks/Joint';
import { Eyebrow } from '@/components/landing/blocks/Eyebrow';

export function Diaspora() {
  return (
    <Section id="diaspora" variant="globe" tone="muted" align="wide" density="roomy">
      <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <ScrollInView entrance="slideRight"><Eyebrow number="08" label="The diaspora" /></ScrollInView>
          <ScrollInView delay={100} entrance="slideRight">
            <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Distance should never be a barrier to impact.
            </h2>
          </ScrollInView>
          <ScrollInView delay={180} entrance="slideRight">
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Millions of <span className="text-primary dark:text-muted-foreground">Africans</span> around the world want to support people and projects back home. <span className="text-primary dark:text-muted-foreground">Givita</span> is designed for international donations, seamless currency conversion, and local disbursement - so supporters anywhere can contribute confidently to causes they care about.
            </p>
          </ScrollInView>
        </div>
        <ScrollInView delay={220} entrance="slideLeft">
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-4xl bg-primary/10 blur-3xl" />
            <HoverDepth maxTilt={4} lift={5} scale={1.015}>
              <div className="overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur">
                <div className="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-primary/10 via-transparent to-primary/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/travel selfie-cuate.png" alt="A diaspora supporter sending support back home" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                </div>
                <ul className="space-y-3 p-6 text-sm">
                  {[
                    ['International donations', 'Stripe & local rails'],
                    ['Currency conversion',     'Real-time, fair rates'],
                    ['Local disbursement',      'NGN, KES, GHS, ZAR…'],
                    ['Diaspora communities',    'Built in, not bolted on'],
                  ].map(([title, body]) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground">{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </HoverDepth>
          </div>
        </ScrollInView>
      </div>
      <Joint tone="enter" />
    </Section>
  );
}
