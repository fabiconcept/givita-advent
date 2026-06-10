'use client';

import Link from 'next/link';

export function FlowerLogo() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-80">
      <span className="flex h-8 w-10 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/flower 2.png" alt="Givita" className="h-full w-full object-contain" />
      </span>
      <span className="text-xl text-foreground sm:text-lg">Givita <span className="text-muted-foreground">Admin</span></span>
    </Link>
  );
}
