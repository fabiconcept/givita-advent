'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useShortcuts from '@useverse/useshortcuts';
import { useShortcutGuard } from '@/components/ShortcutGuard';
import { Form, FormQuestion } from '@/types';
import { ImportQuestionsDialog } from '@/components/admin/ImportQuestionsDialog';
import { ShortcutTooltip } from '@/components/admin/ShortcutTooltip';
import { ShortcutHint } from '@/components/admin/ShortcutHint';
import { ShortcutsGuide } from '@/components/admin/ShortcutsGuide';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FlowerLogo } from '@/components/admin/FlowerLogo';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  ListChecks,
  CheckCircle2,
  BarChart3,
  Star,
  Inbox,
  Trash2,
  Power,
  Edit3,
  Save,
  X,
  Plus,
  Keyboard,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResponseStats } from '@/components/admin/editor/questionTypes';
import { TabButton } from '@/components/admin/editor/TabButton';
import { StatsCard } from '@/components/admin/editor/StatsCard';
import { QuestionStats } from '@/components/admin/editor/QuestionStats';
import { EditQuestionCard } from '@/components/admin/editor/EditQuestionCard';
import { ViewQuestionCard } from '@/components/admin/editor/ViewQuestionCard';
import { AnimateInView } from '@/components/admin/editor/AnimateInView';
import { EmptyAnalytics } from '@/components/admin/editor/EmptyAnalytics';
import { LoadingShell } from '@/components/admin/editor/LoadingShell';
import { NotFoundShell } from '@/components/admin/editor/NotFoundShell';

