/** Exact shapes mirrored from MyElin-Backend OpenAPI / Pydantic schemas. */

export type Move =
  | "open_next_quarter"
  | "submit_allocation"
  | "submit_crisis_allocation"
  | "submit_endgame_decision"
  | "lock_quarter"
  | "read_quarter_report"
  | "read_endgame_preview";

export type RunStatus = "active" | "distressed" | "failed" | "completed";
export type QuarterStatus = "in_progress" | "closed";
export type Tier = "thriving" | "stable" | "distressed";
export type CrisisChoice = "A" | "B" | "C" | "D";
export type EndgamePath = "A" | "B" | "C";
export type CriterionResult = "clearly_met" | "partially_met" | "not_met";

/** Backend money fields arrive as Decimal JSON strings. */
export type Money = string | number;

export type AuthResponse = {
  access_token: string;
  refresh_token: string | null;
  user_id: string;
  email: string;
};

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string };

export type CompanyCreate = {
  name: string;
  scenario_id?: string | null;
  company_id?: string | null;
};

export type ScenarioResponse = {
  scenario_id: string;
  display_name: string;
  total_quarters: number;
  crisis_quarter: number | null;
};

export type QuarterSummary = {
  id: string;
  number: number;
  status: QuarterStatus;
  cash_balance: Money;
  revenue: Money;
};

export type CompanyDetailResponse = {
  id: string;
  created_at: string;
  name: string;
  scenario_id: string;
  seed_name: string;
  profile_name: string;
  owner_id: string | null;
  run_status: RunStatus;
  survival_condition: string | null;
  survival_detail: string | null;
  scenario: ScenarioResponse;
  quarters: QuarterSummary[];
};

export type MetricSchema = {
  value: Money;
  delta: Money | null;
};

export type BindingConstraintSchema = {
  gate: string;
  demand_lost: Money;
  demand_lost_unit: string;
  detail: string;
};

export type ScoreTrajectoryPoint = {
  quarter_number: number;
  ceo_score: Money;
  band: string;
};

export type EndgamePreviewResponse = {
  tier: Tier;
  tier_detail: string;
  momentum_score: Money;
  term_sheet_menu: {
    path_a_name: string;
    path_b_name: string;
    path_c_name: string;
  };
  covenant_units: Money;
  true_continuation_value_inr: Money;
  acquisition_trap_offer_inr: Money | null;
};

export type RunStateResponse = {
  company_id: string;
  run_status: RunStatus;
  total_quarters: number;
  crisis_quarter: number | null;
  current_quarter_id: string | null;
  current_quarter_number: number | null;
  current_quarter_status: QuarterStatus | null;
  legal_moves: Move[];
  binding_constraint_hint: BindingConstraintSchema[];
  score_trajectory: ScoreTrajectoryPoint[];
  endgame_preview: EndgamePreviewResponse | null;
};

export type QuarterDetailResponse = {
  id: string;
  company_id: string;
  number: number;
  status: QuarterStatus;
  cash_balance: Money;
  revenue: Money;
  created_at: string;
  closed_at: string | null;
  modifiers: Record<string, number>;
  allocations: Record<string, Money> | null;
  warranty_years: number | null;
  crisis: Record<string, Money | string | null> | null;
};

export type MarketingAllocationSubmit = {
  google_ads?: Money;
  meta_ads?: Money;
  social_influencer?: Money;
  content_seo?: Money;
  events_pr?: Money;
  email_marketing?: Money;
  referral?: Money;
  prelaunch_buzz?: Money;
};

export type SalesAllocationSubmit = {
  reps?: Money;
  crm_tools?: Money;
  onboarding?: Money;
};

export type RndAllocationSubmit = {
  quality_qa?: Money;
  innovation?: Money;
  warranty_years?: number;
};

export type OperationsAllocationSubmit = {
  manufacturing?: Money;
  supplier_qc?: Money;
  logistics?: Money;
};

export type HrAllocationSubmit = {
  culture_benefits?: Money;
  training_development?: Money;
  cx_team?: Money;
};

