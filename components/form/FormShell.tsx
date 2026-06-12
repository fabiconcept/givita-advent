'use client';

import { ReactNode, useEffect, useState } from 'react';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { LiveBackground } from '@/components/landing/LiveBackground';
import { IntroReveal } from '@/components/landing/IntroReveal';
import { OnboardingCoachmark } from '@/components/admin/OnboardingCoachmark';
import { Keyboard, ListChecks, BookOpen } from 'lucide-react';

const FORM_ONBOARDING_STEPS = [
  {
    icon: <ListChecks className="h-8 w-8 text-primary" />,
    title: 'One question at a time',
    description: 'Each question appears on its own screen. Just answer and click Continue — the progress bar at the top shows how far you are.',
  },
  {
    icon: <Keyboard className="h-8 w-8 text-primary" />,
    title: 'Keyboard-friendly',
    description: 'Press Enter to continue or submit. Press Escape to go back. On choice questions, press 1-9 to select an option.',
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: 'Auto-saved progress',
    description: 'Your answers are saved automatically as you go. If you leave and come back, you can pick up where you left off.',
  },
];

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
      <OnboardingCoachmark storageKey="givita:onboarding-form-seen" steps={FORM_ONBOARDING_STEPS} />

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
