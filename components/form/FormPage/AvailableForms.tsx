'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight, Home } from 'lucide-react';
import { Form } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function AvailableForms({ formId: currentFormId }: { formId: string | null }) {
  const [forms, setForms] = useState<Form[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/forms', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load surveys');
        const data = (await res.json()) as { forms: Form[] };
        if (cancelled) return;
        const available = (data.forms || []).filter(
          (f) => f.isPublished && f.id !== currentFormId && f.questions.length > 0
        );
        setForms(available);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load surveys');
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentFormId]);

  if (error) {
    return (
      <div className="mt-10 flex justify-center">
        <Button asChild size="lg" className="h-11 rounded-full px-6" title="Go home">
          <a href="/">
            <Home className="mr-2 h-4 w-4" /> Go home
          </a>
        </Button>
      </div>
    );
  }

  if (forms === null) {
    return (
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">No published surveys to show right now.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-full px-6" title="Go home">
            <a href="/">
              <Home className="mr-2 h-4 w-4" /> Go home
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-6" title="Admin">
            <Link href="/login">
              <FileText className="mr-2 h-4 w-4" /> Admin
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-4">
      <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Or try one of these
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {forms.map((f) => (
          <Link
            key={f.id}
            href={`/forms/${f.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-4 transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-[0_8px_24px_-12px_rgba(81,46,248,0.4)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold">{f.title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {f.questions.length} {f.questions.length === 1 ? 'question' : 'questions'}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
      <div className="flex justify-center pt-2">
        <Button asChild variant="ghost" size="sm" className="h-9 rounded-full text-muted-foreground" title="Home">
          <a href="/">
            <Home className="mr-1.5 h-3.5 w-3.5" /> Home
          </a>
        </Button>
      </div>
    </div>
  );
}
