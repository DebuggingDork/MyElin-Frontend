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
  WarrantyId,
  DeptId,
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
  const traitTotal = report.decision_quality.scored_criteria.reduce(
    (sum, c) => sum + Number(c.points || 0),
    0
  );
  const modifierTotal = report.decision_quality.modifiers.reduce(
    (sum, m) => sum + Number(m.applied_points),
    0
  );

  const scores: QuarterScore[] = [
    {
      traits: report.decision_quality.scored_criteria.map((c) => ({
        name: c.trait,
        weight: 0, // Backend doesn't provide weight in this response
        subs: [
          {
            label: c.id,
            level: c.result === "clearly_met" ? "full" : c.result === "partially_met" ? "part" : "none",
            detail: c.detail,
            points: Number(c.points || 0),
          },
        ],
        points: Number(c.points || 0),
      })),
      traitTotal,
      modifiers: report.decision_quality.modifiers.map((m) => ({
        points: Number(m.applied_points),
        why: m.detail,
      })),
      modifierTotal,
      final: Number(report.decision_quality.ceo_score),
      band: report.decision_quality.band,
    },
  ];

  // Build minimal history from single quarter outcome
  // Cast through unknown since we're providing minimal stub data for single-quarter reports
  const history: QuarterResultShape[] = [
    {
      q: report.quarter_number,
      // Financial summary fields (these are what report pages actually use)
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
    } as unknown as QuarterResultShape,
  ];

  // Single quarter has no priority data, use nulls
  const priorities: (PriorityId | null)[] = [null];

  // Build minimal company state from quarter outcome
  // Cast through unknown since we're providing minimal stub data for single-quarter reports
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
  } as unknown as CompanyState;

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
  const coverPage = buildCoverPage(scores, history, endgameOutcome);
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
    source: ceoName,
    generated_date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

function buildCoverPage(
  scores: QuarterScore[],
  history: QuarterResultShape[],
  endgameOutcome: Record<string, unknown> | null,
): CoverPage {
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

  // managementStyle needs full QuarterResultShape[] with A, opexSpend, capexSpend, marketingSpend fields
  const hasFullHistory = history.length > 0 && 
    history[0].A !== undefined && 
    history[0].opexSpend !== undefined;
  const style = hasFullHistory
    ? managementStyle(history)
    : { label: "Balanced CEO", why: "Allocation decisions balanced across all functional areas." };

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
    const priorityLabel = priority ? PRIORITY_BY_ID[priority].name : "No explicit priority";

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

  // Backend requires exactly 4 quarters - pad with "Not played" if company failed early
  while (quarters.length < 4) {
    const q = quarters.length + 1;
    quarters.push({
      quarter_number: q,
      quarter_score: 0,
      verdict: "Not played",
      decision_text: `Quarter ${q} was not reached — the simulation ended after Q${quarters.length - 1 || "?"}.`,
      consequence_text: "The company did not complete a full year.",
      flagged: true, // Flag to indicate early termination
    });
  }

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

  const dimensions: DimensionScore[] = profile.map((t) => {
    // traitRollup returns TraitBar[] which doesn't have subs, but we can get subs from original scores
    const allSubs = scores.flatMap(sc => 
      sc.traits.find(trait => trait.name === t.name)?.subs || []
    );
    const uniqueLabels = [...new Set(allSubs.map(s => s.label))];
    
    return {
      dimension: dimensionMap[t.name] || "strategic_thinking",
      dimension_label: t.name,
      score: t.pct ?? 50,
      evidence_summary: uniqueLabels.length > 0 
        ? uniqueLabels.join(", ") 
        : "Performance across multiple criteria",
    };
  });

  // Backend requires exactly 7 dimensions - ensure we have them all
  const requiredDimensions: Array<{name: string, type: DimensionType}> = [
    { name: "Strategic Thinking", type: "strategic_thinking" },
    { name: "Leadership", type: "leadership" },
    { name: "Adaptability", type: "adaptability" },
    { name: "Systems Thinking", type: "systems_thinking" },
    { name: "Risk Management", type: "risk_management" },
    { name: "Capital Allocation", type: "capital_allocation" },
    { name: "Long-Term Thinking", type: "long_term_thinking" },
  ];

  // Fill in any missing dimensions with defaults
  requiredDimensions.forEach(req => {
    if (!dimensions.find(d => d.dimension === req.type)) {
      dimensions.push({
        dimension: req.type,
        dimension_label: req.name,
        score: 0,
        evidence_summary: "Not yet assessed",
      });
    }
  });

  return {
    dimensions: dimensions.slice(0, 7) as [
      DimensionScore,
      DimensionScore,
      DimensionScore,
      DimensionScore,
      DimensionScore,
      DimensionScore,
      DimensionScore,
    ],
  };
}

