"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Eye,
  Gauge,
  Hourglass,
  Quote,
  Scale,
} from "lucide-react";
import { easeOut } from "@/lib/media";
import {
  Action,
  Container,
  Eyebrow,
  Panel,
  accentVar,
  type Accent,
} from "@/components/ui/Kit";

type Principle = {
  id: string;
  title: string;
  copy: string;
  accent: Accent;
  icon: typeof Compass;
};

const principles: Principle[] = [
  {
    id: "01",
    title: "Judgment is a skill.",
    copy: "It improves with deliberate practice, retrieval, and calibrated feedback. We treat it like one.",
    accent: "violet",
    icon: Compass,
  },
  {
    id: "02",
    title: "Compress time.",
    copy: "A real decision matures over months. We compress the consequence loop so you can practice 100× more often.",
    accent: "indigo",
    icon: Hourglass,
  },
  {
    id: "03",
    title: "Measure what matters.",
    copy: "Outcome alone is luck. We grade the process: the trade-offs, the read of risk, the choice under uncertainty.",
    accent: "cyan",
    icon: Gauge,
  },
  {
    id: "04",
    title: "Reveal the hidden.",
    copy: "Markets, stakeholders, and co-founders have hidden variables. We expose them only when you've earned the read.",
    accent: "amber",
    icon: Eye,
  },
  {
    id: "05",
    title: "Make it portable.",
    copy: "A DI Report should travel — to recruiters, deans, scholarships, and yourself five years from now.",
    accent: "emerald",
    icon: Scale,
  },
];

export function Manifesto() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-16 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />

        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <Eyebrow accent="rose">MYELIN — MANIFESTO</Eyebrow>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="display mt-7 max-w-4xl text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] text-ink"
          >
            The world rewards <span className="text-grad">judgment.</span>
            <br />
            <span className="text-dim">Schools test recall.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
            className="mt-10 max-w-2xl space-y-5 text-[17px] leading-[1.75] text-dim"
          >
            <p>
              Myelin exists to close that gap. We believe that the most
              consequential skill of the 21st century — making good decisions
              under uncertainty — should not be left to chance, mentorship, or
              being born to the right parents.
            </p>
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: easeOut }}
            className="relative mt-12 max-w-3xl overflow-hidden rounded-2xl border border-line p-7 sm:p-9"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,184,166,0.18), rgba(255,255,255,0.06) 55%, rgba(15,118,110,0.12))",
            }}
          >
            <Quote
              className="absolute right-6 top-6 h-10 w-10 text-white/10"
              aria-hidden
            />
            <p className="display relative text-[clamp(1.4rem,3vw,2rem)] leading-[1.2] text-ink">
              It should be practiced, measured, and rewarded.
            </p>
            <p className="eyebrow relative mt-5 text-faint">— The Myelin thesis</p>
          </motion.blockquote>
        </Container>
      </section>

      <section className="relative overflow-hidden border-b border-line bg-base">
        <div className="dot-grid absolute inset-0" />
        <Container wide className="relative z-10 section-pad">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow accent="teal">Five principles</Eyebrow>
              <h2 className="display mt-5 max-w-xl text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[1.05] text-ink">
                How we build{" "}
                <span className="text-grad-iris">Decision Intelligence.</span>
              </h2>
            </div>
            <p className="max-w-sm text-[14.5px] leading-relaxed text-dim">
              These are not slogans. They are product constraints — every
              scenario, score, and report has to survive them.
            </p>
          </div>

          <div className="relative">
            {/* Vertical gradient rail */}
            <div
              aria-hidden
              className="absolute bottom-8 left-[27px] top-8 hidden w-px sm:block"
              style={{
                background:
                  "linear-gradient(180deg, var(--violet), var(--indigo), var(--cyan), var(--amber), var(--emerald))",
              }}
            />

            <div className="space-y-5">
              {principles.map((p, i) => {
                const Icon = p.icon;
                const color = accentVar[p.accent];
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.55, delay: i * 0.07, ease: easeOut }}
                    className="relative grid gap-5 sm:grid-cols-[56px_1fr] sm:gap-7"
                  >
                    <div className="relative z-10 flex justify-start sm:justify-center">
                      <span
                        className="flex h-14 w-14 items-center justify-center rounded-full border bg-base"
                        style={{
                          borderColor: `color-mix(in srgb, ${color} 50%, transparent)`,
                          boxShadow: `0 0 28px -8px ${color}`,
                          color,
                        }}
                      >
                        <span className="num text-[13px] font-semibold">{p.id}</span>
                      </span>
                    </div>

                    <Panel
                      accent={p.accent}
                      glow
                      className="hover-lift overflow-hidden p-0"
                      animate={false}
                    >
                      <div className="grid gap-0 md:grid-cols-[1.5fr_auto]">
                        <div className="p-6 sm:p-8">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-10 w-10 items-center justify-center rounded-xl border"
                              style={{
                                borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                                background: `color-mix(in srgb, ${color} 14%, transparent)`,
                                color,
                              }}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <p className="display text-[22px] text-ink">{p.title}</p>
                          </div>
                          <p className="mt-4 max-w-2xl text-[15.5px] leading-[1.72] text-dim">
                            {p.copy}
                          </p>
                        </div>
                        <div
                          className="flex items-center justify-center border-t border-line px-8 py-6 md:border-l md:border-t-0"
                          style={{
                            background: `linear-gradient(160deg, color-mix(in srgb, ${color} 12%, transparent), transparent)`,
                          }}
                        >
                          <span
                            className="num text-[42px] font-semibold leading-none"
                            style={{ color }}
                          >
                            {p.id}
                          </span>
                        </div>
                      </div>
                    </Panel>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-void">
        <div className="aurora opacity-70" />
        <Container wide className="relative z-10 section-pad">
          <Panel gradientRing className="overflow-hidden p-0">
            <div
              className="flex flex-col items-start justify-between gap-8 p-8 sm:p-11 lg:flex-row lg:items-center"
              style={{
                background:
                  "linear-gradient(120deg, rgba(20,184,166,0.22), rgba(255,255,255,0.06))",
              }}
            >
              <div>
                <Eyebrow accent="teal">Start practicing</Eyebrow>
                <p className="display mt-5 max-w-xl text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.1] text-ink">
                  Theory is cheap.{" "}
                  <span className="text-grad">Judgment isn&apos;t.</span>
                </p>
                <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-dim">
                  Run Startup Survival — a year compressed into 30 minutes —
                  and see your first DI Report.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Action href="/play/startup-survival" size="lg">
                  Run a simulation
                  <ArrowRight className="h-4 w-4" />
                </Action>
                <Action href="/simulations" variant="outline" size="lg">
                  Browse cases
                </Action>
              </div>
            </div>
          </Panel>
        </Container>
      </section>
    </>
  );
}
