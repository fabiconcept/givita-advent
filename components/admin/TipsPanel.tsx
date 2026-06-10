'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type Ctx = 'dashboard' | 'editor-view' | 'editor-edit' | 'form' | 'landing' | 'not-found';

interface Tip {
  title: string;
  body: string;
  pages: Ctx[];
  selector?: string;
  questionType?: string;
}

const ALL_TIPS: Tip[] = [
  {
    title: 'Keyboard shortcuts',
    body: 'The ? button in the header shows all shortcuts. Most buttons display their shortcut key as a small badge — press instead of click.',
    pages: ['dashboard'],
    selector: 'button[aria-label="Toggle shortcut guide"]',
  },
  {
    title: 'Hover to reveal options',
    body: 'Hover over a survey card and a Delete button appears in the top-right. Try it on the card below.',
    pages: ['dashboard'],
    selector: '.group',
  },
  {
    title: 'Theme toggle',
    body: 'Switch between dark and light mode with this button. Your preference is saved across visits.',
    pages: ['dashboard', 'editor-view', 'editor-edit', 'form'],
    selector: 'button[aria-label^="Switch to"]',
  },
  {
    title: 'Pick instantly',
    body: 'Press 1-9 to select an option instantly. The number appears next to each choice.',
    pages: ['form'],
    questionType: 'multiple-choice',
  },
  {
    title: 'Keyboard navigation',
    body: 'Press J or ↓ to scroll down, K or ↑ to scroll up. Press T to toggle dark mode.',
    pages: ['landing'],
  },
  {
    title: 'Scroll for demos',
    body: 'Keep scrolling past the intro sections to see interactive showcases of the survey builder.',
    pages: ['landing'],
  },
  {
    title: 'Theme toggle',
    body: 'Press T or click the floating sun/moon icon to switch between dark and light mode anytime.',
    pages: ['landing'],
    selector: 'button[aria-label^="Switch to"]',
  },
  {
    title: 'Lost?',
    body: 'This page doesn\'t exist. Head back to the homepage or check the URL for typos.',
    pages: ['not-found'],
  },
  {
    title: 'Pick instantly',
    body: 'Press 1-9 to toggle options — select as many as you like.',
    pages: ['form'],
    questionType: 'checkbox',
  },
  {
    title: 'Rate with arrows',
    body: 'Use ← → arrow keys to move between columns, then press Enter to confirm.',
    pages: ['form'],
    questionType: 'likert-scale',
  },
  {
    title: 'Slide with arrows',
    body: 'Use ← → arrow keys to fine-tune the slider, then press Enter to confirm.',
    pages: ['form'],
    questionType: 'rating',
  },
  {
    title: 'Drag to reorder',
    body: 'Drag each item to your preferred position, or use the up/down arrows on desktop.',
    pages: ['form'],
    questionType: 'ranking',
  },
  {
    title: 'Hit Enter',
    body: 'Press Enter to submit your answer when you\'re done typing.',
    pages: ['form'],
    questionType: 'text',
  },
  {
    title: 'Hit Enter',
    body: 'Press Enter to submit your answer when you\'re done typing.',
    pages: ['form'],
    questionType: 'textarea',
  },
  {
    title: 'Hit Enter',
    body: 'Press Enter to submit your answer when you\'re done typing.',
    pages: ['form'],
    questionType: 'email',
  },
  {
    title: 'Adjust with arrows',
    body: 'Use ↑ ↓ arrow keys to bump the value up or down.',
    pages: ['form'],
    questionType: 'number',
  },
  {
    title: 'Press 1 or 2',
    body: 'Press 1 for Yes, 2 for No — quick as that.',
    pages: ['form'],
    questionType: 'yes-no',
  },
  {
    title: 'Edit mode',
    body: 'Press E to enter edit mode. Click any question title or description to edit inline. Drag questions to reorder.',
    pages: ['editor-view'],
    selector: '[data-tip="edit-mode-btn"]',
  },
  {
    title: 'Publish & feature',
    body: 'Toggle a survey Live with the P key or mark it Featured with F. Featured surveys appear on the landing page.',
    pages: ['editor-view'],
    selector: '[data-tip="publish-btn"]',
  },
  {
    title: 'Analytics per question',
    body: 'Total responses, question count, and completion rate at a glance. Scroll down for per-question charts and data.',
    pages: ['editor-view'],
    selector: '[data-tip="analytics-stats"]',
  },
  {
    title: 'Drag to reorder',
    body: 'Grab the grip icon (⋮⋮) on any question to drag-and-drop reorder it. Up/down arrow buttons also work.',
    pages: ['editor-edit'],
    selector: 'button[aria-label="Drag question"]',
  },
  {
    title: 'Save & cancel',
    body: 'Press ⌘S to save changes or Escape to cancel. Nothing is saved until you hit Save.',
    pages: ['editor-edit'],
    selector: '[data-tip="save-btn"]',
  },
  {
    title: 'Import questions',
    body: 'Use the "Import" button next to "Add question" to bulk-import from JSON or CSV. Check the format hint in the dialog.',
    pages: ['editor-edit'],
    selector: '[data-tip="import-btn"]',
  },
];

