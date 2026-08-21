"use client";

/**
 * The charts a closed quarter is read through.
 *
 * Laid out as one dashboard rather than a stack of loose plots: a primary row of the two
 * figures the whole run is judged on, then a secondary row of the three that explain them.
 * Every card is the same component with the same header height, the same plot height, the same
 * axis widths and the same margins, so a row of them lines up on every breakpoint instead of
 * each chart sizing itself to its own labels.
 *
 * Alignment is structural, not eyeballed:
 *   - one grid per row owns the gaps, so the spacing between any two cards is identical;
 *   - `items-stretch` plus a `flex-1` body makes every card in a row end on the same line even
 *     when one title wraps and another does not;
 *   - the y-axis has a fixed width, so the plot areas start at the same x offset and the axis
 *     labels cannot collide with the bars;
 *   - the legend is rendered as a plain row under the header, never recharts' floating one,
 *     which is what used to overlap the top of the plot on a narrow card.
 *
 * Nothing here computes a simulation number. Every series reads a field the engine already
 * returned on `QuarterResultShape`.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BUFFER } from "@/lib/simulation/constants";
import { cr, inr, n1, pct } from "@/lib/simulation/format";
import type { QuarterResultShape } from "@/lib/simulation/types";
import {
  CHART_AXIS,
  CHART_FALL,
  CHART_GRID,
  CHART_RISE,
  Eyebrow,
  Panel,
} from "@/components/simulation/Kit";

const v = (r: QuarterResultShape, k: string) => r[k] as number;

/* ── one geometry for every card ──────────────────────────────────────
   These are the numbers that make the row line up. They are constants rather than per-chart
   choices precisely so no single chart can drift out of the grid. */

/** Plot height. One value for every card in every row. */
const PLOT_H = "h-52";
/** Header min-height, sized for a two-line title so a wrapping title moves nothing. */
const HEAD_H = "min-h-[74px]";
/** Fixed y-axis gutter: the plot areas start at the same offset, and a long tick label has
 *  somewhere to go other than on top of the first bar. */
const AXIS_W = 62;
/** Right margin leaves room for the last x tick; bottom is 0 because XAxis owns its own band. */
const MARGIN = { top: 8, right: 12, left: 0, bottom: 0 };

type Point = { q: string } & Record<string, number | string>;

/**
 * A chart in its card.
 *
 * `stretch` is what the grid needs: the card fills its cell and the plot takes the leftover
 * height, so two cards side by side share a bottom edge.
 */
function ChartCard({
  eyebrow,
  title,
  legend,
  children,
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  /** Rendered under the header, in flow. Never a floating overlay on the plot. */
  legend?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel
      eyebrow={eyebrow}
      title={title}
      className={"flex h-full flex-col " + className}
      headerClassName={HEAD_H + " items-start content-start"}
      bodyClassName="flex flex-1 flex-col gap-2"
    >
      {legend && <div className="flex flex-wrap items-center gap-3">{legend}</div>}
      <div className={PLOT_H + " w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function LegendKey({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-dim">
      <span className="h-2 w-2 rounded-full" style={{ background: colour }} />
      {label}
    </span>
  );
}

const tooltipStyle = {
  fontFamily: "monospace",
  fontSize: 12,
  borderColor: CHART_GRID,
  background: "var(--raise)",
  color: "var(--text)",
};

/** Rising or falling over the window, which is what decides the card's colour -- the same rule
 *  `Sparkline` and the valuation chart already use, so a green line means the same thing
 *  everywhere on the screen. */
function tone(series: number[]): string {
  if (series.length < 2) return CHART_RISE;
  return series[series.length - 1] >= series[0] ? CHART_RISE : CHART_FALL;
}

function AreaSeries({
  data,
  dataKey,
  gradientId,
  colour,
  format,
  tickFormat = format,
  label,
  children,
}: {
  data: Point[];
  dataKey: string;
  gradientId: string;
  colour: string;
  /** The exact figure, for the tooltip. */
  format: (n: number) => string;
  /** The short figure, for the axis. Defaults to `format` where that already fits. */
  tickFormat?: (n: number) => string;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <AreaChart data={data} margin={MARGIN}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colour} stopOpacity={0.28} />
          <stop offset="100%" stopColor={colour} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke={CHART_GRID} strokeDasharray="2 4" />
      <XAxis dataKey="q" stroke={CHART_AXIS} fontSize={12} tickLine={false} />
      <YAxis
        stroke={CHART_AXIS}
        fontSize={11}
        width={AXIS_W}
        tickLine={false}
        tickFormatter={tickFormat}
      />
      <Tooltip
        contentStyle={tooltipStyle}
        formatter={(val: unknown) => [format(Number(val)), label]}
      />
      {children}
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={colour}
        strokeWidth={2}
        fill={`url(#${gradientId})`}
        dot={{ r: 3, fill: colour, strokeWidth: 0 }}
        activeDot={{ r: 5 }}
      />
    </AreaChart>
  );
}

