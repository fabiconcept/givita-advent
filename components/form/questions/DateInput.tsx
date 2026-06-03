'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DateInput({ value, onChange, placeholder = 'Pick a date' }: DateInputProps) {
  const [focused, setFocused] = useState(false);
  const pretty = value
    ? new Date(value + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="group relative">
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
        <Calendar className="h-5 w-5" />
      </div>
      <input
        type="date"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full cursor-pointer border-0 border-b-2 bg-transparent py-4 pl-8 pr-3 text-2xl font-semibold text-foreground sm:text-3xl',
          'placeholder:font-normal placeholder:text-muted-foreground/40',
          'transition-all duration-200',
          focused ? 'border-primary' : 'border-border',
          'focus:border-primary focus:outline-none focus:ring-0',
          '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60'
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-[#7a5cfa] transition-transform duration-300',
          focused && 'scale-x-100'
        )}
      />
      {!value && (
        <span className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-normal text-muted-foreground/40 sm:text-3xl">
          {placeholder}
        </span>
      )}
      {pretty && (
        <p className="mt-2 text-sm text-muted-foreground">{pretty}</p>
      )}
    </div>
  );
}
