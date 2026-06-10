'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Keyboard, BarChart3, Lightbulb } from 'lucide-react';

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

export function OnboardingCoachmark({
  storageKey = 'givita:onboarding-seen',
  steps = ADMIN_STEPS,
}: {
  storageKey?: string;
  steps?: Step[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (seen !== '1') {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

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

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); setOpen(v); }}>
      <DialogContent className="mx-4 rounded-3xl sm:mx-auto sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary sm:h-14 sm:w-14">
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
    </Dialog>
  );
}
