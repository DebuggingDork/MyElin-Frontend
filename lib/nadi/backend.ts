/**
 * The bridge between Nadi Wear's decision surface and the MyElin backend.
 *
 * The backend is the source of truth once a quarter closes. This module is the whole of the
 * translation: it turns the simulation's spend lines into the API's 22-line model, turns its
 * market-event response into the crisis allocation, turns its term-sheet choice into an
 * endgame decision, and folds the locked report's figures back into the state the next
 * quarter opens on so the two can never drift apart.
 *
 * ## Units
 * Every backend spend field is **Rs lakhs** (`app/schemas/allocation.py`), which is the same
 * unit the simulation's inputs already use, so no conversion is applied anywhere below.
 *
 * ## What maps, and what does not
 * The simulation carries a richer decision set than the 22-line model. Lines with no
 * counterpart are folded into their nearest analogue so the backend sees the same total
 * commitment rather than silently losing spend; `LINE_MAP_NOTES` is what the reconciliation
 * panel renders, so the mapping is always visible on screen rather than buried here.
 *
 * Structural decisions the 22-line model has no representation for at all -- hiring and
 * firing, plant capex as an asset, drawing and repaying credit, the innovation board,
 * product pricing and line share, supplier payment terms -- stay local. They shape the
 * projection and the narrative; they are not sent, because there is nothing to send them to.
 */

import { INNOVATION_BY_ID, numericAlloc } from "@/lib/nadi/constants";
import { num } from "@/lib/nadi/format";
import type {
  Alloc,
  ArchetypeId,
  CompanyState,
  QuarterResultShape,
  StrategyId,
  WarrantyId,
} from "@/lib/nadi/types";
import type {
  CrisisAllocationSubmit,
  CrisisBriefingResponse,
  CrisisChoice,
  FinanceAdminAllocationSubmit,
  HrAllocationSubmit,
  MarketingAllocationSubmit,
  OperationsAllocationSubmit,
  QuarterReportResponse,
  RndAllocationSubmit,
  SalesAllocationSubmit,
} from "@/lib/api/types";

/* ── which market event fired ─────────────────────────────────────── */

/**
 * The backend's four crisis scenarios, in its own letters, against the simulation's
 * archetypes. The first four archetypes line up exactly; `demand_shift` and `trust` have no
 * backend counterpart and therefore never fire in a backend-driven run.
 */
export const ARCHETYPE_FOR_SCENARIO: Record<CrisisChoice, ArchetypeId> = {
  A: "price_war", // Price Warrior
  B: "blitz", // Marketing Blitz
  C: "leapfrog", // Feature Leapfrog
  D: "supply", // Global Supply Shock
};

/**
 * The simulation's five response directions against the backend's `crisis_choice` letters.
 * `learn` deliberately maps to `null`: holding back and committing little is the same move
 * as declining a strategic choice, which the API accepts (`ignoring_is_legal`) and penalises
 * rather than refuses.
 */
export const CHOICE_FOR_STRATEGY: Record<StrategyId, CrisisChoice | null> = {
  fight: "A",
  differentiate: "C",
  focus: "B",
  learn: null,
  exploit: "D",
};

/* ── the line mapping, as rendered to the user ────────────────────── */

export type LineMapNote = { from: string; to: string; why?: string };

