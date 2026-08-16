"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Minus, ShieldAlert, X } from "lucide-react";
import { easeOut } from "@/lib/media";
import { asNumber, formatInr } from "@/lib/api/catalog";
import {
  formatDecimal,
  formatDisplayText,
  formatSigned,
  humanizeId,
} from "@/lib/format/display";
import { BalanceSheet } from "@/components/run/BalanceSheet";
import { ReportPdfExport } from "@/components/run/ReportPdfExport";
import type {
  BindingConstraintSchema,
  DecisionQualitySchema,
  EvidenceObservationSchema,
  QuarterReportResponse,
} from "@/lib/api/types";

export function ReportView({ report }: { report: QuarterReportResponse }) {
  const dq = report.decision_quality;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow text-teal-bright">
              Quarter {report.quarter_number} · Report
            </p>
            <span className="eyebrow rounded-full border border-emerald/30 bg-emerald/10 px-2.5 py-1 text-emerald">
              {humanizeId(report.run_status)}
            </span>
          </div>
          <h2 className="display mt-3 text-[clamp(1.6rem,3vw,2.3rem)] text-ink">
            Two independent pipelines — never conflate them.
          </h2>
        </div>
        <ReportPdfExport report={report} />
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* outcome */}
        <section className="min-w-0 space-y-4">
          <h3 className="eyebrow text-faint">A · Business outcome</h3>
          <BalanceSheet quarterNumber={report.quarter_number} outcome={report.outcome} />

          <div>
            <h4 className="mb-3 text-[14px] font-medium text-ink">
              What limited your results
            </h4>
            <GateList gates={report.binding_constraints} />
          </div>
        </section>

        {/* decision quality */}
        <section className="min-w-0 space-y-4">
          <h3 className="eyebrow text-faint">B · Decision quality</h3>
          <div className="glass-card px-5 py-6 text-center">
            <p className="display text-[48px] leading-none text-grad">
              {formatDecimal(dq.ceo_score, 1)}
            </p>
            <p className="eyebrow mt-3 text-ink">{humanizeId(dq.band)}</p>
            <p className="mt-2 text-[11.5px] text-faint">
              Mechanical points available{" "}
              {formatDecimal(dq.mechanical_points_available, 1)} · unscored{" "}
              {formatDecimal(dq.unscored_points, 1)}
            </p>
          </div>

          <QualityPanel dq={dq} />
        </section>
      </div>

      <EvidencePanel evidence={report.evidence} />

      {report.run_summary && (
        <div className="glass-card p-4">
          <p className="eyebrow text-faint">Run summary · terminal quarter</p>
          <p className="mt-2 text-[13px] text-dim">
            Terminal status:{" "}
            <span className="text-ink">
              {humanizeId(report.run_summary.terminal_status)}
            </span>
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
            <p className="text-[13px] font-medium text-rose">{humanizeId(g.gate)}</p>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">
            {formatDisplayText(g.detail)}
          </p>
        </div>
      ))}
    </div>
  );
}

function QualityPanel({ dq }: { dq: DecisionQualitySchema }) {
  return (
    <div className="space-y-3">
      <div className="glass-card p-4">
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
                {m.fired ? formatSigned(m.applied_points) : "—"}
              </span>
              <span className="text-dim">
                <span className="text-ink">{humanizeId(m.id)}</span>
                {m.fired ? ` · ${formatDisplayText(m.detail)}` : " · did not fire"}
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
              title={`${humanizeId(c.trait)} · ${humanizeId(c.id)}`}
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
            <div key={c.id} className="glass-card-flat px-4 py-3">
              <p className="text-[12.5px] text-ink">
                {humanizeId(c.trait)} · {humanizeId(c.id)}
              </p>
              <p className="mt-1 text-[12px] text-dim">{formatDisplayText(c.reason)}</p>
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
    <div className="glass-card overflow-hidden">
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
            {formatDecimal(points, 1)}
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
            className="overflow-hidden border-t border-line px-4 py-3 text-[12px] text-dim"
          >
            {formatDisplayText(detail)}
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
          <div key={trait} className="glass-card-flat p-4">
            <p className="text-[13px] font-medium text-ink">{humanizeId(trait)}</p>
            <ul className="mt-2 space-y-2">
              {rows.map((row) => (
                <li key={row.evidence_key} className="text-[12px] text-dim">
                  <span className="text-faint">
                    {row.department ? humanizeId(row.department) : "—"} ·{" "}
                    {humanizeId(row.evidence_key)}
                  </span>
                  <br />
                  {formatDisplayText(row.detail)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
