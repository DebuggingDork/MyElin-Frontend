"use client";

/**
 * The quarter, closed — the report.
 *
 * Every figure here is the engine's, computed server-side. Nothing on this screen is derived
 * from anything the browser guessed: the summary reads the locked result, the readiness cards
 * read the same `readiness()` the decision screens read, and the management assessment is the
 * same seven-trait rubric the engine uses, with every sub-criterion stating the evidence it
 * read -- so a mark can always be traced back to a number rather than taken on trust.
 *
 * ── layout ───────────────────────────────────────────────────────────────────────
 * It is a financial report, so it is laid out like one: a masthead, then bands that each
 * answer one question, in the order an operator reads them.
 *
 *   masthead            what quarter this is, and the two numbers a board asks for first
 *   executive summary   eight headline figures
 *   key constraint      the single thing that bound the quarter
 *   operating readiness where the company stands going into the next one
 *   quarter performance the detail, in four ledgers
 *   decisions & impact  what was decided, what it did, and what is owed next quarter
 *   trajectory          the same figures across every closed quarter
 *   assessment          how the quarter was run, as opposed to how it turned out
 *   working papers      statements and the constraint chain, folded away
 *
 * Bands are headings over content rather than cards around content. Only the parts that are
 * genuinely a separate document -- a ledger, the assessment, a statement -- get a border, so
 * the page reads as one report rather than a stack of unrelated panels. Every grid is
 * `auto-fit`, so a row of eight or nine or four fills the width it is given at any breakpoint
 * instead of leaving a hole where a fixed column count ran out of cards.
 */

import { useState } from "react";
import {
  ARCHETYPES,
  BUFFER,
  PAY_TERMS,
  PRIORITY_BY_ID,
  QUARTER_BRIEFS,
  STRATEGY_BY_ID,
  TONE_CARD,
  TONE_TEXT,
  WARRANTY_OPTIONS,
} from "@/lib/simulation/constants";
import { cr, inr, n0, n1, pct } from "@/lib/simulation/format";
import { formatDisplayText, formatSigned, humanizeId } from "@/lib/format/display";
import { balanceClosing, balanceOpening } from "@/lib/simulation/balance";
import { changesSince, lessons, whatHappened } from "@/lib/simulation/insights";
import { priorityMatch, traitVerdicts } from "@/lib/simulation/scoring";
import { Eyebrow, Panel, ReadinessGrid, Stat, TeachingNote } from "@/components/simulation/Kit";
import { QuarterCharts } from "@/components/simulation/QuarterCharts";
import { BalanceSheet, CashFlow, ConstraintChain, ProfitAndLoss } from "@/components/simulation/Statements";
import type { QuarterScore } from "@/lib/simulation/remote";
import type {
  ArchetypeId,
  Constraint,
  PriorityId,
  QuarterResultShape,
  Readiness,
  Reflection,
  StrategyId,
  Tone,
  WarrantyId,
} from "@/lib/simulation/types";

const v = (r: QuarterResultShape, k: string) => r[k] as number;

/** Present when the engine reported it, absent when it did not. Never a substitute value. */
const has = (r: QuarterResultShape, k: string) => typeof r[k] === "number";

/* ── report furniture ─────────────────────────────────────────────────
   Four primitives, used by every band below, so section headings sit on one left rule and two
   rows of metrics are never a different height from each other. */

/** A band of the report: one heading, one body, no box. */
function Band({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="border-b border-line pb-2">
        <Eyebrow tone="text-tone-bad">{eyebrow}</Eyebrow>
        <h3 className="font-serif text-xl leading-snug text-ink">{title}</h3>
      </div>
      {children}
    </section>
  );
}

/** One line of a ledger: what it is, and the number. */
function Line({
  label,
  value,
  tone = "text-ink",
  note,
}: {
  label: string;
  value: string;
  tone?: string;
  note?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dotted border-line py-1 last:border-b-0">
      <span className="min-w-0 text-[13px] text-ink">
        {label}
        {note && <span className="ml-1.5 text-xs text-faint">{note}</span>}
      </span>
      <span className={"shrink-0 font-mono text-[13px] " + tone}>{value}</span>
    </div>
  );
}

