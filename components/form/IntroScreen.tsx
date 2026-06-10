'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Form } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, ArrowRight, RefreshCcw, Home } from 'lucide-react';

interface IntroScreenProps {
  form: Form;
  estimated: string;
  hasResumed: boolean;
  onStart: () => void;
  onRestart: () => void;
}

export function IntroScreen({ form, estimated, hasResumed, onStart, onRestart }: IntroScreenProps) {
  const total = form.questions.length;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 30);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section
      className={`relative pt-6 transition-all duration-700 ease-out ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-0">
          <Sparkles className="mr-1.5 h-3 w-3" /> Survey
        </Badge>
        {hasResumed && (
          <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-0">
            Resume available
          </Badge>
        )}
      </div>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
        {form.title}
      </h1>

      {form.description && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {form.description}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5">
          <Clock className="h-3.5 w-3.5" /> ~ {estimated}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5">
          {total} {total === 1 ? 'question' : 'questions'}
        </span>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button
          onClick={onStart}
          size="lg"
          className="group h-12 rounded-full px-7 text-base shadow-[0_10px_40px_-10px_rgba(81,46,248,0.6)]"
          title={hasResumed ? 'Continue' : 'Start'}
        >
          {hasResumed ? 'Continue' : 'Start'} <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
        <span className="flex items-center gap-2">
          <img src="/assets/flower 2.png" alt="" className="h-5 w-5 object-contain opacity-50" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:shadow-[0_4px_16px_-8px_rgba(81,46,248,0.3)]"
            title="Home"
          >
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </span>
        {hasResumed && (
          <Button onClick={onRestart} variant="ghost" size="lg" className="h-12 rounded-full" title="Start over">
            <RefreshCcw className="mr-2 h-4 w-4" /> Start over
          </Button>
        )}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Your progress is saved automatically. You can leave and come back.
      </p>
    </section>
  );
}
