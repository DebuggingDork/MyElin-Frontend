"use client";

/**
 * The Nadi Wear component vocabulary, ported from the shipped `NadiWear.html` bundle:
 * ruled panels on white, a monospace column for every number, and a serif for anything
 * that is a heading. Markup and Tailwind classes are the originals.
 */

import { createContext, useContext, useState } from "react";
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
import { clamp, inr, n0, n1 } from "@/lib/simulation/format";
import type { Budget, HealthBar, InboxMessage, Readiness, Tone } from "@/lib/simulation/types";

/* ── chart colours ────────────────────────────────────────────────────
   SVG and recharts take paint values rather than Tailwind classes, so these
   are written as `var()` references instead of class names. CSS variables
   resolve in SVG presentation attributes, which means the charts follow the
   theme the same way everything else in `.simulation` does -- a literal hex
   here would go stale against the dark theme. */

export const CHART_RISE = "var(--tone-good)";
export const CHART_FALL = "var(--tone-bad)";
export const CHART_GRID = "var(--sim-line)";
export const CHART_AXIS = "var(--faint)";

/* ── type and rules ───────────────────────────────────────────────── */

export function Eyebrow({
  children,
  tone = "text-dim",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <div className={"text-xs uppercase tracking-widest font-semibold " + tone}>{children}</div>;
}

/* ── selectable option cards ──────────────────────────────────────────
   Every "pick one of these" control in the simulation -- payment terms,
   warranty, priorities, crisis strategies, innovation cards -- is the same
   card in two states, so the classes live here once rather than being
   retyped at each call site.

   Each part names its own colour instead of inheriting one. Selected cards
   sit on the always-dark `bg-chrome`, unselected on the themed `bg-raise`, so
   a child that leaves `color` unset inherits whichever surface it happens to
   land on -- which is what left unselected card titles rendering near-white
   on cream. Stating the colour per state removes that coupling. */

export const optionCard = (on: boolean, pad = "p-3") =>
  `text-left border ${pad} transition-colors duration-150 ease-out ` +
  (on
    ? "border-teal-deep bg-chrome text-white"
    : "border-line bg-raise text-ink hover:border-teal/50 hover:bg-raise-2");

/** The card's name. Carries the weight, so it takes the strongest ink either way. */
export const optionTitle = (on: boolean) => (on ? "text-white" : "text-ink");

/** The teal consequence line ("cost -3.0% · reliability +3"). Not state-dependent:
 *  `tone-good` already resolves light on the selected card's dark surface. */
export const optionMeta = "text-tone-good";

/** Supporting prose under the title. One step quieter than the name, never faint enough to lose. */
export const optionNote = (on: boolean) => (on ? "text-faint" : "text-dim");

export function Panel({
  eyebrow,
  title,
  right,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
}: {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** For panels laid out side by side: a shared min-height here keeps two headers of
   *  different title lengths from pushing their bodies onto different baselines. */
  headerClassName?: string;
  /** Lets a panel in a stretched grid cell grow its body to fill the cell (`flex-1`), which is
   *  what makes a row of charts end on one line rather than three ragged ones. */
  bodyClassName?: string;
}) {
  return (
    <section className={"bg-raise border border-line " + className}>
      {(eyebrow || title) && (
        <header
          className={
            "border-b border-line px-4 py-3 flex flex-wrap items-end justify-between gap-2 " +
            headerClassName
          }
        >
          <div>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && <h3 className="font-serif text-lg text-ink leading-snug">{title}</h3>}
          </div>
          {right}
        </header>
      )}
      <div className={"p-4 " + bodyClassName}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "text-ink",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="h-full border border-line border-l-2 border-l-line-2 bg-raise p-3 flex flex-col justify-start">
      <Eyebrow>{label}</Eyebrow>
      <div className={"font-mono text-xl leading-tight mt-1 " + tone}>{value}</div>
      {sub && <div className="text-xs text-dim mt-1">{sub}</div>}
    </div>
  );
}

