import { cn } from '@/lib/utils';
import { HoverDepth } from '@/components/landing/HoverDepth';

interface PhoneMockupProps {
  src: string;
  alt: string;
  className?: string;
  hideMaxWidth?: boolean;
}

/**
 * Phone case wrapper. Drop your PNG export at `public/<dir>/<name>.png`
 * and pass its path here. The wrapper draws a thin device bezel with side
 * buttons and a notch so the screenshot reads as a real device.
 */
export function PhoneMockup({ src, alt, className, hideMaxWidth }: PhoneMockupProps) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full',
        hideMaxWidth ? '' : 'max-w-[280px]',
        className
      )}
    >
      <HoverDepth maxTilt={5} lift={6} scale={1.02}>
        <div
          className="phone-case relative rounded-[44px] bg-linear-to-b dark:from-zinc-500 dark:via-zinc-600  dark:to-zinc-700 from-zinc-700 via-zinc-800 to-zinc-900 p-[6px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.05)]"
        >
          <span
            aria-hidden
            className="absolute -left-[2px] top-[18%] block h-12 w-[2px] rounded-l-sm bg-zinc-700"
          />
          <span
            aria-hidden
            className="absolute -left-[2px] top-[30%] block h-7 w-[2px] rounded-l-sm bg-zinc-700"
          />
          <span
            aria-hidden
            className="absolute -right-[2px] top-[24%] block h-16 w-[2px] rounded-r-sm bg-zinc-700"
          />
          <div
            className="absolute top-4 left-1/2 h-5 w-20 -translate-x-1/2 rounded-lg bg-zinc-900"
          />
          <div className="overflow-hidden rounded-[38px] bg-black">
            <img
              src={src}
              alt={alt}
              className="block h-auto w-full"
              loading="lazy"
            />
          </div>
        </div>
      </HoverDepth>
    </div>
  );
}
