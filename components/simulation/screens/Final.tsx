"use client";

/**
 * The CEO performance report.
 *
 * The seven-dimension profile, the composite score and the per-quarter breakdown all come from
 * the engine's own scoring. Management style, the most important decision, the delayed
 * consequence, the missed opportunity and the timeline are read from the run history.
 */

import { useState } from "react";
import {
  BUFFER,
  PRIORITY_BY_ID,
  TONE_BAR,
  TONE_TEXT,
  headcount,
} from "@/lib/simulation/constants";
import { cr, inr, n0, n1, pct } from "@/lib/simulation/format";
import { formatDisplayText, formatSigned, humanizeId } from "@/lib/format/display";
import { balanceClosing, balanceOpening } from "@/lib/simulation/balance";
import { lessons } from "@/lib/simulation/insights";
import {
  biggestMistake,
  biggestStrength,
  decisionTimeline,
  delayedConsequence,
  managementStyle,
  missedOpportunity,
  mostImportantDecision,
  traitRollup,
} from "@/lib/simulation/scoring";
import { Bar, Eyebrow, LedgerRow, Panel, Stat } from "@/components/simulation/Kit";
import { QuarterCharts } from "@/components/simulation/QuarterCharts";
import { BalanceSheetDoc } from "@/components/simulation/BalanceSheetDoc";
import type { QuarterScore } from "@/lib/simulation/remote";
import type {
  CompanyState,

  PriorityId,
  QuarterResultShape,
  TermSheet,
  Tone,
} from "@/lib/simulation/types";

const v = (r: QuarterResultShape, k: string) => r[k] as number;
const traitTone = (p: number): Tone => (p >= 70 ? "good" : p >= 45 ? "watch" : "bad");

