'use client';

import { FormQuestion } from '@/types';
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
import { GripVertical, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SortableOptions({
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
                key={optIdx}
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
        title="Drag option"
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
        title="Remove option"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </li>
  );
}
