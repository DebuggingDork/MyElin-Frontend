/**
 * Everything the screens read that is a *reading* of the quarter rather than the quarter
 * itself: the binding constraint, the readiness gauges, the health bars, the directors'
 * inbox, the ticker, what changed, what the quarter taught you.
 *
 * Ported from the shipped `NadiWear.html` bundle. None of it decides an outcome -- it only
 * describes one, which is why it can safely run against a projection as well as a result.
 */

import {
  ARCHETYPES,
  BUFFER,
  DIRECTORS,
  INNOVATION_BY_ID,
  INNOVATIONS,
  MARKET_CUSTOMERS,
  PRODUCTS,
  headcount,
  marketDemand,
} from "@/lib/nadi/constants";
import { clamp, cr, inr, n0, n1, num, pct } from "@/lib/nadi/format";
import type {
  CompanyState,
  Constraint,
  HealthBar,
  InboxMessage,
  QuarterResultShape,
  Readiness,
  Tone,
} from "@/lib/nadi/types";

const availTotal = (r: QuarterResultShape) => PRODUCTS.reduce((s, p) => s + (r.avail[p.id] as number), 0);

/* ── company health bars ──────────────────────────────────────────── */

const healthTone = (v: number): Tone => (v >= 70 ? "good" : v >= 45 ? "watch" : "bad");

/**
 * Seven readings scaled to a common 0-100 so they can be compared at a glance. Orientation,
 * not a score: a young company is supposed to have low bars somewhere.
 */
export function companyHealth(s: CompanyState, last?: QuarterResultShape): HealthBar[] {
  const cash = clamp((s.cash / (BUFFER * 6)) * 100, 0, 100);
  const demand = last ? clamp(((last.attractShare as number) / 0.22) * 100, 0, 100) : 35;
  const product = clamp(((s.quality + 0.6 * s.innovation) / 90) * 100, 0, 100);
  const operations = clamp(
    last ? (last.utilisation as number) * 60 + (((last.supplierRel as number) - 50) * 0.8) : (s.supplierRel - 40) * 1.6,
    0,
    100,
  );
  const people = clamp((s.empSat - 35) * 1.6, 0, 100);
  const customers = clamp((s.satisfaction - 35) * 1.4, 0, 100);
  const riskParts = [
    s.cash > BUFFER * 2.5 ? 25 : s.cash > BUFFER ? 12 : 0,
    s.debt === 0 ? 20 : 10,
    s.supplierRel >= 85 ? 25 : s.supplierRel >= 75 ? 14 : 5,
    s.compliance + s.audit >= 150 ? 30 : s.compliance + s.audit >= 120 ? 18 : 6,
  ];
  const risk = clamp(
    riskParts.reduce((a, b) => a + b, 0),
    0,
    100,
  );

  return [
    { key: "cash", label: "Cash", value: cash, note: inr(s.cash) + " on hand" },
    {
      key: "demand",
      label: "Demand",
      value: demand,
      note: last ? pct((last.attractShare as number) * 100) + " of the category is reachable" : "no trading history yet",
    },
    { key: "product", label: "Product", value: product, note: "quality " + n0(s.quality) + ", innovation " + n0(s.innovation) },
    { key: "operations", label: "Operations", value: operations, note: "supplier reliability " + n0(s.supplierRel) },
    { key: "people", label: "People", value: people, note: n0(headcount(s.staff)) + " people, morale " + n0(s.empSat) },
    {
      key: "customers",
      label: "Customers",
      value: customers,
      note: "satisfaction " + n0(s.satisfaction) + ", repeat " + pct(s.repeatRate),
    },
    {
      key: "risk",
      label: "Risk cover",
      value: risk,
      note: s.debt > 0 ? inr(s.debt) + " of debt outstanding" : "no debt, buffer is your only cushion",
    },
  ].map((b) => ({ ...b, tone: healthTone(b.value) }));
}

/* ── operating readiness ──────────────────────────────────────────── */

/**
 * Where the plan is tight and where it has room. Direction only -- deliberately never a
 * revenue or profit forecast, because that is the situation the job is conducted in.
 */
export function readiness(r: QuarterResultShape | null, s: CompanyState): Readiness[] {
  if (!r) return [];

  const leadRatio = (r.capacity as number) > 0 ? (r.effLeads as number) / (r.capacity as number) : 9;
  const supplyRatio = (r.demandTotal as number) > 0 ? availTotal(r) / (r.demandTotal as number) : 9;
  const headroom = (r.ceiling as number) - (r.rawConv as number);
  const cash = r.cash as number;
  const netCF = r.netCF as number;
  const effLeads = r.effLeads as number;
  const capacity = r.capacity as number;

  return [
    {
      id: "demand",
      label: "Demand generation",
      level:
        effLeads < 200
          ? "NONE"
          : effLeads > capacity * 1.4
            ? "STRONG"
            : effLeads > capacity * 0.75
              ? "ADEQUATE"
              : "TIGHT",
      note: "How much interest the plan creates relative to what you can work.",
    },
    {
      id: "sales",
      label: "Sales capacity",
      level: leadRatio > 1.35 ? "CRITICAL" : leadRatio > 1.05 ? "CONSTRAINED" : leadRatio > 0.7 ? "ADEQUATE" : "IDLE",
      note:
        leadRatio > 1.05
          ? "Interest is running ahead of the team. Either add capacity or buy less demand."
          : leadRatio < 0.7
            ? "You are paying for selling capacity you are not feeding. Either create more demand or carry less team."
            : "Team and interest are roughly matched.",
    },
    {
      id: "production",
      label: "Production capacity",
      level:
        supplyRatio < 0.85
          ? "CRITICAL"
          : supplyRatio < 1
            ? "CONSTRAINED"
            : supplyRatio < 1.35
              ? "ADEQUATE"
              : supplyRatio < 1.9
                ? "EXCESS"
                : "OVERBUILT",
      note:
        supplyRatio < 1
          ? "You will not be able to fill everything you sell."
          : supplyRatio >= 1.9
            ? "You are turning cash into stock that will not sell this quarter. Fund the run less, or sell down what you hold."
            : supplyRatio >= 1.35
              ? "You will build more than will sell. The surplus becomes stock you pay to hold."
              : "Supply roughly matches demand.",
    },
    {
      id: "burn",
      label: "Cash burn",
      level:
        netCF >= 0 ? "STRONG" : cash / -netCF < 1.2 ? "CRITICAL" : cash / -netCF < 2.2 ? "CONSTRAINED" : "ADEQUATE",
      note:
        netCF >= 0
          ? "This plan funds itself."
          : cash / -netCF < 2.2
            ? "Under " +
              n1(Math.max(0, cash / -netCF)) +
              " quarters of cash at this rate. Take out what is not converting before you take out what is."
            : "Burning, as a company at this stage should be. The balance sheet can carry it.",
    },
    {
      id: "stock",
      label: "Working capital",
      level:
        (r.invUnitsOut as number) > Math.max(400, (r.unitsSold as number) * 1.5)
          ? "OVERBUILT"
          : (r.invUnitsOut as number) > Math.max(200, (r.unitsSold as number) * 0.6)
            ? "EXCESS"
            : "ADEQUATE",
      note:
        (r.invUnitsOut as number) > Math.max(200, (r.unitsSold as number) * 0.6)
          ? n0(r.invUnitsOut as number) +
            " units of stock is cash already spent. Building less is the only thing that clears it."
          : "Stock is turning over.",
    },
    {
      id: "ceiling",
      label: "Product ceiling",
      level: headroom < 0 ? "CRITICAL" : headroom < 2 ? "CONSTRAINED" : headroom < 6 ? "ADEQUATE" : "STRONG",
      note:
        headroom < 0
          ? "The product cannot close what the funnel is bringing."
          : "Headroom between selling effort and what the product supports.",
    },
    {
      id: "position",
      label: "Market position",
      level: r.positionBinding
        ? "CONSTRAINED"
        : (r.attractShare as number) > (num(s.marketShare) || 0.02) * 1.3
          ? "STRONG"
          : "ADEQUATE",
      note: r.positionBinding
        ? "You are generating more interest than your position can convert into buyers."
        : "Your standing against the category.",
    },
    {
      id: "cash",
      label: "Cash pressure",
      level:
        cash < 0 || cash < BUFFER
          ? "CRITICAL"
          : cash < BUFFER * 2
            ? "CONSTRAINED"
            : cash < BUFFER * 4
              ? "ADEQUATE"
              : "STRONG",
      note: "Where this plan leaves the balance at the end of the quarter.",
    },
    {
      id: "people",
      label: "Staffing",
      level:
        (r.shortRoles as unknown[]).length === 0
          ? "ADEQUATE"
          : (r.shortRoles as unknown[]).length > 2
            ? "CRITICAL"
            : "CONSTRAINED",
      note: (r.shortRoles as { name: string }[]).length
        ? (r.shortRoles as { name: string }[]).map((d) => d.name).join(", ") +
          " cannot deliver what you have funded."
        : "Every function can deliver the plan.",
    },
  ];
}

