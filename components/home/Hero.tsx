"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Action, Container, Eyebrow } from "@/components/ui/Kit";

/** Kept honest against the shipped engine: the scenario runs 4 quarters (config/scenarios,
 *  total_quarters: 4) over 22 spend lines per quarter (CLAUDE.md's 22-line model), not the
 *  "120+ decisions / 24 months" this previously claimed. */
const stats = [
  { value: "0", label: "Videos to watch" },
  { value: "22", label: "Spend lines a quarter" },
  { value: "7", label: "Cognitive dimensions" },
  { value: "12mo", label: "Compressed into 30 min" },
];

export function Hero() {
  return (
    <section
      id="home"
      className="noise relative overflow-hidden border-b border-line bg-void pt-[68px]"
    >
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <Container
        wide
        className="relative z-10 flex min-h-[78svh] flex-col justify-center py-24 sm:py-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <Eyebrow accent="teal">
            The Decision Intelligence Platform — S-25 Cohort
          </Eyebrow>
        </motion.div>

        <h1 className="mt-8 leading-[0.94]">
          <motion.span
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: easeOut }}
            className="display block text-[clamp(2.8rem,7.6vw,6.2rem)] font-medium italic text-ink"
          >
            Make
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: easeOut }}
            className="display block text-[clamp(2.8rem,7.6vw,6.2rem)] font-medium italic text-ink"
          >
            decisions.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
            className="text-grad display block text-[clamp(3.2rem,9.4vw,7.6rem)] font-bold not-italic"
          >
            Not notes.
          </motion.span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.44, ease: easeOut }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Action href="/play/startup-survival" size="lg">
            <Play className="h-4 w-4" />
            Run Startup Survival
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Action>
          <Action href="/manifesto" variant="outline" size="lg">
            Read the Blueprint
            <ArrowRight className="h-4 w-4" />
          </Action>
        </motion.div>
      </Container>

      <Container wide className="relative z-10 pb-10 sm:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.56, ease: easeOut }}
          className="flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10"
        >
          <p className="max-w-md text-[13.5px] leading-[1.7] text-dim">
            Myelin compresses a year of running a startup into 30 minutes of
            consequential choices. No videos. No quizzes. Just judgment.
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-4 sm:justify-end">
            {stats.map((stat) => (
              <div key={stat.label} className="sm:text-right">
                <p className="display text-[19px] leading-none text-ink">
                  {stat.value}
                </p>
                <p className="eyebrow mt-2 text-faint">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
