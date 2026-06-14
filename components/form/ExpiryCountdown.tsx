'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpiryCountdownProps {
  expiresAt: string;
  serverNow: string;
  onExpired?: () => void;
}

function calculateTimeLeft(expiresAtMs: number, offsetMs: number) {
  const now = Date.now() + offsetMs;
  const diff = expiresAtMs - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total: diff };
}

export function ExpiryCountdown({ expiresAt, serverNow, onExpired }: ExpiryCountdownProps) {
  const expiresAtMs = useRef(new Date(expiresAt).getTime()).current;
  const offsetMs = useRef(new Date(serverNow).getTime() - Date.now()).current;
  const [time, setTime] = useState(() => calculateTimeLeft(expiresAtMs, offsetMs));
  const expiredRef = useRef(false);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  const tick = useCallback(() => {
    const next = calculateTimeLeft(expiresAtMs, offsetMs);
    setTime(next);
    if (next.total <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpiredRef.current?.();
    }
  }, [expiresAtMs, offsetMs]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const urgency =
    time.total <= 0
      ? 'expired'
      : time.total < 10 * 60 * 1000
        ? 'urgent'
        : time.total < 60 * 60 * 1000
          ? 'warning'
          : 'normal';

  const colorClass = {
    normal: 'text-muted-foreground',
    warning: 'text-amber-600 dark:text-amber-400',
    urgent: 'text-red-600 dark:text-red-400 animate-pulse',
    expired: 'text-red-600 dark:text-red-400',
  }[urgency];

  const parts: { value: number; label: string }[] = [];
  if (time.days > 0) parts.push({ value: time.days, label: 'd' });
  parts.push({ value: time.hours, label: 'h' });
  parts.push({ value: time.minutes, label: 'm' });
  parts.push({ value: time.seconds, label: 's' });

  return (
    <div className={cn('inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5 text-sm font-medium', colorClass)}>
      <Clock className="h-3.5 w-3.5" />
      <span className="font-mono tabular-nums">
        {parts.map((p, i) => (
          <span key={p.label}>
            {i > 0 && ' '}
            {String(p.value).padStart(2, '0')}
            {p.label}
          </span>
        ))}
      </span>
    </div>
  );
}
