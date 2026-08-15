/**
 * The Nadi Wear quarter engine, ported from the shipped `NadiWear.html` bundle.
 *
 * `runQuarter` takes the company as it stands plus every decision made this quarter and
 * returns ~180 derived figures: the funnel, the production line, the three statements and
 * the state the next quarter opens on. Screens read from that object; they never compute.
 *
 * In this integration the engine drives the *in-quarter* picture -- projections, the
 * dashboard, the readiness gauges, the directors' inbox -- while the backend remains the
 * source of truth for what a locked quarter actually produced (see `lib/nadi/backend.ts`).
 *
 * Formulas are unchanged from the original, including two quirks that are its behaviour and
 * not transcription slips; both are flagged where they occur.
 */

import {
  AMORTISATION_RATE,
  ARCHETYPES,
  BUFFER,
  CATEGORY_GROWTH,
  COMPETITORS,
  DEPARTMENTS,
  DEPRECIATION_RATE,
  DEPT_LOAD,
  INNOVATION_BY_ID,
  INTEREST_RATE,
  MARKET_CUSTOMERS,
  MIN_AR,
  OTHER_LIABILITIES,
  PAY_TERMS,
  PRICE_ELASTICITY,
  PRODUCTS,
  PRODUCT_BY_ID,
  SHARE_CAPITAL,
  STRATEGY_BY_ID,
  TRUE_DIAGNOSIS,
  capexLakh,
  headcount,
  innoSum,
  marketDemand,
  numericAlloc,
  opexLakh,
  salaryBill,
} from "@/lib/nadi/constants";
import { clamp, n0, n1, n2, num, pct, pw } from "@/lib/nadi/format";
import type {
  Alloc,
  ArchetypeId,
  CompanyState,
  CrisisInput,
  CrisisSituation,
  DeptId,
  NumericAlloc,
  PayTermsId,
  ProductId,
  ProductState,
  QuarterResultShape,
  StrategyId,
  WarrantyId,
} from "@/lib/nadi/types";

/* ── how exposed the company is when a shock lands ────────────────── */

/**
 * Eleven readings of the company, each normalised to 0-1, that decide how much a market
 * event costs. Every one of them is bought in earlier quarters -- that is the point.
 */
export function healthFactors(s: CompanyState): Record<string, number> {
  const runway = num(s.lastNetCF) < 0 ? s.cash / -num(s.lastNetCF) : 6;
  const mix = DEPT_LOAD.marketing.keys.map((k) => num(s.lastMix ? s.lastMix[k] : 0));
  const mixTotal = mix.reduce((a, b) => a + b, 0) || 1;
  const concentration = mix.reduce((a, b) => a + Math.pow(b / mixTotal, 2), 0);

  return {
    brand: clamp(s.brand / 50, 0, 1),
    retention: clamp((s.repeatRate - 8) / 25, 0, 1),
    satisfaction: clamp((s.satisfaction - 45) / 35, 0, 1),
    margin: clamp((num(s.lastGM) - 0.45) / 0.3, 0, 1),
    innovation: clamp(s.innovation / 45, 0, 1),
    quality: clamp(s.quality / 45, 0, 1),
    supplier: clamp((s.supplierRel - 65) / 30, 0, 1),
    cash: clamp(runway / 4, 0, 1),
    channels: clamp((1 - concentration) / 0.65, 0, 1),
    people: clamp((s.empSat - 50) / 35, 0, 1),
    capacity: clamp(s.installedCapacity / Math.max(1200, num(s.priorDemand) * 1.4), 0, 1),
  };
}

/** How badly this particular archetype hurts this particular company. */
export function crisisSituation(id: ArchetypeId, s: CompanyState): CrisisSituation {
  const arch = ARCHETYPES[id];
  const factors = healthFactors(s);
  const weights = arch.weights;
  const shielded = Object.keys(weights).reduce((sum, k) => sum + weights[k] * factors[k], 0);
  const weightTotal = Object.values(weights).reduce((a, b) => a + b, 0);
  const vuln = clamp(1 - shielded / weightTotal, 0.12, 1);
  const runway = num(s.lastNetCF) < 0 ? s.cash / -num(s.lastNetCF) : 6;

  let level = vuln < 0.38 ? 1 : vuln < 0.68 ? 2 : 3;
  if (runway < 1.5 && level < 3) level += 1;
  if (s.cash < BUFFER) level = 3;

  const ranked = Object.keys(weights).sort((a, b) => weights[b] * factors[b] - weights[a] * factors[a]);

  return {
    arch,
    factors,
    vuln,
    level,
    shield: shielded / weightTotal,
    protectedBy: ranked.filter((k) => factors[k] > 0.5).slice(0, 3),
    exposedBy: ranked
      .slice()
      .reverse()
      .filter((k) => factors[k] < 0.4)
      .slice(0, 3),
  };
}

export type CrisisProfile = {
  damp: number;
  convPenalty: number;
  ceilingPenalty: number;
  capMult: number;
  cogsSurcharge: number;
  refShift: number;
  logisticsHit: number;
  brandErosion: number;
  satHit: number;
  custLossBase: number;
  supplierBonus: number;
  priceCut: number;
  mktMult: number;
  reachMult: number;
  convBonus: number;
  brandBoost: number;
  rivalSurge: number;
  aftermath: Record<string, number | string>;
  commitEffect?: number;
  strategy?: StrategyId | null;
};

/**
 * The penalties a live event applies, and how far the chosen strategy and the rupees
 * committed behind it claw those back. `commit` is in lakhs; its effect saturates.
 */
