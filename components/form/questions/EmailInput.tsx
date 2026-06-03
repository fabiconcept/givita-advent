'use client';

import { cn } from '@/lib/utils';
import { Mail, Check, X } from 'lucide-react';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
}

function validateEmail(value: string) {
  if (!value) return { valid: false, status: 'empty' as const };
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return { valid: ok, status: ok ? ('valid' as const) : ('invalid' as const) };
}

export function EmailInput({ value, onChange }: EmailInputProps) {
  const { valid, status } = validateEmail(value);
  return (
    <div className="group relative">
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
        <Mail className="h-5 w-5" />
      </div>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        className={cn(
          'w-full border-0 border-b-2 bg-transparent py-4 pl-8 pr-10 text-2xl font-medium text-foreground',
          'placeholder:font-normal placeholder:text-muted-foreground/50',
          'transition-all duration-200',
          status === 'invalid'
            ? 'border-destructive focus:border-destructive'
            : 'border-border focus:border-primary',
          'focus:outline-none focus:ring-0 sm:text-3xl'
        )}
      />
      {status !== 'empty' && (
        <div
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 transition-all',
            valid ? 'text-[#22c55e] scale-100' : 'text-destructive scale-100'
          )}
        >
          {valid ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </div>
      )}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-300 group-focus-within:scale-x-100',
          valid ? 'from-[#22c55e] to-[#22c55e]' : 'from-primary to-[#7a5cfa]'
        )}
      />
    </div>
  );
}
