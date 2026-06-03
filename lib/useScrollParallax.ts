'use client';

import { useEffect, useRef, useState } from 'react';

export function useScrollParallax(multiplier = 60) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const centerProgress = ((rect.top + rect.height / 2) / vh - 0.5) * 2;
        setOffset(centerProgress * multiplier);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [multiplier]);

  return { ref, offset };
}