/* ── what is not converting ───────────────────────────────────────── */

/** The lines a CFO would take out first, ranked by rupees doing nothing. */
export function wasteLines(r: QuarterResultShape | null) {
  if (!r) return [];
  const out: { line: string; why: string; value: number }[] = [];

  if ((r.leadsWasted as number) > Math.max(60, (r.effLeads as number) * 0.08)) {
    out.push({
      line: "demand generation",
      why: n0(r.leadsWasted as number) + " leads nobody works",
      value: (r.marketingSpend as number) * (r.leadWasteFrac as number),
    });
  }
  if ((r.invUnitsOut as number) > Math.max(150, (r.unitsSold as number) * 0.4)) {
    out.push({
      line: "the production run",
      why: n0(r.invUnitsOut as number) + " units already unsold",
      value: (r.invValue as number) * 0.5,
    });
  }
  if ((r.idleCapacity as number) > (r.capacity as number) * 0.35 && (r.capacity as number) > 800) {
    out.push({
      line: "selling capacity",
      why: n0(r.idleCapacity as number) + " leads of team nobody feeds",
      value: (r.A.reps as number) * 1e5 * ((r.idleCapacity as number) / Math.max(1, r.capacity as number)),
    });
  }
  if ((r.installedCapacity as number) > 0 && (r.utilisation as number) < 0.55 && (r.capexSpend as number) > 0) {
    out.push({
      line: "plant capex",
      why: "only " + pct((r.utilisation as number) * 100) + " of the plant runs",
      value: r.capexSpend as number,
    });
  }
  if ((r.rawConv as number) - (r.ceiling as number) > 3) {
    out.push({
      line: "sales enablement",
      why: "conversion is capped by the product, not by effort",
      value: ((r.A.crm as number) + (r.A.salesTraining as number)) * 1e5,
    });
  }
  return out.sort((a, b) => b.value - a.value);
}

/* ── the binding constraint ───────────────────────────────────────── */

/**
 * Which single stage is deciding the quarter. Runs against a projection before the close and
 * against the result after it, which is why the same function serves both screens.
 */
