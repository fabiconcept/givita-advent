'use client';

import { useEffect, useRef, useState } from 'react';
import { PhoneMockup } from '@/components/landing/PhoneMockup';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { cn } from '@/lib/utils';
import { ArrowRight, GripVertical } from 'lucide-react';
import {
  CommunityIcon,
  DonationsIcon,
  SupportIcon,
  ShieldCheckIcon,
} from '@/components/landing/svgrepoIcons';

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
    Illustration: CommunityIcon,
    image: '/assets/Campaign Page.png',
  },
  {
    key: 'giving',
    title: 'Giving that feels rewarding',
    caption: 'Badges, streaks, and milestones celebrate every contribution.',
    Illustration: DonationsIcon,
    image: '/assets/Campaign Page - Donations (Creator view).png',
  },
  {
    key: 'support',
    title: 'Supporters become champions',
    caption: 'Track progress, share updates, and celebrate milestones together.',
    Illustration: SupportIcon,
    image: '/assets/Frame 2183.png',
  },
  {
    key: 'trust',
    title: 'Trust you can see',
    caption: 'Verified campaigns, transparent reporting, and community oversight.',
    Illustration: ShieldCheckIcon,
    image: '/assets/Profile Page.png',
  },
];


export function ScrollShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [userPinned, setUserPinned] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, -rect.top);
        const pct = total > 0 ? Math.min(1, scrolled / total) : 0;
        setScrollPct(pct);
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
  }, []);

  const totalTabs = SCREENS.length;
  const tabPct = userPinned !== null ? userPinned / (totalTabs - 1) : scrollPct;
  const activeIndex = Math.min(totalTabs - 1, Math.max(0, Math.round(tabPct * (totalTabs - 1))));

  const introProgress = Math.min(1, scrollPct * 4);
  const zoom = 0.86 + introProgress * 0.14;

  const introOpacity = scrollPct < 0.88 ? 1 : Math.max(0, 1 - (scrollPct - 0.04) * 6);
  const outroOpacity = scrollPct > 0.94 ? Math.max(0, 1 - (scrollPct - 0.94) * 12) : 1;
  // The "keep scrolling" hint is only useful at the very start of the
  // section. Fade it out as soon as the user begins scrolling so it
  // doesn't linger through the parallax/sticky portion.
  const keepScrollingOpacity =
    scrollPct < 0.04 ? 1 : Math.max(0, 1 - (scrollPct - 0.04) * 8);

  // ScrollShowcase flower
  const flowerY = 18 + tabPct * 50;
  const flowerEntry = Math.min(1, Math.max(0, (scrollPct - 0.02) / 0.1));
  const flowerExit = Math.min(1, Math.max(0, (1 - scrollPct) / 0.06));
  const flowerOpacity = flowerEntry * flowerExit;
  const flowerScale = 0.35 + flowerEntry * 0.65;
  const glowColors = [
    'rgba(122, 92, 250, 0.35)',
    'rgba(214, 255, 93, 0.30)',
    'rgba(255, 159, 67, 0.30)',
    'rgba(0, 200, 200, 0.30)',
  ];

  return (
    <section
      ref={sectionRef}
      id="app"
      className="relative scroll-mt-16"
      style={{ height: `${isMobile ? Math.max(80, totalTabs * 30) + 80 : Math.max(180, totalTabs * 80) + 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-end overflow-hidden md:flex-row md:items-center md:justify-center relative">
        <div className="aurora absolute inset-0 -z-10" />
        <div className="relative mx-auto max-sm:-translate-y-1/6 w-full max-w-6xl px-5 sm:px-8">
          <div
            className="md:mt-24 -mt-40 md:mb-0 mb-12 transition-opacity duration-700"
            style={{ opacity: introOpacity }}
          >
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:mt-16">
              <span className="font-mono opacity-70">04</span>
              <span className="mx-3 inline-block h-px w-8 align-middle bg-current opacity-30" />
              In the app
            </p>
            <h2 className="mt-4 max-w-2xl text-balance text-2xl font-semibold leading-[1.1] tracking-tight sm:mt-8 sm:text-5xl">
              Built for the way we already give.
            </h2>
            <p className="mt-4 hidden max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:mt-6 sm:block">
              Keep scrolling - or tap any step to jump.
            </p>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
            <ul className="hidden space-y-3 md:block">
              {SCREENS.map((s, i) => {
                const isActive = i === activeIndex;
                const isPast = i < activeIndex;
                const Icon = s.Illustration;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => setUserPinned(i)}
                      className={cn(
                        'group relative flex w-full items-center gap-5 rounded-2xl border p-4 text-left transition-all duration-500',
                        isActive
                          ? 'border-primary/40 bg-card/80'
                          : isPast
                            ? 'border-border/60 bg-card/30 opacity-70'
                            : 'border-transparent bg-transparent opacity-40'
                      )}
                      style={{
                        transform: `translateX(${(i - activeIndex) * 4}px)`,
                      }}
                    >
                      <div
                        className={cn(
                          'h-14 w-14 shrink-0 transition-all duration-500',
                          isActive ? 'text-foreground' : 'text-muted-foreground/60'
                        )}
                      >
                        <Icon className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-mono text-[10px] transition-colors',
                              isActive ? 'text-primary' : 'text-muted-foreground/60'
                            )}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <p
                            className={cn(
                              'text-base font-semibold transition-colors',
                              isActive ? 'text-foreground' : 'text-foreground/70'
                            )}
                          >
                            {s.title}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'grid transition-all duration-500 ease-out',
                            isActive
                              ? 'mt-1 grid-rows-[1fr] opacity-100'
                              : 'grid-rows-[0fr] opacity-0'
                          )}
                        >
                          <div className="overflow-hidden">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {s.caption}
                            </p>
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        className={cn(
                          'h-4 w-4 shrink-0 transition-all duration-500',
                          isActive
                            ? 'translate-x-0 text-primary opacity-100'
                            : '-translate-x-2 opacity-0'
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
                className="absolute -inset-10 -z-10 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500"
                style={{ opacity: outroOpacity }}
              />

              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                  transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                  opacity: outroOpacity,
                }}
              >
                <PhoneStage screens={SCREENS} activeIndex={activeIndex} />
              </div>

              <div
                className="mx-auto mt-5 hidden max-w-[280px] items-center justify-center gap-2 text-xs text-muted-foreground transition-opacity duration-500 md:flex"
                style={{ opacity: outroOpacity }}
              >
                <ActiveScreen screens={SCREENS} activeIndex={activeIndex} />
                <span>{SCREENS[activeIndex].title}</span>
              </div>

              <MobileActiveCard
                screens={SCREENS}
                activeIndex={activeIndex}
                outroOpacity={outroOpacity}
              />

              <div
                className="pointer-events-none absolute -bottom-2 left-1/2 hidden -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 md:block"
                style={{ opacity: keepScrollingOpacity }}
              >
                keep scrolling
              </div>
            </div>
          </div>

          <ProgressDots active={activeIndex} total={totalTabs} scrollPct={scrollPct} className="mt-4 sm:mt-12" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute z-10 hidden lg:block"
          style={{
            right: 'clamp(80px, 15%, 180px)',
            top: `${flowerY}%`,
            opacity: flowerOpacity,
            transform: `translateY(-50%) scale(${flowerScale})`,
            filter: `drop-shadow(0 0 18px ${glowColors[activeIndex]})`,
            transition: 'filter 500ms ease',
          }}
        >
          <HangingFlower
            size={72}
            ropeLength={44}
            delay={0.1}
            tone="primary"
          />
        </div>
      </div>
    </section>
  );
}

function ActiveScreen({ screens, activeIndex }: { screens: Screen[]; activeIndex: number }) {
  const Illustration = screens[activeIndex].Illustration;
  return <Illustration className="h-4 w-4" />;
}

function PhoneStage({
  screens,
  activeIndex,
}: {
  screens: Screen[];
  activeIndex: number;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[200px] sm:max-w-[280px]">
      {screens.map((s, i) => {
        const isActive = i === activeIndex;
        const offsetDir = i > activeIndex ? 1 : -1;
        return (
          <div
            key={s.key}
            aria-hidden={!isActive}
            className={cn(
              'transition-[opacity,transform,filter] ease-[cubic-bezier(0.22,1,0.36,1)]',
              i === 0 ? 'relative' : 'absolute inset-0',
              isActive
                ? 'z-10 duration-600'
                : 'pointer-events-none z-0 duration-420'
            )}
            style={{
              transform: isActive
                ? 'translate3d(0, 0, 0) scale(1)'
                : `translate3d(${offsetDir * 32}px, 0, 0) scale(0.94)`,
              opacity: isActive ? 1 : 0,
              filter: isActive ? 'blur(0px)' : 'blur(3px)',
            }}
          >
            <PhoneMockup src={s.image} alt={s.title} hideMaxWidth />
          </div>
        );
      })}
    </div>
  );
}

function MobileActiveCard({
  screens,
  activeIndex,
  outroOpacity,
}: {
  screens: Screen[];
  activeIndex: number;
  outroOpacity: number;
}) {
  const s = screens[activeIndex];
  const Icon = s.Illustration;
  return (
    <div
      key={activeIndex}
      className="mt-5 md:hidden"
      style={{ opacity: outroOpacity }}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-2xl border border-primary/30 bg-card/80 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 text-foreground/80">
            <Icon className="h-full w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] text-primary">
              {String(activeIndex + 1).padStart(2, '0')}
            </p>
            <p className="truncate text-sm font-semibold leading-tight">
              {s.title}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {s.caption}
        </p>
      </div>
    </div>
  );
}

function ProgressDots({
  active,
  total,
  scrollPct,
  className,
}: {
  active: number;
  total: number;
  scrollPct: number;
  className?: string;
}) {
  return (
    <div className={cn('pointer-events-none flex items-center justify-center gap-2', className)}>
      {Array.from({ length: total }, (_, i) => {
        const fillScale =
          i < active
            ? 1
            : i === active
            ? Math.min(1, Math.max(0.15, scrollPct * total - active))
            : 0;
        return (
          <div
            key={i}
            className="relative h-1 w-8 overflow-hidden rounded-full bg-border/60"
          >
            <div
              className={cn(
                'absolute inset-y-0 left-0 origin-left rounded-full transition-transform duration-150 ease-out',
                i <= active ? 'bg-primary' : 'bg-transparent'
              )}
              style={{
                transform: `scaleX(${fillScale})`,
                width: '100%',
                opacity: i === active ? 0.85 : 1,
              }}
            />
          </div>
        );
      })}
      <GripVertical className="ml-2 h-3 w-3 text-muted-foreground/50" />
    </div>
  );
}
