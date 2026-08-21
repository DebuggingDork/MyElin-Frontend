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

/* ── the position ─────────────────────────────────────────────────── */

type BsLine = { label: string; note: string; amount: Money | null };

/** Where the `Note` column starts. Left of it is the particular, right of it the amount. */
const NOTE_X = MARGIN + 250;

/** `Assets` / `Equity And Liabilities`. jsPDF has no underline, so the rule is drawn. */
function bsGroupHeading(c: Cursor, text: string) {
  ensureSpace(c, 26);
  c.y += 8;
  c.doc.setFont("helvetica", "bolditalic");
  c.doc.setFontSize(11);
  c.doc.setTextColor(INK);
  c.doc.text(text, MARGIN, c.y);
  c.doc.setDrawColor(INK);
  c.doc.setLineWidth(0.6);
  c.doc.line(MARGIN, c.y + 2.5, MARGIN + c.doc.getTextWidth(text), c.y + 2.5);
  c.y += 17;
}

function bsSubHeading(c: Cursor, text: string) {
  ensureSpace(c, 20);
  c.y += 5;
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(10);
  c.doc.setTextColor(INK);
  c.doc.text(text, MARGIN, c.y);
  c.y += 14;
}

function bsRow(c: Cursor, line: BsLine) {
  ensureSpace(c, 16);
  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(10);
  c.doc.setTextColor(INK_SOFT);
  c.doc.text(line.label, MARGIN + 10, c.y, { maxWidth: 225 });

  if (line.note) {
    c.doc.setFontSize(8);
    c.doc.text(line.note, NOTE_X, c.y, { maxWidth: 150 });
  }

  const has = line.amount !== null && line.amount !== undefined;
  c.doc.setFont("helvetica", has ? "normal" : "italic");
  c.doc.setFontSize(has ? 10 : 8.5);
  c.doc.setTextColor(has ? INK : INK_SOFT);
  c.doc.text(has ? formatInr(line.amount) : "not reported", PAGE_W - MARGIN, c.y, {
    align: "right",
  });
  c.y += 15;
}