/** Exactly what the reconciliation panel shows. Keep this in step with `toAllocations`. */
export const LINE_MAP_NOTES: LineMapNote[] = [
  { from: "Google Ads", to: "marketing.google_ads" },
  { from: "Meta Ads", to: "marketing.meta_ads" },
  { from: "Social & Influencer", to: "marketing.social_influencer" },
  { from: "Content & SEO", to: "marketing.content_seo" },
  { from: "Events & PR", to: "marketing.events_pr" },
  { from: "Email Marketing", to: "marketing.email_marketing" },
  { from: "Referral Programme", to: "marketing.referral" },
  { from: "Pre-launch marketing", to: "marketing.prelaunch_buzz" },
  {
    from: "Direct Marketing",
    to: "marketing.google_ads",
    why: "No direct-response line exists in the 22-line model; paid search is the nearest high-intent channel.",
  },
  { from: "Reps & Commissions", to: "sales.reps" },
  {
    from: "Channel Partners & Distribution",
    to: "sales.reps",
    why: "Distributor capacity is selling capacity; the model has no separate channel line.",
  },
  { from: "CRM & Tools", to: "sales.crm_tools" },
  {
    from: "Sales Training & Enablement",
    to: "sales.crm_tools",
    why: "Both are enablement that lifts conversion without adding capacity.",
  },
  { from: "Onboarding & Success", to: "sales.onboarding" },
  { from: "Quality & QA", to: "rnd.quality_qa" },
  { from: "New Product Development", to: "rnd.innovation" },
  { from: "Design & Industrial Engineering", to: "rnd.innovation" },
  {
    from: "Innovation board cards started",
    to: "rnd.innovation",
    why: "Capitalised locally; the model has no capitalised-R&D line, so it is sent as innovation spend.",
  },
  { from: "Warranty policy", to: "rnd.warranty_years", why: "6 months → 0, 1 year → 1, 2 years → 2." },
  { from: "Production Run", to: "operations.manufacturing" },
  {
    from: "Plant Capex",
    to: "operations.manufacturing",
    why: "Capacity investment is an asset locally; the model treats all manufacturing spend as one line.",
  },
  { from: "Supplier & QC", to: "operations.supplier_qc" },
  { from: "Logistics & Distribution", to: "operations.logistics" },
  { from: "Warehousing & Fulfilment", to: "operations.logistics" },
  { from: "Culture & Benefits", to: "hr.culture_benefits" },
  { from: "Training & Development", to: "hr.training_development" },
  { from: "Customer Experience", to: "hr.cx_team" },
  { from: "Compliance & Legal", to: "finance_admin.compliance_legal" },
  { from: "Financial Planning", to: "finance_admin.financial_planning" },
  { from: "Working Capital Management", to: "finance_admin.financial_planning" },
  { from: "Treasury & Cash Management", to: "finance_admin.financial_planning" },
  { from: "Audit Preparation", to: "finance_admin.audit_prep" },
];

/** Decisions that stay local because the 22-line model has nowhere to put them. */
export const LOCAL_ONLY_DECISIONS = [
  "Hiring and cutting headcount across the six functions",
  "Credit drawn and repaid on the facility",
  "Supplier payment terms (pay on despatch / net 30 / net 60)",
  "Product pricing, production-line share, pause and discontinue",
  "Which innovation-board cards to start (the spend is still sent as R&D)",
];

/* ── allocations ──────────────────────────────────────────────────── */

export type AllocationPayloads = {
  marketing: MarketingAllocationSubmit;
  sales: SalesAllocationSubmit;
  rnd: RndAllocationSubmit;
  operations: OperationsAllocationSubmit;
  hr: HrAllocationSubmit;
  finance_admin: FinanceAdminAllocationSubmit;
};

const WARRANTY_YEARS: Record<WarrantyId, number> = { "6mo": 0, "1yr": 1, "2yr": 2 };

const round2 = (v: number) => Math.round(Math.max(0, v) * 100) / 100;

/**
 * The six department payloads for one quarter. `startInno` cards are capitalised locally but
 * have no capitalised-R&D line in the 22-line model, so their cost is converted to lakhs and
 * added to `rnd.innovation` -- the money is real either way and the backend should see it.
 */
