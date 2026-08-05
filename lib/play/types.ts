import type { Accent } from "@/components/ui/Kit";

/** Four axes of the live strategy shape shown beside every workspace. */
export type ShapeKey = "growth" | "discipline" | "resilience" | "agility";

export type Shape = Record<ShapeKey, number>;

export const SHAPE_ORDER: ShapeKey[] = [
  "growth",
  "discipline",
  "resilience",
  "agility",
];

export const SHAPE_LABEL: Record<ShapeKey, string> = {
  growth: "Growth",
  discipline: "Discipline",
  resilience: "Resilience",
  agility: "Agility",
};

export type Severity = "critical" | "high" | "medium";

/* ── operating readouts (the dense panels in every workspace) ─── */

export type Fmt =
  | "money"
  | "moneyK"
  | "count"
  | "pct"
  | "months"
  | "days"
  | "hours"
  | "ratio";

export type PanelIcon =
  | "coins"
  | "gauge"
  | "landmark"
  | "cpu"
  | "bug"
  | "layers"
  | "filter"
  | "globe"
  | "target"
  | "users"
  | "userPlus"
  | "graduation"
  | "zap"
  | "server"
  | "wrench"
  | "truck"
  | "heart"
  | "ticket"
  | "activity";

/**
 * One line in a readout panel. A row with an `axis` reacts to the live
 * strategy shape, so the numbers move as decisions land.
 */
export type ReadRow = {
  label: string;
  /** Static label instead of a number. */
  text?: string;
  base?: number;
  fmt?: Fmt;
  axis?: ShapeKey;
  /** Full deflection at axis 100 (and the mirror of it at axis 0). */
  swing?: number;
  /** Down is good — flips the colour of the delta. */
  invert?: boolean;
};

export type ReadBar = {
  label: string;
  /** budget: rupees allocated · commit: decisions sealed · shape: an axis. */
  source: "budget" | "commit" | "shape";
  axis?: ShapeKey;
};

export type ReadPanelDef = {
  id: string;
  title: string;
  icon: PanelIcon;
  rows: ReadRow[];
  bar?: ReadBar;
};

export type ChoiceOption = {
  id: string;
  label: string;
  hint: string;
  shape: Shape;
};

export type Channel = {
  id: string;
  label: string;
  hint: string;
  accent: Accent;
  shape: Shape;
};

export type PriorityItem = {
  id: string;
  label: string;
  hint: string;
};

type Base = {
  id: string;
  title: string;
  prompt: string;
  severity: Severity;
};

export type Decision =
  | (Base & { kind: "choice"; options: ChoiceOption[] })
  | (Base & {
      kind: "allocate";
      /** Total in ₹ lakh. */
      budget: number;
      /** Size of one block in ₹ lakh. */
      unit: number;
      channels: Channel[];
    })
  | (Base & { kind: "priority"; pick: number; items: PriorityItem[] })
  | (Base & { kind: "conviction"; low: string; high: string });

export type Section = {
  id: string;
  label: string;
  blurb: string;
  decisions: Decision[];
};

export type Department = {
  id: string;
  name: string;
  owner: string;
  role: string;
  tagline: string;
  quote: string;
  /** Discretionary budget in ₹ lakh. */
  budget: number;
  accent: Accent;
  icon:
    | "wallet"
    | "boxes"
    | "megaphone"
    | "trending"
    | "factory"
    | "users"
    | "heart";
  /** Live operating readouts shown above the decisions. */
  panels: ReadPanelDef[];
  sections: Section[];
};

export type Scenario = {
  id: string;
  name: string;
  quarterLabel: string;
  quarterTheme: string;
  company: {
    name: string;
    stage: string;
    sector: string;
  };
  minutes: number;
  metrics: { key: string; label: string; value: string; accent: Accent }[];
  /** Company-wide readouts on the command view. */
  panels: ReadPanelDef[];
  departments: Department[];
};

/* ── answers ─────────────────────────────────────────────────── */

export type Answer =
  | { kind: "choice"; optionId: string }
  | { kind: "allocate"; split: Record<string, number> }
  | { kind: "priority"; order: string[] }
  | { kind: "conviction"; value: number };

export type Answers = Record<string, Answer>;

export function isAnswered(decision: Decision, answer?: Answer): boolean {
  if (!answer) return false;
  switch (decision.kind) {
    case "choice":
      return answer.kind === "choice" && !!answer.optionId;
    case "allocate":
      return (
        answer.kind === "allocate" &&
        Object.values(answer.split).reduce((a, b) => a + b, 0) === decision.budget
      );
    case "priority":
      return answer.kind === "priority" && answer.order.length === decision.pick;
    case "conviction":
      return answer.kind === "conviction" && answer.value > 0;
  }
}

export function departmentProgress(
  department: Department,
  answers: Answers,
): { done: number; total: number; pct: number } {
  const decisions = department.sections.flatMap((s) => s.decisions);
  const done = decisions.filter((d) => isAnswered(d, answers[d.id])).length;
  return {
    done,
    total: decisions.length,
    pct: decisions.length ? Math.round((done / decisions.length) * 100) : 0,
  };
}

/** Rupees (or weeks) actually committed across every allocate block. */
export function allocationProgress(
  department: Department,
  answers: Answers,
): { used: number; total: number; pct: number } {
  let used = 0;
  let total = 0;
  for (const section of department.sections) {
    for (const decision of section.decisions) {
      if (decision.kind !== "allocate") continue;
      total += decision.budget;
      const answer = answers[decision.id];
      if (answer?.kind === "allocate") {
        used += Object.values(answer.split).reduce((a, b) => a + b, 0);
      }
    }
  }
  return { used, total, pct: total ? Math.round((used / total) * 100) : 0 };
}

const NEUTRAL: Shape = {
  growth: 24,
  discipline: 24,
  resilience: 24,
  agility: 24,
};

/** Average the shape of everything answered so the radar reacts live. */
export function departmentShape(
  department: Department,
  answers: Answers,
): Shape {
  const collected: Shape[] = [];

  for (const section of department.sections) {
    for (const decision of section.decisions) {
      const answer = answers[decision.id];
      if (!answer) continue;

      if (decision.kind === "choice" && answer.kind === "choice") {
        const option = decision.options.find((o) => o.id === answer.optionId);
        if (option) collected.push(option.shape);
      }

      if (decision.kind === "allocate" && answer.kind === "allocate") {
        const total = Object.values(answer.split).reduce((a, b) => a + b, 0);
        if (total > 0) {
          const weighted: Shape = {
            growth: 0,
            discipline: 0,
            resilience: 0,
            agility: 0,
          };
          for (const channel of decision.channels) {
            const share = (answer.split[channel.id] ?? 0) / total;
            for (const key of SHAPE_ORDER) {
              weighted[key] += channel.shape[key] * share;
            }
          }
          collected.push(weighted);
        }
      }

      if (decision.kind === "conviction" && answer.kind === "conviction") {
        collected.push({
          growth: answer.value * 0.5,
          discipline: 100 - answer.value * 0.4,
          resilience: 50,
          agility: answer.value * 0.7,
        });
      }
    }
  }

  if (collected.length === 0) return NEUTRAL;

  const out: Shape = { growth: 0, discipline: 0, resilience: 0, agility: 0 };
  for (const shape of collected) {
    for (const key of SHAPE_ORDER) out[key] += shape[key];
  }
  for (const key of SHAPE_ORDER) {
    out[key] = Math.round(Math.min(100, out[key] / collected.length));
  }
  return out;
}
