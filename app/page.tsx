'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Reveal } from '@/components/landing/Reveal';
import { Counter } from '@/components/landing/Counter';
import { WordReveal } from '@/components/landing/WordReveal';
import { NewsletterForm } from '@/components/landing/NewsletterForm';
import { LiveBackground, type BackgroundVariant } from '@/components/landing/LiveBackground';
import { StoryGuide, StoryProgressBar, type StoryChapter } from '@/components/landing/StoryGuide';
import { ScrollShowcase } from '@/components/landing/ScrollShowcase';
import { OdogwuWord } from '@/components/landing/OdogwuWord';
import { SparkleMark } from '@/components/landing/SparkleMark';
import { LiveActivity } from '@/components/landing/LiveActivity';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { IntroReveal } from '@/components/landing/IntroReveal';
import { HoverDepth } from '@/components/landing/HoverDepth';
import {
  IllustCommunity,
  IllustBroken,
  IllustSparkle,
  IllustShield,
} from '@/components/landing/illustrations';
import {
  AchievementIcon,
  RankingIcon,
  MilestoneIcon,
  CommunityIcon,
  ShieldCheckIcon,
} from '@/components/landing/svgrepoIcons';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Minus,
  Quote,
  HandHeart,
  Sparkles,
  Trophy,
  Users,
  ShieldCheck,
} from 'lucide-react';

const CHAPTERS: StoryChapter[] = [
  { id: 'hero', label: 'Opening' },
  { id: 'truth', label: 'The truth' },
  { id: 'gap', label: 'The gap' },
  { id: 'shift', label: 'The shift' },
  { id: 'app', label: 'In the app' },
  { id: 'giving', label: 'Built around giving' },
  { id: 'odogwu', label: 'Odogwu' },
  { id: 'trust', label: 'Trust' },
  { id: 'diaspora', label: 'Diaspora' },
  { id: 'future', label: 'The future' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <IntroReveal />
      <FloatingThemeToggle />
      <StoryProgressBar chapters={CHAPTERS} />
      <StoryGuide chapters={CHAPTERS} />
      <LiveActivity />

      <Hero />
      <Truth />
      <Gap />
      <Shift />
      <ScrollShowcase />
      <Giving />
      <Odogwu />
      <Trust />
      <Diaspora />
      <Future />
      <Footer />
    </div>
  );
}

/* ----------------------------------------------------------- */
/* HERO                                                         */
/* ----------------------------------------------------------- */