export function toAllocations(
  alloc: Alloc,
  warranty: WarrantyId,
  startInno: string[],
): AllocationPayloads {
  const A = numericAlloc(alloc);
  const innoLakh = (startInno || []).reduce(
    (sum, id) => sum + (INNOVATION_BY_ID[id] ? INNOVATION_BY_ID[id].cost : 0),
    0,
  ) / 1e5;

  return {
    marketing: {
      google_ads: round2(A.google + A.direct),
      meta_ads: round2(A.meta),
      social_influencer: round2(A.social),
      content_seo: round2(A.content),
      events_pr: round2(A.events),
      email_marketing: round2(A.email),
      referral: round2(A.referral),
      prelaunch_buzz: round2(A.prelaunch),
    },
    sales: {
      reps: round2(A.reps + A.channel),
      crm_tools: round2(A.crm + A.salesTraining),
      onboarding: round2(A.onboarding),
    },
    rnd: {
      quality_qa: round2(A.quality),
      innovation: round2(A.npd + A.design + innoLakh),
      warranty_years: WARRANTY_YEARS[warranty] ?? 0,
    },
    operations: {
      manufacturing: round2(A.production + A.capex),
      supplier_qc: round2(A.supplier),
      logistics: round2(A.logistics + A.warehouse),
    },
    hr: {
      culture_benefits: round2(A.culture),
      training_development: round2(A.hrTraining),
      cx_team: round2(A.cx),
    },
    finance_admin: {
      compliance_legal: round2(A.compliance),
      financial_planning: round2(A.planning + A.workingCapital + A.treasury),
      audit_prep: round2(A.audit),
    },
  };
}

/* ── the crisis response ──────────────────────────────────────────── */

/**
 * Turns the chosen direction and the rupees behind it into a crisis allocation.
 *
 * The committed amount is spread only across the lines the briefing says this scenario's
 * recovery formulas actually read (`response_lines`) -- the integration guide is explicit
 * that a rupee on any other line is inert, so a student who commits to a real strategy must
 * not have that spend land somewhere the engine will ignore. When the chosen letter is D,
 * the whole commitment goes to `crisis_choice_d_spend` if that line is live, since Choice D
 * is the one posture with its own dedicated budget line.
 */
export function toCrisisAllocation(
  strategy: StrategyId | null,
  commitLakh: number,
  briefing: CrisisBriefingResponse | null,
): CrisisAllocationSubmit {
  const wanted = strategy ? CHOICE_FOR_STRATEGY[strategy] : null;
  const offered = briefing ? briefing.choices.map((c) => c.code) : [];
  // Only send a letter this scenario actually offers; otherwise send none, which is legal.
  const choice: CrisisChoice | null = wanted && offered.indexOf(wanted) >= 0 ? wanted : null;

  const body: CrisisAllocationSubmit = { crisis_choice: choice };
  const commit = round2(commitLakh);
  if (commit <= 0) return body;

  const lines = briefing ? briefing.response_lines.map((l) => l.field) : [];
  if (!lines.length) return body;

  if (choice === "D" && lines.indexOf("crisis_choice_d_spend") >= 0) {
    body.crisis_choice_d_spend = commit;
    return body;
  }

  const targets = lines.filter((f) => (choice === "D" ? true : f !== "crisis_choice_d_spend"));
  const spread = targets.length ? targets : lines;
  const each = round2(commit / spread.length);
  spread.forEach((field) => {
    (body as Record<string, unknown>)[field] = each;
  });
  return body;
}

/* ── reading a locked quarter back ────────────────────────────────── */

export type BackendOutcome = {
  unitsSold: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  netCashFlow: number;
  closingCash: number;
  runwayQuarters: number | null;
  valuation: number | null;
  ceoScore: number;
  band: string;
};

/** The figures the API says the quarter produced. `null` where it declines to report one. */
export function outcomeFromReport(report: QuarterReportResponse): BackendOutcome {
  const o = report.outcome;
  const value = (m: { value: string | number } | null) => (m ? Number(m.value) : 0);
  return {
    unitsSold: value(o.units_sold),
    revenue: value(o.revenue_inr),
    cogs: value(o.cogs_inr),
    grossProfit: value(o.gross_profit_inr),
    netCashFlow: value(o.net_cash_flow_inr),
    closingCash: value(o.closing_cash_inr),
    runwayQuarters: o.cash_runway_quarters ? Number(o.cash_runway_quarters.value) : null,
    valuation: o.valuation_inr ? Number(o.valuation_inr.value) : null,
    ceoScore: Number(report.decision_quality.ceo_score),
    band: report.decision_quality.band,
  };
}

