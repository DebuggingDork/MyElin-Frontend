"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";
import {
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  METRIC_LABELS,
  compositeScore,
  runwayMonths,
} from "@/lib/simulation/engine";
import {
  formatDelta,
  formatMetric,
  formatRunway,
  isGoodDelta,
} from "@/lib/simulation/format";
import type { MetricKey, Quarter, QuarterResult } from "@/lib/simulation/types";
import { Ticker } from "@/components/simulation/Ticker";
import {
  ShiftBar,
  SimBar,
  SimButton,
  SimChip,
  SimEyebrow,
  SimPanel,
} from "@/components/simulation/SimChrome";

export function QuarterReport({
  quarter,
  result,
  isLast,
  onNext,
}: {
  quarter: Quarter;
  result: QuarterResult;
  isLast: boolean;
  onNext: () => void;
}) {
  const dims = result.scores;
  const composite = compositeScore(dims);
  const deltaKeys = Object.keys(result.delta) as MetricKey[];
  const runway = runwayMonths(result.after);

  // Scale every movement against the largest one so the bars stay comparable.
  const widest = Math.max(
    1,
    ...deltaKeys.map((k) =>
      Math.abs((result.delta[k] ?? 0) / Math.max(1, Math.abs(result.before[k]) || 1)),
    ),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-28 pt-12 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <SimChip tone="brand">Quarter report</SimChip>
        <SimChip tone="muted">{quarter.label}</SimChip>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_auto] lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold leading-[1.08] tracking-tight text-brand-ink sm:text-[2.6rem]">
            {quarter.headline}
          </h1>
          <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-muted">
            Outcome alone is luck. What follows grades the process — the trade-offs,
            the read of risk, the honesty of your confidence.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="flex items-center gap-7 rounded-[1.5rem] bg-brand-ink px-7 py-6 text-white"
        >
          <div>
            <p className="sim-eyebrow text-brand-bright">Grade</p>
            <p className="sim-num mt-1.5 text-[44px] font-semibold leading-none">
              {result.grade}
            </p>
          </div>
          <div className="h-12 w-px bg-white/15" />
          <div>
            <p className="sim-eyebrow text-brand-bright">DI this quarter</p>
            <Ticker
              value={composite}
              format={(v) => v.toFixed(1)}
              duration={1300}
              className="sim-num mt-1.5 block text-[44px] font-semibold leading-none"
            />
          </div>
        </motion.div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <SimPanel className="p-7">
          <div className="flex items-center justify-between">
            <SimEyebrow>Metric movement</SimEyebrow>
            <span className="text-[13px] text-muted">
              runway{" "}
              <span
                className={cn(
                  "sim-num font-semibold",
                  runway < 6 ? "text-[var(--sim-risk)]" : "text-brand-deep",
                )}
              >
                {formatRunway(runway)}
              </span>
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {deltaKeys.length === 0 && (
              <p className="text-[14px] text-muted">
                Nothing moved. In a company this size, that is its own result.
              </p>
            )}
            {deltaKeys.map((key, i) => {
              const diff = result.delta[key] ?? 0;
              const good = isGoodDelta(key, diff);
              const magnitude =
                Math.abs(diff / Math.max(1, Math.abs(result.before[key]) || 1)) /
                widest;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="sim-eyebrow text-muted">{METRIC_LABELS[key]}</p>
                    <p className="flex items-baseline gap-2.5">
                      <span className="sim-num text-[13px] text-muted/70">
                        {formatMetric(key, result.before[key])}
                      </span>
                      <ArrowRight className="h-3 w-3 shrink-0 self-center text-border" />
                      <span className="sim-num text-[16px] font-semibold text-brand-ink">
                        {formatMetric(key, result.after[key])}
                      </span>
                      <span
                        className={cn(
                          "sim-num w-[86px] text-right text-[13px] font-medium",
                          good ? "text-brand" : "text-[var(--sim-risk)]",
                        )}
                      >
                        {formatDelta(key, diff)}
                      </span>
                    </p>
                  </div>
                  <ShiftBar
                    magnitude={magnitude}
                    positive={good}
                    className="mt-2.5"
                  />
                </motion.div>
              );
            })}
          </div>
        </SimPanel>

        <SimPanel tone="soft" className="p-7" delay={0.1}>
          <SimEyebrow>Cognitive telemetry</SimEyebrow>
          <div className="mt-6 space-y-5">
            {DIMENSION_ORDER.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.12 + i * 0.06 }}
              >
                <div className="flex items-baseline justify-between">
                  <p className="text-[13.5px] text-brand-ink">
                    {DIMENSION_LABELS[key]}
                  </p>
                  <span className="sim-num text-[13px] font-semibold text-brand-deep">
                    {dims[key]}
                  </span>
                </div>
                <SimBar
                  value={dims[key]}
                  tone={dims[key] < 40 ? "risk" : dims[key] < 60 ? "caution" : "brand"}
                  className="mt-2"
                />
              </motion.div>
            ))}
          </div>
        </SimPanel>
      </div>

      {result.delayed.length > 0 && (
        <SimPanel className="mt-5 p-7" delay={0.14}>
          <p className="sim-eyebrow flex items-center gap-2 text-[var(--sim-caution)]">
            <Clock className="h-3.5 w-3.5" />
            Queued for a later quarter
          </p>
          <ul className="mt-5 space-y-3">
            {result.delayed.map((line) => (
              <li
                key={line}
                className="flex gap-3.5 text-[14.5px] leading-relaxed text-brand-deep"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sim-caution)]" />
                {line}
              </li>
            ))}
          </ul>
        </SimPanel>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <SimButton onClick={onNext}>
          {isLast ? "Generate the DI report" : "Advance to the next quarter"}
          <ArrowRight className="h-3.5 w-3.5" />
        </SimButton>
        <p className="text-[13px] text-muted">
          {isLast
            ? "Four quarters logged. Your report is composed from all of them."
            : "Consequences carry forward. So does your cash."}
        </p>
      </div>
    </div>
  );
}