export type FinanceAdminAllocationSubmit = {
  compliance_legal?: Money;
  financial_planning?: Money;
  audit_prep?: Money;
};

export type CrisisAllocationSubmit = {
  crisis_choice?: CrisisChoice | null;
  price_match_fund?: Money;
  comparison_ads?: Money;
  retention_offers?: Money;
  emergency_supply_fund?: Money;
  crisis_choice_d_spend?: Money;
};

export type QuarterAllocationResponse = {
  id: string;
  created_at: string;
  quarter_id: string;
  google_ads: Money;
  meta_ads: Money;
  social_influencer: Money;
  content_seo: Money;
  events_pr: Money;
  email_marketing: Money;
  referral: Money;
  prelaunch_buzz: Money;
  reps: Money;
  crm_tools: Money;
  onboarding: Money;
  quality_qa: Money;
  innovation: Money;
  warranty_years: number;
  manufacturing: Money;
  supplier_qc: Money;
  logistics: Money;
  culture_benefits: Money;
  training_development: Money;
  cx_team: Money;
  compliance_legal: Money;
  financial_planning: Money;
  audit_prep: Money;
  crisis_choice: CrisisChoice | null;
  price_match_fund: Money;
  comparison_ads: Money;
  retention_offers: Money;
  emergency_supply_fund: Money;
  crisis_choice_d_spend: Money;
};

export type CompanyOutcomeSchema = {
  units_sold: MetricSchema;
  revenue_inr: MetricSchema;
  cogs_inr: MetricSchema;
  gross_profit_inr: MetricSchema;
  net_cash_flow_inr: MetricSchema;
  closing_cash_inr: MetricSchema;
  cash_runway_quarters: MetricSchema | null;
  cash_runway_gap_reason: string | null;
  valuation_inr: MetricSchema | null;
  valuation_gap_reason: string | null;
};

export type ModifierLineSchema = {
  id: string;
  points: Money;
  fired: boolean;
  applied_points: Money;
  detail: string;
};

export type ScoredCriterionSchema = {
  id: string;
  trait: string;
  result: CriterionResult;
  points: Money | null;
  detail: string;
};

export type UnscoredCriterionSchema = {
  id: string;
  trait: string;
  reason: string;
};

export type DecisionQualitySchema = {
  ceo_score: Money;
  band: string;
  mechanical_points_available: Money;
  unscored_points: Money;
  modifiers: ModifierLineSchema[];
  scored_criteria: ScoredCriterionSchema[];
  unscored_criteria: UnscoredCriterionSchema[];
};

export type EvidenceObservationSchema = {
  department: string | null;
  evidence_key: string;
  value: unknown;
  detail: string;
  weight: Money | null;
  weight_status: string;
};

export type RunSummarySchema = {
  score_trajectory: ScoreTrajectoryPoint[];
  final_valuation_inr: Money | null;
  terminal_status: RunStatus;
};

export type QuarterReportResponse = {
  company_id: string;
  quarter_id: string;
  quarter_number: number;
  outcome: CompanyOutcomeSchema;
  binding_constraints: BindingConstraintSchema[];
  decision_quality: DecisionQualitySchema;
  evidence: Record<string, EvidenceObservationSchema[]>;
  run_status: RunStatus;
  survival_triggered_by: string | null;
  survival_detail: string | null;
  run_summary: RunSummarySchema | null;
};

export type EndgameDecisionSubmit = {
  path: EndgamePath;
  term_sheet_name: string;
  reasoning?: string | null;
};

export type EndgameDecisionResponse = {
  id: string;
  company_id: string;
  quarter_id: string;
  path: EndgamePath;
  term_sheet_name: string;
  reasoning: string | null;
};

export type LeaderboardEntry = {
  company_id: string;
  quarter_id: string;
  quarter_number: number;
  overall_score: number | null;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
};

export type ApiErrorBody = {
  error?: string;
  reason?: string;
  attempted_move?: string;
  allowed_moves?: Move[];
  detail?: string | { msg: string }[];
};

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(
      body.error ??
        (typeof body.detail === "string" ? body.detail : `HTTP ${status}`),
    );
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
