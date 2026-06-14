'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import useShortcuts from '@useverse/useshortcuts';
import { useShortcutGuard } from '@/components/ShortcutGuard';
import { Form, FormQuestion } from '@/types';
import { FormShell } from '@/components/form/FormShell';
import { IntroScreen } from '@/components/form/IntroScreen';
import { ProgressBar } from '@/components/form/ProgressBar';
import { NavControls } from '@/components/form/NavControls';
import { ModernQuestionCard } from '@/components/form/ModernQuestionCard';
import { SuccessScreen } from '@/components/form/SuccessScreen';
import { validateQuestion } from '@/lib/validation';
import {
  estimateSeconds,
  formatTime,
  saveProgress,
  loadProgress,
  markFilled,
  clearProgress,
  getFilledDate,
  PersistedState,
} from '@/components/form/FormPage/utils';
import { LoadingShell } from '@/components/form/FormPage/LoadingShell';
import { NotFoundShell } from '@/components/form/FormPage/NotFoundShell';
import { AlreadyFilled } from '@/components/form/FormPage/AlreadyFilled';
import { PasswordEntry } from '@/components/form/FormPage/PasswordEntry';
import { ExpiredScreen } from '@/components/form/FormPage/ExpiredScreen';
import { MaxResponsesScreen } from '@/components/form/FormPage/MaxResponsesScreen';

type Stage = 'intro' | 'questions' | 'submitting' | 'success' | 'already-filled' | 'not-found' | 'loading' | 'error' | 'password-entry' | 'expired' | 'max-responses';

