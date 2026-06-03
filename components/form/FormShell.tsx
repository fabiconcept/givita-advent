'use client';

import { ReactNode, useEffect, useState } from 'react';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { LiveBackground } from '@/components/landing/LiveBackground';
import { IntroReveal } from '@/components/landing/IntroReveal';

interface FormShellProps {
  children: ReactNode;
  variant?: 'aurora' | 'community' | 'fragment' | 'shift' | 'hearts' | 'sparkle' | 'shield' | 'globe' | 'rays';
}

export function FormShell({ children, variant = 'aurora' }: FormShellProps) {
  const [contentOpacity, setContentOpacity] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setContentOpacity(1), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <IntroReveal />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 15% 0%, rgba(81,46,248,0.18) 0%, transparent 60%), radial-gradient(45% 40% at 90% 10%, rgba(214,255,93,0.10) 0%, transparent 60%), radial-gradient(70% 60% at 50% 100%, rgba(81,46,248,0.10) 0%, transparent 60%)',
        }}
      />

      <LiveBackground variant={variant} className="-z-10" density="low" />

      <div
        className="transition-opacity duration-500 ease-out"
        style={{ opacity: contentOpacity }}
      >
        <div aria-hidden className="block md:hidden">
          <HangingFlower
            className="left-2 bottom-0"
            side="left"
            size={86}
            ropeLength={48}
            delay={0}
            tone="primary"
            flip
          />
          <HangingFlower
            className="right-4 bottom-0"
            side="right"
            size={68}
            ropeLength={40}
            delay={0.7}
            tone="muted"
            flip
          />
        </div>

        <div aria-hidden className="hidden md:block">
          <HangingFlower
            className="left-3 top-0 sm:left-8 lg:left-14"
            side="left"
            size={200}
            ropeLength={120}
            delay={0}
            tone="primary"
          />
          <HangingFlower
            className="right-6 top-0 sm:right-12 lg:right-20"
            side="right"
            size={160}
            ropeLength={90}
            delay={1.2}
            tone="muted"
          />
          <HangingFlower
            className="left-10 bottom-0 lg:left-20"
            side="left"
            size={130}
            ropeLength={80}
            delay={2.2}
            tone="muted"
            flip
          />
          <HangingFlower
            className="right-12 bottom-0 lg:right-24"
            side="right"
            size={110}
            ropeLength={70}
            delay={0.4}
            tone="primary"
            flip
          />
        </div>

        <DriftingPetals />

        <div className="relative z-0">{children}</div>
      </div>
    </div>
  );
}

function DriftingPetals() {
  const petals = Array.from({ length: 7 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {petals.map((i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-primary/20"
          style={{
            left: `${8 + i * 12}%`,
            top: `${10 + (i % 4) * 22}%`,
            animation: `formPetalFloat ${16 + i * 2}s ease-in-out ${i * 1.3}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes formPetalFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.25; }
          50% { transform: translate(${Math.random() * 30 - 15}px, -50px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
