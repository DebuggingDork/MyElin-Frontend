/**
 * The term sheet, the endgame settlement, and the year-end analysis that the final screen
 * renders.
 *
 * One deliberate departure from the shipped `NadiWear.html` bundle: the bundle scored each
 * quarter itself against a seven-trait rubric. **The backend owns scoring here.** Its rubric
 * is the same seven traits at the same weights (`app/config/profiles/default.json`:
 * systems 20 / strategic 15 / adaptability 15 / risk 15 / capital 15 / leadership 10 /
 * long-term 10), so `traitRollup` below rebuilds the identical seven-bar profile from the
 * backend's own `decision_quality.scored_criteria` instead of a second, disagreeing local
 * score. Everything that reads only the local history -- management style, most important
 * decision, delayed consequence, missed opportunity, the decision/consequence timeline --
 * is ported unchanged.
 */

import {
  BUFFER,
  DECISION_GROUPS,
  INNOVATION_BY_ID,
  PRIORITY_BY_ID,
  capexLakh,
  groupTotal,
  opexLakh,
} from "@/lib/simulation/constants";
import { clamp, cr, inr, lakh, n0, n1, n2, num, pct } from "@/lib/simulation/format";
import type {
  Alloc,
  EndgameOutcome,
  Modifier,
  NumericAlloc,
  PriorityId,
  QuarterResultShape,
  TermSheet,
  TermSheetOffer,
} from "@/lib/simulation/types";
import type { QuarterScore } from "@/lib/simulation/remote";

/**
 * The seven traits, in the order the profile is rendered, spelled exactly as the engine
 * returns them (`app/engines/simulation/scoring.py: TRAIT_WEIGHTS`).
 */
export const TRAIT_NAMES = [
  "Strategic Thinking",
  "Leadership",
  "Adaptability",
  "Systems Thinking",
  "Risk Management",
  "Capital Allocation",
  "Long-Term Thinking",
] as const;

/* ── did the money follow the declared priority? ──────────────────── */

/**
 * Compares what the CEO said they would prioritise against where the rupees actually went.
 * "Protect cash" is the one priority measured by restraint rather than by share of spend.
 */
export function priorityMatch(priority: PriorityId | null, A: NumericAlloc) {
  const p = priority ? PRIORITY_BY_ID[priority] : null;
  const committed = opexLakh(A) + capexLakh(A);
  if (!p || committed <= 0.01) return null;
  if (p.id === "cash") {
    return { share: null, ok: committed * 1e5 < 4e6, note: inr(committed * 1e5) + " committed in total" };
  }
  const onPriority = p.keys.reduce((sum, k) => sum + num(A[k]), 0);
  return {
    share: onPriority / committed,
    ok: onPriority / committed >= 0.35,
    note: pct((onPriority / committed) * 100) + " of committed spend went to it",
  };
}

/* ── the Q4 term sheet ────────────────────────────────────────────── */

/**
 * Builds the three-path menu from the first three quarters. `tierOverride` lets the backend's
 * own tier (`endgame_preview.tier`) decide which menu is shown, and `namesOverride` swaps in
 * the backend's term-sheet names, so the page and the API can never disagree about which
 * deal is on the table.
 */
