'use client';

import { cn } from '@/lib/utils';

interface HangingFlowerProps {
  className?: string;
  size?: number;
  ropeLength?: number;
  rotateRange?: number;
  rotateDuration?: number;
  delay?: number;
  side?: 'left' | 'right' | 'center';
  src?: string;
  tone?: 'foreground' | 'muted' | 'primary';
  flip?: boolean;
}

export function HangingFlower({
  className,
  size = 96,
  ropeLength = 70,
  rotateRange = 7,
  rotateDuration = 13,
  delay = 0,
  side = 'center',
  src = '/assets/flower 2.png',
  tone = 'foreground',
  flip = false,
}: HangingFlowerProps) {
  const width = size * 1.6;
  const height = ropeLength + size + 6;
  const ropeColor =
    tone === 'primary'
      ? 'text-primary/40'
      : tone === 'muted'
      ? 'text-foreground/15'
      : 'text-foreground/25';

  const swayOrigin = flip ? '50% 100%' : '50% 0%';
  const hoverClasses = flip
    ? side === 'left'
      ? 'hover:translate-y-1 hover:-rotate-[10deg] hover:scale-110'
      : side === 'right'
      ? 'hover:translate-y-1 hover:rotate-[10deg] hover:scale-110'
      : 'hover:translate-y-1 hover:scale-110'
    : side === 'left'
    ? 'hover:-translate-y-1 hover:-rotate-[10deg] hover:scale-110'
    : side === 'right'
    ? 'hover:-translate-y-1 hover:rotate-[10deg] hover:scale-110'
    : 'hover:-translate-y-1 hover:scale-110';

  return (
    <div
      className={cn('pointer-events-none absolute z-10', flip && 'rotate-180', className)}
      style={{ width, height }}
      aria-hidden
    >
      <div className="flex h-full w-full flex-col items-center">
        <div
          className={cn('w-px', ropeColor)}
          style={{
            height: ropeLength,
            backgroundImage:
              'linear-gradient(to bottom, currentColor 0%, currentColor 60%, transparent 100%)',
          }}
        />
        <div
          className="flower-sway"
          style={{
            width: size,
            height: size,
            transformOrigin: swayOrigin,
            animationDuration: `${rotateDuration}s`,
            animationDelay: `${delay}s`,
          }}
        >
          <img
            src={src}
            alt=""
            className={cn(
              'pointer-events-auto h-full w-full cursor-pointer object-contain',
              'drop-shadow-[0_10px_22px_rgba(0,0,0,0.18)]',
              'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              hoverClasses
            )}
            style={{ transformOrigin: '50% 50%' }}
            draggable={false}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes flower-sway-a {
          0%,
          100% {
            transform: rotate(-${rotateRange}deg);
          }
          50% {
            transform: rotate(${rotateRange}deg);
          }
        }
        @keyframes flower-sway-b {
          0%,
          100% {
            transform: rotate(${rotateRange}deg);
          }
          50% {
            transform: rotate(-${rotateRange}deg);
          }
        }
        .flower-sway {
          animation-name: flower-sway-${delay === 0 ? 'a' : 'b'};
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  );
}
