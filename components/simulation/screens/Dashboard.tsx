"use client";

/** The company tab: the six headline figures, the live constraint, readiness, inbox and share. */

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BUFFER, PRIORITY_BY_ID, QUARTER_BRIEFS } from "@/lib/simulation/constants";
import { cr, inr, n0, n1, pct } from "@/lib/simulation/format";
import {
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
  onGo,
}: {
  s: CompanyState;
  history: QuarterResultShape[];
  health: HealthBar[];
  constraint: Constraint | null;
  dirs: Readiness[];
  inbox: InboxMessage[];
  priority: PriorityId | null;
  budget: Budget;
  onGo: () => void;
}) {
  const last = history[history.length - 1];
  const runway = last && v(last, "netCF") < 0 ? s.cash / -v(last, "netCF") : 99;
  const chart = history.map((h) => ({
    q: "Q" + h.q,
    share: Math.round(v(h, "marketShare") * 1000) / 10,
    units: Math.round(v(h, "unitsSold")),
    demand: Math.round(v(h, "mktDemand")),
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Quarter" value={s.quarter + " of 4"} sub={QUARTER_BRIEFS[s.quarter - 1].title} />
        <TrendStat
          label="Cash"
          value={inr(s.cash)}
          tone={s.cash < BUFFER ? "bad" : "flat"}
          sub={"left to commit " + inr(budget.ceiling - budget.committed)}
          series={history.map((h) => v(h, "cash"))}
        />
        <TrendStat
          label="Runway"
          value={runway >= 99 ? "Self-funding" : n1(runway) + " qtr"
          }
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
          sub={last ? (v(last, "shareDelta") >= 0 ? "+" : "") + n1(v(last, "shareDelta") * 100) + " pts" : "no history yet"}
          tone={last ? (v(last, "shareDelta") >= 0 ? "good" : "bad") : "flat"}
          series={history.map((h) => v(h, "marketShare") * 100)}
        />
        <TrendStat
          label="Valuation"
          value={last ? cr(v(last, "valuation")) : "—"}
          series={history.map((h) => v(h, "valuation"))}
        />
      </div>

      {constraint && (
        <div className="bg-raise border-2 border-danger-deep">
          <div className="px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <Eyebrow tone="text-danger-deep">Your biggest constraint right now</Eyebrow>
              <h3 className="font-serif text-2xl">{constraint.primary.label}</h3>
              <p className="text-sm text-ink mt-1 max-w-2xl">{constraint.primary.why}</p>
            </div>
            <div className="text-right">
              <Eyebrow>You said you would prioritise</Eyebrow>
              <div className="font-serif text-lg">{priority ? PRIORITY_BY_ID[priority].name : "—"}</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <Eyebrow tone="text-danger-deep">Where the plan puts pressure</Eyebrow>
        <h3 className="font-serif text-xl mb-2">Operating readiness</h3>
        <ReadinessGrid dirs={dirs} />
        <p className="text-xs text-dim mt-2 italic">
          Direction only. You will not know the exact revenue, profit or cash until the quarter closes — which is the
          situation you would actually be in.
        </p>
        <TeachingNote id="constraint" />
      </div>

      <Inbox messages={inbox} limit={5} />
      <HealthPanel health={health} />

      {history.length > 0 && (
        <Panel eyebrow="Market share" title="Your share of a category that is growing without you">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e7e5e4" strokeDasharray="2 4" />
                <XAxis dataKey="q" stroke="#78716c" fontSize={12} />
                <YAxis stroke="#78716c" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ fontFamily: "monospace", fontSize: 12, borderColor: "#d6d3d1" }} />
                <Line
                  type="monotone"
                  dataKey="share"
                  name="Market share %"
                  stroke="#9f1239"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {history.map((h) => (
            <LedgerRow
              key={h.q}
              label={"Quarter " + h.q}
              working={n0(v(h, "unitsSold")) + " units of a " + n0(v(h, "mktDemand")) + "-unit category"}
              value={pct(v(h, "marketShare") * 100)}
            />
          ))}
          <TeachingNote id="share" />
          <TeachingNote id="rivals" />
        </Panel>
      )}

      <button onClick={onGo} className="w-full bg-chrome text-white py-4 font-serif text-xl hover:bg-danger-deep">
        Go to review and close the quarter
      </button>
    </div>
  );
}
