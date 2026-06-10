'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { cn } from '@/lib/utils';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const PETALS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: [3, 4, 5, 6][i % 4],
  left: `${5 + (i * 9 + 7) % 90}%`,
  top: `${5 + (i * 13 + 3) % 90}%`,
  delay: `${i * 0.9}s`,
  duration: `${13 + (i % 5) * 2}s`,
  drift: `${(i % 2 === 0 ? 1 : -1) * (40 + (i % 3) * 30)}px`,
  color: i % 3 === 0 ? 'rgba(81,46,248,0.2)' : i % 3 === 1 ? 'rgba(81,46,248,0.12)' : 'rgba(90,90,99,0.12)',
}));

type FlowerReaction = 'idle' | 'focused' | 'typing' | 'error' | 'success';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reaction, setReaction] = useState<FlowerReaction>('idle');

  const honeypotRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleFocus = useCallback(() => {
    setFocused(true);
    setReaction('focused');
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
    setReaction('idle');
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (e.target.value.length > 0) {
      setReaction('typing');
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setReaction('focused');
      }, 800);
    } else {
      setReaction('focused');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (honeypotRef.current?.value) return;

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Invalid password');
        setReaction('error');
        setIsLoading(false);
        setTimeout(() => { if (focused) setReaction('focused'); else setReaction('idle'); }, 2000);
        return;
      }

      setReaction('success');
      setTimeout(() => { window.location.href = '/admin'; }, 600);
    } catch (err) {
      console.error('[v0] Login error:', err);
      setError('An error occurred. Please try again.');
      setReaction('error');
      setIsLoading(false);
      setTimeout(() => { if (focused) setReaction('focused'); else setReaction('idle'); }, 2000);
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="aurora aurora-login fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <style>{`
          @keyframes petalFloat {
            0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
            8% { opacity: 0.6; }
            85% { opacity: 0.25; }
            100% { transform: translateY(-130px) translateX(var(--drift)) rotate(var(--spin, 30deg)); opacity: 0; }
          }
          @keyframes logoPulse {
            0%, 100% { box-shadow: 0 0 20px rgba(81,46,248,0.15); }
            50% { box-shadow: 0 0 40px rgba(81,46,248,0.3); }
          }
          @keyframes formSlideUp {
            0% { transform: translateY(16px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes flowerTremble {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-4px) rotate(-1deg); }
            40% { transform: translateX(4px) rotate(1deg); }
            60% { transform: translateX(-3px); }
            80% { transform: translateX(3px); }
          }
          @keyframes flowerRise {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-80px) scale(0.7); opacity: 0; }
          }
        `}</style>
        {PETALS.map((dot) => (
          <span
            key={dot.id}
            className="absolute rounded-full"
            style={{
              width: dot.size + 'px',
              height: dot.size + 'px',
              left: dot.left,
              top: dot.top,
              backgroundColor: dot.color,
              animation: `petalFloat ${dot.duration} ease-in-out ${dot.delay} infinite`,
              '--drift': dot.drift,
              '--spin': (dot.id * 20) + 'deg',
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="fixed right-4 top-4 z-30">
        <ThemeToggle />
      </div>

      {/* Top-left glow */}
      <span
        className={cn(
          'pointer-events-none fixed z-10 rounded-full bg-primary/10 blur-3xl transition-all duration-700',
          'left-[192px] top-[188px] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2',
          'max-lg:left-[64px] max-lg:top-[68px] max-lg:h-[120px] max-lg:w-[120px]',
          reaction === 'idle' && 'opacity-0 scale-75',
          reaction === 'focused' && 'opacity-60 scale-100',
          (reaction === 'typing' || reaction === 'error') && 'opacity-80 scale-110',
          reaction === 'typing' && 'animate-pulse',
        )}
      />
      {/* Bottom-right glow */}
      <span
        className={cn(
          'pointer-events-none fixed z-10 rounded-full bg-primary/10 blur-3xl transition-all duration-700',
          'right-[192px] bottom-[188px] h-[300px] w-[300px] translate-x-1/2 translate-y-1/2',
          'max-lg:right-[64px] max-lg:bottom-[68px] max-lg:h-[120px] max-lg:w-[120px]',
          reaction === 'idle' && 'opacity-0 scale-75',
          reaction === 'focused' && 'opacity-60 scale-100',
          (reaction === 'typing' || reaction === 'error') && 'opacity-80 scale-110',
          reaction === 'typing' && 'animate-pulse',
        )}
      />

      {/* Top-left hanging flower */}
      <div
        className={cn(
          'fixed left-0 top-0 z-10 w-[384px] h-[376px] max-lg:w-[128px] max-lg:h-[136px] pointer-events-none',
          reaction === 'error' && 'animate-[flowerTremble_0.5s_ease-in-out_2]',
          reaction === 'success' && 'animate-[flowerRise_0.6s_ease-in_forwards]',
        )}
      >
        <div className="pointer-events-auto max-lg:hidden" style={{ position: 'absolute', inset: 0 }}>
          <HangingFlower size={240} ropeLength={130} delay={0} swayMultiplier={focused ? 2 : 1.2} />
        </div>
        <div className="pointer-events-auto lg:hidden" style={{ position: 'absolute', inset: 0 }}>
          <HangingFlower size={80} ropeLength={50} delay={0} swayMultiplier={focused ? 2 : 1.2} />
        </div>
      </div>

      {/* Bottom-right hanging flower (flipped) */}
      <div
        className={cn(
          'fixed bottom-0 right-0 z-10 w-[384px] h-[376px] max-lg:w-[128px] max-lg:h-[136px] pointer-events-none',
          reaction === 'error' && 'animate-[flowerTremble_0.5s_ease-in-out_2]',
          reaction === 'success' && 'animate-[flowerRise_0.6s_ease-in_forwards]',
        )}
      >
        <div className="pointer-events-auto max-lg:hidden" style={{ position: 'absolute', inset: 0 }}>
          <HangingFlower size={240} ropeLength={130} delay={0.5} flip swayMultiplier={focused ? 2 : 1.2} />
        </div>
        <div className="pointer-events-auto lg:hidden" style={{ position: 'absolute', inset: 0 }}>
          <HangingFlower size={80} ropeLength={50} delay={0.5} flip swayMultiplier={focused ? 2 : 1.2} />
        </div>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-5 py-12">
        <div className="w-full">
          <div
            className="mb-10 flex flex-col items-center text-center"
            style={{ animation: 'formSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            <Link href="/" className="group mb-4 block">
              <span className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
                <span
                  className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent opacity-70 blur-2xl"
                  style={{ animation: 'logoPulse 3s ease-in-out infinite' }}
                />
                <span className="absolute -inset-3 rounded-full border border-primary/10 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/flower 2.png"
                  alt="Givita"
                  className="relative h-full w-full object-contain drop-shadow-[0_0_15px_rgba(81,46,248,0.3)] transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_30px_rgba(81,46,248,0.5)]"
                />
              </span>
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to manage surveys and review responses.
            </p>
          </div>

          <div
            style={{ animation: 'formSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both' }}
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-card/60 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8"
            >
              <div aria-hidden className="absolute -left-[9999px]">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" ref={honeypotRef} tabIndex={-1} autoComplete="off" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Enter admin password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    autoFocus
                    className="h-11 rounded-xl pl-9 pr-10 transition-shadow duration-300 focus-visible:shadow-[0_0_0_2px_hsl(var(--primary))]"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    title={show ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !password}
                className="mt-6 h-11 w-full rounded-xl transition-all duration-300 active:scale-[0.97]"
                title={isLoading ? 'Signing in…' : 'Sign in'}
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
                {!isLoading && <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
              </Button>
            </form>
          </div>

          <p
            className="mt-6 text-center text-xs text-muted-foreground"
            style={{ animation: 'formSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.24s both' }}
          >
            Protected admin area. Password required.
          </p>
        </div>
      </div>
    </div>
  );
}
