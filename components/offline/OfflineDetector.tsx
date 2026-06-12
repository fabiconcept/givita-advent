'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { FlowerRunner } from './FlowerRunner';
import { FlowerRunnerMobile } from './FlowerRunnerMobile';

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [sway] = useState(() => rnd(1.5, 3));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scRef = useRef<HTMLSpanElement | null>(null);
  const hiRef = useRef<HTMLSpanElement | null>(null);
  const fundsRef = useRef<HTMLSpanElement | null>(null);
  const progRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => { setOnline(false); setDismissed(false); };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const retry = useCallback(() => {
    if (navigator.onLine) setOnline(true);
  }, []);

  const showOverlay = !online && !dismissed;

  if (!showOverlay) return <>{children}</>;

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[999] flex flex-col overflow-hidden bg-background">
        <div className="aurora" aria-hidden />

        <HangingFlower className="right-2 top-0 lg:right-6" side="right" size={148} ropeLength={90} delay={0.1} tone="muted" swayMultiplier={sway} />
        <HangingFlower className="left-2 top-0 lg:left-6" side="left" size={120} ropeLength={70} delay={0.6} tone="muted" swayMultiplier={sway} />
        <HangingFlower className="bottom-0 right-10 hidden sm:block" side="right" size={68} ropeLength={70} delay={0.4} tone="muted" flip swayMultiplier={sway} />

        {/* HUD — game loop writes directly into these refs */}
        <div className="relative z-10 flex shrink-0 items-center justify-between px-5 pt-4 pb-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">Score</span>
            <span ref={scRef} className="text-lg font-semibold tracking-tight text-foreground">0</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">Garden Fund</span>
            <span ref={fundsRef} className="text-sm font-semibold tracking-tight text-secondary">₦0.00 raised</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">Best</span>
            <span ref={hiRef} className="text-lg font-semibold tracking-tight text-foreground">0</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mx-5 h-0.5 shrink-0 rounded-full bg-muted">
          <div ref={progRef} className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: '0%' }} />
        </div>

        {/* Canvas — gap above, fade overlay at top to blend into bg */}
        <div className="relative z-10 mx-auto flex w-full flex-none items-center justify-center pt-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-background to-transparent" aria-hidden />
          {isMobile ? (
            <FlowerRunnerMobile
              canvasRef={canvasRef}
              scRef={scRef}
              hiRef={hiRef}
              fundsRef={fundsRef}
              progRef={progRef}
            />
          ) : (
            <FlowerRunner
              canvasRef={canvasRef}
              scRef={scRef}
              hiRef={hiRef}
              fundsRef={fundsRef}
              progRef={progRef}
            />
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 shrink-0 px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/40">Space · tap to flap · double-jump</span>
            <span className="text-[11px] font-medium text-muted-foreground/60">Givita <em className="not-italic text-[#7a5cfa]">for good</em></span>
          </div>
          <div className="mt-2 flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Your device is offline, <em className="not-italic text-secondary">olokumi</em>.
            </p>
            <p className="text-xs text-muted-foreground/50">
              Check your connection &mdash; or keep playing. Every point = ₦0.01 donated!
            </p>
            <div className="mt-1 flex items-center gap-3">
              <button type="button" onClick={retry} className="btn-primary">
                Try again
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="btn-outline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
