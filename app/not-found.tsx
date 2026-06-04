'use client';

import { NotFoundContent } from '@/components/404/NotFoundContent';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <NotFoundContent />
    </div>
  );
}
