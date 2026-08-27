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

// ─── Page geometry ────────────────────────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const MARGIN_INNER = 64; // for indented content blocks
const COL_R = PAGE_W - MARGIN; // right-aligned column x
const CONTENT_W = COL_R - MARGIN;

// ─── Palette ──────────────────────────────────────────────────────────────────
const INK        = "#111827";
const INK_MED    = "#374151";
const INK_SOFT   = "#6b7280";
const INK_HINT   = "#9ca3af";
const RULE_LIGHT = "#e5e7eb";
const RULE_MED   = "#d1d5db";
const ACCENT     = "#1e3a8a"; // deep navy — section headers
const ACCENT_BG  = "#dbeafe";
const GOOD       = "#065f46";
const BAD        = "#991b1b";
const GOOD_BG    = "#d1fae5";
const BAD_BG     = "#fee2e2";
const NEUTRAL_BG = "#f3f4f6";
const PILL_BORDER = "#d1d5db";

type Cursor = { doc: jsPDF; y: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureSpace(c: Cursor, needed: number) {
  if (c.y + needed > PAGE_H - MARGIN) {
    c.doc.addPage();
    c.y = MARGIN;
  }
}

/** Full-width hairline rule */
function rule(c: Cursor, color = RULE_LIGHT, weight = 0.5) {
  c.doc.setDrawColor(color);
  c.doc.setLineWidth(weight);
  c.doc.line(MARGIN, c.y, COL_R, c.y);
  c.y += 1;
}

/** Thick section divider */
function divider(c: Cursor) {
  gap(c, 6);
  c.doc.setDrawColor(ACCENT);
  c.doc.setLineWidth(2);
  c.doc.line(MARGIN, c.y, MARGIN + 40, c.y);
  c.y += 12;
}

/** Vertical space */
function gap(c: Cursor, h: number) {
  c.y += h;
}

/**
 * Section header — bold uppercase label with a left accent bar.
 */
function sectionHeader(c: Cursor, label: string) {
  ensureSpace(c, 44);
  gap(c, 12);
  // left accent bar — taller and bolder
  c.doc.setFillColor(ACCENT);
  c.doc.rect(MARGIN, c.y - 3, 4, 16, "F");
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(10);
  c.doc.setTextColor(ACCENT);
  c.doc.text(label.toUpperCase(), MARGIN + 11, c.y + 10);
  c.y += 24;
  rule(c, RULE_MED, 0.75);
  gap(c, 12);
}

/**
 * Two-column ledger row.
 * Label left, value right — both baseline-aligned.
 */
function row(
  c: Cursor,
  label: string,
  value: string,
  opts?: { bold?: boolean; tone?: "good" | "bad"; indent?: number },
) {
  ensureSpace(c, 18);
  const x = MARGIN + (opts?.indent ?? 0);
  const sz = opts?.bold ? 10.5 : 10;
  c.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  c.doc.setFontSize(sz);
  c.doc.setTextColor(INK_MED);
  c.doc.text(label, x, c.y);

  if (opts?.tone === "good") c.doc.setTextColor(GOOD);
  else if (opts?.tone === "bad") c.doc.setTextColor(BAD);
  else c.doc.setTextColor(INK);
  c.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  c.doc.text(value, COL_R, c.y, { align: "right" });

  c.doc.setTextColor(INK);
  c.y += 16;
}

/** Thin separator between groups inside a section */
function innerRule(c: Cursor) {
  gap(c, 8);
  c.doc.setDrawColor(RULE_LIGHT);
  c.doc.setLineWidth(0.5);
  c.doc.line(MARGIN + 12, c.y, COL_R - 12, c.y);
  c.y += 1;
  gap(c, 8);
}

/**
 * Info card with subtle background and rounded corners.
 */
function card(c: Cursor, content: () => void, bgColor = NEUTRAL_BG) {
  const startY = c.y;
  const pad = 14;
  c.y += pad;
  const contentStart = c.y;
  content();
  const contentEnd = c.y;
  c.y += pad;
  const cardH = c.y - startY;
  
  // Draw card background behind the content
  c.doc.setFillColor(bgColor);
  c.doc.roundedRect(MARGIN, startY, CONTENT_W, cardH, 4, 4, "F");
  
  // Redraw content on top (jsPDF draws in order)
  // This is a limitation — we'll skip the card background for now to avoid complexity
  // Instead, just add padding
  gap(c, 4);
}

/**
 * Inline pill badge (colored background, rounded rect with subtle border).
 * Returns the width used so callers can continue inline.
 */
function pill(
  c: Cursor,
  text: string,
  x: number,
  y: number,
  tone: "good" | "bad" | "neutral" = "neutral",
): number {
  const pad = 8;
  c.doc.setFontSize(8.5);
  c.doc.setFont("helvetica", "bold");
  const tw = c.doc.getTextWidth(text);
  const pw = tw + pad * 2;
  const ph = 15;
  const bg = tone === "good" ? GOOD_BG : tone === "bad" ? BAD_BG : NEUTRAL_BG;
  const fg = tone === "good" ? GOOD : tone === "bad" ? BAD : INK_MED;
  
  // Fill
  c.doc.setFillColor(bg);
  c.doc.roundedRect(x, y - 10, pw, ph, 3, 3, "FD");
  
  // Border
  c.doc.setDrawColor(tone === "good" ? GOOD : tone === "bad" ? BAD : PILL_BORDER);
  c.doc.setLineWidth(0.5);
  c.doc.roundedRect(x, y - 10, pw, ph, 3, 3, "S");
  
  // Text
  c.doc.setTextColor(fg);
  c.doc.text(text, x + pad, y);
  c.doc.setTextColor(INK);
  return pw + 8;
}

/**
 * Wrapped body text. Returns actual height used.
 */
function body(
  c: Cursor,
  text: string,
  opts?: { indent?: number; color?: string; size?: number },
): number {
  const maxW = COL_R - MARGIN - (opts?.indent ?? 0);
  const x = MARGIN + (opts?.indent ?? 0);
  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(opts?.size ?? 9.5);
  c.doc.setTextColor(opts?.color ?? INK_SOFT);
  const h = c.doc.getTextDimensions(text, { maxWidth: maxW }).h;
  c.doc.text(text, x, c.y, { maxWidth: maxW });
  c.y += h + 6;
  c.doc.setTextColor(INK);
  return h + 6;
}

/**
 * Bold insight label + colored title on same line, then body text.
 */
function insightBlock(
  c: Cursor,
  eyebrow: string,
  title: string,
  bodyText: string,
  tone: "good" | "bad" | "neutral" = "neutral",
) {
  ensureSpace(c, 60);
  // eyebrow
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(8);
  c.doc.setTextColor(INK_SOFT);
  c.doc.text(eyebrow.toUpperCase(), MARGIN, c.y);
  c.y += 13;
  // title
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(11);
  c.doc.setTextColor(tone === "good" ? GOOD : tone === "bad" ? BAD : INK);
  c.doc.text(title, MARGIN, c.y, { maxWidth: COL_R - MARGIN });
  const titleH = c.doc.getTextDimensions(title, { maxWidth: COL_R - MARGIN }).h;
  c.y += titleH + 5;
  // body
  body(c, bodyText, { size: 9.5 });
  gap(c, 6);
}

const v = (r: QuarterResultShape, k: string) => r[k] as number;
const traitTone = (p: number): "good" | "bad" | undefined =>
  p >= 70 ? "good" : p < 45 ? "bad" : undefined;

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
  const c: Cursor = { doc, y: MARGIN };

  const last = history[history.length - 1];
  const finals = scores.map((sc) => Number(sc.final));
  const composite = finals.length
    ? finals.reduce((a, b) => a + b, 0) / finals.length
    : 0;
  const compositeBand =
    composite >= 90
      ? "Exceptional"
      : composite >= 75
        ? "Strong"
        : composite >= 60
          ? "Competent"
          : composite >= 40
            ? "Weak"
            : "Poor";

  const profile = traitRollup(scores);
  const style = managementStyle(history);
  const strength = biggestStrength(scores);
  const mistake = biggestMistake(scores);
  const decision = mostImportantDecision(history);
  const consequence = delayedConsequence(history);
  const missed = missedOpportunity(history, s);
  const timeline = decisionTimeline(history, priorities);
  const sold = Boolean(eg && eg.path === "B");

  // ── HEADER BLOCK ────────────────────────────────────────────────────────────
  // Top accent bar spanning full width with gradient effect (simulated with darker tone)
  doc.setFillColor(ACCENT);
  doc.rect(0, 0, PAGE_W, 8, "F");

  c.y = 40;

  // Branding pill — top right, more refined
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor("#ffffff");
  const brand = "MYELIN  ·  CEO PERFORMANCE REPORT";
  const bw = doc.getTextWidth(brand) + 24;
  doc.setFillColor(ACCENT);
  doc.roundedRect(COL_R - bw, c.y - 11, bw, 18, 3, 3, "F");
  doc.text(brand, COL_R - bw / 2, c.y, { align: "center" });
  doc.setTextColor(INK);

  // ── Company block with wrapping to prevent overflow ──
  gap(c, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(INK);
  // Prevent company name from overlapping with branding pill
  const maxCompanyWidth = COL_R - MARGIN - bw - 20;
  doc.text(companyName, MARGIN, c.y, { maxWidth: maxCompanyWidth });
  const companyH = doc.getTextDimensions(companyName, { maxWidth: maxCompanyWidth }).h;
  c.y += companyH + 14;

  // ── CEO block — clearly separated with label-value pattern ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(INK_HINT);
  doc.text("CHIEF EXECUTIVE OFFICER", MARGIN, c.y);
  c.y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(INK_MED);
  doc.text(ceoName, MARGIN, c.y);
  c.y += 22;

  // Date + composite score on the same line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  const dateStr = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(dateStr, MARGIN, c.y);

  // Composite score badge — right side of this line, larger
  const scoreTone = composite >= 75 ? "good" : composite < 50 ? "bad" : "neutral";
  pill(c, n1(composite) + "  ·  " + compositeBand.toUpperCase(), COL_R - 140, c.y, scoreTone);

  c.y += 24;

  // Full-width header rule with emphasis
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(2);
  doc.line(MARGIN, c.y, COL_R, c.y);
  c.y += 20;

  // ── OUTCOME ─────────────────────────────────────────────────────────────────
  sectionHeader(c, "Final Outcome");

  const outcomeText = sold
    ? "You sold the company."
    : eg && eg.gameOver
      ? "The company did not make it."
      : eg && eg.path === "A"
        ? eg.covenantHit
          ? "You took the money and hit the covenant."
          : "You took the money and missed the covenant."
        : "You finished the year independent.";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(INK);
  doc.text(outcomeText, MARGIN, c.y);
  c.y += 20;

  body(c, style.why, { size: 10 });

  gap(c, 6);
  row(c, "Management style", style.label, { bold: true });
  gap(c, 8);

  // ── KEY FIGURES ──────────────────────────────────────────────────────────────
  sectionHeader(c, "Key Figures");

  // Highlight metrics
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(INK_HINT);
  doc.text("PRIMARY METRICS", MARGIN, c.y);
  c.y += 12;
  
  row(c, "Revenue  (final quarter)", cr(v(last, "revenueT")), { bold: true });
  row(c, "Net cash flow", inr(v(last, "netCF")), {
    bold: true,
    tone: v(last, "netCF") >= 0 ? "good" : "bad",
  });
  row(c, "Cash on hand", inr(v(last, "cash")), { bold: true });
  innerRule(c);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(INK_HINT);
  doc.text("CUSTOMER METRICS", MARGIN, c.y);
  c.y += 12;
  
  row(c, "Customers", n0(v(last, "customers")));
  row(c, "Repeat rate", pct(v(last, "repeatRate")));
  row(c, "Market share", pct(v(last, "marketShare") * 100));
  innerRule(c);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(INK_HINT);
  doc.text("COMPANY METRICS", MARGIN, c.y);
  c.y += 12;
  
  row(
    c,
    "Valuation",
    cr(
      eg && eg.finalValuation != null
        ? Number(eg.finalValuation)
        : v(last, "valuation"),
    ),
    { bold: true },
  );
  row(c, "Headcount", n0(headcount(s.staff)));
  row(c, "Employee morale", n0(s.empSat) + " / 100");
  gap(c, 8);

  // ── QUARTER SCORES ───────────────────────────────────────────────────────────
  sectionHeader(c, "Quarterly Performance");

  scores.forEach((sc, i) => {
    ensureSpace(c, 50);
    const qFinal = Number(sc.final);
    const qTone: "good" | "bad" | "neutral" =
      qFinal >= 70 ? "good" : qFinal < 45 ? "bad" : "neutral";

    // Quarter label + pill on the same line with better spacing
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(INK);
    const qLabel = "Quarter " + (i + 1);
    doc.text(qLabel, MARGIN, c.y);
    const labelW = doc.getTextWidth(qLabel);
    pill(c, n1(qFinal) + "  " + sc.band, MARGIN + labelW + 16, c.y, qTone);
    c.y += 22;

    // Modifiers indented below with proper spacing and alignment
    if (sc.modifiers.length > 0) {
      sc.modifiers.forEach((m) => {
        ensureSpace(c, 16);
        const pts = Number(m.points);
        const sign = pts > 0 ? "+" : "";
        const modTone = pts > 0 ? GOOD : BAD;
        const bullet = pts > 0 ? "↑" : "↓";
        
        // Draw bullet and points
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(modTone);
        doc.text(bullet, MARGIN + 16, c.y);
        doc.text(sign + n1(pts), MARGIN + 28, c.y);
        
        // Draw reason text with proper left margin
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(INK_SOFT);
        const reasonText = humanizeId(String(m.why));
        doc.text(reasonText, MARGIN + 60, c.y, { maxWidth: COL_R - MARGIN - 60 });
        
        c.y += 15;
      });
    }

    if (i < scores.length - 1) {
      gap(c, 8);
      innerRule(c);
      gap(c, 4);
    } else {
      gap(c, 8);
    }
  });

  doc.setTextColor(INK);

  // ── MANAGEMENT PROFILE ───────────────────────────────────────────────────────
  sectionHeader(c, "Management Profile — Seven Dimensions");

  profile.forEach((t) => {
    if (t.pct === null) {
      row(c, humanizeId(t.name), "Not yet assessed");
    } else {
      row(c, humanizeId(t.name), n0(t.pct) + "%", { tone: traitTone(t.pct) });
    }
  });
  gap(c, 4);

  // ── INSIGHTS ─────────────────────────────────────────────────────────────────
  sectionHeader(c, "Leadership Insights");

  insightBlock(c, "Biggest strength", humanizeId(strength.name), strength.why, "good");
  gap(c, 4);
  innerRule(c);
  insightBlock(c, "Biggest mistake", humanizeId(mistake.title), String(mistake.why), "bad");
  gap(c, 4);
  innerRule(c);
  insightBlock(
    c,
    "Most important decision",
    "Quarter " + decision.q + ": " + decision.label,
    decision.effect,
    "neutral",
  );
  gap(c, 4);
  innerRule(c);
  insightBlock(c, "Unexpected consequence", consequence.title, consequence.body, "neutral");
  gap(c, 8);

  // ── DECISION TIMELINE ────────────────────────────────────────────────────────
  sectionHeader(c, "Decision Timeline");

  timeline.forEach((t, idx) => {
    ensureSpace(c, 90);

    // Quarter heading with subtle background
    const qHeadStart = c.y;
    doc.setFillColor(NEUTRAL_BG);
    doc.roundedRect(MARGIN, c.y - 4, CONTENT_W, 22, 3, 3, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(ACCENT);
    doc.text("Quarter " + t.q, MARGIN + 10, c.y + 10);

    // Priority tag on same line if exists
    if (t.priority) {
      const qw = doc.getTextWidth("Quarter " + t.q);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(INK_SOFT);
      doc.text("·  Priority: " + t.priority, MARGIN + 10 + qw + 8, c.y + 10);
    }
    
    c.y += 26;

    // Decision
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(INK_MED);
    doc.text("Decision", MARGIN + 14, c.y);
    c.y += 13;
    body(c, t.decision, { indent: 14, size: 9.5 });

    // Consequence
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(INK_MED);
    doc.text("Consequence", MARGIN + 14, c.y);
    c.y += 13;
    body(c, t.consequence, { indent: 14, size: 9.5 });

    if (idx < timeline.length - 1) {
      gap(c, 6);
      innerRule(c);
      gap(c, 4);
    } else {
      gap(c, 8);
    }
  });

  // ── MISSED OPPORTUNITY ───────────────────────────────────────────────────────
  sectionHeader(c, "Missed Opportunity");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(INK);
  doc.text(missed.title, MARGIN, c.y);
  c.y += 16;
  body(c, missed.body);
  gap(c, 4);

  // ── FOOTER on every page ─────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bottom rule with subtle styling
    doc.setDrawColor(RULE_LIGHT);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, PAGE_H - 40, COL_R, PAGE_H - 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(INK_HINT);
    doc.text(
      "Myelin Decision Intelligence",
      MARGIN,
      PAGE_H - 26,
    );
    
    doc.setTextColor(INK_SOFT);
    doc.text(companyName + "  ·  " + ceoName, MARGIN, PAGE_H - 16);
    
    doc.setTextColor(INK_HINT);
    doc.text("Page " + i + " of " + totalPages, COL_R, PAGE_H - 26, { align: "right" });
  }

  return doc.output("blob");
}
