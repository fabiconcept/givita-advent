'use client';

import { cn } from '@/lib/utils';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email';
  autoComplete?: string;
}

export function TextInput({ value, onChange, placeholder = 'Type your answer here…', autoComplete }: TextInputProps) {
  return (
    <div className="group relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          'w-full border-0 border-b-2 border-border bg-transparent px-0 py-4 text-2xl font-medium text-foreground',
          'placeholder:font-normal placeholder:text-muted-foreground/50',
          'transition-all duration-200',
          'focus:border-primary focus:outline-none focus:ring-0 focus:placeholder:text-muted-foreground/30',
          'sm:text-3xl'
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-[#7a5cfa] transition-transform duration-300',
          'group-focus-within:scale-x-100'
        )}
      />
    </div>
  );
}
