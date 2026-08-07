"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Minus, ShieldAlert, TrendingDown, TrendingUp, X } from "lucide-react";
import { easeOut } from "@/lib/media";
import { asNumber, formatInr } from "@/lib/api/catalog";
import type {
  BindingConstraintSchema,
  DecisionQualitySchema,
  EvidenceObservationSchema,
  QuarterReportResponse,
} from "@/lib/api/types";

type LedgerRow = {
  label: string;
  value: string | number | null | undefined;
  delta?: string | number | null;
  gapReason?: string | null;
};

export function ReportView({ report }: { report: QuarterReportResponse }) {
  const o = report.outcome;
  const dq = report.decision_quality;

  const ledger: LedgerRow[] = [
    { label: "Units sold", value: o.units_sold.value, delta: o.units_sold.delta },
    { label: "Revenue", value: o.revenue_inr.value, delta: o.revenue_inr.delta },
    { label: "COGS", value: o.cogs_inr.value, delta: o.cogs_inr.delta },
    { label: "Gross profit", value: o.gross_profit_inr.value, delta: o.gross_profit_inr.delta },
    { label: "Net cash flow", value: o.net_cash_flow_inr.value, delta: o.net_cash_flow_inr.delta },
    { label: "Closing cash", value: o.closing_cash_inr.value, delta: o.closing_cash_inr.delta },
    {
      label: "Cash runway (quarters)",
      value: o.cash_runway_quarters?.value,
      delta: o.cash_runway_quarters?.delta,
      gapReason: o.cash_runway_gap_reason,
    },
    {
      label: "Valuation",
      value: o.valuation_inr?.value,
      delta: o.valuation_inr?.delta,
      gapReason: o.valuation_gap_reason,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow text-teal-bright">
            Quarter {report.quarter_number} · Report
          </p>
          <span className="eyebrow rounded-full border border-emerald/30 bg-emerald/10 px-2.5 py-1 text-emerald">
            {report.run_status}
          </span>
        </div>
        <h2 className="display mt-3 text-[clamp(1.6rem,3vw,2.3rem)] text-ink">
          Two independent pipelines — never conflate them.
        </h2>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* outcome */}
        <section className="space-y-4">
          <h3 className="eyebrow text-faint">A · Business outcome</h3>
          <div className="overflow-hidden rounded-xl border border-line bg-raise/50">
            {ledger.map((row) => {
              const isCount = row.label.startsWith("Units") || row.label.includes("runway");
              const hasValue = row.value !== null && row.value !== undefined;
              const delta = row.delta === undefined ? null : row.delta;
              const deltaNum = delta === null ? null : asNumber(delta);
              return (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2.5 last:border-0"
                >
                  <span className="text-[12.5px] text-dim">{row.label}</span>
                  <div className="flex items-center gap-2.5">
                    {deltaNum !== null && (
                      <span
                        className="num flex items-center gap-1 text-[11px]"
                        style={{ color: deltaNum >= 0 ? "var(--emerald)" : "var(--rose)" }}
                      >
                        {deltaNum >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isCount
                          ? deltaNum.toLocaleString("en-IN", { maximumFractionDigits: 2 })
                          : formatInr(deltaNum)}
                      </span>
                    )}
                    {hasValue ? (
                      <span
                        className="num text-[13px] font-semibold"
                        style={{
                          color: asNumber(row.value) < 0 ? "var(--rose)" : "var(--ink)",
                        }}
                      >
                        {isCount
                          ? asNumber(row.value).toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })
                          : formatInr(row.value)}
                      </span>
                    ) : (
                      <span className="text-[12px] italic text-faint" title={row.gapReason ?? undefined}>
                        {row.gapReason ?? "—"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <h4 className="mb-3 text-[14px] font-medium text-ink">
              What limited your results
            </h4>
            <GateList gates={report.binding_constraints} />
          </div>
        </section>

        {/* decision quality */}
        <section className="space-y-4">
          <h3 className="eyebrow text-faint">B · Decision quality</h3>
          <div className="rounded-2xl border border-line bg-raise/60 px-5 py-6 text-center">
            <p className="display text-[48px] leading-none text-grad">
              {asNumber(dq.ceo_score).toFixed(1)}
            </p>
            <p className="eyebrow mt-3 text-ink">{dq.band}</p>
            <p className="mt-2 text-[11.5px] text-faint">
              Mechanical points available{" "}
              {asNumber(dq.mechanical_points_available).toFixed(1)} · unscored{" "}
              {asNumber(dq.unscored_points).toFixed(1)}
            </p>
          </div>

          <QualityPanel dq={dq} />
        </section>
      </div>

      <EvidencePanel evidence={report.evidence} />

      {report.run_summary && (
        <div className="rounded-xl border border-line bg-raise/50 p-4">
          <p className="eyebrow text-faint">Run summary · terminal quarter</p>
          <p className="mt-2 text-[13px] text-dim">
            Terminal status:{" "}
            <span className="text-ink">{report.run_summary.terminal_status}</span>
            {report.run_summary.final_valuation_inr != null && (
              <>
                {" "}
                · Final valuation{" "}
                <span className="num text-ink">
                  {formatInr(report.run_summary.final_valuation_inr)}
                </span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function GateList({ gates }: { gates: BindingConstraintSchema[] }) {
  if (gates.length === 0) {
    return (
      <div className="rounded-xl border border-emerald/25 bg-emerald/[0.06] p-4 text-[13px] text-dim">
        No hard gates bound this quarter.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {gates.map((g) => (
        <div
          key={g.gate}
          className="rounded-xl border border-rose/30 bg-rose/[0.06] p-4"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose" />
            <p className="text-[13px] font-medium text-rose">{g.gate}</p>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">
            {g.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

function QualityPanel({ dq }: { dq: DecisionQualitySchema }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-raise/50 p-4">
        <p className="eyebrow text-faint">Modifiers</p>
        <ul className="mt-3 space-y-2">
          {dq.modifiers.map((m) => (
            <li key={m.id} className="flex items-start gap-3 text-[12.5px]">
              <span
                className="num w-10 shrink-0 text-right font-semibold"
                style={{
                  color: m.fired
                    ? asNumber(m.applied_points) >= 0
                      ? "var(--emerald)"
                      : "var(--rose)"
                    : "var(--faint)",
                }}
              >
                {m.fired
                  ? `${asNumber(m.applied_points) >= 0 ? "+" : ""}${asNumber(m.applied_points)}`
                  : "—"}
              </span>
              <span className="text-dim">
                <span className="text-ink">{m.id}</span>
                {m.fired ? ` · ${m.detail}` : " · did not fire"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 eyebrow text-faint">Scored criteria · mechanical</p>
        <div className="space-y-2">
          {dq.scored_criteria.map((c) => (
            <CriterionRow
              key={c.id}
              title={`${c.trait} · ${c.id}`}
              result={c.result}
              detail={c.detail}
              points={c.points}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 eyebrow text-faint">
          Unscored criteria · not yet assessed
        </p>
        <p className="mb-2 text-[11.5px] text-faint">
          Never show these as 0 — judgment criteria require human/LLM review.
        </p>
        <div className="space-y-2">
          {dq.unscored_criteria.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-line bg-raise/40 px-4 py-3"
            >
              <p className="text-[12.5px] text-ink">
                {c.trait} · {c.id}
              </p>
              <p className="mt-1 text-[12px] text-dim">{c.reason}</p>
              <span className="eyebrow mt-2 inline-block text-amber">
                not yet assessed
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CriterionRow({
  title,
  result,
  detail,
  points,
}: {
  title: string;
  result: "clearly_met" | "partially_met" | "not_met";
  detail: string;
  points: string | number | null;
}) {
  const [open, setOpen] = useState(false);
  const meta = {
    clearly_met: { icon: Check, color: "var(--emerald)", label: "Clearly met" },
    partially_met: {
      icon: Minus,
      color: "var(--amber)",
      label: "Partially met",
    },
    not_met: { icon: X, color: "var(--rose)", label: "Not met" },
  }[result];
  const Icon = meta.icon;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-raise/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: meta.color }} />
        <span className="min-w-0 flex-1 text-[12.5px] text-ink">{title}</span>
        <span className="eyebrow" style={{ color: meta.color }}>
          {meta.label}
        </span>
        {points != null && (
          <span className="num text-[12px] text-faint">
            {asNumber(points).toFixed(1)}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-faint" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="overflow-hidden border-t border-white/[0.05] px-4 py-3 text-[12px] text-dim"
          >
            {detail}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function EvidencePanel({
  evidence,
}: {
  evidence: Record<string, EvidenceObservationSchema[]>;
}) {
  const entries = Object.entries(evidence);
  if (entries.length === 0) return null;
  return (
    <section>
      <h3 className="eyebrow text-faint">Evidence · observations, not grades</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {entries.map(([trait, rows]) => (
          <div
            key={trait}
            className="rounded-xl border border-line bg-raise/40 p-4"
          >
            <p className="text-[13px] font-medium text-ink">{trait}</p>
            <ul className="mt-2 space-y-2">
              {rows.map((row) => (
                <li key={row.evidence_key} className="text-[12px] text-dim">
                  <span className="text-faint">
                    {row.department ?? "—"} · {row.evidence_key}
                  </span>
                  <br />
                  {row.detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
