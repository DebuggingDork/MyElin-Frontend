"use client";

/**
 * The quarter, closed.
 *
 * Every figure here is the engine's, computed server-side. The management assessment is the
 * same seven-trait rubric the 22-line engine uses, and every sub-criterion states the evidence
 * it read -- so a mark can always be traced back to a number rather than taken on trust.
 */

import { useState } from "react";
import { BUFFER, PRIORITY_BY_ID, QUARTER_BRIEFS, TONE_CARD, TONE_TEXT } from "@/lib/simulation/constants";
import { cr, inr, n0, n1, pct } from "@/lib/simulation/format";
import { formatDisplayText, formatSigned, humanizeId } from "@/lib/format/display";
import { balanceClosing, balanceOpening } from "@/lib/simulation/balance";
import { lessons, whatHappened } from "@/lib/simulation/insights";
import { priorityMatch, traitVerdicts } from "@/lib/simulation/scoring";
import { Eyebrow, Panel, Stat, TeachingNote, ValuationTrendChart } from "@/components/simulation/Kit";
import { BalanceSheet, CashFlow, ConstraintChain, ProfitAndLoss } from "@/components/simulation/Statements";
import type { QuarterScore } from "@/lib/simulation/remote";
import type {
  Constraint,
  PriorityId,
  QuarterResultShape,
  Reflection,
  Tone,
} from "@/lib/simulation/types";

const v = (r: QuarterResultShape, k: string) => r[k] as number;

