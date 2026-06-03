'use client';

import { useState } from 'react';
import { PhoneMockup } from '@/components/landing/PhoneMockup';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import {
  IllustCommunity,
  IllustHeartHands,
  IllustStream,
  IllustShield,
} from '@/components/landing/illustrations';

interface Screen {
  key: string;
  title: string;
  caption: string;
  Illustration: React.ComponentType<{ className?: string }>;
  image: string;
}

const SCREENS: Screen[] = [
  {
    key: 'community',
    title: 'Communities around causes',
    caption: 'Discover campaigns inside vibrant communities, not isolated pages.',
    Illustration: IllustCommunity,
    // Drop your PNG export at public/mobile/community.png and update this path.
    image: '/mobile/community.svg',
  },
  {
    key: 'giving',
    title: 'Giving that feels rewarding',
    caption: 'Badges, streaks, and milestones celebrate every contribution.',
    Illustration: IllustHeartHands,
    image: '/mobile/giving.svg',
  },
  {
    key: 'support',
    title: 'Supporters become champions',
    caption: 'Track progress, share updates, and celebrate milestones together.',
    Illustration: IllustStream,
    image: '/mobile/support.svg',
  },
  {
    key: 'trust',
    title: 'Trust you can see',
    caption: 'Verified campaigns, transparent reporting, and community oversight.',
    Illustration: IllustShield,
    image: '/mobile/trust.svg',
  },
];

export function MobileShowcase() {
  const [active, setActive] = useState(0);
  const screen = SCREENS[active];
  const Illustration = screen.Illustration;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
      <ul className="space-y-3">
        {SCREENS.map((s, i) => {
          const isActive = i === active;
          const Icon = s.Illustration;
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  'group flex w-full items-center gap-5 rounded-2xl border p-4 text-left transition-all duration-300',
                  isActive
                    ? 'border-primary/40 bg-card/80'
                    : 'border-transparent bg-transparent hover:bg-card/40'
                )}
              >
                <div
                  className={cn(
                    'h-14 w-20 shrink-0 transition-all duration-300',
                    isActive ? 'text-foreground' : 'text-muted-foreground/60 group-hover:text-foreground/80'
                  )}
                >
                  <Icon className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-base font-semibold transition-colors',
                      isActive ? 'text-foreground' : 'text-foreground/70'
                    )}
                  >
                    {s.title}
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-sm leading-relaxed transition-all duration-300',
                      isActive ? 'max-h-24 text-muted-foreground opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                    )}
                  >
                    {s.caption}
                  </p>
                </div>
                <ArrowRight
                  className={cn(
                    'h-4 w-4 shrink-0 transition-all duration-300',
                    isActive ? 'translate-x-0 text-primary opacity-100' : '-translate-x-2 text-muted-foreground opacity-0'
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-10 -z-10 rounded-full bg-primary/10 blur-3xl"
        />
        <div key={screen.key} className="transition-all duration-500 ease-out">
          <PhoneMockup src={screen.image} alt={screen.title} />
        </div>
        <p className="mx-auto mt-5 flex max-w-[280px] items-center justify-center gap-2 text-xs text-muted-foreground">
          <Illustration className="h-4 w-12" />
          <span>{screen.title}</span>
        </p>
      </div>
    </div>
  );
}
