'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Phone, Check } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 15);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `+${digits.slice(0, digits.length - 10)} (${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
}

export function PhoneInput({ value, onChange, placeholder = '(555) 123-4567' }: PhoneInputProps) {
  const [focused, setFocused] = useState(false);
  const valid = value.replace(/\D/g, '').length >= 7;

  return (
    <div className="group relative">
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
        <Phone className="h-5 w-5" />
      </div>
      <input
        type="tel"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(formatPhone(e.target.value))}
        placeholder={placeholder}
        autoComplete="tel"
        inputMode="tel"
        className={cn(
          'w-full border-0 border-b-2 bg-transparent py-4 pl-8 pr-10 text-2xl font-medium tabular-nums text-foreground sm:text-3xl',
          'placeholder:font-normal placeholder:text-muted-foreground/50',
          'transition-all duration-200',
          focused ? 'border-primary' : 'border-border',
          'focus:border-primary focus:outline-none focus:ring-0'
        )}
      />
      {value && valid && (
        <Check className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#22c55e]" />
      )}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-[#7a5cfa] transition-transform duration-300',
          focused && 'scale-x-100'
        )}
      />
    </div>
  );
}