export function buildTermSheet(
  history: QuarterResultShape[],
  finalState: { wcBreached: boolean; everInsolvent: boolean },
  tierOverride?: "THRIVING" | "STABLE" | "DISTRESSED" | null,
  namesOverride?: { path_a_name: string; path_b_name: string; path_c_name: string } | null,
): TermSheet {
  const [q1, q2, q3] = history;

  const thriving =
    (q3.netCF as number) > 0 &&
    (q2.valuation as number) > (q1.valuation as number) &&
    (q3.valuation as number) > (q2.valuation as number);
  const distressed =
    finalState.wcBreached ||
    finalState.everInsolvent ||
    ((q3.netCF as number) < 0 && (q3.cash as number) < (q2.cash as number) && (q2.cash as number) < (q1.cash as number));

  const tier = tierOverride ?? (thriving ? "THRIVING" : distressed ? "DISTRESSED" : "STABLE");

  const V = Math.max(1, q3.valuation as number);
  const baseUnits = Math.max(q1.unitsSold as number, 250);
  const M = clamp(Math.pow((q3.unitsSold as number) / baseUnits, 0.5) - 1, -0.5, 1.5);
  const trueContinuation = V * (1 + M);

  const invest = (
    ratio: number,
    covenantSlope: number,
    hitMult: number,
    missHaircut: number,
    ratchet: number,
  ) => {
    const investment = ratio * V;
    return {
      investment,
      equity: investment / (V + investment),
      covenant: (q3.unitsSold as number) * (1 + covenantSlope * M),
      hitMult,
      missHaircut,
      ratchet,
    };
  };

  let offers: TermSheetOffer[];

  if (tier === "THRIVING") {
    const a = invest(0.25, 1.3, 1.6, 0.6, 1.6);
    const price = V * (1 + 0.15 * Math.min(1, M / 0.6));
    offers = [
      {
        id: "A",
        kind: "invest",
        title: "Growth Investor",
        who: "Sattva Capital, Series A",
        pitch: "They like the trajectory and want you to spend into it. The money is real; so is the covenant attached to it.",
        terms: [
          ["Investment", inr(a.investment) + " (25% of your Q3 valuation)"],
          ["Equity given up", pct(a.equity * 100)],
          ["Q4 covenant", n0(a.covenant) + " units sold"],
          ["If you hit it", "Q4 valuation marked up 1.60×"],
          ["If you miss", "capped at 60% of Q3, stake ratchets to " + pct(a.equity * a.ratchet * 100)],
        ],
        ...a,
      },
      {
        id: "B",
        kind: "acquire",
        title: "Acquisition Offer",
        who: "Meridian Consumer Devices",
        pitch:
          "Cash today, no covenant, no Q4 risk. The number on the page is the whole story — or the part of it they want you to read.",
        price,
        terms: [
          ["Offer price", inr(price)],
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
        pitch:
          "No cash in, no covenant, no dilution. Q4 runs on your own balance sheet and you are graded on consistency.",
        terms: [
          ["Investment", "None"],
          ["Dilution", "None"],
          ["Q4", "Runs normally"],
          ["Grading", "Consistency of execution"],
        ],
      },
    ];
  } else if (tier === "STABLE") {
    const a = invest(0.15, 1.1, 1.35, 0.75, 1.3);
    offers = [
      {
        id: "A",
        kind: "invest",
        title: "Growth Investor — measured terms",
        who: "Sattva Capital, bridge round",
        pitch: "A smaller cheque against a gentler covenant. They are buying optionality, not conviction.",
        terms: [
          ["Investment", inr(a.investment) + " (15% of your Q3 valuation)"],
          ["Equity given up", pct(a.equity * 100)],
          ["Q4 covenant", n0(a.covenant) + " units sold"],
          ["If you hit it", "Q4 valuation marked up 1.35×"],
          ["If you miss", "25% haircut, stake ratchets to " + pct(a.equity * a.ratchet * 100)],
        ],
        ...a,
      },
      {
        id: "B",
        kind: "acquire",
        title: "Acquisition Offer — at value",
        who: "Meridian Consumer Devices",
        pitch:
          "A fair price, honestly struck. Whether fair is enough depends on what you believe the next four quarters hold.",
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
    const a = invest(0.4, 0, 1, 0, 1);
    a.covenant = 0;
    offers = [
      {
        id: "A",
        kind: "invest",
        title: "Rescue Financing",
        who: "Sattva Capital, structured rescue",
        pitch:
          "The cheque is large because the situation is bad and they know it. No markup on the other side — only survival.",
        terms: [
          ["Investment", inr(a.investment) + " (40% of your Q3 valuation)"],
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
        title: "Continue — High Risk",
        who: "No counterparty",
        pitch: "No cheque, no floor. If the cash runs out before the quarter closes, it runs out.",
        terms: [
          ["Investment", "None"],
          ["Dilution", "None"],
          ["Q4", "Runs, with a real chance of insolvency"],
          ["Grading", "Survival and execution"],
        ],
      },
    ];
  }

  // The API names the paths for this tier; use its wording so the page and the term sheet
  // the backend will accept can never drift apart.
  if (namesOverride) {
    const byId: Record<string, string> = {
      A: namesOverride.path_a_name,
      B: namesOverride.path_b_name,
      C: namesOverride.path_c_name,
    };
    offers = offers.map((o) => (byId[o.id] ? { ...o, title: byId[o.id] } : o));
  }

  return { tier, V, M, trueContinuation, offers, q1, q2, q3 };
}

/* ── settling the endgame ─────────────────────────────────────────── */

/**
 * How the chosen path resolves against the quarter that actually happened. `outcome` carries
 * the backend's Q4 figures, so the covenant is settled against the units the API says were
 * sold, not against a locally re-simulated number.
 */
export function settleEndgame(
  ts: TermSheet,
  deal: "A" | "B" | "C",
  outcome: { unitsSold: number; cash: number; valuation: number },
): EndgameOutcome {
  const offer = ts.offers.find((o) => o.id === deal);
  const acquisition = ts.offers.find((o) => o.id === "B")!;
  const gap = ts.trueContinuation - (acquisition.price as number);
  const mods: Modifier[] = [];
  const result: EndgameOutcome = { deal, offer, mods };

  if (deal === "B") {
    result.ended = true;
    result.price = acquisition.price;
    result.trueContinuation = ts.trueContinuation;
    result.gap = gap;
    result.finalValuation = acquisition.price;

    if (gap <= (acquisition.price as number) * 0.02) {
      mods.push({
        d: 4,
        why:
          "Acquisition accepted correctly — momentum was weak and the price sat at or above a continuation value of " +
          cr(ts.trueContinuation) +
          ".",
      });
    } else if (gap > (acquisition.price as number) * 0.15) {
      mods.push({
        d: -3,
        why:
          "Acquisition accepted leaving " +
          cr(gap) +
          " of continuation value unexamined — momentum implied the business was worth more.",
      });
    } else {
      mods.push({
        d: 1,
        why:
          "Acquisition accepted at a defensible price — " +
          cr(gap) +
          " left on the table, within a reasonable margin for risk.",
      });
    }
    return result;
  }

  if (gap > (acquisition.price as number) * 0.15) {
    mods.push({
      d: 4,
      why:
        "Acquisition rejected correctly — momentum implied a continuation value of " +
        cr(ts.trueContinuation) +
        " against an offer of " +
        cr(acquisition.price as number) +
        ".",
    });
  }

  if (deal === "A") {
    const hit = ts.tier === "DISTRESSED" ? outcome.cash > 0 : outcome.unitsSold >= (offer!.covenant as number);
    result.covenantHit = hit;
    result.covenant = offer!.covenant;
    result.equity = hit ? offer!.equity : (offer!.equity as number) * (offer!.ratchet as number);

    if (ts.tier === "DISTRESSED") {
      result.finalValuation = hit ? outcome.valuation : 0;
      result.gameOver = !hit;
      mods.push(
        hit
          ? { d: 5, why: "Rescue covenant met — the company closed Q4 solvent." }
          : { d: -8, why: "Rescue covenant missed — the company did not close the quarter solvent." },
      );
    } else {
      result.finalValuation = hit
        ? outcome.valuation * (offer!.hitMult as number)
        : Math.min(outcome.valuation, ts.V * (offer!.missHaircut as number));
      mods.push(
        hit
          ? {
              d: 5,
              why: "Covenant hit — " + n0(outcome.unitsSold) + " units against a target of " + n0(offer!.covenant as number) + ".",
            }
          : {
              d: -8,
              why:
                "Covenant missed — " +
                n0(outcome.unitsSold) +
                " units against a target of " +
                n0(offer!.covenant as number) +
                ". Valuation haircut and the stake ratcheted.",
            },
      );
    }
    return result;
  }

  result.finalValuation = outcome.valuation;
  result.gameOver = ts.tier === "DISTRESSED" && outcome.cash <= 0;
  if (result.gameOver) {
    mods.push({ d: -8, why: "Continued unfunded from a distressed position and ran out of cash." });
  }
  return result;
}

/* ── the seven-dimension profile, from the backend's own scoring ──── */
/* ── the seven-dimension profile, from the engine's own scoring ───── */

export type TraitBar = {
  name: string;
  /** null when nothing scored for this trait -- say so, never draw a 0% bar. */
  pct: number | null;
  scored: number;
};

/**
 * The year's seven-bar management profile, averaged over the quarters that have locked.
 *
 * Each trait's percentage is the points it earned as a share of the points it was worth. The
 * Nadi engine evaluates all seven mechanically, so in practice none comes back null -- the
 * null path is kept because a trait with no sub-criteria must never render as 0%, which would
 * read as a failure nobody earned.
 */
export function traitRollup(scores: QuarterScore[]): TraitBar[] {
  const earned: Record<string, number> = {};
  const possible: Record<string, number> = {};

  scores.forEach((s) =>
    s.traits.forEach((t) => {
      earned[t.name] = (earned[t.name] || 0) + Number(t.points);
      possible[t.name] = (possible[t.name] || 0) + Number(t.weight);
    }),
  );

  return TRAIT_NAMES.map((name) => ({
    name,
    pct: possible[name] ? (earned[name] / possible[name]) * 100 : null,
    scored: possible[name] ? 1 : 0,
  })).sort((a, b) => {
    if (a.pct === null && b.pct === null) return 0;
    if (a.pct === null) return 1;
    if (b.pct === null) return -1;
    return b.pct - a.pct;
  });
}

const assessedTraits = (scores: QuarterScore[]) =>
  traitRollup(scores).filter((t): t is TraitBar & { pct: number } => t.pct !== null);

/** What each dimension means, for the year-end "biggest strength" card. */
const STRENGTH_COPY: Record<string, string> = {
  "Systems Thinking": "You sized the stages of the business against each other rather than funding them in isolation.",
  "Capital Allocation": "Money went where it earned a return, and the balance sheet was never left to chance.",
  "Risk Management": "Cover was bought before it was needed, which is the only time it is available.",
  Adaptability:
    "You changed the plan when the evidence changed, rather than defending the previous quarter's decision.",
  Leadership: "The company kept the people it needed and they were able to deliver what you funded.",
  "Long-Term Thinking": "You funded assets that paid out after the quarter they were bought in.",
  "Strategic Thinking":
    "You concentrated resources rather than spreading them thin, and said what you were doing before you did it.",
};

export function biggestStrength(scores: QuarterScore[]) {
  const top = assessedTraits(scores)[0];
  if (!top) {
    return { name: "Not yet assessed", pct: null, why: "No quarter has been scored yet." };
  }
  return { name: top.name, pct: top.pct, why: STRENGTH_COPY[top.name] || "" };
}

/**
 * The heaviest penalty that actually fired across the year; if none did, the weakest of the
 * seven dimensions instead.
 */
export function biggestMistake(scores: QuarterScore[]) {
  let worst: { q: number; points: number; why: string } | null = null;

  scores.forEach((s, i) =>
    s.modifiers
      .filter((m) => Number(m.points) < 0)
      .forEach((m) => {
        const points = Number(m.points);
        if (!worst || points < worst.points) worst = { q: i + 1, points, why: m.why };
      }),
  );

  if (worst) {
    const w = worst as { q: number; points: number; why: string };
    return { title: "Quarter " + w.q, why: `(${w.points}) ${w.why}` };
  }

  const ranked = assessedTraits(scores);
  const weakest = ranked[ranked.length - 1];
  if (!weakest) {
    return { title: "Nothing the engine could fault", why: "No penalty fired in any quarter." };
  }
  return {
    title: weakest.name,
    why: "The weakest of the seven dimensions across the year, at " + n0(weakest.pct) + "% of its available marks.",
  };
}

/* ── analysis drawn from the local history alone ──────────────────── */

const topDecision = (A: NumericAlloc) =>
  Object.entries(DECISION_GROUPS)
    .flatMap(([, g]) => g.items.map((it) => ({ it, v: groupTotal(A, it) })))
    .sort((a, b) => b.v - a.v)[0];

/** A one-line characterisation of how the CEO ran the company. */
export function managementStyle(history: QuarterResultShape[]) {
  const avgSpend =
    history.reduce((sum, r) => sum + (r.opexSpend as number) + (r.capexSpend as number), 0) / history.length;
  const borrowed = history.some((r) => (r.debtClose as number) > 2e6);
  const productSpend = history.reduce(
    (sum, r) => sum + (r.A.quality as number) + (r.A.innovation as number) + (r.A.npd as number) + (r.A.design as number),
    0,
  );
  const mktSpend = history.reduce((sum, r) => sum + (r.marketingSpend as number), 0) / 1e5;
  const avgWaste = history.reduce((sum, r) => sum + (r.wasteFrac as number), 0) / history.length;
  const endCash = history[history.length - 1].cash as number;

  if (avgWaste > 0.25) {
    return {
      label: "Reactive Manager",
      why:
        "Spend consistently ran ahead of the company's ability to convert it — on average " +
        pct(avgWaste * 100) +
        " of demand generation had nowhere to land.",
    };
  }
  if (productSpend > mktSpend * 0.6) {
    return {
      label: "Product-Led Strategist",
      why: "More went into what the product could do than into telling people about it, and the conversion ceiling stayed ahead of the funnel.",
    };
  }
  if (avgSpend > 9e6 && borrowed) {
    return {
      label: "Aggressive Growth Operator",
      why: "You spent hard and borrowed to do it, betting that scale would arrive before the cash ran out.",
    };
  }
  if (endCash > BUFFER * 4 && avgSpend < 6e6) {
    return {
      label: "Capital-Conscious Builder",
      why: "You kept the balance sheet comfortable throughout and grew only as fast as the company could fund itself.",
    };
  }
  if (history.every((r) => (r.supplierRel as number) > 80) && history.every((r) => (r.cash as number) > BUFFER)) {
    return {
      label: "Risk-Aware Operator",
      why: "Reliability and the cash buffer were never allowed to slip, even when that cost you growth.",
    };
  }
  return {
    label: "Balanced CEO",
    why: "No single instinct dominated. You moved money between constraints as they appeared rather than committing to one theory of the business.",
  };
}

/** Quarter by quarter: what was decided, and what it produced. */
export function decisionTimeline(history: QuarterResultShape[], priorities: (PriorityId | null)[]) {
  return history.map((r, i) => {
    const decision: string[] = [];
    const top = topDecision(r.A);
    if (top && top.v > 0) decision.push("Put " + lakh(top.v) + " into " + top.it.name.toLowerCase());
    if ((r.totalHired as number) > 0) decision.push("hired " + n0(r.totalHired as number));
    if ((r.totalFired as number) > 0) decision.push("cut " + n0(r.totalFired as number));
    if ((r.started as string[]).length)
      decision.push("started " + (r.started as string[]).map((id) => INNOVATION_BY_ID[id].name).join(" and "));
    if ((r.drawn as number) > 0) decision.push("drew " + inr(r.drawn as number) + " of credit");
    if (r.crisis) decision.push("met the market event");

    const consequence: string[] = [];
    if ((r.leadsWasted as number) > Math.max(60, (r.effLeads as number) * 0.08)) {
      consequence.push(n0(r.leadsWasted as number) + " leads went unworked");
    }
    if ((r.unmetDemand as number) > 40) consequence.push(n0(r.unmetDemand as number) + " units of demand went unfilled");
    if (r.ceilingBinding) consequence.push("the product capped conversion at " + pct(r.ceiling as number));
    if ((r.cash as number) < BUFFER) consequence.push("cash closed below the buffer");
    consequence.push(
      n0(r.unitsSold as number) +
        " units, " +
        cr(r.revenueT as number) +
        ", share " +
        pct((r.marketShare as number) * 100),
    );

    return {
      q: i + 1,
      priority: priorities[i] ? PRIORITY_BY_ID[priorities[i]!].name : null,
      decision: decision.join(", ") || "committed almost nothing",
      consequence: consequence.join("; "),
    };
  });
}

/** The quarter whose valuation moved most, and what was decided in it. */
export function mostImportantDecision(history: QuarterResultShape[]) {
  let best: { q: number; swing: number; label: string; effect: string } | null = null;

  history.forEach((r, i) => {
    const prior = history[i - 1];
    const swing = prior ? Math.abs((r.valuation as number) - (prior.valuation as number)) : (r.valuation as number);
    const top = topDecision(r.A);
    const label = (r.started as string[]).length
      ? "starting " + (r.started as string[]).map((id) => INNOVATION_BY_ID[id].name).join(" and ")
      : (r.totalFired as number) > 2
        ? "cutting " + n0(r.totalFired as number) + " roles"
        : (r.drawn as number) > 0
          ? "drawing " + inr(r.drawn as number) + " of credit"
          : top && top.v > 0
            ? "putting " + lakh(top.v) + " into " + top.it.name.toLowerCase()
            : "holding the line";

    if (!best || swing > best.swing) {
      best = {
        q: i + 1,
        swing,
        label,
        effect:
          "Valuation moved " +
          cr(swing) +
          " that quarter, to " +
          cr(r.valuation as number) +
          ", on " +
          n0(r.unitsSold as number) +
          " units and " +
          pct((r.marketShare as number) * 100) +
          " share.",
      };
    }
  });

  return best as unknown as { q: number; swing: number; label: string; effect: string };
}

/** The clearest case of a decision that charged you a quarter or two later. */
export function delayedConsequence(history: QuarterResultShape[]) {
  for (let i = 1; i < history.length; i++) {
    const a = history[i - 1];
    const b = history[i];

    if ((a.A.cx as number) + (a.A.onboarding as number) < 1 && (b.satisfaction as number) < (a.satisfaction as number)) {
      return {
        title: "Cutting customer experience came back two quarters later",
        body:
          "In Q" +
          i +
          " you funded almost nothing into support and onboarding. Satisfaction fell from " +
          n0(a.satisfaction as number) +
          " to " +
          n0(b.satisfaction as number) +
          " in Q" +
          (i + 1) +
          ", and repeat purchase followed it down — which meant buying customers again through paid acquisition.",
      };
    }
    if ((a.leadsWasted as number) > (a.effLeads as number) * 0.15 && (b.A.reps as number) > (a.A.reps as number)) {
      return {
        title: "The marketing you paid for in Q" + i + " only worked in Q" + (i + 1),
        body:
          "You generated " +
          n0(a.effLeads as number) +
          " leads in Q" +
          i +
          " with capacity for " +
          n0(a.leadsUsed as number) +
          ". By the time you added selling capacity in Q" +
          (i + 1) +
          ", the earlier demand was gone. Roughly " +
          inr((a.marketingSpend as number) * (a.leadWasteFrac as number)) +
          " of it.",
      };
    }
    if ((a.A.capex as number) > 3 && (b.utilisation as number) < 0.7) {
      return {
        title: "The plant you bought in Q" + i + " sat half idle in Q" + (i + 1),
        body:
          "Capacity investment added " +
          n0(a.capacityAdded as number) +
          " units a quarter, but the production run in Q" +
          (i + 1) +
          " only used " +
          pct((b.utilisation as number) * 100) +
          " of installed capacity. Capital assets do not run themselves.",
      };
    }
    if ((a.totalFired as number) > 0 && (b.attritionNext as number) > (a.attritionNext as number)) {
      return {
        title: "The layoffs in Q" + i + " kept costing you afterwards",
        body:
          "Cutting " +
          n0(a.totalFired as number) +
          " roles saved salary immediately. Morale fell to " +
          n0(a.empSat as number) +
          " and attrition rose to " +
          pct(b.attritionNext as number) +
          " — so you lost more people you had not chosen to lose.",
      };
    }
    if (
      (a.A.content as number) + (a.A.prelaunch as number) > 3 &&
      (b.seoFree as number) + (b.hypeFree as number) > 500
    ) {
      return {
        title: "The assets you built in Q" + i + " paid out in Q" + (i + 1),
        body:
          "Search and pre-launch spend in Q" +
          i +
          " delivered " +
          n0((b.seoFree as number) + (b.hypeFree as number)) +
          " leads in Q" +
          (i + 1) +
          " that cost nothing. Almost nobody funds these because they show no return in the quarter they are bought.",
      };
    }
  }

  return {
    title: "No single delayed consequence dominated the year",
    body: "Decisions and outcomes stayed close together, which usually means the company was never pushed hard enough for a lag to open up.",
  };
}

/** The most expensive thing left unfunded. */
export function missedOpportunity(history: QuarterResultShape[], finalState: { npd: number; innovations: string[]; products: { pro: { live: boolean } } }) {
  const last = history[history.length - 1];

  if (!finalState.products.pro.live && history.some((r) => (r.A.npd as number) > 0)) {
    return {
      title: "The second product was started and never finished",
      body:
        "New product development reached " +
        n0(finalState.npd) +
        " of 100. Everything spent on it returned nothing, because there is no partial credit — the Pro either goes on sale or it does not.",
    };
  }
  if (!finalState.innovations.length) {
    return {
      title: "The innovation board was never used",
      body: "Eleven capabilities were available all year, capitalised rather than expensed. Not one was bought, so the conversion ceiling only ever moved at the speed of continuous R&D.",
    };
  }
  if (history.every((r) => (r.A.referral as number) < (r.referralCapSpend as number) * 0.5)) {
    return {
      title: "Referral was never funded to its cap",
      body: "The cheapest demand in the model, hard-capped at 20% of your customer base, and you left most of it unfunded every quarter.",
    };
  }
  if ((last.utilisation as number) < 0.7) {
    return {
      title: "You never ran the plant you owned",
      body:
        "The year ended at " +
        pct((last.utilisation as number) * 100) +
        " utilisation on " +
        n0(last.installedCapacity as number) +
        " units of installed capacity. The fixed cost of that plant was paid whether it ran or not.",
    };
  }
  if ((last.attractShare as number) > (last.marketShare as number) * 1.6) {
    return {
      title: "Your position was better than your execution",
      body:
        "By the close your standing in the category could have reached " +
        pct((last.attractShare as number) * 100) +
        " of the market. You converted " +
        pct((last.marketShare as number) * 100) +
        ". The gap was capacity and supply, not desirability.",
    };
  }
  return {
    title: "Little was left on the table",
    body: "The obvious levers were all pulled at some point in the year. What remained was a question of degree rather than omission.",
  };
}

/* ── how the engine graded the quarter, in the original's idiom ───── */

/**
 * Verdict cards for the closed-quarter screen.
 *
 * The line shown under each trait is the first sub-criterion it did *not* fully meet -- the
 * most useful sentence on the card, because it names what to fix rather than what went right.
 * A trait with nothing to fault falls back to its first sub-criterion.
 */
export function traitVerdicts(score: QuarterScore) {
  return score.traits.map((t) => {
    const share = Number(t.weight) ? Number(t.points) / Number(t.weight) : 0;
    const miss = t.subs.find((s) => s.level !== "full");
    return {
      name: t.name,
      verdict: share >= 0.8 ? "strong" : share >= 0.6 ? "sound" : share >= 0.4 ? "mixed" : "weak",
      tone: (share >= 0.7 ? "good" : share >= 0.45 ? "watch" : "bad") as "good" | "watch" | "bad",
      line: (miss ?? t.subs[0])?.detail ?? "",
    };
  });
}

export { n1, n2, clamp, num, lakh, cr, inr, n0, pct };

/** Re-exported so screens can keep the original's `Alloc` type import path. */
export type { Alloc };
