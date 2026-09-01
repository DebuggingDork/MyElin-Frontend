/**
 * Final year-end report calculations for Nadi Wear simulation.
 * 
 * Ports the scoring logic from the reference App.jsx to calculate:
 * - CEO Band rating (Exceptional/Strong/Competent/Weak/Poor)
 * - Company tier classification (THRIVING/STABLE/DISTRESSED)
 * - Final valuation and comprehensive metrics
 */

import type {
  CEOBand,
  CompanyState,
  EndgameOutcome,
  FinalReport,
  Modifier,
  QuarterResultShape,
  QuarterScore,
  TermSheet,
  TermSheetOffer,
} from "@/lib/simulation/types";
import type { QuarterScore as RemoteQuarterScore } from "@/lib/simulation/remote";

const BUFFER = 30_00_000; // ₹30 lakhs working capital buffer

/**
 * Calculate CEO Band from final score.
 * Bands: Exceptional ≥90, Strong ≥75, Competent ≥60, Weak ≥40, Poor <40
 */
export function calculateCEOBand(finalScore: number): CEOBand {
  if (finalScore >= 90) return "Exceptional";
  if (finalScore >= 75) return "Strong";
  if (finalScore >= 60) return "Competent";
  if (finalScore >= 40) return "Weak";
  return "Poor";
}

/**
 * Determine company tier based on Q3 results and financial health.
 * THRIVING: Q3 cash-positive + valuation grew in Q2 and Q3
 * DISTRESSED: Working capital breached OR ever insolvent OR (cash declining for 3 quarters AND losses worsening)
 * STABLE: Everything else
 */
export function calculateTier(
  q1: QuarterResultShape,
  q2: QuarterResultShape,
  q3: QuarterResultShape,
  state: CompanyState
): { tier: "THRIVING" | "STABLE" | "DISTRESSED"; reason: string } {
  const thriving =
    (q3.netCF as number) > 0 &&
    (q2.valuation as number) > (q1.valuation as number) &&
    (q3.valuation as number) > (q2.valuation as number);

  const cashDeclining =
    (q3.netCF as number) < 0 &&
    (q3.cash as number) < (q2.cash as number) &&
    (q2.cash as number) < (q1.cash as number);

  const lossWorsening = (q3.netCF as number) <= (q2.netCF as number);

  const distressed =
    state.wcBreached ||
    state.everInsolvent ||
    (cashDeclining && lossWorsening);

  if (thriving) {
    return {
      tier: "THRIVING",
      reason: "Q3 closed cash-positive and the valuation rose in both Q2 and Q3. Three parties want a piece of what happens next.",
    };
  }

  if (distressed) {
    return {
      tier: "DISTRESSED",
      reason: "The buffer was breached, or cash has been falling against negative flow. Everything on this page is priced for that.",
    };
  }

  return {
    tier: "STABLE",
    reason: "The company is neither running away nor falling over. The terms on the table reflect exactly that.",
  };
}

/**
 * Build term sheet offers based on company tier and Q3 valuation.
 * Ported from buildTermSheet() in reference App.jsx
 */
