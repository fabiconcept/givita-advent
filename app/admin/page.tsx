'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useShortcuts from '@useverse/useshortcuts';
import { useShortcutGuard } from '@/components/ShortcutGuard';
import { Form } from '@/types';
import { FlowerLogo } from '@/components/admin/FlowerLogo';
import { ShortcutTooltip } from '@/components/admin/ShortcutTooltip';
import { ShortcutHint } from '@/components/admin/ShortcutHint';
import { ShortcutsGuide } from '@/components/admin/ShortcutsGuide';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { LogOut, FileText, Sparkles, Plus, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateSurveyDialog } from '@/components/admin/dashboard/CreateSurveyDialog';
import { SurveyCard } from '@/components/admin/dashboard/SurveyCard';

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
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchForms();
  }, []);

  const { inputsFocused } = useShortcutGuard();

  const handleShortcut = useCallback((shortcut: { key: string; shiftKey?: boolean }) => {
    if (shortcut.key === 'N') setShowCreate(true);
    if (shortcut.key === 'Escape') setShowCreate(false);
    if (shortcut.key === 'Slash' && shortcut.shiftKey) setShowGuide((v) => !v);
    if (shortcut.key === 'L') handleLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useShortcuts({
    shortcuts: [
      { key: 'N', enabled: !inputsFocused },
      { key: 'Escape', enabled: !inputsFocused && showCreate },
      { key: 'Slash', shiftKey: true, enabled: !inputsFocused },
      { key: 'L', enabled: !inputsFocused },
    ],
    onTrigger: handleShortcut,
  }, [handleShortcut, showCreate, inputsFocused]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
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
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-2 px-5 py-4 sm:gap-4 sm:px-8">
          <FlowerLogo />
          <div className="flex flex-wrap items-center justify-end gap-2" data-tip="dashboard-actions">
            <ThemeToggle />
            <ShortcutTooltip label="Keyboard shortcuts" shortcut="?">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setShowGuide((v) => !v)}
                aria-label="Toggle shortcut guide"
                title="Toggle shortcut guide"
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
                  title="Logout"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" /> <span className="hidden sm:inline">Logout</span> <ShortcutHint shortcut="L" className="hidden sm:inline-flex" />
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
              <Button onClick={() => setShowCreate(true)} size="sm" className="h-9 rounded-full" title="New survey">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New survey <ShortcutHint shortcut="N" />
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
              <Button onClick={() => setShowCreate(true)} className="mt-5 rounded-full" size="sm" title="Create a survey">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Create a survey <ShortcutHint shortcut="N" />
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <SurveyCard key={form.id} form={form} onDelete={setDeleting} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateSurveyDialog open={showCreate} onOpenChange={setShowCreate} onCreated={handleCreated} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleting?.title}&rdquo;?</AlertDialogTitle>
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