/** A ledger of `Line`s under its own rule. Four of these make the performance band. */
function Ledger({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col border border-line bg-raise">
      <header className="border-b border-line px-3 py-2">
        <Eyebrow>{title}</Eyebrow>
      </header>
      <div className="flex-1 px-3 py-2">{children}</div>
    </div>
  );
}

/** A short list of findings — decisions, impacts, risks — under one coloured rule. */
function Findings({
  title,
  tone,
  items,
  empty,
}: {
  title: string;
  tone: Tone;
  items: React.ReactNode[];
  empty: string;
}) {
  const rule =
    tone === "good"
      ? "border-l-teal"
      : tone === "bad"
        ? "border-l-danger"
        : tone === "watch"
          ? "border-l-ember"
          : "border-l-line-2";

  return (
    <div className={"flex min-w-0 flex-col border border-line border-l-4 bg-raise " + rule}>
      <header className="border-b border-line px-3 py-2">
        <Eyebrow tone={TONE_TEXT[tone]}>{title}</Eyebrow>
      </header>
      <ul className="flex-1 space-y-1.5 px-3 py-2.5">
        {items.length === 0 ? (
          <li className="text-[13px] leading-snug text-faint">{empty}</li>
        ) : (
          items.map((item, i) => (
            <li key={i} className="text-[13px] leading-snug text-ink">
              {item}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

/* Grid templates.

   auto-fit everywhere it can be: it collapses the tracks it does not need, so a band of three
   findings or four ledgers stretches to the full width instead of ending on dead columns, and
   it does that against the width actually available -- which changes when the department rail
   opens without changing a single breakpoint.

   The summary is the exception, and it is a counting problem rather than a sizing one. Eight
   cards at `minmax(165px,1fr)` resolved to seven columns on a wide screen, which put one card
   alone on a second row with six empty cells beside it -- the worst hole on the page. Eight
   only divides cleanly by two and four, so those are the two counts it is allowed to take. */
const SUMMARY_GRID = "grid items-stretch gap-3 grid-cols-2 sm:grid-cols-4";
const LEDGER_GRID = "grid items-stretch gap-3 [grid-template-columns:repeat(auto-fit,minmax(255px,1fr))]";
const FINDINGS_GRID = "grid items-stretch gap-3 [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]";

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
          <div className="font-mono text-2xl text-ink">
            {n1(Number(score.final))} <span className="text-faint text-sm">{score.band}</span>
          </div>
        </div>
      }
    >
      <div className="grid items-stretch gap-3 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {verdicts.map((t) => (
          <div key={t.name} className={"border p-3 " + TONE_CARD[t.tone as Tone]}>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-base text-ink">{humanizeId(t.name)}</span>
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
          <Eyebrow tone="text-tone-bad">Adjustments that fired</Eyebrow>
          <ul className="mt-1 space-y-0.5">
            {score.modifiers.map((m, i) => (
              <li
                key={i}
                className={"text-xs font-mono " + (Number(m.points) >= 0 ? "text-tone-good" : "text-tone-bad")}
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
          className="text-xs uppercase tracking-widest font-semibold text-dim hover:text-tone-bad border-b border-dotted border-line-2"
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
                  <span className="text-sm font-semibold text-ink">{humanizeId(t.name)}</span>
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
                            ? "text-tone-good"
                            : s.level === "part"
                              ? "text-tone-watch"
                              : "text-tone-bad")
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
  dirs,
  priority,
  reflection,
  onNext,
  busy,
}: {
  r: QuarterResultShape;
  prior: QuarterResultShape | undefined;
  /** Every quarter closed so far, oldest first, ending at `r` -- what the trajectory charts
   * are drawn from. Never re-derived or estimated: the same engine-computed valuation the
   * masthead reads. */
  history: QuarterResultShape[];
  score: QuarterScore;
  constraint: Constraint | null;
  /** Readiness as the company now stands, read from the closed result -- the same nine
   * indicators the decision screens showed while the quarter was open, so the report and the
   * plan that produced it are read on one scale. */
  dirs: Readiness[];
  priority: PriorityId | null;
  reflection: Reflection;
  onNext: () => void;
  busy?: boolean;
}) {
  const [paper, setPaper] = useState<string | null>(null);
  const read = whatHappened(r);
  const changes = changesSince(prior, r);
  const match = priorityMatch(priority, r.A);
  const primary = constraint ? constraint.primary : null;
  const declared = priority ? PRIORITY_BY_ID[priority] : null;
  const brief = QUARTER_BRIEFS[r.q - 1];

  const revenue = v(r, "revenueT");
  const netCF = v(r, "netCF");
  const runway = netCF < 0 ? v(r, "cash") / -netCF : null;
  const margin = revenue > 0 ? (v(r, "grossProfit") / revenue) * 100 : 0;
  const tight = dirs.filter((d) => d.level === "CRITICAL" || d.level === "CONSTRAINED");

  /* Read from the fields the engine actually returns.
     `terms` and `crisis` are declared on `QuarterResultShape` but never sent -- the engine
     reports the terms through the state it left behind and the market event through two flat
     `crisisVariant`/`crisisStrategy` keys. Every one of these falls back to nothing rather
     than to a plausible-looking default: a decision the CEO did not make must not appear in a
     report of the decisions they did. */
  const warranty = WARRANTY_OPTIONS.find((w) => w.id === (r.warranty as WarrantyId));
  const terms = r.terms ?? PAY_TERMS[r.next.payTerms] ?? null;
  const variant = (r.crisis?.variant ?? (r.crisisVariant as ArchetypeId | null)) || null;
  const choice = (r.crisis?.choice ?? (r.crisisStrategy as StrategyId | null)) || null;
  const event = variant ? ARCHETYPES[variant] : null;
  const answer = choice ? STRATEGY_BY_ID[choice] : null;
  const started = r.started ?? [];
  const landed = r.landed ?? [];

  /* Decisions, as the engine recorded them. Every entry is a value that was actually sent with
     the lock -- nothing here is inferred backwards from the outcome. */
  const decisions: React.ReactNode[] = [];
  if (declared) {
    decisions.push(
      <>
        Declared priority: <span className="font-semibold">{declared.name}</span>.{" "}
        <span className="text-dim">
          {match ? (match.ok ? "Funding matched it" : "Funding went elsewhere") : "Nothing committed"}
          {match ? " — " + match.note : ""}
        </span>
      </>,
    );
  }
  if (warranty) {
    decisions.push(
      <>
        Warranty set to <span className="font-semibold">{warranty.name}</span>.{" "}
        <span className="text-dim">{warranty.conv}</span>
      </>,
    );
  }
  if (terms) {
    decisions.push(
      <>
        Payment terms <span className="font-semibold">{terms.name}</span>.{" "}
        <span className="text-dim">{terms.note}</span>
      </>,
    );
  }
  if (event) {
    decisions.push(
      <>
        {event.name}: answered by{" "}
        <span className="font-semibold">{answer ? answer.name : "no decision"}</span>.{" "}
        <span className="text-dim">{answer ? answer.thesis : "The event ran without a response."}</span>
      </>,
    );
  }
  if (started.length > 0) {
    decisions.push(
      <>
        Started {started.length} innovation {started.length === 1 ? "project" : "projects"}:{" "}
        <span className="text-dim">{started.map(humanizeId).join(", ")}</span>
      </>,
    );
  }
  if (landed.length > 0) {
    decisions.push(
      <>
        Landed <span className="text-dim">{landed.map(humanizeId).join(", ")}</span>
      </>,
    );
  }

  /* The statements, and the chain that explains them, folded away together. They are the
     evidence behind the bands above rather than a fifth thing to read, so they open on
     demand instead of adding four screens of ledger to every close. */
  const papers: { id: string; label: string; body: React.ReactNode }[] = [
    { id: "pl", label: "Profit and loss", body: <ProfitAndLoss r={r} /> },
    { id: "cf", label: "Cash flow", body: <CashFlow r={r} /> },
    {
      id: "bs",
      label: "Balance sheet",
      body: (
        <BalanceSheet
          eyebrow="Balance sheet"
          title={"Quarter " + r.q}
          open={balanceOpening(r.entering)}
          close={balanceClosing(r)}
        />
      ),
    },
    {
      id: "chain",
      label: "How the quarter narrowed",
      body: (
        <div className="p-4">
          <ConstraintChain r={r} />
          <TeachingNote id="constraint" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-7">
      {/* ── masthead ─────────────────────────────────────────────────
          The two figures a board asks for before anything else sit here rather than in the
          summary grid below, so the report states what it is and its verdict in one band. */}
      <header className="bg-chrome text-white">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <Eyebrow tone="text-danger-soft">Nadi Wear · {brief.title}</Eyebrow>
            <h2 className="mt-1 font-serif text-3xl leading-tight sm:text-4xl">Quarter {r.q} report</h2>
            <p className="mt-2 font-mono text-xs text-dim">
              {n0(v(r, "unitsSold"))} units sold · {cr(revenue)} of revenue · closed and scored
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-end gap-x-8 gap-y-3">
            <div>
              <Eyebrow>CEO score</Eyebrow>
              <div className="font-mono text-3xl leading-none">
                {n1(Number(score.final))}
                <span className="ml-2 text-sm text-faint">{score.band}</span>
              </div>
            </div>
            <div>
              <Eyebrow>Valuation</Eyebrow>
              <div className="font-mono text-3xl leading-none">{cr(v(r, "valuation"))}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── executive summary ────────────────────────────────────── */}
      <Band eyebrow="Executive summary" title="Where the company stands after this quarter">
        <div className={SUMMARY_GRID}>
          <Stat
            label="Cash"
            value={inr(v(r, "cash"))}
            tone={TONE_TEXT[v(r, "cash") < BUFFER ? "bad" : "flat"]}
            sub={"moved " + inr(netCF)}
          />
          <Stat label="Revenue" value={cr(revenue)} sub={n0(v(r, "unitsSold")) + " units"} />
          <Stat
            label="Runway"
            value={runway === null ? "Self-funding" : n1(runway) + " qtr"}
            tone={TONE_TEXT[runway === null ? "good" : runway >= 2 ? "watch" : "bad"]}
            sub={runway === null ? "cash flow positive" : "at this quarter's burn"}
          />
          <Stat
            label="Market share"
            value={pct(v(r, "marketShare") * 100)}
            tone={TONE_TEXT[v(r, "shareDelta") >= 0 ? "good" : "bad"]}
            sub={
              (v(r, "shareDelta") >= 0 ? "+" : "") +
              n1(v(r, "shareDelta") * 100) +
              " pts of " +
              n0(v(r, "mktDemand")) +
              " units"
            }
          />
          <Stat
            label="Valuation"
            value={cr(v(r, "valuation"))}
            tone={TONE_TEXT[prior ? (v(r, "valuation") > v(prior, "valuation") ? "good" : "bad") : "flat"]}
            sub={
              prior
                ? (v(r, "valuation") >= v(prior, "valuation") ? "up from " : "down from ") +
                  cr(v(prior, "valuation"))
                : "first close"
            }
          />
          <Stat label="Customers" value={n0(v(r, "customers"))} sub={n0(v(r, "repeatUnits")) + " repeat units"} />
          <Stat
            label="Satisfaction"
            value={has(r, "satisfaction") ? n0(v(r, "satisfaction")) : "—"}
            tone={TONE_TEXT[!has(r, "satisfaction") ? "flat" : v(r, "satisfaction") >= 55 ? "good" : "bad"]}
            sub="out of 100"
          />
          <Stat label="Repeat rate" value={pct(v(r, "repeatRate"))} sub={"gross margin " + pct(margin)} />
        </div>
      </Band>

      {/* ── the binding constraint ───────────────────────────────────
          Prominent by contrast rather than by size: one heavy rule and three short columns,
          instead of the full-width stack of labelled paragraphs it used to be. */}
      {primary && (
        <Band eyebrow="Key constraint" title={primary.label}>
          <div className="border border-line border-l-4 border-l-danger bg-raise">
            <div className="grid gap-x-6 gap-y-4 p-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
              <div>
                <Eyebrow>Why it bound</Eyebrow>
                <p className="mt-1 text-[13px] leading-snug text-ink">{primary.why}</p>
              </div>
              <div>
                <Eyebrow>What it cost</Eyebrow>
                <p className="mt-1 text-[13px] leading-snug text-ink">{primary.impact}</p>
              </div>
              <div>
                <Eyebrow tone="text-tone-good">Next quarter</Eyebrow>
                <p className="mt-1 text-[13px] leading-snug text-ink">{primary.next}</p>
              </div>
            </div>
            {constraint && constraint.all.length > 1 && (
              <p className="border-t border-line px-4 py-2 font-mono text-xs text-dim">
                Also pressing: {constraint.all.slice(1).map((c) => c.label).join(" · ")}
              </p>
            )}
          </div>
          <TeachingNote id="constraint" />
        </Band>
      )}

      {/* ── readiness ────────────────────────────────────────────── */}
      {dirs.length > 0 && (
        <Band eyebrow="Operating readiness" title="Where the company is tight going into the next quarter">
          <ReadinessGrid dirs={dirs} />
        </Band>
      )}

      {/* ── the detail ───────────────────────────────────────────── */}
      <Band eyebrow="Quarter performance" title="The quarter in four ledgers">
        <div className={LEDGER_GRID}>
          <Ledger title="Financial">
            <Line label="Revenue" value={cr(revenue)} />
            <Line label="Cost of goods sold" value={inr(v(r, "cogs"))} />
            <Line label="Gross profit" value={inr(v(r, "grossProfit"))} note={pct(margin)} />
            <Line label="Operating spend" value={inr(v(r, "opexSpend"))} />
            <Line label="Capital spend" value={inr(v(r, "capexSpend"))} />
            <Line
              label="Net profit"
              value={inr(v(r, "netProfit"))}
              tone={TONE_TEXT[v(r, "netProfit") >= 0 ? "good" : "bad"]}
            />
            <Line label="Net cash flow" value={inr(netCF)} tone={TONE_TEXT[netCF >= 0 ? "good" : "bad"]} />
            <Line label="Closing cash" value={inr(v(r, "cash"))} />
            <Line label="Debt outstanding" value={inr(v(r, "debtClose"))} />
          </Ledger>

          <Ledger title="Sales and customers">
            <Line label="Leads generated" value={n0(v(r, "effLeads"))} />
            <Line label="Leads worked" value={n0(v(r, "leadsUsed"))} />
            <Line
              label="Leads unworked"
              value={n0(v(r, "leadsWasted"))}
              tone={TONE_TEXT[v(r, "leadsWasted") > 0 ? "bad" : "flat"]}
            />
            <Line label="Conversion" value={pct(v(r, "finalConv"))} note={"ceiling " + pct(v(r, "ceiling"))} />
            <Line label="Units sold" value={n0(v(r, "unitsSold"))} />
            <Line label="Repeat units" value={n0(v(r, "repeatUnits"))} note={pct(v(r, "repeatRate"))} />
            <Line label="Customers" value={n0(v(r, "customers"))} />
            {has(r, "custLoss") && (
              <Line
                label="Customers lost"
                value={n0(v(r, "custLoss"))}
                tone={TONE_TEXT[v(r, "custLoss") > 0 ? "bad" : "flat"]}
              />
            )}
            {has(r, "satisfaction") && <Line label="Satisfaction" value={n0(v(r, "satisfaction"))} />}
          </Ledger>

          <Ledger title="Operations and people">
            <Line label="Installed capacity" value={n0(v(r, "installedCapacity")) + " units"} />
            <Line label="Capacity used" value={pct(v(r, "utilisation") * 100)} />
            <Line
              label="Idle capacity"
              value={n0(v(r, "idleCapacity")) + " units"}
              tone={TONE_TEXT[v(r, "idleCapacity") > 0 ? "watch" : "flat"]}
            />
            <Line
              label="Demand unfilled"
              value={n0(v(r, "unmetDemand")) + " units"}
              tone={TONE_TEXT[v(r, "unmetDemand") > 0 ? "bad" : "good"]}
            />
            <Line label="Supplier reliability" value={n0(v(r, "supplierRel"))} />
            <Line label="Headcount" value={n0(v(r, "headcount"))} />
            <Line label="Hired / let go" value={n0(v(r, "totalHired")) + " / " + n0(v(r, "totalFired"))} />
            <Line label="Salaries" value={inr(v(r, "salaries"))} />
            <Line
              label="Attrition next quarter"
              value={pct(v(r, "attritionNext"))}
              tone={TONE_TEXT[v(r, "attritionNext") > 10 ? "bad" : "flat"]}
            />
          </Ledger>

          <Ledger title="Market position">
            <Line label="Category demand" value={n0(v(r, "mktDemand")) + " units"} />
            <Line label="Demand you reached" value={n0(v(r, "demandTotal")) + " units"} />
            <Line label="Market share" value={pct(v(r, "marketShare") * 100)} />
            <Line
              label="Share change"
              value={(v(r, "shareDelta") >= 0 ? "+" : "") + n1(v(r, "shareDelta") * 100) + " pts"}
              tone={TONE_TEXT[v(r, "shareDelta") >= 0 ? "good" : "bad"]}
            />
            {has(r, "reachableDemand") && (
              <Line label="Reachable demand" value={n0(v(r, "reachableDemand")) + " units"} />
            )}
            {has(r, "demandBeyondPosition") && (
              <Line
                label="Beyond your position"
                value={n0(v(r, "demandBeyondPosition")) + " units"}
                tone={TONE_TEXT[v(r, "demandBeyondPosition") > 0 ? "watch" : "flat"]}
              />
            )}
            {has(r, "invValue") && <Line label="Stock on hand" value={inr(v(r, "invValue"))} />}
            {has(r, "holdingCost") && <Line label="Cost of holding it" value={inr(v(r, "holdingCost"))} />}
            <Line label="Warranty provision" value={inr(v(r, "warrantyCost"))} />
          </Ledger>
        </div>
      </Band>

      {/* ── decisions and their impact ───────────────────────────── */}
      <Band eyebrow="Decisions and impact" title="What you decided, and what it did">
        <div className={FINDINGS_GRID}>
          <Findings
            title="Major decisions"
            tone="flat"
            items={decisions}
            empty="Nothing beyond the default plan was committed."
          />
          <Findings
            title="Positive impact"
            tone="good"
            items={read.right}
            empty="Nothing in this quarter moved decisively in your favour."
          />
          <Findings
            title="Risks and constraints"
            tone="bad"
            items={read.wrong}
            empty="Nothing broke this quarter."
          />
        </div>

        <div className="grid items-stretch gap-3 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          <div className="flex min-w-0 flex-col border border-line bg-raise">
            <header className="border-b border-line px-3 py-2">
              <Eyebrow>What changed this quarter</Eyebrow>
            </header>
            <div className="flex-1 px-3 py-1">
              {changes.map((c, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-baseline gap-x-2 border-b border-dotted border-line py-1.5 last:border-b-0"
                >
                  <span
                    className={
                      "font-mono text-xs " +
                      (c.dir === "up" ? "text-tone-good" : c.dir === "down" ? "text-tone-bad" : "text-dim")
                    }
                  >
                    {c.dir === "up" ? "▲" : c.dir === "down" ? "▼" : "●"}
                  </span>
                  <span className="text-[13px] font-semibold text-ink">{c.label}</span>
                  <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-dim">{c.detail}</span>
                </div>
              ))}
              {/* Events the engine ran without being asked. Same list, because "what changed"
                  is one question whether the cause was a decision or the market. */}
              {(r.notes as string[]).map((note, i) => (
                <div
                  key={"note-" + i}
                  className="flex flex-wrap items-baseline gap-x-2 border-b border-dotted border-line py-1.5 last:border-b-0"
                >
                  <span className="font-mono text-xs text-dim">●</span>
                  <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-dim">
                    {formatDisplayText(note)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col border border-line border-l-4 border-l-ember bg-raise">
            <header className="border-b border-line px-3 py-2">
              <Eyebrow tone="text-tone-watch">Needs attention next quarter</Eyebrow>
            </header>
            <div className="flex-1 space-y-3 px-3 py-2.5">
              {primary && (
                <div>
                  <p className="font-serif text-base text-ink">{primary.label}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-dim">{primary.next}</p>
                </div>
              )}
              {declared && (
                <div className="border-t border-dotted border-line pt-2">
                  <Eyebrow>Said, funded, needed</Eyebrow>
                  <p className="mt-1 text-[13px] leading-snug text-ink">
                    You said <span className="font-semibold">{declared.name}</span>, your money{" "}
                    {match ? (match.ok ? "matched it" : "went elsewhere") : "committed nothing"}, and the
                    company needed <span className="font-semibold">{primary ? primary.label : "—"}</span>.
                  </p>
                  <p className="mt-1 text-xs text-dim">
                    {reflection.constraint === (primary && primary.id)
                      ? "You read the constraint correctly."
                      : "You read the constraint differently."}
                  </p>
                </div>
              )}
              {tight.length > 0 && (
                <div className="border-t border-dotted border-line pt-2">
                  <Eyebrow tone="text-tone-bad">Still tight</Eyebrow>
                  <p className="mt-1 font-mono text-xs leading-snug text-dim">
                    {tight.map((d) => d.label).join(" · ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Band>

      {/* ── trajectory ───────────────────────────────────────────── */}
      <Band eyebrow="Trajectory" title="Every quarter closed so far">
        <QuarterCharts history={history} />
      </Band>

      {/* ── what it taught ───────────────────────────────────────── */}
      <Band eyebrow="Principles" title="What the numbers just demonstrated">
        <div className="grid items-stretch gap-3 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          {lessons(r, prior).map((l, i) => (
            <div key={i} className="min-w-0 border border-line border-l-2 border-l-line-2 bg-raise p-3">
              <div className="font-serif text-base text-ink">{l.title}</div>
              <p className="mt-0.5 text-[13px] leading-snug text-ink">{l.body}</p>
            </div>
          ))}
        </div>
      </Band>

      <Assessment score={score} />

      {/* ── working papers ───────────────────────────────────────── */}
      <Band eyebrow="Working papers" title="The statements behind every figure above">
        <div className="border border-line bg-raise">
          <div className="px-4 pt-3">
            <TeachingNote id="statements" inline />
          </div>
          {papers.map((doc) => (
            <div key={doc.id} className="border-b border-line last:border-b-0">
              <button
                onClick={() => setPaper(paper === doc.id ? null : doc.id)}
                aria-expanded={paper === doc.id}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-raise-2"
              >
                <span className="font-serif text-base text-ink">{doc.label}</span>
                <span className="font-mono text-sm text-dim">{paper === doc.id ? "−" : "+"}</span>
              </button>
              {paper === doc.id && <div className="border-t border-line">{doc.body}</div>}
            </div>
          ))}
        </div>
      </Band>

      <button
        onClick={onNext}
        disabled={busy}
        className={
          "w-full py-4 font-serif text-xl transition-colors " +
          (busy ? "bg-raise-2 text-faint" : "bg-chrome text-white hover:bg-danger-deep")
        }
      >
        {busy
          ? "Opening the next quarter…"
          : r.q === 3
            ? "The board has called a meeting"
            : r.q === 4
              ? "See how the year closed"
              : "Continue to quarter " + (r.q + 1)}
      </button>
    </div>
  );
}
