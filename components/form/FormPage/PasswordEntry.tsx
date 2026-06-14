'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Home, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PasswordEntryProps {
  formTitle: string;
  onSubmit: (password: string) => void;
  error: string | null;
  isLoading: boolean;
}

export function PasswordEntry({ formTitle, onSubmit, error, isLoading }: PasswordEntryProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password);
  }

  function handleErrorShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  // Trigger shake on error change
  if (error && !shake) {
    handleErrorShake();
  }

  return (
    <section className="relative pt-2">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -m-6 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_20px_50px_-12px_rgba(81,46,248,0.6)]">
            <Shield className="h-10 w-10" strokeWidth={2} />
          </div>
        </div>
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Lock className="h-3 w-3" /> Password protected
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Password required</h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          Enter the password to access <span className="text-foreground">{formTitle}</span>.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`mx-auto mt-10 max-w-md rounded-3xl border border-border bg-card/50 p-6 backdrop-blur ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
      >
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="h-12 rounded-xl pr-12 text-base"
              autoFocus
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="group h-12 w-full rounded-full px-6 text-base shadow-[0_10px_40px_-10px_rgba(81,46,248,0.6)]"
            disabled={!password.trim() || isLoading}
          >
            {isLoading ? 'Verifying...' : 'Continue'}
            {!isLoading && <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </Button>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:shadow-[0_4px_16px_-8px_rgba(81,46,248,0.3)]"
            title="Home"
          >
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </div>
      </form>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </section>
  );
}
