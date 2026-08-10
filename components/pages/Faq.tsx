"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { easeOut } from "@/lib/media";
import {
  Action,
  Container,
  Eyebrow,
  Panel,
  accentVar,
  type Accent,
} from "@/components/ui/Kit";

type FaqItem = {
  q: string;
  a: string;
  accent: Accent;
};

const faqs: FaqItem[] = [
  {
    q: "Is this an LMS?",
    a: "No. There are no videos, no quizzes, no chapters. You make decisions; the system runs consequences.",
    accent: "violet",
  },
  {
    q: "How is my decision graded?",
    a: "Each decision moves real KPIs and a hidden skill telemetry across 7 cognitive dimensions. Your final report aggregates patterns, not single outcomes.",
    accent: "indigo",
  },
  {
    q: "Can I retake a simulation?",
    a: "Yes. Variables and crisis triggers re-roll each run — your best-of-three is what's submitted.",
    accent: "cyan",
  },
  {
    q: "Is the AI generating the scenarios?",
    a: "The simulation engine itself is deterministic, formula-based, and audited. Narrative flavor and stakeholder voice are AI-generated; the math is not.",
    accent: "teal",
  },
  {
    q: "Will recruiters actually use the DI Report?",
    a: "We're piloting with universities and accelerators first. The report is designed to be machine-readable and human-readable.",
    accent: "emerald",
  },
  {
    q: "Is there a free tier?",
    a: "Yes — one simulation per month with a basic report. Pro and Institutional unlock the rest.",
    accent: "amber",
  },
  {
    q: "Who's behind Myelin?",
    a: "A founding team across product, learning science, simulation design, and engineering. Investors update soon.",
    accent: "rose",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-14 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />

        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <Eyebrow accent="teal">MYELIN — FAQ</Eyebrow>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: easeOut }}
                className="display mt-7 text-[clamp(2.4rem,6vw,4.2rem)] leading-[0.98] text-ink"
              >
                Questions you{" "}
                <span className="text-grad">might have.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1, ease: easeOut }}
                className="mt-7 max-w-xl text-[17px] leading-[1.7] text-dim"
              >
                Short answers about the product, the grading model, and who
                Myelin is for. Still stuck? Reach out via institutions.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: easeOut }}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { n: "7", l: "Q&A covered", a: "violet" as Accent },
                { n: "0", l: "videos required", a: "rose" as Accent },
                { n: "1", l: "free run / month", a: "emerald" as Accent },
                { n: "24", l: "months compressed", a: "cyan" as Accent },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-line bg-[var(--panel-2)] px-5 py-5"
                >
                  <p
                    className="display text-[28px] leading-none"
                    style={{ color: accentVar[s.a] }}
                  >
                    {s.n}
                  </p>
                  <p className="eyebrow mt-3 text-faint">{s.l}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-b border-line bg-base">
        <div className="dot-grid absolute inset-0" />
        <Container className="relative z-10 section-pad">
          <div className="space-y-3">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              const color = accentVar[item.accent];
              return (
                <motion.div
                  key={item.q}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.04, ease: easeOut }}
                >
                  <div
                    className="overflow-hidden rounded-2xl border transition-colors duration-300"
                    style={{
                      borderColor: isOpen
                        ? `color-mix(in srgb, ${color} 45%, transparent)`
                        : "var(--line)",
                      background: isOpen
                        ? `color-mix(in srgb, ${color} 8%, rgba(255,255,255,0.02))`
                        : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <span
                        className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[11px]"
                        style={{
                          borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                          color,
                          background: `color-mix(in srgb, ${color} 12%, transparent)`,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[15.5px] font-medium text-ink sm:text-[16.5px]">
                        {item.q}
                      </span>
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                        style={{
                          borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
                          color,
                        }}
                      >
                        {isOpen ? (
                          <Minus className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: easeOut }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-line px-5 pb-5 pt-1 sm:px-6 sm:pl-[4.75rem]">
                            <p className="max-w-2xl text-[15px] leading-[1.75] text-dim">
                              {item.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Panel
            gradientRing
            glow
            accent="teal"
            className="mt-12 overflow-hidden p-0"
          >
            <div
              className="flex flex-col items-start justify-between gap-6 p-7 sm:p-9 lg:flex-row lg:items-center"
              style={{
                background:
                  "linear-gradient(120deg, rgba(20,184,166,0.18), rgba(255,255,255,0.06))",
              }}
            >
              <div>
                <Eyebrow accent="teal">Still curious?</Eyebrow>
                <p className="display mt-4 text-[22px] text-ink">
                  Talk to the team — or just run a case.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Action href="/#institutions">Request access</Action>
                <Action href="/play/startup-survival" variant="outline">
                  Play Startup Survival
                </Action>
              </div>
            </div>
          </Panel>
        </Container>
      </section>
    </>
  );
}
