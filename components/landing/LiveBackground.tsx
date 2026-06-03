'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type BackgroundVariant =
  | 'aurora'
  | 'community'
  | 'fragment'
  | 'shift'
  | 'hearts'
  | 'sparkle'
  | 'shield'
  | 'globe'
  | 'rays';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  base: number;
  phase: number;
  color: string;
  alpha: number;
}

interface LiveBackgroundProps {
  variant: BackgroundVariant;
  className?: string;
  density?: 'low' | 'med' | 'high';
}

const PALETTE: Record<BackgroundVariant, string[]> = {
  aurora: ['#512ef8', '#7a5cfa', '#d6ff5d'],
  community: ['#7a5cfa', '#512ef8', '#d6ff5d'],
  fragment: ['#666666', '#888888', '#444444'],
  shift: ['#512ef8', '#7a5cfa', '#d6ff5d', '#22c55e'],
  hearts: ['#ef4444', '#f87171', '#fb7185'],
  sparkle: ['#d6ff5d', '#facc15', '#a3e635'],
  shield: ['#22c55e', '#16a34a', '#4ade80'],
  globe: ['#7a5cfa', '#512ef8', '#06b6d4'],
  rays: ['#512ef8', '#d6ff5d', '#7a5cfa'],
};

const DENSITY: Record<NonNullable<LiveBackgroundProps['density']>, number> = {
  low: 0.5,
  med: 1,
  high: 1.4,
};

export function LiveBackground({ variant, className, density = 'med' }: LiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { rootMargin: '200px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let scrollY = 0;
    let lastFrame = 0;

    const colors = PALETTE[variant];
    const baseCount =
      variant === 'globe'
        ? 38
        : variant === 'aurora' || variant === 'rays'
        ? 0
        : 22;
    const count = Math.round(baseCount * DENSITY[density] * (window.innerWidth < 640 ? 0.5 : 1));

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      particles = Array.from({ length: count }, () => {
        const size = 1 + Math.random() * 1.8;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.08,
          vy: variant === 'hearts' ? -0.08 - Math.random() * 0.12 : (Math.random() - 0.5) * 0.08,
          size,
          base: size,
          phase: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.12 + Math.random() * 0.28,
        };
      });
    };

    const step = (t: number) => {
      if (t - lastFrame < 16) {
        raf = requestAnimationFrame(step);
        return;
      }
      lastFrame = t;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.004;

        const wobble = Math.sin(p.phase) * 0.06;
        p.x += wobble;
        p.y += Math.cos(p.phase) * 0.04;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Mouse parallax
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const force = (1 - dist / 160) * 0.4;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Scroll drift
        p.y += scrollY * 0.0008;

        // Draw
        ctx.beginPath();
        if (variant === 'hearts') {
          drawHeart(ctx, p.x, p.y, p.size * 1.4, p.color, p.alpha);
        } else if (variant === 'sparkle') {
          drawStar(ctx, p.x, p.y, p.size * 1.3, p.color, p.alpha, p.phase);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Connect nearby particles for "community" and "globe"
      if (variant === 'community' || variant === 'globe') {
        const maxDist = variant === 'globe' ? 80 : 110;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < maxDist) {
              ctx.beginPath();
              ctx.strokeStyle = a.color;
              ctx.globalAlpha = (1 - d / maxDist) * 0.18;
              ctx.lineWidth = 0.6;
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };

    resize();
    raf = requestAnimationFrame(step);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [variant, density, inView, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0 -z-0 overflow-hidden', className)}
      aria-hidden
    >
      {variant === 'aurora' && <AuroraLayer />}
      {variant === 'rays' && <RaysLayer />}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

function AuroraLayer() {
  return (
    <div className="absolute inset-0">
      <div className="aurora absolute inset-0" />
    </div>
  );
}

function RaysLayer() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 30% 30%, rgba(81,46,248,0.18) 0%, transparent 70%), radial-gradient(50% 40% at 80% 20%, rgba(214,255,93,0.16) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 12, size / 12);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha * 0.7;
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(0, -2, -6, -2, -6, 1);
  ctx.bezierCurveTo(-6, 4, 0, 7, 0, 9);
  ctx.bezierCurveTo(0, 7, 6, 4, 6, 1);
  ctx.bezierCurveTo(6, -2, 0, -2, 0, 3);
  ctx.fill();
  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
  phase: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(phase);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const r = size;
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    const angle2 = angle + Math.PI / 4;
    ctx.lineTo(Math.cos(angle2) * r * 0.35, Math.sin(angle2) * r * 0.35);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
