'use client';

import { FormQuestion } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import { QUESTION_TYPES } from './questionTypes';
import { SortableOptions } from './SortableOptions';

export function EditQuestionCard({
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
      data-question-id={id}
      className={cn(
        'rounded-3xl border bg-card/40 p-5 backdrop-blur',
        isDragging
          ? 'z-10 border-primary bg-card/90 shadow-[0_20px_40px_-12px_rgba(81,46,248,0.45)]'
          : 'border-border'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="hidden flex-col items-center gap-2 pt-0.5 sm:flex">
          <button
            type="button"
            aria-label="Drag question"
            title="Drag question"
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
        <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary sm:hidden">
              {index + 1}
            </div>
            <Input
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Question title"
              className="h-9 rounded-lg text-sm font-medium"
            />
          </div>
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
              <SelectTrigger className="h-8 w-full rounded-full text-xs sm:w-48">
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
            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  value={question.placeholder || ''}
                  onChange={(e) => onUpdate({ placeholder: e.target.value || undefined })}
                  placeholder="Placeholder text (optional)"
                  className="h-8 rounded-lg text-xs"
                />
                {(question.type === 'text' || question.type === 'textarea' || question.type === 'email') && (
                  <>
                    <Input
                      type="number"
                      min={0}
                      value={question.minLength ?? ''}
                      onChange={(e) => onUpdate({ minLength: e.target.value === '' ? undefined : Number(e.target.value) })}
                      placeholder="Min chars"
                      className="h-8 rounded-lg text-xs"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={question.maxLength ?? ''}
                      onChange={(e) => onUpdate({ maxLength: e.target.value === '' ? undefined : Number(e.target.value) })}
                      placeholder="Max chars"
                      className="h-8 rounded-lg text-xs"
                    />
                  </>
                )}
              </div>
              {(question.type === 'text' || question.type === 'textarea' || question.type === 'email' || question.type === 'phone') && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={question.pattern || ''}
                    onChange={(e) => onUpdate({ pattern: e.target.value || undefined })}
                    placeholder="Regex pattern (e.g. ^[A-Z].+$)"
                    className="h-8 rounded-lg text-xs font-mono"
                  />
                  <Input
                    value={question.patternMessage || ''}
                    onChange={(e) => onUpdate({ patternMessage: e.target.value || undefined })}
                    placeholder="Custom error message (optional)"
                    className="h-8 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="hidden flex-col items-end gap-1 sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
            className="h-7 w-7 rounded-md text-muted-foreground disabled:opacity-30"
            aria-label="Move up"
            title="Move up"
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
            title="Move down"
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
              title="Duplicate question"
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
            title="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/40 pt-3 sm:hidden">
        <span className="mr-auto text-xs text-muted-foreground">{question.type}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveUp}
          disabled={index === 0}
          className="h-9 w-9 rounded-md text-muted-foreground disabled:opacity-30"
          aria-label="Move up"
          title="Move up"
        >
          <span className="text-xs">▲</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="h-9 w-9 rounded-md text-muted-foreground disabled:opacity-30"
          aria-label="Move down"
          title="Move down"
        >
          <span className="text-xs">▼</span>
        </Button>
        {onDuplicate && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDuplicate}
            className="h-9 w-9 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary"
            aria-label="Duplicate question"
            title="Duplicate question"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-9 w-9 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete question"
          title="Delete question"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
