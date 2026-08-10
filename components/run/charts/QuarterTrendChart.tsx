"use client";

import { LineChart as LineChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = { quarter: number; value: number };

/**
 * One measure, one hue, one axis -- cash, revenue, and CEO score each get their own instance of
 * this instead of being crammed onto a shared/dual-axis chart, which reads as two different
 * scales pretending to be comparable.
 */
export function QuarterTrendChart({
  title,
  data,
  formatValue,
  kind = "area",
}: {
  title: string;
  data: TrendPoint[];
  formatValue: (v: number) => string;
  kind?: "area" | "line";
}) {
  const hasData = data.length > 0;

  return (
    <div className="glass-card p-4">
      <p className="eyebrow text-faint">{title}</p>
      <div className="mt-3 h-[140px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            {kind === "area" ? (
              <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`trend-fill-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--teal-bright)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--teal-bright)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="0" />
                <XAxis
                  dataKey="quarter"
                  tickFormatter={(v: number) => `Q${v}`}
                  tick={{ fill: "var(--faint)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--line)" }}
                  tickLine={false}
                />
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Tooltip content={<TrendTooltip formatValue={formatValue} />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--teal-bright)"
                  strokeWidth={2}
                  fill={`url(#trend-fill-${title})`}
                  dot={{ r: 3, fill: "var(--teal-bright)", stroke: "var(--raise)", strokeWidth: 2 }}
                  activeDot={{ r: 4, fill: "var(--teal-bright)", stroke: "var(--raise)", strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="0" />
                <XAxis
                  dataKey="quarter"
                  tickFormatter={(v: number) => `Q${v}`}
                  tick={{ fill: "var(--faint)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--line)" }}
                  tickLine={false}
                />
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Tooltip content={<TrendTooltip formatValue={formatValue} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--teal-bright)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--teal-bright)", stroke: "var(--raise)", strokeWidth: 2 }}
                  activeDot={{ r: 4, fill: "var(--teal-bright)", stroke: "var(--raise)", strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-faint">
            <LineChartIcon className="h-5 w-5 opacity-50" />
            <p className="text-[12px]">No quarters closed yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: { value: number; payload: TrendPoint }[];
  formatValue: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="glass-card-flat px-3 py-2">
      <p className="eyebrow text-faint">Q{point.quarter}</p>
      <p className="num mt-0.5 text-[13px] font-semibold text-ink">
        {formatValue(point.value)}
      </p>
    </div>
  );
}
