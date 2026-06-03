'use client';

import { ThemeToggle } from '@/components/ThemeToggle';

export function FloatingThemeToggle() {
  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <ThemeToggle />
    </div>
  );
}
