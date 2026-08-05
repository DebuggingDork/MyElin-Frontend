import { catalogs, openingState } from "@/lib/quarter/catalog";
import {
  formatLakhs,
  type DecisionValue,
  type PreflightFlag,
  type QuarterDraft,
  type QuarterResult,
  type Tier,
} from "@/lib/quarter/types";

/* ────────────────────────────────────────────────────────────────
   Mock quarter engine. Stands in for the backend's run_quarter()
   chain (simulation engine → cross-department effects → delayed
   effects → state update → reports → cognitive scoring) so the UI
   can be wired to the real endpoints without structural change.
   Client-side math here is display arithmetic only.
   ──────────────────────────────────────────────────────────────── */

function numeric(value: DecisionValue | undefined): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value).reduce((a, b) => a + b, 0);
  }
  return 0;
}

export function totalDiscretionarySpend(draft: QuarterDraft): number {
  let total = 0;
  for (const ws of Object.values(draft.decisions)) {
    for (const value of Object.values(ws ?? {})) total += numeric(value);
  }
  return total;
}

/** Projected leads from the marketing draft — power-law on spend, pre-modifier. */
export function projectedLeads(draft: QuarterDraft): number {
  const mkt = draft.decisions.marketing ?? {};
  let leads = 0;
  for (const [id, value] of Object.entries(mkt)) {
    if (!id.startsWith("MKT-") || typeof value !== "number") continue;
    leads += 220 * Math.pow(value, 0.7);
  }
  return Math.round(leads);
}

/** Hard capacity gate: 500 leads handled per ₹1 L of rep spend. */
export function salesCapacity(draft: QuarterDraft): number {
  const spend = numeric(draft.decisions.sales?.["SAL-000"]);
  return Math.round(500 * spend);
}

export function conversionBonus(draft: QuarterDraft): number {
  const spend = numeric(draft.decisions.sales?.["SAL-000"]);
  return 2 * Math.sqrt(spend);
}

/* ── pre-flight (FIN-015) ───────────────────────────────────────── */

const GROWTH_BUDGET = 60; // ₹60 L discretionary this quarter

