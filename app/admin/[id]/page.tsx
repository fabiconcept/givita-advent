'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useShortcuts from '@useverse/useshortcuts';
import { useShortcutGuard } from '@/components/ShortcutGuard';
import { Form, FormQuestion } from '@/types';
import { ImportQuestionsDialog } from '@/components/admin/ImportQuestionsDialog';
import { ShortcutTooltip } from '@/components/admin/ShortcutTooltip';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  ListChecks,
  CheckCircle2,
  BarChart3,
  Type as TypeIcon,
  Star,
  Inbox,
  Trash2,
  Power,
  Edit3,
  Save,
  X,
  Plus,
  GripVertical,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponseStats {
  formId: string;
  totalResponses: number;
  stats: Record<
    string,
    {
      question: string;
      type: string;
      responses: Array<string | string[] | number>;
      count: number;
      distribution?: Record<string, number>;
      average?: number;
      values?: number[];
    }
  >;
}

const QUESTION_TYPES: { value: FormQuestion['type']; label: string; group: string }[] = [
  { value: 'multiple-choice', label: 'Multiple choice', group: 'Choice' },
  { value: 'checkbox', label: 'Checkboxes', group: 'Choice' },
  { value: 'ranking', label: 'Ranking', group: 'Choice' },
  { value: 'yes-no', label: 'Yes / No', group: 'Choice' },
  { value: 'likert-scale', label: 'Likert scale', group: 'Scale' },
  { value: 'rating', label: 'Star rating', group: 'Scale' },
  { value: 'text', label: 'Short text', group: 'Text' },
  { value: 'textarea', label: 'Long text', group: 'Text' },
  { value: 'email', label: 'Email', group: 'Text' },
  { value: 'number', label: 'Number', group: 'Text' },
  { value: 'url', label: 'URL', group: 'Text' },
  { value: 'phone', label: 'Phone', group: 'Text' },
  { value: 'date', label: 'Date', group: 'Text' },
];

