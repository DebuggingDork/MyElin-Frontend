"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DeptSpendPoint = { id: string; name: string; lakhs: number };

/**
 * One measure (spend) across six named departments -- a nominal category, not an identity
 * comparison, so every bar takes the same hue and the label does the identity work instead of a
 * six-color legend. Sorted descending: rank is the first thing a bar chart should make readable.
 */
export function DepartmentSpendChart({
  data,
  formatValue,
}: {
  data: DeptSpendPoint[];
  formatValue: (lakhs: number) => string;
}) {
  const sorted = [...data].sort((a, b) => b.lakhs - a.lakhs);
  const hasSpend = sorted.some((d) => d.lakhs > 0);

  return (
    <div className="rounded-xl border border-line bg-raise/40 p-4">
      <p className="eyebrow text-faint">This quarter&apos;s spend by department</p>
      <div className="mt-3" style={{ height: sorted.length * 34 + 16 }}>
        {hasSpend ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 4, right: 42, bottom: 4, left: 4 }}
              barCategoryGap={10}
            >
              <CartesianGrid horizontal={false} stroke="var(--line)" />
              <XAxis type="number" hide domain={[0, "dataMax"]} />
              <YAxis
                type="category"
                dataKey="name"
                width={104}
                tick={{ fill: "var(--dim)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--panel-2)" }}
                content={<SpendTooltip formatValue={formatValue} />}
              />
              <Bar dataKey="lakhs" radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive={false}>
                {sorted.map((d) => (
                  <Cell key={d.id} fill="var(--teal-bright)" />
                ))}
                <LabelList
                  dataKey="lakhs"
                  position="right"
                  formatter={(v: unknown) => formatValue(Number(v))}
                  fill="var(--faint)"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-faint">
            Nothing allocated yet this quarter
          </div>
        )}
      </div>
    </div>
  );
}

function SpendTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: { payload: DeptSpendPoint }[];
  formatValue: (lakhs: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-raise px-3 py-2 shadow-[var(--shadow-lift)]">
      <p className="eyebrow text-faint">{point.name}</p>
      <p className="num mt-0.5 text-[13px] font-semibold text-ink">
        {formatValue(point.lakhs)}
      </p>
    </div>
  );
}
