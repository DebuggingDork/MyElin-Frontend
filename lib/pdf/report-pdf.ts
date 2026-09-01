/**
 * @deprecated This file is deprecated as of September 2026.
 * 
 * PDF generation has been migrated to the backend (Jinja2 + Playwright).
 * See backend/docs/pdf-migration.md for migration instructions.
 * 
 * New endpoint: POST /reports/decision-intelligence/pdf
 * 
 * This file will be removed in Q1 2027 after frontend migration is complete.
 */

import { jsPDF } from "jspdf";
import { asNumber, formatInr } from "@/lib/api/catalog";
import {
  formatDecimal,
  formatDisplayText,
  formatSigned,
  humanizeId,
} from "@/lib/format/display";
import type {
  BalanceSheetSchema,
  CompanyOutcomeSchema,
  Money,
  QuarterReportResponse,
} from "@/lib/api/types";

// ─── Page geometry ─────────────────────────────────────────────────────────────
const PAGE_W  = 595.28;
const PAGE_H  = 841.89;
const M       = 52;
const COL_R   = PAGE_W - M;
const CW      = COL_R - M;
const NOTE_X  = M + 256;

// ─── Shared palette (mirrors report-pdf-sim.ts) ────────────────────────────────
const INK        = "#111827";
const INK_MED    = "#374151";
const INK_SOFT   = "#6b7280";
const INK_HINT   = "#9ca3af";
const RULE_HAIR  = "#e5e7eb";
const RULE_MED   = "#d1d5db";
const ACCENT     = "#1e3a8a";
const GOOD       = "#065f46";
const BAD        = "#991b1b";
const WARN       = "#92400e";
const GOOD_BG    = "#d1fae5";
const BAD_BG     = "#fee2e2";
const MUTED_BG   = "#f3f4f6";
const ZEBRA_BG   = "#f9fafb";

type Cursor = { doc: jsPDF; y: number };

// ─── Primitives ────────────────────────────────────────────────────────────────

function page(c: Cursor, needed: number) {
  if (c.y + needed > PAGE_H - M) { c.doc.addPage(); c.y = M; }
}

function gap(c: Cursor, h: number) { c.y += h; }

function hline(c: Cursor, x1 = M, x2 = COL_R, weight = 0.5, color = RULE_HAIR) {
  c.doc.setDrawColor(color);
  c.doc.setLineWidth(weight);
  c.doc.line(x1, c.y, x2, c.y);
}

// ─── Section header ────────────────────────────────────────────────────────────

function section(c: Cursor, label: string) {
  page(c, 44);
  gap(c, 12);
  c.doc.setFillColor(ACCENT);
  c.doc.rect(M, c.y - 2, 4, 14, "F");
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(9.5);
  c.doc.setTextColor(ACCENT);
  c.doc.text(label.toUpperCase(), M + 11, c.y + 9);
  c.y += 20;
  hline(c, M, COL_R, 0.75, RULE_MED);
  gap(c, 11);
  c.doc.setTextColor(INK);
}

// ─── Subsection label ─────────────────────────────────────────────────────────

function sub(c: Cursor, text: string) {
  page(c, 20);
  gap(c, 4);
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(7.5);
  c.doc.setTextColor(INK_HINT);
  c.doc.text(text.toUpperCase(), M, c.y);
  c.y += 13;
  c.doc.setTextColor(INK);
}

// ─── Two-column ledger row ─────────────────────────────────────────────────────

function row(
  c: Cursor,
  label: string,
  value: string,
  opts?: { bold?: boolean; color?: string; indent?: number; deltaText?: string; deltaGood?: boolean },
) {
  page(c, 16);
  const x  = M + (opts?.indent ?? 0);
  const sz = opts?.bold ? 11 : 10;
  c.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  c.doc.setFontSize(sz);
  c.doc.setTextColor(INK_SOFT);
  c.doc.text(label, x, c.y, { maxWidth: 260 });

  if (opts?.deltaText) {
    c.doc.setFont("helvetica", "normal");
    c.doc.setFontSize(7.5);
    c.doc.setTextColor(opts.deltaGood ? GOOD : BAD);
    // put delta just left of the main value
    c.doc.text(opts.deltaText, COL_R - 54, c.y, { align: "right" });
  }

  c.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  c.doc.setFontSize(sz);
  c.doc.setTextColor(opts?.color ?? INK);
  c.doc.text(value, COL_R, c.y, { align: "right" });
  c.doc.setTextColor(INK);
  c.y += sz + 6;
}