export function buildTermSheet(
  q1: QuarterResultShape,
  q2: QuarterResultShape,
  q3: QuarterResultShape,
  state: CompanyState
): TermSheet {
  const { tier } = calculateTier(q1, q2, q3, state);
  const V = Math.max(1, q3.valuation as number);

  // Momentum calculation: floored at 250 units to prevent degeneration
  const q1Base = Math.max((q1.unitsSold as number) || 250, 250);
  const M = Math.min(
    Math.max(Math.pow((q3.unitsSold as number) / q1Base, 0.5) - 1, -0.5),
    1.5
  );
  const trueContinuation = V * (1 + M);

  // Helper to create investment offer details
  const mk = (
    invPct: number,
    covMult: number,
    hitMult: number,
    missHaircut: number,
    ratchet: number
  ) => {
    const investment = invPct * V;
    return {
      investment,
      equity: investment / (V + investment),
      covenant: (q3.unitsSold as number) * (1 + covMult * M),
      hitMult,
      missHaircut,
      ratchet,
    };
  };

  const inr = (v: number) => `₹${(v / 100_000).toFixed(2)}L`;
  const pct = (v: number) => `${v.toFixed(1)}%`;
  const d0 = (v: number) => Math.round(v).toLocaleString();

  let offers: TermSheetOffer[];

  if (tier === "THRIVING") {
    const a = mk(0.25, 1.3, 1.6, 0.6, 1.6);
    offers = [
      {
        id: "A",
        kind: "invest",
        title: "Growth Investor",
        who: "Sattva Capital, Series A",
        pitch: "They like the trajectory and want you to spend into it. The money is real; so is the covenant attached to it.",
        terms: [
          ["Investment", `${inr(a.investment)} (25% of your Q3 valuation)`],
          ["Equity given up", pct(a.equity * 100)],
          ["Q4 covenant", `${d0(a.covenant)} units sold`],
          ["If you hit it", "Q4 valuation marked up 1.60×"],
          ["If you miss", `capped at 60% of Q3, stake ratchets to ${pct(a.equity * a.ratchet * 100)}`],
        ],
        ...a,
      },
      {
        id: "B",
        kind: "acquire",
        title: "Acquisition Offer",
        who: "Meridian Consumer Devices",
        pitch: "Cash today, no covenant, no Q4 risk. The number on the page is the whole story — or the part of it they want you to read.",
        price: V * (1.0 + 0.15 * Math.min(1, M / 0.6)),
        terms: [
          ["Offer price", inr(V * (1.0 + 0.15 * Math.min(1, M / 0.6)))],
          ["Premium over Q3", pct(15 * Math.min(1, M / 0.6))],
          ["Structure", "All cash, closes on signature"],
          ["Your Q4", "Does not happen. The simulation ends here."],
        ],
      },
      {
        id: "C",
        kind: "solo",
        title: "Stay Independent",
        who: "No counterparty",
        pitch: "No cash in, no covenant, no dilution. Q4 runs on your own balance sheet and you are graded on consistency.",
        terms: [
          ["Investment", "None"],
          ["Dilution", "None"],
          ["Q4", "Runs normally"],
          ["Grading", "Consistency of execution"],
        ],
      },
    ];
  } else if (tier === "STABLE") {
    const a = mk(0.15, 1.1, 1.35, 0.75, 1.3);
    offers = [
      {
        id: "A",
        kind: "invest",
        title: "Growth Investor — measured terms",
        who: "Sattva Capital, bridge round",
        pitch: "A smaller cheque against a gentler covenant. They are buying optionality, not conviction.",
        terms: [
          ["Investment", `${inr(a.investment)} (15% of your Q3 valuation)`],
          ["Equity given up", pct(a.equity * 100)],
          ["Q4 covenant", `${d0(a.covenant)} units sold`],
          ["If you hit it", "Q4 valuation marked up 1.35×"],
          ["If you miss", `25% haircut, stake ratchets to ${pct(a.equity * a.ratchet * 100)}`],
        ],
        ...a,
      },
      {
        id: "B",
        kind: "acquire",
        title: "Acquisition Offer — at value",
        who: "Meridian Consumer Devices",
        pitch: "A fair price, honestly struck. Whether fair is enough depends on what you believe the next four quarters hold.",
        price: V,
        terms: [
          ["Offer price", inr(V)],
          ["Premium over Q3", "None — struck at value"],
          ["Structure", "All cash, closes on signature"],
          ["Your Q4", "Does not happen. The simulation ends here."],
        ],
      },
      {
        id: "C",
        kind: "solo",
        title: "Stay Independent, Prove Stability",
        who: "No counterparty",
        pitch: "Nobody is forcing your hand. Run a clean quarter and let the numbers make the argument.",
        terms: [
          ["Investment", "None"],
          ["Dilution", "None"],
          ["Q4", "Runs normally"],
          ["Grading", "Consistency of execution"],
        ],
      },
    ];
  } else {
    // DISTRESSED
    const a = mk(0.4, 0, 1.0, 0, 1.0);
    a.covenant = 0;
    offers = [
      {
        id: "A",
        kind: "invest",
        title: "Rescue Financing",
        who: "Sattva Capital, structured rescue",
        pitch: "The cheque is large because the situation is bad and they know it. No markup on the other side — only survival.",
        terms: [
          ["Investment", `${inr(a.investment)} (40% of your Q3 valuation)`],
          ["Equity given up", pct(a.equity * 100)],
          ["Q4 covenant", "Close the quarter solvent. No unit target."],
          ["If you survive", "Valuation stands, no markup"],
          ["If you do not", "Game over — the company is wound up"],
        ],
        ...a,
      },
      {
        id: "B",
        kind: "acquire",
        title: "Fire-Sale",
        who: "Meridian Consumer Devices",
        pitch: "A genuine discount on a genuinely distressed asset. It ends the risk and it ends the upside.",
        price: V * 0.68,
        terms: [
          ["Offer price", inr(V * 0.68)],
          ["Discount to Q3 valuation", "32%"],
          ["Structure", "All cash, closes on signature"],
          ["Your Q4", "Does not happen. The simulation ends here."],
        ],
      },
      {
        id: "C",
        kind: "solo",
        title: "Self-Fund to Solvency",
        who: "No counterparty",
        pitch: "No investors are interested. Your only path is to close Q4 solvent on your own balance sheet.",
        terms: [
          ["Investment", "None"],
          ["Dilution", "None"],
          ["Q4 covenant", "Stay solvent or the company is wound up"],
          ["Grading", "Survival"],
        ],
      },
    ];
  }

  return {
    tier,
    V,
    M,
    trueContinuation,
    offers,
    q1,
    q2,
    q3,
  };
}

