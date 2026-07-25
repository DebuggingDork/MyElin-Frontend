"use client";

import { motion } from "framer-motion";
import { PathwayChart } from "@/components/charts/PathwayChart";
import { Container } from "@/components/ui/Container";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";

const chartData = [
  { stage: "Lecture", traditional: 35, myelin: 20 },
  { stage: "Study", traditional: 55, myelin: 35 },
  { stage: "Exam", traditional: 78, myelin: 42 },
  { stage: "Decide", traditional: 28, myelin: 68 },
  { stage: "Reflect", traditional: 18, myelin: 86 },
  { stage: "Transfer", traditional: 12, myelin: 92 },
];

export function KnowingDoingGap() {
  return (
    <section className="relative overflow-hidden bg-bg-soft">
      <InkWash />
      <Container className="relative z-10 py-28 sm:py-36">
        <MaskReveal>
          <SectionLabel>Knowing ≠ deciding</SectionLabel>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl">
            <WordReveal text="The gap between knowing and doing." as="span" />
          </h2>
        </MaskReveal>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 overflow-hidden rounded-[2rem] border border-border bg-white p-5 shadow-[0_40px_100px_-60px_rgba(27,61,58,0.25)] sm:p-8"
        >
          <div className="mb-4 flex flex-wrap justify-between gap-3 text-xs text-muted">
            <span>Judgment capacity across a learning cycle</span>
            <span className="flex gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-muted" /> Traditional
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand" /> Myelin
              </span>
            </span>
          </div>
          <PathwayChart data={chartData} />
          <p className="mt-4 text-sm text-muted">
            Traditional pathways peak at exams. Myelin compounds at decisions,
            reflection, and transfer.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
