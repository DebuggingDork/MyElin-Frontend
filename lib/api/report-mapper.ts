/**
 * Data mapping utilities to transform simulation data into Decision Intelligence Report schema.
 * 
 * Maps frontend simulation state (QuarterScore[], QuarterResultShape[], CompanyState, etc.)
 * to the backend DecisionIntelligenceReport schema for PDF generation.
 */

import type {
  DecisionIntelligenceReport,
  ReportMetadata,
  CoverPage,
  YearCreatedPage,
  QuarterEntry,
  ProfilePage,
  DimensionScore,
  DimensionType,
  StrengthPage,
  RiskPage,
  DecisionThatMatteredPage,
  MissedOpportunitiesPage,
  MissedOpportunity,
  AdaptabilityPage,
  AdaptabilityRow,
  DecisionSignaturePage,
  ScoreExplanationPage,
  ScoreModifier,
  CompanyOutcomePage,
  CompanyMetric,
  NextMovePage,
  Recommendation,
} from "./report-types";
import type { QuarterScore } from "@/lib/simulation/remote";
import type {
  CompanyState,
  PriorityId,
  QuarterResultShape,
  TermSheet,
} from "@/lib/simulation/types";
import type { QuarterReportResponse } from "./types";
import {
  traitRollup,
  managementStyle,
  biggestStrength,
  biggestMistake,
  mostImportantDecision,
  missedOpportunity,
} from "@/lib/simulation/scoring";
import { PRIORITY_BY_ID, headcount } from "@/lib/simulation/constants";
import { cr, inr, n0, n1, pct } from "@/lib/simulation/format";

/**
 * Map quarterly report data to DecisionIntelligenceReport schema for a single quarter.
 * This is used by ReportPdfExport.tsx for individual quarter reports.
 */
export function mapQuarterlyReport(
  report: QuarterReportResponse,
  companyName: string,
  ceoName: string
): DecisionIntelligenceReport {
  // Wrap single quarter data in array format for compatibility with the 12-page report
  const scores: QuarterScore[] = [
    {
      quarter: report.quarter_number,
      score: Number(report.decision_quality.ceo_score),
      band: report.decision_quality.band,
      final: Number(report.decision_quality.ceo_score),
      modifiers: report.decision_quality.modifiers.map((m) => ({
        id: m.id,
        points: m.applied_points,
        why: m.detail,
      })),
    } as QuarterScore,
  ];

  // Build minimal history from single quarter outcome
  const history: QuarterResultShape[] = [
    {
      quarter: report.quarter_number,
      cash: Number(report.outcome.closing_cash_inr.value),
      revenue: Number(report.outcome.revenue_inr.value),
      revenueT: Number(report.outcome.revenue_inr.value),
      units: Number(report.outcome.units_sold.value),
      cogs: Number(report.outcome.cogs_inr.value),
      grossProfit: Number(report.outcome.gross_profit_inr.value),
      netCF: Number(report.outcome.net_cash_flow_inr.value),
      netCashFlow: Number(report.outcome.net_cash_flow_inr.value),
      valuation: report.outcome.valuation_inr?.value
        ? Number(report.outcome.valuation_inr.value)
        : null,
      marketShare: null,
      customers: null,
    } as QuarterResultShape,
  ];

  // Single quarter has no priority data, use nulls
  const priorities: (PriorityId | null)[] = [null];

  // Build minimal company state from quarter outcome
  const state: CompanyState = {
    cash: Number(report.outcome.closing_cash_inr.value),
    revenue: Number(report.outcome.revenue_inr.value),
    unitsSold: Number(report.outcome.units_sold.value),
    valuation: report.outcome.valuation_inr?.value
      ? Number(report.outcome.valuation_inr.value)
      : 0,
    runway: report.outcome.cash_runway_quarters?.value
      ? Number(report.outcome.cash_runway_quarters.value)
      : null,
    // Default values for fields not in quarterly report
    demand: 0,
    price: 0,
    quality: 0,
    innovation: 0,
    brand: 0,
    cx: 0,
    rivalStrength: 0,
    staff: 0,
  } as CompanyState;

  // No endgame data for single quarter
  const endgame = null;
  const termSheet = null;

  // Reuse the simulation mapper with adapted data
  return mapSimulationToReport(
    scores,
    history,
    priorities,
    state,
    termSheet,
    endgame,
    companyName,
    ceoName
  );
}

