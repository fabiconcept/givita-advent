'use client';

import { useEffect, useState } from 'react';
import { Kbd } from '@/components/ui/kbd';

const TIPS = [
  { keys: ['J', 'K'], label: 'Navigate chapters' },
  { keys: ['T'], label: 'Toggle theme' },
];

const DISMISS_KEY = 'givita:landing-kb-hint-dismissed';

export function KeyboardHints() {
  const [dismissed, setDismissed] = useState(true);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  function dismiss() {
    setHiding(true);
    setTimeout(() => {
      setDismissed(true);
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* noop */ }
    }, 300);
  }

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-300 ${
        hiding ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur-xl">
        <span className="font-medium text-foreground/60">Keyboard</span>
        {TIPS.map((tip) => (
          <span key={tip.label} className="flex items-center gap-1">
            {tip.keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
            <span className="ml-0.5">{tip.label}</span>
          </span>
        ))}
        <button
          onClick={dismiss}
          className="ml-1 rounded-full p-1 text-muted-foreground/50 hover:text-foreground"
          aria-label="Dismiss keyboard hints"
          title="Dismiss keyboard hints"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
