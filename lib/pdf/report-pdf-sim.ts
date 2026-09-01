/**
 * @deprecated This file is deprecated as of September 2026.
 * 
 * PDF generation has been migrated to the backend (Jinja2 + Playwright).
 * The new 12-page Decision Intelligence report provides richer insights than
 * this legacy simulation report.
 * 
 * See backend/docs/pdf-migration.md for migration instructions.
 * 
 * New endpoint: POST /reports/decision-intelligence/pdf
 * New schema: DecisionIntelligenceReport (12 pages, dark theme, CSS-driven layout)
 * 
 * This file will be removed in Q1 2027 after frontend migration is complete.
 */

import { jsPDF } from "jspdf";
import { cr, inr, n0, n1, pct } from "@/lib/simulation/format";
import { humanizeId } from "@/lib/format/display";
import { headcount } from "@/lib/simulation/constants";
import {
  traitRollup,
  managementStyle,
  biggestStrength,
  biggestMistake,
  mostImportantDecision,
  delayedConsequence,
  missedOpportunity,
  decisionTimeline,
} from "@/lib/simulation/scoring";
import type { QuarterScore } from "@/lib/simulation/remote";
import type {
  CompanyState,
  PriorityId,
  QuarterResultShape,
  TermSheet,
} from "@/lib/simulation/types";

// ─── Page geometry ─────────────────────────────────────────────────────────────
const PAGE_W   = 595.28;
const PAGE_H   = 841.89;
const M        = 52;          // left/right margin
const COL_R    = PAGE_W - M;  // right edge of text column
const CW       = COL_R - M;   // total content width

// ─── Shared palette ────────────────────────────────────────────────────────────
const INK        = "#111827";
const INK_MED    = "#374151";
const INK_SOFT   = "#6b7280";
const INK_HINT   = "#9ca3af";
const RULE_HAIR  = "#e5e7eb";
const RULE_MED   = "#d1d5db";
const ACCENT     = "#1e3a8a";   // deep navy
const ACCENT_LITE= "#dbeafe";
const GOOD       = "#065f46";
const BAD        = "#991b1b";
const GOOD_BG    = "#d1fae5";
const BAD_BG     = "#fee2e2";
const MUTED_BG   = "#f3f4f6";
const ZEBRA_BG   = "#f9fafb";
const PILL_BORDER= "#d1d5db";

type Cursor = { doc: jsPDF; y: number };
type Tone   = "good" | "bad" | "neutral";

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

function textH(c: Cursor, text: string, maxW: number, size: number): number {
  c.doc.setFontSize(size);
  return c.doc.getTextDimensions(text, { maxWidth: maxW }).h;
}

// ─── Section header ────────────────────────────────────────────────────────────

