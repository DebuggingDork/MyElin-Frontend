"use client";

import { useMemo } from "react";
import { DEPARTMENTS, asNumber, formatInr, formatLakhs } from "@/lib/api/catalog";
import { useRun } from "@/components/run/RunProvider";
import { QuarterTrendChart, type TrendPoint } from "@/components/run/charts/QuarterTrendChart";
import { DepartmentSpendChart, type DeptSpendPoint } from "@/components/run/charts/DepartmentSpendChart";

/** Three real-data charts for the hub: cash and revenue across the quarters played so far, CEO
 *  score across the quarters scored so far, and the open quarter's spend split by department.
 *  Nothing here is placeholder data -- each chart renders "no data yet" rather than a fake
 *  series when a fresh run hasn't produced any. */
export function DashboardCharts() {
  const { company, run, quarter } = useRun();

  const cashSeries: TrendPoint[] = useMemo(
    () =>
      (company?.quarters ?? [])
        .slice()
        .sort((a, b) => a.number - b.number)
        .map((q) => ({ quarter: q.number, value: asNumber(q.cash_balance) })),
    [company],
  );

  const revenueSeries: TrendPoint[] = useMemo(
    () =>
      (company?.quarters ?? [])
        .slice()
        .sort((a, b) => a.number - b.number)
        .map((q) => ({ quarter: q.number, value: asNumber(q.revenue) })),
    [company],
  );

  const scoreSeries: TrendPoint[] = useMemo(
    () =>
      (run?.score_trajectory ?? [])
        .slice()
        .sort((a, b) => a.quarter_number - b.quarter_number)
        .map((s) => ({ quarter: s.quarter_number, value: asNumber(s.ceo_score) })),
    [run],
  );

  const deptSpend: DeptSpendPoint[] = useMemo(
    () =>
      DEPARTMENTS.map((d) => ({
        id: d.id,
        name: d.name,
        lakhs: d.fields.reduce(
          (sum, f) => sum + asNumber(quarter?.allocations?.[f.key]),
          0,
        ),
      })),
    [quarter],
  );

  if (!company) return null;

  return (
    <div className="space-y-4">
      <p className="eyebrow text-faint">Company trajectory</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <QuarterTrendChart title="Cash balance by quarter" data={cashSeries} formatValue={formatInr} />
        <QuarterTrendChart title="Revenue by quarter" data={revenueSeries} formatValue={formatInr} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <QuarterTrendChart
          title="CEO score by quarter"
          data={scoreSeries}
          formatValue={(v) => v.toFixed(0)}
          kind="line"
        />
        <DepartmentSpendChart data={deptSpend} formatValue={formatLakhs} />
      </div>
    </div>
  );
}