export function preflight(draft: QuarterDraft): PreflightFlag[] {
  const spend = totalDiscretionarySpend(draft);
  const reserve = numeric(draft.decisions.finance?.["FIN-002"]);
  const projectedNCF = -openingState.quarterly_burn - spend + 46; // 46 L expected revenue
  const runwayAfter =
    (openingState.cash_available + projectedNCF) / openingState.monthly_burn;
  const allocation = draft.decisions.finance?.["FIN-001"];
  const allocated = numeric(allocation);

  const flags: PreflightFlag[] = [];

  flags.push(
    spend > GROWTH_BUDGET + reserve
      ? {
          id: "overspend",
          label: "Overspending",
          detail: `Total discretionary spend ${formatLakhs(spend)} exceeds the available growth budget ${formatLakhs(GROWTH_BUDGET)}.`,
          level: "red",
        }
      : spend > GROWTH_BUDGET * 0.9
        ? {
            id: "overspend",
            label: "Spend near ceiling",
            detail: `Committed ${formatLakhs(spend)} of ${formatLakhs(GROWTH_BUDGET)} — no slack for a mid-quarter shock.`,
            level: "yellow",
          }
        : {
            id: "overspend",
            label: "Spend within budget",
            detail: `Committed ${formatLakhs(spend)} of ${formatLakhs(GROWTH_BUDGET)} discretionary.`,
            level: "green",
          },
  );

  flags.push(
    projectedNCF < -60
      ? {
          id: "ncf",
          label: "Deeply negative projected cash flow",
          detail: `Projected net cash flow ${formatLakhs(projectedNCF)} this quarter.`,
          level: "red",
        }
      : projectedNCF < 0
        ? {
            id: "ncf",
            label: "Negative projected cash flow",
            detail: `Projected net cash flow ${formatLakhs(projectedNCF)} — normal at this stage, but watch the trend.`,
            level: "yellow",
          }
        : {
            id: "ncf",
            label: "Positive projected cash flow",
            detail: `Projected net cash flow ${formatLakhs(projectedNCF)}.`,
            level: "green",
          },
  );

  flags.push(
    runwayAfter < 4
      ? {
          id: "runway",
          label: "Low runway",
          detail: `Runway after this quarter projects to ${runwayAfter.toFixed(1)} months.`,
          level: "red",
        }
      : runwayAfter < 7
        ? {
            id: "runway",
            label: "Runway tightening",
            detail: `Runway after this quarter projects to ${runwayAfter.toFixed(1)} months.`,
            level: "yellow",
          }
        : {
            id: "runway",
            label: "Runway healthy",
            detail: `Runway after this quarter projects to ${runwayAfter.toFixed(1)} months.`,
            level: "green",
          },
  );

  const inventory = numeric(draft.decisions.finance?.["FIN-010"]);
  flags.push(
    inventory > 12
      ? {
          id: "inventory",
          label: "High inventory position",
          detail: `${formatLakhs(inventory)} committed to inventory — holding cost will bite.`,
          level: "yellow",
        }
      : {
          id: "inventory",
          label: "Inventory position sane",
          detail: inventory > 0 ? `${formatLakhs(inventory)} committed.` : "No inventory build this quarter.",
          level: "green",
        },
  );

  // Per-department overrun vs. FIN-001 allocation.
  if (allocation && typeof allocation === "object" && !Array.isArray(allocation)) {
    const split = allocation as Record<string, number>;
    const overruns: string[] = [];
    for (const [dept, budget] of Object.entries(split)) {
      const values = draft.decisions[dept as keyof typeof draft.decisions] ?? {};
      const deptSpend = Object.values(values).reduce(
        (a: number, v) => a + numeric(v),
        0,
      );
      if (deptSpend > budget) {
        overruns.push(
          `${catalogs[dept as keyof typeof catalogs]?.name ?? dept} ${formatLakhs(deptSpend)} vs. ${formatLakhs(budget)} allocated`,
        );
      }
    }
    flags.push(
      overruns.length
        ? {
            id: "dept",
            label: "Department budget overruns",
            detail: overruns.join(" · "),
            level: "yellow",
          }
        : {
            id: "dept",
            label: "Departments within allocation",
            detail: `${formatLakhs(allocated)} distributed via FIN-001.`,
            level: "green",
          },
    );
  } else {
    flags.push({
      id: "dept",
      label: "No department allocation set",
      detail: "FIN-001 has not been saved — every other workspace draws from it.",
      level: "red",
    });
  }

  return flags;
}

/* ── run_quarter() mock ─────────────────────────────────────────── */

function hashDraft(draft: QuarterDraft): string {
  const s = JSON.stringify(draft);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  }
  return `sha-${Math.abs(h).toString(16).padStart(8, "0")}`;
}

