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

const DecisionSceneVisual = dynamic(
  () =>
    import("@/components/three/ContentScenes").then(
      (m) => m.DecisionSceneVisual,
    ),
  { ssr: false },
);

const loop = [
  { title: "Situation", body: "Enter an incomplete, high-stakes context." },
  { title: "Investigate", body: "Gather evidence. Notice what is missing." },
  { title: "Decide", body: "Commit without a perfect answer." },
  { title: "Consequence", body: "The world reacts — delayed, uneven, real." },
  { title: "Reflect", body: "Name the thinking pattern behind the outcome." },
  { title: "Adapt", body: "Revise judgment. Decide again — sharper." },
];

function LoopScrub({ progress }: { progress: MotionValue<number> }) {
  const [index, setIndex] = useState(0);

  useMotionValueEvent(progress, "change", (v) => {
    setIndex(Math.min(loop.length - 1, Math.floor(v * loop.length)));
  });

  const fade = useTransform(progress, [0, 0.06, 0.94, 1], [1, 1, 1, 0.85]);

  return (
    <motion.div style={{ opacity: fade }} className="relative w-full">
      <InkWash />

      <Container className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionLabel>How Myelin works</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl">
            <WordReveal text="A closed loop of judgment." as="span" />
          </h2>
          <p className="mt-5 text-lg text-muted">
            Scroll to walk the loop. Paths diverge — only one is lit.
          </p>

          <ul className="mt-10 space-y-2">
            {loop.map((step, i) => (
              <li
                key={step.title}
                className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                  i === index ? "translate-x-1 text-brand-deep" : "text-muted/40"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === index ? "bg-brand" : "bg-border"
                  }`}
                />
                {step.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-white">
          <div className="h-[280px] sm:h-[340px]">
            <DecisionSceneVisual active={index} />
          </div>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-border bg-brand-deep px-6 py-5 text-white"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-brand-bright/90">
              {index + 1} / {loop.length} · {loop[index].title}
            </p>
            <p className="mt-2 text-base text-white/85">{loop[index].body}</p>
          </motion.div>
        </div>
      </Container>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <StickyScrub height="200vh" className="bg-bg-soft">
      {(progress) => <LoopScrub progress={progress} />}
    </StickyScrub>
  );
}