/** The engine's own read on how the quarter was run: seven traits, and what moved the score. */
function Assessment({ score }: { score: QuarterScore }) {
  const verdicts = traitVerdicts(score);
  const [open, setOpen] = useState(false);

  return (
    <Panel
      eyebrow="Management assessment"
      title="How you ran the company this quarter"
      right={
        <div className="text-right">
          <Eyebrow>CEO score</Eyebrow>
          <div className="font-mono text-2xl">
            {n1(Number(score.final))} <span className="text-faint text-sm">{score.band}</span>
          </div>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {verdicts.map((t) => (
          <div key={t.name} className={"border p-3 " + TONE_CARD[t.tone as Tone]}>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-base">{humanizeId(t.name)}</span>
              <span className={"text-xs uppercase tracking-widest font-semibold " + TONE_TEXT[t.tone as Tone]}>
                {t.verdict}
              </span>
            </div>
            <div className="text-xs text-dim mt-1">{formatDisplayText(t.line)}</div>
          </div>
        ))}
      </div>

      {score.modifiers.length > 0 && (
        <div className="mt-4">
          <Eyebrow tone="text-danger-deep">Adjustments that fired</Eyebrow>
          <ul className="mt-1 space-y-0.5">
            {score.modifiers.map((m, i) => (
              <li
                key={i}
                className={"text-xs font-mono " + (Number(m.points) >= 0 ? "text-teal-deep" : "text-danger-deep")}
              >
                {formatSigned(m.points)} {formatDisplayText(m.why)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <button
          onClick={() => setOpen(!open)}
          className="text-xs uppercase tracking-widest font-semibold text-dim hover:text-danger-deep border-b border-dotted border-line-2"
        >
          {open ? "Hide" : "Show"} how every mark was earned
        </button>
        <p className="text-xs text-dim mt-2">
          {n1(Number(score.traitTotal))} points from the seven traits,{" "}
          {Number(score.modifierTotal) >= 0 ? "+" : ""}
          {n1(Number(score.modifierTotal))} from adjustments. Every sub-criterion below names the evidence it read.
        </p>
        {open && (
          <div className="mt-3 space-y-3">
            {score.traits.map((t) => (
              <div key={t.name}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {humanizeId(t.name)}
                  </span>
                  <span className="font-mono text-xs text-dim">
                    {n1(Number(t.points))} / {n1(Number(t.weight))}
                  </span>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {t.subs.map((s, i) => (
                    <li key={i} className="text-xs text-dim border-l-2 border-line pl-2">
                      <span
                        className={
                          "font-mono mr-1 " +
                          (s.level === "full"
                            ? "text-teal-deep"
                            : s.level === "part"
                              ? "text-ember-deep"
                              : "text-danger-deep")
                        }
                      >
                        {s.level === "full" ? "met" : s.level === "part" ? "part" : "not met"}
                      </span>
                      {humanizeId(s.label)} — {formatDisplayText(s.detail)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

export function ClosedScreen({
  r,
  prior,
  history,
  score,
  constraint,
  priority,
  reflection,
  onNext,
  busy,
}: {
  r: QuarterResultShape;
  prior: QuarterResultShape | undefined;
  /** Every quarter closed so far, oldest first, ending at `r` -- what the trajectory chart
   * below is drawn from. Never re-derived or estimated: the same engine-computed valuation
   * the headline Stat above reads. */
  history: QuarterResultShape[];
  score: QuarterScore;
  constraint: Constraint | null;
  priority: PriorityId | null;
  reflection: Reflection;
  onNext: () => void;
  busy?: boolean;
}) {
  const [statement, setStatement] = useState<string | null>(null);
  const read = whatHappened(r);
  const match = priorityMatch(priority, r.A);
  const primary = constraint ? constraint.primary : null;
  const declared = priority ? PRIORITY_BY_ID[priority] : null;

  return (
    <div className="space-y-6">
      <div className="bg-chrome text-white p-6">
        <Eyebrow tone="text-danger-soft">
          Quarter {r.q} closed · {QUARTER_BRIEFS[r.q - 1].title}
        </Eyebrow>
        <h2 className="font-serif text-4xl mt-1">
          {n0(v(r, "unitsSold"))} units, {cr(v(r, "revenueT"))} of revenue
        </h2>
      </div>

      <div>
        <Eyebrow tone="text-danger-deep">What happened</Eyebrow>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 mt-2">
          <Stat label="Revenue" value={cr(v(r, "revenueT"))} sub={n0(v(r, "unitsSold")) + " units"} />
          <Stat
            label="Market share"
            value={pct(v(r, "marketShare") * 100)}
            tone={TONE_TEXT[v(r, "shareDelta") >= 0 ? "good" : "bad"]}
            sub={
              (v(r, "shareDelta") >= 0 ? "+" : "") +
              n1(v(r, "shareDelta") * 100) +
              " pts of a " +
              n0(v(r, "mktDemand")) +
              "-unit category"
            }
          />
          <Stat
            label="Gross margin"
            value={pct(v(r, "revenueT") > 0 ? (v(r, "grossProfit") / v(r, "revenueT")) * 100 : 0)}
            sub={"cost " + inr(r.wac.pulse as number) + " a unit"}
          />
          <Stat
            label="Net cash flow"
            value={inr(v(r, "netCF"))}
            tone={TONE_TEXT[v(r, "netCF") >= 0 ? "good" : "bad"]}
          />
          <Stat
            label="Cash"
            value={inr(v(r, "cash"))}
            tone={TONE_TEXT[v(r, "cash") < BUFFER ? "bad" : "flat"]}
            sub={"moved " + inr(v(r, "netCF"))}
          />
          <Stat label="Customers" value={n0(v(r, "customers"))} sub={"repeat " + pct(v(r, "repeatRate"))} />
          <Stat
            label="Valuation"
            value={cr(v(r, "valuation"))}
            tone={TONE_TEXT[prior ? (v(r, "valuation") > v(prior, "valuation") ? "good" : "bad") : "flat"]}
          />
          <Stat
            label="Headcount"
            value={n0(v(r, "headcount"))}
            sub={"attrition " + pct(v(r, "attritionNext")) + " next quarter"}
          />
        </div>
      </div>

      <ValuationTrendChart history={history} />

            {(r.notes as string[]).length > 0 && (
        <Panel eyebrow="Events" title="Things that happened without being asked">
          <ul className="space-y-1">
            {(r.notes as string[]).map((note, i) => (
              <li key={i} className="text-sm text-ink border-b border-line pb-1">
                {formatDisplayText(note)}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="bg-raise border border-line">
          <header className="border-b border-line px-4 py-3">
            <Eyebrow tone="text-danger-deep">What went wrong</Eyebrow>
          </header>
          <ul className="p-4 space-y-2">
            {read.wrong.map((line, i) => (
              <li key={i} className="text-sm text-ink flex gap-2">
                <span className="text-danger">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-raise border border-line">
          <header className="border-b border-line px-4 py-3">
            <Eyebrow tone="text-teal-deep">What went right</Eyebrow>
          </header>
          <ul className="p-4 space-y-2">
            {read.right.map((line, i) => (
              <li key={i} className="text-sm text-ink flex gap-2">
                <span className="text-teal-deep">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {primary && (
        <Panel eyebrow="Your biggest bottleneck" title={primary.label}>
          <div className="space-y-3">
            <div>
              <Eyebrow>Why</Eyebrow>
              <p className="text-sm text-ink mt-0.5">{primary.why}</p>
            </div>
            <div>
              <Eyebrow>Impact</Eyebrow>
              <p className="text-sm text-ink mt-0.5">{primary.impact}</p>
            </div>
            <div>
              <Eyebrow>Next quarter</Eyebrow>
              <p className="text-sm text-ink mt-0.5">{primary.next}</p>
            </div>
            <TeachingNote id="constraint" />
          </div>
        </Panel>
      )}

      {declared && (
        <Panel eyebrow="Said, did, needed" title="Were you consistent?">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Eyebrow>You said you would prioritise</Eyebrow>
              <div className="font-serif text-lg mt-1">{declared.name}</div>
            </div>
            <div>
              <Eyebrow>What your money actually did</Eyebrow>
              <div className="font-serif text-lg mt-1">
                {match ? (match.ok ? "Matched it" : "Went elsewhere") : "Nothing committed"}
              </div>
              <div className="text-xs text-dim font-mono">{match ? match.note : ""}</div>
            </div>
            <div>
              <Eyebrow>What the company needed</Eyebrow>
              <div className="font-serif text-lg mt-1">{primary ? primary.label : "—"}</div>
              <div className="text-xs text-dim">
                {reflection.constraint === (primary && primary.id) ? "You read it correctly." : "You read it differently."}
              </div>
            </div>
          </div>
        </Panel>
      )}

      <div>
        <Eyebrow tone="text-danger-deep">How the quarter narrowed</Eyebrow>
        <h3 className="font-serif text-xl mb-2">The constraint chain</h3>
        <ConstraintChain r={r} />
        <TeachingNote id="constraint" />
      </div>

      <Panel eyebrow="What this quarter taught you" title="Principles the numbers just demonstrated">
        <div className="space-y-3">
          {lessons(r, prior).map((l, i) => (
            <div key={i} className="border-l-2 border-line-2 pl-3">
              <div className="font-serif text-base text-ink">{l.title}</div>
              <p className="text-sm text-ink mt-0.5 leading-snug">{l.body}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Assessment score={score} />

      <div className="bg-raise border border-line">
        <div className="px-4 pt-3">
          <TeachingNote id="statements" inline />
        </div>
        {[
          ["pl", "Profit and loss"],
          ["cf", "Cash flow"],
          ["bs", "Balance sheet"],
        ].map(([key, label]) => (
          <div key={key} className="border-b border-line last:border-b-0">
            <button
              onClick={() => setStatement(statement === key ? null : key)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-raise"
            >
              <span className="font-serif text-base">{label}</span>
              <span className="font-mono text-sm text-dim">{statement === key ? "−" : "+"}</span>
            </button>
            {statement === key && (
              <div className="border-t border-line">
                {key === "pl" && <ProfitAndLoss r={r} />}
                {key === "cf" && <CashFlow r={r} />}
                {key === "bs" && (
                  <BalanceSheet
                    eyebrow="Balance sheet"
                    title={"Quarter " + r.q}
                    open={balanceOpening(r.entering)}
                    close={balanceClosing(r)}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={busy}
        className={
          "w-full py-4 font-serif text-xl " +
          (busy ? "bg-raise-2 text-faint" : "bg-chrome text-white hover:bg-danger-deep")
        }
      >
        {busy
          ? "Opening the next quarter…"
          : r.q === 3
            ? "The board has called a meeting"
            : r.q === 4
              ? "See how the year closed"
              : "Open quarter " + (r.q + 1)}
      </button>
    </div>
  );
}