function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden scroll-mt-16">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 18% 12%, rgba(81,46,248,0.16) 0%, transparent 60%), radial-gradient(45% 40% at 88% 8%, rgba(214,255,93,0.10) 0%, transparent 60%), radial-gradient(70% 60% at 50% 100%, rgba(81,46,248,0.08) 0%, transparent 60%)',
        }}
        aria-hidden
      />
      <div className="block md:hidden">
        <HangingFlower
          className="left-2 bottom-0"
          side="left"
          size={86}
          ropeLength={42}
          rotateRange={5}
          rotateDuration={12}
          delay={0}
          tone="primary"
        />
        <HangingFlower
          className="right-4 bottom-0"
          side="right"
          size={68}
          ropeLength={36}
          rotateRange={8}
          rotateDuration={10}
          delay={0.7}
          tone="muted"
        />
      </div>
      <div className="hidden md:block">
        <HangingFlower
          className="left-2 top-0 -translate-x-3 sm:left-6 lg:left-10"
          side="left"
          size={220}
          ropeLength={130}
          rotateRange={5}
          rotateDuration={18}
          delay={0}
          tone="primary"
        />
        <HangingFlower
          className="right-8 top-0 sm:right-14 lg:right-24"
          side="right"
          size={170}
          ropeLength={95}
          rotateRange={9}
          rotateDuration={13}
          delay={1.2}
          tone="muted"
        />
      </div>
      <FloatingPetals />
      <div className="relative mx-auto w-full max-w-3xl px-5 pb-24 pt-28 text-center sm:px-8 sm:pb-32 sm:pt-36">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Givita · Africa’s community-powered fundraising platform
          </p>
        </Reveal>

        <h1 className="mt-10 text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
          <WordReveal text="Giving has always" className="" delay={120} stagger={70} />
          <br className="hidden sm:block" />
          <WordReveal text="been our culture." delay={420} stagger={70} accent="culture" />
        </h1>

        <Reveal delay={900}>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Givita turns the way African communities already support each other into a modern, trusted digital experience -
            built for us, by us.
          </p>
        </Reveal>

        <Reveal delay={1050}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="group h-12 w-full rounded-full px-7 text-base shadow-[0_10px_40px_-10px_rgba(81,46,248,0.5)] sm:w-auto"
            >
              <Link href="/forms/community-fundraising">
                Add your voice <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <a
              href="#story"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full px-5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Read the story <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={1200}>
          <div className="mt-24 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
            <span className="h-px w-12 bg-border" />
            <span>Scroll</span>
            <span className="h-px w-12 bg-border" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FloatingPetals() {
  const petals = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {petals.map((i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-primary/20"
          style={{
            left: `${10 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `petalFloat ${14 + i * 2}s ease-in-out ${i * 1.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes petalFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(${Math.random() * 30 - 15}px, -40px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

/* ----------------------------------------------------------- */
/* TRUTH                                                        */
/* ----------------------------------------------------------- */

function Truth() {
  return (
    <Section id="truth" tone="plain">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <Eyebrow number="01" label="The truth we know" />
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Across Africa, communities have always been the backbone of progress.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-8 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            When someone wants to start a business, pursue a dream, solve a local problem, support a cultural movement, pay for
            education, fund a creative project, or overcome a difficult season - people come together. Family contributes.
            Friends contribute. Neighbors contribute.
          </p>
        </Reveal>
      </div>
      <Joint tone="mute" />
    </Section>
  );
}

/* ----------------------------------------------------------- */
/* GAP                                                          */
/* ----------------------------------------------------------- */

function Gap() {
  const items = [
    {
      n: '01',
      title: 'Local currencies get lost in conversion',
      body: 'Cross-border donations arrive with fees and rates that don’t reflect the reality of contributors.',
      Illust: IllustBroken,
    },
    {
      n: '02',
      title: 'Trust is harder to establish',
      body: 'Verification, oversight, and transparency are not first-class features - they are afterthoughts.',
      Illust: IllustShield,
    },
    {
      n: '03',
      title: 'Culture is treated as decoration',
      body: 'The social dynamics that actually drive giving get flattened into one-time transactions.',
      Illust: IllustCommunity,
    },
  ];
  return (
    <Section id="gap" variant="fragment" tone="muted" align="wide">
      <HangingFlower
        className="right-8 top-0 sm:right-16 lg:right-24"
        side="right"
        size={68}
        ropeLength={56}
        delay={0.4}
        tone="muted"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 hidden items-center justify-center sm:flex">
        <div className="w-72 opacity-[0.05]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/empty-box 1.png"
            alt=""
            aria-hidden
            className="h-auto w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
      <Reveal>
        <Eyebrow number="02" label="The gap" tone="primary" />
      </Reveal>
      <Reveal delay={100}>
        <h2 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Most platforms were not built with African communities in mind.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-10 sm:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.n} delay={150 + i * 100}>
            <HoverDepth maxTilt={3} lift={3} scale={1.01}>
              <article className="group">
                <item.Illust className="h-24 w-24 text-foreground/70 transition-transform duration-500 group-hover:-translate-y-1" />
                <p className="mt-6 font-mono text-xs text-muted-foreground">{item.n}</p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            </HoverDepth>
          </Reveal>
        ))}
      </div>
      <Joint tone="leave" />
    </Section>
  );
}

/* ----------------------------------------------------------- */
/* SHIFT                                                        */
/* ----------------------------------------------------------- */

function Shift() {
  return (
    <Section id="shift" variant="shift">
      <div className="pointer-events-none absolute right-4 top-16 hidden w-32 -rotate-[4deg] opacity-90 sm:block lg:right-10 lg:w-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/Buffer-bro.png"
          alt=""
          aria-hidden
          className="h-auto w-full object-contain transition-transform duration-500 hover:rotate-[2deg] hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <Eyebrow number="03" label="The shift" />
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Givita is not a tool. It is a translation of culture.
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            We didn’t start with a product. We started with how Africans already give - and built the platform backward from
            there. Toggle to see the shift.
          </p>
        </Reveal>
      </div>

      <Reveal delay={240}>
        <Comparison />
      </Reveal>
      <Joint tone="mute" />
    </Section>
  );
}

/* ----------------------------------------------------------- */
/* GIVING                                                       */
/* ----------------------------------------------------------- */

function Giving() {
  const features = [
    {
      icon: Trophy,
      Illust: AchievementIcon,
      title: 'Supporter badges',
      body: 'Recognition that travels with the contributor across the platform. Earned, not bought.',
    },
    {
      icon: Users,
      Illust: RankingIcon,
      title: 'Community rankings',
      body: 'Leaderboards by community, cause, or region - making giving visible without making it a competition.',
    },
    {
      icon: Sparkles,
      Illust: MilestoneIcon,
      title: 'Achievement levels',
      body: 'A quiet progression that respects the dignity of the act. Streaks, milestones, and impact scores.',
    },
    {
      icon: HandHeart,
      Illust: CommunityIcon,
      title: 'Contribution milestones',
      body: 'Causes unlock community moments at meaningful thresholds - 25%, 50%, 100% - celebrated together.',
    },
    {
      icon: ShieldCheck,
      Illust: ShieldCheckIcon,
      title: 'Identity & verification',
      body: 'Campaign organizers are encouraged to verify identity, post milestones, and publish fund-usage reports.',
    },
  ];
  return (
    <Section id="giving" variant="sparkle">
      <div className="grid items-end gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow number="05" label="Built around giving" />
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Giving should feel rewarding.
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Social and gamified systems designed to celebrate generosity - without losing authenticity. Tap any feature to read
              more.
            </p>
          </Reveal>
        </div>
        <Reveal delay={240}>
          <div className="hidden h-32 w-48 sm:block">
            <IllustSparkle className="h-full w-full text-primary" />
          </div>
        </Reveal>
      </div>

      <Reveal delay={260}>
        <FeatureAccordion features={features} />
      </Reveal>
      <Joint tone="leave" />
    </Section>
  );
}

/* ----------------------------------------------------------- */
/* ODOGWU                                                       */
/* ----------------------------------------------------------- */

function Odogwu() {
  return (
    <Section id="odogwu" tone="muted" density="roomy">
      <div className="grid items-center gap-10 lg:grid-cols-[1.8fr_1fr]">
        <Reveal>
          <div>
            <Eyebrow number="06" label="Odogwu" />
            <HoverDepth maxTilt={4} lift={5} scale={1.015}>
              <div className="mt-14 max-w-3xl rounded-3xl border border-border bg-card/60 p-8 backdrop-blur sm:p-12">
                <Quote className="h-7 w-7 text-primary" />
                <p className="mt-6 text-balance text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
                  Across Nigeria and many African societies, support comes from strong community networks - the spirit often
                  proudly called the{' '}
                  <OdogwuWord /> mentality. Givita embraces this culture and turns it into a modern digital experience.
                </p>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  People contribute because they believe in someone, want their community to succeed, feel connected to a shared
                  goal, want to make an impact, and want to be remembered as a contributor to something meaningful.
                </p>
              </div>
            </HoverDepth>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/Self confidence-rafiki 1.png"
              alt="Confidence and community"
              className="h-auto w-full object-contain"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
      <Joint tone="enter" />
    </Section>
  );
}

/* ----------------------------------------------------------- */
/* TRUST                                                        */
/* ----------------------------------------------------------- */

function Trust() {
  return (
    <Section id="trust" tone="plain" density="roomy">
      <div className="relative">
        <div className="pointer-events-none absolute -right-2 -top-6 hidden w-44 rotate-[6deg] opacity-90 sm:block lg:w-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/Private data-pana.png"
            alt=""
            aria-hidden
            className="h-auto w-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="pointer-events-none absolute -left-4 bottom-0 hidden w-32 -rotate-[8deg] opacity-80 sm:block lg:w-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/ID Card-bro.png"
            alt=""
            aria-hidden
            className="h-auto w-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <Eyebrow number="07" label="Trust is the foundation" tone="primary" />
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Built with verification, transparency, and community oversight.
            </h2>
          </Reveal>
        </div>
      </div>

      <div className="mt-20 grid gap-12 sm:grid-cols-3">
        {[
          { value: 3, suffix: ' layers', label: 'of identity & campaign verification' },
          { value: 100, suffix: '%', label: 'of fund-usage reports expected per campaign' },
          { value: 24, suffix: '/7', label: 'community-driven risk monitoring' },
        ].map((s, i) => (
          <Reveal key={s.label} delay={150 + i * 80}>
            <HoverDepth maxTilt={3} lift={3} scale={1.01}>
              <div>
                <p className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
                <div className="mt-5 h-px w-12 bg-primary/40" />
              </div>
            </HoverDepth>
          </Reveal>
        ))}
      </div>
      <Joint tone="leave" />
    </Section>
  );
}

/* ----------------------------------------------------------- */
/* DIASPORA                                                     */
/* ----------------------------------------------------------- */

function Diaspora() {
  return (
    <Section id="diaspora" variant="globe" tone="muted" align="wide" density="roomy">
      <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Reveal>
            <Eyebrow number="08" label="The diaspora" />
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Distance should never be a barrier to impact.
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Millions of Africans around the world want to support people and projects back home. Givita is designed for
              international donations, seamless currency conversion, and local disbursement - so supporters anywhere can
              contribute confidently to causes they care about.
            </p>
          </Reveal>
        </div>

        <Reveal delay={220}>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/10 blur-3xl" />
            <HoverDepth maxTilt={4} lift={5} scale={1.015}>
              <div className="overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-primary/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/travel selfie-cuate.png"
                    alt="A diaspora supporter sending support back home"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <ul className="space-y-3 p-6 text-sm">
                {[
                  ['International donations', 'Stripe & local rails'],
                  ['Currency conversion', 'Real-time, fair rates'],
                  ['Local disbursement', 'NGN, KES, GHS, ZAR…'],
                  ['Diaspora communities', 'Built in, not bolted on'],
                ].map(([title, body]) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              </div>
            </HoverDepth>
          </div>
        </Reveal>
      </div>
      <Joint tone="enter" />
    </Section>
  );
}

/* ----------------------------------------------------------- */
/* FUTURE                                                       */
/* ----------------------------------------------------------- */

function Future() {
  return (
    <section id="future" className="relative overflow-hidden scroll-mt-16">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 18% 18%, rgba(81,46,248,0.16) 0%, transparent 60%), radial-gradient(50% 40% at 82% 82%, rgba(214,255,93,0.10) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      <HangingFlower
        className="right-8 top-0 sm:right-14 lg:right-24"
        side="right"
        size={80}
        ropeLength={62}
        delay={0.7}
        tone="foreground"
      />
      <HangingFlower
        className="left-8 top-4 hidden lg:block"
        side="left"
        size={56}
        ropeLength={48}
        delay={1.4}
        tone="muted"
      />
      <div className="relative mx-auto w-full max-w-3xl px-5 py-36 text-center sm:px-8 sm:py-52">
        <Reveal>
          <Eyebrow number="09" label="The future we’re building" />
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            A future where generosity is celebrated, trust is visible, and impact is measurable.
          </h2>
        </Reveal>
        <Reveal delay={220}>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Be among the first to experience Givita. Get launch updates and a quiet note when something important changes.
          </p>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-10 flex justify-center">
            <NewsletterForm />
          </div>
        </Reveal>

        <Reveal delay={420}>
          <p className="mt-6 text-xs text-muted-foreground">
            Or{' '}
            <Link
              href="/forms/community-fundraising"
              className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              add your voice
            </Link>{' '}
              to the first survey - it takes a minute.
          </p>
        </Reveal>

        <Reveal delay={520}>
          <div className="mt-20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              The graph
            </p>
            <div className="mt-5 grid items-end gap-8 sm:grid-cols-[1.4fr_1fr]">
              <HoverDepth maxTilt={4} lift={5} scale={1.015}>
                <a
                  href="/assets/Flyer 4.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur transition-transform duration-500 hover:-translate-y-1 hover:rotate-[-1deg]"
                  aria-label="Open full Givita launch flyer"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/Flyer 4.jpg"
                      alt="Givita launch flyer - a graph of where we're heading"
                      className="block h-auto w-full"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                </a>
              </HoverDepth>
              <div className="text-left sm:pb-4">
                <h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  A first look at the launch flyer.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  We're prototyping the visual language of Givita - the story, the community, the way giving feels. This is a
                  snapshot of where we're heading. Click to view full size.
                </p>
                <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  v0.1 · survey edition
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- */
/* FOOTER                                                       */
/* ----------------------------------------------------------- */

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-muted/20">
      <HangingFlower
        className="right-10 top-0 sm:right-16 lg:right-24"
        side="right"
        size={72}
        ropeLength={54}
        delay={0.2}
        tone="muted"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-20 sm:px-8 sm:pt-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/flower 2.png"
                  alt="Givita"
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-base font-semibold text-foreground">Givita</span>
              <SparkleMark />
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A community-powered fundraising platform built for the way African communities already support each other.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              Surveying the first 500 voices now.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">The story</p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ['#hero', 'Opening'],
                ['#truth', 'The truth'],
                ['#shift', 'The shift'],
                ['#giving', 'Built around giving'],
                ['#odogwu', 'Odogwu'],
                ['#trust', 'Trust'],
                ['#diaspora', 'Diaspora'],
                ['#future', 'The future'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Get involved</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/forms/community-fundraising"
                  className="group inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-primary"
                >
                  Add your voice
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <a href="#future" className="text-foreground/70 transition-colors hover:text-foreground">
                  Newsletter
                </a>
              </li>
            </ul>
            <div className="mt-8 h-px w-12 bg-border" />
            <p className="mt-4 text-xs text-muted-foreground">
              Made with care · Lagos · Abuja · everywhere our people are.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Givita. Every voice matters.</p>
          <p className="font-mono">v0.1 · survey edition</p>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------- */
/* Building blocks                                              */
/* ----------------------------------------------------------- */

function Section({
  id,
  children,
  variant,
  tone = 'plain',
  align = 'default',
  density = 'default',
}: {
  id: string;
  children: React.ReactNode;
  variant?: BackgroundVariant;
  tone?: 'plain' | 'muted';
  align?: 'default' | 'wide';
  density?: 'default' | 'roomy';
}) {
  return (
    <section
      id={id}
      className={cn('relative overflow-hidden scroll-mt-16', tone === 'muted' && 'bg-muted/30')}
    >
      {variant && <LiveBackground variant={variant} />}
      <div
        className={cn(
          'relative mx-auto w-full px-5 sm:px-8',
          align === 'wide' ? 'max-w-6xl' : 'max-w-5xl',
          density === 'roomy' ? 'py-32 sm:py-44' : 'py-24 sm:py-32'
        )}
      >
        {children}
      </div>
    </section>
  );
}

function Joint({ tone }: { tone: 'enter' | 'leave' | 'mute' }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative mx-auto -mt-px flex h-12 items-center justify-center"
    >
      <div
        className={cn(
          'h-px w-32 transition-colors',
          tone === 'enter' && 'bg-gradient-to-r from-transparent via-primary/30 to-transparent',
          tone === 'leave' && 'bg-gradient-to-r from-transparent via-border to-transparent',
          tone === 'mute' && 'bg-border/50'
        )}
      />
      <span
        className={cn(
          'absolute h-1.5 w-1.5 rounded-full',
          tone === 'enter' ? 'bg-primary/40' : 'bg-border'
        )}
      />
    </div>
  );
}

function Eyebrow({
  number,
  label,
  tone = 'default',
}: {
  number: string;
  label: string;
  tone?: 'default' | 'primary';
}) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]',
        tone === 'primary' ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <span className="font-mono opacity-70">{number}</span>
      <span className="h-px w-8 bg-current opacity-30" />
      <span>{label}</span>
    </p>
  );
}

function FloatingThemeToggle() {
  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <ThemeToggle />
    </div>
  );
}

/* ----------------------------------------------------------- */
/* Comparison                                                   */
/* ----------------------------------------------------------- */

function Comparison() {
  const [view, setView] = useState<'before' | 'after'>('after');
  const items = [
    { before: 'A donation page', after: 'A community around a cause' },
    { before: 'One-time support', after: 'Ongoing belonging and recognition' },
    { before: 'Hidden progress', after: 'Shared milestones and updates' },
    { before: 'Trust through branding', after: 'Trust through verification and reporting' },
    { before: 'Contributors are donors', after: 'Contributors are champions' },
  ];
  return (
    <div className="mt-12">
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full border border-border bg-card/60 p-1 text-sm backdrop-blur">
          {(['before', 'after'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'h-9 rounded-full px-5 text-sm font-medium transition-all duration-300',
                view === v
                  ? 'bg-primary text-primary-foreground shadow-[0_6px_20px_-8px_rgba(81,46,248,0.5)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v === 'before' ? 'Before Givita' : 'With Givita'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div
            key={i}
            className={cn(
              'flex items-start gap-3 rounded-2xl border border-border bg-card/40 p-5 transition-all duration-500',
              view === 'after' && 'border-primary/40 bg-primary/[0.04]'
            )}
            style={{ transitionDelay: `${i * 30}ms` }}
          >
            <span
              className={cn(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-mono transition-colors',
                view === 'after' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-base leading-relaxed text-foreground/90">
              {view === 'after' ? it.after : it.before}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- */
/* Feature accordion                                            */
/* ----------------------------------------------------------- */

function FeatureAccordion({
  features,
}: {
  features: { icon: React.ComponentType<{ className?: string }>; Illust: React.ComponentType<{ className?: string }>; title: string; body: string }[];
}) {
  const [open, setOpen] = useState(0);
  return (
    <div className="mt-12 divide-y divide-border border-y border-border">
      {features.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.title}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="grid w-full grid-cols-[64px_1fr_24px] items-center gap-5 py-5 text-left transition-colors hover:bg-muted/30"
            >
              <span
                className={cn(
                  'h-12 w-16 transition-all duration-300',
                  isOpen ? 'text-foreground' : 'text-muted-foreground/70'
                )}
              >
                <f.Illust className="h-full w-full" />
              </span>
              <span className="text-lg font-semibold">{f.title}</span>
              {isOpen ? (
                <Minus className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Plus className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <div
              className={cn(
                'grid grid-cols-[64px_1fr_24px] gap-5 overflow-hidden transition-all duration-500',
                isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div />
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              <div />
            </div>
          </div>
        );
      })}
    </div>
  );
}
