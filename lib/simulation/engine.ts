import type {
  BlockAnswer,
  DecisionBlock,
  DimensionKey,
  Dimensions,
  MetricEffects,
  Metrics,
  Quarter,
  QuarterAnswers,
  QuarterResult,
  ResolvedLine,
} from "@/lib/simulation/types";

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  strategy: "Strategic Thinking",
  judgment: "Business Judgment",
  risk: "Risk Management",
  adaptability: "Adaptability",
  leadership: "Leadership",
  uncertainty: "Decision Under Uncertainty",
};

export const DIMENSION_ORDER: DimensionKey[] = [
  "strategy",
  "judgment",
  "risk",
  "adaptability",
  "leadership",
  "uncertainty",
];

export const METRIC_LABELS = {
  cash: "Cash",
  revenue: "Revenue / mo",
  customers: "Customers",
  employees: "Employees",
  morale: "Morale",
  share: "Market share",
  trust: "Stakeholder trust",
  burn: "Burn / mo",
} as const;

const BOUNDED: Partial<Record<keyof Metrics, [number, number]>> = {
  morale: [0, 100],
  trust: [0, 100],
  share: [0, 100],
};

export function emptyDimensions(): Dimensions {
  return {
    strategy: 0,
    judgment: 0,
    risk: 0,
    adaptability: 0,
    leadership: 0,
    uncertainty: 0,
  };
}

function addDimensions(base: Dimensions, add: Partial<Dimensions>): Dimensions {
  const next = { ...base };
  for (const key of DIMENSION_ORDER) {
    next[key] += add[key] ?? 0;
  }
  return next;
}

function mergeEffects(base: MetricEffects, add: MetricEffects): MetricEffects {
  const next: MetricEffects = { ...base };
  for (const [k, v] of Object.entries(add) as [keyof Metrics, number][]) {
    next[k] = (next[k] ?? 0) + v;
  }
  return next;
}

export function applyEffects(metrics: Metrics, effects: MetricEffects): Metrics {
  const next = { ...metrics };
  for (const [k, v] of Object.entries(effects) as [keyof Metrics, number][]) {
    let value = next[k] + v;
    const bound = BOUNDED[k];
    if (bound) value = Math.min(bound[1], Math.max(bound[0], value));
    if (k === "customers" || k === "employees") value = Math.max(0, Math.round(value));
    next[k] = Math.round(value * 10) / 10;
  }
  return next;
}

/** `burn` is already net of revenue, so runway is simply cash over burn. */
export function runwayMonths(metrics: Metrics): number {
  if (metrics.burn <= 0) return Infinity;
  return Math.max(0, Math.round((metrics.cash / metrics.burn) * 10) / 10);
}

/** Concentration of an allocation split: 0 = perfectly spread, 1 = all-in. */
function concentration(split: Record<string, number>, total: number): number {
  if (total <= 0) return 0;
  const shares = Object.values(split).map((v) => v / total);
  const hhi = shares.reduce((acc, s) => acc + s * s, 0);
  const n = Math.max(1, shares.length);
  const floor = 1 / n;
  return Math.max(0, Math.min(1, (hhi - floor) / (1 - floor)));
}