export function bindingConstraint(r: QuarterResultShape | null, s: CompanyState): Constraint {
  if (!r) {
    const stock = PRODUCTS.reduce((sum, p) => sum + num(s.products[p.id].inv), 0);
    return {
      primary: {
        id: "position",
        label: "An unproven market position",
        why:
          "You hold roughly " +
          pct((4000 / MARKET_CUSTOMERS) * 100) +
          " of a market that buys about " +
          n0(marketDemand(1)) +
          " units this quarter. Quality and innovation are both at zero, so the product carries a conversion ceiling of 22% and nothing above it.",
        impact:
          "There are " +
          n0(stock) +
          " units in stock and " +
          inr(s.cash) +
          " in the bank. Nothing about this business is proven yet, including whether anybody will buy it at " +
          inr(s.products.pulse.price) +
          ".",
        next: "Find out what actually sells before committing to scale. Premature scaling is the most expensive mistake available to you this quarter.",
      },
      all: [
        { id: "position", label: "An unproven market position" },
        { id: "cash", label: "Cash" },
        { id: "ceiling", label: "Product conversion ceiling" },
        { id: "demand", label: "Market demand" },
      ],
    };
  }

  const found: Required<Constraint["primary"]>[] = [];
  const available = availTotal(r);

  if ((r.cash as number) < BUFFER) {
    found.push({
      id: "cash",
      rank: 100,
      label: "Cash",
      why: "Closing cash of " + inr(r.cash as number) + " sits below the " + inr(BUFFER) + " working-capital buffer.",
      impact: "Everything else becomes academic if the company cannot pay for it.",
      next: "Cut committed spend, draw on the facility, or convert inventory and receivables into cash.",
    });
  }

  if ((r.leadsWasted as number) > Math.max(60, (r.effLeads as number) * 0.08)) {
    found.push({
      id: "sales",
      rank: 80 + ((r.leadsWasted as number) / Math.max(1, r.effLeads as number)) * 40,
      label: "Sales capacity",
      why:
        "You generated " +
        n0(r.effLeads as number) +
        " effective leads but the team could only work " +
        n0(r.leadsUsed as number) +
        ".",
      impact:
        "About " +
        n0(r.leadsWasted as number) +
        " leads went unworked — roughly " +
        inr((r.marketingSpend as number) * ((r.leadsWasted as number) / Math.max(1, r.effLeads as number))) +
        " of demand generation with nothing behind it.",
      next: "Either add selling capacity, or stop paying for demand you cannot serve.",
    });
  }

  if ((r.unmetDemand as number) > Math.max(40, (r.demandTotal as number) * 0.08)) {
    found.push({
      id: "production",
      rank: 80 + ((r.unmetDemand as number) / Math.max(1, r.demandTotal as number)) * 40,
      label: "Production capacity",
      why:
        "Demand reached " + n0(r.demandTotal as number) + " units against " + n0(available) + " available to sell.",
      impact:
        n0(r.unmetDemand as number) +
        " units of demand could not be filled. Those are orders you won and could not honour.",
      next: "Fund the production run, add contract manufacturing, or buy installed capacity — or slow demand down.",
    });
  }

  if (r.ceilingBinding) {
    found.push({
      id: "ceiling",
      rank: 70 + ((r.rawConv as number) - (r.ceiling as number)) * 4,
      label: "Product conversion ceiling",
      why:
        "Selling effort supports " +
        pct(r.rawConv as number) +
        " conversion but the product only carries " +
        pct(r.ceiling as number) +
        ".",
      impact: "Everything spent pushing conversion above " + pct(r.ceiling as number) + " bought nothing.",
      next: "Quality, innovation or the innovation board — or stop paying for conversion the product cannot deliver.",
    });
  }

  if (r.positionBinding) {
    found.push({
      id: "position",
      rank: 68,
      label: "Market position",
      why:
        "Your funnel produced " +
        n0(r.funnelDemand as number) +
        " units of interest, but your standing in the category only reaches " +
        n0(r.reachableDemand as number) +
        ".",
      impact: n0(r.demandBeyondPosition as number) + " units of interest went to competitors instead.",
      next: "Position is brand, product, price and availability. Advertising alone will not move it.",
    });
  }

  const shortRoles = r.shortRoles as { id: string; name: string; ifShort: string }[];
  const staffing = r.staffing as Record<string, number>;
  if (shortRoles.length) {
    const worst = shortRoles.reduce((a, b) => (staffing[b.id] < staffing[a.id] ? b : a), shortRoles[0]);
    found.push({
      id: "staffing",
      rank: 60 + (1 - staffing[worst.id]) * 60,
      label: "Staffing — " + worst.name,
      why: worst.name + " is running at " + pct(staffing[worst.id] * 100) + " of what the plan needs.",
      impact: worst.ifShort,
      next: "Hire into that function, or fund it less until you can.",
    });
  }

  if ((r.invUnitsOut as number) > Math.max(150, (r.unitsSold as number) * 0.4)) {
    const turns = (r.unitsSold as number) > 0 ? (r.invUnitsOut as number) / (r.unitsSold as number) : 9;
    found.push({
      id: "wc",
      rank: turns >= 1 ? 88 + turns * 6 : 55,
      label: "Cash trapped in stock",
      why:
        n0(r.invUnitsOut as number) +
        " units are sitting unsold, worth " +
        inr(r.invValue as number) +
        " — about " +
        n1(turns) +
        " quarters of sales at the current rate.",
      impact:
        "That is cash you have already spent and cannot use, costing " +
        inr(r.holdingCost as number) +
        " a quarter simply to hold.",
      next: "This is the rare constraint you fix by spending less. Cut the production run until the warehouse clears.",
    });
  }

  if ((r.netCF as number) < 0 && (r.cash as number) > 0 && (r.cash as number) / -(r.netCF as number) < 2.2) {
    const waste = wasteLines(r);
    found.push({
      id: "burn",
      rank: 92,
      label: "Burn rate",
      why:
        "This quarter consumed " +
        inr(-(r.netCF as number)) +
        ", leaving under " +
        n1((r.cash as number) / -(r.netCF as number)) +
        " quarters of cash.",
      impact: "The credit facility shrinks as net worth falls, so options narrow faster than the balance does.",
      next: waste.length
        ? "Start with what is not converting: " +
          waste[0].line +
          " (" +
          waste[0].why +
          "). Cutting what is working buys you a quarter and costs you the year."
        : "Everything you are funding is converting, so there is no painless cut. This is a growth-versus-survival decision, not a housekeeping one.",
    });
  }

  if ((r.supplierRel as number) < 76) {
    found.push({
      id: "supplier",
      rank: 50 + (76 - (r.supplierRel as number)),
      label: "Supplier reliability",
      why:
        "Reliability of " +
        n0(r.supplierRel as number) +
        " means " +
        pct(100 - (r.supplierRel as number)) +
        " of everything you build is lost before it reaches a customer.",
      impact: "You are paying to manufacture units that never arrive.",
      next: "Supplier and QC spend, or a second source.",
    });
  }

  if ((r.satisfaction as number) < 52 || (r.repeatRate as number) < 12) {
    found.push({
      id: "retention",
      rank: 48,
      label: "Customer retention",
      why:
        "Satisfaction is " +
        n0(r.satisfaction as number) +
        " and repeat purchase is " +
        pct(r.repeatRate as number) +
        ".",
      impact: "Every quarter you have to buy your entire customer base again.",
      next: "Support, onboarding and product quality all move this.",
    });
  }

  if (!found.length) {
    found.push({
      id: "demand",
      rank: 40,
      label: "Market demand",
      why: "Nothing inside the company is binding. The limit is how many people want the product at this price.",
      impact: "Growth now comes from position — brand, product and price — rather than from fixing a bottleneck.",
      next: "Build position, or accept the current run rate and protect margin.",
    });
  }

  found.sort((a, b) => b.rank - a.rank);
  return { primary: found[0], all: found.slice(0, 4) };
}

/* ── what changed since you last looked ───────────────────────────── */

export type ChangeLine = { dir: "up" | "down" | "flat"; label: string; detail: string };

export function changesSince(
  prior: QuarterResultShape | undefined,
  last: QuarterResultShape | undefined,
): ChangeLine[] {
  if (!last) {
    return [
      {
        dir: "flat",
        label: "The company opens for trading",
        detail: "Four thousand customers, six hundred units in stock and twelve months of runway.",
      },
    ];
  }

  const out: ChangeLine[] = [];
  const push = (when: boolean, dir: ChangeLine["dir"], label: string, detail: string) => {
    if (when) out.push({ dir, label, detail });
  };
  const shareMove = (last.shareDelta as number) * 100;

  push(
    Math.abs(shareMove) > 0.15,
    shareMove > 0 ? "up" : "down",
    "Market share " + (shareMove > 0 ? "rose" : "fell") + " " + n1(Math.abs(shareMove)) + " points",
    "You now hold " +
      pct((last.marketShare as number) * 100) +
      " of a category buying " +
      n0(last.mktDemand as number) +
      " units a quarter.",
  );

  if (prior) {
    push(
      (last.satisfaction as number) < (prior.satisfaction as number) - 1,
      "down",
      "Customer satisfaction fell",
      "Down to " +
        n0(last.satisfaction as number) +
        " from " +
        n0(prior.satisfaction as number) +
        ". Repeat purchase follows this with a lag.",
    );
    push(
      (last.satisfaction as number) > (prior.satisfaction as number) + 2,
      "up",
      "Customer satisfaction improved",
      "Up to " + n0(last.satisfaction as number) + ", which feeds conversion and repeat buying.",
    );
    push(
      (last.supplierRel as number) < (prior.supplierRel as number) - 1,
      "down",
      "Supplier reliability declined",
      "Now " + n0(last.supplierRel as number) + ". More of what you build is lost before it ships.",
    );
    push(
      (last.cash as number) < (prior.cash as number) * 0.7,
      "down",
      "Cash runway shortened sharply",
      "The balance fell from " + inr(prior.cash as number) + " to " + inr(last.cash as number) + ".",
    );
    push(
      (last.attritionNext as number) > (prior.attritionNext as number) + 1,
      "down",
      "Employee attrition increased",
      "Now " + pct(last.attritionNext as number) + " entering this quarter, which drags selling and production.",
    );
    push(
      (last.unitsSold as number) > (prior.unitsSold as number) * 1.25,
      "up",
      "Sales grew " + pct(((last.unitsSold as number) / Math.max(1, prior.unitsSold as number) - 1) * 100),
      n0(last.unitsSold as number) + " units against " + n0(prior.unitsSold as number) + " the quarter before.",
    );
    push(
      (last.unitsSold as number) < (prior.unitsSold as number) * 0.9,
      "down",
      "Sales fell",
      n0(last.unitsSold as number) + " units against " + n0(prior.unitsSold as number) + " the quarter before.",
    );
  }

  push(
    Boolean(last.ceilingBinding),
    "down",
    "The product conversion ceiling was reached",
    "Selling effort is being capped at " + pct(last.ceiling as number) + " by what the product can carry.",
  );
  push(
    (last.unmetDemand as number) > 40,
    "down",
    "Demand exceeded production capacity",
    n0(last.unmetDemand as number) + " units of demand went unfilled.",
  );
  push(
    (last.leadsWasted as number) > Math.max(60, (last.effLeads as number) * 0.08),
    "down",
    "The sales pipeline outgrew the team",
    n0(last.leadsWasted as number) + " leads were generated and never worked.",
  );

  (last.landed as string[]).forEach((id) =>
    push(true, "up", "Shipped: " + INNOVATION_BY_ID[id].name, INNOVATION_BY_ID[id].blurb),
  );
  push(
    Boolean(last.proLaunching),
    "up",
    "The Nadi Pulse Pro cleared development",
    "It can be priced, produced and sold from this quarter.",
  );
  if (last.crisis) {
    push(
      true,
      "down",
      ARCHETYPES[(last.crisis as { variant: keyof typeof ARCHETYPES }).variant].name + " is still in play",
      "The market event that started last quarter has not finished with you.",
    );
  }
  push(
    (last.netProfit as number) > 0,
    "up",
    "The company turned a profit",
    inr(last.netProfit as number) + " of net profit — the first time the machine paid for itself.",
  );

  return out.slice(0, 7);
}

