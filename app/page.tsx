'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import useShortcuts from '@useverse/useshortcuts';
import { useShortcutGuard } from '@/components/ShortcutGuard';
import { IntroReveal } from '@/components/landing/IntroReveal';
import { TipsPanel } from '@/components/admin/TipsPanel';
import { FloatingThemeToggle } from '@/components/landing/blocks/FloatingThemeToggle';
import { KeyboardHints } from '@/components/landing/blocks/KeyboardHints';
import { StoryGuide, StoryProgressBar, type StoryChapter } from '@/components/landing/StoryGuide';
import { LiveActivity } from '@/components/landing/LiveActivity';
import { ScrollShowcase } from '@/components/landing/ScrollShowcase';
import { Hero } from '@/components/landing/sections/Hero';
import { Truth } from '@/components/landing/sections/Truth';
import { Gap } from '@/components/landing/sections/Gap';
import { Shift } from '@/components/landing/sections/Shift';
import { Giving } from '@/components/landing/sections/Giving';
import { Odogwu } from '@/components/landing/sections/Odogwu';
import { Trust } from '@/components/landing/sections/Trust';
import { Diaspora } from '@/components/landing/sections/Diaspora';
import { Future } from '@/components/landing/sections/Future';
import { Footer } from '@/components/landing/sections/Footer';

const CHAPTERS: StoryChapter[] = [
  { id: 'hero',     label: 'Opening' },
  { id: 'truth',    label: 'The truth' },
  { id: 'gap',      label: 'The gap' },
  { id: 'shift',    label: 'The shift' },
  { id: 'app',      label: 'In the app' },
  { id: 'giving',   label: 'Built around giving' },
  { id: 'odogwu',   label: 'Odogwu' },
  { id: 'trust',    label: 'Trust' },
  { id: 'diaspora', label: 'Diaspora' },
  { id: 'future',   label: 'The future' },
];

export default function LandingPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const { inputsFocused } = useShortcutGuard();
  const [contentOpacity, setContentOpacity] = useState(0);
  const [footerVisible, setFooterVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setContentOpacity(1), 1800);
    return () => clearTimeout(t);
  }, []);

  const snapToSection = useCallback((direction: 1 | -1) => {
    const ids = CHAPTERS.map((c) => c.id);
    const current = ids.findIndex((id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 200 && rect.bottom >= 200;
    });
    const next = Math.max(0, Math.min(ids.length - 1, (current >= 0 ? current : 0) + direction));
    const target = document.getElementById(ids[next]);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleShortcut = useCallback((shortcut: { key: string }) => {
    if (shortcut.key === 'T') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }
    if (shortcut.key === 'ArrowDown' || shortcut.key === 'J') snapToSection(1);
    if (shortcut.key === 'ArrowUp' || shortcut.key === 'K') snapToSection(-1);
  }, [resolvedTheme, setTheme, snapToSection]);

  useShortcuts({
    shortcuts: [
      { key: 'T', enabled: !inputsFocused },
      { key: 'J', enabled: !inputsFocused },
      { key: 'K', enabled: !inputsFocused },
      { key: 'ArrowDown', enabled: !inputsFocused },
      { key: 'ArrowUp', enabled: !inputsFocused },
    ],
    onTrigger: handleShortcut,
  }, [handleShortcut, inputsFocused]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <IntroReveal />
      <div className="hidden md:block" style={{ display: footerVisible ? 'none' : '' }}>
        <TipsPanel />
      </div>
      <div
        className="transition-opacity duration-500 ease-out"
        style={{ opacity: contentOpacity }}
      >
        <FloatingThemeToggle />
        <KeyboardHints />
        <StoryProgressBar chapters={CHAPTERS} />
        <StoryGuide chapters={CHAPTERS} />
        <LiveActivity />

        <Hero />
        <Truth />
        <Gap />
        <Shift />
        <ScrollShowcase />
        <Giving />
        <Odogwu />
        <Trust />
        <Diaspora />
        <Future />
        <div ref={footerRef}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