export function crisisProfile(
  situation: CrisisSituation | null,
  strategy: StrategyId | null,
  commit: number,
): CrisisProfile {
  const p: CrisisProfile = {
    damp: 1,
    convPenalty: 0,
    ceilingPenalty: 0,
    capMult: 1,
    cogsSurcharge: 0,
    refShift: 0,
    logisticsHit: 0,
    brandErosion: 0,
    satHit: 0,
    custLossBase: 0,
    supplierBonus: 0,
    priceCut: 0,
    mktMult: 1,
    reachMult: 1,
    convBonus: 0,
    brandBoost: 0,
    rivalSurge: 1.45,
    aftermath: {},
  };
  if (!situation) return p;

  const v = situation.vuln;
  const id = situation.arch.id;

  if (id === "price_war") {
    p.damp = 1 - 0.3 * v;
    p.convPenalty = 11 * v;
    p.custLossBase = 9 * v;
    p.refShift = -1500;
  }
  if (id === "blitz") {
    p.damp = 1 - 0.46 * v;
    p.convPenalty = 4 * v;
    p.custLossBase = 6 * v;
  }
  if (id === "leapfrog") {
    p.damp = 1 - 0.18 * v;
    p.convPenalty = 9 * v;
    p.ceilingPenalty = 3.5 * v;
    p.custLossBase = 7 * v;
  }
  if (id === "supply") {
    p.capMult = 1 - 0.62 * v;
    p.cogsSurcharge = 800 * v;
    p.logisticsHit = 18 * v;
    p.custLossBase = 4 * v;
  }
  if (id === "demand_shift") {
    p.mktMult = 1 - 0.3 * v;
    p.damp = 1 - 0.16 * v;
    p.convPenalty = 3 * v;
  }
  if (id === "trust") {
    p.satHit = 13 * v;
    p.custLossBase = 12 * v;
    p.convPenalty = 6 * v;
    p.brandErosion = 9 * v;
  }

  /** Commitment saturates: the first lakhs move the needle far more than the last. */
  const effect = 1 - Math.exp(-Math.max(0, commit) / 11);

  if (strategy === "fight") {
    p.convPenalty *= 1 - 0.8 * effect;
    p.damp += (1 - p.damp) * 0.75 * effect;
    p.custLossBase *= 1 - 0.6 * effect;
    p.capMult += (1 - p.capMult) * 0.7 * effect;
    if (id === "price_war") {
      p.priceCut = 1500 * effect;
      p.aftermath.priceCut = 1100 * effect;
    }
    p.aftermath.cogsDrag = 180 * effect;
    p.aftermath.note =
      "Fighting held the line, and the price and margin pressure it created does not stop when the quarter does.";
  } else if (strategy === "differentiate") {
    p.ceilingPenalty *= 1 - 0.75 * effect;
    p.convPenalty *= 1 - 0.35 * effect;
    p.brandBoost = 7 * effect;
    p.reachMult = 1 - 0.16 * (1 - effect);
    p.aftermath.brandBonus = 6 * effect;
    p.aftermath.note =
      "Refusing the comparison cost volume now and left the brand stronger going into the last quarter.";
  } else if (strategy === "focus") {
    p.reachMult = 0.72;
    p.convBonus = 4 * effect;
    p.custLossBase *= 1 - 0.85 * effect;
    p.convPenalty *= 1 - 0.45 * effect;
    p.aftermath.repeatBonus = 4 * effect;
    p.aftermath.reachMult = 0.88;
    p.aftermath.note =
      "Narrowing the base improved who you sell to and shrank how many of them there are.";
  } else if (strategy === "learn") {
    p.custLossBase *= 1.15;
    p.convPenalty *= 1.05;
    p.aftermath.vulnRelief = 0.18 + 0.1 * effect;
    p.aftermath.note =
      "Holding back preserved cash and bought a clearer read of the situation for the final quarter.";
  } else if (strategy === "exploit") {
    p.reachMult = 1 + 0.28 * effect;
    p.convBonus = 2 * effect;
    p.rivalSurge = 1.45 - 0.35 * effect;
    p.custLossBase *= 1 - 0.4 * effect;
    p.cogsSurcharge += 220 * effect;
    p.aftermath.shareCarry = 0.1 * effect;
    p.aftermath.note = "Share taken while the market was distracted tends to stay taken.";
  }

  p.commitEffect = effect;
  p.strategy = strategy;

  if (commit <= 0.01 && strategy !== "learn") {
    p.brandErosion += 6;
    p.aftermath.note = "A strategy was chosen and nothing was committed behind it.";
  }
  return p;
}

/* ── what each function reports while the event is live ───────────── */

export type EvidenceLine = { fn: string; line: string; detail: string; tone: "bad" | "watch" | "flat" };

/** Four readouts, some relevant and some not. Diagnosing which is the exercise. */
export function crisisEvidence(
  id: ArchetypeId,
  s: CompanyState,
  last: QuarterResultShape | undefined,
  prior: QuarterResultShape | undefined,
): EvidenceLine[] {
  const out: EvidenceLine[] = [];
  const conv = last ? (last.finalConv as number) : 0;
  const priorConv = prior ? (prior.finalConv as number) : conv;
  const cpl = last && (last.rawLeads as number) > 0 ? (last.marketingSpend as number) / (last.rawLeads as number) : 0;
  const priorCpl =
    prior && (prior.rawLeads as number) > 0 ? (prior.marketingSpend as number) / (prior.rawLeads as number) : cpl;
  const runway = num(s.lastNetCF) < 0 ? s.cash / -num(s.lastNetCF) : 99;

  const delta = (a: number, b: number) => (b > 0 ? (a / b - 1) * 100 : 0);
  const arrow = (v: number, invert?: boolean) => ((invert ? -v : v) >= 0 ? "▲" : "▼");
  const push = (fn: string, line: string, detail: string, tone: EvidenceLine["tone"]) =>
    out.push({ fn, line, detail, tone });

  if (id === "price_war") {
    push(
      "Sales",
      "Conversion " + arrow(-1) + " " + n1(Math.abs(delta(conv, priorConv)) + 6) + "%",
      "Deals are dying later in the cycle. The objection is arriving after the demo, not before it.",
      "bad",
    );
    push(
      "Product",
      "Customer rating unchanged",
      "Satisfaction sits at " + n0(s.satisfaction) + " and returns have not moved. Nothing about the product got worse.",
      "flat",
    );
    push(
      "Marketing",
      "Cost per lead " + arrow(1) + " " + n1(Math.max(4, delta(cpl, priorCpl) + 5)) + "%",
      "Volume is holding. The leads are simply more expensive to get.",
      "watch",
    );
    push(
      "Market intelligence",
      "A competitor is discounting",
      "Kalpa Labs is visibly cheaper in the channel. Nobody will tell you by exactly how much, or for how long.",
      "bad",
    );
  } else if (id === "blitz") {
    push(
      "Marketing",
      "Cost per lead " + arrow(1) + " " + n1(Math.max(18, delta(cpl, priorCpl) + 22)) + "%",
      "Auction prices doubled in a fortnight across every paid channel at once.",
      "bad",
    );
    push(
      "Sales",
      "Lead quality down",
      "Volume is close to plan. The leads convert worse than the same leads did last quarter.",
      "watch",
    );
    push("Product", "Nothing has changed", "Ratings, returns and satisfaction are all flat.", "flat");
    push(
      "Market intelligence",
      "Somebody is buying the category",
      "Vega Health is unavoidable in every feed your buyer uses. Their spend is not public.",
      "bad",
    );
  } else if (id === "leapfrog") {
    push(
      "Sales",
      "Win rate against one competitor collapsed",
      "Against everyone else it is unchanged. The losses are concentrated.",
      "bad",
    );
    push(
      "Product",
      "Your ratings have not moved",
      "Satisfaction " + n0(s.satisfaction) + ", quality score " + n0(s.quality) + ". Nothing you shipped got worse.",
      "flat",
    );
    push(
      "Marketing",
      "Comparison searches rising",
      "Buyers are researching you alongside a specific rival more than they were.",
      "watch",
    );
    push(
      "Market intelligence",
      "A rival shipped something",
      "Zenith has a capability you do not. Whether buyers will keep caring is not yet clear.",
      "bad",
    );
  } else if (id === "supply") {
    push(
      "Operations",
      "Two vendors missed confirmations",
      "Both source from the same fab. Supplier reliability stands at " + n0(s.supplierRel) + ".",
      "bad",
    );
    push(
      "Operations",
      "Lead times extending",
      "Your contract manufacturer needs a commitment by Friday to hold the slot.",
      "bad",
    );
    push("Sales", "Pipeline unaffected so far", "Demand has not moved. This is not yet a customer-facing problem.", "flat");
    push(
      "Finance",
      "Runway " + (runway > 90 ? "self-funding" : n1(runway) + " quarters"),
      "Whatever you commit to secure supply comes out of this.",
      runway < 2 ? "bad" : "flat",
    );
  } else if (id === "demand_shift") {
    push(
      "Sales",
      "Pipeline below forecast, second month",
      "Fewer buyers are entering the process at all. The ones who do still convert normally.",
      "bad",
    );
    push("Market intelligence", "Competitors look soft too", "This does not appear to be share moving between players.", "watch");
    push("Product", "Satisfaction stable at " + n0(s.satisfaction), "Existing customers are unchanged in their behaviour.", "flat");
    push("Finance", "Collections slowing slightly", "Receivables sit at " + n0(s.arDays) + " days.", "watch");
  } else if (id === "trust") {
    push(
      "Operations",
      "Return rate spiked",
      "A batch appears to be failing in the field. QA did not catch it. Quality score is " + n0(s.quality) + ".",
      "bad",
    );
    push(
      "Customer success",
      "Satisfaction falling",
      "Currently " + n0(s.satisfaction) + " and moving down through the quarter.",
      "bad",
    );
    push(
      "Marketing",
      "Negative reviews rising",
      "It is being discussed publicly. Branded search sentiment has turned.",
      "bad",
    );
    push(
      "Sales",
      "New business slowing, renewals worse",
      "Repeat purchase is " + pct(s.repeatRate) + " and existing customers are the ones hesitating.",
      "watch",
    );
  }
  return out;
}