/* ── everyone around the table ────────────────────────────────────── */

export function boardAsks(s: CompanyState, last: QuarterResultShape | undefined, history: QuarterResultShape[]) {
  const growth =
    history.length >= 2 && last
      ? (last.unitsSold as number) / Math.max(1, history[history.length - 2].unitsSold as number) - 1
      : null;
  const runway = last && (last.netCF as number) < 0 ? s.cash / -(last.netCF as number) : 99;

  return [
    {
      who: "The board",
      ask: "Growth has to accelerate.",
      met: growth === null ? null : growth >= 0.25,
      detail:
        growth === null
          ? "No trading history to judge yet."
          : "Units moved " + pct(growth * 100) + " last quarter against an expectation of 25%.",
    },
    {
      who: "Your CFO",
      ask: "Keep runway above two quarters.",
      met: runway >= 2,
      detail: runway >= 99 ? "Operations are funding themselves." : n1(runway) + " quarters of cash at the current burn.",
    },
    {
      who: "Customers",
      ask: "The product needs to get better.",
      met: s.satisfaction >= 60 && s.quality >= 20,
      detail: "Satisfaction " + n0(s.satisfaction) + ", quality " + n0(s.quality) + ".",
    },
    {
      who: "Your team",
      ask: "The workload has to be sustainable.",
      met: s.empSat >= 65 && s.attrition <= 8,
      detail: "Morale " + n0(s.empSat) + ", attrition " + pct(s.attrition) + ".",
    },
  ];
}

/* ── the inbox ────────────────────────────────────────────────────── */

