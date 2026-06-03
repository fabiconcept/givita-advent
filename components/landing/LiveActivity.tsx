'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const ACTIVITY = [
  { name: 'Ayo', city: 'Lagos', action: 'shared their voice in the community survey' },
  { name: 'Chinedu', city: 'Abuja', action: 'completed the fundraising survey' },
  { name: 'Fatima', city: 'Kano', action: 'added their perspective to the form' },
  { name: 'Tunde', city: 'Port Harcourt', action: 'just finished answering the questions' },
  { name: 'Zainab', city: 'Ibadan', action: 'contributed their thoughts on giving' },
  { name: 'Ifeoma', city: 'Enugu', action: 'submitted their story' },
  { name: 'Kelechi', city: 'Owerri', action: 'reached the end of the survey' },
];

const MIN_VISIBLE = 3500;
const MAX_VISIBLE = 6000;
const MIN_GAP = 1500;
const MAX_GAP = 5500;
const MIN_INITIAL = 1200;
const MAX_INITIAL = 2700;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function LiveActivity() {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      if (!mounted) return;
      if (paused) {
        nextTimer = setTimeout(cycle, 600);
        return;
      }
      const visibleMs = rand(MIN_VISIBLE, MAX_VISIBLE);
      const gapMs = rand(MIN_GAP, MAX_GAP);
      setShown(true);
      showTimer = setTimeout(() => {
        if (!mounted) return;
        setShown(false);
        hideTimer = setTimeout(() => {
          if (!mounted) return;
          setIndex((i) => (i + 1 + Math.floor(Math.random() * (ACTIVITY.length - 1))) % ACTIVITY.length);
          cycle();
        }, gapMs);
      }, visibleMs);
    };

    const start = setTimeout(cycle, rand(MIN_INITIAL, MAX_INITIAL));

    return () => {
      mounted = false;
      clearTimeout(start);
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [paused]);

  const a = ACTIVITY[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
      className={cn(
        'pointer-events-auto fixed bottom-4 left-4 z-30 sm:bottom-6 sm:left-6',
        'transition-all duration-500 ease-out',
        shown
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <div className="flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-border/60 bg-background/80 px-4 py-2.5 shadow-lg shadow-foreground/5 backdrop-blur-md sm:max-w-md">
        <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <p className="truncate text-xs text-foreground/80 sm:text-sm">
          <span className="font-medium text-foreground">{a.name}</span>
          <span className="text-foreground/60"> from {a.city} </span>
          <span className="text-foreground/80">{a.action}</span>
        </p>
      </div>
    </div>
  );
}