/** Which response directions are on the table, and which finance is nervous about. */
export function crisisChoices(id: ArchetypeId, s: CompanyState, factors: Record<string, number>) {
  const runway = num(s.lastNetCF) < 0 ? s.cash / -num(s.lastNetCF) : 6;
  const ids: StrategyId[] = ["fight", "differentiate", "focus", "learn"];

  if (
    factors.capacity > 0.55 &&
    factors.cash > 0.45 &&
    (id === "supply" || id === "trust" || id === "demand_shift" || factors.brand > 0.5)
  ) {
    ids.push("exploit");
  }

  return ids.map((sid) => ({
    ...STRATEGY_BY_ID[sid],
    affordable: sid === "learn" || sid === "focus" || runway > 1.2,
    note:
      sid === "fight" && runway < 1.6
        ? "Finance is uneasy: there is not much runway behind a fight."
        : sid === "exploit"
          ? "Only on the table because you have spare capacity and cash."
          : null,
  }));
}

/** How finance reads the amount committed, without ever quoting a coefficient. */
export function commitReading(strategy: StrategyId | null, commit: number, s: CompanyState) {
  const effect = 1 - Math.exp(-Math.max(0, commit) / 11);
  const strain = (commit * 1e5) / Math.max(1, s.cash);
  const band = effect < 0.15 ? "token" : effect < 0.4 ? "modest" : effect < 0.7 ? "material" : "decisive";
  const pressure =
    strain < 0.05 ? "barely noticeable" : strain < 0.15 ? "noticeable" : strain < 0.3 ? "significant" : "severe";
  const strat = strategy ? STRATEGY_BY_ID[strategy] : null;

  return {
    band,
    strain: pressure,
    line:
      commit <= 0
        ? "Nothing committed. Whatever the strategy says, the company will do none of it."
        : "Finance reads this as a " + band + " commitment, putting " + pressure + " pressure on cash.",
    trade: strat ? strat.risk : "",
  };
}

/* ── the quarter itself ───────────────────────────────────────────── */

