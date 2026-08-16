"use client";

import { Wallet, TrendingUp, PieChart, Gauge, Award } from "lucide-react";
import { asNumber, formatInr, formatLakhs } from "@/lib/api/catalog";
import { Pill } from "@/components/ui/Kit";
import { useRun } from "@/components/run/RunProvider";

/**
 * The one KPI surface every run screen shares -- rendered once by `RunShell` so cash, revenue,
 * and score stay visible whether the CEO is on the hub, a department page, or the report. Reads
 * only from `RunProvider` state that's already being fetched; no extra requests.
 */
export function RunKpiBar() {
  const { run, quarter } = useRun();

  if (!run || !quarter) return null;

  const cash = asNumber(quarter.cash_balance);
  const allocatedInr =
    Object.values(quarter.allocations ?? {}).reduce<number>(
      (sum, v) => sum + asNumber(v),
      0,
    ) * 100_000;
  const remaining = cash - allocatedInr;
  const lastScore = run.score_trajectory?.at(-1);

  return (
    <div className="glass-strip flex shrink-0 flex-wrap items-center gap-x-7 gap-y-2 border-b border-line px-4 py-2.5 sm:px-6 lg:px-8">
      <Kpi icon={Wallet} label="Cash balance" value={formatInr(cash)} accent="teal" />
      <Kpi icon={TrendingUp} label="Revenue" value={formatInr(quarter.revenue)} accent="cyan" />
      <Kpi
        icon={PieChart}
        label="Allocated this quarter"
        value={
          quarter.allocations
            ? `${formatLakhs(allocatedInr / 100_000)} · ${formatInr(allocatedInr)}`
            : "—"
        }
        accent="violet"
      />
      <Kpi
        icon={Gauge}
        label="Cash remaining"
        value={formatInr(remaining)}
        accent={remaining < 0 ? "rose" : "emerald"}
        warn={remaining < 0}
      />
      <div className="ml-auto flex items-center gap-4">
        {lastScore && (
          <Kpi
            icon={Award}
            label={`CEO score · Q${lastScore.quarter_number}`}
            value={asNumber(lastScore.ceo_score).toFixed(0)}
            accent="amber"
          />
        )}
        <Pill
          accent={
            run.run_status === "failed"
              ? "rose"
              : run.run_status === "distressed"
                ? "amber"
                : run.run_status === "completed"
                  ? "emerald"
                  : "cyan"
          }
        >
          {run.run_status}
        </Pill>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent = "teal",
  warn,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: "teal" | "cyan" | "violet" | "emerald" | "rose" | "amber";
  warn?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{
          background: `color-mix(in srgb, var(--${accent}) 14%, transparent)`,
          color: `var(--${accent})`,
        }}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="leading-tight">
        <p className="eyebrow text-[10px] text-faint">{label}</p>
        <p
          className={`num text-[13px] font-semibold ${warn ? "text-rose" : "text-ink"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
