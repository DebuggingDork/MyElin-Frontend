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

const PAGE_W = 595.28;
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

function rule(c: Cursor) {
  c.doc.setDrawColor(RULE);
  c.doc.setLineWidth(1);
  c.doc.line(MARGIN, c.y, PAGE_W - MARGIN, c.y);
  c.y += 16;
}

function sectionLabel(c: Cursor, label: string) {
  ensureSpace(c, 40);
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(11);
  c.doc.setTextColor(INK);
  c.doc.text(label.toUpperCase(), MARGIN, c.y);
  c.y += 20;
}

function ledgerRow(
  c: Cursor,
  label: string,
  value: string,
  opts?: { strong?: boolean; tone?: string },
) {
  ensureSpace(c, 20);
  c.doc.setFont("helvetica", opts?.strong ? "bold" : "normal");
  c.doc.setFontSize(opts?.strong ? 11 : 10);
  c.doc.setTextColor(INK);
  c.doc.text(label, MARGIN, c.y);
  c.doc.setFont("helvetica", opts?.strong ? "bold" : "normal");
  c.doc.setFontSize(opts?.strong ? 11 : 10);
  if (opts?.tone === "good") c.doc.setTextColor(GOOD);
  else if (opts?.tone === "bad") c.doc.setTextColor(BAD);
  else c.doc.setTextColor(INK);
  c.doc.text(value, PAGE_W - MARGIN, c.y, { align: "right" });
  c.doc.setTextColor(INK);
  c.y += 18;
}

const v = (r: QuarterResultShape, k: string) => r[k] as number;
const traitTone = (p: number): "good" | "watch" | "bad" =>
  p >= 70 ? "good" : p >= 45 ? "watch" : "bad";