export function runQuarter(
  state: CompanyState,
  alloc: Alloc,
  warranty: WarrantyId,
  crisis: (CrisisInput & { variant?: ArchetypeId }) | null,
  startInno: string[],
  payTerms: PayTermsId,
  productsOverride?: Record<ProductId, ProductState>,
): QuarterResultShape {
  const A: NumericAlloc = numericAlloc(alloc);
  const q = state.quarter;
  const notes: string[] = [];
  const terms = PAY_TERMS[payTerms] || PAY_TERMS.net30;
  const P = productsOverride || state.products;

  const hasCrisis = !!(crisis && crisis.variant);
  const situation = hasCrisis ? crisisSituation(crisis!.variant as ArchetypeId, state) : null;
  const profile = crisisProfile(situation, hasCrisis ? crisis!.strategy : null, hasCrisis ? num(crisis!.commit) : 0);
  const variant = hasCrisis ? (crisis!.variant as ArchetypeId) : null;
  const strategy = hasCrisis ? crisis!.strategy : null;

  let damp = profile.damp;
  let convPenaltyLive = profile.convPenalty;
  const ceilingPenalty = profile.ceilingPenalty;
  let capMult = profile.capMult;
  let cogsSurcharge = profile.cogsSurcharge;
  let refShift = profile.refShift;
  const logisticsHit = profile.logisticsHit;
  const brandErosion = profile.brandErosion;
  const satHit = profile.satHit;
  let custLossLive = profile.custLossBase;
  const supplierBonus = 0;
  let mktMult = profile.mktMult;
  let reachMult = profile.reachMult;
  const convBonus = profile.convBonus;
  let brandBoost = profile.brandBoost;
  let priceCut = profile.priceCut;

  /* Last quarter's response is still being paid for, or still paying out. */
  const after = state.aftermath || {};
  if (after.refShift) refShift += after.refShift;
  if (after.brandBonus) brandBoost += after.brandBonus;
  if (after.reachMult) reachMult *= after.reachMult;
  if (after.shareCarry) reachMult *= 1 + after.shareCarry;
  if (after.cogsDrag) cogsSurcharge += after.cogsDrag;
  if (after.priceCut) priceCut += after.priceCut;
  if (after.note) notes.push("Carried forward from last quarter: " + after.note);

  /* A shock that started in Q3 has partly worn off by Q4. */
  if (hasCrisis && q === 4) {
    const relief = clamp(0.3 + num(after.vulnRelief), 0, 0.7);
    damp = Math.min(1, damp + (1 - damp) * relief);
    convPenaltyLive *= 1 - relief;
    custLossLive *= 1 - relief;
    capMult = Math.min(1, capMult + (1 - capMult) * relief);
    mktMult = Math.min(1, mktMult + (1 - mktMult) * relief);
    notes.push("The shock is a quarter old and the market has partly normalised.");
  }

  if (hasCrisis && situation) {
    notes.push(
      ARCHETYPES[variant!].name +
        ": exposure assessed at " +
        pct(situation.vuln * 100) +
        " of maximum, severity level " +
        situation.level +
        " of 3.",
    );
  }

  const dampBefore = profile.damp;
  const penaltyBefore = profile.convPenalty;
  const convRecovery = Math.max(0, profile.convPenalty - convPenaltyLive);
  const convPenalty = Math.max(0, convPenaltyLive);
  const custLoss = Math.max(0, custLossLive);

  /* ── people ─────────────────────────────────────────────────── */

  const staffOut = {} as Record<DeptId, number>;
  const hiredBy = {} as Record<DeptId, number>;
  const firedBy = {} as Record<DeptId, number>;
  let recruitCost = 0;
  let severanceCost = 0;
  let totalHired = 0;
  let totalFired = 0;

  DEPARTMENTS.forEach((d) => {
    const now = num(state.staff[d.id]);
    // Nobody can be cut below the founding team in that function.
    const fired = Math.min(Math.round(A["fire_" + d.id]), Math.max(0, now - d.base));
    const hired = Math.round(A["hire_" + d.id]);
    staffOut[d.id] = now - fired + hired;
    hiredBy[d.id] = hired;
    firedBy[d.id] = fired;
    recruitCost += hired * d.hire;
    severanceCost += fired * d.sever;
    totalHired += hired;
    totalFired += fired;
  });

  const headcountOut = headcount(staffOut);
  const salaries = salaryBill(staffOut);
  const peopleCost = recruitCost + severanceCost;
  const cutShare = state.quarter && headcount(state.staff) > 0 ? totalFired / headcount(state.staff) : 0;

  const empSat = Math.max(0, state.empSat + 5 * pw(A.culture, 0.5) - 25 * cutShare);
  const empEng = Math.max(0, state.empEng + 6 * pw(A.hrTraining, 0.5) - 20 * cutShare);
  const prodMult = 1 + (empSat - 50) * 0.004;
  const attritionNext = Math.max(3, 15 - 0.12 * empEng - 0.4 * pw(A.salesTraining, 0.5) + 6 * cutShare);

  if (totalFired > 0) {
    notes.push(n0(totalFired) + " roles cut: " + inrLocal(severanceCost) + " of severance, and morale carries the rest.");
  }

  /* ── how much of the plan each function can actually deliver ── */

  const staffing = {} as Record<DeptId, number>;
  const need = {} as Record<DeptId, number>;
  const effHeads = {} as Record<DeptId, number>;

  DEPARTMENTS.forEach((d) => {
    const load = DEPT_LOAD[d.id];
    const funded = load.keys.reduce((sum, k) => sum + num(A[k]), 0) * 1e5;
    need[d.id] = d.base + funded / load.per;
    // A joiner contributes ~60% in their first quarter; a leaver contributes nothing.
    effHeads[d.id] = num(state.staff[d.id]) - firedBy[d.id] + hiredBy[d.id] * 0.6;
    staffing[d.id] = clamp(effHeads[d.id] / Math.max(0.5, need[d.id]), 0.55, 1);
  });

  const shortRoles = DEPARTMENTS.filter((d) => staffing[d.id] < 0.999);
  shortRoles.forEach((d) =>
    notes.push(
      d.name +
        " is short: " +
        n1(effHeads[d.id]) +
        " people against " +
        n1(need[d.id]) +
        " the plan needs, running at " +
        pct(staffing[d.id] * 100) +
        ".",
    ),
  );

  /* ── credit, treasury and governance ────────────────────────── */

  const openingInventory = PRODUCTS.reduce((sum, p) => sum + num(P[p.id].inv) * num(P[p.id].invCost), 0);
  const openNetWorth =
    state.cash + state.ar + openingInventory + state.equipment + state.ip - state.ap - state.debt - OTHER_LIABILITIES;
  const debtLimit = Math.max(0, 0.6 * openNetWorth - state.debt);
  const drawn = Math.min(A.draw * 1e5, debtLimit);
  const drawRejected = A.draw * 1e5 - drawn;
  const repaid = Math.min(A.repay * 1e5, state.debt + drawn);
  const debtClose = state.debt + drawn - repaid;
  const interestExpense = ((state.debt + debtClose) / 2) * INTEREST_RATE;
  const treasuryRate = Math.min(2.5, 0.8 + 0.55 * pw(A.treasury, 0.5)) / 100;
  const interestIncome = Math.max(0, state.cash) * treasuryRate;
  const arDays = Math.max(10, 30 - 8 * pw(A.workingCapital, 0.5));

  const adminStaffing = staffing.admin;
  const compliance = state.compliance + 5 * pw(A.compliance, 0.5) * adminStaffing;
  const forecast = state.forecast + 6 * pw(A.planning, 0.5) * adminStaffing;
  const cashEffBonus = Math.max(0, forecast - 55) * 0.1;
  const audit = state.audit + 5 * pw(A.audit, 0.5) * adminStaffing;
  const penaltyRisk = Math.max(5, 40 - 0.25 * compliance - 0.1 * audit);

  if (drawRejected > 1) {
    notes.push(
      "Credit capped at " + inrLocal(debtLimit) + ". " + inrLocal(drawRejected) + " of the requested draw was refused.",
    );
  }

  /* ── demand generation ──────────────────────────────────────── */

  const mktStaffing = staffing.marketing;
  const marketingSpend = DEPT_LOAD.marketing.keys.reduce((sum, k) => sum + num(A[k]), 0) * 1e5;
  const referralCapLeads = 0.2 * state.customers;
  const referralCapSpend = (referralCapLeads * 300) / 1e5;

  const mk = {
    google: 375 * pw(A.google, 0.68),
    meta: 200 * pw(A.meta, 0.65),
    social: 225 * pw(A.social, 0.72),
    content: 75 * pw(A.content, 0.62),
    events: 90 * pw(A.events, 0.62),
    email: 80 * pw(A.email, 0.55),
    direct: 160 * pw(A.direct, 0.6),
    referral: Math.min((A.referral * 1e5) / 300, referralCapLeads),
  };
  const rawLeads = Object.values(mk).reduce((a, b) => a + b, 0);
  const impressions = 4e4 * A.meta;
  const brandGain = 1.2 * A.meta + 2.5 * A.social + 1.5 * A.events + 1.8 * pw(A.design, 0.5) * staffing.engineering;
  const seoGain = 3.5 * A.content;
  const hypeGain = 5 * pw(A.prelaunch, 0.5);
  const directFatigue = 0.25 * Math.max(0, A.direct - 8);
  const directConv = 0.8 * pw(A.direct, 0.4);
  const referralWaste = Math.max(0, A.referral - referralCapSpend);
  const seoFree = state.seo * 25;
  const hypeFree = num(state.launchBoostLeft) > 0 ? num(state.launchHype) * 30 : 0;
  const dampedRaw = rawLeads * damp;
  const brandNow = Math.max(0, state.brand + brandGain - brandErosion);
  const brandMult = 1 + brandNow / 50;
  const effLeads = (dampedRaw + seoFree + hypeFree) * brandMult * prodMult * mktStaffing;

  /* ── selling capacity ───────────────────────────────────────── */

  const salesStaffing = staffing.sales;
  const repCapacity = 500 * A.reps * (1 - state.attrition / 100) * salesStaffing;
  const channelCapacity = 420 * pw(A.channel, 0.75);
  const capacity = repCapacity + channelCapacity;
  const channelShare = capacity > 0 ? channelCapacity / capacity : 0;
  const repsBonus = 2 * pw(A.reps, 0.5);
  const crmBonus = 1.5 * pw(A.crm, 0.4);
  const trainBonus = 2.2 * pw(A.salesTraining, 0.45);
  const leadsUsed = Math.min(effLeads, capacity);
  // Leads beyond capacity are lost, not stored.
  const leadsWasted = Math.max(0, effLeads - capacity);
  const idleCapacity = Math.max(0, capacity - effLeads);

  /* ── product and the innovation board ───────────────────────── */

  const engStaffing = staffing.engineering;
  const started = (startInno || []).filter(
    (id) => INNOVATION_BY_ID[id] && state.innovations.indexOf(id) < 0 && !state.pipeline[id],
  );
  const innoSpend = started.reduce((sum, id) => sum + INNOVATION_BY_ID[id].cost, 0);

  const pipeline: Record<string, number> = { ...state.pipeline };
  const landed: string[] = [];
  started.forEach((id) => {
    if (INNOVATION_BY_ID[id].lead > 0) pipeline[id] = INNOVATION_BY_ID[id].lead;
    else landed.push(id);
  });
  Object.keys(state.pipeline).forEach((id) => {
    const left = state.pipeline[id] - 1;
    if (left <= 0) {
      landed.push(id);
      delete pipeline[id];
    } else {
      pipeline[id] = left;
    }
  });
  const ownedInno = state.innovations.concat(landed);

  landed.forEach((id) => notes.push("Shipped from the innovation board: " + INNOVATION_BY_ID[id].name + "."));
  Object.keys(pipeline).forEach((id) =>
    notes.push(INNOVATION_BY_ID[id].name + " is in development, landing in " + pipeline[id] + " quarter(s)."),
  );

  const qualityGain = 6 * pw(A.quality, 0.5) * engStaffing;
  const quality = state.quality + qualityGain + innoSum(landed, "quality");
  const defectRate = Math.max(2, 8 - 1.2 * pw(A.quality, 0.5) * engStaffing);
  const innovGain = innoSum(landed, "innovation");
  let innovation = state.innovation + innovGain;
  const shareAwareness = num(state.marketShare) * 15;
  let brandEnd = brandNow + innoSum(landed, "brand") + shareAwareness + brandBoost;
  let npd = state.npd + 16 * pw(A.npd, 0.5) * engStaffing;
  let proLaunching = false;
  const hypeNow = num(state.launchHype) + hypeGain;

  if (!P.pro.live && npd >= 100) {
    proLaunching = true;
    npd = 0;
    innovation += 15;
    brandEnd += 20 + hypeNow * 0.25;
    notes.push(
      "The Nadi Pulse Pro cleared development and goes on sale next quarter, with 35% of the line assigned to it by default — change that on the Product screen.",
    );
    notes.push(
      hypeNow > 4
        ? "Pre-launch marketing built " +
            n1(hypeNow) +
            " points of anticipation. The Pro launches into a market that already knows about it."
        : "No pre-launch marketing was funded, so the Pro launches to an audience that has never heard of it.",
    );
  }

  const designCogsCut = 40 * pw(A.design, 0.5) * engStaffing - innoSum(ownedInno, "cogs");
  const innoCeiling = innoSum(ownedInno, "ceiling");
  const ceilingGross = 22 + (quality + 0.5 * innovation) * 0.3 + innoCeiling + (P.pro.live ? 2 : 0);
  const ceiling = ceilingGross - ceilingPenalty;

  /* ── operations and customer experience ─────────────────────── */

  const supportStaffing = staffing.support;
  const opsStaffing = staffing.operations;

  const supplierRel = clamp(
    state.supplierRel + 4 * pw(A.supplier, 0.5) * opsStaffing + supplierBonus + terms.rel,
    0,
    100,
  );
  const logisticsEff = Math.min(100, state.logisticsEff + 5 * pw(A.logistics, 0.5) * opsStaffing);
  const logisticsNow = Math.max(0, logisticsEff - logisticsHit);
  const holdingPerUnit = Math.max(40, 150 - 22 * pw(A.warehouse, 0.5));

  const onboardSat = 3 * pw(A.onboarding, 0.5) * supportStaffing;
  const onboardRepeat = 3 * pw(A.onboarding, 0.4) * supportStaffing;
  const logisticsSat = 0.05 * logisticsNow + 2 * pw(A.warehouse, 0.5);
  const satisfaction = Math.max(
    0,
    state.satisfaction +
      onboardSat +
      logisticsSat +
      4 * pw(A.cx, 0.5) * supportStaffing +
      innoSum(landed, "satisfaction") -
      satHit -
      directFatigue,
  );
  const satBonus = (satisfaction - 50) * 0.1;

  /* ── price and position ─────────────────────────────────────── */

  const effPrice = {} as Record<ProductId, number>;
  PRODUCTS.forEach((p) => {
    effPrice[p.id] = Math.max(1000, num(P[p.id].price) - priceCut);
  });

  const priceInfo = {} as QuarterResultShape["priceInfo"];
  PRODUCTS.forEach((p) => {
    const cur = P[p.id];
    const ref = p.refPrice + (p.id === "pulse" ? refShift : 0);
    const mult = clamp(Math.pow(ref / Math.max(1, effPrice[p.id]), PRICE_ELASTICITY), 0.45, 1.75);
    priceInfo[p.id] = {
      ref,
      price: effPrice[p.id],
      listPrice: cur.price,
      cut: priceCut,
      mult,
      premium: (effPrice[p.id] / ref - 1) * 100,
    };
  });

  const sellable = PRODUCTS.filter((p) => P[p.id].live && P[p.id].status !== "discontinued");
  const hypeMult = num(state.launchBoostLeft) > 0 ? clamp(1 + num(state.launchHype) / 60, 1, 1.9) : 1;

  const rawWeights: Record<string, number> = {};
  sellable.forEach((p) => {
    rawWeights[p.id] = Math.max(0, num(P[p.id].share)) * (p.id === "pro" ? hypeMult : 1);
  });
  const weightTotal = sellable.reduce((sum, p) => sum + rawWeights[p.id], 0) || 1;
  const demandWeight: Record<string, number> = {};
  sellable.forEach((p) => {
    demandWeight[p.id] = rawWeights[p.id] / weightTotal;
  });

  const blendedPriceMult = sellable.reduce((sum, p) => sum + demandWeight[p.id] * priceInfo[p.id].mult, 0) || 1;
  const blendedPrice = sellable.reduce((sum, p) => sum + demandWeight[p.id] * effPrice[p.id], 0) || 1;
  const blendedRef = sellable.reduce((sum, p) => sum + demandWeight[p.id] * priceInfo[p.id].ref, 0) || 1;

  const mktDemand = marketDemand(q) * mktMult;
  const growth = Math.pow(1 + CATEGORY_GROWTH, q - 1);
  const surge: Record<string, number> = { kalpa: 1, vega: 1, zenith: 1, tail: 1 };
  if (hasCrisis && ARCHETYPES[variant!].rival) {
    surge[ARCHETYPES[variant!].rival as string] =
      q === 4 ? 1 + (profile.rivalSurge - 1) * 0.55 : profile.rivalSurge;
  }

  const rivalState = COMPETITORS.map((c) => ({ ...c, strength: c.strength * growth * surge[c.id] }));
  const rivalTotal = rivalState.reduce((sum, c) => sum + c.strength, 0);

  const voiceIdx = 0.55 + 0.45 * Math.min(1, marketingSpend / 18e5);
  const priceIdx = clamp(Math.pow(blendedRef / Math.max(1, blendedPrice), 0.9), 0.55, 1.6);
  const fillIdx = 0.75 + 0.25 * clamp(num(state.fillRate), 0, 1);
  const productPull = Math.max(4, 16 + brandEnd + 0.6 * innovation + 0.5 * quality + 0.25 * (satisfaction - 50));
  const ourStrength = productPull * priceIdx * voiceIdx * fillIdx;
  const attractShare = ourStrength / (ourStrength + rivalTotal);
  const reachableDemand = mktDemand * attractShare * reachMult;

  const rawConv = 19 + repsBonus + crmBonus + trainBonus + directConv + satBonus;
  const cappedConv = Math.min(rawConv, ceiling);
  const ceilingBinding = rawConv > ceiling;
  const warrantyBonus = warranty === "2yr" ? 3 : warranty === "1yr" ? 1.5 : 0;
  const warrantyMult = warranty === "2yr" ? 1.8 : warranty === "1yr" ? 1 : 0;
  const finalConv = Math.max(0, cappedConv + warrantyBonus + convBonus - convPenalty);

  /* ── the line ───────────────────────────────────────────────── */

  const capacityAdded = 240 * pw(A.capex, 0.75);
  const installedCapacity = state.installedCapacity + capacityAdded;
  const runCapability = 420 * pw(A.production, 0.7);
  const grossRun = Math.min(installedCapacity, runCapability);
  const runLimited = runCapability < installedCapacity;
  // Losses compound multiplicatively: attrition, staffing, supplier reliability, shock.
  const ownBuilt = grossRun * (1 - state.attrition / 100) * opsStaffing * (supplierRel / 100) * capMult;
  const utilisation = installedCapacity > 0 ? grossRun / installedCapacity : 0;
  const capacityUnits = ownBuilt;
  const scaleDiscount = Math.min(0.06, num(state.marketShare) * 0.25);
  const unitCostBase =
    Math.max(2000, 3250 - 90 * pw(A.production, 0.5) * opsStaffing - designCogsCut) * (1 - scaleDiscount);

  const producing = PRODUCTS.filter((p) => P[p.id].live && P[p.id].status === "active");
  const producingShare = producing.reduce((sum, p) => sum + Math.max(0, num(P[p.id].share)), 0) || 1;

  const built = {} as Record<ProductId, number>;
  const unitCost = {} as Record<ProductId, number>;
  let lineUsed = 0;

  PRODUCTS.forEach((p) => {
    const share = producing.indexOf(p) >= 0 ? Math.max(0, num(P[p.id].share)) / producingShare : 0;
    const lineUnits = capacityUnits * share;
    built[p.id] = lineUnits / p.capacityCost;
    lineUsed += lineUnits;
    const ratio = p.cogs / PRODUCT_BY_ID.pulse.cogs;
    unitCost[p.id] = Math.max(p.cogs * 0.62, unitCostBase * ratio) * terms.cogsMult + cogsSurcharge;
  });

  const repeatRate =
    num(state.aftermath.repeatBonus) +
    state.repeatRate +
    3 * pw(A.email, 0.5) +
    onboardRepeat +
    2 * pw(A.cx, 0.4) * supportStaffing +
    innoSum(landed, "repeat");

  const funnelUnits = (leadsUsed * finalConv) / 100;
  const repeatUnits = (repeatRate / 100) * state.priorUnits;
  const funnelDemand = (funnelUnits + repeatUnits) * blendedPriceMult;
  const demandTotal = Math.min(funnelDemand, reachableDemand);
  const demandBeyondPosition = Math.max(0, funnelDemand - reachableDemand);
  const positionBinding = demandBeyondPosition > 0.5;

  /* ── selling, stock and the P&L ─────────────────────────────── */

  const wac = {} as Record<ProductId, number>;
  const sold = {} as Record<ProductId, number>;
  const demand = {} as Record<ProductId, number>;
  const avail = {} as Record<ProductId, number>;
  const invOut = {} as Record<ProductId, number>;
  const revenue = {} as Record<ProductId, number>;
  const clearance = {} as Record<ProductId, number>;

  let unitsSold = 0;
  let unmetDemand = 0;
  let revenueT = 0;
  let cogs = 0;
  let prodCostTotal = 0;
  let invValue = 0;

  PRODUCTS.forEach((p) => {
    const cur = P[p.id];
    const openUnits = num(cur.inv);
    const openCost = num(cur.invCost);
    const madeUnits = built[p.id];

    wac[p.id] =
      openUnits + madeUnits > 0
        ? (openUnits * openCost + madeUnits * unitCost[p.id]) / (openUnits + madeUnits)
        : unitCost[p.id];
    avail[p.id] = openUnits + madeUnits;
    prodCostTotal += madeUnits * unitCost[p.id];
    clearance[p.id] = 0;

    if (!cur.live) {
      demand[p.id] = 0;
      sold[p.id] = 0;
      invOut[p.id] = avail[p.id];
      revenue[p.id] = 0;
    } else if (cur.status === "discontinued") {
      demand[p.id] = avail[p.id];
      sold[p.id] = avail[p.id];
      clearance[p.id] = avail[p.id] * effPrice[p.id] * 0.6;
      invOut[p.id] = 0;
      revenue[p.id] = clearance[p.id];
    } else {
      const want = demandTotal * (demandWeight[p.id] || 0);
      demand[p.id] = want;
      sold[p.id] = Math.min(want, avail[p.id]);
      unmetDemand += Math.max(0, want - avail[p.id]);
      invOut[p.id] = avail[p.id] - sold[p.id];
      revenue[p.id] = sold[p.id] * effPrice[p.id];
    }

    revenueT += revenue[p.id];
    cogs += sold[p.id] * wac[p.id];
    invValue += invOut[p.id] * wac[p.id];
    unitsSold += sold[p.id];
  });

  const supplyBinding = unmetDemand > 0.5;
  const invUnitsOut = PRODUCTS.reduce((sum, p) => sum + invOut[p.id], 0);
  const excessUnits = Math.max(0, invUnitsOut - 1.5 * unitsSold);
  const excessShare = invUnitsOut > 0 ? excessUnits / invUnitsOut : 0;
  const stockWritedown = invValue * excessShare * 0.15;
  invValue -= stockWritedown;
  const wacKeepRatio = invValue + stockWritedown > 0 ? invValue / (invValue + stockWritedown) : 1;

  const grossProfit = revenueT - cogs;
  const channelMargin = (revenue.pulse || 0) * channelShare * 0.18;
  const warrantyCost = unitsSold * (defectRate / 100) * 1500 * warrantyMult;
  const holdingCost = invUnitsOut * holdingPerUnit;
  const overhead = state.overhead;
  const fixedCost = salaries + overhead;
  const depreciation = state.equipment * DEPRECIATION_RATE;
  const amortisation = state.ip * AMORTISATION_RATE;
  const capexSpend = capexLakh(A) * 1e5;
  const opexL = opexLakh(A);
  const opexSpend = opexL * 1e5;
  const compliancePenalty = revenueT * (penaltyRisk / 100) * 0.03;

  const netProfit =
    revenueT -
    cogs -
    channelMargin -
    warrantyCost -
    holdingCost -
    fixedCost -
    opexSpend -
    peopleCost -
    compliancePenalty -
    stockWritedown -
    depreciation -
    amortisation -
    interestExpense +
    interestIncome;

  /* ── cash ───────────────────────────────────────────────────── */

  const arClose = Math.max(MIN_AR, revenueT * (arDays / 90));
  const apClose = prodCostTotal * (terms.days / 90);
  const collections = state.ar + revenueT - arClose;
  const supplierPaid = state.ap + prodCostTotal - apClose;

  const operatingCF =
    collections -
    supplierPaid -
    channelMargin -
    warrantyCost -
    holdingCost -
    fixedCost -
    opexSpend -
    peopleCost -
    compliancePenalty -
    interestExpense +
    interestIncome;
  const investingCF = -(capexSpend + innoSpend);
  const financingCF = drawn - repaid;
  const netCF = operatingCF + investingCF + financingCF;
  const cash = state.cash + netCF;

  const equipment = state.equipment - depreciation + capexSpend;
  const ipAsset = state.ip - amortisation + innoSpend;
  const totalAssets = cash + arClose + invValue + equipment + ipAsset;
  const totalLiabilities = apClose + debtClose + OTHER_LIABILITIES;
  const retainedEarnings = state.retainedEarnings + netProfit;
  const equity = SHARE_CAPITAL + retainedEarnings;
  const netWorth = totalAssets - totalLiabilities;
  const balanceCheck = totalAssets - (totalLiabilities + equity);

  const customers = Math.min(MARKET_CUSTOMERS, (state.customers + unitsSold) * (1 - custLoss / 100));
  const customersLost = (state.customers + unitsSold) * (custLoss / 100);
  const marketShare = clamp(unitsSold / mktDemand, 0, 1);
  const shareDelta = marketShare - num(state.marketShare);
  const fillRate = clamp(demandTotal > 0 ? unitsSold / demandTotal : 1, 0, 1);

  /* ── valuation ──────────────────────────────────────────────── */

  const sharePremium = marketShare * 100 * 150000;
  const intangible = (brandEnd + innovation + quality) * 2e4 + customers * 300 + sharePremium;
  const leadWasteFrac = effLeads > 0 ? clamp(leadsWasted / effLeads, 0, 1) : 0;
  const unmetFrac = demandTotal > 0 ? clamp(unmetDemand / demandTotal, 0, 1) : 0;
  const wasteFrac = clamp(leadWasteFrac + (1 - leadWasteFrac) * unmetFrac, 0, 1);
  const wastedMarketing = marketingSpend * wasteFrac;
  const gmQ = revenueT > 0 ? grossProfit / revenueT : 0;
  const burnRatio = revenueT > 0 ? Math.max(0, -netCF) / revenueT : 1.2;
  const revQuality = clamp(
    0.55 + 1.1 * (gmQ - 0.45) + 0.35 * (1 - clamp(burnRatio, 0, 1.5)) - 0.5 * wasteFrac,
    0.35,
    1.35,
  );
  const revWindow = (state.revHistory || []).concat([revenueT]).slice(-3);
  const avgRev = revWindow.reduce((a, b) => a + b, 0) / revWindow.length;
  const method1 = avgRev * 4 * 3 * revQuality;
  const valuation = Math.max(0, 0.7 * method1 + 0.2 * netWorth + intangible);

  const wcBreached = cash < BUFFER;
  const insolvent = cash < 0;
  /**
   * Faithful to the original, including its stale letter check: `variant` is an archetype id
   * ("supply"), never "D", so the capacity-multiplier branch never runs and every archetype is
   * judged on dampening + conversion recovery. Left as-is because the backend now owns scoring.
   */
  const neutralised = hasCrisis
    ? (variant as unknown as string) === "D"
      ? capMult >= 0.99
      : damp >= 0.97 && convPenalty <= 0.5
    : false;
  const runway = netCF < 0 ? cash / -netCF : 99;

  /* ── the state the next quarter opens on ────────────────────── */

  const nextProducts = {} as Record<ProductId, ProductState>;
  PRODUCTS.forEach((p) => {
    const cur = P[p.id];
    const launching = p.id === "pro" && proLaunching;
    nextProducts[p.id] = {
      ...cur,
      live: cur.live || launching,
      status: cur.status === "discontinued" ? "discontinued" : cur.status,
      share: launching ? 35 : num(cur.share),
      inv: invOut[p.id],
      invCost: wac[p.id] * wacKeepRatio,
    };
  });
  if (proLaunching) nextProducts.pulse = { ...nextProducts.pulse, share: 65 };

  const next: CompanyState = {
    ...state,
    quarter: q + 1,
    cash,
    ar: arClose,
    ap: apClose,
    debt: debtClose,
    equipment,
    ip: ipAsset,
    retainedEarnings,
    installedCapacity,
    staff: staffOut,
    products: nextProducts,
    innovations: ownedInno,
    pipeline,
    launchHype: hypeNow,
    launchBoostLeft: proLaunching ? 2 : Math.max(0, num(state.launchBoostLeft) - (P.pro.live ? 1 : 0)),
    customers,
    priorUnits: unitsSold,
    brand: brandEnd,
    seo: state.seo + seoGain,
    quality,
    innovation,
    npd,
    supplierRel,
    logisticsEff,
    empSat,
    empEng,
    compliance,
    forecast,
    audit,
    satisfaction,
    repeatRate,
    attrition: attritionNext,
    arDays,
    payTerms: terms.id,
    overhead: overhead * (1 - cashEffBonus / 100),
    marketShare,
    fillRate,
    priorDemand: demandTotal,
    lastGM: revenueT > 0 ? grossProfit / revenueT : 0,
    lastNetCF: netCF,
    revHistory: (state.revHistory || []).concat([revenueT]).slice(-3),
    lastMix: Object.fromEntries(DEPT_LOAD.marketing.keys.map((k) => [k, num(A[k])])),
    aftermath: hasCrisis ? (profile.aftermath as CompanyState["aftermath"]) : {},
    crisisLog: hasCrisis
      ? (state.crisisLog || []).concat([
          {
            q,
            archetype: variant!,
            name: ARCHETYPES[variant!].name,
            level: situation!.level,
            vuln: situation!.vuln,
            diagnosis: crisis!.diagnosis,
            trueDiagnosis: TRUE_DIAGNOSIS[variant!],
            strategy,
            commit: num(crisis!.commit),
            protectedBy: situation!.protectedBy,
            exposedBy: situation!.exposedBy,
            shareBefore: num(state.marketShare),
            shareAfter: marketShare,
            gm: revenueT > 0 ? grossProfit / revenueT : 0,
            custLost: customersLost,
            unitsSold,
            note: (profile.aftermath.note as string) || "",
          },
        ])
      : state.crisisLog || [],
    wcBreached: state.wcBreached || wcBreached,
    everInsolvent: state.everInsolvent || insolvent,
  };

  return {
    q,
    A,
    warranty,
    notes,
    neutralised,
    terms,
    entering: state,
    next,
    P,
    crisis: hasCrisis ? { variant: variant!, choice: strategy } : null,
    situation,

    damp,
    dampBefore,
    convPenalty,
    penaltyBefore,
    convRecovery,
    ceilingPenalty,
    capMult,
    cogsSurcharge,
    refShift,
    custLoss,
    customersLost,
    brandErosion,
    CP: profile,
    mktMult,
    reachMult,
    crisisConvBonus: convBonus,
    crisisBrand: brandBoost,

    staffOut,
    hiredBy,
    firedBy,
    totalHired,
    totalFired,
    headcount: headcountOut,
    salaries,
    recruitCost,
    severanceCost,
    peopleCost,
    staffing,
    need,
    effHeads,
    shortRoles,
    empSat,
    empEng,
    prodMult,
    attritionNext,
    overhead,
    fixedCost,

    openNetWorth,
    debtLimit,
    drawn,
    drawRejected,
    repaid,
    debtClose,
    interestExpense,
    interestIncome,
    treasuryRate,
    arDays,
    compliance,
    forecast,
    audit,
    cashEffBonus,
    penaltyRisk,

    mk,
    rawLeads,
    impressions,
    brandGain,
    seoGain,
    directFatigue,
    directConv,
    referralCapLeads,
    referralCapSpend,
    referralWaste,
    seoFree,
    hypeFree,
    dampedRaw,
    brandNow,
    brandEnd,
    brandMult,
    effLeads,

    repCapacity,
    channelCapacity,
    capacity,
    channelShare,
    repsBonus,
    crmBonus,
    trainBonus,
    leadsUsed,
    leadsWasted,
    idleCapacity,

    started,
    landed,
    pipeline,
    innoSpend,
    ownedInno,
    innoCeiling,
    hypeGain,
    hypeNow,
    hypeMult,
    qualityGain,
    quality,
    defectRate,
    innovGain,
    innovation,
    npd,
    proLaunching,
    avgRev,
    designCogsCut,
    ceilingGross,
    ceiling,
    ceilingBinding,

    supplierRel,
    logisticsEff,
    logisticsNow,
    holdingPerUnit,
    satisfaction,
    satBonus,

    priceInfo,
    blendedPriceMult,
    demandWeight,
    sellable,
    producing,
    rawConv,
    cappedConv,
    warrantyBonus,
    warrantyMult,
    finalConv,

    capacityAdded,
    installedCapacity,
    runCapability,
    runLimited,
    grossRun,
    utilisation,
    ownBuilt,
    capacityUnits,
    lineUsed,
    unitCost,
    unitCostBase,
    built,
    wac,

    repeatRate,
    funnelUnits,
    repeatUnits,
    demandTotal,
    demand,
    avail,
    sold,
    invOut,
    clearance,
    effPrice,
    priceCut,
    mktDemand,
    rivalState,
    rivalTotal,
    ourStrength,
    attractShare,
    reachableDemand,
    marketShare,
    shareDelta,
    fillRate,
    funnelDemand,
    demandBeyondPosition,
    positionBinding,
    voiceIdx,
    priceIdx,
    fillIdx,
    productPull,
    blendedPrice,
    blendedRef,
    scaleDiscount,
    shareAwareness,
    sharePremium,
    compliancePenalty,

    revenue,
    unitsSold,
    unmetDemand,
    supplyBinding,
    invUnitsOut,
    invValue,
    revenueT,
    cogs,
    grossProfit,
    channelMargin,
    warrantyCost,
    holdingCost,
    depreciation,
    amortisation,
    opexSpend,
    opexL,
    capexSpend,
    netProfit,
    stockWritedown,
    excessUnits,
    excessShare,
    arClose,
    apClose,
    prodCostTotal,
    collections,
    supplierPaid,
    operatingCF,
    investingCF,
    financingCF,
    netCF,
    cash,
    openingCash: state.cash,
    runway,
    inventory: invValue,
    equipment,
    ipAsset,
    totalAssets,
    totalLiabilities,
    retainedEarnings,
    equity,
    netWorth,
    balanceCheck,
    customers,
    method1,
    method2: netWorth,
    intangible,
    valuation,
    revQuality,
    gmQ,
    burnRatio,
    wcBreached,
    insolvent,
    marketingSpend,
    wastedMarketing,
    wasteFrac,
    leadWasteFrac,
    unmetFrac,
  } as QuarterResultShape;
}

