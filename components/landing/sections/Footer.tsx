'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { ArrowRight } from 'lucide-react';

const FLOWER_COUNT = 18;

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

function createLeaves(baseX: number, baseY: number): FallenLeaf[] {
  return Array.from({ length: FLOWER_COUNT }, (_, i) => ({
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
  const [leaves, setLeaves] = useState<{ id: number; items: FallenLeaf[] }[]>([]);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const id = Date.now();
    const items = createLeaves(cx, cy);
    setLeaves((prev) => [...prev, { id, items }]);
    setTimeout(() => {
      setLeaves((prev) => prev.filter((b) => b.id !== id));
    }, 3500);
  }, []);

  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-muted/20">
      <HangingFlower className="right-10 top-0 sm:right-16 lg:right-24" side="right" size={72} ropeLength={54} delay={0.2} tone="muted" />
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/flower 2.png"
              alt=""
              className="h-full w-full object-contain"
              draggable={false}
            />
          </span>
        ))
      )}
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-20 sm:px-8 sm:pt-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex cursor-pointer items-center gap-2.5 text-left transition-opacity hover:opacity-80"
            >
              <span className="flex h-10 w-12 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/flower 2.png" alt="Givita" className="h-full w-full object-contain" />
              </span>
              <span className="text-base font-semibold text-foreground">Givita</span>
            </button>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A community-powered fundraising platform built for the way African communities already support each other.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              Surveying the first 500 voices now.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">The story</p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ['#hero',     'Opening'],
                ['#truth',    'The truth'],
                ['#shift',    'The shift'],
                ['#giving',   'Built around giving'],
                ['#odogwu',   'Odogwu'],
                ['#trust',    'Trust'],
                ['#diaspora', 'Diaspora'],
                ['#future',   'The future'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-foreground/70 transition-colors hover:text-foreground">{label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Get involved</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/forms/community-fundraising" className="group inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-primary">
                  Add your voice
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <a href="#future" className="text-foreground/70 transition-colors hover:text-foreground">Newsletter</a>
              </li>
            </ul>
            <div className="mt-8 h-px w-12 bg-border" />
            <p className="mt-4 text-xs text-muted-foreground">Made with care &middot; Imo State &middot; Abuja &middot; everywhere our people are.</p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Givita. Every voice matters.</p>
          <p className="font-mono">v0.1 &middot; survey edition</p>
        </div>
      </div>
      <style>{`
        @keyframes leafFall {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
          }
          20% {
            opacity: 1;
            transform: translate(calc(-50% + var(--drift) * 0.2), calc(-50% + 12vh)) scale(1) rotate(calc(var(--spin) * 0.15));
          }
          50% {
            opacity: 0.95;
            transform: translate(calc(-50% + var(--drift) * 0.7), calc(-50% + 35vh)) scale(0.95) rotate(calc(var(--spin) * 0.5));
          }
          80% {
            opacity: 0.7;
            transform: translate(calc(-50% + var(--drift) * 0.9), calc(-50% + 60vh)) scale(0.85) rotate(calc(var(--spin) * 0.85));
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--drift)), calc(-50% + 80vh)) scale(0.5) rotate(var(--spin));
          }
        }
      `}</style>
    </footer>
  );
}