function resolveBlock(
  block: DecisionBlock,
  answer: BlockAnswer | undefined,
): {
  effects: MetricEffects;
  scores: Partial<Dimensions>;
  lines: ResolvedLine[];
  delayed: string[];
} {
  const lines: ResolvedLine[] = [];
  const delayed: string[] = [];
  let effects: MetricEffects = {};
  let scores: Partial<Dimensions> = {};

  if (!answer) return { effects, scores, lines, delayed };

  if (block.kind === "select" && answer.kind === "select") {
    const option = block.options.find((o) => o.id === answer.optionId);
    if (option) {
      effects = mergeEffects(effects, option.effects);
      scores = { ...option.scores };
      lines.push({
        text: `${block.title}: ${option.label} — ${option.consequence}`,
        tone: scoreTone(option.scores),
      });
      if (option.delayed) delayed.push(option.delayed);
    }
    return { effects, scores, lines, delayed };
  }

  if (block.kind === "allocate" && answer.kind === "allocate") {
    const totalSpent = Object.values(answer.split).reduce((a, b) => a + b, 0);
    for (const channel of block.channels) {
      const amount = answer.split[channel.id] ?? 0;
      if (amount <= 0) continue;
      const full = Math.min(amount, channel.saturates);
      const excess = Math.max(0, amount - channel.saturates);
      const units = full / 10 + (excess / 10) * 0.45;

      for (const [k, v] of Object.entries(channel.perUnit) as [
        keyof Metrics,
        number,
      ][]) {
        effects = mergeEffects(effects, { [k]: v * units });
      }
      for (const key of DIMENSION_ORDER) {
        const per = channel.perUnitScores[key];
        if (per) scores[key] = (scores[key] ?? 0) + per * Math.min(units, 4);
      }
    }

    // Spending is a commitment: unspent budget stays as cash.
    const unspent = Math.max(0, block.budget - totalSpent);
    if (unspent > 0) {
      effects = mergeEffects(effects, { cash: unspent });
    }

    const conc = concentration(answer.split, totalSpent);
    scores.strategy = (scores.strategy ?? 0) + Math.round(conc * 6);
    scores.leadership = (scores.leadership ?? 0) + Math.round(conc * 3);

    const ranked = block.channels
      .map((c) => ({ label: c.label, amount: answer.split[c.id] ?? 0 }))
      .sort((a, b) => b.amount - a.amount);
    const top = ranked[0];
    const funded = ranked.filter((c) => c.amount > 0).length;
    const topShare = totalSpent > 0 ? top.amount / totalSpent : 0;

    if (topShare >= 0.45) {
      lines.push({
        text: `${block.title}: ₹${top.amount}L of ₹${totalSpent}L went to ${top.label} — a clear thesis the board can interrogate.`,
        tone: "ok",
      });
    } else if (funded <= 2) {
      lines.push({
        text: `${block.title}: split between ${funded} channels, led by ${top.label}. A defensible bet with a hedge attached.`,
        tone: "ok",
      });
    } else {
      lines.push({
        text: `${block.title}: ₹${totalSpent}L spread across ${funded} channels with no clear lead. Every function is funded; none is prioritised.`,
        tone: "warn",
      });
    }

    return { effects, scores, lines, delayed };
  }

  if (block.kind === "confidence" && answer.kind === "confidence") {
    const error = Math.abs(answer.value - block.truth);
    const calibration = Math.max(0, 20 - error / 4);
    scores.uncertainty = calibration;
    scores.judgment = calibration * 0.5;
    scores.risk = calibration * 0.35;
    lines.push({
      text: `${block.title}: you said ${answer.value}%. Reality was ${block.truth}%. ${block.reveal}`,
      tone: error <= 12 ? "ok" : error <= 30 ? "warn" : "bad",
    });
    return { effects, scores, lines, delayed };
  }

  return { effects, scores, lines, delayed };
}

function scoreTone(scores: Partial<Dimensions>): ResolvedLine["tone"] {
  const values = DIMENSION_ORDER.map((k) => scores[k] ?? 0).filter((v) => v > 0);
  if (!values.length) return "info";
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg >= 14) return "ok";
  if (avg >= 9) return "warn";
  return "bad";
}

function gradeFor(scores: Dimensions): string {
  const avg = compositeScore(scores);
  if (avg >= 85) return "A";
  if (avg >= 72) return "B";
  if (avg >= 58) return "C";
  if (avg >= 44) return "D";
  return "E";
}

