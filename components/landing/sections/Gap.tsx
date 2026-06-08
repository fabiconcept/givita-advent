'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/landing/Reveal';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { Section } from '@/components/landing/blocks/Section';
import { Joint } from '@/components/landing/blocks/Joint';
import { Eyebrow } from '@/components/landing/blocks/Eyebrow';
import {
  IllustCommunity,
  IllustBroken,
  IllustShield,
} from '@/components/landing/illustrations';

function useInView(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); io.disconnect(); }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const FLOWER_CONFIG = [
  { side: 'right',         vMode: 'overflow-top',    size: 208, rotStart: 28, scaleStart: 0.3 },
  { side: 'bottom-center', vMode: 'overflow-bottom', size: 184, rotStart: -35, scaleStart: 0.2 },
  { side: 'right',         vMode: 'center',          size: 224, rotStart: 22, scaleStart: 0.4 },
];

const MOBILE_FLOWER = [
  { side: 'right',         vMode: 'overflow-top',    size: 160 },
  { side: 'bottom-center', vMode: 'overflow-top',    size: 140 },
  { side: 'left',          vMode: 'overflow-top',    size: 160 },
];

const CARD_CONFIG = [
  {
    entranceFrom:
      'translateY(160px) translateX(-120px) rotate(-18deg) scale(0.55)',
    entranceDuration: 1.3,
    entranceDelay: 0.05,
    depthFactor: -2.4,
    tiltMax: 10,
    tiltLift: 14,
    floatName: 'gapFloat0',
  },
  {
    entranceFrom:
      'translateY(-150px) translateX(110px) rotate(22deg) scale(0.4)',
    entranceDuration: 1.1,
    entranceDelay: 0.18,
    depthFactor: -1.3,
    tiltMax: 7,
    tiltLift: 10,
    floatName: 'gapFloat1',
  },
  {
    entranceFrom:
      'translateY(200px) scale(0.1) rotate(-30deg)',
    entranceDuration: 1.5,
    entranceDelay: 0.38,
    depthFactor: -0.5,
    tiltMax: 9,
    tiltLift: 12,
    floatName: 'gapFloat2',
  },
];