/** What each function writes to you about the plan as it currently stands. */
export function inbox(
  r: QuarterResultShape | null,
  s: CompanyState,
  history: QuarterResultShape[],
): InboxMessage[] {
  if (!r) return [];
  const out: InboxMessage[] = [];
  const say = (
    from: string,
    tone: InboxMessage["tone"],
    subject: string,
    body: string,
    action: boolean,
  ) => out.push({ from, ...DIRECTORS[from], tone, subject, body, action });

  const available = availTotal(r);
  const cash = r.cash as number;
  const netCF = r.netCF as number;

  if (cash < 0) {
    say(
      "cfo",
      "critical",
      "We are out of cash",
      "The quarter closes " +
        inr(Math.abs(cash)) +
        " overdrawn. I need committed spend cut or the facility drawn before we trade another day.",
      true,
    );
  } else if (cash < BUFFER) {
    say(
      "cfo",
      "critical",
      "We will breach the working-capital buffer",
      "This plan leaves us below the " +
        inr(BUFFER) +
        " floor we agreed with the board. I would rather we slowed growth than went through that.",
      true,
    );
  } else if (netCF < 0 && cash / -netCF < 2) {
    say(
      "cfo",
      "warning",
      "Runway is under two quarters",
      "At this burn we have " +
        n1(cash / -netCF) +
        " quarters left. The board's covenant is two. We should either raise, or spend less.",
      true,
    );
  }

  if (netCF < 0 && cash > 0 && cash / -netCF < 2.2) {
    const waste = wasteLines(r);
    say(
      "cfo",
      "critical",
      "We have under " + n1(cash / -netCF) + " quarters of cash at this rate",
      "The quarter consumes " +
        inr(-netCF) +
        ". I am not asking you to stop growing. " +
        (waste.length
          ? "I am asking you to take out " +
            waste[0].line +
            " first — " +
            waste[0].why +
            " — rather than the things that are actually converting."
          : "Everything we fund is converting, so there is no tidy saving. This is a decision about how much risk you want to carry."),
      true,
    );
  }

  if ((r.idleCapacity as number) > (r.capacity as number) * 0.35 && (r.capacity as number) > 800) {
    say(
      "sales",
      "warning",
      "You are paying for a team I cannot keep busy",
      "We are staffed to work " +
        n0(r.capacity as number) +
        " leads and marketing is sending " +
        n0(r.effLeads as number) +
        ". Either feed us or carry less of us — both are legitimate, doing neither is not.",
      true,
    );
  }

  if ((r.drawRejected as number) > 1) {
    say(
      "cfo",
      "warning",
      "The bank refused part of the draw",
      "Our facility is capped at 60% of net worth. " +
        inr(r.drawRejected as number) +
        " of what you asked for is not available.",
      true,
    );
  }

  if ((r.debtClose as number) > 0 && (r.netProfit as number) < 0) {
    say(
      "cfo",
      "info",
      "We are borrowing to fund losses",
      inr(r.debtClose as number) +
        " outstanding at " +
        inr(r.interestExpense as number) +
        " of interest this quarter, against a loss. That is survivable once. Not repeatedly.",
      false,
    );
  }

  if ((r.penaltyRisk as number) > 20) {
    say(
      "cfo",
      "info",
      "Compliance exposure is costing us real money",
      "Penalty risk sits at " +
        pct(r.penaltyRisk as number) +
        ", which charged us " +
        inr(r.compliancePenalty as number) +
        " this quarter. Compliance and audit spend both reduce it.",
      false,
    );
  }

  if ((r.leadsWasted as number) > Math.max(60, (r.effLeads as number) * 0.08)) {
    say(
      "sales",
      "critical",
      "We cannot work the leads marketing is sending",
      "We will generate around " +
        n0(r.effLeads as number) +
        " qualified leads this quarter and my team can work about " +
        n0(r.leadsUsed as number) +
        ". Either I need more people, or we should spend less on acquisition. Right now we are paying for conversations nobody has.",
      true,
    );
  } else if ((r.idleCapacity as number) > (r.capacity as number) * 0.3 && (r.capacity as number) > 500) {
    say(
      "sales",
      "warning",
      "The team is under-used",
      "We are staffed and paid to work " +
        n0(r.capacity as number) +
        " leads and marketing is sending " +
        n0(r.effLeads as number) +
        ". I can carry more, or you can redeploy some of my cost.",
      false,
    );
  }

  if ((r.channelShare as number) > 0.35) {
    say(
      "sales",
      "info",
      "The channel is becoming most of our volume",
      pct((r.channelShare as number) * 100) +
        " of funnel sales now go through distributors, and we hand them 18% of that revenue. It is growth we do not own.",
      false,
    );
  }

  if (r.ceilingBinding) {
    say(
      "product",
      "critical",
      "The product is now the bottleneck",
      "Sales and marketing between them support " +
        pct(r.rawConv as number) +
        " conversion. The product only carries " +
        pct(r.ceiling as number) +
        ". Anything spent pushing harder is landing on a wall I have to move.",
      true,
    );
  }

  const pipelineIds = Object.keys(r.pipeline as Record<string, number>);
  if (pipelineIds.length) {
    const id = pipelineIds[0];
    say(
      "product",
      "info",
      INNOVATION_BY_ID[id].name + " is in development",
      "It lands in " +
        (r.pipeline as Record<string, number>)[id] +
        " quarter(s). The money is already committed. Starting something else now means splitting the same engineering team.",
      false,
    );
  }

  if ((r.staffing as Record<string, number>).engineering < 0.9) {
    say(
      "product",
      "warning",
      "Engineering cannot absorb what you are funding",
      "We are running at " +
        pct((r.staffing as Record<string, number>).engineering * 100) +
        ". Quality and innovation spend are both delivering less than you are paying for.",
      true,
    );
  }

  if (s.products.pro.live && num(s.products.pro.share) <= 0 && r.P.pro.status === "active") {
    say(
      "product",
      "critical",
      "The Pro is on sale and we are not building any",
      "It has 0% of the production line, so nothing gets made and nothing gets sold. Give it a share on the Product screen or take it out of the range properly.",
      true,
    );
  }

  if (!s.products.pro.live && (r.npd as number) > 0 && (r.npd as number) < 100 && s.quarter >= 2) {
    say(
      "product",
      "warning",
      "The Pro will not make it at this rate",
      "Development is at " +
        n0(r.npd as number) +
        " of 100. It has to clear 100 by the end of this quarter to be on sale next quarter. Partial progress is worth nothing.",
      true,
    );
  }

  if (!s.products.pro.live && (r.hypeNow as number) > 8 && (r.npd as number) < 60) {
    say(
      "market",
      "warning",
      "We are building anticipation for something that is not coming",
      n1(r.hypeNow as number) +
        " points of pre-launch interest against development at " +
        n0(r.npd as number) +
        " of 100. Either fund the build or stop funding the noise.",
      true,
    );
  }

  if (!s.products.pro.live && (r.npd as number) > 55) {
    say(
      "product",
      "info",
      "The Pro is close",
      "New product development is at " +
        n0(r.npd as number) +
        " of 100. Stopping now wastes everything spent so far — there is no partial credit.",
      false,
    );
  }

  if ((r.unmetDemand as number) > Math.max(40, (r.demandTotal as number) * 0.08)) {
    say(
      "ops",
      "critical",
      "Demand is running ahead of the line",
      "We can supply " +
        n0(available) +
        " units against demand of " +
        n0(r.demandTotal as number) +
        ". Contract manufacturing can close the gap this quarter, but it costs ₹700 a unit more than building it ourselves.",
      true,
    );
  }

  if (
    r.runLimited &&
    (r.utilisation as number) < 0.75 &&
    (r.invUnitsOut as number) < (r.unitsSold as number) * 0.3
  ) {
    say(
      "ops",
      "warning",
      "We are running the plant below what we own",
      "Installed capacity is " +
        n0(r.installedCapacity as number) +
        " units and we are running " +
        n0(r.grossRun as number) +
        ". The plant is paid for either way.",
      true,
    );
  }

  const turns = (r.unitsSold as number) > 0 ? (r.invUnitsOut as number) / (r.unitsSold as number) : 9;
  if ((r.invUnitsOut as number) > 150 && turns >= 1) {
    say(
      "ops",
      "critical",
      "We are building units nobody has ordered",
      "There are " +
        n0(r.invUnitsOut as number) +
        " units in the warehouse — roughly " +
        n1(turns) +
        " quarters of sales at the current rate, and " +
        inr(r.invValue as number) +
        " of cash we have already spent. I can keep the line running, but I would rather you told me to stop until it clears.",
      true,
    );
  }

  const openStock = PRODUCTS.reduce((sum, p) => sum + num(r.P[p.id].inv), 0);
  if (history.length === 0 && openStock > 300) {
    say(
      "ops",
      "critical",
      "We open the year with more stock than we can sell",
      n0(openStock) +
        " units came in and demand looks like " +
        n0(r.demandTotal as number) +
        ". Anything I build now sits next to them. I would rather run the line light until this clears.",
      true,
    );
  }

  if ((r.stockWritedown as number) > 5e4) {
    say(
      "cfo",
      "warning",
      "We are writing down slow-moving stock",
      inr(r.stockWritedown as number) +
        " written off on " +
        n0(r.excessUnits as number) +
        " units that are not turning over. Non-cash, but it comes off profit, net worth and the valuation.",
      true,
    );
  } else if ((r.invUnitsOut as number) > Math.max(250, (r.unitsSold as number) * 0.4)) {
    say(
      "ops",
      "warning",
      "Stock is building up",
      n0(r.invUnitsOut as number) +
        " units in the warehouse, " +
        inr(r.invValue as number) +
        " of cash we have already spent, " +
        inr(r.holdingCost as number) +
        " a quarter to hold.",
      true,
    );
  }

  if ((r.supplierRel as number) < 78) {
    say(
      "ops",
      "warning",
      "Supplier reliability is hurting us",
      "At " +
        n0(r.supplierRel as number) +
        " we lose " +
        pct(100 - (r.supplierRel as number)) +
        " of everything we build before it reaches a customer.",
      true,
    );
  }

  if ((r.satisfaction as number) < 55) {
    say(
      "cs",
      "warning",
      "Satisfaction is slipping",
      "We are at " +
        n0(r.satisfaction as number) +
        ". This shows up in repeat purchase two quarters from now, not this one, which is exactly why it gets ignored.",
      true,
    );
  }

  if ((r.repeatRate as number) < 14 && history.length >= 1) {
    say(
      "cs",
      "info",
      "We are buying the same customers twice",
      "Repeat purchase is " +
        pct(r.repeatRate as number) +
        ". Almost every unit has to be won again through paid acquisition.",
      false,
    );
  }

  if ((r.custLoss as number) > 3) {
    say(
      "cs",
      "critical",
      "We are losing customers to the competition",
      pct(r.custLoss as number) + " of the base is leaving this quarter while the market event runs.",
      true,
    );
  }

  if ((r.totalFired as number) > 0) {
    say(
      "people",
      "warning",
      n0(r.totalFired as number) + " people are leaving",
      inr(r.severanceCost as number) +
        " in severance, morale down to " +
        n0(r.empSat as number) +
        ", and attrition rises to " +
        pct(r.attritionNext as number) +
        " next quarter. The people who stay noticed.",
      false,
    );
  }

  if ((r.attritionNext as number) > 9) {
    say(
      "people",
      "warning",
      "Attrition is climbing",
      pct(r.attritionNext as number) +
        " next quarter. That comes straight off selling capacity and production before you spend a rupee.",
      true,
    );
  }

  (r.shortRoles as { id: string; name: string; ifShort: string }[])
    .filter((d) => d.id !== "engineering")
    .slice(0, 2)
    .forEach((d) =>
      say(
        "people",
        "info",
        d.name + " is short-staffed",
        "Running at " + pct((r.staffing as Record<string, number>)[d.id] * 100) + " of the plan. " + d.ifShort,
        true,
      ),
    );

  if (r.positionBinding) {
    say(
      "market",
      "warning",
      "We are generating interest we cannot convert into share",
      "The funnel is producing " +
        n0(r.funnelDemand as number) +
        " units of intent but our position in the category only reaches " +
        n0(r.reachableDemand as number) +
        ". The difference is going to competitors. Position moves on brand, product, price and availability — not on ad spend.",
      false,
    );
  }

  const premium = PRODUCTS.filter(
    (p) => r.P[p.id].live && r.P[p.id].status === "active" && r.priceInfo[p.id].premium > 18,
  );
  if (premium.length) {
    say(
      "market",
      "info",
      premium[0].name + " is priced above the market",
      "We are " +
        n0(r.priceInfo[premium[0].id].premium) +
        "% above the reference price. Demand is running at " +
        r.priceInfo[premium[0].id].mult.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        " times what it would be at parity. That is a choice, not an error — but it is a choice.",
      false,
    );
  }

  const belowCost = PRODUCTS.filter(
    (p) =>
      r.P[p.id].live &&
      r.P[p.id].status === "active" &&
      (r.sold[p.id] as number) > 0 &&
      (r.wac[p.id] as number) >= r.P[p.id].price,
  );
  if (belowCost.length) {
    say(
      "market",
      "critical",
      belowCost[0].name + " is selling below cost",
      "Unit cost " +
        inr(r.wac[belowCost[0].id] as number) +
        " against a price of " +
        inr(r.P[belowCost[0].id].price) +
        ". Every unit we sell destroys value.",
      true,
    );
  }

  const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  return out.sort((a, b) => order[a.tone] - order[b.tone]);
}