export function Bar({ value, max, tone = "bg-chrome" }: { value: number; max: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full bg-raise-2">
      <div className={"h-1.5 " + tone} style={{ width: clamp((value / (max || 1)) * 100, 0, 100) + "%" }} />
    </div>
  );
}

/** One line of a statement: what it is, how it was worked out, and the number. */
export function LedgerRow({
  label,
  working,
  value,
  tone = "text-ink",
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
        "grid grid-cols-12 gap-2 items-baseline py-1.5 border-b border-line " + (flag ? "bg-danger/10" : "")
      }
    >
      <div
        className={
          "col-span-6 sm:col-span-4 text-sm " +
          (indent ? "pl-4 " : "") +
          (strong ? "font-semibold text-ink" : "text-ink")
        }
      >
        {label}
      </div>
      <div className="col-span-6 sm:col-span-5 text-xs text-dim font-mono break-words order-3 sm:order-none">
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
        className="text-xs uppercase tracking-widest font-semibold text-dim hover:text-tone-bad border-b border-dotted border-line-2"
      >
        {open ? "Hide note" : "Why this works this way"}
      </button>
      {open && (
        <div className="mt-2 border-l-2 border-line-2 bg-raise px-3 py-2">
          <div className="text-xs uppercase tracking-widest text-tone-bad font-semibold">{note.cat}</div>
          <div className="font-serif text-base text-ink mt-0.5">{note.title}</div>
          <p className="text-sm text-ink mt-1 leading-snug">{note.body}</p>
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
        <p className="text-sm text-dim">Nothing from your team. Quiet quarters are rarer than they look.</p>
      </Panel>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div>
          <Eyebrow tone="text-tone-bad">{eyebrow}</Eyebrow>
          <h3 className="font-serif text-xl text-ink">{title}</h3>
        </div>
        {limit && messages.length > limit && (
          <span className="text-xs font-mono text-dim">{messages.length - limit} more on the dashboard</span>
        )}
      </div>
      <div className="space-y-2">
        {shown.map((m, i) => (
          <div key={i} className={"bg-raise border-l-4 border border-line px-4 py-3 " + MESSAGE_TONE[m.tone].border}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-serif text-base text-ink">{m.name}</span>
              <span className="text-xs uppercase tracking-widest text-dim">{m.role}</span>
              <span
                className={
                  "px-1.5 py-0.5 text-xs uppercase tracking-widest font-semibold ml-auto " + MESSAGE_TONE[m.tone].tag
                }
              >
                {MESSAGE_TONE[m.tone].label}
              </span>
            </div>
            <div className="font-semibold text-ink text-sm mt-1">{m.subject}</div>
            <p className="text-sm text-ink mt-1 leading-snug">{m.body}</p>
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
  const colour =
    tone === "invert" ? (rising ? CHART_FALL : CHART_RISE) : rising ? CHART_RISE : CHART_FALL;
  const last = coords[coords.length - 1];

  return (
    <svg width={w} height={h} className="inline-block align-middle" role="img" aria-label="trend">
      <polyline points={points} fill="none" stroke={colour} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="1.9" fill={colour} />
    </svg>
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
    <div className="h-full border border-line border-l-2 border-l-line-2 bg-raise p-3 flex flex-col justify-start">
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-1 flex flex-1 items-end justify-between gap-2">
        <div>
          <div className={"font-mono text-xl leading-tight " + TONE_TEXT[tone]}>{value}</div>
          {sub && <div className="text-xs text-dim mt-0.5">{sub}</div>}
        </div>
        <div className="text-right shrink-0">
          <Sparkline values={pts} tone={invert ? "invert" : "normal"} />
          {delta !== null && (
            <div className={"text-xs font-mono " + (better ? "text-tone-good" : "text-tone-bad")}>
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
        <span key={i} className="flex items-center gap-2 px-5 border-r border-line-2">
          <span className="text-xs uppercase tracking-widest text-dim">{item.label}</span>
          <span className={"font-mono text-sm " + TICKER_TONE[item.tone]}>{item.value}</span>
          {item.dir && (
            <span className={"text-xs " + (item.dir === "up" ? "text-teal-bright" : "text-danger-soft")}>
              {item.dir === "up" ? "▲" : "▼"}
            </span>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-chrome border-t border-b border-line-2 overflow-hidden">
      <style>
        {
          "@keyframes simTick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.simulation-tick{animation:simTick 90s linear infinite;will-change:transform}.simulation-tick:hover{animation-play-state:paused}@media (prefers-reduced-motion:reduce){.simulation-tick{animation:none}}"
        }
      </style>
      <div className="flex w-max simulation-tick py-1.5">
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

  /* The column count is chosen from how many cards there are, not from the viewport alone.

     `lg:grid-cols-4` was wrong for both cases it had to serve. The full set is nine, and four
     columns left the last row three-quarters empty on every screen; a department screen passes
     two or three through `only`, and four columns left those stranded at a quarter width each.

     So: nine cards get 1/3/5, the counts that divide nine with at most one cell to spare and
     never the 4 or 6 that strand three. Anything smaller gets auto-fit, which collapses the
     tracks it does not need so a subset always fills its row exactly. */
  const cols =
    shown.length > 6
      ? "grid-cols-1 min-[560px]:grid-cols-3 xl:grid-cols-5"
      : "[grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]";

  return (
    <div className={"grid gap-2 " + cols}>
      {shown.map((d) => {
        const tone: Tone = LEVEL_TONE[d.level] ?? "watch";
        return (
          <div key={d.id} className={"border p-3 " + TONE_CARD[tone]}>
            <Eyebrow>{d.label}</Eyebrow>
            <div className={"font-mono text-base font-semibold mt-0.5 " + TONE_TEXT[tone]}>{d.level}</div>
            <div className="text-xs text-dim mt-1 leading-snug">{d.note}</div>
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
              <span className="text-sm text-ink">{h.label}</span>
              <span className={"text-xs font-mono " + TONE_TEXT[h.tone]}>{n0(h.value)}</span>
            </div>
            <div className="mt-1">
              <Bar value={h.value} max={100} tone={TONE_BAR[h.tone]} />
            </div>
            <div className="text-xs text-dim mt-1">{h.note}</div>
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
    <div className={"border px-4 py-3 " + (over ? "border-danger bg-danger/10" : "border-line bg-raise")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <Eyebrow tone={over ? "text-tone-bad" : "text-dim"}>
          {over ? "Over the quarter's ceiling" : "Cash left to commit"}
        </Eyebrow>
        <div className={"font-mono text-lg " + (over ? "text-tone-bad" : "text-ink")}>
          {inr(left)} <span className="text-faint text-xs">of {inr(budget.ceiling)}</span>
        </div>
      </div>
      <Bar
        value={budget.committed}
        max={budget.ceiling}
        tone={over ? "bg-danger" : budget.committed > budget.ceiling * 0.85 ? "bg-ember" : "bg-chrome"}
      />
      <div className="text-xs text-dim mt-2 font-mono">
        {inr(budget.opex)} operating + {inr(budget.capex)} plant + {inr(budget.inno)} innovation + {inr(budget.people)}{" "}
        people. Ceiling = cash{budget.investment > 0 ? " + the signed investment" : ""} + credit drawn, less fixed costs
        and the {inr(BUFFER)} buffer.
      </div>
      {budget.investment > 0 && (
        // The cheque is in the ceiling before it is in the bank -- say so, or a CEO who has
        // just signed for it reads a cash line that has not moved and assumes it never landed.
        <div className="mt-1 font-mono text-xs text-teal-bright">
          Includes {inr(budget.investment)} of signed investment, banked when this quarter closes.
        </div>
      )}
    </div>
  );
}
