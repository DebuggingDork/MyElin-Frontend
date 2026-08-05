"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { levels } from "@/lib/simulation/data";
import { runwayMonths } from "@/lib/simulation/engine";
import { formatMoney, formatRunway } from "@/lib/simulation/format";
import type { Level } from "@/lib/simulation/types";
import { easeOut } from "@/lib/media";
import { TypedFeed } from "@/components/simulation/Typewriter";
import {
  ArcGauge,
  SimButton,
  SimChip,
  SimEyebrow,
  SimPanel,
} from "@/components/simulation/SimChrome";

const intro = [
  { text: "Two levels. Eight quarters. Twenty-four decisions that leave a mark.", tone: "muted" as const },
  { text: "Every quarter runs on a deterministic model — nothing here is a quiz.", tone: "muted" as const },
  { text: "Choose a weight class to begin.", tone: "brand" as const },
];

export function LevelSelect({
  completed,
  onStart,
  onUnlock,
}: {
  completed: string[];
  onStart: (levelId: Level["id"]) => void;
  onUnlock: (levelId: Level["id"]) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <SimEyebrow>Decision intelligence · Simulation</SimEyebrow>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="max-w-xl text-3xl font-semibold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl"
        >
          Pick your weight class.
        </motion.h1>

        <SimPanel tone="soft" delay={0.12} className="px-6 py-5">
          <TypedFeed lines={intro} speed={11} gap={140} />
        </SimPanel>
      </div>

      <div className="mt-10 space-y-5">
        {levels.map((level, index) => {
          const unlocked = index === 0 || completed.includes(levels[index - 1].id);
          return (
            <LevelCard
              key={level.id}
              level={level}
              index={index}
              unlocked={unlocked}
              done={completed.includes(level.id)}
              onStart={() => onStart(level.id)}
              onUnlock={() => onUnlock(level.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function LevelCard({
  level,
  index,
  unlocked,
  done,
  onStart,
  onUnlock,
}: {
  level: Level;
  index: number;
  unlocked: boolean;
  done: boolean;
  onStart: () => void;
  onUnlock: () => void;
}) {
  const runway = runwayMonths(level.start);
  const pressure = runway < 6 ? "risk" : runway < 12 ? "caution" : "brand";

  return (
    <SimPanel delay={0.18 + index * 0.08} className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
        <div className="p-7 sm:p-9">
          <div className="flex flex-wrap items-center gap-3">
            <span className="sim-num text-[13px] font-semibold tracking-[0.1em] text-brand">
              {String(index + 1).padStart(2, "0")}
            </span>
            <SimChip tone={level.difficulty === "Easy" ? "brand" : "caution"}>
              {level.difficulty}
            </SimChip>
            {done && (
              <SimChip tone="brand" solid>
                Completed
              </SimChip>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl">
            {level.name}
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            {level.blurb}
          </p>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-4">
            <Spec label="Company" value={level.company.name} />
            <Spec label="Stage" value={level.company.stage} />
            <Spec label="Opening cash" value={formatMoney(level.start.cash)} />
            <Spec
              label="Decisions"
              value={`${level.quarters.reduce((a, q) => a + q.blocks.length, 0)} logged`}
            />
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            {unlocked ? (
              <SimButton onClick={onStart}>
                {done ? "Run again" : "Begin level"}
                <ArrowRight className="h-3.5 w-3.5" />
              </SimButton>
            ) : (
              <>
                <SimButton disabled>
                  <Lock className="h-3.5 w-3.5" />
                  Locked
                </SimButton>
                <button
                  type="button"
                  onClick={onUnlock}
                  className="text-[13px] text-muted underline decoration-dotted underline-offset-4 transition-colors hover:text-brand"
                >
                  Unlock for preview
                </button>
              </>
            )}
            <p className="text-[13px] text-muted">
              {unlocked
                ? "Quarters run one after another. No skipping."
                : "Clear the previous level to unlock this track."}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 border-t border-border bg-bg-soft px-6 py-8 lg:border-l lg:border-t-0">
          <ArcGauge
            value={Math.min(runway, 24)}
            max={24}
            size={150}
            label="Opening runway"
            readout={formatRunway(runway)}
            tone={pressure}
          />
          <div className="flex w-full items-center gap-1.5">
            {level.quarters.map((q, i) => (
              <span key={q.id} className="flex flex-1 items-center gap-1.5">
                <span className="h-1.5 flex-1 rounded-full bg-brand/25" />
                {i < level.quarters.length - 1 && (
                  <span className="h-1 w-1 rounded-full bg-border" />
                )}
              </span>
            ))}
          </div>
          <p className="sim-eyebrow text-muted">
            {level.quarters.length} sequential quarters
          </p>
        </div>
      </div>
    </SimPanel>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="sim-eyebrow text-muted">{label}</dt>
      <dd className="mt-1.5 text-[14px] font-medium text-brand-ink">{value}</dd>
    </div>
  );
}
