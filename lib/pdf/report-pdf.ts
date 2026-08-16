import { jsPDF } from "jspdf";
import { asNumber, formatInr } from "@/lib/api/catalog";
import {
  formatDecimal,
  formatDisplayText,
  formatSigned,
  humanizeId,
} from "@/lib/format/display";
import type { CompanyOutcomeSchema, QuarterReportResponse } from "@/lib/api/types";

const PAGE_W = 595.28; // A4 in pt
const PAGE_H = 841.89;
const MARGIN = 48;
const INK = "#181a1e";
const INK_SOFT = "#585d66";
const RULE = "#d9d8d2";
const GOOD = "#1a7a4c";
const BAD = "#a3352f";

type Cursor = { doc: jsPDF; y: number };

function ensureSpace(c: Cursor, needed: number) {
  if (c.y + needed > PAGE_H - MARGIN) {
    c.doc.addPage();
    c.y = MARGIN;
  }
}

function rule(c: Cursor, weight = 0.75, color = RULE) {
  c.doc.setDrawColor(color);
  c.doc.setLineWidth(weight);
  c.doc.line(MARGIN, c.y, PAGE_W - MARGIN, c.y);
}

function sectionLabel(c: Cursor, text: string) {
  ensureSpace(c, 20);
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(8.5);
  c.doc.setTextColor(INK_SOFT);
  c.doc.text(text.toUpperCase(), MARGIN, c.y);
  c.y += 14;
}

/** One label-left / value-right ledger line, mirroring BalanceSheet.tsx's BsRow. */
function ledgerRow(
  c: Cursor,
  label: string,
  value: string,
  opts?: { bold?: boolean; size?: number; deltaText?: string; deltaGood?: boolean },
) {
  ensureSpace(c, 16);
  const size = opts?.size ?? 10.5;
  c.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  c.doc.setFontSize(size);
  c.doc.setTextColor(INK_SOFT);
  c.doc.text(label, MARGIN, c.y, { maxWidth: 280 });

  if (opts?.deltaText) {
    c.doc.setFont("helvetica", "normal");
    c.doc.setFontSize(8);
    c.doc.setTextColor(opts.deltaGood ? GOOD : BAD);
    c.doc.text(opts.deltaText, PAGE_W - MARGIN - 4, c.y, { align: "right" });
  }

  c.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  c.doc.setFontSize(size);
  c.doc.setTextColor(INK);
  c.doc.text(value, PAGE_W - MARGIN, c.y, { align: "right" });
  c.y += size + 7;
}

function subtotalRow(c: Cursor, label: string, value: string, grand = false) {
  ensureSpace(c, 24);
  c.y += 4;
  rule(c, grand ? 1.6 : 0.9, INK);
  if (grand) {
    c.y += 1.5;
    rule(c, 0.9, INK);
  }
  c.y += 14;
  ledgerRow(c, label, value, { bold: true, size: grand ? 13 : 11 });
}

type MetricLike = { value: string | number | null | undefined; delta?: string | number | null };

function metricRow(
  c: Cursor,
  label: string,
  m: MetricLike | null | undefined,
  opts?: { negative?: boolean; signed?: boolean; suffix?: string; isCount?: boolean; gapReason?: string | null },
) {
  const hasValue = m && m.value !== null && m.value !== undefined;
  if (!hasValue) {
    ledgerRow(c, label, opts?.gapReason ?? "not reported");
    return;
  }
  const n = asNumber(m.value);
  const display = opts?.isCount
    ? `${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}${opts?.suffix ?? ""}`
    : opts?.negative
      ? `(${formatInr(Math.abs(n))})`
      : opts?.signed && n >= 0
        ? `+${formatInr(n)}`
        : formatInr(n);

  const deltaNum = m.delta === null || m.delta === undefined ? null : asNumber(m.delta);
  const deltaText =
    deltaNum && deltaNum !== 0
      ? `${deltaNum >= 0 ? "+" : "-"}${opts?.isCount ? Math.abs(deltaNum).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : formatInr(Math.abs(deltaNum))}`
      : undefined;

  ledgerRow(c, label, display, { deltaText, deltaGood: (deltaNum ?? 0) >= 0 });
}