export function FinalScreen({
  ts,
  eg,
  scores,
  history,
  priorities,
  s,
  onRestart,
  busy,
}: {
  ts: TermSheet | null;
  eg: Record<string, unknown> | null;
  scores: QuarterScore[];
  history: QuarterResultShape[];
  priorities: (PriorityId | null)[];
  s: CompanyState;
  onRestart: () => void;
  busy?: boolean;
}) {
  const [openRecord, setOpenRecord] = useState(false);
  const last = history[history.length - 1];

  const finals = scores.map((s) => Number(s.final));
  const composite = finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : 0;
  const compositeBand =
    composite >= 90 ? "Exceptional" : composite >= 75 ? "Strong" : composite >= 60 ? "Competent" : composite >= 40 ? "Weak" : "Poor";

  const profile = traitRollup(scores);
  const style = managementStyle(history);
  const strength = biggestStrength(scores);
  const mistake = biggestMistake(scores);
  const decision = mostImportantDecision(history);
  const consequence = delayedConsequence(history);
  const missed = missedOpportunity(history, s);
  const timeline = decisionTimeline(history, priorities);
  const sold = Boolean(eg && eg.path === "B");

  

  return (
    <div className="space-y-6">
      <div className="bg-chrome text-white p-6">
        <Eyebrow tone="text-danger-soft">CEO performance report</Eyebrow>
        <h2 className="font-serif text-4xl mt-1">
          {sold
            ? "You sold the company."
            : eg && eg.gameOver
              ? "The company did not make it."
              : eg && eg.path === "A"
                ? eg.covenantHit
                  ? "You took the money and hit the covenant."
                  : "You took the money and missed the covenant."
                : "You finished the year independent."}
        </h2>
        <p className="text-sm text-faint mt-2">{style.why}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="inline-block border border-line-2 px-3 py-1">
            <Eyebrow tone="text-faint">Management style</Eyebrow>
            <div className="font-serif text-xl">{style.label}</div>
          </div>
          <div className="inline-block border border-line-2 px-3 py-1">
            <Eyebrow tone="text-faint">Composite score</Eyebrow>
            <div className="font-serif text-xl">
              {n1(composite)} <span className="text-faint text-sm">{compositeBand}</span>
            </div>
          </div>
        </div>
      </div>

      <Panel eyebrow="Final company outcome" title="Where twelve months left the business">
        <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Revenue, final quarter" value={cr(v(last, "revenueT"))} sub={n0(v(last, "unitsSold")) + " units"} />
          <Stat
            label="Net cash flow"
            value={inr(v(last, "netCF"))}
            tone={TONE_TEXT[v(last, "netCF") >= 0 ? "good" : "bad"]}
          />
          <Stat label="Cash" value={inr(v(last, "cash"))} tone={TONE_TEXT[v(last, "cash") < BUFFER ? "bad" : "flat"]} />
          <Stat label="Customers" value={n0(v(last, "customers"))} sub={"repeat " + pct(v(last, "repeatRate"))} />
          <Stat
            label="Market share"
            value={pct(v(last, "marketShare") * 100)}
            sub={"of a " + n0(v(last, "mktDemand")) + "-unit category"}
          />
          <Stat
            label="Valuation"
            value={cr(eg && eg.finalValuation != null ? Number(eg.finalValuation) : v(last, "valuation"))}
          />
          <Stat label="Headcount" value={n0(headcount(s.staff))} sub={"morale " + n0(s.empSat)} />
          <Stat
            label="Market position"
            value={pct(v(last, "attractShare") * 100)}
            sub="share your standing could reach"
          />
        </div>
      </Panel>

      <QuarterCharts history={history} />

      <Panel eyebrow="Market share" title="Across the year">
        {history.map((h) => (
          <LedgerRow
            key={h.q}
            label={"Quarter " + h.q}
            working={n0(v(h, "unitsSold")) + " units of a " + n0(v(h, "mktDemand")) + "-unit category"}
            value={pct(v(h, "marketShare") * 100)}
            tone={v(h, "shareDelta") >= 0 ? "text-tone-good" : "text-tone-bad"}
          />
        ))}
      </Panel>

      <Panel eyebrow="Management profile" title="How you ran it, across seven dimensions">
        <p className="text-xs text-dim mb-3">
          Share of each dimension’s available marks, averaged across the quarters played. Every
          sub-criterion is evaluated from the numbers, and each one names the evidence it read.
        </p>
        <div className="space-y-3">
          {profile.map((t) =>
            t.pct === null ? (
              <div key={t.name}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-dim">{humanizeId(t.name)}</span>
                  <span className="text-xs uppercase tracking-widest text-faint">Not yet assessed</span>
                </div>
                <div className="h-1.5 w-full border-b border-dashed border-line" />
                <div className="text-xs text-faint mt-1">
                  Every sub-criterion here is a judgment call the engine does not make.
                </div>
              </div>
            ) : (
              <div key={t.name}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-ink">{humanizeId(t.name)}</span>
                  <span className={"text-xs font-mono " + TONE_TEXT[traitTone(t.pct)]}>{n0(t.pct)}%</span>
                </div>
                <Bar value={t.pct} max={100} tone={TONE_BAR[traitTone(t.pct)]} />
              </div>
            ),
          )}
        </div>
      </Panel>

      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        <Panel eyebrow="Biggest strength" title={humanizeId(strength.name)}>
          <p className="text-sm text-ink">{strength.why}</p>
        </Panel>
        {/* `mistake.why` quotes the engine's own modifier text, so it gets the same rounding
            and de-underscoring as every other backend sentence on the page. */}
        <Panel eyebrow="Biggest mistake" title={humanizeId(mistake.title)}>
          <p className="text-sm text-ink">{formatDisplayText(mistake.why)}</p>
        </Panel>
        <Panel eyebrow="Most important decision" title={"Quarter " + decision.q + ": " + decision.label}>
          <p className="text-sm text-ink">{decision.effect}</p>
        </Panel>
        <Panel eyebrow="Unexpected consequence" title={consequence.title}>
          <p className="text-sm text-ink">{consequence.body}</p>
        </Panel>
        <Panel eyebrow="Missed opportunity" title={missed.title} className="lg:col-span-2">
          <p className="text-sm text-ink">{missed.body}</p>
        </Panel>
      </div>

      <Panel eyebrow="Principles this year demonstrated" title="What the company taught you">
        <div className="space-y-3">
          {history
            .flatMap((h, i) => lessons(h, history[i - 1]).map((l) => ({ ...l, q: i + 1 })))
            .filter((l, i, all) => all.findIndex((x) => x.title === l.title) === i)
            .slice(0, 6)
            .map((l, i) => (
              <div key={i} className="border-l-2 border-line-2 pl-3">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-serif text-base text-ink">{l.title}</span>
                  <span className="text-xs uppercase tracking-widest text-dim">first seen in Q{l.q}</span>
                </div>
                <p className="text-sm text-ink mt-0.5 leading-snug">{l.body}</p>
              </div>
            ))}
        </div>
      </Panel>

      <Panel eyebrow="How the year ran" title="Decision and consequence">
        <div className="space-y-3">
          {timeline.map((t) => (
            <div key={t.q} className="border-l-2 border-line-2 pl-4">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-serif text-lg">Quarter {t.q}</span>
                {t.priority && (
                  <span className="text-xs uppercase tracking-widest text-dim">said: {t.priority}</span>
                )}
              </div>
              <div className="text-sm text-ink mt-1">
                <span className="text-dim">Decision — </span>
                {t.decision}
              </div>
              <div className="text-sm text-ink">
                <span className="text-dim">Consequence — </span>
                {t.consequence}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {sold && eg && ts && (
        <Panel eyebrow="The reveal" title="What the business was worth if you had kept it">
          <LedgerRow label="Offer accepted" working="all cash, signed at the term sheet" value={inr(eg.price as number)} strong />
          <LedgerRow
            label="True continuation value"
            working={"Q3 valuation × (1 + momentum of " + n1(ts.M) + ")"}
            value={inr(ts.trueContinuation)}
            strong
            tone={(eg.gap as number) > 0 ? "text-tone-bad" : "text-tone-good"}
          />
          <LedgerRow
            label={(eg.gap as number) > 0 ? "Value left on the table" : "Value captured above continuation"}
            working="difference"
            value={inr(Math.abs(eg.gap as number))}
            strong
            tone={(eg.gap as number) > 0 ? "text-tone-bad" : "text-tone-good"}
          />
        </Panel>
      )}

      {eg && eg.path === "A" && ts && (
        <Panel eyebrow="Covenant settlement" title={eg.covenantHit ? "Covenant met" : "Covenant missed"}>
          <LedgerRow
            label="Target"
            working={ts.tier === "DISTRESSED" ? "close the quarter solvent" : "units sold"}
            value={ts.tier === "DISTRESSED" ? "solvency" : n0(eg.covenant as number) + " units"}
          />
          <LedgerRow
            label="Delivered"
            working="quarter four"
            value={n0(v(last, "unitsSold")) + " units"}
            strong
            tone={eg.covenantHit ? "text-tone-good" : "text-tone-bad"}
          />
          <LedgerRow
            label="Equity given up"
            working={eg.covenantHit ? "as signed" : "ratcheted on the miss"}
            value={pct((eg.equity as number) * 100)}
          />
          <LedgerRow
            label="Final valuation"
            working={eg.covenantHit ? "marked up" : "haircut"}
            value={cr(eg.finalValuation as number)}
            strong
          />
        </Panel>
      )}

      <div className="bg-raise border border-line">
        <button
          onClick={() => setOpenRecord(!openRecord)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-raise"
        >
          <div>
            <Eyebrow>Facilitator record</Eyebrow>
            <div className="font-serif text-base text-ink">Full scoring detail, quarter by quarter</div>
          </div>
          <span className="font-mono text-sm text-dim">{openRecord ? "−" : "+"}</span>
        </button>

        {openRecord && (
          <div className="border-t border-line p-4 space-y-4">
            <LedgerRow
              label="Composite"
              working={compositeBand + " · mean of the quarters played"}
              value={n1(composite) + "/100"}
              strong
            />
            {scores.map((sc, i) => {
              const fired = sc.modifiers;
              return (
                <div key={i}>
                  <LedgerRow
                    label={"Quarter " + (i + 1)}
                    working={
                      n1(Number(sc.traitTotal)) +
                      " on traits, " +
                      (Number(sc.modifierTotal) >= 0 ? "+" : "") +
                      n1(Number(sc.modifierTotal)) +
                      " modifiers · declared: " +
                      (priorities[i] ? PRIORITY_BY_ID[priorities[i]!].name : "—")
                    }
                    value={n1(Number(sc.final)) + " · " + sc.band}
                    strong
                  />
                  <ul className="pl-4 py-1 space-y-0.5">
                    {fired.map((m, j) => (
                      <li
                        key={j}
                        className={"text-xs font-mono " + (Number(m.points) > 0 ? "text-tone-good" : "text-tone-bad")}
                      >
                        {formatSigned(m.points)} {formatDisplayText(m.why)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <BalanceSheetDoc
              title="Balance sheet"
              caption="The year, as it opened and as it closed"
              openLabel="Q1 open"
              closeLabel="Q4 close"
              open={balanceOpening(history[0].entering)}
              close={balanceClosing(last)}
            />
          </div>
        )}
      </div>

      <button
        onClick={onRestart}
        disabled={busy}
        className={
          "w-full py-4 font-serif text-xl " +
          (busy ? "bg-raise-2 text-faint" : "bg-chrome text-white hover:bg-danger-deep")
        }
      >
        {busy ? "Starting a new run…" : "Run the year again"}
      </button>
    </div>
  );
}
