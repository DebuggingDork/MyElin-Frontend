"use client";

import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { ArrowRight, LayoutGrid, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";
import {
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  aggregateScores,
  compositeScore,
  percentileFor,
} from "@/lib/simulation/engine";
import type { DimensionKey, Level, Metrics, QuarterResult } from "@/lib/simulation/types";
import { MetricBoard } from "@/components/simulation/MetricHud";
import { Ticker } from "@/components/simulation/Ticker";
import {
  SimBar,
  SimButton,
  SimChip,
  SimEyebrow,
  SimPanel,
} from "@/components/simulation/SimChrome";

const SHORT: Record<DimensionKey, string> = {
  strategy: "Strategy",
  judgment: "Judgment",
  risk: "Risk",
  adaptability: "Adaptability",
  leadership: "Leadership",
  uncertainty: "Uncertainty",
};

export function LevelDebrief({
  level,
  results,
  metrics,
  hasNextLevel,
  onRestart,
  onNextLevel,
  onExit,
}: {
  level: Level;
  results: QuarterResult[];
  metrics: Metrics;
  hasNextLevel: boolean;
  onRestart: () => void;
  onNextLevel: () => void;
  onExit: () => void;
}) {
  const dims = aggregateScores(results);
  const score = compositeScore(dims);
  const percentile = percentileFor(score);

  const radarData = DIMENSION_ORDER.map((key) => ({
    skill: SHORT[key],
    score: dims[key],
  }));

  const ranked = [...DIMENSION_ORDER].sort((a, b) => dims[b] - dims[a]);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-28 pt-12 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <SimChip tone="brand">Decision intelligence report</SimChip>
        <SimChip tone="muted">
          {level.name} · {level.difficulty}
        </SimChip>
      </div>

      <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-[1.06] tracking-tight text-brand-ink sm:text-5xl">
        Four quarters. {results.reduce((a, r) => a + r.lines.length, 0)} consequences.
        One profile.
      </h1>

      <div className="mt-10 grid gap-5 lg:grid-cols-[0.95fr_1.15fr]">
        <SimPanel tone="ink" className="p-8">
          <SimEyebrow className="text-brand-bright">Composite</SimEyebrow>
          <div className="mt-5 flex items-end gap-4">
            <Ticker
              value={score}
              format={(v) => v.toFixed(1)}
              duration={1600}
              className="sim-num text-[68px] font-semibold leading-none text-white"
            />
            <div className="pb-3">
              <p className="sim-eyebrow text-brand-bright">DI Score</p>
              <p className="sim-num mt-1.5 text-[14px] text-white/75">
                {percentile}th percentile
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5 border-t border-white/12 pt-7">
            {DIMENSION_ORDER.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="flex items-baseline justify-between">
                  <p className="text-[13.5px] text-white/85">
                    {DIMENSION_LABELS[key]}
                  </p>
                  <span className="sim-num text-[13px] font-semibold text-brand-bright">
                    {dims[key]}
                  </span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/12">
                  <motion.div
                    className="h-full rounded-full bg-brand-bright"
                    initial={{ width: 0 }}
                    animate={{ width: `${dims[key]}%` }}
                    transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: easeOut }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </SimPanel>

        <SimPanel className="p-7" delay={0.1}>
          <SimEyebrow>Judgment shape</SimEyebrow>
          <div className="mt-2 h-[330px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="74%">
                <PolarGrid stroke="#d4ebe9" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "#4a8a86", fontSize: 11 }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="score"
                  stroke="#08a8a0"
                  strokeWidth={2}
                  fill="#08a8a0"
                  fillOpacity={0.18}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <SimEyebrow tone="muted">Strongest</SimEyebrow>
              <p className="mt-1.5 text-[15px] font-medium text-brand">
                {DIMENSION_LABELS[strongest]}
              </p>
            </div>
            <div>
              <SimEyebrow tone="muted">Needs work</SimEyebrow>
              <p className="mt-1.5 text-[15px] font-medium text-[var(--sim-caution)]">
                {DIMENSION_LABELS[weakest]}
              </p>
            </div>
          </div>
        </SimPanel>
      </div>

      <div className="mt-12">
        <SimEyebrow>Quarter by quarter</SimEyebrow>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((result, i) => {
            const quarterScore = compositeScore(result.scores);
            return (
              <motion.div
                key={result.quarterId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: easeOut }}
                className="relative rounded-2xl border border-border bg-white p-6"
              >
                <span className="absolute left-0 top-6 h-8 w-[3px] rounded-r bg-brand" />
                <div className="flex items-baseline justify-between">
                  <SimEyebrow tone="muted">
                    {level.quarters[i]?.label ?? `Quarter ${i + 1}`}
                  </SimEyebrow>
                  <span className="sim-num text-[26px] font-semibold leading-none text-brand">
                    {result.grade}
                  </span>
                </div>
                <p className="mt-3.5 text-[13.5px] leading-relaxed text-muted">
                  {level.quarters[i]?.headline}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <SimBar
                    value={quarterScore}
                    tone={
                      quarterScore < 40
                        ? "risk"
                        : quarterScore < 60
                          ? "caution"
                          : "brand"
                    }
                  />
                  <span className="sim-num shrink-0 text-[12px] text-muted">
                    {quarterScore.toFixed(0)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-12">
        <SimEyebrow>Closing position</SimEyebrow>
        <MetricBoard metrics={metrics} className="mt-5" />
      </div>

      <SimPanel tone="soft" className="mt-12 p-8" delay={0.1}>
        <SimEyebrow>What this report says about you</SimEyebrow>
        <p className="mt-5 max-w-3xl text-lg leading-[1.75] text-brand-ink">
          Across four quarters you leaned on{" "}
          <span className="font-medium text-brand">
            {DIMENSION_LABELS[strongest].toLowerCase()}
          </span>{" "}
          and under-used{" "}
          <span className="font-medium text-[var(--sim-caution)]">
            {DIMENSION_LABELS[weakest].toLowerCase()}
          </span>
          . The decisions that moved your score most were the ones where you had the
          least information — which is exactly where judgment gets measured.
        </p>
      </SimPanel>

      <div className={cn("mt-10 flex flex-wrap items-center gap-3")}>
        {hasNextLevel && (
          <SimButton onClick={onNextLevel}>
            Enter the hard track
            <ArrowRight className="h-3.5 w-3.5" />
          </SimButton>
        )}
        <SimButton variant="secondary" onClick={onRestart}>
          <RotateCcw className="h-3.5 w-3.5" />
          Run again
        </SimButton>
        <SimButton variant="secondary" onClick={onExit}>
          <LayoutGrid className="h-3.5 w-3.5" />
          All levels
        </SimButton>
      </div>
    </div>
  );
}
