"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { DataPanel } from "@/components/ui/DataPanel";
import { Reveal } from "@/components/ui/Reveal";

const scenarios = [
  {
    id: "customers",
    label: "Losing customers",
    prompt: "A business is losing customers.",
    tension: "Churn is rising. Reviews are mixed. The board wants answers today.",
  },
  {
    id: "team",
    label: "Divided team",
    prompt: "A team is divided.",
    tension: "Two leads disagree on direction. Morale is slipping. Time is scarce.",
  },
  {
    id: "resources",
    label: "Running out",
    prompt: "Resources are running out.",
    tension: "Burn rate is high. Pipeline is soft. One wrong cut ends the runway.",
  },
  {
    id: "deadline",
    label: "Deadline",
    prompt: "A deadline is approaching.",
    tension: "Quality vs speed. Reputation vs delivery. No third option appears.",
  },
];

export function Classroom() {
  const [active, setActive] = useState(0);
  const scenario = scenarios[active];

  return (
    <section className="section-pad bg-bg" aria-labelledby="classroom">
      <Container>
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            A different kind of classroom
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="classroom"
            className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            Imagine walking into a session.
          </h2>
        </Reveal>

        <div className="prose-wide mt-8 space-y-4 text-lg leading-relaxed text-muted">
          <Reveal as="p" delay={0.1}>
            The facilitator doesn&apos;t open a presentation. There&apos;s no
            lecture. No definitions. No slides explaining today&apos;s topic.
          </Reveal>
          <Reveal as="p" delay={0.14} className="font-medium text-charcoal">
            Instead, you&apos;re given a situation.
          </Reveal>
        </div>

        <DataPanel className="mt-10 p-5 sm:p-8" delay={0.12}>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            Select a pressure scenario
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scenarios.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(i)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-300 ${
                  i === active
                    ? "border-brand bg-brand/10 text-brand-deep"
                    : "border-border text-muted hover:border-brand/35 hover:text-graphite"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"
            >
              <div>
                <p className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
                  {scenario.prompt}
                </p>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
                  {scenario.tension}
                </p>
              </div>
              <div className="rounded-xl border border-brand/25 bg-brand/5 px-4 py-3 lg:min-w-[11rem]">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                  Your move
                </p>
                <p className="mt-1 font-medium text-brand">You have to decide.</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-muted">
              You don&apos;t know what&apos;s coming next. Neither does anyone
              else. When it&apos;s over, the room is silent — not because people
              memorized a concept. Because they just experienced it.
            </p>
            <p className="mt-6 text-3xl font-semibold tracking-tight text-brand sm:text-4xl">
              &ldquo;Why did that happen?&rdquo;
            </p>
            <p className="mt-3 text-lg text-muted">That&apos;s when learning begins.</p>
          </div>
        </DataPanel>
      </Container>
    </section>
  );
}
