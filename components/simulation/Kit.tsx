"use client";

/**
 * The Nadi Wear component vocabulary, ported from the shipped `NadiWear.html` bundle:
 * ruled panels on white, a monospace column for every number, and a serif for anything
 * that is a heading. Markup and Tailwind classes are the originals.
 */

import { createContext, useContext, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  BUFFER,
  LEVEL_TONE,
  MESSAGE_TONE,
  TEACHING_NOTES,
  TICKER_TONE,
  TONE_BAR,
  TONE_CARD,
  TONE_TEXT,
} from "@/lib/simulation/constants";
import { clamp, cr, inr, n0, n1 } from "@/lib/simulation/format";
import type { Budget, HealthBar, InboxMessage, QuarterResultShape, Readiness, Tone } from "@/lib/simulation/types";

/* ── type and rules ───────────────────────────────────────────────── */

export function Eyebrow({
  children,
  tone = "text-stone-500",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <div className={"text-xs uppercase tracking-widest font-semibold " + tone}>{children}</div>;
}

export function Panel({
  eyebrow,
  title,
  right,
  children,
  className = "",
}: {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={"bg-white border border-stone-300 " + className}>
      {(eyebrow || title) && (
        <header className="border-b border-stone-300 px-4 py-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && <h3 className="font-serif text-lg text-stone-900 leading-snug">{title}</h3>}
          </div>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "text-stone-900",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="border-l-2 border-stone-300 pl-3">
      <Eyebrow>{label}</Eyebrow>
      <div className={"font-mono text-xl leading-tight " + tone}>{value}</div>
      {sub && <div className="text-xs text-stone-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function Bar({ value, max, tone = "bg-stone-800" }: { value: number; max: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full bg-stone-200">
      <div className={"h-1.5 " + tone} style={{ width: clamp((value / (max || 1)) * 100, 0, 100) + "%" }} />
    </div>
  );
}

/** One line of a statement: what it is, how it was worked out, and the number. */
export function LedgerRow({
  label,
  working,
  value,
  tone = "text-stone-900",
  strong,
  flag,
  indent,
}: {
  label: React.ReactNode;
  working?: React.ReactNode;
  value: React.ReactNode;
  tone?: string;
  strong?: boolean;
  flag?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={
        "grid grid-cols-12 gap-2 items-baseline py-1.5 border-b border-stone-200 " + (flag ? "bg-rose-50" : "")
      }
    >
      <div
        className={
          "col-span-6 sm:col-span-4 text-sm " +
          (indent ? "pl-4 " : "") +
          (strong ? "font-semibold text-stone-900" : "text-stone-700")
        }
      >
        {label}
      </div>
      <div className="col-span-6 sm:col-span-5 text-xs text-stone-500 font-mono break-words order-3 sm:order-none">
        {working}
      </div>
      <div className={"col-span-6 sm:col-span-3 text-right font-mono text-sm " + tone + (strong ? " font-semibold" : "")}>
        {value}
      </div>
    </div>
  );
}

/* ── teaching notes ───────────────────────────────────────────────── */

export const TeachingContext = createContext(true);

/** "Why this works this way" — collapsible, and switchable off from the header. */
export function TeachingNote({ id, inline }: { id?: string; inline?: boolean }) {
  const enabled = useContext(TeachingContext);
  const [open, setOpen] = useState(false);
  const note = id ? TEACHING_NOTES[id] : undefined;
  if (!enabled || !note) return null;

  return (
    <div className={inline ? "mt-2" : "mt-3"}>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs uppercase tracking-widest font-semibold text-stone-500 hover:text-rose-800 border-b border-dotted border-stone-400"
      >
        {open ? "Hide note" : "Why this works this way"}
      </button>
      {open && (
        <div className="mt-2 border-l-2 border-stone-800 bg-stone-50 px-3 py-2">
          <div className="text-xs uppercase tracking-widest text-rose-800 font-semibold">{note.cat}</div>
          <div className="font-serif text-base text-stone-900 mt-0.5">{note.title}</div>
          <p className="text-sm text-stone-700 mt-1 leading-snug">{note.body}</p>
        </div>
      )}
    </div>
  );
}

/* ── the inbox ────────────────────────────────────────────────────── */

export function Inbox({
  messages,
  limit,
  title = "Your inbox",
  eyebrow = "This morning",
}: {
  messages: InboxMessage[];
  limit?: number;
  title?: string;
  eyebrow?: string;
}) {
  const shown = limit ? messages.slice(0, limit) : messages;
  if (!shown.length) {
    return (
      <Panel eyebrow={eyebrow} title={title}>
        <p className="text-sm text-stone-500">Nothing from your team. Quiet quarters are rarer than they look.</p>
      </Panel>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div>
          <Eyebrow tone="text-rose-800">{eyebrow}</Eyebrow>
          <h3 className="font-serif text-xl">{title}</h3>
        </div>
        {limit && messages.length > limit && (
          <span className="text-xs font-mono text-stone-500">{messages.length - limit} more on the dashboard</span>
        )}
      </div>
      <div className="space-y-2">
        {shown.map((m, i) => (
          <div key={i} className={"bg-white border-l-4 border border-stone-300 px-4 py-3 " + MESSAGE_TONE[m.tone].border}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-serif text-base text-stone-900">{m.name}</span>
              <span className="text-xs uppercase tracking-widest text-stone-500">{m.role}</span>
              <span
                className={
                  "px-1.5 py-0.5 text-xs uppercase tracking-widest font-semibold ml-auto " + MESSAGE_TONE[m.tone].tag
                }
              >
                {MESSAGE_TONE[m.tone].label}
              </span>
            </div>
            <div className="font-semibold text-stone-900 text-sm mt-1">{m.subject}</div>
            <p className="text-sm text-stone-700 mt-1 leading-snug">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── trends ───────────────────────────────────────────────────────── */

export function Sparkline({
  values,
  tone,
  w = 64,
  h = 20,
}: {
  values: number[];
  tone?: "invert" | "normal";
  w?: number;
  h?: number;
}) {
  const pts = (values || []).filter((v) => Number.isFinite(v));
  if (pts.length < 2) return null;

  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const span = hi - lo || 1;
  const coords = pts.map((v, i) => [(i / (pts.length - 1)) * (w - 2) + 1, h - 1 - ((v - lo) / span) * (h - 2)]);
  const points = coords.map((c) => c[0].toFixed(1) + "," + c[1].toFixed(1)).join(" ");
  const rising = pts[pts.length - 1] >= pts[0];
  const colour = tone === "invert" ? (rising ? "#9f1239" : "#0f766e") : rising ? "#0f766e" : "#9f1239";
  const last = coords[coords.length - 1];

  return (
    <svg width={w} height={h} className="inline-block align-middle" role="img" aria-label="trend">
      <polyline points={points} fill="none" stroke={colour} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="1.9" fill={colour} />
    </svg>
  );
}

/**
 * Valuation, quarter by quarter -- the number every closed-quarter report and the final
 * report both lead with, plotted instead of just stated. Reads straight off `history`, the
 * same engine-computed results every other figure on these screens reads from; nothing here
 * is estimated or re-derived. Renders nothing before there are two quarters to compare.
 */
export function ValuationTrendChart({ history }: { history: QuarterResultShape[] }) {
  const trend = history.map((h) => ({ q: "Q" + h.q, valuation: h.valuation as number }));
  if (trend.length < 2) return null;

  const opening = trend[0].valuation;
  const latest = trend[trend.length - 1];
  const tone = latest.valuation >= opening ? "#0f766e" : "#9f1239";

  return (
    <Panel
      eyebrow="Valuation trajectory"
      title={"Q1 " + cr(opening) + " → " + latest.q + " " + cr(latest.valuation)}
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="valuationTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tone} stopOpacity={0.28} />
                <stop offset="100%" stopColor={tone} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e7e5e4" strokeDasharray="2 4" />
            <XAxis dataKey="q" stroke="#78716c" fontSize={12} />
            <YAxis stroke="#78716c" fontSize={11} tickFormatter={(val: number) => cr(val)} width={64} />
            <Tooltip
              contentStyle={{ fontFamily: "monospace", fontSize: 12, borderColor: "#d6d3d1" }}
              formatter={(val: unknown) => [cr(Number(val)), "Valuation"]}
            />
            <Area
              type="monotone"
              dataKey="valuation"
              stroke={tone}
              strokeWidth={2}
              fill="url(#valuationTrend)"
              dot={{ r: 3, fill: tone, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

/** A figure with its own history behind it. `invert` marks metrics where down is good. */
export function TrendStat({
  label,
  value,
  sub,
  tone = "flat",
  series,
  invert,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: Tone;
  series?: number[];
  invert?: boolean;
}) {
  const pts = (series || []).filter((v) => Number.isFinite(v));
  const delta = pts.length >= 2 ? pts[pts.length - 1] - pts[pts.length - 2] : null;
  const better = delta === null ? null : invert ? delta < 0 : delta > 0;

  return (
    <div className="border-l-2 border-stone-300 pl-3">
      <Eyebrow>{label}</Eyebrow>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className={"font-mono text-xl leading-tight " + TONE_TEXT[tone]}>{value}</div>
          {sub && <div className="text-xs text-stone-500 mt-0.5">{sub}</div>}
        </div>
        <div className="text-right shrink-0">
          <Sparkline values={pts} tone={invert ? "invert" : "normal"} />
          {delta !== null && (
            <div className={"text-xs font-mono " + (better ? "text-teal-700" : "text-rose-700")}>
              {better ? "▲" : "▼"} {Math.abs(delta) >= 1000 ? n0(Math.abs(delta)) : n1(Math.abs(delta))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── the ticker ───────────────────────────────────────────────────── */

export function Ticker({ items }: { items: { label: string; value: string; tone: Tone; dir: "up" | "down" | null }[] }) {
  if (!items.length) return null;

  const run = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2 px-5 border-r border-stone-700">
          <span className="text-xs uppercase tracking-widest text-stone-500">{item.label}</span>
          <span className={"font-mono text-sm " + TICKER_TONE[item.tone]}>{item.value}</span>
          {item.dir && (
            <span className={"text-xs " + (item.dir === "up" ? "text-teal-400" : "text-rose-400")}>
              {item.dir === "up" ? "▲" : "▼"}
            </span>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-stone-950 border-t border-b border-stone-700 overflow-hidden">
      <style>
        {
          "@keyframes simTick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.simulation-tick{animation:simTick 90s linear infinite;will-change:transform}.simulation-tick:hover{animation-play-state:paused}@media (prefers-reduced-motion:reduce){.simulation-tick{animation:none}}"
        }
      </style>
      <div className="flex w-max sim-tick py-1.5">
        {run("a")}
        {run("b")}
      </div>
    </div>
  );
}

/* ── readiness, health and the budget ─────────────────────────────── */

export function ReadinessGrid({ dirs, only }: { dirs: Readiness[]; only?: string[] }) {
  const shown = only ? dirs.filter((d) => only.indexOf(d.id) >= 0) : dirs;
  if (!shown.length) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {shown.map((d) => {
        const tone: Tone = LEVEL_TONE[d.level] ?? "watch";
        return (
          <div key={d.id} className={"border p-3 " + TONE_CARD[tone]}>
            <Eyebrow>{d.label}</Eyebrow>
            <div className={"font-mono text-base font-semibold mt-0.5 " + TONE_TEXT[tone]}>{d.level}</div>
            <div className="text-xs text-stone-600 mt-1 leading-snug">{d.note}</div>
          </div>
        );
      })}
    </div>
  );
}

export function HealthPanel({ health, compact }: { health: HealthBar[]; compact?: boolean }) {
  return (
    <Panel eyebrow="Orientation" title="Company health">
      <div className={"grid gap-x-6 gap-y-3 " + (compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
        {health.map((h) => (
          <div key={h.key}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-stone-800">{h.label}</span>
              <span className={"text-xs font-mono " + TONE_TEXT[h.tone]}>{n0(h.value)}</span>
            </div>
            <div className="mt-1">
              <Bar value={h.value} max={100} tone={TONE_BAR[h.tone]} />
            </div>
            <div className="text-xs text-stone-500 mt-1">{h.note}</div>
          </div>
        ))}
      </div>
      <TeachingNote id="health" />
    </Panel>
  );
}

/** Cash left to commit this quarter, and what the ceiling is made of. */
export function BudgetMeter({ budget }: { budget: Budget }) {
  const left = budget.ceiling - budget.committed;
  const over = left < 0;

  return (
    <div className={"border px-4 py-3 " + (over ? "border-rose-700 bg-rose-50" : "border-stone-300 bg-white")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <Eyebrow tone={over ? "text-rose-800" : "text-stone-500"}>
          {over ? "Over the quarter's ceiling" : "Cash left to commit"}
        </Eyebrow>
        <div className={"font-mono text-lg " + (over ? "text-rose-800" : "text-stone-900")}>
          {inr(left)} <span className="text-stone-400 text-xs">of {inr(budget.ceiling)}</span>
        </div>
      </div>
      <Bar
        value={budget.committed}
        max={budget.ceiling}
        tone={over ? "bg-rose-700" : budget.committed > budget.ceiling * 0.85 ? "bg-amber-600" : "bg-stone-800"}
      />
      <div className="text-xs text-stone-500 mt-2 font-mono">
        {inr(budget.opex)} operating + {inr(budget.capex)} plant + {inr(budget.inno)} innovation + {inr(budget.people)}{" "}
        people. Ceiling = cash + credit drawn, less fixed costs and the {inr(BUFFER)} buffer.
      </div>
    </div>
  );
}