function buildStrengthPage(scores: QuarterScore[]): StrengthPage {
  const strength = biggestStrength(scores);

  // biggestStrength returns { name, pct, why } without subs field
  // Get evidence bullets from the traits themselves if available
  const evidenceBullets = scores.length > 0 && scores[0].traits
    ? scores[0].traits
        .find(t => t.name === strength.name)
        ?.subs?.filter(s => s.level === "full")
        .map(s => `${s.label}: ${s.detail}`)
        .slice(0, 3) || ["Consistently strong performance"]
    : ["Consistently strong performance"];

  return {
    strength_dimension: strength.name,
    strength_score: strength.pct ?? 0,
    headline: `Excellence in ${strength.name}`,
    evidence_bullets: evidenceBullets,
    narrative: strength.why,
  };
}

function buildRiskPage(scores: QuarterScore[]): RiskPage {
  const mistake = biggestMistake(scores);

  // biggestMistake returns { title, why, pct? } 
  // If it's a dimension weakness (not a specific quarter penalty), get evidence
  const isDimensionWeakness = !mistake.title.startsWith("Quarter ");
  const evidenceBullets = isDimensionWeakness && scores.length > 0 && scores[0].traits
    ? scores[0].traits
        .find(t => t.name === mistake.title)
        ?.subs?.filter(s => s.level !== "full")
        .map(s => `${s.label}: ${s.detail}`)
        .slice(0, 3) || [String(mistake.why)]
    : [String(mistake.why)];

  return {
    risk_dimension: mistake.title,
    risk_score: 100 - ((mistake as any).pct ?? 50), // Invert since this is a risk/weakness
    headline: mistake.title,
    evidence_bullets: evidenceBullets,
    narrative: String(mistake.why),
  };
}

function buildDecisionThatMatteredPage(history: QuarterResultShape[]): DecisionThatMatteredPage {
  // mostImportantDecision needs history with full allocation fields (r.A, r.started, r.drawn, r.totalFired, etc.)
  const hasFullHistory = history.length > 0 && 
    history[0].A !== undefined && 
    history[0].started !== undefined;
  
  if (!hasFullHistory) {
    const h = history[0];
    return {
      quarter: h?.q ?? 1,
      what_you_knew: "Revenue and market conditions at quarter start.",
      what_you_decided: "Allocated resources across functional areas.",
      what_you_risked: "Capital allocation and strategic positioning",
      what_happened: `Revenue: ${inr(Number(h?.revenueT ?? h?.revenue ?? 0))}, closing cash: ${inr(Number(h?.cash ?? 0))}.`,
      why_it_mattered: "Each allocation choice directly affected the quarter outcome.",
      data_inconsistency_note: null,
    };
  }

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
  // missedOpportunity needs history with full fields (A, leadsWasted, utilisation, etc.) and state with npd, innovations, products
  const hasFullHistory = history.length > 0 && 
    history[0].A !== undefined && 
    history[0].utilisation !== undefined;
  const hasFullState = state && 
    'npd' in state && 
    'innovations' in state && 
    'products' in state;
  
  if (!hasFullHistory || !hasFullState) {
    return {
      headline: "Opportunities identified from available data",
      opportunities: [
        {
          label: "Deeper functional investment",
          value: "Variable",
          explanation: "Reviewing allocation patterns across quarters may reveal underfunded areas with high potential return.",
        },
      ],
    };
  }

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
    const priorityLabel = priority ? PRIORITY_BY_ID[priority].name : "Balanced";
    const changedFromPrior = i > 0 && priorities[i] !== priorities[i - 1];

    return {
      quarter: i + 1,
      allocation_focus: priorityLabel,
      changed_from_prior: changedFromPrior,
      adaptability_score: Number(scores[i]?.final ?? 50),
    };
  });

  // Backend requires exactly 4 rows - pad with "Not played" for early exits
  while (rows.length < 4) {
    const q = rows.length + 1;
    rows.push({
      quarter: q,
      allocation_focus: "Not played",
      changed_from_prior: false,
      adaptability_score: 0,
    });
  }

  const changes = rows.filter(r => r.changed_from_prior).length;
  const playedQuarters = history.length;
  const summary = playedQuarters < 4
    ? `Simulation ended after ${playedQuarters} quarter${playedQuarters === 1 ? "" : "s"}. Adaptability assessment is incomplete.`
    : changes >= 3
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
  // managementStyle needs full QuarterResultShape with A, opexSpend, capexSpend, marketingSpend, etc.
  const hasFullHistory = history.length > 0 && 
    history[0].A !== undefined && 
    history[0].opexSpend !== undefined &&
    history[0].marketingSpend !== undefined;
  const style = hasFullHistory
    ? managementStyle(history)
    : { label: "Balanced CEO", why: "Allocation decisions balanced across all functional areas." };

  return {
    signature_headline: style.label,
    signature_bullets: [
      "Consistent decision-making pattern across quarters",
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
