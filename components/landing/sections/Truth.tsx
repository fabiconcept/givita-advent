'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Eyebrow } from '@/components/landing/blocks/Eyebrow';
import { HangingFlower } from '@/components/landing/HangingFlower';

export function Truth() {
  const TRUTH_PARAGRAPH =
    'When someone wants to start a business, pursue a dream, solve a local problem, support a cultural movement, pay for education, fund a creative project, or overcome a difficult season - people come together. Family contributes. Friends contribute. Neighbors contribute.';

  const GROUPS: [number, number, boolean][] = [
    [8,  12, true],   // start a business
    [14, 18, false],  // pursue a dream
    [20, 26, true],   // solve a local problem
    [28, 34, false],  // support a cultural movement
    [36, 40, false],  // pay for education
    [42, 48, true],   // fund a creative project
    [52, 58, true],   // overcome a difficult season
    [62, 66, true],   // people come together
    [68, 70, true],   // Family contributes
    [72, 74, true],   // Friends contribute
    [76, 78, true],   // Neighbors contribute
  ];
  const NUM_GROUPS = GROUPS.length;

  const tokens = TRUTH_PARAGRAPH.split(/(\s+)/).filter(Boolean);

  const tokenMeta = useMemo(() => {
    const map = new Map<number, { groupIdx: number; isKey: boolean }>();
    GROUPS.forEach(([s, e, k], gi) => {
      for (let t = s; t <= e; t++) map.set(t, { groupIdx: gi, isKey: k });
    });
    return map;
  }, []);

  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const h = () => setReduced(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    if (reduced) { setProgress(1); return; }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, -rect.top);
        setProgress(total > 0 ? Math.min(1, scrolled / total) : 1);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced]);

  const zoomP = Math.min(Math.max((progress - 0) / 0.15, 0), 1);
  const scale = reduced ? 1 : 0.8 + zoomP * 0.2;

  const hlP = reduced ? 1 : Math.min(Math.max((progress - 0.1) / 0.6, 0), 1);

  const flowerP = reduced ? 1 : Math.min(1, Math.max(0, (progress - 0.05) / 0.4));
  const flowerEntryY = (1 - flowerP) * -50;
  const flowerOutroY = Math.max(0, (progress - 0.7) / 0.3) * 18;
  const flowerY = flowerEntryY + flowerOutroY;
  const flowerScale = 0.7 + flowerP * 0.3;

  const wordBrightness = (tokenIdx: number, isSpace: boolean): number => {
    if (isSpace) return 0;
    if (reduced) return 1;
    const pos = tokenIdx / tokens.length;
    if (hlP >= pos) return 1;
    const dist = pos - hlP;
    const glow = Math.exp(-(dist * dist) / (2 * 0.055 * 0.055));
    return 0.2 + glow * 0.8;
  };

  return (
    <section
      id="truth"
      ref={sectionRef}
      className="relative scroll-mt-16"
      style={{ height: '220vh' }}
    >
      <div className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden">
        <div
          className="mx-auto w-full max-w-3xl px-5 sm:px-8"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            opacity: reduced ? 1 : 0.6 + zoomP * 0.4,
            willChange: 'transform, opacity',
          }}
        >
          <Eyebrow number="01" label="The truth we know" />
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Across Africa, communities have always been the backbone of progress.
          </h2>
          <p className="mt-8 max-w-3xl wrap-break-words text-pretty text-lg leading-relaxed sm:text-xl">
            {tokens.map((token, i) => {
              const isSpace = /^\s+$/.test(token);
              const b = wordBrightness(i, isSpace);
              const meta = tokenMeta.get(i);
              const isKey = meta?.isKey ?? false;
              const keyLit = isKey && hlP >= (meta!.groupIdx + 0.5) / NUM_GROUPS;
              const highlightColor = isLight ? '#512ef8' : '#d6ff5d';
              return (
                <span
                  key={i}
                  style={{
                    color: keyLit
                      ? highlightColor
                      : b > 0.6
                        ? 'hsl(var(--foreground))'
                        : 'hsl(var(--muted-foreground))',
                    opacity: isSpace ? 0.3 : 0.2 + 0.8 * b,
                    textDecoration: keyLit ? `underline wavy ${highlightColor}` : 'none',
                    textUnderlineOffset: keyLit ? 4 : 0,
                    transition: 'color 200ms ease, opacity 200ms linear',
                  }}
                >
                  {isSpace ? ' ' : token}
                </span>
              );
            })}
          </p>
        </div>
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: '58%',
            top: '2%',
            opacity: flowerP,
            transform: `translateX(-50%) translateY(${flowerY}px) scale(${flowerScale})`,
            filter: 'drop-shadow(0 0 14px rgba(214, 255, 93, 0.45))',
          }}
        >
          <HangingFlower
            side="center"
            size={132}
            ropeLength={86}
            delay={0.3}
            tone="primary"
            spin={(1 - flowerP) * 160}
          />
        </div>
      </div>
    </section>
  );
}
