import type { Accent } from "@/components/ui/Kit";
import {
  SHAPE_LABEL,
  SHAPE_ORDER,
  departmentShape,
  type Answers,
  type Department,
  type Shape,
  type ShapeKey,
} from "@/lib/play/types";

export type Insight = {
  id: string;
  /** Short label shown on the slab edge. */
  tag: string;
  headline: string;
  detail: string;
  accent: Accent;
  /** Drives the intensity bar on the insight slab. */
  weight: number;
};

export type Tension = {
  id: string;
  left: string;
  right: string;
  /** -100 (all left) → 100 (all right). */
  bias: number;
  accentLeft: Accent;
  accentRight: Accent;
};

const AXIS_ACCENT: Record<ShapeKey, Accent> = {
  growth: "cyan",
  discipline: "violet",
  resilience: "emerald",
  agility: "amber",
};

export function axisAccent(key: ShapeKey): Accent {
  return AXIS_ACCENT[key];
}

function dominant(shape: Shape): { key: ShapeKey; value: number } {
  return SHAPE_ORDER.map((key) => ({ key, value: shape[key] })).sort(
    (a, b) => b.value - a.value,
  )[0];
}

function weakest(shape: Shape): { key: ShapeKey; value: number } {
  return SHAPE_ORDER.map((key) => ({ key, value: shape[key] })).sort(
    (a, b) => a.value - b.value,
  )[0];
}

/**
 * Everything the right rail shows is derived here, so the readout moves the
 * instant an answer changes rather than waiting for the quarter to resolve.
 */
