"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { easeOut } from "@/lib/media";
import type { Level } from "@/lib/simulation/types";
import { TypedFeed, Typewriter } from "@/components/simulation/Typewriter";
import {
  SimButton,
  SimChip,
  SimEyebrow,
  SimPanel,
} from "@/components/simulation/SimChrome";

export function BootSequence({
  level,
  onDone,
}: {
  level: Level;
  onDone: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const lines = [
    { text: `Scenario ready — ${level.name}.`, tone: "muted" as const },
    { text: `You are sitting the CEO chair at ${level.company.name}, ${level.company.stage}.`, tone: "muted" as const },
    { text: "Four quarters. Deterministic model. No quizzes.", tone: "muted" as const },
    { text: "Finance, product, operations, and people will all speak.", tone: "muted" as const },
    { text: "Some choices mature one to two quarters later — after you have moved on.", tone: "caution" as const },
    { text: "The environment is ready. The chair is yours.", tone: "brand" as const },
  ];

  useEffect(() => {
    if (ready) {
      setProgress(100);
      return;
    }
    const id = window.setInterval(() => {
      setProgress((p) => Math.min(93, p + Math.random() * 7 + 2));
    }, 260);
    return () => window.clearInterval(id);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(onDone, 1000);
    return () => window.clearTimeout(id);
  }, [ready, onDone]);

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-3xl flex-col justify-center px-5 py-20 sm:px-8">
      <SimChip tone="brand" className="w-fit">
        <span className="h-1.5 w-1.5 rounded-full bg-brand sim-live" />
        Preparing environment
      </SimChip>

      <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-brand-ink sm:text-5xl">
        <Typewriter text={level.company.name} speed={52} caret />
      </h1>

      <p className="mt-3 text-[15px] text-muted">
        {level.company.sector} · {level.company.location}
      </p>

      <SimPanel delay={0.15} className="mt-9 px-6 py-6">
        <TypedFeed lines={lines} speed={10} gap={130} onDone={() => setReady(true)} />
      </SimPanel>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <SimEyebrow tone="muted">
            {ready ? "Ready" : "Compiling scenario"}
          </SimEyebrow>
          <span className="sim-num text-[13px] font-medium text-brand-deep">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-brand-ink/8">
          <motion.div
            className="h-full rounded-full bg-brand"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: easeOut }}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8"
      >
        <SimButton onClick={onDone} disabled={!ready}>
          Open the dossier
          <ArrowRight className="h-3.5 w-3.5" />
        </SimButton>
      </motion.div>
    </div>
  );
}
