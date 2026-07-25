"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";

const notList = ["Quizzes", "MCQs", "Case Studies", "Static Games"];
const isList = [
  "Living Decision Environments",
  "Dynamic Consequences",
  "Structured Reflection",
  "Professional Thinking",
  "Realistic Uncertainty",
  "Transferable Judgment",
];

export function WhyUniversities() {
  return (
    <section className="relative overflow-hidden bg-bg-soft py-28 sm:py-36">
      <InkWash />
      <Container className="relative z-10">
        <MaskReveal>
          <SectionLabel>Positioning</SectionLabel>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl">
            <WordReveal text="Why universities choose Myelin." as="span" />
          </h2>
        </MaskReveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-border bg-white p-8 sm:p-10"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
              What Myelin is not
            </p>
            <ul className="mt-6 space-y-4">
              {notList.map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg text-muted">
                  <X className="h-4 w-4" strokeWidth={1.75} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] bg-brand-deep p-8 sm:p-10"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-bright">
              What Myelin is
            </p>
            <ul className="mt-6 space-y-4">
              {isList.map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg text-white">
                  <Check className="h-4 w-4 text-brand-bright" strokeWidth={1.75} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