export function readDepartment(department: Department, answers: Answers) {
  const shape = departmentShape(department, answers);
  const insights: Insight[] = [];
  const tensions: Tension[] = [];

  const decisions = department.sections.flatMap((s) => s.decisions);
  const answeredCount = decisions.filter((d) => answers[d.id]).length;

  if (answeredCount === 0) {
    insights.push({
      id: "empty",
      tag: "Waiting",
      headline: "Nothing committed yet.",
      detail:
        "The read below rewrites itself the moment you seat your first slab.",
      accent: "violet",
      weight: 12,
    });
  }

  /* ── choices ─────────────────────────────────────────────── */
  for (const decision of decisions) {
    const answer = answers[decision.id];
    if (decision.kind !== "choice" || answer?.kind !== "choice") continue;
    const option = decision.options.find((o) => o.id === answer.optionId);
    if (!option) continue;
    const top = dominant(option.shape);
    const low = weakest(option.shape);
    insights.push({
      id: `choice-${decision.id}`,
      tag: decision.title,
      headline: `${option.label} buys ${SHAPE_LABEL[top.key].toLowerCase()}.`,
      detail: `It spends ${SHAPE_LABEL[low.key].toLowerCase()} to get there — ${low.value} of 100 on that axis.`,
      accent: AXIS_ACCENT[top.key],
      weight: top.value,
    });
  }

  /* ── allocations ─────────────────────────────────────────── */
  for (const decision of decisions) {
    const answer = answers[decision.id];
    if (decision.kind !== "allocate" || answer?.kind !== "allocate") continue;

    const entries = decision.channels.map((channel) => ({
      channel,
      amount: answer.split[channel.id] ?? 0,
    }));
    const committed = entries.reduce((sum, e) => sum + e.amount, 0);
    const remaining = decision.budget - committed;
    const funded = entries.filter((e) => e.amount > 0);
    const lead = [...entries].sort((a, b) => b.amount - a.amount)[0];
    const leadShare = committed > 0 ? (lead.amount / committed) * 100 : 0;

    if (remaining > 0) {
      insights.push({
        id: `alloc-open-${decision.id}`,
        tag: "Uncommitted",
        headline: `₹${remaining} L is still sitting in the vault.`,
        detail:
          "A plan with idle capital reads as indecision in the board pack.",
        accent: "amber",
        weight: (remaining / decision.budget) * 100,
      });
    } else if (leadShare >= 55) {
      insights.push({
        id: `alloc-thesis-${decision.id}`,
        tag: "Concentration",
        headline: `${Math.round(leadShare)}% rides on ${lead.channel.label}.`,
        detail: `That is a thesis, not a hedge. If ${lead.channel.label.toLowerCase()} misses, the quarter misses.`,
        accent: lead.channel.accent,
        weight: leadShare,
      });
    } else if (funded.length >= 4) {
      insights.push({
        id: `alloc-spread-${decision.id}`,
        tag: "Spread",
        headline: `Split across ${funded.length} lanes with no lead.`,
        detail:
          "Even spread protects you from being wrong and from being right.",
        accent: "rose",
        weight: 100 - leadShare,
      });
    } else {
      insights.push({
        id: `alloc-balanced-${decision.id}`,
        tag: "Shape",
        headline: `${lead.channel.label} leads at ${Math.round(leadShare)}%.`,
        detail: `Backed by ${funded.length - 1} supporting ${
          funded.length - 1 === 1 ? "lane" : "lanes"
        } — defensible if the lead holds.`,
        accent: lead.channel.accent,
        weight: leadShare,
      });
    }

    if (committed > 0) {
      const defensive = entries
        .filter((e) => e.channel.shape.resilience >= 70)
        .reduce((sum, e) => sum + e.amount, 0);
      const offensive = entries
        .filter((e) => e.channel.shape.growth >= 70)
        .reduce((sum, e) => sum + e.amount, 0);
      if (defensive + offensive > 0) {
        tensions.push({
          id: `tension-${decision.id}`,
          left: "Defend",
          right: "Attack",
          bias:
            ((offensive - defensive) / Math.max(1, defensive + offensive)) * 100,
          accentLeft: "emerald",
          accentRight: "cyan",
        });
      }
    }
  }

  /* ── priority stacks ─────────────────────────────────────── */
  for (const decision of decisions) {
    const answer = answers[decision.id];
    if (decision.kind !== "priority" || answer?.kind !== "priority") continue;
    if (answer.order.length === 0) continue;
    const first = decision.items.find((i) => i.id === answer.order[0]);
    const ignored = decision.items.filter((i) => !answer.order.includes(i.id));
    if (!first) continue;
    insights.push({
      id: `priority-${decision.id}`,
      tag: "Risk stack",
      headline: `${first.label} is your number one.`,
      detail:
        answer.order.length < decision.pick
          ? `${decision.pick - answer.order.length} more to rank before this reads as a plan.`
          : `${ignored.map((i) => i.label).join(", ")} left unranked — you are accepting those.`,
      accent: "rose",
      weight: 60 + answer.order.length * 12,
    });
  }

  /* ── conviction calibration ──────────────────────────────── */
  for (const decision of decisions) {
    const answer = answers[decision.id];
    if (decision.kind !== "conviction" || answer?.kind !== "conviction")
      continue;
    if (answer.value === 0) continue;
    const resilience = shape.resilience;
    const gap = answer.value - resilience;
    insights.push({
      id: `conviction-${decision.id}`,
      tag: "Calibration",
      headline:
        gap > 25
          ? `Conviction ${answer.value}% on a ${resilience}-resilience plan.`
          : gap < -25
            ? `Conviction ${answer.value}% under-sells a ${resilience}-resilience plan.`
            : `Conviction ${answer.value}% tracks the plan you built.`,
      detail:
        gap > 25
          ? "Overconfidence is scored. The plan is thinner than the statement."
          : gap < -25
            ? "Under-claiming is also scored. You built more cover than you admit."
            : "Calibrated. Stated confidence matches the exposure you took.",
      accent: Math.abs(gap) > 25 ? "amber" : "emerald",
      weight: answer.value,
    });

    tensions.push({
      id: `tension-conv-${decision.id}`,
      left: decision.low,
      right: decision.high,
      bias: answer.value * 2 - 100,
      accentLeft: "amber",
      accentRight: "violet",
    });
  }

  /* ── the shape itself ────────────────────────────────────── */
  if (answeredCount > 0) {
    const top = dominant(shape);
    const low = weakest(shape);
    if (top.value - low.value >= 30) {
      insights.push({
        id: "shape-lean",
        tag: "Posture",
        headline: `This workspace leans ${SHAPE_LABEL[top.key]}.`,
        detail: `${SHAPE_LABEL[low.key]} sits at ${low.value}. That is the seam a crisis will find.`,
        accent: AXIS_ACCENT[top.key],
        weight: top.value - low.value + 40,
      });
    } else {
      insights.push({
        id: "shape-flat",
        tag: "Posture",
        headline: "A flat posture — no axis dominates.",
        detail:
          "Balanced plans survive surprises and rarely win quarters outright.",
        accent: "indigo",
        weight: 45,
      });
    }

    tensions.push({
      id: "tension-shape",
      left: SHAPE_LABEL.discipline,
      right: SHAPE_LABEL.growth,
      bias:
        ((shape.growth - shape.discipline) /
          Math.max(1, shape.growth + shape.discipline)) *
        100,
      accentLeft: "violet",
      accentRight: "cyan",
    });
  }

  return {
    shape,
    insights: insights.sort((a, b) => b.weight - a.weight).slice(0, 5),
    tensions: tensions.slice(0, 3),
  };
}

/** Company-wide read for the command view. */
export function readCompany(departments: Department[], answers: Answers) {
  const shapes = departments.map((d) => departmentShape(d, answers));
  const merged: Shape = {
    growth: 0,
    discipline: 0,
    resilience: 0,
    agility: 0,
  };
  for (const shape of shapes) {
    for (const key of SHAPE_ORDER) merged[key] += shape[key];
  }
  for (const key of SHAPE_ORDER) {
    merged[key] = Math.round(merged[key] / Math.max(1, shapes.length));
  }
  return merged;
}
