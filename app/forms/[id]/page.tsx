'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Form, FormQuestion } from '@/types';
import { FormShell } from '@/components/form/FormShell';
import { IntroScreen } from '@/components/form/IntroScreen';
import { ProgressBar } from '@/components/form/ProgressBar';
import { NavControls } from '@/components/form/NavControls';
import { ModernQuestionCard } from '@/components/form/ModernQuestionCard';
import { SuccessScreen } from '@/components/form/SuccessScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  RefreshCcw,
  CheckCircle2,
  Home,
  Sparkles,
  FileText,
  ChevronRight,
  SearchX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Stage = 'intro' | 'questions' | 'submitting' | 'success' | 'already-filled' | 'not-found' | 'loading' | 'error';

interface PersistedState {
  stage: 'intro' | 'questions';
  index: number;
  responses: Record<string, string | string[] | number>;
  startedAt: string;
}

const STORAGE_PREFIX = 'givita:form-progress:';
const FILLED_PREFIX = 'givita:form-filled:';

function getStorageKey(formId: string) {
  return `${STORAGE_PREFIX}${formId}`;
}

function getFilledKey(formId: string) {
  return `${FILLED_PREFIX}${formId}`;
}

function estimateSeconds(form: Form) {
  let seconds = 0;
  for (const q of form.questions) {
    switch (q.type) {
      case 'multiple-choice':
      case 'checkbox':
      case 'likert-scale':
      case 'ranking':
        seconds += 6;
        break;
      case 'text':
      case 'email':
        seconds += 10;
        break;
      case 'textarea':
        seconds += 25;
        break;
      default:
        seconds += 8;
    }
  }
  return Math.max(15, seconds);
}

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.round(seconds / 30) / 2;
  return `${m % 1 === 0 ? m : m.toFixed(1)} min`;
}

export default function FormPage() {
  const params = useParams();
  const formId = params.id as string;

  const [stage, setStage] = useState<Stage>('loading');
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[] | number>>({});
  const [filledAt, setFilledAt] = useState<string | null>(null);
  const [startedAt] = useState(() => new Date().toISOString());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [formRes, sessionRes] = await Promise.all([
          fetch(`/api/forms/${formId}`, { cache: 'no-store' }),
          fetch('/api/admin/session', { cache: 'no-store' }),
        ]);
        if (!formRes.ok) throw new Error('Form not found');
        const data: Form = await formRes.json();
        const session = sessionRes.ok ? ((await sessionRes.json()) as { isAdmin: boolean }) : { isAdmin: false };
        if (cancelled) return;

        if (!data.isPublished && !session.isAdmin) {
          setError('This form is no longer accepting responses.');
          setStage('not-found');
          return;
        }

        setForm(data);

        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(getStorageKey(formId)) : null;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as PersistedState;
            if (parsed && parsed.stage === 'questions' && parsed.responses) {
              setResponses(parsed.responses);
              setIndex(Math.min(parsed.index || 0, Math.max(0, data.questions.length - 1)));
              setStage('intro');
              return;
            }
          } catch {
            /* ignore corrupted storage */
          }
        }

        const filledRaw = typeof window !== 'undefined' ? window.localStorage.getItem(getFilledKey(formId)) : null;
        if (filledRaw) {
          setFilledAt(filledRaw);
          setStage('already-filled');
          return;
        }

        setStage('intro');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load form');
          setStage('not-found');
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [formId]);

  useEffect(() => {
    if (stage !== 'questions' || !form) return;
    const payload: PersistedState = { stage: 'questions', index, responses, startedAt };
    try {
      window.localStorage.setItem(getStorageKey(formId), JSON.stringify(payload));
    } catch {
      /* quota / private mode */
    }
  }, [stage, index, responses, formId, form, startedAt]);

  const orderedQuestions = useMemo<FormQuestion[]>(() => {
    if (!form) return [];
    return [...form.questions].sort((a, b) => a.order - b.order);
  }, [form]);

  const total = orderedQuestions.length;
  const current = orderedQuestions[index];
  const isLast = index === total - 1;
  const isFirst = index === 0;
  const progressPct = total > 0 ? ((index + (stage === 'success' ? 1 : 0)) / total) * 100 : 0;
  const currentValue = current ? responses[current.id] : undefined;
  const canAdvance = useMemo(() => {
    if (!current) return false;
    if (!current.required) return true;
    const v = responses[current.id];
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }, [current, responses]);

  const setAnswer = (qid: string, value: string | string[] | number) => {
    setResponses((prev) => ({ ...prev, [qid]: value }));
  };

  const goNext = () => {
    if (!canAdvance) return;
    if (isLast) {
      void submit();
    } else {
      setIndex((i) => Math.min(total - 1, i + 1));
    }
  };

  const goBack = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  const submit = async () => {
    if (!form) return;
    setStage('submitting');
    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }
      try {
        window.localStorage.removeItem(getStorageKey(formId));
        const now = new Date().toISOString();
        window.localStorage.setItem(getFilledKey(formId), now);
        setFilledAt(now);
      } catch {
        /* ignore */
      }
      setStage('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
      setStage('questions');
    }
  };

  const restart = () => {
    setIndex(0);
    setResponses({});
    setFilledAt(null);
    setStage('intro');
    try {
      window.localStorage.removeItem(getStorageKey(formId));
      window.localStorage.removeItem(getFilledKey(formId));
    } catch {
      /* ignore */
    }
  };

  if (stage === 'loading') {
    return <LoadingShell />;
  }

  if (stage === 'not-found') {
    return <NotFoundShell message={error || 'This form is no longer accepting responses.'} />;
  }

  if (!form) {
    return <LoadingShell />;
  }

  return (
    <FormShell>
      {(stage === 'questions' || stage === 'submitting') && (
        <ProgressBar value={progressPct} step={index + 1} total={total} onRestart={restart} />
      )}

      <main className="mx-auto w-full max-w-3xl px-5 pt-24 pb-32 sm:pt-28 sm:pb-40">
        {stage === 'intro' && (
          <IntroScreen
            form={form}
            estimated={formatTime(estimateSeconds(form))}
            hasResumed={Object.keys(responses).length > 0}
            onStart={() => setStage('questions')}
            onRestart={restart}
          />
        )}

        {stage === 'questions' && current && (
          <div key={current.id} className="slide-up">
            <ModernQuestionCard
              question={current}
              index={index}
              total={total}
              value={currentValue}
              onChange={(v) => setAnswer(current.id, v)}
            />
            <NavControls
              isFirst={isFirst}
              isLast={isLast}
              canAdvance={canAdvance}
              onBack={goBack}
              onNext={goNext}
            />
          </div>
        )}

        {stage === 'submitting' && (
          <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-2 border-border" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>
            <p className="text-muted-foreground">Sending your responses…</p>
          </div>
        )}

        {stage === 'success' && (
          <SuccessScreen form={form} responses={responses} onRestart={restart} />
        )}

        {stage === 'already-filled' && (
          <AlreadyFilled
            form={form}
            filledAt={filledAt}
            onFillAgain={restart}
          />
        )}

        {stage === 'not-found' && null}
        {stage === 'error' && error && (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
            {error}
          </div>
        )}
      </main>
    </FormShell>
  );
}