function section(c: Cursor, label: string) {
  page(c, 48);
  gap(c, 14);
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

// ─── Micro-label (UPPERCASE hint above a block) ────────────────────────────────

function micro(c: Cursor, text: string, x = M) {
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(7.5);
  c.doc.setTextColor(INK_HINT);
  c.doc.text(text.toUpperCase(), x, c.y);
  c.doc.setTextColor(INK);
}

// ─── Two-column ledger row ─────────────────────────────────────────────────────

function row(
  c: Cursor,
  label: string,
  value: string,
  opts?: { bold?: boolean; tone?: Tone; indent?: number },
) {
  page(c, 18);
  const x  = M + (opts?.indent ?? 0);
  const sz = opts?.bold ? 10.5 : 10;
  const vc = opts?.tone === "good" ? GOOD : opts?.tone === "bad" ? BAD : INK;
  c.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  c.doc.setFontSize(sz);
  c.doc.setTextColor(INK_MED);
  c.doc.text(label, x, c.y);
  c.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  c.doc.setTextColor(vc);
  c.doc.text(value, COL_R, c.y, { align: "right" });
  c.doc.setTextColor(INK);
  c.y += 16;
}

function zebraRow(
  c: Cursor, label: string, value: string, idx: number, opts?: { tone?: Tone },
) {
  page(c, 18);
  if (idx % 2 === 1) {
    c.doc.setFillColor(ZEBRA_BG);
    c.doc.rect(M - 4, c.y - 11, CW + 8, 16, "F");
  }
  row(c, label, value, opts);
}

// ─── Inner separator ──────────────────────────────────────────────────────────

function sep(c: Cursor) {
  gap(c, 8);
  hline(c, M + 8, COL_R - 8, 0.4, RULE_HAIR);
  gap(c, 9);
}

// ─── Pill badge ───────────────────────────────────────────────────────────────

function pillW(c: Cursor, text: string): number {
  c.doc.setFont("helvetica", "bold"); c.doc.setFontSize(8.5);
  return c.doc.getTextWidth(text) + 16;
}

function pill(c: Cursor, text: string, x: number, y: number, tone: Tone = "neutral"): number {
  const pad = 8;
  c.doc.setFont("helvetica", "bold"); c.doc.setFontSize(8.5);
  const tw = c.doc.getTextWidth(text);
  const pw = tw + pad * 2;
  const bg = tone === "good" ? GOOD_BG : tone === "bad" ? BAD_BG : MUTED_BG;
  const fg = tone === "good" ? GOOD    : tone === "bad" ? BAD    : INK_MED;
  c.doc.setFillColor(bg);
  c.doc.roundedRect(x, y - 10, pw, 15, 3, 3, "F");
  c.doc.setDrawColor(tone === "good" ? GOOD : tone === "bad" ? BAD : PILL_BORDER);
  c.doc.setLineWidth(0.4);
  c.doc.roundedRect(x, y - 10, pw, 15, 3, 3, "S");
  c.doc.setTextColor(fg);
  c.doc.text(text, x + pad, y);
  c.doc.setTextColor(INK);
  return pw;
}

// ─── Body paragraph ──────────────────────────────────────────────────────────

function para(c: Cursor, text: string, opts?: { indent?: number; color?: string; size?: number }): number {
  const maxW = COL_R - M - (opts?.indent ?? 0);
  const x    = M + (opts?.indent ?? 0);
  const sz   = opts?.size ?? 9.5;
  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(sz);
  c.doc.setTextColor(opts?.color ?? INK_SOFT);
  const h = textH(c, text, maxW, sz);
  c.doc.text(text, x, c.y, { maxWidth: maxW });
  c.y += h + 5;
  c.doc.setTextColor(INK);
  return h + 5;
}

// ─── Insight block (eyebrow + title + body) ──────────────────────────────────

function insight(c: Cursor, eyebrow: string, title: string, body: string, tone: Tone = "neutral") {
  page(c, 64);
  const tc = tone === "good" ? GOOD : tone === "bad" ? BAD : INK_MED;
  c.doc.setFillColor(tc);
  c.doc.circle(M + 3, c.y - 2, 2.5, "F");
  micro(c, eyebrow, M + 11);
  c.y += 13;
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(11);
  c.doc.setTextColor(tc);
  const th = textH(c, title, CW, 11);
  c.doc.text(title, M, c.y, { maxWidth: CW });
  c.y += th + 5;
  para(c, body, { size: 9.5 });
  gap(c, 4);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const v = (r: QuarterResultShape, k: string) => r[k] as number;
const traitTone = (p: number): Tone | undefined => p >= 70 ? "good" : p < 45 ? "bad" : undefined;

// ─── Main export ──────────────────────────────────────────────────────────────

export function buildSimulationReportPdf(
  scores: QuarterScore[],
  history: QuarterResultShape[],
  priorities: (PriorityId | null)[],
  s: CompanyState,
  ts: TermSheet | null,
  eg: Record<string, unknown> | null,
  companyName: string,
  ceoName: string,
): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const c: Cursor = { doc, y: M };

  const last      = history[history.length - 1];
  const finals    = scores.map((sc) => Number(sc.final));
  const composite = finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : 0;
  const band      =
    composite >= 90 ? "Exceptional" :
    composite >= 75 ? "Strong" :
    composite >= 60 ? "Competent" :
    composite >= 40 ? "Weak" : "Poor";

  const profile     = traitRollup(scores);
  const style       = managementStyle(history);
  const strength    = biggestStrength(scores);
  const mistake     = biggestMistake(scores);
  const decision    = mostImportantDecision(history);
  const consequence = delayedConsequence(history);
  const missed      = missedOpportunity(history, s);
  const timeline    = decisionTimeline(history, priorities);
  const sold        = Boolean(eg && eg.path === "B");

  // ── TOP BAR ───────────────────────────────────────────────────────────────────
  doc.setFillColor(ACCENT);
  doc.rect(0, 0, PAGE_W, 7, "F");
  c.y = 38;

  // Branding chip — top right, flush against margin
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor("#ffffff");
  const brandText = "MYELIN  ·  CEO PERFORMANCE REPORT";
  const bw = doc.getTextWidth(brandText) + 20;
  doc.setFillColor(ACCENT);
  doc.roundedRect(COL_R - bw, c.y - 10, bw, 16, 3, 3, "F");
  doc.text(brandText, COL_R - bw / 2, c.y, { align: "center" });

  // Company name — constrained so it never underlaps the chip
  gap(c, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(INK);
  const nameMaxW = COL_R - M - bw - 16;
  doc.text(companyName, M, c.y, { maxWidth: nameMaxW });
  c.y += doc.getTextDimensions(companyName, { maxWidth: nameMaxW }).h + 12;

  // CEO line
  micro(c, "CHIEF EXECUTIVE OFFICER");
  c.y += 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(INK_MED);
  doc.text(ceoName, M, c.y);
  c.y += 20;

  // Date + composite badge
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  doc.text(
    new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
    M, c.y,
  );
  const scoreTone: Tone = composite >= 75 ? "good" : composite < 50 ? "bad" : "neutral";
  const badgeText = n1(composite) + "  ·  " + band.toUpperCase();
  pill(c, badgeText, COL_R - pillW(c, badgeText), c.y, scoreTone);
  c.y += 22;

  // Header rule
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(1.5);
  doc.line(M, c.y, COL_R, c.y);
  c.y += 18;

  // ── OUTCOME ──────────────────────────────────────────────────────────────────
  section(c, "Final Outcome");

  const outcomeText =
    sold                    ? "You sold the company."
    : eg && eg.gameOver     ? "The company did not make it."
    : eg && eg.path === "A" ? (eg.covenantHit
                               ? "You took the money and hit the covenant."
                               : "You took the money and missed the covenant.")
                            : "You finished the year independent.";

  const outTone: Tone = sold ? "good" : (eg && eg.gameOver) ? "bad" : "neutral";
  const outColor = outTone === "good" ? GOOD : outTone === "bad" ? BAD : INK;

  doc.setFillColor(outColor);
  doc.circle(M + 3, c.y - 4, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(outColor);
  doc.text(outcomeText, M + 12, c.y);
  doc.setTextColor(INK);
  c.y += 20;

  para(c, style.why, { size: 10 });
  gap(c, 4);
  row(c, "Management style", style.label, { bold: true });
  gap(c, 10);

  // ── KEY FIGURES ───────────────────────────────────────────────────────────────
  section(c, "Key Figures");

  micro(c, "Primary metrics"); c.y += 13;
  row(c, "Revenue  (final quarter)", cr(v(last, "revenueT")), { bold: true });
  row(c, "Net cash flow", inr(v(last, "netCF")), { bold: true, tone: v(last, "netCF") >= 0 ? "good" : "bad" });
  row(c, "Cash on hand", inr(v(last, "cash")), { bold: true });
  sep(c);

  micro(c, "Customer metrics"); c.y += 13;
  row(c, "Customers", n0(v(last, "customers")));
  row(c, "Repeat rate", pct(v(last, "repeatRate")));
  row(c, "Market share", pct(v(last, "marketShare") * 100));
  sep(c);

  micro(c, "Company metrics"); c.y += 13;
  row(c, "Valuation",
    cr(eg && eg.finalValuation != null ? Number(eg.finalValuation) : v(last, "valuation")),
    { bold: true });
  row(c, "Headcount", n0(headcount(s.staff)));
  row(c, "Employee morale", n0(s.empSat) + " / 100");
  gap(c, 10);

  // ── QUARTERLY PERFORMANCE ────────────────────────────────────────────────────
  section(c, "Quarterly Performance");

  scores.forEach((sc, i) => {
    page(c, 50);
    const qf = Number(sc.final);
    const qt: Tone = qf >= 70 ? "good" : qf < 45 ? "bad" : "neutral";

    // Quarter label left, pill right — never collide
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(INK);
    doc.text("Quarter " + (i + 1), M, c.y);
    const pt = n1(qf) + "  " + sc.band;
    pill(c, pt, COL_R - pillW(c, pt), c.y, qt);
    c.y += 22;

    sc.modifiers.forEach((m) => {
      page(c, 16);
      const pts  = Number(m.points);
      const sign = pts > 0 ? "+" : "";
      const mc   = pts > 0 ? GOOD : BAD;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(mc);
      doc.text(pts > 0 ? "↑" : "↓", M + 16, c.y);
      doc.text(sign + n1(pts), M + 28, c.y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(INK_SOFT);
      doc.text(humanizeId(String(m.why)), M + 62, c.y, { maxWidth: COL_R - M - 62 });
      c.y += 15;
    });

    if (i < scores.length - 1) { gap(c, 6); sep(c); gap(c, 2); }
    else { gap(c, 10); }
  });
  doc.setTextColor(INK);

  // ── MANAGEMENT PROFILE ───────────────────────────────────────────────────────
  section(c, "Management Profile — Seven Dimensions");

  profile.forEach((t, idx) => {
    if (t.pct === null) zebraRow(c, humanizeId(t.name), "Not yet assessed", idx);
    else zebraRow(c, humanizeId(t.name), n0(t.pct) + "%", idx, { tone: traitTone(t.pct) });
  });
  gap(c, 10);

  // ── LEADERSHIP INSIGHTS ───────────────────────────────────────────────────────
  section(c, "Leadership Insights");

  insight(c, "Biggest strength",          humanizeId(strength.name),                     strength.why,        "good");
  sep(c);
  insight(c, "Biggest mistake",           humanizeId(mistake.title),                     String(mistake.why), "bad");
  sep(c);
  insight(c, "Most important decision",   "Q" + decision.q + " · " + decision.label,     decision.effect,     "neutral");
  sep(c);
  insight(c, "Unexpected consequence",    consequence.title,                             consequence.body,    "neutral");
  gap(c, 10);

  // ── DECISION TIMELINE ────────────────────────────────────────────────────────
  section(c, "Decision Timeline");

  timeline.forEach((t) => {
    const bodyMaxW = CW - 32;
    const dH = textH(c, t.decision,   bodyMaxW, 9.5);
    const cH = textH(c, t.consequence, bodyMaxW, 9.5);
    // card height: 32 header + (label 12 + gap 4 + text + gap 10) × 2
    const cardH = 32 + (12 + 4 + dH + 10) + (12 + 4 + cH + 10);

    page(c, cardH + 16);
    const top = c.y;

    // Card background + left accent strip
    doc.setFillColor(MUTED_BG);
    doc.roundedRect(M, top, CW, cardH, 5, 5, "F");
    doc.setFillColor(ACCENT);
    doc.roundedRect(M, top, 4, cardH, 2, 2, "F");

    // Quarter heading
    c.y = top + 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(ACCENT);
    doc.text("Quarter " + t.q, M + 16, c.y);
    if (t.priority) {
      const qw = doc.getTextWidth("Quarter " + t.q);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(INK_SOFT);
      doc.text("  ·  Priority: " + t.priority, M + 16 + qw + 4, c.y, { maxWidth: CW - qw - 32 });
    }

    // Decision block
    c.y = top + 32;
    micro(c, "Decision", M + 16); c.y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(INK);
    doc.text(t.decision, M + 16, c.y, { maxWidth: bodyMaxW });
    c.y += dH + 10;

    // Consequence block
    micro(c, "Consequence", M + 16); c.y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(INK_SOFT);
    doc.text(t.consequence, M + 16, c.y, { maxWidth: bodyMaxW });

    doc.setTextColor(INK);
    c.y = top + cardH + 14;
  });

  // ── MISSED OPPORTUNITY ────────────────────────────────────────────────────────
  section(c, "Missed Opportunity");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(INK);
  doc.text(missed.title, M, c.y, { maxWidth: CW });
  c.y += 16;
  para(c, missed.body);
  gap(c, 4);

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
    doc.text(companyName + "  ·  " + ceoName, M, PAGE_H - 14);
    doc.setTextColor(INK_HINT);
    doc.text("Page " + i + " of " + total, COL_R, PAGE_H - 24, { align: "right" });
  }

  return doc.output("blob");
}
