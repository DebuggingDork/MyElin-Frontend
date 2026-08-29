"use client";

/** The company tab: headline figures, live constraint, readiness, inbox, market share chart. */

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BUFFER, PRIORITY_BY_ID, QUARTER_BRIEFS, estimateAddressableDemand } from "@/lib/simulation/constants";
import { cr, inr, n0, n1, pct } from "@/lib/simulation/format";
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_RISE,
  CHART_FALL,
  Eyebrow,
  HealthPanel,
  Inbox,
  LedgerRow,
  Panel,
  ReadinessGrid,
  Stat,
  TeachingNote,
  TrendStat,
} from "@/components/simulation/Kit";
import type {
  Budget,
  CompanyState,
  Constraint,
  HealthBar,
  InboxMessage,
  PriorityId,
  QuarterResultShape,
  Readiness,
} from "@/lib/simulation/types";

const v = (r: QuarterResultShape, k: string) => r[k] as number;

export function DashboardScreen({
  s,
  history,
  health,
  constraint,
  dirs,
  inbox,
  priority,
  budget,
}: {
  s: CompanyState;
  history: QuarterResultShape[];
  health: HealthBar[];
  constraint: Constraint | null;
  dirs: Readiness[];
  inbox: InboxMessage[];
  priority: PriorityId | null;
  budget: Budget;
}) {
  const last = history[history.length - 1];
  const runway = last && v(last, "netCF") < 0 ? s.cash / -v(last, "netCF") : 99;
  const chart = history.map((h) => ({
    q: "Q" + h.q,
    share: Math.round(v(h, "marketShare") * 1000) / 10,
    units: Math.round(v(h, "unitsSold")),
    demand: Math.round(v(h, "mktDemand")),
  }));
  const shareTone =
    chart.length >= 2 && chart[chart.length - 1].share < chart[0].share ? CHART_FALL : CHART_RISE;

  return (
    <div className="space-y-6">
      {/* ── Section header ─────────────────────────────────────────── */}
      <div>
        <Eyebrow tone="text-dim">Dashboard</Eyebrow>
        <h2 className="font-serif text-2xl text-ink mt-0.5">Company at a glance</h2>
        <p className="text-xs text-dim mt-1 font-mono">Quarter {s.quarter} of 4 · live</p>
      </div>

      {/* ── Stat grid ──────────────────────────────────────────────── */}
      <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat
          label="Quarter"
          value={s.quarter + " of 4"}
          sub={QUARTER_BRIEFS[s.quarter - 1].title}
        />
        <TrendStat
          label="Cash"
          value={inr(s.cash)}
          tone={s.cash < BUFFER ? "bad" : "flat"}
          sub={
            (s.pendingInvestment > 0 ? "+" + inr(s.pendingInvestment) + " signed · " : "") +
            "left " +
            inr(budget.ceiling - budget.committed)
          }
          series={history.map((h) => v(h, "cash"))}
        />
        <TrendStat
          label="Runway"
          value={runway >= 99 ? "Self-funding" : n1(runway) + " qtr"}
          tone={runway >= 2 ? "good" : "bad"}
          series={history.map((h) => (v(h, "netCF") < 0 ? v(h, "cash") / -v(h, "netCF") : 8))}
        />
        <TrendStat
          label="Revenue"
          value={last ? cr(v(last, "revenueT")) : "—"}
          sub="last closed quarter"
          series={history.map((h) => v(h, "revenueT"))}
        />
        <TrendStat
          label="Market share"
          value={last ? pct(v(last, "marketShare") * 100) : "—"}
          sub={
            last
              ? (v(last, "shareDelta") >= 0 ? "+" : "") +
                n1(v(last, "shareDelta") * 100) +
                " pts"
              : "no history yet"
          }
          tone={last ? (v(last, "shareDelta") >= 0 ? "good" : "bad") : "flat"}
          series={history.map((h) => v(h, "marketShare") * 100)}
        />
        <TrendStat
          label="Valuation"
          value={last ? cr(v(last, "valuation")) : "—"}
          series={history.map((h) => v(h, "valuation"))}
        />
      </div>

      {/* ── Constraint banner ──────────────────────────────────────── */}
      {constraint && (
        <div className="border-l-4 border-danger bg-danger/10 shadow-[0_0_24px_-8px_var(--danger)] overflow-hidden">
          <div className="px-5 py-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Eyebrow tone="text-tone-bad">Your biggest constraint right now</Eyebrow>
              <h3 className="font-serif text-xl text-ink mt-1">{constraint.primary.label}</h3>
              <p className="text-sm text-dim mt-1 max-w-2xl leading-snug">
                {constraint.primary.why}
              </p>
            </div>
            <div className="text-right shrink-0">
              <Eyebrow>You said you would prioritise</Eyebrow>
              <div className="font-serif text-base text-ink mt-1">
                {priority ? PRIORITY_BY_ID[priority].name : "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Addressable Demand ─────────────────────────────────────── */}
      <div>
        <Eyebrow tone="text-danger-soft">Before you allocate</Eyebrow>
        <h3 className="font-serif text-xl mb-2">Roughly how many buyers you could reach this quarter</h3>
        <p className="font-mono text-3xl text-ink">
          {n0(estimateAddressableDemand(s, s.quarter))}{" "}
          <span className="text-sm text-dim font-sans">
            buyers, if you fund marketing and pricing well
          </span>
        </p>
        <p className="text-xs text-dim mt-2 italic max-w-3xl">
          Size Sales capacity and how much you plan to produce against this number, not against how much
          cash you have. It&apos;s an estimate from where the company stands right now — the real figure
          depends on what you actually decide, and will differ once the quarter closes.
        </p>
      </div>

      {/* ── Operating readiness ────────────────────────────────────── */}
      <div className="border border-line overflow-hidden">
        <div className="border-b border-line px-4 py-3.5 bg-gradient-to-r from-panel to-transparent">
          <Eyebrow tone="text-tone-bad">Where the plan puts pressure</Eyebrow>
          <h3 className="font-serif text-lg text-ink mt-0.5">Operating readiness</h3>
        </div>
        <div className="p-4 bg-raise">
          <ReadinessGrid dirs={dirs} />
          <p className="text-xs text-dim mt-3 italic font-mono leading-relaxed">
            Direction only. Revenue, profit and cash are sealed until the quarter closes — which is exactly the
            situation you would actually be in.
          </p>
          <TeachingNote id="constraint" />
        </div>
      </div>

      {/* ── Inbox ──────────────────────────────────────────────────── */}
      <Inbox messages={inbox} limit={5} />

      {/* ── Health panel ───────────────────────────────────────────── */}
      <HealthPanel health={health} />

      {/* ── Market share chart ─────────────────────────────────────── */}
      {history.length > 0 && (
        <Panel
          eyebrow="Market share"
          title="Your share of a category that is growing without you"
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART_GRID} strokeDasharray="2 4" />
                <XAxis dataKey="q" stroke={CHART_AXIS} fontSize={12} tickLine={false} />
                <YAxis stroke={CHART_AXIS} fontSize={11} width={62} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    borderColor: CHART_GRID,
                    background: "var(--raise)",
                    color: "var(--text)",
                    borderRadius: "4px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="share"
                  name="Market share %"
                  stroke={shareTone}
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: shareTone, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: shareTone }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-0.5">
            {history.map((h) => (
              <LedgerRow
                key={h.q}
                label={"Quarter " + h.q}
                working={n0(v(h, "unitsSold")) + " units of a " + n0(v(h, "mktDemand")) + "-unit category"}
                value={pct(v(h, "marketShare") * 100)}
              />
            ))}
          </div>
          <TeachingNote id="share" />
          <TeachingNote id="rivals" />
        </Panel>
      )}
    </div>
  );
}
