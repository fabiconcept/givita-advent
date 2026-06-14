'use client';

import Link from 'next/link';
import { Inbox, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HangingFlower } from '@/components/landing/HangingFlower';

export function MaxResponsesScreen() {
  return (
    <section className="relative pt-2">
      <HangingFlower className="right-4 top-0 lg:right-10" side="right" size={172} ropeLength={100} delay={0.1} tone="muted" />

      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -m-6 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_20px_50px_-12px_rgba(81,46,248,0.6)]">
            <Inbox className="h-10 w-10" strokeWidth={2} />
          </div>
        </div>
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3 w-3" /> Response limit reached
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Form is full</h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          This form has reached its maximum number of responses.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-md rounded-3xl border border-border bg-card/50 p-6 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          If you believe this is a mistake, please contact the form owner.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-11 rounded-full px-6" title="Home">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Home
            </Link>
          </Button>
          <Button
            type="button"
            onClick={() => window.history.back()}
            variant="ghost"
            size="lg"
            className="h-11 rounded-full px-6"
            title="Go back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back
          </Button>
        </div>
      </div>
    </section>
  );
}
