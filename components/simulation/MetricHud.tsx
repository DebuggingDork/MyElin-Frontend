"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";
import { runwayMonths } from "@/lib/simulation/engine";
import {
  formatCount,
  formatDelta,
  formatMoney,
  formatPercent,
  formatRunway,
  isGoodDelta,
} from "@/lib/simulation/format";
import type { MetricKey, Metrics } from "@/lib/simulation/types";
import { Ticker } from "@/components/simulation/Ticker";
import {
  ArcGauge,
  RingGauge,
  SimBar,
  SimEyebrow,
  SimPanel,
} from "@/components/simulation/SimChrome";

const SEGMENTS = 12;
const MONTHS_PER_SEGMENT = 2;

/** Runway as a fuel strip — twelve segments, two months each. */
function RunwayStrip({ months }: { months: number }) {
  const filled = Math.max(0, Math.min(SEGMENTS, months / MONTHS_PER_SEGMENT));
  const tight = months < 6;

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <Ticker
          value={Math.min(months, 99)}
          format={formatRunway}
          className={cn(
            "sim-num text-[19px] font-semibold",
            tight ? "text-[var(--sim-risk)]" : "text-brand-ink",
          )}
        />
        <span className="sim-eyebrow text-muted">runway</span>
      </div>
      <div className="mt-2 flex gap-[3px]">
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, filled - i));
          return (
            <span
              key={i}
              className="relative h-3 flex-1 overflow-hidden rounded-[2px] bg-brand-ink/8"
            >
              <motion.span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-[2px]",
                  tight && i < 3 ? "bg-[var(--sim-risk)]" : "bg-brand",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${fill * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.03, ease: easeOut }}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}

type Cell = {
  key: MetricKey;
  label: string;
  format: (v: number) => string;
};

const CELLS: Cell[] = [
  { key: "cash", label: "Cash", format: formatMoney },
  { key: "revenue", label: "Revenue / mo", format: formatMoney },
  { key: "burn", label: "Burn / mo", format: formatMoney },
  { key: "customers", label: "Customers", format: formatCount },
  { key: "employees", label: "Headcount", format: formatCount },
];

/** Sticky readout that stays live through every phase of a quarter. */
export function MetricHud({
  metrics,
  previous,
  className,
}: {
  metrics: Metrics;
  previous?: Metrics;
  className?: string;
}) {
  const runway = runwayMonths(metrics);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-white/85 px-4 py-3.5 backdrop-blur-sm lg:flex-row lg:items-center lg:gap-6",
        className,
      )}
    >
      <div className="w-full shrink-0 lg:w-[190px]">
        <RunwayStrip months={runway} />
      </div>

      <div className="hidden h-12 w-px shrink-0 bg-border lg:block" />

      <div className="grid flex-1 grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {CELLS.map((cell) => {
          const delta = previous
            ? Math.round((metrics[cell.key] - previous[cell.key]) * 10) / 10
            : 0;
          const good = isGoodDelta(cell.key, delta);
          return (
            <div key={cell.key} className="min-w-0">
              <SimEyebrow tone="muted" className="truncate">
                {cell.label}
              </SimEyebrow>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <Ticker
                  value={metrics[cell.key]}
                  format={cell.format}
                  className="sim-num text-[17px] font-semibold text-brand-ink"
                />
                <AnimatePresence>
                  {delta !== 0 && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "sim-num flex items-center gap-0.5 text-[11px] font-medium",
                        good ? "text-brand" : "text-[var(--sim-risk)]",
                      )}
                    >
                      {delta > 0 ? (
                        <ArrowUp className="h-2.5 w-2.5" />
                      ) : (
                        <ArrowDown className="h-2.5 w-2.5" />
                      )}
                      {formatDelta(cell.key, delta).replace(/^[+-]/, "")}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-5 border-t border-border pt-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <RingGauge
          value={metrics.morale}
          label="morale"
          size={52}
          tone={metrics.morale < 45 ? "risk" : metrics.morale < 62 ? "caution" : "brand"}
        />
        <RingGauge
          value={metrics.trust}
          label="trust"
          size={52}
          tone={metrics.trust < 45 ? "risk" : metrics.trust < 62 ? "caution" : "brand"}
        />
      </div>
    </div>
  );
}

/** Feature layout used when the position itself is the subject. */
export function MetricBoard({
  metrics,
  className,
}: {
  metrics: Metrics;
  className?: string;
}) {
  const runway = runwayMonths(metrics);
  const tiles: { key: MetricKey; label: string; format: (v: number) => string }[] = [
    { key: "cash", label: "Cash in bank", format: formatMoney },
    { key: "revenue", label: "Revenue / mo", format: formatMoney },
    { key: "burn", label: "Burn / mo", format: formatMoney },
    { key: "customers", label: "Customers", format: formatCount },
    { key: "employees", label: "Headcount", format: formatCount },
    { key: "share", label: "Market share", format: formatPercent },
  ];

  return (
    <div className={cn("grid gap-4 lg:grid-cols-[300px_1fr]", className)}>
      <SimPanel tone="soft" className="flex flex-col items-center justify-center px-6 py-7">
        <ArcGauge
          value={Math.min(runway, 24)}
          max={24}
          label="Runway · 24 month scale"
          readout={formatRunway(runway)}
          tone={runway < 6 ? "risk" : runway < 12 ? "caution" : "brand"}
        />
        <div className="mt-6 grid w-full grid-cols-2 gap-4 border-t border-border pt-5">
          <RingGauge
            value={metrics.morale}
            label="morale"
            size={56}
            tone={metrics.morale < 45 ? "risk" : metrics.morale < 62 ? "caution" : "brand"}
          />
          <RingGauge
            value={metrics.trust}
            label="trust"
            size={56}
            tone={metrics.trust < 45 ? "risk" : metrics.trust < 62 ? "caution" : "brand"}
          />
        </div>
      </SimPanel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: easeOut }}
            className="rounded-2xl border border-border bg-white px-5 py-4"
          >
            <SimEyebrow tone="muted">{tile.label}</SimEyebrow>
            <Ticker
              value={metrics[tile.key]}
              format={tile.format}
              duration={1300}
              className="sim-num mt-2 block text-[26px] font-semibold text-brand-ink"
            />
            {tile.key === "share" && (
              <SimBar value={metrics.share} className="mt-3" tone="brand" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
