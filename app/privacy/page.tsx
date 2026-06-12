'use client';

import Link from 'next/link';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { ScrollInView } from '@/components/landing/ScrollInView';
import { ArrowLeft, Leaf } from 'lucide-react';

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'We collect only what you choose to share. When you fill out a survey, that means your responses, the name or email you provide, and optionally a photo or link you include. When you sign up for launch updates, we keep your email address and nothing else.',
  },
  {
    title: 'How we use it',
    body: 'Your survey answers help us understand what our community needs. We aggregate responses to shape Givita before launch and may publish anonymized trends (no names, no emails). Your email is used solely to send launch updates and occasional important notes. We will never sell your data or share it with advertisers.',
  },
  {
    title: 'Cookies & tracking',
    body: 'We use essential cookies to keep the app running and a minimal analytics cookie (via Vercel Analytics) to know how many people visit each page. No tracking across other sites, no fingerprinting, no third-party ad cookies. You can block cookies in your browser settings without losing access to the survey.',
  },
  {
    title: 'Where your data lives',
    body: 'Survey responses are stored in Google Sheets (encrypted at rest) on a dedicated service account that only the Givita team can access. Email subscriptions live in a separate, restricted sheet. We keep backups for 30 days and delete individual records on request.',
  },
  {
    title: 'Your rights',
    body: 'You can request a copy of your data, ask us to correct it, or delete it entirely at any time. Just email favourajokubi@gmail.com with your request and we will handle it within 14 days. No fine print, no runaround.',
  },
  {
    title: 'Changes to this policy',
    body: 'If we change how we handle your data, we will update this page and note the change in our launch newsletter. Major changes get a direct email. We will never retroactively change how we treat data you already gave us.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      <HangingFlower className="left-4 -top-10 sm:left-8 lg:left-12" side="left" size={140} ropeLength={80} delay={0} tone="primary" />
      <HangingFlower className="right-4 -top-8 sm:right-8 lg:right-12" side="right" size={100} ropeLength={60} delay={1.2} tone="muted" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/[0.02] blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-primary/[0.015] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <ScrollInView entrance="slideUp" duration={600}>
          <Link
            href="/"
            className="group mb-12 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </Link>
        </ScrollInView>

        <ScrollInView entrance="slideUp" duration={700} delay={100}>
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
            Privacy
          </span>
        </ScrollInView>

        <ScrollInView entrance="slideUp" duration={700} delay={180}>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Your data, your call.
          </h1>
        </ScrollInView>

        <ScrollInView entrance="slideUp" duration={700} delay={260}>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            We built Givita on trust. This policy spells out exactly what we collect, why, and what you can do about it. Nothing hidden, nothing clever.
          </p>
        </ScrollInView>

        <ScrollInView entrance="slideUp" duration={700} delay={340}>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated April 2026
          </p>
        </ScrollInView>

        <div className="mt-16 space-y-12">
          {SECTIONS.map((section, i) => (
            <ScrollInView key={section.title} entrance="slideUp" duration={700} delay={Math.min(i * 80, 400)}>
              <section className="group/section rounded-2xl border border-transparent p-5 transition-colors hover:border-border/40 hover:bg-muted/10 sm:p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary transition-transform group-hover/section:scale-110">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
                </div>
                <p className="ml-11 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
              </section>
              {i < SECTIONS.length - 1 && (
                <div className="mx-auto mt-12 flex items-center justify-center gap-2 text-muted-foreground/20">
                  <span className="h-px w-8 bg-muted-foreground/10" />
                  <Leaf className="h-3 w-3" />
                  <span className="h-px w-8 bg-muted-foreground/10" />
                </div>
              )}
            </ScrollInView>
          ))}
        </div>

        <ScrollInView entrance="slideUp" duration={700} delay={500}>
          <div className="mt-20 rounded-2xl border border-border bg-card p-8 sm:p-10">
            <h2 className="text-xl font-semibold tracking-tight">Questions?</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              If you have questions about anything on this page, or if you want to request access to your data, just reach out.
            </p>
            <a
              href="mailto:favourajokubi@gmail.com"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              favourajokubi@gmail.com
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </a>
          </div>
        </ScrollInView>

        <ScrollInView entrance="fade" duration={600} delay={600}>
          <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              &larr; Back
            </Link>
          </div>
        </ScrollInView>
      </div>
    </div>
  );
}
