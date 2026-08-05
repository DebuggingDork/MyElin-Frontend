import type { Accent } from "@/components/ui/Kit";

/* ────────────────────────────────────────────────────────────────
   Quarter flow — types mirroring the backend contract.
   Decisions are STAGED into a QuarterDraft; nothing mutates company
   state until the single "Run Quarter" action (run_quarter()).
   ──────────────────────────────────────────────────────────────── */

export type WorkspaceId =
  | "finance"
  | "marketing"
  | "product"
  | "sales"
  | "operations"
  | "cx";

export const WORKSPACE_ORDER: WorkspaceId[] = [
  "finance",
  "marketing",
  "product",
  "sales",
  "operations",
  "cx",
];

/** Maps 1:1 to the backend's CompanyState response body. */
export type CompanyState = {
  cash_available: number; // lakhs
  monthly_burn: number;
  quarterly_burn: number;
  cash_runway_months: number;
  valuation: number; // lakhs
  investor_confidence_score: number; // 0–100
  current_quarter: number;
  run_status: RunStatus | null; // previous quarter, if any
};

export type RunStatus = "COMPLETED" | "DISTRESSED" | "FAILED";

/* ── decision catalog ───────────────────────────────────────────── */

export type DecisionValue =
  | number
  | string
  | boolean
  | string[]
  | Record<string, number>;

export type InputKind =
  | "allocation" // distribute a total across named buckets (FIN-001)
  | "spend" // currency/lakhs slider
  | "percent" // 0–100 slider
  | "dropdown"
  | "multiselect"
  | "toggle"
  | "choice-cards" // pick exactly one card
  | "rank"; // drag/priority order

export type DecisionDef = {
  id: string;
  label: string;
  input: InputKind;
  brief?: string;
  /** Downstream chip row — display only, effects are computed server-side. */
  affects: string[];
  /** Dropdown / multiselect / choice-card / rank options. */
  options?: { id: string; label: string; hint?: string }[];
  /** Spend / percent bounds. */
  max?: number;
  step?: number;
  unit?: "L" | "%";
  /** Allocation buckets (FIN-001). */
  buckets?: { id: string; label: string; accent: Accent }[];
  /** Total to distribute for allocation inputs, in lakhs. */
  allocationTotal?: number;
  /** Confirmed backend gap — render input disabled with a "formula pending" badge. */
  pending?: string;
  /** Not forced every quarter (e.g. FIN-005 debt drawdown). */
  optional?: boolean;
  /** Ids of earlier decisions this one is gated on (Product pipeline). */
  dependsOn?: string[];
  /** Section header used to group cards inside a workspace. */
  group?: string;
};

export type WorkspaceCatalog = {
  id: WorkspaceId;
  name: string;
  owner: string;
  accent: Accent;
  tagline: string;
  /** Whole workspace is a shell awaiting a backend catalog/formulas. */
  shell?: string;
  decisions: DecisionDef[];
};

/* ── narrative events ───────────────────────────────────────────── */

export type MarketEvent = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  severity: "info" | "warning" | "critical";
};

export type RecurringCost = { label: string; amount: number };

/* ── draft state (what the UI PATCHes as the student works) ─────── */

export type WorkspaceStatus = "not_started" | "in_progress" | "complete";

export type QuarterDraft = {
  quarter_number: number;
  decisions: Partial<Record<WorkspaceId, Record<string, DecisionValue>>>;
};

/* ── pre-flight (FIN-015 approval screen) ───────────────────────── */

export type PreflightFlag = {
  id: string;
  label: string;
  detail: string;
  level: "green" | "yellow" | "red";
};

/* ── results (run_quarter response) ─────────────────────────────── */

export type GateTriggered = {
  gate_name: string;
  description: string;
  impact_note: string;
};

export type SubCriterion = {
  text: string;
  status: "met" | "partial" | "missed";
};

export type TraitScore = {
  name: string;
  weight: number;
  points_earned: number;
  narrative?: string; // Leadership carries an LLM-judged justification
  sub_criteria: SubCriterion[];
};

export type Modifier = { points: number; reason: string };

export type BalanceSheet = {
  assets: { label: string; amount: number }[];
  liabilities: { label: string; amount: number }[];
  net_worth: number;
};

export type BusinessImpact = {
  units_sold: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  warranty_cost: number;
  inventory_holding_cost: number;
  fixed_costs: number;
  discretionary_spend: number;
  net_cash_flow: number;
  cash_balance: number;
  valuation: number;
  balance_sheet: BalanceSheet;
};

export type QuarterResult = {
  run_id: string;
  result_hash: string;
  run_status: RunStatus;
  business_impact: BusinessImpact;
  gates_triggered: GateTriggered[];
  scoring: {
    final_score: number;
    band: string;
    traits: TraitScore[];
    modifiers: Modifier[];
  };
};

/* ── endgame (Q3+) ──────────────────────────────────────────────── */

export type Tier = "Thriving" | "Stable" | "Distressed";

export type TermSheet = {
  id: string;
  name: string;
  pitch: string;
  fine_print: string;
};

/* ── helpers ────────────────────────────────────────────────────── */

export function isDecisionSet(value: DecisionValue | undefined): boolean {
  if (value === undefined) return false;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") return value.length > 0;
  if (typeof value === "boolean") return true; // toggles count once touched
  if (Array.isArray(value)) return value.length > 0;
  return Object.values(value).some((n) => n > 0);
}

/** Decisions that count toward completion: not pending-stubbed, not optional. */
export function requiredDecisions(catalog: WorkspaceCatalog): DecisionDef[] {
  return catalog.decisions.filter((d) => !d.pending && !d.optional);
}

export function workspaceStatus(
  catalog: WorkspaceCatalog,
  values: Record<string, DecisionValue> | undefined,
): WorkspaceStatus {
  const required = requiredDecisions(catalog);
  if (required.length === 0) return "complete"; // pure shell workspaces
  const set = required.filter((d) => isDecisionSet(values?.[d.id])).length;
  if (set === 0) return "not_started";
  return set === required.length ? "complete" : "in_progress";
}

export function decisionsSetCount(
  catalog: WorkspaceCatalog,
  values: Record<string, DecisionValue> | undefined,
): { done: number; total: number } {
  const required = requiredDecisions(catalog);
  return {
    done: required.filter((d) => isDecisionSet(values?.[d.id])).length,
    total: required.length,
  };
}

/* ── formatting (client-side display only) ──────────────────────── */

export function formatLakhs(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 100) {
    const cr = abs / 100;
    return `${sign}₹${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`;
  }
  return `${sign}₹${Number.isInteger(abs) ? abs : abs.toFixed(1)} L`;
}

/** Full-precision rupee line for report ledgers, e.g. ₹56,15,653. */
export function formatRupees(lakhs: number): string {
  const sign = lakhs < 0 ? "−" : "";
  return `${sign}₹${Math.round(Math.abs(lakhs) * 100000).toLocaleString("en-IN")}`;
}
