'use client';

import Link from 'next/link';
import { CheckCircle2, RefreshCcw, Home, Sparkles } from 'lucide-react';
import { Form } from '@/types';
import { Button } from '@/components/ui/button';

export function AlreadyFilled({
  form,
  filledAt,
  onFillAgain,
}: {
  form: Form;
  filledAt: string | null;
  onFillAgain: () => void;
}) {
  const formatted = filledAt
    ? new Date(filledAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <section className="relative pt-2">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -m-6 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_20px_50px_-12px_rgba(81,46,248,0.6)]">
            <CheckCircle2 className="h-10 w-10" strokeWidth={3} />
          </div>
        </div>
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3 w-3" /> You&apos;ve already filled this form
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Thanks again!</h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          We&apos;ve recorded your response to <span className="text-foreground">{form.title}</span>.
          {formatted && <> It was submitted on {formatted}.</>}
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-md rounded-3xl border border-border bg-card/50 p-6 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          Need to update your response or fill it out again for someone else?
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={onFillAgain} size="lg" className="h-11 rounded-full px-6" title="Fill again">
            <RefreshCcw className="mr-2 h-4 w-4" /> Fill again
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-11 rounded-full px-6" title="Home">
            <a href="/">
              <Home className="mr-2 h-4 w-4" /> Home
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
