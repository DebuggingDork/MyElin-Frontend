"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { DataTimeline } from "@/components/ui/DataViews";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";
import { easeOut } from "@/lib/media";

const simulations = [
  {
    label: "Survivorship Bias",
    title: "Find the Next Unicorn",
    body: "You only see the winners that survived. The failures left no trace.",
  },
  {
    label: "Confirmation Bias",
    title: "Missing Evidence",
    body: "You seek what agrees with you, and quietly ignore what doesn't.",
  },
  {
    label: "Correlation ≠ Causation",
    title: "Perfect Campaign",
    body: "Two things move together. It does not mean one caused the other.",
  },
  {
    label: "Bullwhip Effect",
    title: "Ripple Effect",
    body: "Small signals amplify wildly as they travel down a system.",
  },
  {
    label: "Goodhart's Law",
    title: "Beyond The KPI",
    body: "When a measure becomes a target, it stops being a good measure.",
  },
  {
    label: "Halo Effect",
    title: "The First Impression",
    body: "One strong trait bleeds into your judgment of everything else.",
  },
  {
    label: "Base Rate Neglect",
    title: "Hidden Customers",
    body: "You fixate on the vivid case and forget the underlying odds.",
  },
  {
    label: "Loss Aversion",
    title: "Fear Of Losing",
    body: "Losses loom larger than equivalent gains — and distort choices.",
  },
  {
    label: "Anchoring Bias",
    title: "The First Price",
    body: "The first number you see silently pulls every later estimate.",
  },
  {
    label: "Second-Order Effects",
    title: "Chain Reaction",
    body: "The obvious result is rarely the one that actually matters.",
  },
];

export function Simulations() {
  const [active, setActive] = useState(3);
  const current = simulations[active];

  return (
    <section
      id="simulations"
      className="relative scroll-mt-24 overflow-hidden bg-bg py-24 sm:py-32"
    >
      <InkWash />

      <Container className="relative z-10">
        <MaskReveal>
          <SectionLabel>Hidden thinking patterns</SectionLabel>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-brand-ink sm:text-5xl">
            <WordReveal
              text="Every simulation hides a mental model."
              as="span"
            />
          </h2>
        </MaskReveal>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Walk the trap line. Each node is a cognitive pattern students meet
          while they think they are only running a business.
        </p>

        <Link
          href="/simulation"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-ink px-5 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-deep"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-bright opacity-80" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-bright" />
          </span>
          Run a live simulation
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.75rem] border border-border bg-white p-3 sm:p-4">
            <DataTimeline
              items={simulations}
              active={active}
              onSelect={setActive}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="flex min-h-[28rem] flex-col justify-between rounded-[1.75rem] bg-brand-ink p-8 text-white sm:p-10"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-bright/85">
                  Trap {active + 1} / {simulations.length}
                </p>
                <h3 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {current.title}
                </h3>
                <p className="mt-3 text-sm font-medium text-brand-bright">
                  {current.label}
                </p>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
                  {current.body}
                </p>
              </div>

              <div className="mt-10 grid grid-cols-5 gap-2 sm:grid-cols-10">
                {simulations.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Open trap ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={`h-1.5 rounded-full transition-colors ${
                      i === active ? "bg-brand" : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
