'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface WordRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  accent?: string;
}

export function WordReveal({ text, className, delay = 0, stagger = 60, accent }: WordRevealProps) {
  const words = text.split(' ');
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const h = () => setReduced(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    setVisible(true);
    if (reduced) return;
    const t = window.setTimeout(() => setVisible(true), delay + 80);
    return () => window.clearTimeout(t);
  }, [delay, reduced]);

  return (
    <span className={cn('inline', className)}>
      {words.map((word, i) => {
        const isAccent = accent && word.includes(accent.split(' ')[0]);
        return (
          <span
            key={i}
            className={cn(
              'inline-block',
              !reduced && 'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
              visible
                ? 'translate-y-0 opacity-100 blur-0'
                : 'translate-y-3 opacity-0 blur-sm'
            )}
            style={reduced ? undefined : { transitionDelay: `${delay + i * stagger}ms` }}
          >
            {isAccent ? (
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">{word}</span>
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-0 bottom-1 h-3 origin-left rounded-sm sm:bottom-2 sm:h-4 dark:bg-primary bg-accent/60',
                    !reduced && 'transition-transform duration-700',
                    visible || reduced ? 'scale-x-100' : 'scale-x-0'
                  )}
                  style={reduced ? undefined : { transitionDelay: `${delay + i * stagger + 200}ms` }}
                />
              </span>
            ) : (
              word
            )}
            {i < words.length - 1 && ' '}
          </span>
        );
      })}
    </span>
  );
}