function subtotal(c: Cursor, label: string, value: string, grand = false) {
  page(c, 24);
  gap(c, 4);
  hline(c, M, COL_R, grand ? 1.2 : 0.7, INK_MED);
  if (grand) { c.y += 1.5; hline(c, M, COL_R, 0.7, INK_MED); }
  gap(c, 12);
  row(c, label, value, { bold: true, color: grand ? INK : INK_MED });
}

// ─── Balance-sheet rows ───────────────────────────────────────────────────────

function bsGroupHead(c: Cursor, text: string) {
  page(c, 26);
  gap(c, 8);
  c.doc.setFont("helvetica", "bolditalic");
  c.doc.setFontSize(11);
  c.doc.setTextColor(INK);
  c.doc.text(text, M, c.y);
  c.doc.setDrawColor(INK);
  c.doc.setLineWidth(0.6);
  c.doc.line(M, c.y + 2.5, M + c.doc.getTextWidth(text), c.y + 2.5);
  c.y += 16;
}

function bsSubHead(c: Cursor, text: string) {
  page(c, 20);
  gap(c, 4);
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(9.5);
  c.doc.setTextColor(INK_MED);
  c.doc.text(text, M, c.y);
  c.y += 13;
}

type BsLine = { label: string; note: string; amount: Money | null };

function bsRow(c: Cursor, line: BsLine, idx: number) {
  page(c, 15);
  if (idx % 2 === 1) {
    c.doc.setFillColor(ZEBRA_BG);
    c.doc.rect(M - 4, c.y - 10, CW + 8, 15, "F");
  }
  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(9.5);
  c.doc.setTextColor(INK_SOFT);
  c.doc.text(line.label, M + 10, c.y, { maxWidth: NOTE_X - M - 15 });
  if (line.note) {
    c.doc.setFontSize(7.5);
    c.doc.setTextColor(INK_HINT);
    c.doc.text(line.note, NOTE_X, c.y, { maxWidth: COL_R - NOTE_X - 60 });
  }
  const has = line.amount !== null && line.amount !== undefined;
  c.doc.setFont("helvetica", has ? "normal" : "italic");
  c.doc.setFontSize(has ? 9.5 : 8.5);
  c.doc.setTextColor(has ? INK : INK_HINT);
  c.doc.text(has ? formatInr(line.amount) : "—", COL_R, c.y, { align: "right" });
  c.y += 14;
}

// ─── P&L drawing ──────────────────────────────────────────────────────────────

type MetricLike = { value: string | number | null | undefined; delta?: string | number | null };

function metricRow(
  c: Cursor,
  label: string,
  m: MetricLike | null | undefined,
  opts?: { negative?: boolean; signed?: boolean; suffix?: string; isCount?: boolean; gapReason?: string | null },
) {
  const has = m && m.value !== null && m.value !== undefined;
  if (!has) { row(c, label, opts?.gapReason ?? "not reported", { color: INK_HINT }); return; }
  const n = asNumber(m!.value!);
  const display = opts?.isCount
    ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) + (opts.suffix ?? "")
    : opts?.negative
      ? "(" + formatInr(Math.abs(n)) + ")"
      : opts?.signed && n >= 0
        ? "+" + formatInr(n)
        : formatInr(n);

  const dn = m?.delta == null ? null : asNumber(m.delta);
  const deltaText =
    dn && dn !== 0
      ? (dn >= 0 ? "+" : "−") + (opts?.isCount
          ? Math.abs(dn).toLocaleString("en-IN", { maximumFractionDigits: 2 })
          : formatInr(Math.abs(dn)))
      : undefined;

  row(c, label, display, { deltaText, deltaGood: (dn ?? 0) >= 0 });
}

