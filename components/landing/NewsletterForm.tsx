'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
  className?: string;
  variant?: 'inline' | 'stacked';
  placeholder?: string;
  cta?: string;
}

export function NewsletterForm({
  className,
  variant = 'inline',
  placeholder = 'you@email.com',
  cta = 'Subscribe',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');
      setStatus('success');
      setMessage(data.message || 'You\'re on the list. Welcome to the community.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Try again.');
    }
  }

  if (status === 'success') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-[#16a34a]/30 bg-[#16a34a]/10 px-4 py-2 text-sm text-foreground',
          className
        )}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#16a34a] text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        {message}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        variant === 'inline'
          ? 'flex w-full max-w-md flex-col gap-2 sm:flex-row'
          : 'flex w-full flex-col gap-3',
        className
      )}
    >
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          autoComplete="email"
          className="h-12 rounded-full pl-9"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={status === 'loading'}
        className="h-12 rounded-full px-6"
      >
        {status === 'loading' ? 'Subscribing…' : cta}
        {status !== 'loading' && <ArrowRight className="ml-1.5 h-4 w-4" />}
      </Button>
      {status === 'error' && (
        <p className="text-xs text-destructive sm:col-span-2">{message}</p>
      )}
    </form>
  );
}