/* ── the ticker ───────────────────────────────────────────────────── */

export type TickerItem = { label: string; value: string; tone: Tone; dir: "up" | "down" | null };

export function tickerItems(
  s: CompanyState,
  projection: QuarterResultShape | null,
  history: QuarterResultShape[],
  constraint: Constraint | null,
): TickerItem[] {
  const last = history[history.length - 1];
  const prior = history[history.length - 2];
  const out: TickerItem[] = [];
  const add = (label: string, value: string, tone: Tone, dir: TickerItem["dir"]) =>
    out.push({ label, value, tone, dir });
  const move = (a: number, b: number | null | undefined): TickerItem["dir"] =>
    b == null ? null : a > b ? "up" : a < b ? "down" : null;

  add("CASH", inr(s.cash), s.cash < BUFFER ? "bad" : s.cash < BUFFER * 3 ? "watch" : "good",
    last && prior ? move(last.cash as number, prior.cash as number) : null);

  if (last) {
    add("UNITS SOLD", n0(last.unitsSold as number) + " last qtr", "flat",
      prior ? move(last.unitsSold as number, prior.unitsSold as number) : null);
    add("MKT SHARE", pct((last.marketShare as number) * 100), (last.shareDelta as number) >= 0 ? "good" : "bad",
      (last.shareDelta as number) >= 0 ? "up" : "down");
    add("REVENUE", cr(last.revenueT as number), "flat",
      prior ? move(last.revenueT as number, prior.revenueT as number) : null);
    add(
      "MARGIN",
      pct((last.revenueT as number) > 0 ? ((last.grossProfit as number) / (last.revenueT as number)) * 100 : 0),
      (last.grossProfit as number) / Math.max(1, last.revenueT as number) > 0.55 ? "good" : "watch",
      null,
    );
    add("VALUATION", cr(last.valuation as number),
      prior ? ((last.valuation as number) > (prior.valuation as number) ? "good" : "bad") : "flat",
      prior ? move(last.valuation as number, prior.valuation as number) : null);
  }

  const stock = PRODUCTS.reduce((sum, p) => sum + num(s.products[p.id].inv), 0);
  add("STOCK ON HAND", n0(stock) + " units",
    last && stock > (last.unitsSold as number) * 0.5 ? "bad" : stock > 0 ? "watch" : "good", null);

  if (last && (last.unmetDemand as number) > 20) {
    add("UNFILLED ORDERS", n0(last.unmetDemand as number) + " units last qtr", "bad", null);
  }

  add("CUSTOMERS", n0(s.customers), "flat",
    last && prior ? move(last.customers as number, prior.customers as number) : null);
  add("SATISFACTION", n0(s.satisfaction) + "/100",
    s.satisfaction >= 65 ? "good" : s.satisfaction >= 52 ? "watch" : "bad",
    last && prior ? move(last.satisfaction as number, prior.satisfaction as number) : null);
  add("REPEAT RATE", pct(s.repeatRate), s.repeatRate >= 18 ? "good" : s.repeatRate >= 12 ? "watch" : "bad", null);

  if (last) {
    const pulse = last.priceInfo && last.priceInfo.pulse;
    if (pulse && pulse.premium > 12) {
      add("BUYER OBJECTION", "priced " + n0(pulse.premium) + "% above the market", "bad", null);
    } else if (pulse && pulse.premium < -12) {
      add("PRICE POSITION", n0(-pulse.premium) + "% below the market", "watch", null);
    }
    if (last.ceilingBinding) {
      add("WHY THEY DO NOT BUY", "the product caps conversion at " + pct(last.ceiling as number), "bad", null);
    }
    if ((last.leadsWasted as number) > Math.max(60, (last.effLeads as number) * 0.08)) {
      add("LOST INTEREST", n0(last.leadsWasted as number) + " leads never worked", "bad", null);
    }
    if (last.positionBinding) {
      add("LOST TO RIVALS", n0(last.demandBeyondPosition as number) + " units of intent went elsewhere", "bad", null);
    }
    if ((last.defectRate as number) > 5) {
      add("RETURNS", "defect rate " + pct(last.defectRate as number), "watch", null);
    }
  }

  if (last && last.rivalState) {
    const strongest = (last.rivalState as { name: string; pos: string; strength: number }[]).reduce((a, b) =>
      b.strength > a.strength ? b : a,
    );
    add("STRONGEST RIVAL", strongest.name + " · " + strongest.pos.toLowerCase(), "watch", null);
    add("YOUR PULL", pct((last.attractShare as number) * 100) + " of the category reachable", "flat", null);
  }

  add("HEADCOUNT", n0(headcount(s.staff)), "flat", null);
  add("MORALE", n0(s.empSat) + "/100", s.empSat >= 70 ? "good" : s.empSat >= 58 ? "watch" : "bad", null);
  if (s.attrition > 8) add("ATTRITION", pct(s.attrition) + " entering this quarter", "bad", null);
  add("SUPPLIER RELIABILITY", n0(s.supplierRel) + "/100",
    s.supplierRel >= 85 ? "good" : s.supplierRel >= 75 ? "watch" : "bad", null);
  if (s.debt > 0) add("BORROWINGS", inr(s.debt), "watch", null);
  if (constraint) add("HOLDING YOU BACK", constraint.primary.label.toUpperCase(), "bad", null);

  if (projection) {
    readiness(projection, s)
      .filter((d) => d.level === "CRITICAL" || d.level === "OVERBUILT")
      .forEach((d) => add(d.label.toUpperCase(), d.level, "bad", null));
  }

  return out;
}

