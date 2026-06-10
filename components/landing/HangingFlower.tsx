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

function hash1D(i: number): number {
  let h = (i ^ (i << 15)) * 374761393 + 668265263;
  h = ((h ^ (h >> 13)) * 1274126177) & 0x7fffffff;
  return (h & 0xffff) / 65536;
}

function perlin1D(x: number): number {
  const ix = Math.floor(x);
  const fx = x - ix;
  const sx = fx * fx * (3 - 2 * fx);
  const g1 = hash1D(ix) * 2 - 1;
  const g2 = hash1D(ix + 1) * 2 - 1;
  return g1 + sx * (g2 - g1);
}

function sampleTerminalV(): number {
  const r = Math.random();
  if (r < 0.45) return 60 + Math.random() * 180;
  if (r > 0.55) return 420 + Math.random() * 630;
  return 240 + Math.random() * 180;
}

function sampleReCl(vy: number, r: number): { Cd: number; Cl: number; isLowRe: boolean } {
  const Re = 1.2 * Math.abs(vy) * r / 2.5;
  const result = { Cd: 0, Cl: 0, isLowRe: Re < 100 };
  if (result.isLowRe) {
    result.Cd = 24 / Math.max(Re, 1);
    result.Cl = 0.4 + Math.random() * 0.3;
    if (Re < 1) console.log('[HangingFlower] sampleReCl near-zero vy —', { vy, Re, Cd: result.Cd });
  } else {
    result.Cd = 0.5 + Math.random() * 0.15;
    result.Cl = 0.04 + Math.random() * 0.04;
  }
  return result;
}

