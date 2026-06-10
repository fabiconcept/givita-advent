import { cn } from '@/lib/utils';

export function ShortcutHint({
  shortcut,
  className,
}: {
  shortcut: string;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        'ml-1.5 rounded border border-current/20 bg-background/30 px-1 py-0.5 font-mono text-[10px] leading-none tracking-wide opacity-60',
        className,
      )}
    >
      {shortcut}
    </kbd>
  );
}