export default function AdminResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const focusedQuestionRef = useRef<string | null>(null);
  const editQuestionsRef = useRef<FormQuestion[]>([]);

  const [form, setForm] = useState<Form | null>(null);
  const [stats, setStats] = useState<ResponseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editQuestions, setEditQuestions] = useState<FormQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'editor'>('analytics');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function fetchData() {
    try {
      const [formRes, statsRes] = await Promise.all([
        fetch(`/api/forms/${formId}`, { cache: 'no-store' }),
        fetch(`/api/forms/${formId}/responses?stats=true`, { cache: 'no-store' }),
      ]);
      if (formRes.ok) {
        const data = (await formRes.json()) as Form;
        setForm(data);
        setEditTitle(data.title);
        setEditDescription(data.description);
        setEditQuestions(
          [...data.questions]
            .sort((a, b) => a.order - b.order)
            .map((q, i) => ({ ...q, order: i + 1 }))
        );
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      /* handled by empty state */
    } finally {
      setIsLoading(false);
    }
  }

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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const { inputsFocused } = useShortcutGuard();

  useEffect(() => {
    if (focusedQuestionRef.current) {
      const el = document.querySelector(`[data-question-id="${focusedQuestionRef.current}"] input`);
      (el as HTMLInputElement)?.focus();
      focusedQuestionRef.current = null;
    }
  }, [editQuestions.length]);

  useEffect(() => {
    editQuestionsRef.current = editQuestions;
  }, [editQuestions]);

  const handleShortcut = useCallback((shortcut: { key: string; shiftKey?: boolean }) => {
    switch (shortcut.key) {
      case 'S':
        if (editing) handleSave();
        break;
      case 'Escape':
        if (editing) { setEditing(false); return; }
        break;
      case 'N':
        if (editing) addQuestion();
        break;
      case 'P':
        if (!editing) togglePublished();
        break;
      case 'F':
        if (!editing) setFeatured();
        break;
      case 'E':
        if (!editing) { setEditing(true); setActiveTab('editor'); return; }
        break;
      case 'Slash':
        if (shortcut.shiftKey) setShowGuide((v) => !v);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  useShortcuts({
    shortcuts: [
      { key: 'S', ctrlKey: true, enabled: !inputsFocused && editing, platformAware: true },
      { key: 'Escape', enabled: !inputsFocused },
      { key: 'N', enabled: !inputsFocused && editing },
      { key: 'P', enabled: !inputsFocused && !editing },
      { key: 'F', enabled: !inputsFocused && !editing },
      { key: 'E', enabled: !inputsFocused && !editing },
      { key: 'Slash', shiftKey: true, enabled: !inputsFocused },
    ],
    onTrigger: handleShortcut,
  }, [handleShortcut, inputsFocused]);

  async function togglePublished() {
    if (!form) return;
    setError(null);
    const res = await fetch(`/api/forms/${formId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !form.isPublished }),
    });
    if (res.ok) {
      const updated = (await res.json()) as Form;
      setForm(updated);
    } else {
      setError('Failed to update form status');
    }
  }

  async function setFeatured() {
    if (!form) return;
    setError(null);
    const res = await fetch('/api/forms/featured', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId }),
    });
    if (res.ok) {
      const data = await res.json();
      setForm((prev) => prev ? { ...prev, isFeatured: data.form.isFeatured } : prev);
    } else {
      setError('Failed to set as featured');
    }
  }

  async function handleSave() {
    if (!editTitle.trim()) {
      setError('Title is required');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription,
          questions: editQuestionsRef.current.map((q, i) => ({ ...q, order: i + 1 })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      const updated = (await res.json()) as Form;
      setForm(updated);
      setEditTitle(updated.title);
      setEditDescription(updated.description);
      setEditQuestions([...updated.questions].sort((a, b) => a.order - b.order));
      setEditing(false);
      setActiveTab('analytics');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!form) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/forms/${formId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Delete failed');
      }
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setIsDeleting(false);
    }
  }

  function updateQuestion(index: number, patch: Partial<FormQuestion>) {
    setEditQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function removeQuestion(index: number) {
    setEditQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setEditQuestions((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function onQuestionsDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setEditQuestions((prev) => {
      const oldIndex = prev.findIndex((q) => q.id === active.id);
      const newIndex = prev.findIndex((q) => q.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function addQuestion() {
    const id = `q${Date.now()}`;
    focusedQuestionRef.current = id;
    setEditQuestions((prev) => {
      const order = prev.length + 1;
      return [
        ...prev,
        {
          id,
          title: 'New question',
          type: 'text',
          required: false,
          order,
        },
      ];
    });
  }

  function importQuestions(imported: FormQuestion[]) {
    setEditQuestions((prev) => {
      const next = [...prev];
      imported.forEach((q, i) => {
        next.push({ ...q, id: `q${Date.now()}_${i}`, order: next.length + 1 });
      });
      return next;
    });
  }

  function duplicateQuestion(index: number) {
    setEditQuestions((prev) => {
      const next = [...prev];
      const orig = next[index];
      next.splice(index + 1, 0, {
        ...orig,
        id: `q${Date.now()}`,
        title: `${orig.title} (copy)`,
        order: index + 2,
      });
      return next.map((q, i) => ({ ...q, order: i + 1 }));
    });
  }

  if (isLoading) return <LoadingShell />;
  if (!form || !stats) return <NotFoundShell />;

  const totalResponses = stats.totalResponses || 0;
  const completion = totalResponses > 0 ? '100%' : 'N/A';
  const displayedQuestions = editing
    ? editQuestions
    : [...form.questions].sort((a, b) => a.order - b.order);

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background text-foreground" data-mode={editing ? 'edit' : 'view'}>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
          <div className="flex items-center justify-between">
            <FlowerLogo />
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full sm:hidden"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2" data-tip="survey-actions">
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
            {editing ? (
              <>
                <ShortcutTooltip label="Cancel editing" shortcut="Esc">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-full"
                    data-tip="cancel-btn"
                    onClick={() => {
                      setEditing(false);
                      setEditTitle(form.title);
                      setEditDescription(form.description);
                      setEditQuestions([...form.questions].sort((a, b) => a.order - b.order));
                      setError(null);
                      setActiveTab('analytics');
                    }}
                    disabled={isSaving}
                    title="Cancel editing"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" /> Cancel <ShortcutHint shortcut="Esc" />
                  </Button>
                </ShortcutTooltip>
                <ShortcutTooltip label="Save changes" shortcut="⌘S">
                  <Button size="sm" className="h-9 rounded-full" data-tip="save-btn" onClick={handleSave} disabled={isSaving} title={isSaving ? 'Saving…' : 'Save changes'}>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> {isSaving ? 'Saving…' : 'Save'} <ShortcutHint shortcut="⌘S" />
                  </Button>
                </ShortcutTooltip>
              </>
            ) : (
              <>
                <ShortcutTooltip label="Toggle publish" shortcut="P">
                  <Button variant="outline" size="sm" className="h-9 rounded-full" data-tip="publish-btn" onClick={togglePublished} title={form.isPublished ? 'Unpublish' : 'Publish as draft'}>
                    {form.isPublished ? 'Unpublish' : 'Draft'} <ShortcutHint shortcut="P" />
                  </Button>
                </ShortcutTooltip>
                <ShortcutTooltip label={form.isFeatured ? 'Remove featured status' : 'Mark as featured'} shortcut="F">
                  <Button
                    variant={form.isFeatured ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 rounded-full"
                    data-tip="featured-btn"
                    onClick={setFeatured}
                    title={form.isFeatured ? 'Remove featured status' : 'Mark as featured'}
                  >
                    <Star className={`mr-1.5 h-3.5 w-3.5 ${form.isFeatured ? 'fill-current' : ''}`} />
                    {form.isFeatured ? 'Featured' : 'Set featured'} <ShortcutHint shortcut="F" />
                  </Button>
                </ShortcutTooltip>
                <ShortcutTooltip label="Enter edit mode" shortcut="E">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full"
                    data-tip="edit-mode-btn"
                    onClick={() => {
                      setEditing(true);
                      setActiveTab('editor');
                    }}
                    title="Enter edit mode"
                  >
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit <ShortcutHint shortcut="E" />
                  </Button>
                </ShortcutTooltip>
                <ShortcutTooltip label="Open public form">
                  <Button asChild size="sm" className="h-9 rounded-full">
                    <Link href={`/forms/${formId}`} target="_blank" rel="noopener noreferrer" title="Open public form">
                      Open form <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </ShortcutTooltip>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full border-0 bg-primary/10 text-primary">
              <FileText className="mr-1.5 h-3 w-3" /> Survey
            </Badge>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                form.isPublished
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  form.isPublished ? 'bg-primary' : 'bg-muted-foreground'
                )}
              />
              {form.isPublished ? 'Live' : 'Draft'}
            </span>
          </div>
          {editing ? (
            <div className="mt-4 space-y-3">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-auto rounded-xl px-3 py-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                placeholder="Form title"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="resize-none rounded-xl text-sm"
                placeholder="Optional description"
              />
            </div>
          ) : (
            <>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{form.title}</h1>
              {form.description && (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{form.description}</p>
              )}
            </>
          )}
          {error && (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-xs text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
                title={isDeleting ? 'Deleting…' : 'Delete survey'}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {isDeleting ? 'Deleting…' : 'Delete survey'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &ldquo;{form.title}&rdquo;?</AlertDialogTitle>
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
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3" data-tip="analytics-stats">
          <StatsCard
            label="Total responses"
            value={totalResponses}
            icon={<Inbox className="h-4 w-4" />}
          />
          <StatsCard
            label="Questions"
            value={form.questions.length}
            icon={<ListChecks className="h-4 w-4" />}
          />
          <StatsCard
            label="Completion rate"
            value={completion}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </div>

        <div className="mt-10 flex gap-1 rounded-full border border-border bg-muted/30 p-1 text-sm">
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} data-tip="tab-analytics">
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Analytics
          </TabButton>
          <TabButton active={activeTab === 'editor'} onClick={() => setActiveTab('editor')} data-tip="tab-editor">
            <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Editor
          </TabButton>
        </div>

        {activeTab === 'editor' ? (
          <div className="mt-6 grid gap-4">
            {editing ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onQuestionsDragEnd}>
                <SortableContext items={editQuestions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                  {editQuestions.map((q, idx) => (
                    <AnimateInView key={q.id} delay={idx * 60}>
                      <EditQuestionCard
                        id={q.id}
                        index={idx}
                        total={editQuestions.length}
                        question={q}
                        onUpdate={(patch) => updateQuestion(idx, patch)}
                        onRemove={() => removeQuestion(idx)}
                        onMoveUp={() => moveQuestion(idx, -1)}
                        onMoveDown={() => moveQuestion(idx, 1)}
                        onDuplicate={() => duplicateQuestion(idx)}
                      />
                    </AnimateInView>
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              editQuestions.map((q, idx) => (
                <AnimateInView key={q.id} delay={idx * 60}>
                  <ViewQuestionCard question={q} index={idx} />
                </AnimateInView>
              ))
            )}
            {editing && (
              <div className="flex flex-wrap gap-2">
                <ShortcutTooltip label="Add question" shortcut="N">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addQuestion}
                    className="h-12 rounded-3xl border-dashed text-sm font-medium text-muted-foreground hover:text-foreground"
                    title="Add question"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add question <ShortcutHint shortcut="N" />
                  </Button>
                </ShortcutTooltip>
                <ImportQuestionsDialog onImport={importQuestions} />
              </div>
            )}
          </div>
        ) : totalResponses > 0 ? (
          <div className="mt-6 grid gap-6">
            {displayedQuestions.map((question, idx) => {
              const qStats = stats.stats[question.id];
              return (
                <AnimateInView key={question.id} delay={idx * 60}>
                  <article
                    className="rounded-3xl border border-border bg-card/40 p-4 backdrop-blur sm:p-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                          <h3 className="text-base font-semibold">{question.title}</h3>
                          <Badge variant="secondary" className="self-start rounded-full border-0 bg-muted text-muted-foreground sm:self-auto">
                            {question.type}
                          </Badge>
                        </div>
                        {question.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{question.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5">
                      <QuestionStats question={question} qStats={qStats} totalResponses={totalResponses} />
                    </div>
                  </article>
                </AnimateInView>
              );
            })}
          </div>
        ) : (
          <EmptyAnalytics formId={formId} />
        )}
      </main>

      <ShortcutsGuide
        open={showGuide}
        onOpenChange={setShowGuide}
        sections={[
          {
            title: 'Editing',
            shortcuts: [
              { keys: '⌘S', label: 'Save changes' },
              { keys: 'Esc', label: 'Cancel editing' },
              { keys: 'N', label: 'Add question' },
            ],
          },
          {
            title: 'Viewing',
            shortcuts: [
              { keys: 'P', label: 'Toggle publish' },
              { keys: 'F', label: 'Toggle featured' },
              { keys: 'E', label: 'Enter edit mode' },
            ],
          },
          {
            title: 'General',
            shortcuts: [
              { keys: '?', label: 'Toggle shortcut guide' },
            ],
          },
        ]}
      />
    </div>
    </TooltipProvider>
  );
}
