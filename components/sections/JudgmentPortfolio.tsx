"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { JudgmentRadar } from "@/components/charts/JudgmentRadar";
import { Container } from "@/components/ui/Container";
import { Progress } from "@/components/ui/Progress";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";
import { cn } from "@/lib/utils";

const radar = [
  { skill: "Framing", score: 78, full: 100 },
  { skill: "Evidence", score: 84, full: 100 },
  { skill: "Decision", score: 72, full: 100 },
  { skill: "Adapt", score: 88, full: 100 },
  { skill: "Systems", score: 76, full: 100 },
  { skill: "Reflect", score: 91, full: 100 },
  { skill: "Risk", score: 69, full: 100 },
];

const competencies = [
  { title: "Problem Framing", body: "Frames ambiguous problems before rushing to solve.", score: 78 },
  { title: "Evidence Gathering", body: "Seeks disconfirming evidence, not just support.", score: 84 },
  { title: "Decision Quality", body: "Reasoning holds up under new information.", score: 72 },
  { title: "Adaptability", body: "Revises judgment gracefully when the world shifts.", score: 88 },
  { title: "Systems Thinking", body: "Anticipates second and third-order effects.", score: 76 },
  { title: "Reflection", body: "Names the thinking pattern behind each choice.", score: 91 },
  { title: "Risk Awareness", body: "Weighs downside and uncertainty deliberately.", score: 69 },
];

export function JudgmentPortfolio() {
  const [active, setActive] = useState(5);

  return (
    <section className="relative overflow-hidden bg-bg-soft py-28 sm:py-36">
      <InkWash />
      <Container className="relative z-10">
        <MaskReveal>
          <SectionLabel>Judgment portfolio</SectionLabel>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl">
            <WordReveal
              text="No GPA. A living profile of how someone thinks."
              as="span"
            />
          </h2>
        </MaskReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-border bg-white p-4 sm:p-6"
          >
            <JudgmentRadar data={radar} />
          </motion.div>

          <div className="rounded-[2rem] border border-border bg-white p-3">
            {competencies.map((c, i) => (
              <button
                key={c.title}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3.5 text-left transition-colors",
                  i === active
                    ? "bg-brand-deep text-white"
                    : "hover:bg-bg-soft",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      i === active ? "text-white" : "text-charcoal",
                    )}
                  >
                    {c.title}
                  </span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      i === active ? "text-brand-bright" : "text-brand-deep",
                    )}
                  >
                    {c.score}
                  </span>
                </div>
                {i === active && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 overflow-hidden"
                  >
                    <p className="text-sm text-white/75">{c.body}</p>
                    <div className="mt-3">
                      <Progress
                        value={c.score}
                        className="bg-white/15"
                        indicatorClassName="bg-brand-bright"
                      />
                    </div>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
