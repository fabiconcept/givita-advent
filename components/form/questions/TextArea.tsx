'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextArea({ value, onChange, placeholder = 'Type your answer here…' }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [value]);

  return (
    <div className="group relative rounded-2xl border border-border bg-card/40 p-1 transition-all duration-200 focus-within:border-primary/60 focus-within:bg-card/70 focus-within:shadow-[0_8px_30px_-12px_rgba(81,46,248,0.4)]">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={cn(
          'w-full resize-none border-0 bg-transparent px-4 py-3 text-base leading-relaxed text-foreground',
          'placeholder:text-muted-foreground/50',
          'transition-all duration-200',
          'focus:outline-none focus:ring-0'
        )}
      />
      <p className="px-4 pb-2 text-[11px] text-muted-foreground/70">
        Tip: press <kbd className="rounded border border-border bg-background/60 px-1 font-mono text-[10px]">Shift</kbd> +{' '}
        <kbd className="rounded border border-border bg-background/60 px-1 font-mono text-[10px]">Enter</kbd> for a new line
      </p>
    </div>
  );
}
