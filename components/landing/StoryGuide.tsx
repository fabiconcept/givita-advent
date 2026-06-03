'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface StoryChapter {
  id: string;
  label: string;
}

interface ChapterState {
  activeId: string;
  activeIdx: number;
  cp: number;
  weightedPct: number;
}

function computeChapterState(
  elements: HTMLElement[],
  total: number,
  trigger: number
): ChapterState {
  let activeIdx = 0;
  let cp = 0;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const rect = el.getBoundingClientRect();
    if (rect.top <= trigger) {
      activeIdx = i;
      // Chapter sub-progress: 0 when the chapter's top first crosses the
      // trigger, 1 when its top is one full chapter-height above the
      // trigger. Works for any chapter height (including the tall
      // parallax ScrollShowcase).
      const h = el.offsetHeight || 1;
      cp = Math.max(0, Math.min(1, (trigger - rect.top) / h));
    }
  }
  const weightedPct = total > 0 ? (activeIdx + cp) / total : 0;
  return {
    activeId: elements[activeIdx]?.id ?? '',
    activeIdx,
    cp,
    weightedPct,
  };
}

interface StoryGuideProps {
  chapters: StoryChapter[];
  className?: string;
}

export function StoryGuide({ chapters, className }: StoryGuideProps) {
  const [state, setState] = useState<ChapterState>({
    activeId: chapters[0]?.id ?? '',
    activeIdx: 0,
    cp: 0,
    weightedPct: 0,
  });

  useEffect(() => {
    const elements = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const trigger = window.innerHeight * 0.45;
        setState(computeChapterState(elements, elements.length, trigger));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [chapters]);

  const { activeId, weightedPct } = state;

  return (
    <nav
      aria-label="Story progress"
      className={cn('pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block', className)}
    >
      <div className="pointer-events-auto relative flex flex-col items-end gap-1">
        <div
          aria-hidden
          className="absolute right-[7px] top-1.5 bottom-1.5 w-px bg-border"
        />
        <div
          aria-hidden
          className="absolute right-[7px] top-1.5 w-px origin-top bg-gradient-to-b from-primary to-[#d6ff5d] transition-transform duration-200 ease-out"
          style={{
            transform: `scaleY(${weightedPct})`,
            height: 'calc(100% - 12px)',
          }}
        />
        <ul className="relative flex flex-col gap-3 py-1">
          {chapters.map((c) => {
            const isActive = activeId === c.id;
            return (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  className={cn(
                    'group flex items-center gap-3 rounded-full py-1.5 pl-3 pr-1 transition-opacity duration-300',
                    isActive ? 'opacity-100' : 'opacity-50 hover:opacity-90'
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-[10px] uppercase tracking-wider transition-all duration-300 ease-out',
                      isActive
                        ? 'max-w-[140px] translate-x-0 text-foreground opacity-100'
                        : 'max-w-0 -translate-x-1 overflow-hidden opacity-0 group-hover:max-w-[140px] group-hover:translate-x-0 group-hover:opacity-70'
                    )}
                  >
                    {c.label}
                  </span>
                  <span
                    className={cn(
                      'relative block h-3.5 w-3.5 rounded-full border transition-all duration-300 ease-out',
                      isActive
                        ? 'scale-110 border-primary bg-primary'
                        : 'border-border bg-background group-hover:border-primary/50'
                    )}
                    aria-hidden
                  >
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-0 -m-1 rounded-full border border-primary/40"
                        style={{ animation: 'story-ping 1.6s ease-out infinite' }}
                      />
                    )}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <style jsx>{`
        @keyframes story-ping {
          0% { transform: scale(0.8); opacity: 0.7; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
    </nav>
  );
}

interface StoryProgressBarProps {
  chapters?: StoryChapter[];
  className?: string;
}

export function StoryProgressBar({ chapters, className }: StoryProgressBarProps) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // With chapters: chapter-weighted (accounts for parallax/long
        // sections). Without: raw document scroll (fallback).
        if (chapters && chapters.length > 0) {
          const elements = chapters
            .map((c) => document.getElementById(c.id))
            .filter((el): el is HTMLElement => !!el);
          if (elements.length === 0) return;
          const trigger = window.innerHeight * 0.45;
          setPct(computeChapterState(elements, elements.length, trigger).weightedPct);
        } else {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const p = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
          setPct(p);
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [chapters]);

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent lg:hidden',
        className
      )}
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-primary via-[#7a5cfa] to-[#d6ff5d] transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${pct})` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6ff5d] shadow-[0_0_10px_2px_rgba(214,255,93,0.65)] transition-opacity duration-200 ease-out"
        style={{ left: `${pct * 100}%`, opacity: pct > 0.02 ? 1 : 0 }}
      />
    </div>
  );
}
