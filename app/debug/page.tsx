import { notFound } from 'next/navigation';
import { DebugClient } from './client';

export const dynamic = 'force-dynamic';

const DISABLED_VALUES = new Set(['', 'off', 'false', '0', 'silent', 'none']);

export default function DebugPage() {
  const raw = process.env.DEBUG_LOG;
  const disabled = raw === undefined || raw === null || DISABLED_VALUES.has(raw.trim());
  if (disabled) notFound();

  return <DebugClient />;
}