export function Gap() {
  const items = [
    { n: '01', title: 'Local currencies get lost in conversion',  body: "Cross-border donations arrive with fees and rates that don't reflect the reality of contributors.", Illust: IllustBroken,    strokeWidth: 2.4 },
    { n: '02', title: 'Trust is harder to establish',             body: 'Verification, oversight, and transparency are not first-class features - they are afterthoughts.',     Illust: IllustShield,    strokeWidth: 2.4 },
    { n: '03', title: 'Culture is treated as decoration',         body: 'The social dynamics that actually drive giving get flattened into one-time transactions.',             Illust: IllustCommunity, strokeWidth: 2.4 },
  ];

  const { ref: inViewRef, inView } = useInView(0.05);
  const inViewTriggered = useRef(false);
  const [entranceDone, setEntranceDone] = useState([false, false, false]);
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef(false);
  const [isLowPower, setIsLowPower] = useState(false);
  const isLowPowerRef = useRef(false);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = parallaxRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const centerProgress = ((rect.top + rect.height / 2) / vh - 0.5) * 2;
        const mobile = isMobileRef.current;
        const lowPower = isLowPowerRef.current;
        const pScale = mobile ? 0.35 : lowPower ? 0.5 : 1;
        const offset = centerProgress * 120 * pScale;

        if (bgRef.current) {
          bgRef.current.style.transform = `translateY(${offset * 0.18}px) rotate(${offset * 0.04}deg)`;
        }

        for (let i = 0; i < CARD_CONFIG.length; i++) {
          const cardEl = cardRefs.current[i];
          if (!cardEl) continue;
          const cfg = CARD_CONFIG[i];
          const df = cfg.depthFactor * (mobile ? 0.4 : 1);
          const tx = mobile ? offset * df * (i === 1 ? 0.4 : -0.35) : 0;
          cardEl.style.transform = `translateY(${offset * df}px) translateX(${tx}px) translateZ(${-offset * df * 0.35}px) scale(${1 - offset * df * 0.00015})`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    isMobileRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      isMobileRef.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const lowCores = (navigator.hardwareConcurrency ?? 8) < 4;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const low = lowCores || reducedMotion;
    setIsLowPower(low);
    isLowPowerRef.current = low;
  }, []);

  useEffect(() => {
    if (inView && !inViewTriggered.current) {
      inViewTriggered.current = true;
      const durations = CARD_CONFIG.map((cfg) => (cfg.entranceDelay + cfg.entranceDuration) * 1000);
      const maxDuration = Math.max(...durations);
      const timers = CARD_CONFIG.map((cfg, i) =>
        setTimeout(
          () => setEntranceDone((prev) => { const n = [...prev]; n[i] = true; return n; }),
          durations[i] + 100
        )
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [inView]);

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const flowerTargets = useRef([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);
  const flowerCurrent = useRef([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);
  const flowerRAF = useRef(0);
  const flowerRefs = useRef<(HTMLImageElement | null)[]>([null, null, null]);

  const tickFlowers = useCallback(() => {
    if (isMobileRef.current || isLowPowerRef.current) return;
    let active = false;
    const speed = 0.12;
    for (let i = 0; i < CARD_CONFIG.length; i++) {
      const t = flowerTargets.current[i];
      const c = flowerCurrent.current[i];
      c.x += (t.x - c.x) * speed;
      c.y += (t.y - c.y) * speed;
      const el = flowerRefs.current[i];
      if (el) {
        const cardCfg = CARD_CONFIG[i];
        const flCfg = FLOWER_CONFIG[i];
        const effSide = isMobileRef.current ? 'bottom-center' : flCfg.side;
        const effVMode = isMobileRef.current ? 'overflow-bottom' : flCfg.vMode;
        const baseX = effSide === 'right' ? 'translateX(25%)' : effSide === 'bottom-center' ? 'translateX(-50%)' : 'translateX(-25%)';
        const offsetDir = effSide === 'right' ? 1 : -1;
        let vy: string;
        switch (effVMode) {
          case 'overflow-top':    vy = 'translateY(-62%)'; break;
          case 'overflow-bottom': vy = 'translateY(62%)';  break;
          default:                vy = 'translateY(-50%)';
        }
        el.style.transform = `${vy} ${baseX} translateX(${c.x * 18 * offsetDir}px) translateY(${c.y * -18}px) perspective(1000px) rotateX(${-c.y * cardCfg.tiltMax * 1.3}deg) rotateY(${c.x * cardCfg.tiltMax * 1.3}deg)`;
      }
      if (Math.abs(c.x - t.x) > 0.001 || Math.abs(c.y - t.y) > 0.001) active = true;
    }
    flowerRAF.current = active ? requestAnimationFrame(tickFlowers) : 0;
  }, []);

  useEffect(() => {
    return () => { if (flowerRAF.current) cancelAnimationFrame(flowerRAF.current); };
  }, []);

  const handleCardEnter = useCallback((i: number) => {
    setHoveredCard(i);
  }, []);

  const handleCardLeave = useCallback((i: number) => {
    flowerTargets.current[i] = { x: 0, y: 0 };
    if (!flowerRAF.current) {
      flowerRAF.current = requestAnimationFrame(tickFlowers);
    }
    setHoveredCard(null);
  }, [tickFlowers]);

  const handleTiltMove = useCallback(
    (e: React.MouseEvent<HTMLElement>, index: number) => {
      const el = e.currentTarget;
      const cfg = CARD_CONFIG[index];
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (x - 0.5) * 2;
      const ry = (y - 0.5) * 2;
      el.style.transition = 'none';
      el.style.transform = `perspective(1000px) rotateX(${-ry * cfg.tiltMax}deg) rotateY(${rx * cfg.tiltMax}deg) translateZ(${cfg.tiltLift}px) scale(1.05)`;
      flowerTargets.current[index] = { x: rx, y: ry };
      if (!flowerRAF.current) {
        flowerRAF.current = requestAnimationFrame(tickFlowers);
      }
    },
    [tickFlowers]
  );

  const handleTiltLeave = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      el.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = '';
    },
    []
  );

  return (
    <Section id="gap" variant="fragment" tone="muted" align="wide">
      <div ref={parallaxRef} style={{ perspective: '900px' }}>
        <style>{`
        @keyframes gapFloat0 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-9px) rotate(-1.2deg); }
          75% { transform: translateY(-3px) rotate(0.8deg); }
        }
        @keyframes gapFloat1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes gapFloat2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-11px) translateX(4px) rotate(-1deg); }
          66% { transform: translateY(-2px) translateX(-4px) rotate(1deg); }
        }
        @keyframes illustPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.55; }
          50% { transform: scale(1.12) rotate(4deg); opacity: 0.95; }
        }
        @keyframes taglinePulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateY(0); opacity: 0.15; }
          50% { transform: translateY(4px); opacity: 0.5; }
        }
        @keyframes flowerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes watermarkGrow {
          0% { opacity: 0; transform: scale(0.6); }
          100% { opacity: 0.25; transform: scale(1); }
        }
        .gap-watermark {
          opacity: 0.25;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: 0.4s;
        }
        .gap-card:hover .gap-watermark {
          opacity: 0.7;
          transform: scale(1.35);
          transition-delay: 0.35s;
        }

      `}</style>

      {(isMobile || isLowPower) ? null : (
        <svg className="absolute w-0 h-0" aria-hidden>
          <defs>
            <filter id="liquidGlass">
              <feComponentTransfer in="SourceAlpha" result="alpha">
                <feFuncA type="identity" />
              </feComponentTransfer>
              <feGaussianBlur in="alpha" stdDeviation="10" result="blur" />
              <feDisplacementMap in="SourceGraphic" in2="blur" scale="14" xChannelSelector="A" yChannelSelector="A" />
            </filter>
          </defs>
        </svg>
      )}

      <HangingFlower
        className="right-8 top-0 sm:right-16 lg:right-24"
        side="right" size={68} ropeLength={56} delay={0.4} tone="muted"
        swayMultiplier={1.6}
      />

      <div
        ref={bgRef}
        className="pointer-events-none absolute inset-0 -z-10 hidden items-center justify-center sm:flex"
      >
        <div className="w-80 opacity-[0.06] sm:opacity-[0.10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/empty-box 1.png" alt="" aria-hidden className="h-auto w-full object-contain" loading="lazy" />
        </div>
      </div>

      <Reveal><Eyebrow number="02" label="The gap" tone="primary" /></Reveal>

      <Reveal delay={100}>
        <h2 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Most platforms were not built with African communities in mind.
        </h2>
      </Reveal>

      <div ref={inViewRef} className="relative z-10 mt-16 grid gap-12 sm:grid-cols-3 sm:gap-10">
        {items.map((item, i) => {
          const cfg = CARD_CONFIG[i];
          return (
            <div
              key={item.n}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="relative"
            >
              <div
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : cfg.entranceFrom,
                  transition: inView
                    ? `all ${cfg.entranceDuration}s cubic-bezier(0.34, 1.56, 0.64, 1) ${cfg.entranceDelay}s`
                    : 'none',
                }}
              >
                <div
                  className={`${entranceDone[i] ? '' : 'pointer-events-none'} relative`}
                  style={{
                    animation: entranceDone[i] && !isLowPower
                      ? `${cfg.floatName} ${3.5 - i * 0.5}s ease-in-out infinite`
                      : 'none',
                  }}
                >
                  {(() => {
                    if (isMobile || isLowPower) {
                      const mf = MOBILE_FLOWER[i];
                      return (
                        <div
                          className="absolute z-[-1] pointer-events-none"
                          style={{
                            width: `${mf.size}px`,
                            height: `${mf.size}px`,
                            top: 0,
                            left: i === 0 ? 'auto' : i === 1 ? '50%' : 0,
                            right: i === 0 ? 0 : 'auto',
                            transform: i === 1 ? 'translateX(-50%)' : 'none',
                            opacity: entranceDone[i] ? 0.25 : 0,
                            transition: 'opacity 1s ease-out 0.5s',
                          }}
                        >
                          <img
                            src="/assets/flower 2.png"
                            alt=""
                            aria-hidden
                            className="h-full w-full object-contain"
                            style={{
                              animation: entranceDone[i] ? `flowerSpin ${6 + i * 2}s linear infinite` : 'none',
                            }}
                          />
                        </div>
                      );
                    }
                    const flCfg = FLOWER_CONFIG[i];
                    return (
                      <div
                        className="transition-all duration-700"
                        style={{
                          transform: hoveredCard === i
                            ? 'scale(1) rotate(0deg)'
                            : `scale(${flCfg.scaleStart}) rotate(${flCfg.rotStart}deg)`,
                          transitionTimingFunction: hoveredCard === i
                            ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                            : 'ease-out',
                          transitionDelay: hoveredCard === i ? '0s' : '0.25s',
                        }}
                      >
                        <img
                          ref={(el) => { flowerRefs.current[i] = el; }}
                          src="/assets/flower 2.png"
                          alt=""
                          aria-hidden
                          className={`absolute z-[-1] pointer-events-none object-contain transition-opacity duration-500 ease-out ${flCfg.side === 'right' ? 'right-0' : flCfg.side === 'bottom-center' ? 'left-1/2' : 'left-0'} ${flCfg.vMode === 'overflow-top' ? 'top-0' : flCfg.vMode === 'overflow-bottom' ? 'bottom-0' : ''}`}
                          style={{
                            width: `${flCfg.size}px`,
                            height: `${flCfg.size}px`,
                            ...(flCfg.side === 'bottom-center' ? { top: flCfg.vMode === 'overflow-top' ? 0 : '50%' } : {}),
                            opacity: hoveredCard === i ? 1 : 0,
                            transitionDelay: hoveredCard === i ? '0s' : '0.25s',
                          }}
                        />
                      </div>
                    );
                  })()}
                  <article
                    {...(isMobile ? {} : {
                      onMouseEnter: () => handleCardEnter(i),
                      onMouseMove: (e) => handleTiltMove(e, i),
                      onMouseLeave: (e) => { handleTiltLeave(e); handleCardLeave(i); },
                    })}
                    className={`gap-card group relative overflow-hidden rounded-2xl border border-border/40 transition-all duration-500 ${(isMobile || isLowPower) ? '' : 'hover:border-primary/30'}`}
                  >
                    {(isMobile || isLowPower) ? (
                      <div className="absolute inset-0 z-0 rounded-[inherit] bg-card/15" />
                    ) : (
                      <>
                        <div className="absolute inset-0 z-0 rounded-[inherit] bg-card/[0.08] backdrop-blur-[4px]" />
                        <div className="absolute inset-0 z-[1] rounded-[inherit] bg-card/10 transition-colors duration-500 group-hover:bg-card/20" />
                      </>
                    )}
                    <div
                      className="absolute inset-0 z-[2] rounded-[inherit] pointer-events-none"
                      style={{ boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.10), inset 0 0 12px rgba(255,255,255,0.04)' }}
                    />

                    <div className="relative z-[3] p-8">
                      <span
                        className="gap-watermark pointer-events-none absolute -right-2 -top-3 select-none font-mono text-7xl font-bold leading-none sm:text-8xl"
                        style={{
                          transformOrigin: 'top right',
                          ...((isMobile || isLowPower)
                            ? { animation: entranceDone[i] ? 'watermarkGrow 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s both' : 'none' }
                            : {}),
                        }}
                      >
                        {item.n}
                      </span>

                      <div className="relative">
                        <div
                          className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                          style={{
                            animation: entranceDone[i] && !isLowPower
                              ? `illustPulse ${3 + i * 0.4}s ease-in-out ${i * 0.8}s infinite`
                              : 'none',
                          }}
                        >
                          <item.Illust
                            strokeWidth={item.strokeWidth}
                            className="h-full w-full text-foreground/60 transition-all duration-700"
                          />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold sm:mt-5">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                      </div>

                      <div className={`pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-r from-transparent via-primary/25 to-transparent transition-all duration-700 ${(isMobile || isLowPower) ? 'h-0 opacity-0' : 'h-px opacity-0 group-hover:h-1 group-hover:opacity-100'}`} />
                    </div>

                    {i < items.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute z-[4] -bottom-7 left-1/2 hidden -translate-x-1/2 text-muted-foreground/20 sm:block"
                        style={{
                          animation: entranceDone[i] && !isLowPower
                            ? 'arrowBounce 2.2s ease-in-out infinite'
                            : 'none',
                        }}
                      >
                        <svg width="22" height="32" viewBox="0 0 22 32" fill="none" className="h-8 w-6">
                          <line x1="11" y1="0" x2="11" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" />
                          <path d="M 6 24 L 11 30 L 16 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </article>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-20 flex justify-center sm:mt-24"
        style={{
          animation: entranceDone.every(Boolean) && !isLowPower ? 'taglinePulse 3s ease-in-out infinite' : 'none',
        }}
      >
        <div className="group relative">
          {(isMobile || isLowPower) ? (
            <div className="absolute inset-0 z-0 rounded-full bg-card/15" />
          ) : (
            <>
              <div className="absolute inset-0 z-0 rounded-full bg-card/[0.07] backdrop-blur-[3px]" />
              <div className="absolute inset-0 z-[1] rounded-full bg-card/10" />
            </>
          )}
          <div
            className="absolute inset-0 z-[2] rounded-full pointer-events-none"
            style={{ boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.08), inset 0 0 8px rgba(255,255,255,0.03)' }}
          />
          <div className="relative z-[3] inline-flex items-center gap-2.5 rounded-full border border-dashed border-border/60 px-5 py-2.5 text-xs text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full bg-destructive/50"
              style={{
                animation: entranceDone.every(Boolean) && !isLowPower ? 'taglinePulse 2s ease-in-out infinite' : 'none',
              }}
            />
            Three compounding problems &mdash; one underlying cause.
          </div>
        </div>
      </div>

      <Joint tone="leave" />
      </div>
    </Section>
  );
}
