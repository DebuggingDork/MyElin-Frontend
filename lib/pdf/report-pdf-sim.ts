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
const MARGIN = 52;
const COL_R = PAGE_W - MARGIN; // right-aligned column x

// ─── Palette ──────────────────────────────────────────────────────────────────
const INK        = "#181a1e";
const INK_MED    = "#3d4148";
const INK_SOFT   = "#6b7280";
const RULE_LIGHT = "#e5e4de";
const ACCENT     = "#1d2c5e"; // deep navy — section headers
const GOOD       = "#15673e";
const BAD        = "#8b2020";
const GOOD_BG    = "#e9f5ee";
const BAD_BG     = "#fceaea";
const PILL_BG    = "#f0f0ec";

type Cursor = { doc: jsPDF; y: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureSpace(c: Cursor, needed: number) {
  if (c.y + needed > PAGE_H - MARGIN) {
    c.doc.addPage();
    c.y = MARGIN;
  }
}

/** Full-width hairline rule */
function rule(c: Cursor, color = RULE_LIGHT) {
  c.doc.setDrawColor(color);
  c.doc.setLineWidth(0.5);
  c.doc.line(MARGIN, c.y, COL_R, c.y);
  c.y += 1;
}

/** Vertical space */
function gap(c: Cursor, h: number) {
  c.y += h;
}

/**
 * Section header — bold uppercase label with a left accent bar.
 */
function sectionHeader(c: Cursor, label: string) {
  ensureSpace(c, 36);
  gap(c, 6);
  // left accent bar
  c.doc.setFillColor(ACCENT);
  c.doc.rect(MARGIN, c.y - 2, 3, 14, "F");
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(9);
  c.doc.setTextColor(ACCENT);
  c.doc.text(label.toUpperCase(), MARGIN + 9, c.y + 9);
  c.y += 20;
  rule(c);
  gap(c, 10);
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
  rule(c, "#ededea");
  gap(c, 8);
}

/**
 * Inline pill badge (colored background, rounded rect).
 * Returns the width used so callers can continue inline.
 */
function pill(
  c: Cursor,
  text: string,
  x: number,
  y: number,
  tone: "good" | "bad" | "neutral" = "neutral",
): number {
  const pad = 6;
  c.doc.setFontSize(8.5);
  c.doc.setFont("helvetica", "bold");
  const tw = c.doc.getTextWidth(text);
  const pw = tw + pad * 2;
  const ph = 13;
  const bg = tone === "good" ? GOOD_BG : tone === "bad" ? BAD_BG : PILL_BG;
  const fg = tone === "good" ? GOOD     : tone === "bad" ? BAD     : INK_SOFT;
  c.doc.setFillColor(bg);
  c.doc.roundedRect(x, y - 9, pw, ph, 2, 2, "F");
  c.doc.setTextColor(fg);
  c.doc.text(text, x + pad, y);
  c.doc.setTextColor(INK);
  return pw + 6;
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
  // Top accent bar spanning full width
  doc.setFillColor(ACCENT);
  doc.rect(0, 0, PAGE_W, 6, "F");

  c.y = 36;

  // Branding pill — top right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor("#ffffff");
  const brand = "MYELIN  ·  CEO PERFORMANCE REPORT";
  const bw = doc.getTextWidth(brand) + 20;
  doc.setFillColor(ACCENT);
  doc.roundedRect(COL_R - bw, c.y - 10, bw, 16, 2, 2, "F");
  doc.text(brand, COL_R - bw / 2, c.y, { align: "center" });
  doc.setTextColor(INK);

  // ── Company block ──
  gap(c, 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(INK);
  doc.text(companyName, MARGIN, c.y);
  c.y += 32;

  // ── CEO block — clearly separated ──
  // Label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(INK_SOFT);
  doc.text("CEO", MARGIN, c.y);
  // Name next to it, bolder
  const labelW = doc.getTextWidth("CEO") + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(INK_MED);
  doc.text(ceoName, MARGIN + labelW, c.y);
  c.y += 18;

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

  // Composite score badge — right side of this line
  const scoreTone = composite >= 75 ? "good" : composite < 50 ? "bad" : "neutral";
  pill(c, n1(composite) + " — " + compositeBand, COL_R - 120, c.y, scoreTone);

  c.y += 22;

  // Full-width header rule
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, c.y, COL_R, c.y);
  c.y += 18;

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
  doc.setFontSize(13);
  doc.setTextColor(INK);
  doc.text(outcomeText, MARGIN, c.y);
  c.y += 18;

  body(c, style.why);

  gap(c, 2);
  row(c, "Management style", style.label, { bold: true });
  gap(c, 4);

  // ── KEY FIGURES ──────────────────────────────────────────────────────────────
  sectionHeader(c, "Key Figures");

  row(c, "Revenue  (final quarter)", cr(v(last, "revenueT")), { bold: true });
  row(c, "Net cash flow", inr(v(last, "netCF")), {
    bold: true,
    tone: v(last, "netCF") >= 0 ? "good" : "bad",
  });
  row(c, "Cash on hand", inr(v(last, "cash")), { bold: true });
  innerRule(c);
  row(c, "Customers", n0(v(last, "customers")));
  row(c, "Repeat rate", pct(v(last, "repeatRate")));
  row(c, "Market share", pct(v(last, "marketShare") * 100));
  innerRule(c);
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
  gap(c, 4);

  // ── QUARTER SCORES ───────────────────────────────────────────────────────────
  sectionHeader(c, "Quarter Scores");

  scores.forEach((sc, i) => {
    ensureSpace(c, 40);
    const qFinal = Number(sc.final);
    const qTone: "good" | "bad" | "neutral" =
      qFinal >= 70 ? "good" : qFinal < 45 ? "bad" : "neutral";

    // Quarter label + pill on the same line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(INK);
    doc.text("Quarter " + (i + 1), MARGIN, c.y);
    pill(c, n1(qFinal) + "  " + sc.band, MARGIN + 72, c.y, qTone);
    c.y += 18;

    // Modifiers indented below
    sc.modifiers.forEach((m) => {
      ensureSpace(c, 14);
      const pts = Number(m.points);
      const sign = pts > 0 ? "+" : "";
      const modTone = pts > 0 ? GOOD : BAD;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(modTone);
      doc.text(sign + n1(pts) + "  " + humanizeId(String(m.why)), MARGIN + 14, c.y);
      c.y += 13;
    });

    if (i < scores.length - 1) {
      gap(c, 6);
      innerRule(c);
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
  sectionHeader(c, "Insights");

  insightBlock(c, "Biggest strength", humanizeId(strength.name), strength.why, "good");
  innerRule(c);
  insightBlock(c, "Biggest mistake", humanizeId(mistake.title), String(mistake.why), "bad");
  innerRule(c);
  insightBlock(
    c,
    "Most important decision",
    "Quarter " + decision.q + ": " + decision.label,
    decision.effect,
    "neutral",
  );
  innerRule(c);
  insightBlock(c, "Unexpected consequence", consequence.title, consequence.body, "neutral");
  gap(c, 4);

  // ── DECISION TIMELINE ────────────────────────────────────────────────────────
  sectionHeader(c, "Decision Timeline");

  timeline.forEach((t, idx) => {
    ensureSpace(c, 80);

    // Quarter heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(INK);
    doc.text("Quarter " + t.q, MARGIN, c.y);
    c.y += 16;

    // Priority tag (if set)
    if (t.priority) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(INK_SOFT);
      doc.text("Priority: " + t.priority, MARGIN + 12, c.y);
      c.y += 13;
    }

    // Decision
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(INK_MED);
    doc.text("Decision", MARGIN + 12, c.y);
    c.y += 12;
    body(c, t.decision, { indent: 12, size: 9.5 });

    // Consequence
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(INK_MED);
    doc.text("Consequence", MARGIN + 12, c.y);
    c.y += 12;
    body(c, t.consequence, { indent: 12, size: 9.5 });

    if (idx < timeline.length - 1) {
      gap(c, 4);
      innerRule(c);
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

    // Bottom rule
    doc.setDrawColor(RULE_LIGHT);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, PAGE_H - 36, COL_R, PAGE_H - 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(INK_SOFT);
    doc.text(
      "Myelin  ·  CEO Performance Report  ·  " + companyName + "  ·  " + ceoName,
      MARGIN,
      PAGE_H - 22,
    );
    doc.text("Page " + i + " / " + totalPages, COL_R, PAGE_H - 22, { align: "right" });
  }

  return doc.output("blob");
}
