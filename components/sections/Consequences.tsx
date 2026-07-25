"use client";

import dynamic from "next/dynamic";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { StickyScrub } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";

const RippleScene = dynamic(
  () =>
    import("@/components/three/ContentScenes").then((m) => m.RippleScene),
  { ssr: false },
);

const steps = [
  {
    title: "Student makes a recommendation",
    body: "A confident call, based on the evidence available today.",
  },
  {
    title: "The company changes",
    body: "Resources shift, priorities move, the organisation adapts.",
  },
  {
    title: "Unexpected consequences emerge",
    body: "A downstream effect nobody modelled begins to unfold.",
  },
  {
    title: "New evidence appears",
    body: "The situation reveals what was hidden. Logic is tested.",
  },
  {
    title: "The student adapts",
    body: "Not graded — challenged to reason again with sharper judgment.",
  },
];

function ConsequenceScrub({ progress }: { progress: MotionValue<number> }) {
  const [index, setIndex] = useState(0);
  const bar = useTransform(progress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(progress, "change", (v) => {
    setIndex(Math.min(steps.length - 1, Math.floor(v * steps.length)));
  });

  return (
    <div className="relative w-full">
      <InkWash />

      <Container className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionLabel>Learning through consequences</SectionLabel>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl">
            <WordReveal
              text="Outcomes arrive late. Judgment arrives early."
              as="span"
            />
          </h2>

          <div className="relative mt-10 h-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="absolute inset-y-0 left-0 bg-brand"
              style={{ width: bar }}
            />
          </div>

          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-10"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-deep">
              Moment {index + 1}
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
              {steps[index].title}
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {steps[index].body}
            </p>
          </motion.div>
        </div>

        <div className="h-[260px] overflow-hidden rounded-[2rem] border border-border bg-white sm:h-[320px]">
          <RippleScene pulse={index} />
        </div>
      </Container>
    </div>
  );
}

export function Consequences() {
  return (
    <StickyScrub height="180vh" className="bg-bg">
      {(progress) => <ConsequenceScrub progress={progress} />}
    </StickyScrub>
  );
}
