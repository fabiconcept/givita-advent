'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Drop {
  x: number;
  delay: number;
  size: number;
  drift: number;
}

export function useEasterEgg(targetClicks = 5) {
  const [active, setActive] = useState(false);
  const [pressCount, setPressCount] = useState(0);
  const countRef = useRef(0);

  const trigger = useCallback(() => {
    countRef.current += 1;
    setPressCount(countRef.current);
    if (countRef.current >= targetClicks && !active) {
      setActive(true);
      countRef.current = 0;
      setPressCount(0);
      setTimeout(() => setActive(false), 4000);
    }
  }, [targetClicks, active]);

  const resetGauge = useCallback(() => {
    countRef.current = 0;
    setPressCount(0);
  }, []);

  return { active, trigger, pressCount, target: targetClicks, resetGauge };
}

export function FlowerRain({ active }: { active: boolean }) {
  const [drops] = useState<Drop[]>(() =>
    Array.from({ length: 24 }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      size: 14 + Math.random() * 20,
      drift: (Math.random() - 0.5) * 60,
    })),
  );

  useEffect(() => {
    if (!active) return;
    const el = document.getElementById('flower-rain');
    if (!el) return;
    el.style.pointerEvents = 'none';
  }, [active]);

  if (!active) return null;

  return (
    <div
      id="flower-rain"
      className="fixed inset-0 z-[200] overflow-hidden"
      aria-hidden
    >
      {drops.map((d, i) => (
        <img
          key={i}
          src="/assets/flower 2.png"
          alt=""
          className="absolute animate-petal-fall"
          style={{
            left: `${d.x}%`,
            top: '-30px',
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: `${d.delay}s`,
            ['--drift' as string]: `${d.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes petalFall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
        .animate-petal-fall {
          animation: petalFall 2.8s cubic-bezier(0.22, 0.6, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
}