export function buildSimulationReportPdf(
  scores: QuarterScore[],
  history: QuarterResultShape[],
  priorities: (PriorityId | null)[],
  s: CompanyState,
  ts: TermSheet | null,
  eg: Record<string, unknown> | null,
  companyName: string,
): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const c: Cursor = { doc, y: MARGIN };

  // Clean company name by removing email suffix
  const cleanName = companyName.split(" · ")[0] || companyName;

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

  // Header with better spacing
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(INK);
  doc.text(cleanName, MARGIN, c.y);
  c.y += 32;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(INK_SOFT);
  doc.text(
    "CEO Performance Report — Myelin Decision Intelligence",
    MARGIN,
    c.y,
  );
  c.y += 16;
  doc.setFontSize(10);
  doc.text(
    new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    MARGIN,
    c.y,
  );
  c.y += 28;

  rule(c);

  sectionLabel(c, "Final Company Outcome");
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
  c.y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(INK_SOFT);
  doc.text(style.why, MARGIN, c.y, { maxWidth: PAGE_W - 2 * MARGIN });
  c.y +=
    doc.getTextDimensions(style.why, { maxWidth: PAGE_W - 2 * MARGIN }).h + 8;

  ledgerRow(c, "Management style", style.label, { strong: true });
  ledgerRow(
    c,
    "Composite score",
    n1(composite) + " \u2014 " + compositeBand,
    { strong: true },
  );
  rule(c);

  sectionLabel(c, "Key Figures");
  ledgerRow(c, "Revenue, final quarter", cr(v(last, "revenueT")), { strong: true });
  ledgerRow(c, "Net cash flow", inr(v(last, "netCF")), {
    strong: true,
    tone: v(last, "netCF") >= 0 ? "good" : "bad",
  });
  ledgerRow(c, "Cash", inr(v(last, "cash")), { strong: true });
  ledgerRow(
    c,
    "Customers",
    n0(v(last, "customers")) + " (repeat " + pct(v(last, "repeatRate")) + ")",
  );
  ledgerRow(c, "Market share", pct(v(last, "marketShare") * 100));
  ledgerRow(
    c,
    "Valuation",
    cr(
      eg && eg.finalValuation != null
        ? Number(eg.finalValuation)
        : v(last, "valuation"),
    ),
    { strong: true },
  );
  ledgerRow(
    c,
    "Headcount",
    n0(headcount(s.staff)) + " (morale " + n0(s.empSat) + ")",
  );
  rule(c);

  sectionLabel(c, "Quarter Scores");
  scores.forEach((sc, i) => {
    ledgerRow(
      c,
      "Quarter " + (i + 1),
      n1(Number(sc.final)) + " \u2014 " + sc.band,
    );
    sc.modifiers.forEach((m) => {
      ensureSpace(c, 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(Number(m.points) > 0 ? GOOD : BAD);
      doc.text(
        "  " +
          (Number(m.points) > 0 ? "+" : "") +
          n1(Number(m.points)) +
          " " +
          humanizeId(String(m.why)),
        MARGIN + 12,
        c.y,
      );
      c.y += 12;
    });
  });
  rule(c);

  sectionLabel(c, "Management Profile \u2014 Seven Dimensions");
  profile.forEach((t) => {
    ensureSpace(c, 20);
    if (t.pct === null) {
      ledgerRow(c, humanizeId(t.name), "Not yet assessed");
    } else {
      ledgerRow(c, humanizeId(t.name), n0(t.pct) + "%", {
        tone:
          traitTone(t.pct) === "good"
            ? "good"
            : traitTone(t.pct) === "bad"
              ? "bad"
              : undefined,
      });
    }
  });
  rule(c);

  sectionLabel(c, "Insights");
  ledgerRow(c, "Biggest strength", humanizeId(strength.name));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  doc.text(strength.why, MARGIN, c.y, { maxWidth: PAGE_W - 2 * MARGIN });
  c.y +=
    doc.getTextDimensions(strength.why, { maxWidth: PAGE_W - 2 * MARGIN }).h +
    8;

  ledgerRow(c, "Biggest mistake", humanizeId(mistake.title));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  doc.text(String(mistake.why), MARGIN, c.y, {
    maxWidth: PAGE_W - 2 * MARGIN,
  });
  c.y +=
    doc.getTextDimensions(String(mistake.why), {
      maxWidth: PAGE_W - 2 * MARGIN,
    }).h + 8;

  ledgerRow(
    c,
    "Most important decision",
    "Quarter " + decision.q + ": " + decision.label,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  doc.text(decision.effect, MARGIN, c.y, { maxWidth: PAGE_W - 2 * MARGIN });
  c.y +=
    doc.getTextDimensions(decision.effect, {
      maxWidth: PAGE_W - 2 * MARGIN,
    }).h + 8;

  ledgerRow(c, "Unexpected consequence", consequence.title);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  doc.text(consequence.body, MARGIN, c.y, {
    maxWidth: PAGE_W - 2 * MARGIN,
  });
  c.y +=
    doc.getTextDimensions(consequence.body, {
      maxWidth: PAGE_W - 2 * MARGIN,
    }).h + 8;
  rule(c);

  sectionLabel(c, "Decision Timeline");
  timeline.forEach((t) => {
    ensureSpace(c, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(INK);
    doc.text("Quarter " + t.q, MARGIN, c.y);
    c.y += 14;

    if (t.priority) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(INK_SOFT);
      doc.text("Said: " + t.priority, MARGIN, c.y);
      c.y += 10;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(INK_SOFT);
    const decText = "Decision: " + t.decision;
    doc.text(decText, MARGIN + 8, c.y, {
      maxWidth: PAGE_W - 2 * MARGIN - 8,
    });
    c.y +=
      doc.getTextDimensions(decText, { maxWidth: PAGE_W - 2 * MARGIN - 8 }).h +
      4;
    const conText = "Consequence: " + t.consequence;
    doc.text(conText, MARGIN + 8, c.y, {
      maxWidth: PAGE_W - 2 * MARGIN - 8,
    });
    c.y +=
      doc.getTextDimensions(conText, { maxWidth: PAGE_W - 2 * MARGIN - 8 }).h +
      8;
  });
  rule(c);

  sectionLabel(c, "Missed Opportunity");
  ledgerRow(c, missed.title, "");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK_SOFT);
  doc.text(missed.body, MARGIN, c.y, { maxWidth: PAGE_W - 2 * MARGIN });
  c.y +=
    doc.getTextDimensions(missed.body, { maxWidth: PAGE_W - 2 * MARGIN }).h +
    8;
  rule(c);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(INK_SOFT);
    doc.text(
      "Myelin \u2014 CEO Performance Report \u2014 page " +
        i +
        " of " +
        totalPages,
      MARGIN,
      PAGE_H - 24,
    );
  }

  return doc.output("blob");
}