function eulerRotY(angle: number, torque: number, inertia: number, damping: number, dt: number) {
  const alpha = (torque - damping * angle) / inertia;
  return angle + alpha * dt;
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
    console.log('[HangingFlower] hover start');
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
    console.log('[HangingFlower] hover stop');
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
    console.log('[HangingFlower] respawn');
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
    const w = rect.width;
    const h = rect.height;
    const startX = rect.left;
    const startY = rect.top;

    const terminalV = sampleTerminalV();
    const isSlow = terminalV < 250;
    const r = Math.max(w, h) / 100;
    const gravity = 980;
    const mass = r * r * 10;
    const area = (w / 100) * (h / 100);

    const windStrength = isSlow ? 140 + Math.random() * 100 : 25 + Math.random() * 40;
    const windFreq = isSlow ? 0.4 + Math.random() * 0.6 : 0.2 + Math.random() * 0.3;
    const gustFreq = 1.2 + Math.random() * 0.8;
    const gustStrength = isSlow ? 60 + Math.random() * 40 : 10 + Math.random() * 20;

    const flutterFreq = isSlow ? 7 + Math.random() * 5 : 2.5 + Math.random() * 2;
    const flutterAmp = isSlow ? 1.5 + Math.random() * 2 : 4 + Math.random() * 8;
    const spinTorque = (Math.random() > 0.5 ? 1 : -1) * (isSlow ? 0.3 + Math.random() * 0.4 : 0.8 + Math.random() * 1.2);
    const inertia = isSlow ? 0.6 + Math.random() * 0.4 : 1.2 + Math.random() * 0.8;

    const stallProb = isSlow ? 0.008 : 0;
    const stallDuration = isSlow ? 0.08 + Math.random() * 0.18 : 0;
    let stallTimer = 0;

    const skewPhaseX = Math.random() * Math.PI * 2;
    const skewPhaseY = Math.random() * Math.PI * 2;
    const skewAmpX = 0.15 + Math.random() * 0.25;
    const skewAmpY = 0.1 + Math.random() * 0.2;

    console.log('[HangingFlower] click —', { terminalV, isSlow, spinTorque, inertia, flutterFreq, flutterAmp, w, h, startX, startY });

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

    const totalFallDist = window.innerHeight + 80 - startY;
    let startTime: number | null = null;
    let lastFrameTime: number | null = null;
    let x = 0, y = 0, vx = 0, vy = 0;
    let angle = 0, angularVel = 0;
    let frameLogCount = 0;

    function fallTick(now: number) {
      if (!startTime) startTime = now;
      if (!lastFrameTime) lastFrameTime = now;
      const elapsed = now - startTime;
      const dt = Math.min((now - lastFrameTime) / 1000, 0.04);
      lastFrameTime = now;
      const t = elapsed / 1000;
      if (frameLogCount < 10) {
        console.log(`[HangingFlower] frame ${frameLogCount} —`, { t, dt, vy, vx, angle, angularVel, spinTorque, inertia, stallTimer });
        frameLogCount++;
      }

      const { Cd, Cl, isLowRe } = sampleReCl(vy, r);

      const spinRamp = Math.min(t / 0.5, 1);
      const spinSmooth = spinRamp * spinRamp * (3 - 2 * spinRamp);

      const windBase = perlin1D(t * windFreq) * windStrength;
      const gustEnvelope = Math.max(0, perlin1D(t * gustFreq + 100)) ** 3;
      const windVx = windBase + gustEnvelope * gustStrength;

      const dragFactor = isLowRe ? 6 * Math.PI * 2.5 * r : 0.5 * 1.2 * Cd * area;
      const Fd = isLowRe
        ? dragFactor * vy
        : dragFactor * vy * Math.abs(vy);

      const windRelV = windVx - vx;
      const FdWind = isLowRe
        ? 6 * Math.PI * 2.5 * r * windRelV
        : 0.5 * 1.2 * Cd * area * windRelV * Math.abs(windRelV);

      const Fl = isLowRe
        ? 0.5 * 1.2 * Cl * area * windRelV * Math.abs(windRelV) * 0.25
        : 0;

      let ay = (gravity * mass - Fd) / mass;
      if (stallTimer > 0) {
        ay -= vy * 4;
        stallTimer -= dt;
      }
      if (stallTimer <= 0 && stallProb > 0 && Math.random() < stallProb) {
        console.log('[HangingFlower] stall —', { t, vy });
        stallTimer = stallDuration;
        vy *= 0.25;
      }

      const ax = (FdWind + Fl) / mass;

      vy += ay * dt;
      vx += ax * dt;

      if (Math.abs(vy) > terminalV * 1.4) {
        vy = Math.sign(vy) * Math.min(Math.abs(vy), terminalV * 1.4);
      }
      const maxLateral = isSlow ? terminalV * 0.8 : terminalV * 0.15;
      if (Math.abs(vx) > maxLateral) vx = Math.sign(vx) * maxLateral;

      x += vx * dt;
      y += vy * dt;

      const torque = spinSmooth * spinTorque + vx * 0.002 * (isLowRe ? 2 : 1);
      if (isSlow) {
        angularVel = Math.sin(t * flutterFreq) * flutterAmp * 0.5 + torque * 0.3;
        angle += angularVel * dt * 60;
      } else {
        angularVel = eulerRotY(angularVel, torque, inertia, 0.3, dt * 60);
        angle += angularVel * dt * 60;
      }

      const totalY = startY + y;
      if (totalY > window.innerHeight + 80) {
        console.log('[HangingFlower] fall ended —', { totalY, angle, terminalV });
        leaf.remove();
        setTimeout(() => {
          hiddenRef.current = false;
          swayEl.style.display = '';
          animateRespawn();
        }, 1500);
        return;
      }

      const fallProgress = Math.min(y / totalFallDist, 1);
      const fade = 1 - Math.pow(Math.max(0, totalY - window.innerHeight * 0.5) / (window.innerHeight * 0.5 + 80), 1.5);
      const scale = 1 - fallProgress * 0.35;
      const skewMag = Math.max(-10, Math.min(10, angularVel * skewAmpX));
      const skewX = Math.sin(angle * 0.7 + skewPhaseX) * skewMag;
      const skewY = Math.cos(angle * 0.5 + skewPhaseY) * skewMag * 0.6;
      leaf.style.transform = `perspective(500px) translate(${x}px, ${y}px) rotate(${angle}deg) rotateX(${skewY}deg) rotateY(${skewX}deg) scale(${scale})`;
      leaf.style.opacity = String(Math.max(0, fade));

      fallAnimRef.current = requestAnimationFrame(fallTick);
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
