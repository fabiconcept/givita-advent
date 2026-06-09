'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface HangingFlowerProps {
  className?: string;
  size?: number;
  ropeLength?: number;
  delay?: number;
  side?: 'left' | 'right' | 'center';
  src?: string;
  tone?: 'foreground' | 'muted' | 'primary';
  flip?: boolean;
  spin?: number;
  swayMultiplier?: number;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function roundTo(n: number, d: number) {
  return Math.round(n * d) / d;
}

export function HangingFlower({
  className,
  size = 96,
  ropeLength = 70,
  delay = 0,
  src = '/assets/flower 2.png',
  tone = 'foreground',
  flip = false,
  spin: initialSpin = 0,
  swayMultiplier = 1,
}: HangingFlowerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swayElRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenRef = useRef(false);
  const hoverRef = useRef(false);
  const fallAnimRef = useRef<number | null>(null);
  const hoverRafRef = useRef<number | null>(null);
  const hoverAngleRef = useRef(0);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const h = () => setReduced(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const windParams = useRef({
    freq1: roundTo(randomBetween(0.25, 0.65), 2),
    freq2: roundTo(randomBetween(0.08, 0.25), 2),
    freq3: roundTo(randomBetween(0.4, 0.9), 2),
    amp1: roundTo(randomBetween(2, 6), 1),
    amp2: roundTo(randomBetween(3, 8), 1),
    amp3: roundTo(randomBetween(1, 3), 1),
    gustFreq: roundTo(randomBetween(0.015, 0.04), 3),
    gustAmp: roundTo(randomBetween(4, 12), 1),
  });

  useEffect(() => {
    if (reduced) { swayElRef.current && (swayElRef.current.style.transform = `rotate(${initialSpin}deg)`); return; }
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { setInView(entry.isIntersecting); },
      { rootMargin: '100px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, initialSpin]);

  useEffect(() => {
    if (reduced || !inView) return;
    const el = swayElRef.current;
    if (!el) return;
    const w = windParams.current;
    let startTime = performance.now() - delay * 1000;
    let raf = 0;

    function tick(now: number) {
      const t = (now - startTime) / 1000;
      const w1 = Math.sin(t * w.freq1) * w.amp1 * swayMultiplier;
      const w2 = Math.sin(t * w.freq2 + 1.7) * w.amp2 * swayMultiplier;
      const w3 = Math.sin(t * w.freq3 + 4.2) * w.amp3 * swayMultiplier;
      const gust = Math.max(0, Math.sin(t * w.gustFreq)) ** 4 * w.gustAmp * swayMultiplier;
      el.style.transform = `rotate(${w1 + w2 + w3 + gust + initialSpin}deg)`;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [initialSpin, delay, inView, reduced, swayMultiplier]);

  const startHoverSpin = useCallback(() => {
    if (hoverRef.current) return;
    hoverRef.current = true;
    if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);

    const img = imgRef.current;
    if (!img) return;
    img.style.transition = 'none';
    img.style.transform = 'scale(1.05)';

    let last = performance.now();
    function tick(now: number) {
      if (!hoverRef.current) return;
      const dt = now - last;
      last = now;
      hoverAngleRef.current += dt * 0.0006;
      if (imgRef.current) {
        imgRef.current.style.transform = `scale(1.05) rotate(${hoverAngleRef.current}deg)`;
      }
      hoverRafRef.current = requestAnimationFrame(tick);
    }
    hoverRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopHoverSpin = useCallback(() => {
    hoverRef.current = false;
    if (hoverRafRef.current) {
      cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = null;
    }
    const img = imgRef.current;
    if (!img) return;
    img.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    hoverAngleRef.current = 0;
    img.style.transform = 'scale(1) rotate(0deg)';
  }, []);

  const animateRespawn = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const duration = 500;
    const start = performance.now();
    const drop = 24;

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      img.style.transform = `translateY(${drop * (1 - ease)}px) scale(${ease}) rotate(${-360 * (1 - ease)}deg)`;
      img.style.opacity = String(ease);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        img.style.transform = '';
        img.style.opacity = '';
      }
    }
    requestAnimationFrame(tick);
  }, []);

  const handleClick = useCallback(() => {
    const img = imgRef.current;
    const swayEl = swayElRef.current;
    if (!img || !swayEl || hiddenRef.current) return;
    hiddenRef.current = true;

    stopHoverSpin();

    const rect = img.getBoundingClientRect();
    const currentTransform = window.getComputedStyle(swayEl).transform;
    const w = rect.width;
    const h = rect.height;
    const startX = rect.left;
    const startY = rect.top;

    const drift = randomBetween(-140, 140) * swayMultiplier;
    const spin = randomBetween(-180, 360) * swayMultiplier;
    const duration = randomBetween(2400, 4000) / Math.max(swayMultiplier, 0.5);

    const leaf = document.createElement('span');
    leaf.className = 'pointer-events-none fixed z-50';
    leaf.style.left = `${startX}px`;
    leaf.style.top = `${startY}px`;
    leaf.style.width = `${w}px`;
    leaf.style.height = `${h}px`;
    leaf.style.transformOrigin = '50% 50%';
    leaf.style.opacity = '1';
    leaf.innerHTML = `<img src="${src}" alt="" class="h-full w-full object-contain" draggable="false" />`;
    document.body.appendChild(leaf);

    swayEl.style.display = 'none';

    const totalFall = window.innerHeight + 80 - startY;
    let startTime: number | null = null;

    function fallTick(now: number) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease = 1 - Math.pow(1 - progress, 1.5);
      const tx = drift * ease;
      const ty = totalFall * ease;
      const r = spin * ease;
      const s = 1 - ease * 0.35;
      const opacity = 1 - ease * 0.85;

      const base = currentTransform === 'none' ? '' : currentTransform;
      leaf.style.transform = `${base} translate(${tx}px, ${ty}px) rotate(${r}deg) scale(${s})`;
      leaf.style.opacity = String(opacity);

      if (progress < 1) {
        fallAnimRef.current = requestAnimationFrame(fallTick);
      } else {
        leaf.remove();
        setTimeout(() => {
          hiddenRef.current = false;
          swayEl.style.display = '';
          animateRespawn();
        }, 1500);
      }
    }

    requestAnimationFrame(fallTick);
  }, [src, stopHoverSpin, animateRespawn]);

  useEffect(() => {
    return () => {
      if (fallAnimRef.current) cancelAnimationFrame(fallAnimRef.current);
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
    };
  }, []);

  const width = size * 1.6;
  const height = ropeLength + size + 6;
  const ropeColor =
    tone === 'primary'
      ? 'text-primary/40'
      : tone === 'muted'
      ? 'text-foreground/15'
      : 'text-foreground/25';

  const swayOrigin = flip ? '50% 100%' : '50% 0%';

  return (
    <div
      ref={containerRef}
      className={cn('absolute z-10', flip && 'rotate-180', className)}
      style={{ width, height }}
      aria-hidden
    >
      <div className="flex h-full w-full flex-col items-center">
        <div
          className={cn('w-px', ropeColor)}
          style={{
            height: ropeLength,
            backgroundImage:
              'linear-gradient(to bottom, currentColor 0%, currentColor 60%, transparent 100%)',
          }}
        />
        <div
          ref={swayElRef}
          style={{
            width: size,
            height: size,
            transformOrigin: swayOrigin,
          }}
        >
          <img
            ref={imgRef}
            src={src}
            alt=""
            onClick={handleClick}
            onMouseEnter={startHoverSpin}
            onMouseLeave={stopHoverSpin}
            className={cn(
              'h-full w-full cursor-pointer object-contain',
              'drop-shadow-[0_10px_22px_rgba(0,0,0,0.18)]',
            )}
            style={{ transformOrigin: '50% 50%' }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
