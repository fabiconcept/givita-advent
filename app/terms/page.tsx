'use client';

import Link from 'next/link';
import { HangingFlower } from '@/components/landing/HangingFlower';
import { ScrollInView } from '@/components/landing/ScrollInView';
import { ArrowLeft, Leaf } from 'lucide-react';

const SECTIONS = [
  {
    title: 'The short version',
    body: 'Givita is a community fundraising platform in early development. By using this site you agree to these terms. If you do not agree, please do not use the site. Simple.',
  },
  {
    title: 'What we offer',
    body: 'Right now Givita is in a survey phase. We provide a questionnaire about community fundraising habits and a newsletter signup. Thats it. There is no financial platform, no payment processing, no fundraising campaigns live yet. Everything you see is a prototype.',
  },
  {
    title: 'Your account',
    body: 'There are no accounts yet. You do not sign up, log in, or create a profile. You simply fill out a survey and optionally leave an email for updates. When we launch the full platform, new terms will apply and you will have a chance to review them before signing up.',
  },
  {
    title: 'Your content',
    body: 'You retain full ownership of everything you submit in surveys. By submitting, you grant Givita a non-exclusive, royalty-free license to use anonymized and aggregated versions of your responses for research, product development, and public communication (like blog posts about what we learned). We will never attribute a quote to you without asking first.',
  },
  {
    title: 'Fair use',
    body: 'Do not use this site to break any laws, harass anyone, submit false information maliciously, or try to hack or scrape the platform. Keep it kind. If you abuse the service, we reserve the right to block your access without notice.',
  },
  {
    title: 'No warranties',
    body: 'This site is provided as is. We are actively building it, so things may break, change, or disappear. We make no guarantees that the service will be uninterrupted, error-free, or that today\'s features will exist tomorrow. That is what a pre-launch means.',
  },
  {
    title: 'Limitation of liability',
    body: 'To the maximum extent permitted by law, Givita and its team are not liable for any damages arising from your use of this site. Since we do not handle money or store sensitive financial data, this mainly means you cannot sue us if the survey goes down or an email gets lost.',
  },
  {
    title: 'Changes',
    body: 'We may update these terms as Givita evolves. If we make significant changes, we will note it on this page and mention it in the newsletter. Continued use after changes means you accept the new terms. If you do not agree, stop using the site.',
  },
  {
    title: 'Governing law',
    body: 'These terms are governed by the laws of Nigeria. If you are accessing this site from another jurisdiction, you do so at your own initiative and are responsible for compliance with local laws.',
  },
];

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      <HangingFlower className="left-4 -top-10 sm:left-8 lg:left-12" side="left" size={140} ropeLength={80} delay={0} tone="primary" />
      <HangingFlower className="right-4 -top-8 sm:right-8 lg:right-12" side="right" size={100} ropeLength={60} delay={1.2} tone="muted" />
      <HangingFlower className="left-2 -bottom-10 hidden sm:left-6 sm:block lg:left-10" side="left" size={72} ropeLength={50} delay={0.8} tone="foreground" flip />
      <HangingFlower className="right-2 -bottom-8 sm:right-6 lg:right-10" side="right" size={60} ropeLength={44} delay={0.4} tone="primary" flip />

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
            Terms
          </span>
        </ScrollInView>

        <ScrollInView entrance="slideUp" duration={700} delay={180}>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Playing nice.
          </h1>
        </ScrollInView>

        <ScrollInView entrance="slideUp" duration={700} delay={260}>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            These are the ground rules for using Givita while we are still in the early stages. They exist to protect you and us. Read them, they are short.
          </p>
        </ScrollInView>

        <ScrollInView entrance="slideUp" duration={700} delay={340}>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated April 2026
          </p>
        </ScrollInView>

        <div className="mt-16 space-y-12">
          {SECTIONS.map((section, i) => (
            <ScrollInView key={section.title} entrance="slideUp" duration={700} delay={Math.min(i * 70, 400)}>
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
            <h2 className="text-xl font-semibold tracking-tight">Questions about the fine print?</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              These terms are written for humans, not lawyers. If something is unclear, or if you want to negotiate your own terms (within reason), email us.
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
            <span className="mx-3 text-muted-foreground/30" aria-hidden>/</span>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </ScrollInView>
      </div>
    </div>
  );
}
