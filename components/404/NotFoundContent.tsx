'use client';

import { useCallback, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Home, Gamepad2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { useEasterEgg, FlowerRain } from '@/components/404/EasterEgg';
import { PetalCatch } from '@/components/404/PetalCatch';
import { DraggablePanel } from '@/components/404/DraggablePanel';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

interface NotFoundContentProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  showNav?: boolean;
}

export function NotFoundContent({
  title = "Lost your way?",
  description = "This page doesn't exist. Let's get you back on track.",
  children,
  showNav = true,
}: NotFoundContentProps) {
  const [lottieError, setLottieError] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const { active, trigger, pressCount, target } = useEasterEgg(5);
  const [sway] = useState(() => rnd(1.5, 3));

  const handleLottieError = useCallback(() => setLottieError(true), []);

  return (
    <>
      <FlowerRain active={active} />
      <div className="aurora" aria-hidden />
      <HangingFlower className="right-4 top-0 lg:right-10" side="right" size={172} ropeLength={100} delay={0.1} tone="muted" swayMultiplier={sway} />
      <HangingFlower className="left-4 top-0 hidden lg:block" side="left" size={96} ropeLength={70} delay={0.6} tone="muted" swayMultiplier={sway} />
      <HangingFlower className="bottom-0 right-8 hidden sm:block" side="right" size={72} ropeLength={80} delay={0.4} tone="muted" flip swayMultiplier={sway} />

      <div className="absolute right-6 top-6 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowGame((v) => !v)}
          className="btn-outline !h-9 !w-9 !p-0 animate-game-pulse"
          aria-label="Toggle game"
          title="Petals game (G)"
        >
          <Gamepad2 className="h-4 w-4" />
        </button>
        <ThemeToggle />
      </div>

      {showGame && (
        <DraggablePanel>
          <PetalCatch />
        </DraggablePanel>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-2 flex items-center justify-center">
          {!lottieError ? (
            <div className="relative w-72 sm:w-80">
              <div onClick={trigger} className="cursor-pointer">
                <Lottie
                  path="/404.json"
                  loop={true}
                  autoplay={true}
                  onError={handleLottieError}
                  rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
                />
              </div>
              {pressCount > 0 && pressCount < target && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 shadow-xs">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-primary" aria-hidden>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <div className="flex gap-0.5">
                      {Array.from({ length: target }, (_, i) => (
                        <span
                          key={i}
                          className={`block h-1.5 w-1.5 rounded-full transition-colors ${
                            i < pressCount ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex h-72 w-72 cursor-pointer items-center justify-center sm:h-80 sm:w-80"
              onClick={trigger}
            >
              <span className="select-none text-[140px] font-bold leading-none tracking-tighter text-primary/20 sm:text-[180px]">
                404
              </span>
            </div>
          )}
        </div>

        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {showNav && (
          <div className="flex items-center gap-3">
            <Link href="/" className="btn-primary">
              <Home className="h-4 w-4" />
              Go back home
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn-outline"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
          </div>
        )}

        {children}
      </div>

      <div className="absolute bottom-8 text-center text-xs text-primary dark:text-secondary">
        Givita &mdash; Africa&rsquo;s Community-Powered Fundraising Platform
      </div>
    </>
  );
}
