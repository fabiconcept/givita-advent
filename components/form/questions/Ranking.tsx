'use client';

import { useEffect, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface RankingProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function Ranking({ options, value, onChange }: RankingProps) {
  const initial = value.length === options.length && value.every((v) => options.includes(v)) ? value : options;
  const [items, setItems] = useState<string[]>(initial);

  useEffect(() => {
    setItems(initial);
  }, [options.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Rank from most preferred to least. Drag to reorder, or focus and use <kbd className="rounded border border-border bg-background/60 px-1 font-mono text-[10px]">Space</kbd> + arrow keys.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2.5">
            {items.map((item, idx) => (
              <SortableRow key={item} id={item} item={item} index={idx} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({ id, item, index }: { id: string; item: string; index: number }) {
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
        'group flex items-center gap-3 rounded-2xl border bg-card/40 px-3 py-3 transition-all duration-200',
        isDragging
          ? 'z-10 border-primary bg-card/90 shadow-[0_20px_40px_-12px_rgba(81,46,248,0.45)]'
          : 'border-border hover:border-primary/40'
      )}
    >
      <button
        type="button"
        aria-label={`Drag handle for ${item}`}
        title={`Drag handle for ${item}`}
        className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-semibold transition-colors',
          index === 0
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/60 text-muted-foreground group-hover:text-foreground'
        )}
      >
        {index + 1}
      </span>
      <span className="flex-1 text-base">{item}</span>
    </li>
  );
}
