'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/landing/Reveal';
import { WordReveal } from '@/components/landing/WordReveal';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

function FloatingPetals() {
  const petals = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {petals.map((i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-primary/20"
          style={{
            left: `${10 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `petalFloat ${14 + i * 2}s ease-in-out ${i * 1.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes petalFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(${Math.random() * 30 - 15}px, -40px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden scroll-mt-16">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 18% 12%, rgba(81,46,248,0.16) 0%, transparent 60%), radial-gradient(45% 40% at 88% 8%, rgba(214,255,93,0.10) 0%, transparent 60%), radial-gradient(70% 60% at 50% 100%, rgba(81,46,248,0.08) 0%, transparent 60%)',
        }}
        aria-hidden
      />
      <div className="block md:hidden">
        <HangingFlower className="left-2 bottom-0" side="left" size={86} ropeLength={42} delay={0} tone="primary" />
        <HangingFlower className="right-4 bottom-0" side="right" size={68} ropeLength={36} delay={0.7} tone="muted" />
      </div>
      <div className="hidden md:block">
        <HangingFlower className="left-2 top-0 -translate-x-3 sm:left-6 lg:left-10" side="left" size={220} ropeLength={130} delay={0} tone="primary" />
        <HangingFlower className="right-8 top-0 sm:right-14 lg:right-24" side="right" size={170} ropeLength={95} delay={1.2} tone="muted" />
      </div>
      <FloatingPetals />
      <div className="relative mx-auto w-full max-w-3xl px-5 pb-24 pt-28 text-center sm:px-8 sm:pb-32 sm:pt-36">
        <Reveal>
          <p className="inline-flex sm:mt-16 mt-6 items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Givita · Africa&apos;s community-powered fundraising platform
          </p>
        </Reveal>

        <h1 className="mt-10 text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
          <WordReveal text="Giving has always" className="" delay={120} stagger={70} />
          <br className="hidden sm:block" />
          <WordReveal text="been our culture." delay={420} stagger={70} accent="culture" />
        </h1>

        <Reveal delay={900}>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Givita turns the way <span className="text-primary dark:text-muted-foreground">African communities</span> already support each other into a modern, <span className="text-primary dark:text-muted-foreground">trusted</span> digital experience -
            built for us, by us.
          </p>
        </Reveal>

        <Reveal delay={1050}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="group h-12 w-full rounded-full px-7 text-base shadow-[0_10px_40px_-10px_rgba(81,46,248,0.5)] sm:w-auto"
            >
              <Link href="/forms/community-fundraising">
                Add your voice <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <a
              href="#truth"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full px-5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Read the story <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={1200}>
          <div className="mt-24 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
              <span className="scroll-line h-px w-12 bg-border" />
              <span className="scroll-hint">Scroll</span>
              <span className="scroll-line h-px w-12 bg-border" style={{ animationDelay: '0.9s' }} />
            </div>
            <svg
              className="scroll-hint h-4 w-4 text-muted-foreground/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
