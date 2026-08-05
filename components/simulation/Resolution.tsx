"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";
import type { Quarter, QuarterResult } from "@/lib/simulation/types";
import { TypedFeed } from "@/components/simulation/Typewriter";
import {
  SimButton,
  SimChip,
  SimEyebrow,
  SimPanel,
  type Tone,
} from "@/components/simulation/SimChrome";

const STEPS = [
  "Committing decisions to the model",
  "Propagating spend across departments",
  "Advancing the market clock by three months",
  "Resolving stakeholder reactions",
  "Maturing delayed consequences",
];

const lineTone: Record<string, Tone> = {
  ok: "brand",
  warn: "caution",
  bad: "risk",
  info: "muted",
};

export function Resolution({
  quarter,
  result,
  onDone,
}: {
  quarter: Quarter;
  result: QuarterResult;
  onDone: () => void;
}) {
  const [stage, setStage] = useState<"running" | "consequences" | "hidden" | "ready">(
    "running",
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (stage !== "running") return;
    const id = window.setInterval(() => setTick((t) => t + 1), 420);
    return () => window.clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (stage === "running" && tick > STEPS.length) setStage("consequences");
  }, [tick, stage]);

  const progress = Math.min(1, tick / STEPS.length);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-14 sm:px-8">
      <SimChip tone="caution" className="w-fit">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--sim-caution)] sim-live" />
        Resolving {quarter.label}
      </SimChip>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-brand-ink sm:text-[2.5rem]">
        The quarter runs.
      </h1>

      <SimPanel tone="soft" delay={0.1} className="mt-8 px-6 py-6">
        <div className="relative space-y-4">
          <span className="absolute bottom-2 left-[11px] top-2 w-px bg-border" />
          <motion.span
            className="absolute left-[11px] top-2 w-px bg-brand"
            animate={{ height: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: easeOut }}
          />
          {STEPS.map((label, i) => {
            const done = tick > i;
            const active = tick === i;
            return (
              <div key={label} className="relative flex items-center gap-4">
                <span
                  className={cn(
                    "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    done
                      ? "border-transparent bg-brand text-white"
                      : active
                        ? "border-brand bg-white"
                        : "border-border bg-white",
                  )}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        active ? "bg-brand sim-live" : "bg-border",
                      )}
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[14.5px] transition-colors",
                    done
                      ? "text-brand-deep"
                      : active
                        ? "font-medium text-brand-ink"
                        : "text-muted/60",
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </SimPanel>

      {stage !== "running" && (
        <SimPanel delay={0.05} className="mt-5 p-7">
          <SimEyebrow>Consequences</SimEyebrow>
          <div className="mt-5">
            <TypedFeed
              lines={result.lines.map((l) => ({
                text: l.text,
                tone: lineTone[l.tone] ?? "muted",
              }))}
              speed={8}
              gap={210}
              onDone={() => setStage("hidden")}
            />
          </div>
        </SimPanel>
      )}

      {(stage === "hidden" || stage === "ready") && (
        <SimPanel tone="ink" delay={0.05} className="mt-5 p-7">
          <p className="sim-eyebrow flex items-center gap-2 text-brand-bright">
            <Unlock className="h-3.5 w-3.5" />
            Sealed variables opened
          </p>
          <ul className="mt-5 space-y-3.5">
            {quarter.hidden.map((text, i) => (
              <HiddenLine
                key={text}
                text={text}
                index={i}
                total={quarter.hidden.length}
                onAllDone={() => setStage("ready")}
              />
            ))}
          </ul>
        </SimPanel>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: stage === "ready" ? 1 : 0,
          y: stage === "ready" ? 0 : 10,
        }}
        transition={{ duration: 0.4 }}
        className="mt-9"
      >
        <SimButton onClick={onDone} disabled={stage !== "ready"}>
          Read the quarter report
          <ArrowRight className="h-3.5 w-3.5" />
        </SimButton>
      </motion.div>
    </div>
  );
}

function HiddenLine({
  text,
  index,
  total,
  onAllDone,
}: {
  text: string;
  index: number;
  total: number;
  onAllDone: () => void;
}) {
  useEffect(() => {
    if (index !== total - 1) return;
    const id = window.setTimeout(onAllDone, 900 + text.length * 9);
    return () => window.clearTimeout(id);
  }, [index, total, text.length, onAllDone]);

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.2 + index * 0.35, ease: easeOut }}
      className="flex gap-3.5 text-[15px] leading-relaxed text-white/85"
    >
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-bright" />
      {text}
    </motion.li>
  );
}
