"use client";

import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { StickyScrub } from "@/components/ui/ScrollEffects";
import { DarkStatement, InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";
import { easeOut } from "@/lib/media";

const phases = [
  {
    title: "Investigate",
    body: "Gather evidence in ambiguous, incomplete situations — not answer prompts.",
  },
  {
    title: "Decide",
    body: "Commit to a judgment call knowing the picture is never complete.",
  },
  {
    title: "Experience consequences",
    body: "A living world reacts — sometimes slowly, sometimes unexpectedly.",
  },
  {
    title: "Reflect",
    body: "Confront the thinking behind the outcome. Refine how you reason.",
  },
];

function DecisionScrubContent({ progress }: { progress: MotionValue<number> }) {
  const [index, setIndex] = useState(0);
  const opacity = useTransform(progress, [0, 0.06, 0.94, 1], [1, 1, 1, 0.9]);

  useMotionValueEvent(progress, "change", (v) => {
    const i = Math.min(phases.length - 1, Math.floor(v * phases.length));
    setIndex(i);
  });

  return (
    <motion.div style={{ opacity }} className="relative w-full">
      <InkWash />
      <Container className="relative z-10">
        <SectionLabel>Scroll to move through the room</SectionLabel>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl">
          <WordReveal text="Classrooms become decision environments." as="span" />
        </h2>

        <div className="mt-8 flex gap-2">
          {phases.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-700 ${
                i <= index ? "bg-brand" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-3">
            {phases.map((p, i) => (
              <p
                key={p.title}
                className={`text-lg transition-all duration-500 ${
                  i === index
                    ? "translate-x-2 font-semibold text-brand-deep"
                    : "text-muted/45"
                }`}
              >
                {p.title}
              </p>
            ))}
          </div>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            <DarkStatement eyebrow={`They ${phases[index].title.toLowerCase()}`}>
              {phases[index].body}
            </DarkStatement>
          </motion.div>
        </div>
      </Container>
    </motion.div>
  );
}

export function DecisionEnvironments() {
  return (
    <StickyScrub height="200vh" className="bg-bg">
      {(progress) => <DecisionScrubContent progress={progress} />}
    </StickyScrub>
  );
}
