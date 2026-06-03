'use client';

import { useEffect, useState } from 'react';

interface ShatterFlower {
  startLeft: string;
  startTop: string;
  size: number;
  tx: number;
  ty: number;
  rot: number;
  initRot: number;
  delay: number;
  duration: number;
  layer: 'back' | 'mid' | 'front';
  z: number;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildShatterFlowers(count: number): ShatterFlower[] {
  const rand = mulberry32(2024);
  const flowers: ShatterFlower[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 720 + rand() * 620;
    const startOffsetX = (rand() - 0.5) * 8;
    const startOffsetY = (rand() - 0.5) * 8;
    const sizeRoll = rand();
    const size =
      sizeRoll < 0.35
        ? 14 + rand() * 10
        : sizeRoll < 0.7
        ? 28 + rand() * 18
        : 50 + rand() * 40;
    const layer: ShatterFlower['layer'] = size < 26 ? 'back' : size < 44 ? 'mid' : 'front';
    flowers.push({
      startLeft: `calc(50% + ${startOffsetX}%)`,
      startTop: `calc(50% + ${startOffsetY}%)`,
      size,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      rot: (rand() > 0.5 ? 1 : -1) * (300 + rand() * 520),
      initRot: (rand() - 0.5) * 60,
      delay: 0.7 + rand() * 0.45,
      duration: 1.1 + rand() * 0.55,
      layer,
      z: layer === 'back' ? 1 : layer === 'mid' ? 2 : 3,
    });
  }
  return flowers;
}

const CENTER_SIZE = 460;
const SHATTER_COUNT = 56;
const TOTAL_MS = 3000;

export function IntroReveal() {
  const [mounted, setMounted] = useState(true);
  const [shatter] = useState<ShatterFlower[]>(() => buildShatterFlowers(SHATTER_COUNT));

  useEffect(() => {
    const t = setTimeout(() => setMounted(false), TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  // Sort render order: small/back first, big/front last, so big petals stack on top of small ones.
  const orderedShatter = [...shatter].sort((a, b) => a.size - b.size);

  return (
    <div
      aria-hidden
      className="intro-overlay fixed inset-0 z-[100] overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      <div className="intro-veil absolute inset-0" />

      {orderedShatter.map((f, i) => (
        <div
          key={i}
          className={`scatter-flower scatter-${f.layer} pointer-events-none absolute`}
          style={{
            left: f.startLeft,
            top: f.startTop,
            width: f.size,
            height: f.size,
            marginLeft: -f.size / 2,
            marginTop: -f.size / 2,
            zIndex: f.z,
            ['--tx' as string]: `${f.tx}px`,
            ['--ty' as string]: `${f.ty}px`,
            ['--rot' as string]: `${f.rot}deg`,
            ['--init-rot' as string]: `${f.initRot}deg`,
            ['--dur' as string]: `${f.duration}s`,
            ['--dly' as string]: `${f.delay}s`,
          }}
        >
          <img
            src="/assets/flower 2.png"
            alt=""
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>
      ))}

      <div
        className="center-flower pointer-events-none absolute"
        style={{
          left: '50%',
          top: '50%',
          width: CENTER_SIZE,
          height: CENTER_SIZE,
          marginLeft: -CENTER_SIZE / 2,
          marginTop: -CENTER_SIZE / 2,
          zIndex: 10,
        }}
      >
        <img
          src="/assets/flower 2.png"
          alt=""
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>

      <style jsx>{`
        .intro-veil {
          background:
            radial-gradient(60% 50% at 50% 50%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 70%);
          backdrop-filter: blur(8px) saturate(110%);
          -webkit-backdrop-filter: blur(8px) saturate(110%);
          animation: veil-pulse 3s ease-out forwards;
        }
        :global(.dark) .intro-veil {
          background:
            radial-gradient(60% 50% at 50% 50%, rgba(10, 10, 10, 0.55) 0%, rgba(10, 10, 10, 0) 70%);
        }
        .center-flower {
          transform-origin: 50% 50%;
          animation: center-bloom 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .scatter-flower {
          transform-origin: 50% 50%;
          will-change: transform, opacity;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .scatter-back {
          animation: scatter var(--dur) cubic-bezier(0.22, 1, 0.36, 1) var(--dly) forwards;
        }
        .scatter-mid {
          animation: scatter var(--dur) cubic-bezier(0.22, 1, 0.36, 1) var(--dly) forwards;
        }
        .scatter-front {
          animation: scatter var(--dur) cubic-bezier(0.22, 1, 0.36, 1) var(--dly) forwards;
        }
        @keyframes veil-pulse {
          0%   { opacity: 0; }
          10%  { opacity: 1; }
          78%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes center-bloom {
          0%   { transform: scale(0) rotate(-12deg); opacity: 0; filter: blur(8px); }
          22%  { transform: scale(0.6) rotate(-4deg); opacity: 1; filter: blur(0); }
          55%  { transform: scale(1) rotate(0deg); opacity: 1; }
          72%  { transform: scale(1.04) rotate(2deg); opacity: 1; }
          86%  { transform: scale(1.08) rotate(4deg); opacity: 0.92; }
          100% { transform: scale(1.18) rotate(6deg); opacity: 0; }
        }
        @keyframes scatter {
          0% {
            transform: translate(0, 0) rotate(var(--init-rot)) scale(0.25);
            opacity: 0;
          }
          10% {
            transform: translate(0, 0) rotate(var(--init-rot)) scale(1);
            opacity: 1;
          }
          60% {
            transform: translate(
                calc(var(--tx) * 0.58),
                calc(var(--ty) * 0.58)
              )
              rotate(calc(var(--init-rot) + var(--rot) * 0.58))
              scale(0.85);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty))
              rotate(calc(var(--init-rot) + var(--rot)))
              scale(0.45);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .intro-veil,
          .center-flower,
          .scatter-flower {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
