'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/landing/Reveal';
import { ScrollInView } from '@/components/landing/ScrollInView';
import { HoverDepth } from '@/components/landing/HoverDepth';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { NewsletterForm } from '@/components/landing/NewsletterForm';
import { Eyebrow } from '@/components/landing/blocks/Eyebrow';
import { cn } from '@/lib/utils';
import type { Form } from '@/types';

export function Future() {
  const [featuredForm, setFeaturedForm] = useState<Form | null>(null);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  useEffect(() => {
    fetch('/api/forms/featured')
      .then((r) => r.json())
      .then((d) => { if (d.form) setFeaturedForm(d.form); })
      .catch(() => {})
      .finally(() => setFeaturedLoaded(true));
  }, []);

  const surveyHref = featuredForm ? `/forms/${featuredForm.id}` : '#';
  const surveyLabel = featuredForm?.title || 'the first survey';

  return (
    <section id="future" className="relative overflow-hidden scroll-mt-16">
      <HangingFlower className="right-8 top-0 sm:right-14 lg:right-24" side="right" size={80}  ropeLength={62} delay={0.7} tone="foreground" />
      <HangingFlower className="left-8 top-4 hidden lg:block"           side="left"  size={56}  ropeLength={48} delay={1.4} tone="muted" />
      <div className="relative mx-auto w-full max-w-3xl px-5 py-44 text-center sm:px-8 sm:py-64">
        <Reveal><Eyebrow number="09" label="The future we're building" /></Reveal>
        <Reveal delay={120}>
          <h2 className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            A future where generosity is celebrated, trust is visible, and impact is measurable.
          </h2>
        </Reveal>
        <Reveal delay={220}>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Be among the first to experience Givita. Get launch updates and a quiet note when something important changes.
          </p>
        </Reveal>
        <ScrollInView delay={320} entrance="scaleIn"><div className="mt-12 flex justify-center"><NewsletterForm /></div></ScrollInView>
        <Reveal delay={420}>
          <p className="mt-8 text-xs text-muted-foreground">
            Or{' '}
            <Link
              href={surveyHref}
              className={cn(
                'underline-offset-4 transition-colors',
                featuredLoaded
                  ? 'text-foreground hover:text-primary hover:underline'
                  : 'pointer-events-none text-muted-foreground/40'
              )}
              aria-disabled={!featuredLoaded}
              tabIndex={featuredLoaded ? undefined : -1}
            >
              add your voice
            </Link>{' '}
            to {surveyLabel} - it takes a minute.
          </p>
        </Reveal>
        <ScrollInView delay={520} entrance="flipIn">
          <div className="mt-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">The graph</p>
            <div className="mt-5 grid items-end gap-8 sm:grid-cols-[1.4fr_1fr]">
              <HoverDepth maxTilt={4} lift={5} scale={1.015}>
                <a
                  href="/assets/Flyer 4.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur transition-transform duration-500 hover:-translate-y-1 hover:-rotate-1"
                  aria-label="Open full Givita launch flyer"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/Flyer 4.jpg" alt="Givita launch flyer - a graph of where we're heading" className="block h-auto w-full" loading="lazy" decoding="async" />
                    <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                </a>
              </HoverDepth>
              <div className="text-left sm:pb-4">
                <h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">A first look at the launch flyer.</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">We&apos;re prototyping the visual language of Givita - the story, the community, the way giving feels. This is a snapshot of where we&apos;re heading. Click to view full size.</p>
                <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  v0.1 &middot; survey edition
                </p>
              </div>
            </div>
          </div>
        </ScrollInView>
      </div>
    </section>
  );
}
