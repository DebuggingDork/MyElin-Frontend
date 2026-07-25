"use client";

import dynamic from "next/dynamic";
import { Container } from "@/components/ui/Container";
import { DataPanel } from "@/components/ui/DataPanel";
import { Reveal } from "@/components/ui/Reveal";
import { WaitlistForm } from "@/components/ui/WaitlistForm";

const BeliefOrbScene = dynamic(
  () =>
    import("@/components/three/BeliefOrbScene").then((m) => m.BeliefOrbScene),
  { ssr: false, loading: () => <div className="h-full min-h-[260px]" /> },
);

export function OurBelief() {
  return (
    <section
      id="request-access"
      className="section-pad noise relative scroll-mt-20 bg-bg-soft"
      aria-labelledby="belief"
    >
      <Container className="relative z-10">
        <div className="grid items-stretch gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
                Our belief
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2
                id="belief"
                className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
              >
                The world doesn&apos;t need more people who know the right
                answers.
              </h2>
            </Reveal>
            <div className="prose-narrow mt-8 space-y-5 text-lg leading-relaxed text-muted">
              <Reveal as="p" delay={0.12}>
                It needs more people who can make better decisions when there
                aren&apos;t any.
              </Reveal>
              <Reveal as="p" delay={0.16}>
                That&apos;s why Myelin exists.
              </Reveal>
              <Reveal as="p" delay={0.2} className="font-medium text-charcoal">
                Because the lessons that shape us most can&apos;t be taught.
                They have to be lived.
              </Reveal>
            </div>

            <DataPanel className="mt-10 max-w-md p-5 sm:p-6" delay={0.24}>
              <p className="mb-4 text-sm text-muted">
                Making mistakes isn&apos;t a setback. It&apos;s how better
                decisions are made.
              </p>
              <WaitlistForm id="request-access-form" compact />
            </DataPanel>
          </div>

          <DataPanel className="relative min-h-[280px] overflow-hidden lg:min-h-full">
            <BeliefOrbScene />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent p-6 pt-16">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                Knowledge graph
              </p>
              <p className="mt-1 text-sm font-medium text-charcoal">
                Connections strengthen with every lived decision.
              </p>
            </div>
          </DataPanel>
        </div>
      </Container>
    </section>
  );
}