/** Dimension scores are stored 0–100, so the composite is a plain average. */
export function compositeScore(scores: Dimensions): number {
  const values = DIMENSION_ORDER.map((k) => scores[k]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.max(0, Math.min(100, Math.round(avg * 10) / 10));
}

/** Units of spend a channel converts, mirroring how `resolveBlock` counts them. */
function unitsFor(amount: number, saturates: number): number {
  const full = Math.min(amount, saturates);
  const excess = Math.max(0, amount - saturates);
  return Math.min(full / 10 + (excess / 10) * 0.45, 4);
}

/** The best score this quarter could have produced — the yardstick for grading. */
function bestPossibleScores(quarter: Quarter): Dimensions {
  const out = emptyDimensions();

  for (const block of quarter.blocks) {
    if (block.kind === "select") {
      for (const key of DIMENSION_ORDER) {
        out[key] += Math.max(...block.options.map((o) => o.scores[key] ?? 0));
      }
      continue;
    }

    if (block.kind === "allocate") {
      for (const key of DIMENSION_ORDER) {
        let best = 0;
        for (const channel of block.channels) {
          const per = channel.perUnitScores[key];
          if (!per) continue;
          best = Math.max(best, per * unitsFor(block.budget, channel.saturates));
        }
        out[key] += best;
      }
      out.strategy += 6;
      out.leadership += 3;
      continue;
    }

    out.uncertainty += 20;
    out.judgment += 10;
    out.risk += 7;
  }

  return out;
}

export function resolveQuarter(
  quarter: Quarter,
  answers: QuarterAnswers,
  before: Metrics,
): QuarterResult {
  let effects: MetricEffects = {};
  let scores = emptyDimensions();
  const lines: ResolvedLine[] = [];
  const delayed: string[] = [];

  for (const block of quarter.blocks) {
    const resolved = resolveBlock(block, answers[block.id]);
    effects = mergeEffects(effects, resolved.effects);
    scores = addDimensions(scores, resolved.scores);
    lines.push(...resolved.lines);
    delayed.push(...resolved.delayed);
  }

  // Three months of net burn leave the bank regardless of what you decided.
  effects = mergeEffects(effects, { cash: -before.burn * 3 });

  const after = applyEffects(before, effects);
  const delta: MetricEffects = {};
  for (const key of Object.keys(before) as (keyof Metrics)[]) {
    const diff = Math.round((after[key] - before[key]) * 10) / 10;
    if (diff !== 0) delta[key] = diff;
  }

  const ceiling = bestPossibleScores(quarter);
  const normalised = emptyDimensions();
  for (const key of DIMENSION_ORDER) {
    normalised[key] = ceiling[key]
      ? Math.max(0, Math.min(100, Math.round((scores[key] / ceiling[key]) * 100)))
      : 0;
  }

  if (after.cash < 0) {
    lines.push({
      text: "Cash has gone negative. Payroll is at risk and every option from here is worse.",
      tone: "bad",
    });
  } else if (runwayMonths(after) < 4) {
    lines.push({
      text: `Runway is down to ${runwayMonths(after)} months. The next decision is no longer optional.`,
      tone: "warn",
    });
  }

  return {
    quarterId: quarter.id,
    before,
    after,
    delta,
    scores: normalised,
    lines,
    delayed,
    grade: gradeFor(normalised),
  };
}

export function aggregateScores(results: QuarterResult[]): Dimensions {
  if (!results.length) return emptyDimensions();
  const total = results.reduce(
    (acc, r) => addDimensions(acc, r.scores),
    emptyDimensions(),
  );
  const out = emptyDimensions();
  for (const key of DIMENSION_ORDER) {
    out[key] = Math.round((total[key] / results.length) * 10) / 10;
  }
  return out;
}

export function isBlockAnswered(
  block: DecisionBlock,
  answer: BlockAnswer | undefined,
): boolean {
  if (!answer) return false;
  if (block.kind === "select") return answer.kind === "select" && !!answer.optionId;
  if (block.kind === "confidence") return answer.kind === "confidence";
  if (block.kind === "allocate") {
    if (answer.kind !== "allocate") return false;
    return Object.values(answer.split).reduce((a, b) => a + b, 0) > 0;
  }
  return false;
}

export function percentileFor(score: number): number {
  return Math.max(1, Math.min(99, Math.round(score * 0.94 + 3)));
}