function drawStatement(c: Cursor, o: CompanyOutcomeSchema) {
  metricRow(c, "Units sold", o.units_sold, { isCount: true });
  gap(c, 6);

  sub(c, "Revenue");
  metricRow(c, "Net revenue", o.revenue_inr);
  sub(c, "Less: cost of goods sold");
  metricRow(c, "COGS", o.cogs_inr, { negative: true });
  subtotal(c, "Gross profit", formatInr(asNumber(o.gross_profit_inr.value)));
  gap(c, 10);

  sub(c, "Cash position");
  metricRow(c, "Net cash flow this quarter", o.net_cash_flow_inr, { signed: true });
  metricRow(c, "Closing cash balance", o.closing_cash_inr);
  metricRow(c, "Cash runway", o.cash_runway_quarters, {
    isCount: true, suffix: " quarters", gapReason: o.cash_runway_gap_reason,
  });
  gap(c, 6);

  subtotal(
    c,
    "Estimated valuation",
    o.valuation_inr?.value != null
      ? formatInr(asNumber(o.valuation_inr.value))
      : (o.valuation_gap_reason ?? "not reported"),
    true,
  );
}

function drawBalanceSheet(c: Cursor, sheet: BalanceSheetSchema | null | undefined, closingCash: Money | null) {
  sub(c, `Balance sheet · as at quarter close${sheet?.as_at ? " · " + sheet.as_at : ""}`);

  if (!sheet) {
    gap(c, 4);
    c.doc.setFont("helvetica", "italic");
    c.doc.setFontSize(9.5);
    c.doc.setTextColor(INK_SOFT);
    c.doc.text("No position reported for this quarter.", M, c.y);
    c.y += 16;
    return;
  }

  bsGroupHead(c, "Assets");

  let ri = 0;
  bsSubHead(c, "Non-Current Assets");
  bsRow(c, { label: "Property, Plant & Equipment",    note: "net of depreciation",                 amount: sheet.property_plant_equipment_inr }, ri++);
  bsRow(c, { label: "Intangible Assets",              note: "capitalised innovation, amortised",   amount: sheet.intangible_assets_inr }, ri++);
  bsRow(c, { label: "Investments",                    note: "held beyond twelve months",           amount: sheet.non_current_investments_inr }, ri++);
  bsRow(c, { label: "Other Non-Current Assets",       note: "",                                    amount: sheet.other_non_current_assets_inr }, ri++);

  bsSubHead(c, "Current Assets");
  bsRow(c, { label: "Inventories",                    note: "finished units at cost",              amount: sheet.inventories_inr }, ri++);
  bsRow(c, { label: "Investments",                    note: "treasury, within twelve months",      amount: sheet.current_investments_inr }, ri++);
  bsRow(c, { label: "Trade Receivables",              note: "sales invoiced, not yet collected",   amount: sheet.trade_receivables_inr }, ri++);
  bsRow(c, { label: "Cash And Cash Equivalents",      note: "closing cash balance",                amount: sheet.cash_and_equivalents_inr ?? closingCash }, ri++);
  bsRow(c, { label: "Other Current Assets",           note: "",                                    amount: sheet.other_current_assets_inr }, ri++);

  subtotal(c, "Total Assets",
    sheet.total_assets_inr != null ? formatInr(sheet.total_assets_inr) : "not reported");

  bsGroupHead(c, "Equity And Liabilities");

  ri = 0;
  bsSubHead(c, "Equity");
  bsRow(c, { label: "Share Capital",                  note: "issued and paid up",                  amount: sheet.share_capital_inr }, ri++);
  bsRow(c, { label: "Retained Earnings",              note: "accumulated profit and loss",         amount: sheet.retained_earnings_inr }, ri++);
  bsRow(c, { label: "Other Equity",                   note: "",                                    amount: sheet.other_equity_inr }, ri++);

  bsSubHead(c, "Non-Current Liabilities");
  bsRow(c, { label: "Long-Term Borrowings",           note: "credit facility drawn",               amount: sheet.long_term_borrowings_inr }, ri++);
  bsRow(c, { label: "Long-Term Provisions",           note: "",                                    amount: sheet.long_term_provisions_inr }, ri++);
  bsRow(c, { label: "Deferred Tax Liabilities (Net)", note: "",                                    amount: sheet.deferred_tax_liabilities_inr }, ri++);
  bsRow(c, { label: "Other Non-Current Liabilities",  note: "",                                    amount: sheet.other_non_current_liabilities_inr }, ri++);

  bsSubHead(c, "Current Liabilities");
  bsRow(c, { label: "Short-Term Borrowings",          note: "repayable within twelve months",      amount: sheet.short_term_borrowings_inr }, ri++);
  bsRow(c, { label: "Trade Payables",                 note: "owed to suppliers",                   amount: sheet.trade_payables_inr }, ri++);
  bsRow(c, { label: "Other Current Liabilities",      note: "",                                    amount: sheet.other_current_liabilities_inr }, ri++);
  bsRow(c, { label: "Short-Term Provisions",          note: "warranty cover",                      amount: sheet.short_term_provisions_inr }, ri++);

  subtotal(
    c,
    "Total Equity And Liabilities",
    sheet.total_equity_and_liabilities_inr != null
      ? formatInr(sheet.total_equity_and_liabilities_inr)
      : "not reported",
    true,
  );

  // Tie-out warning
  const assets  = sheet.total_assets_inr;
  const claims  = sheet.total_equity_and_liabilities_inr;
  if (assets != null && claims != null && Math.round(asNumber(assets)) !== Math.round(asNumber(claims))) {
    gap(c, 6);
    c.doc.setFont("helvetica", "normal");
    c.doc.setFontSize(8.5);
    c.doc.setTextColor(BAD);
    c.doc.text(
      "Total equity and liabilities does not equal total assets — out by " +
      formatInr(Math.abs(asNumber(assets) - asNumber(claims))) + ".",
      M, c.y, { maxWidth: CW },
    );
    c.y += 14;
  }

  if (sheet.gap_reason) {
    gap(c, 4);
    c.doc.setFont("helvetica", "italic");
    c.doc.setFontSize(8.5);
    c.doc.setTextColor(INK_SOFT);
    const lines = c.doc.splitTextToSize(sheet.gap_reason, CW) as string[];
    c.doc.text(lines, M, c.y);
    c.y += lines.length * 11;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function buildReportPdf(report: QuarterReportResponse, companyName: string): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const c: Cursor = { doc, y: M };
  const dq = report.decision_quality;

  // ── TOP BAR ───────────────────────────────────────────────────────────────────
  doc.setFillColor(ACCENT);
  doc.rect(0, 0, PAGE_W, 7, "F");
  c.y = 38;

  // Chip — top right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor("#ffffff");
  const chip = "MYELIN  ·  QUARTERLY REPORT";
  const cw   = doc.getTextWidth(chip) + 20;
  doc.setFillColor(ACCENT);
  doc.roundedRect(COL_R - cw, c.y - 10, cw, 16, 3, 3, "F");
  doc.text(chip, COL_R - cw / 2, c.y, { align: "center" });

  // Company name
  gap(c, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(INK);
  doc.text(companyName, M, c.y, { maxWidth: COL_R - M - cw - 16 });
  c.y += 26;

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  doc.text(
    "Statement of Operations and Balance Sheet  ·  Unaudited  ·  Quarter " +
    report.quarter_number + "  ·  " +
    new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    M, c.y,
  );
  c.y += 18;

  // Header rule
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(1.5);
  doc.line(M, c.y, COL_R, c.y);
  c.y += 18;

  // ── SECTION A: BUSINESS OUTCOME ──────────────────────────────────────────────
  section(c, "A  ·  Business Outcome");
  drawStatement(c, report.outcome);
  gap(c, 18);

  drawBalanceSheet(c, report.balance_sheet, report.outcome.closing_cash_inr.value);
  gap(c, 18);

  // ── BINDING CONSTRAINTS ───────────────────────────────────────────────────────
  if (report.binding_constraints.length > 0) {
    section(c, "What Limited Your Results");
    for (const g of report.binding_constraints) {
      page(c, 28);
      // Red dot marker
      doc.setFillColor(BAD);
      doc.circle(M + 3, c.y - 2, 2.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(BAD);
      doc.text(humanizeId(g.gate), M + 12, c.y);
      c.y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(INK_SOFT);
      const lines = doc.splitTextToSize(formatDisplayText(g.detail), CW) as string[];
      doc.text(lines, M, c.y);
      c.y += lines.length * 12 + 8;
    }
    gap(c, 8);
  }

  // ── SECTION B: DECISION QUALITY ───────────────────────────────────────────────
  page(c, 64);
  section(c, "B  ·  Decision Quality");

  // Big score + band
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(INK);
  doc.text(formatDecimal(dq.ceo_score, 1), M, c.y + 24);

  const scoreX = M + doc.getTextWidth(formatDecimal(dq.ceo_score, 1)) + 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(INK_MED);
  doc.text(humanizeId(dq.band), scoreX, c.y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  doc.text(
    "Mechanical points available: " + formatDecimal(dq.mechanical_points_available, 1) +
    "  ·  Unscored: " + formatDecimal(dq.unscored_points, 1),
    scoreX, c.y + 30,
  );
  c.y += 52;

  // Modifiers
  if (dq.modifiers.length > 0) {
    sub(c, "Modifiers");
    dq.modifiers.forEach((m, idx) => {
      page(c, 16);
      if (idx % 2 === 1) {
        doc.setFillColor(ZEBRA_BG);
        doc.rect(M - 4, c.y - 10, CW + 8, 16, "F");
      }
      const fired = m.fired;
      const pts   = asNumber(m.applied_points);
      const color = !fired ? INK_HINT : pts >= 0 ? GOOD : BAD;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(color);
      doc.text(fired ? formatSigned(m.applied_points) : "—", M, c.y, { maxWidth: 28 });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(fired ? INK_MED : INK_HINT);
      const detail = humanizeId(m.id) + (fired ? "  ·  " + formatDisplayText(m.detail) : "  · did not fire");
      const lines  = doc.splitTextToSize(detail, CW - 40) as string[];
      doc.text(lines, M + 38, c.y);
      c.y += Math.max(14, lines.length * 12 + 2);
    });
    gap(c, 8);
  }

  // Scored criteria
  if (dq.scored_criteria.length > 0) {
    sub(c, "Scored Criteria  ·  Mechanical");
    dq.scored_criteria.forEach((cr, idx) => {
      page(c, 14);
      if (idx % 2 === 1) {
        doc.setFillColor(ZEBRA_BG);
        doc.rect(M - 4, c.y - 10, CW + 8, 14, "F");
      }
      const label = { clearly_met: "Clearly met", partially_met: "Partially met", not_met: "Not met" }[cr.result];
      const color = { clearly_met: GOOD, partially_met: WARN, not_met: BAD }[cr.result];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(INK_SOFT);
      doc.text(humanizeId(cr.trait) + "  ·  " + humanizeId(cr.id), M, c.y, { maxWidth: CW - 80 });
      doc.setFont("helvetica", "bold");
      doc.setTextColor(color);
      doc.text(label, COL_R, c.y, { align: "right" });
      doc.setTextColor(INK);
      c.y += 13;
    });
  }

  // ── FOOTER on every page ──────────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    hline({ doc, y: PAGE_H - 38 }, M, COL_R, 0.5, RULE_HAIR);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(INK_HINT);
    doc.text("Myelin Decision Intelligence", M, PAGE_H - 24);
    doc.setTextColor(INK_SOFT);
    doc.text("Quarter " + report.quarter_number + "  ·  " + companyName, M, PAGE_H - 14);
    doc.setTextColor(INK_HINT);
    doc.text("Page " + i + " of " + total, COL_R, PAGE_H - 24, { align: "right" });
  }

  return doc.output("blob");
}
