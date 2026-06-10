'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HangingFlower } from '@/components/landing/HangingFlower';

const CONSENT_KEY = 'givita-cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch { /* noop */ }
  }, []);

  function accept() {
    try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch { /* noop */ }
    setDismissed(true);
    setTimeout(() => setVisible(false), 500);
  }

  function dismiss() {
    try { localStorage.setItem(CONSENT_KEY, 'declined'); } catch { /* noop */ }
    setDismissed(true);
    setTimeout(() => setVisible(false), 500);
  }

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[100]',
        'transition-all duration-500 ease-out',
        dismissed ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      )}
    >
      <div className="relative border-t border-border/60 bg-background/95 backdrop-blur-md">
        <HangingFlower
          className="right-8 -top-6 hidden sm:block"
          side="right"
          size={44}
          ropeLength={28}
          delay={0.4}
          tone="primary"
        />
        <HangingFlower
          className="left-8 -top-6 hidden sm:block"
          side="left"
          size={36}
          ropeLength={22}
          delay={0.8}
          tone="muted"
        />

        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 2a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3Z" />
                <path d="M19 9v1a7 7 0 0 1-14 0V9" />
                <line x1="12" y1="12" x2="12" y2="17" />
              </svg>
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use essential cookies to keep things running and a lightweight analytics cookie to count visits.{' '}
              <Link
                href="/privacy"
                className="font-medium text-foreground underline decoration-muted-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground"
                onClick={dismiss}
              >
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-all hover:text-foreground active:scale-95"
              title="Decline"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={accept}
              className="rounded-full bg-foreground px-5 py-1.5 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-95"
              title="Accept"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