function LoadingShell() {
  return (
    <FormShell>
      <div className="mx-auto w-full max-w-3xl px-5 pt-24">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="mt-16 space-y-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-12 space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    </FormShell>
  );
}

function NotFoundShell({ message }: { message: string }) {
  return (
    <FormShell>
      <section className="mx-auto w-full max-w-3xl px-5 pt-24 pb-32 sm:pt-28 sm:pb-40">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">This form isn’t here</h1>
          <p className="mt-3 max-w-md text-base text-muted-foreground">{message}</p>
        </div>
        <AvailableForms formId={null} />
      </section>
    </FormShell>
  );
}

function AvailableForms({ formId: currentFormId }: { formId: string | null }) {
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
        <Button asChild size="lg" className="h-11 rounded-full px-6">
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
          <Button asChild size="lg" className="h-11 rounded-full px-6">
            <a href="/">
              <Home className="mr-2 h-4 w-4" /> Go home
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-6">
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
        <Button asChild variant="ghost" size="sm" className="h-9 rounded-full text-muted-foreground">
          <a href="/">
            <Home className="mr-1.5 h-3.5 w-3.5" /> Home
          </a>
        </Button>
      </div>
    </div>
  );
}

function AlreadyFilled({
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
          <Sparkles className="h-3 w-3" /> You’ve already filled this form
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Thanks again!</h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          We’ve recorded your response to <span className="text-foreground">{form.title}</span>.
          {formatted && <> It was submitted on {formatted}.</>}
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-md rounded-3xl border border-border bg-card/50 p-6 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          Need to update your response or fill it out again for someone else?
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={onFillAgain} size="lg" className="h-11 rounded-full px-6">
            <RefreshCcw className="mr-2 h-4 w-4" /> Fill again
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-11 rounded-full px-6">
            <a href="/">
              <Home className="mr-2 h-4 w-4" /> Home
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