/**
 * Folds the locked quarter's authoritative figures into the state the next quarter opens on.
 *
 * The local engine still advances everything the API does not report -- headcount, morale,
 * inventory units, supplier reliability, the innovation board, brand and quality scores --
 * because the backend has no equivalent of those and the next quarter's screens need them.
 * Cash, units, revenue and valuation are overwritten with the backend's numbers so the two
 * models cannot drift over four quarters. Cash movement is applied as a delta to retained
 * earnings, keeping the balance sheet's own identity intact rather than leaving equity
 * describing a cash balance that no longer exists.
 */
export function reconcileState(
  next: CompanyState,
  result: QuarterResultShape,
  outcome: BackendOutcome,
): CompanyState {
  const cashDelta = outcome.closingCash - (result.cash as number);
  const revenueWindow = (result.entering.revHistory || []).concat([outcome.revenue]).slice(-3);

  return {
    ...next,
    cash: outcome.closingCash,
    retainedEarnings: next.retainedEarnings + cashDelta,
    priorUnits: outcome.unitsSold,
    lastNetCF: outcome.netCashFlow,
    lastGM: outcome.revenue > 0 ? outcome.grossProfit / outcome.revenue : next.lastGM,
    revHistory: revenueWindow,
    wcBreached: next.wcBreached || outcome.closingCash < 1e6,
    everInsolvent: next.everInsolvent || outcome.closingCash < 0,
  };
}

/**
 * The same overwrite applied to the result object the closed-quarter screen renders, so the
 * headline figures, the P&L and the cash-flow statement all show the API's numbers rather
 * than the projection's. Anything the API does not report is left as the engine computed it
 * and stays labelled as a local figure on screen.
 */
export function reconcileResult(
  result: QuarterResultShape,
  outcome: BackendOutcome,
): QuarterResultShape {
  const revenue = { ...result.revenue };
  const localRevenue = result.revenueT as number;
  // Keep the per-product split, rescaled to the API's revenue total.
  if (localRevenue > 0) {
    const scale = outcome.revenue / localRevenue;
    (Object.keys(revenue) as (keyof typeof revenue)[]).forEach((k) => {
      revenue[k] = revenue[k] * scale;
    });
  }

  return {
    ...result,
    revenue,
    unitsSold: outcome.unitsSold,
    revenueT: outcome.revenue,
    cogs: outcome.cogs,
    grossProfit: outcome.grossProfit,
    netCF: outcome.netCashFlow,
    cash: outcome.closingCash,
    valuation: outcome.valuation ?? (result.valuation as number),
    runway: outcome.runwayQuarters ?? (result.runway as number),
    wcBreached: outcome.closingCash < 1e6,
    insolvent: outcome.closingCash < 0,
    /** Marks the figures above as the API's, for the "where this number came from" note. */
    fromBackend: true,
  } as QuarterResultShape;
}

/** Total lakhs the backend will see for a quarter, for the reconciliation panel. */
export function backendTotalLakh(payloads: AllocationPayloads): number {
  const sum = (o: Record<string, unknown>) =>
    Object.entries(o).reduce((t, [k, v]) => (k === "warranty_years" ? t : t + num(v)), 0);
  return (
    sum(payloads.marketing as unknown as Record<string, unknown>) +
    sum(payloads.sales as unknown as Record<string, unknown>) +
    sum(payloads.rnd as unknown as Record<string, unknown>) +
    sum(payloads.operations as unknown as Record<string, unknown>) +
    sum(payloads.hr as unknown as Record<string, unknown>) +
    sum(payloads.finance_admin as unknown as Record<string, unknown>)
  );
}
