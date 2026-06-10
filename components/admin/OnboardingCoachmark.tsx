'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Keyboard, BarChart3, Lightbulb, X } from 'lucide-react';

const ADMIN_STEPS = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Create & manage surveys',
    description: 'Start by clicking the "New survey" button (top-right) or press N. Add questions, reorder them by dragging the grip icon (⋮⋮), and publish when ready.',
  },
  {
    icon: <Keyboard className="h-8 w-8 text-primary" />,
    title: 'Keyboard shortcuts',
    description: 'Buttons with a shortcut badge (like N, L, ?) can be triggered from the keyboard. Press ? or click the keyboard icon in the header to see all shortcuts.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Live analytics',
    description: 'After clicking into a survey, the Analytics tab shows distribution charts for choice questions, averages for ratings, and raw responses — no setup needed.',
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: 'Tips as you work',
    description: 'The tips panel in the bottom-right cycles through hidden features. Tips change based on whether you\'re on the dashboard or inside a survey.',
  },
];

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingCoachmark({
  storageKey = 'givita:onboarding-seen',
  steps = ADMIN_STEPS,
}: {
  storageKey?: string;
  steps?: Step[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [showEscapeTip, setShowEscapeTip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (seen !== '1') {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setShowEscapeTip(true), 800);
      return () => clearTimeout(t);
    }
    setShowEscapeTip(false);
    setSpotlight(null);
  }, [open]);

  useEffect(() => {
    if (!showEscapeTip) return;
    const id = setInterval(() => {
      const el = document.querySelector('[data-slot="dialog-content"]');
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSpotlight({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        }
      }
    }, 200);
    return () => clearInterval(id);
  }, [showEscapeTip]);

  const finish = useCallback(() => {
    setOpen(false);
    try { localStorage.setItem(storageKey, '1'); } catch { /* noop */ }
  }, [storageKey]);

  const next = useCallback(() => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }, [step, finish, steps.length]);

  const dismissEscapeTip = useCallback(() => {
    setShowEscapeTip(false);
  }, []);

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

  const tipCard = (
    <div
      className="rounded-2xl border-2 border-primary/10 bg-background p-4 shadow-2xl shadow-primary/5 ring-1 ring-primary/20"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Tip</span>
        <button
          onClick={dismissEscapeTip}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground"
          aria-label="Dismiss tip"
          title="Dismiss tip"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <h4 className="mt-1.5 text-sm font-semibold">Escape to close</h4>
      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
        Press Escape to close dialogs, dismiss the shortcut guide, or cancel editing. It works everywhere.
      </p>
      <div className="mt-3 flex justify-end">
        <button
          onClick={dismissEscapeTip}
          className="rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20"
        >
          Got it
        </button>
      </div>
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setShowEscapeTip(false);
          setSpotlight(null);
          finish();
        }
        setOpen(v);
      }}
    >
      <DialogContent
        className="mx-4 max-w-sm rounded-3xl sm:mx-auto sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (portalRef.current && portalRef.current.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary sm:h-14 sm:w-14">
            {steps[step].icon}
          </div>
          <DialogTitle className="text-center text-lg sm:text-xl">
            {steps[step].title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed sm:text-base">
            {steps[step].description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`block h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-primary'
                    : i < step
                      ? 'w-2 bg-primary/30'
                      : 'w-2 bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step < steps.length - 1 ? (
              <>
                <Button variant="ghost" size="default" className="rounded-full text-sm" onClick={finish} title="Skip">
                  Skip
                </Button>
                <Button size="default" className="rounded-full text-sm" onClick={next} title="Next">
                  Next
                </Button>
              </>
            ) : (
              <Button size="default" className="rounded-full text-sm" onClick={finish} title="Got it">
                Got it
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {mounted && showEscapeTip && createPortal(
        <div ref={portalRef} className="fixed inset-0 z-[60]">
          {spotlight ? (
            <>
              <div className="fixed inset-0 z-[60] bg-black/40" />
              <div className="fixed z-[61]" style={{ top: 0, left: 0, right: 0, height: spotlight.top }} />
              <div className="fixed z-[61]" style={{ top: spotlight.top + spotlight.height, left: 0, right: 0, bottom: 0 }} />
              <div className="fixed z-[61]" style={{ top: spotlight.top, left: 0, width: spotlight.left, height: spotlight.height }} />
              <div className="fixed z-[61]" style={{ top: spotlight.top, left: spotlight.left + spotlight.width, right: 0, height: spotlight.height }} />
              <div className="fixed z-[61] rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background transition-all duration-300" style={spotlight} />
            </>
          ) : (
            <div className="fixed inset-0 z-[60] bg-black/40" />
          )}
          <div className="fixed z-[62] transition-all duration-300" style={pos ?? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            {tipCard}
          </div>
        </div>,
        document.body,
      )}
    </Dialog>
  );
}