export default function AdminResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

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
    } catch (err) {
      console.error('[admin] Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const { inputsFocused } = useShortcutGuard();

  const handleShortcut = useCallback((shortcut: { key: string }) => {
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
      case '?':
        setShowGuide((v) => !v);
        break;
    }
  }, [editing]);

  useShortcuts({
    shortcuts: [
      { key: 'S', ctrlKey: true, enabled: !inputsFocused && editing, platformAware: true },
      { key: 'Escape', enabled: !inputsFocused },
      { key: 'N', enabled: !inputsFocused && editing },
      { key: 'P', enabled: !inputsFocused && !editing },
      { key: 'F', enabled: !inputsFocused && !editing },
      { key: 'E', enabled: !inputsFocused && !editing },
      { key: '?', enabled: !inputsFocused },
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
          questions: editQuestions.map((q, i) => ({ ...q, order: i + 1 })),
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
    setEditQuestions((prev) => {
      const id = `q${Date.now()}`;
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
            {editing ? (
              <>
                <ShortcutTooltip label="Cancel editing" shortcut="Esc">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-full"
                    onClick={() => {
                      setEditing(false);
                      setEditTitle(form.title);
                      setEditDescription(form.description);
                      setEditQuestions([...form.questions].sort((a, b) => a.order - b.order));
                      setError(null);
                      setActiveTab('analytics');
                    }}
                    disabled={isSaving}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
                  </Button>
                </ShortcutTooltip>
                <ShortcutTooltip label="Save changes" shortcut="⌘S">
                  <Button size="sm" className="h-9 rounded-full" onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> {isSaving ? 'Saving…' : 'Save'}
                  </Button>
                </ShortcutTooltip>
              </>
            ) : (
              <>
                <ShortcutTooltip label="Toggle publish" shortcut="P">
                  <Button variant="outline" size="sm" className="h-9 rounded-full" onClick={togglePublished}>
                    {form.isPublished ? 'Unpublished' : 'Draft'}
                  </Button>
                </ShortcutTooltip>
                <ShortcutTooltip label={form.isFeatured ? 'Remove featured status' : 'Mark as featured'} shortcut="F">
                  <Button
                    variant={form.isFeatured ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 rounded-full"
                    onClick={setFeatured}
                  >
                    <Star className={`mr-1.5 h-3.5 w-3.5 ${form.isFeatured ? 'fill-current' : ''}`} />
                    {form.isFeatured ? 'Featured' : 'Set featured'}
                  </Button>
                </ShortcutTooltip>
                <ShortcutTooltip label="Enter edit mode" shortcut="E">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full"
                    onClick={() => {
                      setEditing(true);
                      setActiveTab('editor');
                    }}
                  >
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                </ShortcutTooltip>
                <ShortcutTooltip label="Open public form">
                  <Button asChild size="sm" className="h-9 rounded-full">
                    <Link href={`/forms/${formId}`} target="_blank" rel="noopener noreferrer">
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
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {isDeleting ? 'Deleting…' : 'Delete survey'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{form.title}”?</AlertDialogTitle>
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

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total responses"
            value={totalResponses}
            tone="primary"
            icon={<Inbox className="h-4 w-4" />}
          />
          <StatCard
            label="Questions"
            value={form.questions.length}
            tone="primary"
            icon={<ListChecks className="h-4 w-4" />}
          />
          <StatCard
            label="Completion rate"
            value={completion}
            tone="primary"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </div>

        <div className="mt-10 flex gap-1 rounded-full border border-border bg-muted/30 p-1 text-sm">
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Analytics
          </TabButton>
          <TabButton active={activeTab === 'editor'} onClick={() => setActiveTab('editor')}>
            <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Editor
          </TabButton>
        </div>

        {activeTab === 'editor' ? (
          <div className="mt-6 grid gap-4">
            {editing ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onQuestionsDragEnd}>
                <SortableContext items={editQuestions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                  {editQuestions.map((q, idx) => (
                    <SortableQuestionCard
                      key={q.id}
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
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              editQuestions.map((q, idx) => (
                <article
                  key={q.id}
                  className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold">{q.title}</h3>
                      {q.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{q.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-full border-0 bg-muted text-muted-foreground">
                      {q.type}
                    </Badge>
                  </div>
                </article>
              ))
            )}
            {editing && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="h-12 rounded-3xl border-dashed text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add question
                </Button>
                <ImportQuestionsDialog onImport={importQuestions} />
              </div>
            )}
          </div>
        ) : totalResponses > 0 ? (
          <div className="mt-6 grid gap-6">
            {displayedQuestions.map((question, idx) => {
              const qStats = stats.stats[question.id];
              return (
                <article
                  key={question.id}
                  className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold">{question.title}</h3>
                      {question.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{question.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-full border-0 bg-muted text-muted-foreground">
                      {question.type}
                    </Badge>
                  </div>

                  <div className="mt-5">
                    <QuestionStats question={question} qStats={qStats} totalResponses={totalResponses} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/30 px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No responses yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Share the form to start collecting responses. Analytics will appear here as they come in.
            </p>
            <Button asChild size="sm" className="mt-5 rounded-full">
              <Link href={`/forms/${formId}`} target="_blank" rel="noopener noreferrer">
                Open form <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex flex-1 items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-all',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  tone: 'primary' | 'success';
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-3xl border-border bg-card/40 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>{label}</span>
          <span className="text-muted-foreground/70">{icon}</span>
        </div>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function QuestionStats({
  question,
  qStats,
  totalResponses,
}: {
  question: FormQuestion;
  qStats: ResponseStats['stats'][string] | undefined;
  totalResponses: number;
}) {
  if (!qStats || qStats.count === 0) {
    return <p className="text-sm italic text-muted-foreground">No responses yet.</p>;
  }

  if (question.type === 'multiple-choice' || question.type === 'checkbox' || question.type === 'yes-no') {
    const dist = qStats.distribution || {};
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
    const barColors = ['#512ef8', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#f97316', '#84cc16', '#ec4899', '#14b8a6'];
    return (
      <div className="space-y-1.5">
        {entries.map(([option, count], i) => {
          const pct = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
          return (
            <div key={option} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-xs font-medium">{option}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${pct}%`, backgroundColor: barColors[i % barColors.length] }}
                />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                {count} · {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === 'likert-scale' || question.type === 'rating') {
    const dist = qStats.distribution || {};
    const max = question.maxScore || 5;
    const values = qStats.values || [];
    return (
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums text-primary">
            {qStats.average ?? '0.0'}
          </span>
          <span className="text-sm text-muted-foreground">/ {max} average</span>
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3" /> {values.length} ratings
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: max }, (_, i) => i + 1).map((score) => {
            const count = dist[String(score)] || 0;
            const pct = values.length > 0 ? (count / values.length) * 100 : 0;
            return (
              <div key={score} className="flex items-center gap-3 text-sm">
                <span className="w-6 font-mono text-xs text-muted-foreground">{score}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // number
  if (question.type === 'number') {
    const values = (qStats.responses as Array<number>) || [];
    const nums = values.filter((v) => typeof v === 'number');
    if (nums.length === 0) {
      return <p className="text-sm italic text-muted-foreground">No numeric responses yet.</p>;
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = sum / nums.length;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Average</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{avg.toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Min</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{min}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Max</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{max}</p>
        </div>
      </div>
    );
  }

  // text, textarea, email, url, phone, date
  const responses = (qStats.responses as Array<string>) || [];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TypeIcon className="h-3 w-3" /> {responses.length} {responses.length === 1 ? 'response' : 'responses'}
      </div>
      <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {responses.slice(0, 20).map((r, i) => (
          <li
            key={i}
            className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground/90"
          >
            {r || <span className="italic text-muted-foreground">empty</span>}
          </li>
        ))}
      </ul>
      {responses.length > 20 && <p className="text-xs text-muted-foreground">+{responses.length - 20} more</p>}
    </div>
  );
}

function SortableQuestionCard({
  id,
  index,
  total,
  question,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: {
  id: string;
  index: number;
  total: number;
  question: FormQuestion;
  onUpdate: (patch: Partial<FormQuestion>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-3xl border bg-card/40 p-5 backdrop-blur',
        isDragging
          ? 'z-10 border-primary bg-card/90 shadow-[0_20px_40px_-12px_rgba(81,46,248,0.45)]'
          : 'border-border'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-2 pt-0.5">
          <button
            type="button"
            aria-label="Drag question"
            className="flex h-7 w-7 cursor-grab items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
            {index + 1}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <Input
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Question title"
            className="h-9 rounded-lg text-sm font-medium"
          />
          <Textarea
            value={question.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value || undefined })}
            placeholder="Optional description"
            rows={2}
            className="resize-none rounded-lg text-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={question.type}
              onValueChange={(value) => onUpdate({ type: value as FormQuestion['type'] })}
            >
              <SelectTrigger className="h-8 w-48 rounded-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Choice', 'Scale', 'Text'].map((group) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>
                    {QUESTION_TYPES.filter((t) => t.group === group).map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <div className="flex h-8 items-center gap-2 rounded-full border border-input bg-background px-3 text-xs">
              <Switch
                id={`req-${id}`}
                checked={question.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
                className="scale-75"
              />
              <Label htmlFor={`req-${id}`} className="cursor-pointer text-xs">
                Required
              </Label>
            </div>
          </div>

          {(question.type === 'multiple-choice' || question.type === 'checkbox' || question.type === 'ranking') && (
            <SortableOptions question={question} onUpdate={onUpdate} />
          )}

          {question.type === 'likert-scale' && (
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                value={question.minLabel || ''}
                onChange={(e) => onUpdate({ minLabel: e.target.value })}
                placeholder="Min label (e.g. Strongly disagree)"
                className="h-8 rounded-lg text-xs"
              />
              <Input
                value={question.maxLabel || ''}
                onChange={(e) => onUpdate({ maxLabel: e.target.value })}
                placeholder="Max label (e.g. Strongly agree)"
                className="h-8 rounded-lg text-xs"
              />
              <Input
                type="number"
                min={2}
                max={10}
                value={question.maxScore || 5}
                onChange={(e) => onUpdate({ maxScore: Math.max(2, Math.min(10, Number(e.target.value) || 5)) })}
                className="h-8 rounded-lg text-xs"
              />
            </div>
          )}

          {question.type === 'rating' && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={question.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value || undefined })}
                placeholder="Helper text (optional)"
                className="h-8 rounded-lg text-xs"
              />
              <Input
                type="number"
                min={3}
                max={10}
                value={question.maxScore || 5}
                onChange={(e) => onUpdate({ maxScore: Math.max(3, Math.min(10, Number(e.target.value) || 5)) })}
                placeholder="Max stars"
                className="h-8 rounded-lg text-xs"
              />
            </div>
          )}

          {question.type === 'number' && (
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                type="number"
                value={question.min ?? ''}
                onChange={(e) => onUpdate({ min: e.target.value === '' ? undefined : Number(e.target.value) })}
                placeholder="Min"
                className="h-8 rounded-lg text-xs"
              />
              <Input
                type="number"
                value={question.max ?? ''}
                onChange={(e) => onUpdate({ max: e.target.value === '' ? undefined : Number(e.target.value) })}
                placeholder="Max"
                className="h-8 rounded-lg text-xs"
              />
              <Input
                value={question.unit || ''}
                onChange={(e) => onUpdate({ unit: e.target.value || undefined })}
                placeholder="Unit (e.g. $)"
                className="h-8 rounded-lg text-xs"
              />
            </div>
          )}

          {(question.type === 'text' ||
            question.type === 'textarea' ||
            question.type === 'email' ||
            question.type === 'url' ||
            question.type === 'phone' ||
            question.type === 'date') && (
            <Input
              value={question.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value || undefined })}
              placeholder="Placeholder text (optional)"
              className="h-8 rounded-lg text-xs"
            />
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
            className="h-7 w-7 rounded-md text-muted-foreground disabled:opacity-30"
            aria-label="Move up"
          >
            <span className="text-xs">▲</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="h-7 w-7 rounded-md text-muted-foreground disabled:opacity-30"
            aria-label="Move down"
          >
            <span className="text-xs">▼</span>
          </Button>
          {onDuplicate && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              className="h-7 w-7 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary"
              aria-label="Duplicate question"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-7 w-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function SortableOptions({
  question,
  onUpdate,
}: {
  question: FormQuestion;
  onUpdate: (patch: Partial<FormQuestion>) => void;
}) {
  const options = question.options || [];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = options.indexOf(String(active.id));
    const newIndex = options.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onUpdate({ options: arrayMove(options, oldIndex, newIndex) });
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Options</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={options} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1.5">
            {options.map((opt, optIdx) => (
              <SortableOptionRow
                key={`${opt}-${optIdx}`}
                id={opt}
                value={opt}
                onChange={(value) => {
                  const next = [...options];
                  next[optIdx] = value;
                  onUpdate({ options: next });
                }}
                onRemove={() => onUpdate({ options: options.filter((_, i) => i !== optIdx) })}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onUpdate({ options: [...options, `Option ${options.length + 1}`] })}
        className="h-7 rounded-full text-xs text-primary hover:bg-primary/10"
      >
        <Plus className="mr-1 h-3 w-3" /> Add option
      </Button>
    </div>
  );
}

function SortableOptionRow({
  id,
  value,
  onChange,
  onRemove,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2',
        isDragging && 'z-10'
      )}
    >
      <button
        type="button"
        aria-label="Drag option"
        className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 flex-1 rounded-lg text-xs"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label="Remove option"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </li>
  );
}

function LoadingShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="mt-4 h-10 w-72" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

function NotFoundShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-5 py-32 text-center sm:px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Survey not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The survey you’re looking for doesn’t exist.
        </p>
        <Button asChild className="mt-6 rounded-full" size="lg">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