/**
 * Main mapping function: transforms full simulation data into Decision Intelligence Report.
 * This is used by FinalReportPdfExport.tsx for the complete simulation report.
 */
export function mapSimulationToReport(
  scores: QuarterScore[],
  history: QuarterResultShape[],
  priorities: (PriorityId | null)[],
  state: CompanyState,
  termSheet: TermSheet | null,
  endgameOutcome: Record<string, unknown> | null,
  companyName: string,
  ceoName: string,
): DecisionIntelligenceReport {
  const metadata = buildMetadata(companyName, ceoName);
  const coverPage = buildCoverPage(scores, endgameOutcome);
  const yearCreatedPage = buildYearCreatedPage(scores, history, priorities);
  const profilePage = buildProfilePage(scores);
  const strengthPage = buildStrengthPage(scores);
  const riskPage = buildRiskPage(scores);
  const decisionPage = buildDecisionThatMatteredPage(history);
  const missedPage = buildMissedOpportunitiesPage(history, state);
  const adaptabilityPage = buildAdaptabilityPage(history, priorities, scores);
  const signaturePage = buildDecisionSignaturePage(history, scores);
  const scorePage = buildScoreExplanationPage(scores);
  const outcomePage = buildCompanyOutcomePage(history, state, endgameOutcome);
  const nextMovePage = buildNextMovePage(scores, history);

  return {
    metadata,
    page_01_cover: coverPage,
    page_02_year_created: yearCreatedPage,
    page_03_profile: profilePage,
    page_04_strength: strengthPage,
    page_05_risk: riskPage,
    page_06_decision_that_mattered: decisionPage,
    page_07_missed_opportunities: missedPage,
    page_08_adaptability: adaptabilityPage,
    page_09_decision_signature: signaturePage,
    page_10_score_explained: scorePage,
    page_11_company_outcome: outcomePage,
    page_12_next_move: nextMovePage,
  };
}

// ─── Page Builders ──────────────────────────────────────────────────────────

