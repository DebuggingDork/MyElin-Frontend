"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { easeOut } from "@/lib/media";
import type { Level, Metrics } from "@/lib/simulation/types";
import { TypedFeed } from "@/components/simulation/Typewriter";
import { MetricBoard } from "@/components/simulation/MetricHud";
import {
  SimButton,
  SimChip,
  SimEyebrow,
  SimPanel,
} from "@/components/simulation/SimChrome";

export function Dossier({
  level,
  metrics,
  onDone,
}: {
  level: Level;
  metrics: Metrics;
  onDone: () => void;
}) {
  const [read, setRead] = useState(false);

  const registry = [
    { label: "Stage", value: level.company.stage },
    { label: "Sector", value: level.company.sector },
    { label: "Founded", value: level.company.founded },
    { label: "Base", value: level.company.location },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <SimChip tone="brand">Company dossier</SimChip>
        <SimChip tone="muted">{level.tier}</SimChip>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
            className="text-3xl font-semibold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl"
          >
            {level.company.name}
          </motion.h1>

          <p className="mt-4 max-w-lg text-lg leading-relaxed text-brand-deep">
            {level.company.mandate}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6">
            {registry.map((item) => (
              <div key={item.label}>
                <dt className="sim-eyebrow text-muted">{item.label}</dt>
                <dd className="mt-1.5 text-[14.5px] font-medium text-brand-ink">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <SimPanel tone="soft" delay={0.12} className="p-7">
          <SimEyebrow>Background</SimEyebrow>
          <div className="mt-5">
            <TypedFeed
              lines={level.company.dossier.map((text, i) => ({
                text,
                tone: i === level.company.dossier.length - 1 ? ("caution" as const) : ("muted" as const),
              }))}
              speed={9}
              gap={150}
              onDone={() => setRead(true)}
            />
          </div>
        </SimPanel>
      </div>

      <div className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SimEyebrow>Opening position</SimEyebrow>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-brand-ink">
              These are the only numbers you get before the first decision.
            </h2>
          </div>
          <span className="sim-eyebrow flex items-center gap-2 text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand sim-live" />
            live readings
          </span>
        </div>
        <MetricBoard metrics={metrics} className="mt-6" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: read ? 1 : 0.4 }}
        transition={{ duration: 0.4 }}
        className="mt-10 flex flex-wrap items-center gap-4"
      >
        <SimButton onClick={onDone} disabled={!read}>
          Enter Quarter 1
          <ArrowRight className="h-3.5 w-3.5" />
        </SimButton>
        <p className="text-[13px] text-muted">
          {read
            ? "Quarters run in sequence. There is no going back."
            : "Reading the dossier…"}
        </p>
      </motion.div>
    </div>
  );
}