const ESCAPE_TIP = {
  title: 'Escape to close',
  body: 'Press Escape to close dialogs, dismiss the shortcut guide, or cancel editing. It works everywhere.',
};

const AUTO_INTERVAL = 14_000;

function storageKey(ctx: Ctx) {
  return `givita:tips-dismissed:${ctx}`;
}

function detectCtx(pathname: string): Ctx {
  if (pathname === '/') return 'landing';
  if (pathname.startsWith('/forms/')) return 'form';
  if (pathname === '/admin') return 'dashboard';
  const page = document.querySelector('[data-page]');
  if (page?.getAttribute('data-page') === 'not-found') return 'not-found';
  const root = document.querySelector('[data-mode]');
  const mode = root?.getAttribute('data-mode');
  return mode === 'edit' ? 'editor-edit' : 'editor-view';
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TipsPanel() {
  const pathname = usePathname();
  const [ctx, setCtx] = useState<Ctx>('dashboard');
  const [dismissed, setDismissed] = useState(true);
  const [index, setIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [currentQuestionType, setCurrentQuestionType] = useState<string | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [showOnboardingTip, setShowOnboardingTip] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onboardingDialogRef = useRef<Element | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (pathname === '/admin') { setPageReady(true); return; }
    const selector = pathname.startsWith('/forms/') ? '[data-tip="form-nav"]' : '[data-mode]';
    if (document.querySelector(selector)) { setPageReady(true); return; }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        setPageReady(true);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const newCtx = detectCtx(pathname);
    setCtx(newCtx);
    const d = localStorage.getItem(storageKey(newCtx));
    setDismissed(d === '1');
    setIndex(0);
    setSpotlight(null);
    setShowOnboardingTip(false);
    onboardingDialogRef.current = null;
    const onboardingKey = newCtx === 'form' ? 'givita:onboarding-form-seen' : 'givita:onboarding-seen';
    try { setOnboardingDone(localStorage.getItem(onboardingKey) === '1'); } catch { setOnboardingDone(true); }
  }, [pathname]);

  useEffect(() => {
    if (pageReady && ctx !== 'landing' && ctx !== 'not-found') {
      const onboardingKey = ctx === 'form' ? 'givita:onboarding-form-seen' : 'givita:onboarding-seen';
      let disconnected = false;
      const check = () => {
        try {
          const seen = localStorage.getItem(onboardingKey) === '1';
          setOnboardingDone(seen);
          const dialog = document.querySelector('[role="dialog"]');
          onboardingDialogRef.current = dialog || null;
          if (!seen && !showOnboardingTip && dialog) {
            setShowOnboardingTip(true);
          }
        } catch { /* noop */ }
      };
      check();
      const id = setInterval(check, 500);
      return () => { clearInterval(id); disconnected = true; };
    }
  }, [pageReady, ctx, showOnboardingTip]);

  useEffect(() => {
    if (pathname === '/admin') return;
    const check = () => {
      const newCtx = detectCtx(pathname);
      if (newCtx !== ctx) {
        setCtx(newCtx);
        const d = localStorage.getItem(storageKey(newCtx));
        setDismissed(d === '1');
        setIndex(0);
        setSpotlight(null);
        setShowOnboardingTip(false);
        onboardingDialogRef.current = null;
      }
    };
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [pathname, ctx]);

  useEffect(() => {
    if (!pathname.startsWith('/forms/')) { setCurrentQuestionType(null); return; }
    const check = () => {
      const el = document.querySelector('[data-question-type]');
      setCurrentQuestionType((prev) => {
        const next = el?.getAttribute('data-question-type') || null;
        return next !== prev ? next : prev;
      });
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [pathname]);

  const tips = ALL_TIPS.filter((t) => {
    if (!t.pages.includes(ctx)) return false;
    if (ctx !== 'form') return true;
    if (!t.questionType) return false;
    if (t.questionType !== currentQuestionType) return false;
    try { return localStorage.getItem(`givita:tip-qtype-seen:${t.questionType}`) !== '1'; } catch { return true; }
  });
  const safeIndex = tips.length === 0 ? 0 : index % tips.length;
  const tip = tips[safeIndex];

  const updateSpotlight = useCallback((selector?: string) => {
    if (!selector) { setSpotlight(null); return; }
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSpotlight({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        }
      });
    } else {
      setSpotlight(null);
    }
  }, []);

  useEffect(() => {
    if (showOnboardingTip && onboardingDialogRef.current) {
      const el = onboardingDialogRef.current as HTMLElement;
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSpotlight({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        }
      });
    } else {
      const s = tip?.selector || (ctx === 'form' ? '[data-tip="form-nav"]' : undefined);
      if (s) updateSpotlight(s); else setSpotlight(null);
    }
  }, [showOnboardingTip, safeIndex, tip?.selector, updateSpotlight, ctx]);

  useEffect(() => {
    if (dismissed || tips.length === 0) return;
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % tips.length);
    }, AUTO_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [dismissed, tips.length]);

  useEffect(() => {
    if (ctx !== 'form' || !tip?.questionType) return;
    const key = `givita:tip-qtype-seen:${tip.questionType}`;
    try { if (localStorage.getItem(key) !== '1') { localStorage.setItem(key, '1'); } } catch { /* noop */ }
  }, [ctx, tip?.questionType]);

  const dismiss = useCallback(() => {
    if (showOnboardingTip) {
      setShowOnboardingTip(false);
      return;
    }
    setDismissed(true);
    try { localStorage.setItem(storageKey(ctx), '1'); } catch { /* noop */ }
    if (ctx === 'form' && tip?.questionType) {
      try { localStorage.setItem(`givita:tip-qtype-seen:${tip.questionType}`, '1'); } catch { /* noop */ }
    }
  }, [showOnboardingTip, ctx, tip?.questionType]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % tips.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setIndex((i) => (i + 1) % tips.length), AUTO_INTERVAL);
    }
  }, [tips.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + tips.length) % tips.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setIndex((i) => (i + 1) % tips.length), AUTO_INTERVAL);
    }
  }, [tips.length]);

  const currentTip = showOnboardingTip ? ESCAPE_TIP : tip;
  const showDismissAll = !showOnboardingTip;

  if (!mounted || !pageReady) return null;
  if (!showOnboardingTip && (dismissed || tips.length === 0 || (!onboardingDone && ctx !== 'landing' && ctx !== 'not-found'))) {
    return null;
  }

  const tipCard = (
    <div
      className="mx-4 w-auto min-w-0 max-w-xs rounded-2xl border border-border bg-background p-4 shadow-xl sm:mx-0 sm:w-80"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Tip</span>
        <button
          onClick={dismiss}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground"
          aria-label="Dismiss tip"
          title="Dismiss tip"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <h4 className="mt-1.5 text-sm font-semibold">{currentTip.title}</h4>
      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{currentTip.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {!showOnboardingTip && tips.map((_, i) => (
            <span
              key={i}
              className={`block h-1 rounded-full transition-all duration-300 ${
                i === safeIndex ? 'w-4 bg-primary/60' : 'w-1 bg-muted-foreground/15'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {showOnboardingTip ? (
            <button
              onClick={dismiss}
              className="rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20"
            >
              Got it
            </button>
          ) : (
            <>
              <button
                onClick={prev}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/50 hover:bg-muted hover:text-foreground"
                aria-label="Previous tip"
                title="Previous tip"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/50 hover:bg-muted hover:text-foreground"
                aria-label="Next tip"
                title="Next tip"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const positionTip = (rect: SpotlightRect) => {
    const gap = 12;
    const cardWidth = 320;
    const cardHeight = 200;

    let top: number;
    if (rect.top > cardHeight + gap + 80) {
      top = rect.top - cardHeight - gap;
    } else {
      top = rect.top + rect.height + gap;
    }
    const left = Math.max(16, Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - 16));
    if (top + cardHeight > window.innerHeight - 16) top = Math.max(16, window.innerHeight - cardHeight - 16);
    if (top < 16) top = 16;

    return { top, left };
  };

  const pos = spotlight ? positionTip(spotlight) : null;

  return createPortal(
    <div className="fixed inset-0 z-50" onClick={dismiss}>
      {spotlight ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" />
          <div className="fixed z-50" style={{ top: 0, left: 0, right: 0, height: spotlight.top }} />
          <div className="fixed z-50" style={{ top: spotlight.top + spotlight.height, left: 0, right: 0, bottom: 0 }} />
          <div className="fixed z-50" style={{ top: spotlight.top, left: 0, width: spotlight.left, height: spotlight.height }} />
          <div className="fixed z-50" style={{ top: spotlight.top, left: spotlight.left + spotlight.width, right: 0, height: spotlight.height }} />
          <div className="fixed z-50 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background transition-all duration-300" style={spotlight} />
        </>
      ) : (
        <div className="fixed inset-0 z-40 bg-black/40" />
      )}
      <div className="fixed z-50 transition-all duration-300" style={pos ?? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        {tipCard}
      </div>
    </div>,
    document.body,
  );
}
