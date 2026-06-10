'use client';

import { HangingFlower } from '@/components/landing/HangingFlower';
import { OnboardingCoachmark } from '@/components/admin/OnboardingCoachmark';
import { TipsPanel } from '@/components/admin/TipsPanel';

export function AdminDecorations({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <OnboardingCoachmark />
      <TipsPanel />
      <HangingFlower
        className="right-4 top-16 hidden sm:block lg:right-10"
        side="right"
        size={96}
        ropeLength={60}
        delay={0.3}
        tone="muted"
      />
      <HangingFlower
        className="left-4 top-16 hidden lg:block"
        side="left"
        size={72}
        ropeLength={50}
        delay={1.0}
        tone="muted"
      />
      <HangingFlower
        className="bottom-0 right-8 hidden sm:block"
        side="right"
        size={64}
        ropeLength={70}
        delay={0.6}
        tone="muted"
        flip
      />
      <HangingFlower
        className="bottom-0 left-8 hidden lg:block"
        side="left"
        size={56}
        ropeLength={60}
        delay={1.3}
        tone="muted"
        flip
      />
      {children}
    </div>
  );
}