function buildMetadata(companyName: string, ceoName: string): ReportMetadata {
  // Clean company name - remove any email/username suffix after separator
  const cleanCompanyName = companyName.split(" · ")[0]?.trim() || companyName;

  return {
    company_name: cleanCompanyName,
    ceo_name: ceoName,
    source: "Simulation Run",
    generated_date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

function buildCoverPage(scores: QuarterScore[], endgameOutcome: Record<string, unknown> | null): CoverPage {
  const finals = scores.map((sc) => Number(sc.final));
  const composite = finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : 0;
  const band =
    composite >= 90 ? "Exceptional" :
    composite >= 75 ? "Strong" :
    composite >= 60 ? "Competent" :
    composite >= 40 ? "Adequate" : "Weak";

  const sold = Boolean(endgameOutcome && endgameOutcome.path === "B");
  const gameOver = Boolean(endgameOutcome && endgameOutcome.gameOver);
  const covenantHit = Boolean(endgameOutcome && endgameOutcome.covenantHit);

  const outcomeQuote =
    sold ? "You sold the company and exited successfully." :
    gameOver ? "The company ran out of runway before year-end." :
    endgameOutcome && endgameOutcome.path === "A"
      ? (covenantHit
        ? "You took venture capital and hit the growth covenant."
        : "You took venture capital but missed the covenant target.")
      : "You finished the year independent and on your own terms.";

  const style = managementStyle(scores.map((sc) => ({
    quarter_number: Number(sc.final),  // Simplified - adjust if needed
  }) as any));

  return {
    final_score: composite,
    verdict_label: band,
    outcome_quote: outcomeQuote,
    decision_maker_profile: style.why,
  };
}

function buildYearCreatedPage(
  scores: QuarterScore[],
  history: QuarterResultShape[],
  priorities: (PriorityId | null)[],
): YearCreatedPage {
  const quarters: QuarterEntry[] = scores.map((sc, i) => {
    const h = history[i];
    const priority = priorities[i];
    const priorityLabel = priority ? PRIORITY_BY_ID[priority].label : "No explicit priority";

    // Extract decision text from priority and allocations
    const decisionText = priority
      ? `Prioritized ${priorityLabel.toLowerCase()}. Allocated resources accordingly.`
      : "Maintained balanced allocation across functions.";

    // Extract consequence from results
    const revenue = h?.revenueT ? cr(Number(h.revenueT)) : "—";
    const cashFlow = h?.netCF ? inr(Number(h.netCF)) : "—";
    const consequenceText = `Revenue: ${revenue}, Net cash flow: ${cashFlow}.`;

    return {
      quarter_number: i + 1,
      quarter_score: Number(sc.final),
      verdict: sc.band,
      decision_text: decisionText,
      consequence_text: consequenceText,
      flagged: Number(sc.final) < 45 || Number(sc.final) >= 85, // Flag exceptionally good/bad quarters
    };
  });

  return {
    quarters: quarters.slice(0, 4) as [QuarterEntry, QuarterEntry, QuarterEntry, QuarterEntry],
  };
}

function buildProfilePage(scores: QuarterScore[]): ProfilePage {
  const profile = traitRollup(scores);

  const dimensionMap: Record<string, DimensionType> = {
    "Strategic Thinking": "strategic_thinking",
    "Leadership": "leadership",
    "Adaptability": "adaptability",
    "Systems Thinking": "systems_thinking",
    "Risk Management": "risk_management",
    "Capital Allocation": "capital_allocation",
    "Long-Term Thinking": "long_term_thinking",
  };

  const dimensions: DimensionScore[] = profile.map((t) => ({
    dimension: dimensionMap[t.name] || "strategic_thinking",
    dimension_label: t.name,
    score: t.pct ?? 50,
    evidence_summary: t.subs?.map(s => s.label).join(", ") || "Performance across multiple criteria",
  }));

  return {
    dimensions: dimensions.slice(0, 7) as any,
  };
}

function buildStrengthPage(scores: QuarterScore[]): StrengthPage {
  const strength = biggestStrength(scores);

  return {
    strength_dimension: strength.name,
    strength_score: strength.pct ?? 0,
    headline: `Excellence in ${strength.name}`,
    evidence_bullets: strength.subs?.map(s => `${s.label}: ${s.detail}`) || ["Consistently strong performance"],
    narrative: strength.why,
  };
}

function buildRiskPage(scores: QuarterScore[]): RiskPage {
  const mistake = biggestMistake(scores);

  return {
    risk_dimension: mistake.title,
    risk_score: 100 - (mistake.pct ?? 50), // Invert since this is a risk/weakness
    headline: mistake.title,
    evidence_bullets: [String(mistake.why)],
    narrative: String(mistake.why),
  };
}

function buildDecisionThatMatteredPage(history: QuarterResultShape[]): DecisionThatMatteredPage {
  const decision = mostImportantDecision(history);

  return {
    quarter: decision.q,
    what_you_knew: `Context at start of Q${decision.q}: ${decision.label}`,
    what_you_decided: decision.label,
    what_you_risked: "Capital allocation and strategic positioning",
    what_happened: decision.effect,
    why_it_mattered: decision.effect,
    data_inconsistency_note: null,
  };
}

function buildMissedOpportunitiesPage(
  history: QuarterResultShape[],
  state: CompanyState,
): MissedOpportunitiesPage {
  const missed = missedOpportunity(history, state);

  return {
    headline: missed.title,
    opportunities: [
      {
        label: missed.title,
        value: "Quantified opportunity",
        explanation: missed.body,
      },
    ],
  };
}

function buildAdaptabilityPage(
  history: QuarterResultShape[],
  priorities: (PriorityId | null)[],
  scores: QuarterScore[],
): AdaptabilityPage {
  const rows: AdaptabilityRow[] = history.map((h, i) => {
    const priority = priorities[i];
    const priorityLabel = priority ? PRIORITY_BY_ID[priority].label : "Balanced";
    const changedFromPrior = i > 0 && priorities[i] !== priorities[i - 1];

    return {
      quarter: i + 1,
      allocation_focus: priorityLabel,
      changed_from_prior: changedFromPrior,
      adaptability_score: Number(scores[i]?.final ?? 50),
    };
  });

  const changes = rows.filter(r => r.changed_from_prior).length;
  const summary = changes >= 3
    ? "High adaptability: pivoted strategy multiple times in response to changing conditions."
    : changes >= 2
      ? "Moderate adaptability: adjusted strategy when signals demanded it."
      : "Low adaptability: maintained consistent strategy throughout the year.";

  return {
    rows: rows.slice(0, 4) as [AdaptabilityRow, AdaptabilityRow, AdaptabilityRow, AdaptabilityRow],
    summary,
  };
}

function buildDecisionSignaturePage(
  history: QuarterResultShape[],
  scores: QuarterScore[],
): DecisionSignaturePage {
  const style = managementStyle(history);

  return {
    signature_headline: style.label,
    signature_bullets: [
      "Consistent decision-making pattern across four quarters",
      style.why.split(". ")[0] || style.why,
      "Demonstrated commitment to chosen priorities",
    ],
    overall_narrative: style.why,
  };
}

function buildScoreExplanationPage(scores: QuarterScore[]): ScoreExplanationPage {
  const allModifiers = scores.flatMap(sc => sc.modifiers);
  const positive = allModifiers.filter(m => Number(m.points) > 0);
  const negative = allModifiers.filter(m => Number(m.points) < 0);

  const finals = scores.map(sc => Number(sc.final));
  const baseScore = finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : 0;
  const modifierTotal = allModifiers.reduce((sum, m) => sum + Number(m.points), 0);

  return {
    base_score: baseScore - modifierTotal,
    positive_modifiers: positive.map(m => ({
      label: String(m.why),
      value: Number(m.points),
      is_positive: true,
    })),
    negative_modifiers: negative.map(m => ({
      label: String(m.why),
      value: Number(m.points),
      is_positive: false,
    })),
    final_score: baseScore,
    explanation: `Your base score reflects mechanical performance across seven dimensions. Modifiers adjust for strategic decisions and outcomes.`,
  };
}

function buildCompanyOutcomePage(
  history: QuarterResultShape[],
  state: CompanyState,
  endgameOutcome: Record<string, unknown> | null,
): CompanyOutcomePage {
  const lastQ = history[history.length - 1];
  const sold = Boolean(endgameOutcome && endgameOutcome.path === "B");
  const gameOver = Boolean(endgameOutcome && endgameOutcome.gameOver);

  const headline = sold
    ? "Company Acquired"
    : gameOver
      ? "Company Closed"
      : "Year Complete · Independent";

  const metrics: CompanyMetric[] = [
    { label: "Final Valuation", value: lastQ?.valuation ? cr(Number(lastQ.valuation)) : "—", context: null },
    { label: "Final Revenue", value: lastQ?.revenueT ? cr(Number(lastQ.revenueT)) : "—", context: "Q4" },
    { label: "Closing Cash", value: lastQ?.cash ? inr(Number(lastQ.cash)) : "—", context: null },
    { label: "Headcount", value: n0(headcount(state.staff)), context: "Final" },
    { label: "Market Share", value: lastQ?.marketShare ? pct(Number(lastQ.marketShare) * 100) : "—", context: null },
    { label: "Customer Count", value: lastQ?.customers ? n0(Number(lastQ.customers)) : "—", context: null },
  ];

  return {
    outcome_headline: headline,
    metrics,
  };
}

function buildNextMovePage(scores: QuarterScore[], history: QuarterResultShape[]): NextMovePage {
  const recommendations: Recommendation[] = [
    {
      title: "Strengthen Your Weakest Dimension",
      body: "Identify your lowest-scoring trait and focus on building capabilities in that area through targeted learning and practice.",
    },
    {
      title: "Maintain Your Core Strengths",
      body: "Your highest-scoring dimensions are valuable assets. Continue to leverage these strengths while addressing gaps.",
    },
    {
      title: "Increase Strategic Adaptability",
      body: "Practice scenario planning and early signal detection to position ahead of market shifts rather than reacting to them.",
    },
  ];

  return {
    recommendations,
  };
}
