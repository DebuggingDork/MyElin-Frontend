"use client";

import { useState } from "react";
import { ArrowRight, Check, Edit2 } from "lucide-react";
import { Action, Container } from "@/components/ui/Kit";
import { TimerDial } from "@/components/play/TimerDial";
import { DEPARTMENTS } from "@/lib/api/catalog";
import type { Scenario } from "@/lib/play/types";
import { cn } from "@/lib/utils";

/** The four things a CEO is agreeing to. Each one names its own consequence: a term whose
 *  cost is not stated is a term nobody has actually accepted. */
const TERMS = [
  {
    id: "time",
    label: "I have fifty uninterrupted minutes.",
    cost: "You may pause the timer, but each quarter has a 50-minute limit.",
  },
  {
    id: "consequence",
    label: "Every decision here is irreversible.",
    cost: "Cash and morale move the moment you commit.",
  },
  {
    id: "hidden",
    label: "I will decide without seeing everything.",
    cost: "Hidden variables stay sealed until they resolve.",
  },
  {
    id: "report",
    label: "I want to be scored on how I decided.",
    cost: "Seven cognitive dimensions, in one report.",
  },
];

/**
 * The threshold: rules and consent, and nothing else.
 *
 * Deliberately quiet. This is the last screen before someone takes a desk they cannot put
 * down for half an hour, and it should read like the front of a document rather than a
 * product page -- masthead, one serif line naming the company, four terms set as a ruled
 * index, and the opening balance sheet along the bottom. No narrative framing: that is
 * `NewspaperStory`'s job once this gate is cleared.
 *
 * Fits one viewport by construction (`h-dvh`, no page scroll); the terms are the tall element,
 * so they carry the safety valve for short windows rather than the page doing it.
 */
export function EntryGate({
  scenario,
  onEnter,
}: {
  scenario: Scenario;
  onEnter: (name: string) => void;
}) {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [companyName, setCompanyName] = useState(scenario.company.name);
  const count = TERMS.filter((term) => accepted[term.id]).length;
  const ready = count === TERMS.length;

  const footing = [
    ...scenario.metrics.slice(0, 3).map((m) => ({ value: m.value, label: m.label })),
    { value: String(DEPARTMENTS.length), label: "Departments" },
    { value: "4", label: "Quarters" },
  ];

  return (
    <div className="ledger relative flex h-dvh flex-col overflow-hidden bg-void">
      <div className="grid-lines absolute inset-0" />

      {/* ── masthead ─────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-line">
        <Container wide className="flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="tick-label">Myelin · {scenario.name}</p>
          <p className="tick-label flex items-center gap-2">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-teal" />
            Live · {scenario.company.stage} · {scenario.quarterLabel}
          </p>
        </Container>
      </header>

      {/* ── the threshold ────────────────────────────────────────── */}
      <Container
        wide
        className="relative z-10 flex min-h-0 flex-1 flex-col justify-center py-[clamp(1.5rem,4vh,3rem)]"
      >
        <div className="grid items-end gap-x-16 gap-y-8 lg:grid-cols-[1.35fr_auto]">
          <div>
            <p className="tick-label rise">The desk is yours in a moment</p>
            <div className="group relative mt-4 inline-block rise rise-1">
              <div className="flex items-center gap-4 border-b border-dashed border-teal/0 hover:border-teal/60 focus-within:border-teal/60 pb-1 transition-colors">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    maxLength={32}
                    title="Click to rename"
                    className="ledger-display w-full bg-transparent text-balance text-[clamp(2.6rem,6vw,4.6rem)] text-ink outline-none placeholder:text-dim hover:text-teal focus:text-teal transition-colors"
                  />
                  <span
                    className="pointer-events-none absolute ledger-display text-[clamp(2.6rem,6vw,4.6rem)] text-ink transition-colors group-hover:text-teal group-focus-within:text-teal"
                    style={{ left: `${Math.max(companyName.length, 1)}ch` }}
                  >
                    .
                  </span>
                </div>
                <Edit2 className="h-[clamp(1.5rem,3vw,2.5rem)] w-[clamp(1.5rem,3vw,2.5rem)] text-faint group-hover:text-teal transition-colors flex-shrink-0" />
              </div>
              <p className="text-[10px] text-faint mt-1 tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity">Click to rename company</p>
            </div>
            <p className="rise rise-2 mt-5 max-w-[58ch] border-t border-line pt-5 text-[15.5px] leading-[1.65] text-dim">
              {scenario.company.stage}-stage {scenario.company.sector}, taken over mid-flight.
              Four quarters, {DEPARTMENTS.length} departments, one sitting — and a report at the
              end that grades how you decided, not how it turned out.
            </p>
          </div>

          <div className="rise rise-2 hidden justify-self-end lg:block">
            <TimerDial minutes={scenario.minutes} size={168} />
          </div>
        </div>

        {/* ── the terms, as a two-by-two matrix ──────────────────────
            Four rules stacked down a wide page put the check target a thousand pixels from
            the sentence it belongs to, and pushed the footing off a laptop screen. As a
            matrix each term is one bordered cell, the check sits beside its own words, and
            the whole gate lands inside one viewport. */}
        <div className="mt-[clamp(1.25rem,3.5vh,2.25rem)] min-h-0 overflow-y-auto border-l border-t border-line sm:grid sm:grid-cols-2">
          {TERMS.map((term, i) => {
            const on = Boolean(accepted[term.id]);
            return (
              <button
                key={term.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() =>
                  setAccepted((prev) => ({ ...prev, [term.id]: !prev[term.id] }))
                }
                className={cn(
                  "group flex w-full items-start gap-4 border-b border-r border-line px-5 py-4",
                  "text-left transition-colors duration-200",
                  on ? "bg-teal/[0.06]" : "hover:bg-[var(--panel)]",
                )}
              >
                <span
                  className={cn(
                    "num shrink-0 pt-[3px] text-[12px] transition-colors duration-200",
                    on ? "text-teal" : "text-faint",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[15px] leading-snug transition-colors duration-200",
                      on ? "text-ink" : "text-dim group-hover:text-ink",
                    )}
                  >
                    {term.label}
                  </span>
                  <span className="mt-1.5 block text-[12.5px] leading-snug text-faint">
                    {term.cost}
                  </span>
                </span>

                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-200",
                    on ? "border-teal bg-teal/20 text-teal" : "border-line-2 text-transparent",
                  )}
                >
                  <Check className="h-3 w-3" />
                </span>
              </button>
            );
          })}
        </div>

        {/* ── the opening position, and the way in ───────────────── */}
        <div className="mt-[clamp(1.25rem,3vh,2rem)] flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-4 sm:gap-x-12">
            {footing.map((figure) => (
              <div key={figure.label}>
                <dt className="tick-label">{figure.label}</dt>
                <dd className="num mt-2 text-[clamp(1.1rem,1.8vw,1.5rem)] leading-none text-ink">
                  {figure.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center gap-4">
            <p className="num text-[11.5px] text-faint">
              {count}/{TERMS.length} accepted
            </p>
            <Action onClick={() => onEnter(companyName || scenario.company.name)} disabled={!ready} size="lg">
              Take the desk
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Action>
          </div>
        </div>
      </Container>
    </div>
  );
}
