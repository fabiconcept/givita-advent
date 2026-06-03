import { cn } from '@/lib/utils';

const maskStyle = {
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskMode: 'alpha',
  maskMode: 'alpha',
} as React.CSSProperties;

function makeIcon(file: string) {
  const Cmp = function Icon({ className }: { className?: string }) {
    return (
      <span
        role="img"
        aria-hidden
        className={cn('inline-block bg-current', className)}
        style={{
          ...maskStyle,
          WebkitMaskImage: `url(/assets/icons/${file})`,
          maskImage: `url(/assets/icons/${file})`,
        }}
      />
    );
  };
  Cmp.displayName = `SvgrepoIcon(${file})`;
  return Cmp;
}

export const CommunityIcon = makeIcon('community-svgrepo-com.svg');
export const DonationsIcon = makeIcon('donations-svgrepo-com.svg');
export const SupportIcon = makeIcon('support-alt-svgrepo-com.svg');
export const ShieldCheckIcon = makeIcon('shield-check-svgrepo-com.svg');
export const AchievementIcon = makeIcon('achievement-svgrepo-com.svg');
export const RankingIcon = makeIcon('ranking-svgrepo-com.svg');
export const MilestoneIcon = makeIcon('milestone-svgrepo-com.svg');
