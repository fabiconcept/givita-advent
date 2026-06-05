'use client';

import { useScrollParallax } from '@/lib/useScrollParallax';
import { Reveal } from '@/components/landing/Reveal';
import { ScrollInView } from '@/components/landing/ScrollInView';
import { Section } from '@/components/landing/blocks/Section';
import { Joint } from '@/components/landing/blocks/Joint';
import { Eyebrow } from '@/components/landing/blocks/Eyebrow';
import { FeatureAccordion } from '@/components/landing/blocks/FeatureAccordion';
import { IllustSparkle } from '@/components/landing/illustrations';
import {
  AchievementIcon,
  RankingIcon,
  MilestoneIcon,
  CommunityIcon,
  ShieldCheckIcon,
} from '@/components/landing/svgrepoIcons';
import {
  Trophy, Users, Sparkles, HandHeart, ShieldCheck,
} from 'lucide-react';

export function Giving() {
  const { ref, offset } = useScrollParallax(50);

  const features = [
    { icon: Trophy, Illust: AchievementIcon, title: 'Supporter badges', body: 'Recognition that travels with the contributor across the platform. Earned, not bought.' },
    { icon: Users, Illust: RankingIcon, title: 'Community rankings', body: 'Leaderboards by community, cause, or region - making giving visible without making it a competition.' },
    { icon: Sparkles, Illust: MilestoneIcon, title: 'Achievement levels', body: 'A quiet progression that respects the dignity of the act. Streaks, milestones, and impact scores.' },
    { icon: HandHeart, Illust: CommunityIcon, title: 'Contribution milestones', body: 'Causes unlock community moments at meaningful thresholds - 25%, 50%, 100% - celebrated together.' },
    { icon: ShieldCheck, Illust: ShieldCheckIcon, title: 'Identity & verification', body: 'Campaign organizers are encouraged to verify identity, post milestones, and publish fund-usage reports.' },
  ];
  return (
    <Section id="giving" variant="sparkle">
      <div ref={ref} className="relative">
        <div
          className="grid items-end gap-6 sm:grid-cols-[1fr_auto] sm:items-end"
          style={{ transform: `translateY(${offset * 0.4}px)`, willChange: 'transform' }}
        >
          <div className="max-w-2xl">
            <Reveal><Eyebrow number="05" label="Built around giving" /></Reveal>
            <Reveal delay={100}><h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">Giving should feel rewarding.</h2></Reveal>
            <Reveal delay={180}><p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">Social and gamified systems designed to celebrate <span className="text-primary dark:text-muted-foreground">generosity</span> - without losing authenticity. Tap any feature to read more.</p></Reveal>
          </div>
          <ScrollInView delay={240} entrance="rotateIn">
            <div
              className="hidden h-32 w-48 sm:block"
              style={{ transform: `translateY(${offset * 0.7}px)`, willChange: 'transform' }}
            >
              <IllustSparkle className="h-full w-full text-primary" />
            </div>
          </ScrollInView>
        </div>
        <ScrollInView delay={260} entrance="slideUp"><FeatureAccordion features={features} autoRotate autoRotateInterval={3500} pauseAfterInteraction={2500} /></ScrollInView>
      </div>
      <Joint tone="leave" />
    </Section>
  );
}