export function runQuarter(draft: QuarterDraft): QuarterResult {
  const spend = totalDiscretionarySpend(draft);
  const leads = projectedLeads(draft);
  const capacity = salesCapacity(draft);
  const rdSpend = numeric(draft.decisions.finance?.["FIN-014"]);

  const handledLeads = capacity > 0 ? Math.min(leads, capacity) : Math.round(leads * 0.4);
  const conversion = 0.16 + conversionBonus(draft) / 100;
  const unitsSold = Math.max(120, Math.round(handledLeads * conversion));

  const pricing = draft.decisions.finance?.["FIN-008"];
  const priceMultiplier =
    pricing === "up10" ? 1.08 : pricing === "up5" ? 1.045 : pricing === "down5" ? 0.96 : pricing === "down10" ? 0.92 : 1;

  const revenue = unitsSold * 0.0999 * priceMultiplier; // ~₹9,990/unit, in lakhs
  const cogs = revenue * 0.31;
  const grossProfit = revenue - cogs;
  const warrantyCost = revenue * 0.009;
  const inventoryHolding = Math.max(0.4, numeric(draft.decisions.finance?.["FIN-010"]) * 0.09);
  const fixedCosts = 23.5;
  const netCashFlow = grossProfit - warrantyCost - inventoryHolding - fixedCosts - spend;
  const cashBalance = openingState.cash_available + netCashFlow;

  const gates: QuarterResult["gates_triggered"] = [];
  if (capacity > 0 && leads > capacity) {
    gates.push({
      gate_name: "Sales Capacity",
      description: `Marketing generated ~${leads.toLocaleString("en-IN")} leads, but rep capacity capped handling at ${capacity.toLocaleString("en-IN")}.`,
      impact_note: `${(leads - capacity).toLocaleString("en-IN")} leads were never worked. Funding Marketing beyond what Sales can handle is the single most common mistake this engine was built to catch.`,
    });
  }
  if (rdSpend > 15) {
    gates.push({
      gate_name: "R&D Conversion Ceiling",
      description: `R&D spend of ${formatLakhs(rdSpend)} exceeded what the Innovation Score could convert this quarter.`,
      impact_note: "Demand capture stayed bound by ~3.2 points even at this spend level — the ceiling, not the budget, was the constraint.",
    });
  }
  if (unitsSold >= 660) {
    gates.push({
      gate_name: "Available to Sell",
      description: "Demand exceeded sellable stock late in the quarter.",
      impact_note: "Roughly 40 units of demand went unfilled in the final month.",
    });
  }

  const distressed = cashBalance < 60;
  const failed = cashBalance < 0;

  /* — cognitive scoring: Σ(trait points) + Σ(modifiers) — */

  const allocation = draft.decisions.finance?.["FIN-001"];
  const hasAllocation =
    allocation !== undefined && numeric(allocation) > 0;
  const hasReserve = numeric(draft.decisions.finance?.["FIN-002"]) >= 8;
  const balancedBet = capacity > 0 && leads > 0 && Math.abs(leads - capacity) / Math.max(leads, capacity) < 0.25;
  const longTermBet = rdSpend >= 5 && rdSpend <= 15;

  const traits: QuarterResult["scoring"]["traits"] = [
    {
      name: "Strategic Thinking",
      weight: 20,
      points_earned: (hasAllocation ? 8 : 3) + (balancedBet ? 7 : 3) + 3,
      sub_criteria: [
        { text: "Spend traces to a stated thesis", status: hasAllocation ? "met" : "partial" },
        { text: "Funnel stages funded in proportion", status: balancedBet ? "met" : "partial" },
        { text: "Reacted to this quarter's market events", status: "partial" },
      ],
    },
    {
      name: "Risk Management",
      weight: 15,
      points_earned: (hasReserve ? 6 : 2) + (distressed ? 1 : 5) + 2,
      sub_criteria: [
        { text: "Held a meaningful cash reserve", status: hasReserve ? "met" : "missed" },
        { text: "Avoided runway-threatening spend", status: distressed ? "missed" : "met" },
        { text: "Sized downside before upside", status: "partial" },
      ],
    },
    {
      name: "Capital Allocation",
      weight: 15,
      points_earned: (hasAllocation ? 6 : 2) + (spend <= GROWTH_BUDGET ? 5 : 1) + 2,
      sub_criteria: [
        { text: "Distributed budget deliberately (FIN-001)", status: hasAllocation ? "met" : "missed" },
        { text: "Stayed inside the discretionary envelope", status: spend <= GROWTH_BUDGET ? "met" : "missed" },
        { text: "Concentrated where returns compound", status: "partial" },
      ],
    },
    {
      name: "Adaptability",
      weight: 10,
      points_earned: 6,
      sub_criteria: [
        { text: "Adjusted plan after event cards", status: "partial" },
        { text: "Did not anchor on the opening budget", status: "met" },
        { text: "Kept optionality for next quarter", status: "partial" },
      ],
    },
    {
      name: "Long-Term Thinking",
      weight: 10,
      points_earned: longTermBet ? 8 : 4,
      sub_criteria: [
        { text: "Made an investment with no in-quarter payoff", status: rdSpend > 0 ? "met" : "missed" },
        { text: "Did not sacrifice the long game for this quarter", status: longTermBet ? "met" : "partial" },
        { text: "Sized it proportionately to cash position", status: rdSpend <= 15 ? "met" : "partial" },
      ],
    },
    {
      name: "Leadership",
      weight: 10,
      points_earned: 6,
      narrative:
        "Committed to a clear direction and communicated the trade-off rather than hedging every call. The forecast chosen was defensible against the funnel you actually funded.",
      sub_criteria: [],
    },
    {
      name: "Systems Thinking",
      weight: 20,
      points_earned: (balancedBet ? 8 : 3) + (gates.length === 0 ? 7 : 3) + 3,
      sub_criteria: [
        { text: "Matched marketing output to sales capacity", status: balancedBet ? "met" : "missed" },
        { text: "Avoided triggering a hard gate", status: gates.length === 0 ? "met" : "missed" },
        { text: "Anticipated cross-department ripple", status: "partial" },
      ],
    },
  ];

  const modifiers: QuarterResult["scoring"]["modifiers"] = [];
  if (netCashFlow > 0) {
    modifiers.push({ points: 3, reason: "First quarter to achieve genuine profitability" });
  }
  if (gates.some((g) => g.gate_name === "R&D Conversion Ceiling")) {
    modifiers.push({ points: -2, reason: "R&D's Conversion Ceiling still bound demand capture by ~3.2 points" });
  }
  if (gates.some((g) => g.gate_name === "Sales Capacity")) {
    modifiers.push({ points: -2, reason: "Paid for leads the sales team could never work" });
  }
  if (hasReserve && !distressed) {
    modifiers.push({ points: 2, reason: "Entered next quarter with reserve intact" });
  }

  const traitPoints = traits.reduce((a, t) => a + t.points_earned, 0);
  const modifierPoints = modifiers.reduce((a, m) => a + m.points, 0);
  const finalScore = Math.max(0, Math.min(100, traitPoints + modifierPoints));

  const band =
    finalScore >= 90 ? "Exceptional" :
    finalScore >= 75 ? "Strong" :
    finalScore >= 60 ? "Competent" :
    finalScore >= 40 ? "Weak" : "Poor";

  return {
    run_id: `run_${draft.quarter_number}_${Date.now().toString(36)}`,
    result_hash: hashDraft(draft),
    run_status: failed ? "FAILED" : distressed ? "DISTRESSED" : "COMPLETED",
    business_impact: {
      units_sold: unitsSold,
      revenue,
      cogs,
      gross_profit: grossProfit,
      warranty_cost: -warrantyCost,
      inventory_holding_cost: -inventoryHolding,
      fixed_costs: -fixedCosts,
      discretionary_spend: -spend,
      net_cash_flow: netCashFlow,
      cash_balance: cashBalance,
      valuation: openingState.valuation * (netCashFlow > 0 ? 1.12 : 0.97),
      balance_sheet: {
        assets: [
          { label: "Cash", amount: cashBalance },
          { label: "Inventory", amount: Math.max(2, numeric(draft.decisions.finance?.["FIN-010"])) },
          { label: "Equipment / IP / AR", amount: 34 + rdSpend * 0.6 },
        ],
        liabilities: [
          { label: "Accounts payable", amount: 11.2 },
          { label: "Credit line drawn", amount: draft.decisions.finance?.["FIN-005"] === "wc-50" ? 50 : draft.decisions.finance?.["FIN-005"] === "wc-25" ? 25 : 0 },
        ],
        net_worth: 0, // computed below
      },
    },
    gates_triggered: gates,
    scoring: { final_score: finalScore, band, traits, modifiers },
  };
}

/** Fill in balance-sheet net worth (assets − liabilities). */
export function withNetWorth(result: QuarterResult): QuarterResult {
  const bs = result.business_impact.balance_sheet;
  const assets = bs.assets.reduce((a, x) => a + x.amount, 0);
  const liabilities = bs.liabilities.reduce((a, x) => a + x.amount, 0);
  return {
    ...result,
    business_impact: {
      ...result.business_impact,
      balance_sheet: { ...bs, net_worth: assets - liabilities },
    },
  };
}

/* ── endgame (Q3+) ──────────────────────────────────────────────── */

export function momentumScore(result: QuarterResult | null): number {
  // Confirmed canonical 2-input, units-based version.
  const units = result?.business_impact.units_sold ?? 480;
  const priorUnits = 430;
  return Math.max(-0.5, Math.min(1.5, (units - priorUnits) / priorUnits));
}

export function tierFor(result: QuarterResult | null): Tier {
  if (!result) return "Stable";
  if (result.run_status !== "COMPLETED") return "Distressed";
  if (result.business_impact.net_cash_flow > 0) return "Thriving";
  return "Stable";
}