/* ── what the quarter taught you ──────────────────────────────────── */

export function lessons(r: QuarterResultShape, prior: QuarterResultShape | undefined) {
  const out: { title: string; body: string }[] = [];
  const add = (title: string, body: string) => out.push({ title, body });

  if ((r.leadsWasted as number) > Math.max(60, (r.effLeads as number) * 0.08)) {
    add(
      "Local optimisation does not improve a chain",
      "Demand generation worked exactly as designed and produced " +
        n0(r.effLeads as number) +
        " leads. The chain still only delivered what selling capacity allowed, so roughly " +
        inr((r.marketingSpend as number) * (r.leadWasteFrac as number)) +
        " of that spend produced nothing. Improving a stage that is not the constraint changes the output by zero.",
    );
  }
  if (r.ceilingBinding) {
    add(
      "The product sets the limit on how well you can sell",
      "Selling capability reached " +
        pct(r.rawConv as number) +
        " and the product carried " +
        pct(r.ceiling as number) +
        ". The difference was not converted at a lower rate — it was not converted at all. Sales investment and product investment are not substitutes for each other.",
    );
  }
  if ((r.unmetDemand as number) > Math.max(40, (r.demandTotal as number) * 0.08)) {
    add(
      "Demand you cannot supply is demand you did not have",
      n0(r.unmetDemand as number) +
        " units were wanted and could not be filled. Every one of those was paid for upstream in acquisition and selling cost, and none of it reached revenue.",
    );
  }
  if ((r.invUnitsOut as number) > Math.max(200, (r.unitsSold as number) * 0.35)) {
    add(
      "Inventory converts cash into something you cannot spend",
      n0(r.invUnitsOut as number) +
        " units are sitting in stock at " +
        inr(r.invValue as number) +
        ", costing " +
        inr(r.holdingCost as number) +
        " to hold. Profit does not show this immediately; the cash flow statement does.",
    );
  }
  if ((r.netProfit as number) > 0 && (r.netCF as number) < 0) {
    add(
      "A profitable quarter can still consume cash",
      "Net profit was " +
        inr(r.netProfit as number) +
        " and the cash balance moved " +
        inr(r.netCF as number) +
        ". Receivables, inventory and capital spending all sit between earning and being paid.",
    );
  }
  if ((r.netProfit as number) < 0 && (r.netCF as number) > 0) {
    add(
      "A loss-making quarter can still generate cash",
      "The loss was " +
        inr(-(r.netProfit as number)) +
        " but cash rose " +
        inr(r.netCF as number) +
        " — stock sold down, receivables collected, or financing drawn. Solvency and profitability are separate questions.",
    );
  }
  if ((r.shareDelta as number) > 0.005 && (r.grossProfit as number) / Math.max(1, r.revenueT as number) < 0.55) {
    add(
      "Share bought with price is share bought with margin",
      "Share rose " +
        n1((r.shareDelta as number) * 100) +
        " points at a gross margin of " +
        pct(((r.grossProfit as number) / Math.max(1, r.revenueT as number)) * 100) +
        ". Volume and profitability moved in opposite directions, which is the trade a discount always makes.",
    );
  }
  if (prior && (prior.totalFired as number) > 0 && (r.attritionNext as number) > (prior.attritionNext as number)) {
    add(
      "People decisions keep charging you after the saving",
      "The " +
        n0(prior.totalFired as number) +
        " roles cut last quarter saved salary immediately. Attrition has since risen to " +
        pct(r.attritionNext as number) +
        ", so the company is now losing people it did not choose to lose.",
    );
  }
  if ((r.seoFree as number) + (r.hypeFree as number) > 400) {
    add(
      "Assets bought earlier are working now for nothing",
      n0((r.seoFree as number) + (r.hypeFree as number)) +
        " leads arrived this quarter at no cost, from search and pre-launch work funded in previous quarters. Nothing on this quarter's plan produced them.",
    );
  }
  if ((r.landed as string[]).length) {
    add(
      "Product capability is permanent in a way spending is not",
      "Shipping " +
        (r.landed as string[]).map((id) => INNOVATION_BY_ID[id].name).join(" and ") +
        " raised what the product carries from now on. Unlike a marketing budget, it does not have to be bought again next quarter.",
    );
  }
  if ((r.shortRoles as { name: string }[]).length) {
    add(
      "Funding and capability are different things",
      (r.shortRoles as { name: string }[]).map((d) => d.name).join(" and ") +
        " could not deliver the plan you funded. Money committed above what a function can absorb is money that under-performs, not money that works harder.",
    );
  }
  if (r.crisis && r.neutralised) {
    add(
      "Preparation is cheaper than response",
      "The market event was fully absorbed. What made that possible was mostly bought in earlier quarters, when there was no visible reason to buy it.",
    );
  }
  if (!out.length) {
    add(
      "A quarter with no obvious failure is still a quarter of choices",
      "Nothing broke, which usually means the company is balanced or is not being pushed hard enough to find out where it breaks. Both are worth knowing.",
    );
  }
  return out.slice(0, 4);
}

/* ── the close-of-quarter read ────────────────────────────────────── */