// Response shape from the API
type FormApiResponse = Form & {
  passwordRequired?: boolean;
  isPasswordProtected?: boolean;
  serverNow?: string;
  reason?: string;
  error?: string;
};

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [serverNow, setServerNow] = useState<string | undefined>(undefined);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Check for stored password
        const storedPassword = typeof window !== 'undefined'
          ? sessionStorage.getItem(`givita:form-pw:${formId}`)
          : null;

        const headers: Record<string, string> = {};
        if (storedPassword) headers['X-Form-Password'] = storedPassword;

        const [formRes, sessionRes] = await Promise.all([
          fetch(`/api/forms/${formId}`, { headers, cache: 'no-store' }),
          fetch('/api/admin/session', { cache: 'no-store' }),
        ]);

        const formData: FormApiResponse = await formRes.json();
        const session = sessionRes.ok ? ((await sessionRes.json()) as { isAdmin: boolean }) : { isAdmin: false };

        if (cancelled) return;

        // 410 — expired or max responses
        if (formRes.status === 410) {
          if (formData.reason === 'expired') {
            setServerNow(formData.serverNow);
            setStage('expired');
          } else if (formData.reason === 'max_responses') {
            setServerNow(formData.serverNow);
            setStage('max-responses');
          } else {
            setError(formData.error || 'This form is no longer available.');
            setStage('not-found');
          }
          return;
        }

        // Password required
        if (formData.passwordRequired) {
          setIsPasswordProtected(true);
          setServerNow(formData.serverNow);
          setStage('password-entry');
          return;
        }

        // 401 — wrong password
        if (formRes.status === 401) {
          setIsPasswordProtected(true);
          setPasswordError(formData.error || 'Incorrect password.');
          setStage('password-entry');
          return;
        }

        if (!formRes.ok) throw new Error('Form not found');

        if (!formData.isPublished && !session.isAdmin) {
          setError('This form is no longer accepting responses.');
          setStage('not-found');
          return;
        }

        setForm(formData);
        setIsPasswordProtected(!!formData.isPasswordProtected);
        setServerNow(formData.serverNow);

        const parsed = loadProgress(formId);
        if (parsed && parsed.stage === 'questions' && parsed.responses) {
          setResponses(parsed.responses);
          setIndex(Math.min(parsed.index || 0, Math.max(0, formData.questions.length - 1)));
          setStage('intro');
          return;
        }

        const filledRaw = getFilledDate(formId);
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
    saveProgress(formId, payload);
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
    setValidationErrors((prev) => {
      if (!prev[qid]) return prev;
      const next = { ...prev };
      delete next[qid];
      return next;
    });
  };

  const goNext = () => {
    if (!current) return;
    const error = validateQuestion(current, currentValue);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [current.id]: error }));
      return;
    }
    if (!canAdvance) return;
    if (isLast) {
      void submit();
    } else {
      setIndex((i) => Math.min(total - 1, i + 1));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { inputsFocused } = useShortcutGuard();

  const handleShortcut = useCallback((shortcut: { key: string }) => {
    if (stage !== 'questions') return;
    switch (shortcut.key) {
      case 'Enter':
        goNext();
        break;
      case 'Escape':
        if (!isFirst) goBack();
        break;
    }
  }, [stage, goNext, isFirst]);

  useShortcuts({
    shortcuts: [
      { key: 'Enter', enabled: stage === 'questions' && !inputsFocused },
      { key: 'Escape', enabled: stage === 'questions' && !inputsFocused && !isFirst },
    ],
    onTrigger: handleShortcut,
  }, [handleShortcut, inputsFocused]);

  const submit = async () => {
    if (!form) return;
    setStage('submitting');
    try {
      const storedPassword = typeof window !== 'undefined'
        ? sessionStorage.getItem(`givita:form-pw:${formId}`)
        : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedPassword) headers['X-Form-Password'] = storedPassword;

      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ responses }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Handle 410 on submit
        if (res.status === 410) {
          if (data.reason === 'expired') { setStage('expired'); return; }
          if (data.reason === 'max_responses') { setStage('max-responses'); return; }
        }
        throw new Error(data.error || 'Submission failed');
      }
      markFilled(formId);
      const now = new Date().toISOString();
      setFilledAt(now);
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
    clearProgress(formId);
  };

  const handlePasswordSubmit = async (password: string) => {
    setPasswordLoading(true);
    setPasswordError(null);
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        headers: { 'X-Form-Password': password, 'Cache-Control': 'no-store' },
      });
      const data: FormApiResponse = await res.json();

      if (res.status === 401) {
        setPasswordError(data.error || 'Incorrect password.');
        setPasswordLoading(false);
        return;
      }

      if (res.status === 410) {
        if (data.reason === 'expired') setStage('expired');
        else if (data.reason === 'max_responses') setStage('max-responses');
        setPasswordLoading(false);
        return;
      }

      if (!res.ok) {
        setPasswordError(data.error || 'Failed to verify password.');
        setPasswordLoading(false);
        return;
      }

      // Success — store password and load form
      sessionStorage.setItem(`givita:form-pw:${formId}`, password);
      setForm(data);
      setIsPasswordProtected(true);
      setServerNow(data.serverNow);

      const filledRaw = getFilledDate(formId);
      if (filledRaw) {
        setFilledAt(filledRaw);
        setStage('already-filled');
      } else {
        setStage('intro');
      }
    } catch {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExpired = () => {
    setStage('expired');
  };

  if (stage === 'loading') {
    return <LoadingShell />;
  }

  if (stage === 'not-found') {
    return <NotFoundShell message={error || 'This form is no longer accepting responses.'} />;
  }

  if (stage === 'password-entry') {
    return (
      <FormShell>
        <main className="mx-auto w-full max-w-3xl px-5 pt-24 pb-32 sm:pt-28 sm:pb-40">
          <PasswordEntry
            formTitle={form?.title || 'this form'}
            onSubmit={handlePasswordSubmit}
            error={passwordError}
            isLoading={passwordLoading}
          />
        </main>
      </FormShell>
    );
  }

  if (stage === 'expired') {
    return (
      <FormShell>
        <main className="mx-auto w-full max-w-3xl px-5 pt-24 pb-32 sm:pt-28 sm:pb-40">
          <ExpiredScreen />
        </main>
      </FormShell>
    );
  }

  if (stage === 'max-responses') {
    return (
      <FormShell>
        <main className="mx-auto w-full max-w-3xl px-5 pt-24 pb-32 sm:pt-28 sm:pb-40">
          <MaxResponsesScreen />
        </main>
      </FormShell>
    );
  }

  if (!form) {
    return <LoadingShell />;
  }

  return (
    <FormShell>
      {(stage === 'questions' || stage === 'submitting') && (
        <ProgressBar value={progressPct} step={index + 1} total={total} onRestart={restart} />
      )}

      <main className="mx-auto w-full max-w-3xl px-5 pt-24 pb-32 sm:pt-28 sm:pb-40" data-tip="form-ready">
        {stage === 'intro' && (
          <IntroScreen
            form={form}
            estimated={formatTime(estimateSeconds(form))}
            hasResumed={Object.keys(responses).length > 0}
            onStart={() => setStage('questions')}
            onRestart={restart}
            expiresAt={form.expiresAt}
            serverNow={serverNow}
            onExpired={handleExpired}
          />
        )}

        {stage === 'questions' && current && (
          <div key={current.id} className="slide-up" data-tip="form-nav" data-question-type={current.type}>
            <ModernQuestionCard
              question={current}
              index={index}
              total={total}
              value={currentValue}
              onChange={(v) => setAnswer(current.id, v)}
              error={validationErrors[current.id]}
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
            <p className="text-muted-foreground">Sending your responses&hellip;</p>
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

        {stage === 'error' && error && (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
            {error}
          </div>
        )}
      </main>
    </FormShell>
  );
}