/**
 * Calculate comprehensive final report from all quarters and endgame outcome.
 */
export function buildFinalReport(
  history: QuarterResultShape[],
  scores: RemoteQuarterScore[],
  state: CompanyState,
  endgameOutcome?: EndgameOutcome,
  termSheet?: TermSheet
): FinalReport {
  const [q1, q2, q3, q4] = history;

  // Calculate tier if not provided
  let tier: "THRIVING" | "STABLE" | "DISTRESSED" = "STABLE";
  let tierReason = "";

  if (termSheet) {
    tier = termSheet.tier;
    const { reason } = calculateTier(q1, q2, q3, state);
    tierReason = reason;
  } else if (history.length >= 3) {
    const result = calculateTier(q1, q2, q3, state);
    tier = result.tier;
    tierReason = result.reason;
  }

  // Map remote scores to internal format
  const mappedScores: QuarterScore[] = scores.map((s) => ({
    traits: s.traits.map((t) => ({
      name: t.name,
      weight: t.weight,
      subs: [],
      points: 0,
    })),
    traitTotal: s.traitTotal,
    mods: s.modifiers.map((m) => ({ d: m.points, why: m.why })),
    modTotal: s.modifierTotal,
    final: s.final,
    band: s.band,
  }));

  // Aggregate all trait scores and modifiers
  const allTraits = mappedScores.flatMap((s) => s.traits);
  const allMods = mappedScores.flatMap((s) => s.mods);

  // Calculate final score from last quarter or all quarters
  const lastScore = mappedScores[mappedScores.length - 1];
  const traitTotal = lastScore?.traitTotal || 0;
  const modTotal = lastScore?.modTotal || 0;
  const finalScore = lastScore?.final || 0;
  const ceoBand = calculateCEOBand(finalScore);

  // Calculate aggregated metrics
  const totalUnitsSold = history.reduce((sum, q) => sum + ((q.unitsSold as number) || 0), 0);
  const totalRevenue = history.reduce((sum, q) => sum + ((q.revenueT as number) || 0), 0);
  const totalProfit = history.reduce((sum, q) => sum + ((q.netProfit as number) || 0), 0);

  const lastQuarter = history[history.length - 1];
  const finalCash = (lastQuarter?.cash as number) || 0;
  const finalMarketShare = (lastQuarter?.marketShare as number) || 0;

  // Determine final valuation
  let finalValuation = (lastQuarter?.valuation as number) || 0;
  let gameOver = false;

  if (endgameOutcome) {
    finalValuation = endgameOutcome.finalValuation || finalValuation;
    gameOver = endgameOutcome.gameOver || false;
  }

  return {
    tier,
    tierReason,
    ceoBand,
    finalScore,
    traitTotal,
    modTotal,
    traits: lastScore?.traits || [],
    mods: allMods,
    finalValuation,
    totalUnitsSold,
    totalRevenue,
    totalProfit,
    finalCash,
    finalMarketShare,
    quarterScores: mappedScores,
    endgameOutcome,
    termSheet,
    gameOver,
  };
}

/**
 * Style classes for CEO Band badges
 */
export const BAND_STYLES: Record<CEOBand, string> = {
  Exceptional: "bg-emerald-800 text-emerald-50",
  Strong: "bg-teal-700 text-teal-50",
  Competent: "bg-amber-600 text-amber-50",
  Weak: "bg-orange-700 text-orange-50",
  Poor: "bg-rose-800 text-rose-50",
};