export function whatHappened(r: QuarterResultShape) {
  const wrong: string[] = [];
  const right: string[] = [];
  const available = availTotal(r);

  if ((r.leadsWasted as number) > Math.max(60, (r.effLeads as number) * 0.08)) {
    wrong.push(
      "Marketing generated more demand than sales could handle. " +
        n0(r.leadsWasted as number) +
        " leads were never worked, and roughly " +
        inr((r.marketingSpend as number) * (r.leadWasteFrac as number)) +
        " of acquisition spend went with them.",
    );
  }
  if ((r.unmetDemand as number) > Math.max(40, (r.demandTotal as number) * 0.08)) {
    wrong.push(
      "Production capacity limited revenue. " + n0(r.unmetDemand as number) + " units of demand could not be filled.",
    );
  }
  if (r.ceilingBinding) {
    wrong.push(
      "The product became the bottleneck. Selling effort supported " +
        pct(r.rawConv as number) +
        " conversion; the product carried " +
        pct(r.ceiling as number) +
        ".",
    );
  }
  if (r.positionBinding) {
    wrong.push(
      "Your position in the category could not absorb the interest you created. " +
        n0(r.demandBeyondPosition as number) +
        " units of intent went to competitors.",
    );
  }
  if ((r.cash as number) < BUFFER) {
    wrong.push("Cash fell below the safety level the board set. Closing balance " + inr(r.cash as number) + ".");
  }
  if ((r.invUnitsOut as number) > Math.max(200, (r.unitsSold as number) * 0.35)) {
    wrong.push(
      n0(r.invUnitsOut as number) +
        " units were built and not sold, tying up " +
        inr(r.invValue as number) +
        " and costing " +
        inr(r.holdingCost as number) +
        " to hold.",
    );
  }
  if ((r.shortRoles as { name: string }[]).length) {
    wrong.push(
      (r.shortRoles as { name: string }[]).map((d) => d.name).join(" and ") +
        " could not deliver what you funded, so part of that spend under-performed.",
    );
  }
  if ((r.wastedMarketing as number) > (r.marketingSpend as number) * 0.2 && (r.marketingSpend as number) > 1e5) {
    wrong.push(
      pct((r.wasteFrac as number) * 100) +
        " of the demand-generation budget had nowhere to land — " +
        inr(r.wastedMarketing as number) +
        ".",
    );
  }
  if ((r.compliancePenalty as number) > 2e5) {
    wrong.push(
      "Compliance exposure cost " +
        inr(r.compliancePenalty as number) +
        " this quarter, which is the price of not funding governance.",
    );
  }

  if ((r.supplierRel as number) >= 85) {
    right.push(
      "Supplier reliability of " +
        n0(r.supplierRel as number) +
        " protected production — very little of what you built was lost.",
    );
  }
  if (!r.ceilingBinding && (r.quality as number) > 10) {
    right.push(
      "Product improvement kept the conversion ceiling ahead of what sales could push, so nothing was wasted against it.",
    );
  }
  if ((r.repeatRate as number) > 18) {
    right.push(
      "Repeat purchase reached " +
        pct(r.repeatRate as number) +
        ", delivering " +
        n0(r.repeatUnits as number) +
        " units you did not have to buy.",
    );
  }
  if ((r.leadsWasted as number) < 1 && (r.effLeads as number) > 200) {
    right.push("Every lead you paid for was worked. Sales capacity and demand generation were sized against each other.");
  }
  if (Math.abs(available - (r.demandTotal as number)) < (r.demandTotal as number) * 0.12 && (r.unitsSold as number) > 100) {
    right.push("Supply and demand landed within a few per cent of each other — no shortfall, no stockpile.");
  }
  if ((r.shareDelta as number) > 0.005) {
    right.push(
      "Market share rose " +
        n1((r.shareDelta as number) * 100) +
        " points to " +
        pct((r.marketShare as number) * 100) +
        " while the category itself grew.",
    );
  }
  if ((r.netProfit as number) > 0) right.push("The quarter turned a net profit of " + inr(r.netProfit as number) + ".");
  if (r.neutralised) right.push("The market event was fully neutralised.");
  if ((r.landed as string[]).length) {
    right.push(
      "Shipped " +
        (r.landed as string[]).map((id) => INNOVATION_BY_ID[id].name).join(" and ") +
        ", which the product will carry from now on.",
    );
  }

  if (!wrong.length) {
    wrong.push(
      "Nothing broke. That is rarer than it sounds, and usually means you are either well balanced or not pushing hard enough.",
    );
  }
  if (!right.length) {
    right.push("Little went right this quarter. The company survived it, which is not the same thing.");
  }

  return { wrong: wrong.slice(0, 5), right: right.slice(0, 5) };
}

/* ── the product pipeline board ───────────────────────────────────── */

export function pipelineBoard(s: CompanyState, r: QuarterResultShape | null, startInno: string[]) {
  const owned = s.innovations;
  const inFlight = Object.keys(s.pipeline);
  const starting = startInno || [];
  const backlog = INNOVATIONS.filter(
    (c) => owned.indexOf(c.id) < 0 && inFlight.indexOf(c.id) < 0 && starting.indexOf(c.id) < 0,
  );

  const items: {
    kind: string;
    id: string;
    name: string;
    tag: string;
    stage: string;
    pct: number;
    label: string;
    eta: string;
    note: string;
    warn: boolean;
  }[] = [];

  if (!s.products.pro.live) {
    const before = s.npd;
    const after = r ? (r.npd as number) : before;
    const gain = Math.max(0, after - before);
    const left = Math.max(0, 100 - after);
    items.push({
      kind: "product",
      id: "pro",
      name: PRODUCTS[1].name,
      tag: "New product",
      stage: r && r.proLaunching ? "ready" : after > 0 ? "development" : "idea",
      pct: clamp(after, 0, 100),
      label: "Development progress",
      eta:
        r && r.proLaunching
          ? "Cleared. On sale next quarter with 35% of the line."
          : gain > 0.5
            ? "About " + Math.max(1, Math.ceil(left / gain)) + " more quarter(s) at this rate"
            : before > 0
              ? "Stalled — nothing funded this quarter"
              : "Not started",
      note:
        "To have it on sale by quarter three, it needs to clear 100 by the end of quarter two — about " +
        inr(Math.pow(Math.max(0, left) / Math.max(1, 5 - s.quarter) / 16, 2) * 1e5) +
        " a quarter from here at full engineering staffing." +
        (r && (r.hypeNow as number) > 4
          ? " Anticipation is at " +
            n1(r.hypeNow as number) +
            ", worth a " +
            Math.min(1.9, 1 + (r.hypeNow as number) / 60).toFixed(2) +
            "x demand pull at launch."
          : " No pre-launch marketing funded yet."),
      warn: gain <= 0.5 && before > 0,
    });
  }

  inFlight.forEach((id) => {
    const card = INNOVATION_BY_ID[id];
    const left = s.pipeline[id];
    items.push({
      kind: "inno",
      id,
      name: card.name,
      tag: card.cat,
      stage: left <= 1 ? "ready" : "development",
      pct: clamp(((card.lead - left + 1) / (card.lead + 1)) * 100, 0, 100),
      label: "Engineering progress",
      eta: left <= 1 ? "Ships at the end of this quarter" : left + " quarters remaining",
      note: card.blurb,
      warn: false,
    });
  });

  starting.forEach((id) => {
    const card = INNOVATION_BY_ID[id];
    items.push({
      kind: "inno",
      id,
      name: card.name,
      tag: card.cat,
      stage: card.lead > 0 ? "development" : "ready",
      pct: card.lead > 0 ? 8 : 100,
      label: "Starting this quarter",
      eta: card.lead > 0 ? "Lands in " + card.lead + " quarter(s)" : "Ships at the end of this quarter",
      note: inr(card.cost) + " capitalised. " + card.blurb,
      warn: false,
    });
  });

  PRODUCTS.filter((p) => s.products[p.id].live).forEach((p) => {
    const cur = s.products[p.id];
    items.push({
      kind: "live",
      id: p.id,
      name: p.name,
      tag: cur.status === "active" ? "Selling" : cur.status,
      stage: "live",
      pct: 100,
      label: "On the market",
      eta: inr(cur.price) + " · " + n0(num(cur.inv)) + " units in stock",
      note: p.blurb,
      warn: cur.status !== "active",
    });
  });

  return {
    backlog,
    items,
    counts: {
      idea: backlog.length,
      development:
        inFlight.length +
        starting.filter((id) => INNOVATION_BY_ID[id].lead > 0).length +
        (!s.products.pro.live && (r ? (r.npd as number) : s.npd) > 0 && !(r && r.proLaunching) ? 1 : 0),
      ready:
        starting.filter((id) => INNOVATION_BY_ID[id].lead === 0).length +
        inFlight.filter((id) => s.pipeline[id] <= 1).length +
        (r && r.proLaunching ? 1 : 0),
      live: owned.length + PRODUCTS.filter((p) => s.products[p.id].live).length,
    },
  };
}