function drawStatement(c: Cursor, outcome: CompanyOutcomeSchema) {
  metricRow(c, "Units sold", outcome.units_sold, { isCount: true });
  c.y += 6;

  sectionLabel(c, "Revenue");
  metricRow(c, "Net revenue", outcome.revenue_inr);
  sectionLabel(c, "Less: cost of goods sold");
  metricRow(c, "COGS", outcome.cogs_inr, { negative: true });
  subtotalRow(c, "Gross profit", formatInr(asNumber(outcome.gross_profit_inr.value)));
  c.y += 10;

  sectionLabel(c, "Cash position");
  metricRow(c, "Net cash flow this quarter", outcome.net_cash_flow_inr, { signed: true });
  metricRow(c, "Closing cash balance", outcome.closing_cash_inr);
  metricRow(c, "Cash runway", outcome.cash_runway_quarters, {
    isCount: true,
    suffix: " quarters",
    gapReason: outcome.cash_runway_gap_reason,
  });
  c.y += 6;

  subtotalRow(
    c,
    "Estimated valuation",
    outcome.valuation_inr?.value != null ? formatInr(asNumber(outcome.valuation_inr.value)) : (outcome.valuation_gap_reason ?? "not reported"),
    true,
  );
}

/**
 * Builds the report as real vector text/lines, not a screenshot of the DOM -- html2canvas-style
 * DOM capture chokes on backdrop-filter/CSS custom properties (this app uses both heavily for the
 * glass-card look), and would produce a rasterized, non-selectable, larger-than-needed PDF. This
 * mirrors BalanceSheet.tsx's layout by hand instead.
 */
export function buildReportPdf(report: QuarterReportResponse, companyName: string): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const c: Cursor = { doc, y: MARGIN };
  const dq = report.decision_quality;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(INK);
  doc.text(companyName, MARGIN, c.y);
  c.y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  doc.text(
    `Statement of Operations · Unaudited · Quarter ${report.quarter_number} · Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    MARGIN,
    c.y,
  );
  c.y += 18;
  rule(c, 1.5, INK);
  c.y += 24;

  sectionLabel(c, "A · Business outcome");
  drawStatement(c, report.outcome);
  c.y += 20;

  if (report.binding_constraints.length > 0) {
    sectionLabel(c, "What limited your results");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    for (const g of report.binding_constraints) {
      ensureSpace(c, 26);
      doc.setTextColor(BAD);
      doc.setFont("helvetica", "bold");
      doc.text(humanizeId(g.gate), MARGIN, c.y);
      c.y += 12;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(INK_SOFT);
      const lines = doc.splitTextToSize(
        formatDisplayText(g.detail),
        PAGE_W - MARGIN * 2,
      ) as string[];
      doc.text(lines, MARGIN, c.y);
      c.y += lines.length * 11 + 8;
    }
    c.y += 10;
  }

  ensureSpace(c, 60);
  sectionLabel(c, "B · Decision quality");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(INK);
  doc.text(formatDecimal(dq.ceo_score, 1), MARGIN, c.y + 20);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(INK_SOFT);
  doc.text(
    `${humanizeId(dq.band)} · mechanical points available ${formatDecimal(dq.mechanical_points_available, 1)} · unscored ${formatDecimal(dq.unscored_points, 1)}`,
    MARGIN,
    c.y + 38,
  );
  c.y += 56;

  if (dq.modifiers.length > 0) {
    sectionLabel(c, "Modifiers");
    for (const m of dq.modifiers) {
      ensureSpace(c, 14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(m.fired ? (asNumber(m.applied_points) >= 0 ? GOOD : BAD) : INK_SOFT);
      const pts = m.fired ? formatSigned(m.applied_points) : "—";
      doc.text(pts, MARGIN, c.y, { maxWidth: 30 });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(INK_SOFT);
      const text = `${humanizeId(m.id)}${m.fired ? ` · ${formatDisplayText(m.detail)}` : " · did not fire"}`;
      const lines = doc.splitTextToSize(text, PAGE_W - MARGIN * 2 - 40) as string[];
      doc.text(lines, MARGIN + 40, c.y);
      c.y += Math.max(14, lines.length * 11 + 3);
    }
    c.y += 10;
  }

  if (dq.scored_criteria.length > 0) {
    sectionLabel(c, "Scored criteria · mechanical");
    for (const cr of dq.scored_criteria) {
      ensureSpace(c, 14);
      const label = { clearly_met: "Clearly met", partially_met: "Partially met", not_met: "Not met" }[cr.result];
      const color = { clearly_met: GOOD, partially_met: "#a3760f", not_met: BAD }[cr.result];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(INK);
      doc.text(`${humanizeId(cr.trait)} · ${humanizeId(cr.id)}`, MARGIN, c.y, { maxWidth: 300 });
      doc.setTextColor(color);
      doc.text(label, PAGE_W - MARGIN, c.y, { align: "right" });
      c.y += 13;
    }
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(INK_SOFT);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Myelin · Decision Intelligence Report · page ${i} of ${pageCount}`, MARGIN, PAGE_H - 24);
  }

  return doc.output("blob");
}
