'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface ShortcutEntry {
  keys: string;
  label: string;
}

export function ShortcutsGuide({
  open,
  onOpenChange,
  sections,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sections: { title: string; shortcuts: ShortcutEntry[] }[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" /> Keyboard shortcuts
          </DialogTitle>
          <DialogDescription>
            Available shortcuts for this page. Some are only active in certain modes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
              <div className="space-y-1.5">
                {section.shortcuts.map((sc) => (
                  <div
                    key={sc.keys}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5"
                  >
                    <span className="text-sm">{sc.label}</span>
                    <kbd className="rounded border border-border bg-background px-2 py-0.5 font-mono text-xs font-medium">
                      {sc.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
