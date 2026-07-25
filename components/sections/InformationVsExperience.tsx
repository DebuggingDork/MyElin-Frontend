"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Container } from "@/components/ui/Container";
import { DataPanel } from "@/components/ui/DataPanel";
import { Reveal } from "@/components/ui/Reveal";

const infoBars = [
  { label: "Retention after 1 week", value: 22 },
  { label: "Transfer to real decisions", value: 18 },
  { label: "Confidence under ambiguity", value: 15 },
];

const expBars = [
  { label: "Retention after 1 week", value: 78 },
  { label: "Transfer to real decisions", value: 84 },
  { label: "Confidence under ambiguity", value: 91 },
];

function Bar({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <span className="text-sm text-muted">{label}</span>
        <AnimatedNumber
          value={value}
          suffix="%"
          className={`text-sm font-semibold tabular-nums ${
            accent ? "text-brand" : "text-graphite"
          }`}
        />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border/80">
        <motion.div
          className={`h-full rounded-full ${accent ? "bg-brand" : "bg-cool-gray/50"}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </div>
    </div>
  );
}

export function InformationVsExperience() {
  return (
    <section className="section-pad bg-bg" aria-labelledby="info-vs-exp">
      <Container>
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
            Information vs experience
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="info-vs-exp"
            className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            That&apos;s the difference.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <DataPanel className="p-6 sm:p-8">
            <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
              Information
            </h3>
            <p className="mt-3 text-lg text-graphite">
              Tells you what to do. Can be forgotten.
            </p>
            <div className="mt-8 space-y-5">
              {infoBars.map((b) => (
                <Bar key={b.label} {...b} />
              ))}
            </div>
          </DataPanel>

          <DataPanel className="p-6 sm:p-8" delay={0.1}>
            <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
              Experience
            </h3>
            <p className="mt-3 text-lg text-charcoal">
              Teaches you why it matters. Changes how you think.
            </p>
            <div className="mt-8 space-y-5">
              {expBars.map((b) => (
                <Bar key={b.label} {...b} accent />
              ))}
            </div>
          </DataPanel>
        </div>

        <Reveal delay={0.2} className="mt-8 text-center text-sm text-muted">
          Illustrative model of learning transfer — not a clinical study.
        </Reveal>
      </Container>
    </section>
  );
}
