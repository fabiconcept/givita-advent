'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useShortcuts from '@useverse/useshortcuts';
import { useShortcutGuard } from '@/components/ShortcutGuard';
import { Form } from '@/types';
import { FlowerLogo } from '@/components/admin/FlowerLogo';
import { ShortcutTooltip } from '@/components/admin/ShortcutTooltip';
import { ShortcutsGuide } from '@/components/admin/ShortcutsGuide';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut, FileText, ChevronRight, Plus, ShieldCheck, Sparkles, Star, Trash2, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormsResponse {
  forms: Form[];
  source: 'sheets' | 'memory';
}

export default function AdminPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [source, setSource] = useState<'sheets' | 'memory'>('memory');
  const [deleting, setDeleting] = useState<Form | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const router = useRouter();

  async function fetchForms() {
    try {
      const res = await fetch('/api/forms', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as FormsResponse;
        setForms(data.forms || []);
        setSource(data.source);
      }
    } catch (error) {
      console.error('[admin] Error fetching forms:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchForms();
  }, []);

  const { inputsFocused } = useShortcutGuard();

  const handleShortcut = useCallback((shortcut: { key: string }) => {
    if (shortcut.key === 'N') setShowCreate(true);
    if (shortcut.key === 'Escape') setShowCreate(false);
    if (shortcut.key === '?') setShowGuide((v) => !v);
  }, []);

  useShortcuts({
    shortcuts: [
      { key: 'N', enabled: !inputsFocused },
      { key: 'Escape', enabled: !inputsFocused && showCreate },
      { key: '?', enabled: !inputsFocused },
      { key: 'L', enabled: !inputsFocused, handler: () => handleLogout() },
    ],
    onTrigger: handleShortcut,
  }, [handleShortcut, showCreate, inputsFocused]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('[admin] Logout error:', error);
      setIsLoggingOut(false);
    }
  }

  async function handleCreated(form: Form) {
    setShowCreate(false);
    await fetchForms();
    router.push(`/admin/${form.id}`);
  }

  async function handleDelete() {
    if (!deleting) return;
    const res = await fetch(`/api/forms/${deleting.id}`, { method: 'DELETE' });
    setDeleting(null);
    if (res.ok) {
      await fetchForms();
    }
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <FlowerLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ShortcutTooltip label="Keyboard shortcuts" shortcut="?">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setShowGuide((v) => !v)}
                aria-label="Toggle shortcut guide"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </ShortcutTooltip>
            <ShortcutTooltip label="Logout" shortcut="L">
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                size="sm"
                className="h-9 rounded-full"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" /> Logout
              </Button>
            </ShortcutTooltip>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Surveys</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and review responses from all your forms.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                source === 'sheets'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              )}
              title={
                source === 'sheets'
                  ? 'Connected to Google Sheets'
                  : 'No Google Sheets credentials found; using in-memory storage.'
              }
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  source === 'sheets' ? 'bg-primary' : 'bg-amber-500'
                )}
              />
              {source === 'sheets' ? 'Google Sheets' : 'In-memory'}
            </span>
            <ShortcutTooltip label="New survey" shortcut="N">
              <Button onClick={() => setShowCreate(true)} size="sm" className="h-9 rounded-full">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New survey
              </Button>
            </ShortcutTooltip>
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="h-40 rounded-3xl border-border bg-card/50">
                  <CardContent className="p-5">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="mt-4 h-4 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : forms.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">No surveys yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first survey to start collecting responses.
              </p>
              <Button onClick={() => setShowCreate(true)} className="mt-5 rounded-full" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Create a survey
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <Card
                  key={form.id}
                  className={cn(
                    'group relative flex flex-col rounded-3xl border bg-card/50 p-0 transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_10px_30px_-15px_rgba(81,46,248,0.4)]',
                    form.isFeatured
                      ? 'border-amber-400/60 dark:border-amber-500/40 shadow-[0_0_20px_-8px_rgba(251,191,36,0.5)]'
                      : 'border-border'
                  )}
                >
                  <CardContent className="flex flex-1 flex-col p-5">
                    <Link href={`/admin/${form.id}`} className="flex flex-1 flex-col">
                      <div className="flex items-center justify-between">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                          {form.isFeatured && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] text-amber-950 shadow-sm">
                              <Star className="h-3 w-3 fill-current" />
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                      <h3 className="mt-4 line-clamp-2 text-base font-semibold">{form.title}</h3>
                      {form.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {form.description}
                        </p>
                      )}
                      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-xs text-muted-foreground">
                        <span className="rounded-full border border-border bg-background/60 px-2 py-0.5">
                          {form.questions.length} questions
                        </span>
                        <span>·</span>
                        <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                        {form.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            <Star className="h-2.5 w-2.5 fill-current" /> Featured
                          </span>
                        )}
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                            form.isPublished
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {form.isPublished ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(form)}
                      className="absolute right-3 top-3 h-7 rounded-full border border-border bg-background/70 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground opacity-0 backdrop-blur hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      aria-label={`Delete ${form.title}`}
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateSurveyDialog open={showCreate} onOpenChange={setShowCreate} onCreated={handleCreated} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the survey and every response it has collected. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShortcutsGuide
        open={showGuide}
        onOpenChange={setShowGuide}
        sections={[
          {
            title: 'General',
            shortcuts: [
              { keys: 'N', label: 'Create new survey' },
              { keys: 'L', label: 'Logout' },
              { keys: '?', label: 'Toggle shortcut guide' },
              { keys: 'Esc', label: 'Close dialog' },
            ],
          },
        ]}
      />
    </div>
    </TooltipProvider>
  );
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function CreateSurveyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (form: Form) => Promise<void> | void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = slugify(title) || `form-${Date.now()}`;

  function reset() {
    setTitle('');
    setDescription('');
    setError(null);
    setIsSubmitting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: slug,
          title: title.trim(),
          description: description.trim(),
          questions: [
            {
              id: 'q1',
              title: 'What would you like us to know?',
              type: 'textarea',
              required: false,
              order: 1,
            },
          ],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create form');
      }
      const form = (await res.json()) as Form;
      reset();
      await onCreated(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New survey</DialogTitle>
          <DialogDescription>Start with a title; you can edit questions next.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="title">
              Title
            </label>
            <Input
              id="title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Community Fundraising Survey"
              className="mt-1 rounded-xl"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">id: {slug}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="desc">
              Description
            </label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this survey for?"
              className="mt-1 resize-none rounded-xl"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full">
              {isSubmitting ? 'Creating…' : 'Create survey'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