function LineSeries({
  data,
  dataKey,
  colour,
  format,
  label,
}: {
  data: Point[];
  dataKey: string;
  colour: string;
  format: (n: number) => string;
  label: string;
}) {
  return (
    <LineChart data={data} margin={MARGIN}>
      <CartesianGrid stroke={CHART_GRID} strokeDasharray="2 4" />
      <XAxis dataKey="q" stroke={CHART_AXIS} fontSize={12} tickLine={false} />
      <YAxis
        stroke={CHART_AXIS}
        fontSize={11}
        width={AXIS_W}
        tickLine={false}
        tickFormatter={format}
      />
      <Tooltip
        contentStyle={tooltipStyle}
        formatter={(val: unknown) => [format(Number(val)), label]}
      />
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={colour}
        strokeWidth={2}
        dot={{ r: 3, fill: colour, strokeWidth: 0 }}
        activeDot={{ r: 5 }}
      />
    </LineChart>
  );
}

/**
 * Every closed quarter so far, plotted. `history` is oldest-first and ends at the quarter just
 * closed -- the same array the headline figures above are read from.
 */
export function QuarterCharts({ history }: { history: QuarterResultShape[] }) {
  const data: Point[] = history.map((h) => ({
    q: "Q" + h.q,
    valuation: v(h, "valuation"),
    revenue: v(h, "revenueT"),
    cash: v(h, "cash"),
    share: v(h, "marketShare") * 100,
    margin: v(h, "revenueT") > 0 ? (v(h, "grossProfit") / v(h, "revenueT")) * 100 : 0,
  }));

  const series = (key: keyof Point) => data.map((d) => d[key] as number);

  // One closed quarter is a point, not a trajectory. Say so rather than drawing five cards
  // each holding a single dot, or leaving a hole where the section will be from Q2 onwards.
  if (data.length < 2) {
    return (
      <section className="space-y-2">
        <Eyebrow tone="text-tone-bad">Trajectory</Eyebrow>
        <p className="border border-line bg-raise px-4 py-3 text-sm text-dim">
          One quarter is a single reading. From quarter two, this is where valuation, revenue,
          cash, share and margin are plotted against each other.
        </p>
      </section>
    );
  }

  const valuationTone = tone(series("valuation"));
  const revenueTone = tone(series("revenue"));
  const cashTone = tone(series("cash"));
  const shareTone = tone(series("share"));
  const marginTone = tone(series("margin"));

  const opening = data[0];
  const latest = data[data.length - 1];

  return (
    <section className="space-y-4">
      <div>
        <Eyebrow tone="text-tone-bad">Trajectory</Eyebrow>
        <h3 className="font-serif text-xl text-ink">
          Where the company has moved, quarter by quarter
        </h3>
      </div>

      {/* Primary: the two figures the run is judged on. */}
      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        <ChartCard
          eyebrow="Valuation"
          title={`Q1 ${cr(opening.valuation as number)} → ${latest.q} ${cr(latest.valuation as number)}`}
          legend={<LegendKey colour={valuationTone} label="Enterprise valuation" />}
        >
          <AreaSeries
            data={data}
            dataKey="valuation"
            gradientId="chartValuation"
            colour={valuationTone}
            format={cr}
            label="Valuation"
          />
        </ChartCard>

        <ChartCard
          eyebrow="Revenue"
          title={`Q1 ${cr(opening.revenue as number)} → ${latest.q} ${cr(latest.revenue as number)}`}
          legend={<LegendKey colour={revenueTone} label="Revenue booked in the quarter" />}
        >
          <AreaSeries
            data={data}
            dataKey="revenue"
            gradientId="chartRevenue"
            colour={revenueTone}
            format={cr}
            label="Revenue"
          />
        </ChartCard>
      </div>

      {/* Secondary: the three that explain the two above. The last card spans both columns at
          the two-up breakpoint so the row never ends on a half-empty line. */}
      <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard
          eyebrow="Cash"
          title={`Closing ${inr(latest.cash as number)}`}
          legend={
            <>
              <LegendKey colour={cashTone} label="Closing cash" />
              <LegendKey colour={CHART_FALL} label={`Board buffer ${inr(BUFFER)}`} />
            </>
          }
        >
          <AreaSeries
            data={data}
            dataKey="cash"
            gradientId="chartCash"
            colour={cashTone}
            format={inr}
            tickFormat={cr}
            label="Cash"
          >
            {/* The one line on these charts that is not a series: the level below which the
                board calls the run distressed. */}
            <ReferenceLine y={BUFFER} stroke={CHART_FALL} strokeDasharray="4 4" />
          </AreaSeries>
        </ChartCard>

        <ChartCard
          eyebrow="Market share"
          title={`${pct(latest.share as number)} of the category`}
          legend={<LegendKey colour={shareTone} label="Share of category units" />}
        >
          <LineSeries
            data={data}
            dataKey="share"
            colour={shareTone}
            format={(n) => n1(n) + "%"}
            label="Market share"
          />
        </ChartCard>

        <ChartCard
          eyebrow="Gross margin"
          title={`${pct(latest.margin as number)} on revenue`}
          legend={<LegendKey colour={marginTone} label="Gross profit ÷ revenue" />}
          className="md:col-span-2 xl:col-span-1"
        >
          <LineSeries
            data={data}
            dataKey="margin"
            colour={marginTone}
            format={(n) => n1(n) + "%"}
            label="Gross margin"
          />
        </ChartCard>
      </div>
    </section>
  );
}
