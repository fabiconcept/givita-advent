'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2, Mail, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Form } from '@/types';

const STORY_LINKS = [
  ['#hero',     'Opening'],
  ['#truth',    'The truth'],
  ['#shift',    'The shift'],
  ['#giving',   'Built around giving'],
  ['#odogwu',   'Odogwu'],
  ['#trust',    'Trust'],
  ['#diaspora', 'Diaspora'],
  ['#future',   'The future'],
] as const;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

interface FallenLeaf {
  id: number;
  x: number;
  y: number;
  size: number;
  drift: number;
  rotation: number;
  duration: number;
  delay: number;
}

function createLeaves(baseX: number, baseY: number, count: number): FallenLeaf[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: randomBetween(14, 28),
    x: baseX + randomBetween(-12, 12),
    y: baseY,
    drift: randomBetween(-120, 120),
    rotation: randomBetween(-180, 180),
    duration: randomBetween(1800, 3200),
    delay: randomBetween(0, 150),
  }));
}

export function Footer() {
  const [featuredForm, setFeaturedForm] = useState<Form | null>(null);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  const [leaves, setLeaves] = useState<{ id: number; items: FallenLeaf[] }[]>([]);

  useEffect(() => {
    fetch('/api/forms/featured')
      .then((r) => r.json())
      .then((d) => { if (d.form) setFeaturedForm(d.form); })
      .catch(() => {})
      .finally(() => setFeaturedLoaded(true));
  }, []);

  const surveyHref = featuredForm ? `/forms/${featuredForm.id}` : '#';

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const id = Date.now();
    const items = createLeaves(cx, cy, 12);
    setLeaves((prev) => [...prev, { id, items }]);
    setTimeout(() => {
      setLeaves((prev) => prev.filter((b) => b.id !== id));
    }, 3500);
  }, []);

  return (
    <footer className="relative border-t border-border bg-muted/20">
      {leaves.map((batch) =>
        batch.items.map((l) => (
          <span
            key={`${batch.id}-${l.id}`}
            className="pointer-events-none fixed z-50"
            style={{
              left: l.x,
              top: l.y,
              width: l.size,
              height: l.size,
              transform: 'translate(-50%, -50%)',
              animation: `leafFall ${l.duration}ms ease-in-out ${l.delay}ms forwards`,
              ['--drift' as string]: `${l.drift}px`,
              ['--spin' as string]: `${l.rotation}deg`,
            }}
          >
            <img src="/assets/flower 2.png" alt="" className="h-full w-full object-contain" draggable={false} />
          </span>
        ))
      )}

      <div className="mx-auto w-full max-w-6xl px-5 pb-6 pt-16 sm:px-8 sm:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr]">
          <div>
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex cursor-pointer items-center gap-2.5 text-left transition-opacity hover:opacity-80"
              aria-label="Givita — click for a surprise"
            >
              <span className="flex h-10 w-12 items-center justify-center">
                <img src="/assets/flower 2.png" alt="Givita" className="h-full w-full object-contain" />
              </span>
              <span className="text-base font-semibold text-foreground">Givita</span>
            </button>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A community-powered fundraising platform built for the way African communities already support each other.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Surveying the first 500 voices now.
            </p>
          </div>

          <nav aria-label="Story chapters">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">The story</p>
            <ul className="mt-5 space-y-1">
              {STORY_LINKS.map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="inline-block py-2.5 text-sm text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Get involved</p>
            <div className="mt-5 space-y-4">
              <Link
                href={surveyHref}
                className={cn(
                  'group inline-flex items-center gap-1.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md',
                  featuredLoaded
                    ? 'text-foreground hover:text-primary'
                    : 'pointer-events-none text-muted-foreground/40'
                )}
                aria-disabled={!featuredLoaded}
                tabIndex={featuredLoaded ? undefined : -1}
              >
                Add your voice
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <NewsletterBlock />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Givita. Every voice matters.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <span className="text-border-strong" aria-hidden>/</span>
            <span className="font-mono">v0.1 &middot; survey edition</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes leafFall {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.6) rotate(0deg); }
          20% { opacity: 1; transform: translate(calc(-50% + var(--drift) * 0.2), calc(-50% + 12vh)) scale(1) rotate(calc(var(--spin) * 0.15)); }
          50% { opacity: 0.95; transform: translate(calc(-50% + var(--drift) * 0.7), calc(-50% + 35vh)) scale(0.95) rotate(calc(var(--spin) * 0.5)); }
          80% { opacity: 0.7; transform: translate(calc(-50% + var(--drift) * 0.9), calc(-50% + 60vh)) scale(0.85) rotate(calc(var(--spin) * 0.85)); }
          100% { opacity: 0; transform: translate(calc(-50% + var(--drift)), calc(-50% + 80vh)) scale(0.5) rotate(var(--spin)); }
        }
      `}</style>
    </footer>
  );
}

function NewsletterBlock() {
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
      setMessage(data.message || "You're on the list. Welcome to the community.");
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="footer-newsletter" className="sr-only">Email for launch updates</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="footer-newsletter"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className="h-11 rounded-full pl-9 text-sm"
          />
        </div>
        <Button type="submit" disabled={status === 'loading'} className="h-11 rounded-full px-5 text-sm">
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
        </Button>
      </div>
      {status === 'error' && <p className="text-xs text-destructive">{message}</p>}
    </form>
  );
}