/* Local copy so the engine does not import the currency formatter for two note strings. */
function inrLocal(v: number): string {
  return (v < 0 ? "-" : "") + "₹" + Math.abs(Math.round(num(v))).toLocaleString("en-IN");
}

/* ── balance-sheet views ──────────────────────────────────────────── */

export type BalanceView = {
  cash: number;
  ar: number;
  inventory: number;
  equipment: number;
  ip: number;
  assets: number;
  ap: number;
  debt: number;
  other: number;
  liabilities: number;
  share: number;
  re: number;
  equity: number;
  invUnits: number;
};

/** The balance sheet as the quarter opened. */
export function balanceOpening(s: CompanyState): BalanceView {
  const inventory = PRODUCTS.reduce((sum, p) => sum + num(s.products[p.id].inv) * num(s.products[p.id].invCost), 0);
  const assets = s.cash + s.ar + inventory + s.equipment + s.ip;
  const liabilities = s.ap + s.debt + OTHER_LIABILITIES;
  return {
    cash: s.cash,
    ar: s.ar,
    inventory,
    equipment: s.equipment,
    ip: s.ip,
    assets,
    ap: s.ap,
    debt: s.debt,
    other: OTHER_LIABILITIES,
    liabilities,
    share: SHARE_CAPITAL,
    re: s.retainedEarnings,
    equity: SHARE_CAPITAL + s.retainedEarnings,
    invUnits: PRODUCTS.reduce((sum, p) => sum + num(s.products[p.id].inv), 0),
  };
}

/** The balance sheet as the quarter closed. */
export function balanceClosing(r: QuarterResultShape): BalanceView {
  return {
    cash: r.cash as number,
    ar: r.arClose as number,
    inventory: r.invValue as number,
    equipment: r.equipment as number,
    ip: r.ipAsset as number,
    assets: r.totalAssets as number,
    ap: r.apClose as number,
    debt: r.debtClose as number,
    other: OTHER_LIABILITIES,
    liabilities: r.totalLiabilities as number,
    share: SHARE_CAPITAL,
    re: r.retainedEarnings as number,
    equity: r.equity as number,
    invUnits: r.invUnitsOut as number,
  };
}

export { n2 };
