'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';

interface NavControlsProps {
  isFirst: boolean;
  isLast: boolean;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function NavControls({ isFirst, isLast, canAdvance, onBack, onNext }: NavControlsProps) {
  return (
    <div className="mt-10 flex items-center justify-between gap-3">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={isFirst}
        className="h-11 rounded-full px-4 text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
        Press <Kbd>Enter</Kbd> {isLast ? 'to submit' : 'to continue'}
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={!canAdvance}
        className="group h-11 rounded-full px-6 shadow-[0_10px_30px_-12px_rgba(81,46,248,0.6)]"
      >
        {isLast ? (
          <>
            Submit <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        ) : (
          <>
            Continue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </div>
  );
}
