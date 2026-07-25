"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { PointLine } from "@/components/ui/DataViews";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";
import { easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";

const principles = [
  {
    title: "Experience",
    body: "Knowledge earned by doing, not receiving.",
    step: "01",
  },
  {
    title: "Reflection",
    body: "Meaning extracted from every outcome.",
    step: "02",
  },
  {
    title: "Feedback",
    body: "A world that responds, honestly and in time.",
    step: "03",
  },
  {
    title: "Iteration",
    body: "Judgment refined across repeated attempts.",
    step: "04",
  },
  {
    title: "Pattern Recognition",
    body: "The same trap, seen in new disguises.",
    step: "05",
  },
  {
    title: "Transfer of Learning",
    body: "Skill that survives outside the classroom.",
    step: "06",
  },
  {
    title: "Decision Making",
    body: "The core act, practised until it's instinct.",
    step: "07",
  },
];

export function CognitiveScience() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative overflow-hidden bg-bg py-24 sm:py-32">
      <InkWash />
      <Container className="relative z-10">
        <MaskReveal>
          <SectionLabel>Cognitive science</SectionLabel>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-brand-ink sm:text-5xl">
            <WordReveal text="Designed around how expertise forms." as="span" />
          </h2>
        </MaskReveal>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Expertise is a sequence. Follow the line — each point compounds the
          last.
        </p>

        <div className="mt-12 rounded-[1.75rem] border border-border bg-white p-6 sm:p-8">
          <PointLine
            items={principles}
            active={active}
            onSelect={setActive}
            showLabels={false}
            className="mb-2 hidden lg:block"
          />

          <div className="mt-6 grid gap-3 lg:grid-cols-7">
            {principles.map((p, i) => {
              const on = i === active;
              return (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative rounded-2xl border p-4 text-left transition-colors",
                    on
                      ? "border-brand-ink bg-brand-ink text-white"
                      : "border-border bg-bg-soft/60 text-brand-ink hover:border-brand/35",
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-semibold tabular-nums tracking-[0.14em]",
                      on ? "text-brand-bright/90" : "text-brand-muted",
                    )}
                  >
                    {p.step}
                  </span>
                  <span className="mt-2 block text-sm font-semibold leading-snug">
                    {p.title}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={principles[active].title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="mt-6 grid gap-6 rounded-[1.5rem] bg-bg-soft p-6 sm:grid-cols-[auto_1fr] sm:p-8"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-ink text-2xl font-semibold text-white">
                {principles[active].step}
              </div>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl">
                  {principles[active].title}
                </h3>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
                  {principles[active].body}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
