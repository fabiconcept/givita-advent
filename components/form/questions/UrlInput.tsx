'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link2, Check, X } from 'lucide-react';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function validateUrl(value: string) {
  if (!value) return { valid: false, status: 'empty' as const };
  try {
    const u = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return { valid: Boolean(u.hostname.includes('.')), status: 'ok' as const, normalized: u.toString() };
  } catch {
    return { valid: false, status: 'invalid' as const };
  }
}

export function UrlInput({ value, onChange, placeholder = 'https://your-portfolio.com' }: UrlInputProps) {
  const [focused, setFocused] = useState(false);
  const v = validateUrl(value);
  const isInvalid = v.status === 'invalid';

  return (
    <div className="group relative">
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
        <Link2 className="h-5 w-5" />
      </div>
      <input
        type="url"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="url"
        className={cn(
          'w-full border-0 border-b-2 bg-transparent py-4 pl-8 pr-10 text-2xl font-medium text-foreground sm:text-3xl',
          'placeholder:font-normal placeholder:text-muted-foreground/50',
          'transition-all duration-200',
          isInvalid ? 'border-destructive focus:border-destructive' : focused ? 'border-primary' : 'border-border',
          'focus:outline-none focus:ring-0'
        )}
      />
      {value && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          {isInvalid ? (
            <X className="h-5 w-5 text-destructive" />
          ) : (
            <Check className="h-5 w-5 text-[#22c55e]" />
          )}
        </div>
      )}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-300',
          isInvalid ? 'from-destructive to-destructive' : 'from-primary to-[#7a5cfa]',
          focused && 'scale-x-100'
        )}
      />
    </div>
  );
}
