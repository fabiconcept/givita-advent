'use client';

import { useEffect, useMemo, useState } from 'react';
import { Form, FormQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, RefreshCcw, Home, FileText, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface SuccessScreenProps {
  form: Form;
  responses: Record<string, string | string[] | number>;
  onRestart: () => void;
}

function getAnswer(question: FormQuestion, value: string | string[] | number | undefined): string {
  if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return '-';
  if (Array.isArray(value)) return value.join(', ');
  if (question.type === 'likert-scale') {
    const n = Number(value);
    const max = question.maxScore || 5;
    return `${n} / ${max}`;
  }
  return String(value);
}

export function SuccessScreen({ form, responses, onRestart }: SuccessScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  const ordered = useMemo(
    () => [...form.questions].sort((a, b) => a.order - b.order),
    [form.questions]
  );

  const previewCount = 3;
  const displayQuestions = expanded ? ordered : ordered.slice(0, previewCount);

  return (
    <section
      className={`relative pt-2 transition-all duration-700 ease-out ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <ConfettiBurst />

      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -m-6 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#7a5cfa] shadow-[0_20px_50px_-12px_rgba(81,46,248,0.6)]">
            <Check className="h-10 w-10 text-primary-foreground" strokeWidth={3} />
          </div>
        </div>

        <Badge />
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">You did it!</h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          Your response to <span className="text-foreground">{form.title}</span> has been recorded.
          Thank you for taking the time to share.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <FileText className="h-4 w-4 text-primary" /> Your response
          </div>
          <span className="text-xs text-muted-foreground">
            {ordered.length} {ordered.length === 1 ? 'answer' : 'answers'}
          </span>
        </div>
        <div className="relative">
          <ul className="divide-y divide-border/60">
            {displayQuestions.map((q, i) => (
              <li
                key={q.id}
                className="grid grid-cols-[40px_1fr] gap-3 px-5 py-4 sm:grid-cols-[56px_1fr]"
                style={{ animation: `slideUp 400ms ease-out ${i * 60}ms both` }}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary sm:h-8 sm:w-8">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground/80">{q.title}</p>
                  <p className="mt-1 break-words text-sm text-muted-foreground">
                    {getAnswer(q, responses[q.id])}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {!expanded && ordered.length > previewCount && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/95 to-transparent" />
          )}
        </div>
        {ordered.length > previewCount && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-center gap-2 border-t border-border/60 px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            title={expanded ? 'Show less' : `Show all ${ordered.length} answers`}
          >
            {expanded ? 'Show less' : `Show all ${ordered.length} answers`}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onRestart} size="lg" className="h-11 rounded-full px-6" title="Submit another response">
          <RefreshCcw className="mr-2 h-4 w-4" /> Submit another response
        </Button>
        <Button asChild size="lg" variant="ghost" className="h-11 rounded-full px-6" title="Home">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Home
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Badge() {
  return (
    <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <Sparkles className="h-3 w-3" /> Response recorded
    </div>
  );
}

function ConfettiBurst() {
  const pieces = useMemo(() => {
    const colors = ['#512ef8', '#7a5cfa', '#d6ff5d', '#22c55e', '#f0f0f0', '#ff6b6b'];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 3.5 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 8,
    }));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[560px] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
