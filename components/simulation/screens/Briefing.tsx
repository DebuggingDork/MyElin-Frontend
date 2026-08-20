"use client";

/**
 * Monday morning: what changed, what is holding the company back, what everyone around the
 * table wants, and the priority you have to declare before you see any of the levers.
 */

import { BUFFER, PRIORITIES, QUARTER_BRIEFS, TONE_CARD, headcount } from "@/lib/simulation/constants";
import { cr, inr, n0, n1, pct } from "@/lib/simulation/format";
import {
  Eyebrow,
  HealthPanel,
  Panel,
  TeachingNote,
  TrendStat,
  optionCard,
  optionNote,
  optionTitle,
} from "@/components/simulation/Kit";
import type { ChangeLine } from "@/lib/simulation/insights";
import type {
  CompanyState,
  Constraint,
  HealthBar,
  PriorityId,
  QuarterResultShape,
  Tone,
} from "@/lib/simulation/types";

const v = (r: QuarterResultShape, k: string) => r[k] as number;

export function BriefingScreen({
  s,
  history,
  health,
  changes,
  constraint,
  board,
  priority,
  setPriority,
  onStart,
  busy,
}: {
  s: CompanyState;
  history: QuarterResultShape[];
  health: HealthBar[];
  changes: ChangeLine[];
  constraint: Constraint | null;
  board: { who: string; ask: string; met: boolean | null; detail: string }[];
  priority: PriorityId | null;
  setPriority: (p: PriorityId) => void;
  onStart: () => void;
  busy?: boolean;
}) {
  const brief = QUARTER_BRIEFS[s.quarter - 1];
  const last = history[history.length - 1];
  const runway = last && v(last, "netCF") < 0 ? s.cash / -v(last, "netCF") : 99;

  const stats: {
    label: string;
    value: string;
    tone: Tone;
    sub?: string | null;
    series: number[];
    invert?: boolean;
  }[] = [
    {
      label: "Cash",
      value: inr(s.cash),
      tone: s.cash < BUFFER ? "bad" : s.cash < BUFFER * 3 ? "watch" : "good",
      series: history.map((h) => v(h, "cash")),
    },
    {
      label: "Runway",
      value: runway >= 99 ? "Self-funding" : n1(runway) + " qtr",
      tone: runway >= 3 ? "good" : runway >= 2 ? "watch" : "bad",
      series: history.map((h) => (v(h, "netCF") < 0 ? v(h, "cash") / -v(h, "netCF") : 8)),
    },
    {
      label: "Revenue last quarter",
      value: last ? cr(v(last, "revenueT")) : "—",
      tone: "flat",
      series: history.map((h) => v(h, "revenueT")),
    },
    {
      label: "Gross margin",
      value: last && v(last, "revenueT") > 0 ? pct((v(last, "grossProfit") / v(last, "revenueT")) * 100) : "—",
      tone:
        last && v(last, "revenueT") > 0
          ? v(last, "grossProfit") / v(last, "revenueT") > 0.55
            ? "good"
            : v(last, "grossProfit") / v(last, "revenueT") > 0.4
              ? "watch"
              : "bad"
          : "flat",
      series: history.map((h) => (v(h, "revenueT") > 0 ? (v(h, "grossProfit") / v(h, "revenueT")) * 100 : 0)),
    },
    {
      label: "Net profit",
      value: last ? inr(v(last, "netProfit")) : "—",
      tone: last ? (v(last, "netProfit") >= 0 ? "good" : "bad") : "flat",
      series: history.map((h) => v(h, "netProfit")),
    },
    {
      label: "Market share",
      value: last ? pct(v(last, "marketShare") * 100) : "—",
      tone: last ? (v(last, "shareDelta") >= 0 ? "good" : "bad") : "flat",
      sub: last ? (v(last, "shareDelta") >= 0 ? "+" : "") + n1(v(last, "shareDelta") * 100) + " pts" : null,
      series: history.map((h) => v(h, "marketShare") * 100),
    },
    {
      label: "Customers",
      value: n0(s.customers),
      tone: "flat",
      sub: "repeat " + pct(s.repeatRate),
      series: history.map((h) => v(h, "customers")),
    },
    {
      label: "Capacity used",
      value: last ? pct(v(last, "utilisation") * 100) : "—",
      tone: last ? (v(last, "utilisation") > 0.8 ? "good" : v(last, "utilisation") > 0.6 ? "watch" : "bad") : "flat",
      sub: n0(s.installedCapacity) + " units installed",
      series: history.map((h) => v(h, "utilisation") * 100),
    },
    {
      label: "Headcount",
      value: n0(headcount(s.staff)),
      tone: "flat",
      sub: "morale " + n0(s.empSat),
      series: history.map((h) => v(h, "headcount")),
    },
    {
      label: "Valuation",
      value: last ? cr(v(last, "valuation")) : "—",
      tone: "flat",
      series: history.map((h) => v(h, "valuation")),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-chrome text-white p-6">
        <Eyebrow tone="text-danger-soft">
          Quarter {s.quarter} of 4 · {brief.title}
        </Eyebrow>
        <h1 className="font-serif text-4xl mt-1">Monday morning, and the company is yours</h1>
        <p className="text-sm text-faint mt-3 max-w-3xl leading-relaxed">{brief.brief}</p>
      </div>

      <Panel eyebrow="Where the company stands" title="The numbers that matter this morning">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <TrendStat
              key={stat.label}
              label={stat.label}
              value={stat.value}
              sub={stat.sub}
              tone={stat.tone}
              series={stat.series}
              invert={stat.invert}
            />
          ))}
        </div>
      </Panel>

      <div>
        <Eyebrow tone="text-danger-deep">Since you last looked</Eyebrow>
        <h3 className="font-serif text-xl mb-2 text-ink">What changed</h3>
        <div className="space-y-1">
          {changes.map((c, i) => (
            <div
              key={i}
              className={
                "bg-raise border border-line border-l-4 px-4 py-2 flex flex-wrap items-baseline gap-x-3 " +
                (c.dir === "up" ? "border-l-teal-700" : c.dir === "down" ? "border-l-rose-700" : "border-l-stone-400")
              }
            >
              <span
                className={
                  "font-mono text-xs " +
                  (c.dir === "up" ? "text-teal-deep" : c.dir === "down" ? "text-danger" : "text-dim")
                }
              >
                {c.dir === "up" ? "▲" : c.dir === "down" ? "▼" : "●"}
              </span>
              <span className="text-sm font-semibold text-ink">{c.label}</span>
              <span className="text-sm text-dim flex-1 min-w-full sm:min-w-0">{c.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {constraint && (
        <div className="bg-raise border-2 border-danger-deep">
          <header className="bg-danger-deep text-white px-4 py-2">
            <Eyebrow tone="text-danger-soft">Your biggest constraint</Eyebrow>
            <h3 className="font-serif text-2xl">{constraint.primary.label}</h3>
          </header>
          <div className="p-4 space-y-3">
            <div>
              <Eyebrow>The evidence</Eyebrow>
              <p className="text-sm text-ink mt-0.5">{constraint.primary.why}</p>
            </div>
            <div>
              <Eyebrow>What it cost you</Eyebrow>
              <p className="text-sm text-ink mt-0.5">{constraint.primary.impact}</p>
            </div>
            <TeachingNote id="constraint" />
            <div className="border-t border-line pt-3">
              <p className="text-sm text-dim italic">
                This is what the evidence says is binding. It is not necessarily what you should fix — that is your call,
                and fixing it will cost you something else.
              </p>
            </div>
            {constraint.all.length > 1 && (
              <div className="text-xs text-dim font-mono">
                Also pressing: {constraint.all.slice(1).map((c) => c.label).join(" · ")}
              </div>
            )}
          </div>
        </div>
      )}

      <HealthPanel health={health} />

      <Panel eyebrow="Everyone wants something" title="Around the table">
        <div className="grid gap-3 sm:grid-cols-2">
          {board.map((b, i) => (
            <div key={i} className={"border p-3 " + (b.met === null ? TONE_CARD.flat : b.met ? TONE_CARD.good : TONE_CARD.bad)}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif text-base text-ink">{b.who}</span>
                <span
                  className={
                    "text-xs uppercase tracking-widest font-semibold " +
                    (b.met === null ? "text-dim" : b.met ? "text-teal-deep" : "text-danger-deep")
                  }
                >
                  {b.met === null ? "Watching" : b.met ? "Satisfied" : "Not satisfied"}
                </span>
              </div>
              <div className="text-sm text-ink mt-1">“{b.ask}”</div>
              <div className="text-xs text-dim font-mono mt-1">{b.detail}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-dim mt-3 italic">
          They cannot all be satisfied at once, and none of them is automatically right.
        </p>
        <TeachingNote id="board" />
      </Panel>

      <Panel eyebrow="Before you start" title="What are you going to prioritise this quarter?">
        <p className="text-sm text-dim mb-3">
          Say it now, out loud, before you see the levers. At the end of the quarter we will compare what you said, what
          you actually funded, and what the company turned out to need.
        </p>
        <TeachingNote id="priority" inline />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mt-3">
          {PRIORITIES.map((p) => {
            const on = priority === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                className={optionCard(on)}
              >
                <div className={"font-serif text-base leading-snug " + optionTitle(on)}>{p.name}</div>
                <div className={"text-xs mt-1 leading-snug " + optionNote(on)}>{p.desc}</div>
              </button>
            );
          })}
        </div>
      </Panel>

      <button
        onClick={onStart}
        disabled={!priority || busy}
        className={
          "w-full py-4 font-serif text-xl " +
          (priority && !busy ? "bg-danger-deep text-white hover:bg-danger-deep" : "bg-raise-2 text-faint")
        }
      >
        {busy ? "Opening the quarter…" : priority ? "Start the quarter" : "Choose a priority to begin"}
      </button>
    </div>
  );
}
