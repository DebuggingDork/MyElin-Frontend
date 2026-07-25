"use client";

import { BookOpen, Clapperboard, Presentation } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { DataPanel } from "@/components/ui/DataPanel";
import { Reveal } from "@/components/ui/Reveal";

const methods = [
  {
    icon: Presentation,
    label: "Lecture",
    can: "Explain leadership",
    cannot: "Recreate the weight of a live call",
  },
  {
    icon: BookOpen,
    label: "Book",
    can: "Describe strategy",
    cannot: "Put capital at risk",
  },
  {
    icon: Clapperboard,
    label: "Video",
    can: "Teach negotiation",
    cannot: "Make the other side push back",
  },
];

export function TheProblem() {
  return (
    <section
      className="section-pad noise relative bg-bg-soft"
      aria-labelledby="problem"
    >
      <Container className="relative z-10">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            The problem
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="problem"
            className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            Traditional education prepares you for exams.
            <span className="mt-2 block text-muted">
              Life prepares you with consequences.
            </span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {methods.map((m, i) => (
            <DataPanel key={m.label} delay={0.08 + i * 0.08} className="p-5 sm:p-6">
              <m.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.14em] text-muted">
                {m.label}
              </p>
              <p className="mt-3 text-base text-graphite">Can {m.can.toLowerCase()}.</p>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="mt-3 border-t border-border pt-3 text-sm text-brand"
              >
                Cannot: {m.cannot.toLowerCase()}.
              </motion.p>
            </DataPanel>
          ))}
        </div>

        <Reveal delay={0.2} className="prose-wide mt-10 text-lg leading-relaxed text-muted">
          <p>
            None of them can recreate the feeling of making a decision when the
            outcome is unknown — and that&apos;s exactly where the most valuable
            learning happens.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