/** Mirrors QuarterBalanceSheet.tsx line for line -- same order, same notes, same fallbacks. */
function drawBalanceSheet(
  c: Cursor,
  sheet: BalanceSheetSchema | null | undefined,
  closingCash: Money | null,
) {
  sectionLabel(c, `Balance sheet · as at quarter close${sheet?.as_at ? ` · ${sheet.as_at}` : ""}`);

  if (!sheet) {
    ensureSpace(c, 18);
    c.doc.setFont("helvetica", "italic");
    c.doc.setFontSize(9.5);
    c.doc.setTextColor(INK_SOFT);
    c.doc.text("No position reported for this quarter.", MARGIN, c.y);
    c.y += 16;
    return;
  }

  bsGroupHeading(c, "Assets");

  bsSubHeading(c, "Non-Current Assets:");
  bsRow(c, { label: "Property, Plant & Equipment", note: "net of depreciation", amount: sheet.property_plant_equipment_inr });
  bsRow(c, { label: "Intangible Assets", note: "capitalised innovation, amortised", amount: sheet.intangible_assets_inr });
  bsRow(c, { label: "Investments", note: "held beyond twelve months", amount: sheet.non_current_investments_inr });
  bsRow(c, { label: "Other Non-Current Assets", note: "", amount: sheet.other_non_current_assets_inr });

  bsSubHeading(c, "Current Assets:");
  bsRow(c, { label: "Inventories", note: "finished units at cost", amount: sheet.inventories_inr });
  bsRow(c, { label: "Investments", note: "treasury, within twelve months", amount: sheet.current_investments_inr });
  bsRow(c, { label: "Trade Receivables", note: "sales invoiced, not yet collected", amount: sheet.trade_receivables_inr });
  bsRow(c, {
    label: "Cash And Cash Equivalents",
    note: "closing cash balance",
    amount: sheet.cash_and_equivalents_inr ?? closingCash,
  });
  bsRow(c, { label: "Other Current Assets", note: "", amount: sheet.other_current_assets_inr });

  subtotalRow(
    c,
    "Total Assets",
    sheet.total_assets_inr != null ? formatInr(sheet.total_assets_inr) : "not reported",
  );

  bsGroupHeading(c, "Equity And Liabilities");

  bsSubHeading(c, "Equity");
  bsRow(c, { label: "Share Capital", note: "issued and paid up", amount: sheet.share_capital_inr });
  bsRow(c, { label: "Retained Earnings", note: "accumulated profit and loss", amount: sheet.retained_earnings_inr });
  bsRow(c, { label: "Other Equity", note: "", amount: sheet.other_equity_inr });

  bsSubHeading(c, "Non-Current Liabilities:");
  bsRow(c, { label: "Long-Term Borrowings", note: "credit facility drawn", amount: sheet.long_term_borrowings_inr });
  bsRow(c, { label: "Long-Term Provisions", note: "", amount: sheet.long_term_provisions_inr });
  bsRow(c, { label: "Deferred Tax Liabilities (Net)", note: "", amount: sheet.deferred_tax_liabilities_inr });
  bsRow(c, { label: "Other Non-Current Liabilities", note: "", amount: sheet.other_non_current_liabilities_inr });

  bsSubHeading(c, "Current Liabilities:");
  bsRow(c, { label: "Short-Term Borrowings", note: "repayable within twelve months", amount: sheet.short_term_borrowings_inr });
  bsRow(c, { label: "Trade Payables", note: "owed to suppliers", amount: sheet.trade_payables_inr });
  bsRow(c, { label: "Other Current Liabilities", note: "", amount: sheet.other_current_liabilities_inr });
  bsRow(c, { label: "Short-Term Provisions", note: "warranty cover", amount: sheet.short_term_provisions_inr });

  subtotalRow(
    c,
    "Total Equity And Liabilities",
    sheet.total_equity_and_liabilities_inr != null
      ? formatInr(sheet.total_equity_and_liabilities_inr)
      : "not reported",
    true,
  );

  /* Same tie-out the on-screen sheet performs, and the same refusal to stay quiet about a
     position that does not balance. */
  const assets = sheet.total_assets_inr;
  const claims = sheet.total_equity_and_liabilities_inr;
  if (assets != null && claims != null && Math.round(asNumber(assets)) !== Math.round(asNumber(claims))) {
    ensureSpace(c, 20);
    c.y += 6;
    c.doc.setFont("helvetica", "normal");
    c.doc.setFontSize(8.5);
    c.doc.setTextColor(BAD);
    c.doc.text(
      `Total equity and liabilities does not equal total assets — out by ${formatInr(Math.abs(asNumber(assets) - asNumber(claims)))}.`,
      MARGIN,
      c.y,
    );
    c.y += 14;
  }

  if (sheet.gap_reason) {
    ensureSpace(c, 20);
    c.y += 4;
    c.doc.setFont("helvetica", "italic");
    c.doc.setFontSize(8.5);
    c.doc.setTextColor(INK_SOFT);
    const lines = c.doc.splitTextToSize(sheet.gap_reason, PAGE_W - MARGIN * 2) as string[];
    c.doc.text(lines, MARGIN, c.y);
    c.y += lines.length * 11;
  }
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
    `Statement of Operations and Balance Sheet · Unaudited · Quarter ${report.quarter_number} · Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    MARGIN,
    c.y,
  );
  c.y += 18;
  rule(c, 1.5, INK);
  c.y += 24;

  sectionLabel(c, "A · Business outcome");
  drawStatement(c, report.outcome);
  c.y += 20;

  drawBalanceSheet(c, report.balance_sheet, report.outcome.closing_cash_inr.value);
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
