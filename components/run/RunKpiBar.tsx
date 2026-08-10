"use client";

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
    <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-b border-line bg-raise/30 px-4 py-2.5 sm:px-6">
      <Kpi label="Cash balance" value={formatInr(cash)} />
      <Kpi label="Revenue" value={formatInr(quarter.revenue)} />
      <Kpi
        label="Allocated this quarter"
        value={
          quarter.allocations
            ? `${formatLakhs(allocatedInr / 100_000)} · ${formatInr(allocatedInr)}`
            : "—"
        }
      />
      <Kpi
        label="Cash remaining"
        value={formatInr(remaining)}
        warn={remaining < 0}
      />
      <div className="ml-auto flex items-center gap-4">
        {lastScore && (
          <Kpi
            label={`CEO score · Q${lastScore.quarter_number}`}
            value={asNumber(lastScore.ceo_score).toFixed(0)}
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
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="leading-tight">
      <p className="eyebrow text-[10px] text-faint">{label}</p>
      <p
        className={`num text-[13px] font-semibold ${warn ? "text-rose" : "text-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}
