/**
 * TypeScript types for Decision Intelligence Report PDF generation.
 * 
 * These types mirror the backend Pydantic schema in:
 * backend/app/schemas/decision_intelligence_report.py
 */

// ─── Core Metadata ──────────────────────────────────────────────────────────

export interface ReportMetadata {
  company_name: string;
  ceo_name: string;
  source: string;
  generated_date: string;
}

// ─── Page 1: Cover + Decision Maker Profile ────────────────────────────────

export interface CoverPage {
  final_score: number;
  verdict_label: string;
  outcome_quote: string;
  decision_maker_profile: string;
}

// ─── Page 2: Year You Created (Quarterly Timeline) ─────────────────────────

export interface QuarterEntry {
  quarter_number: number;
  quarter_score: number;
  verdict: string;
  decision_text: string;
  consequence_text: string;
  flagged?: boolean;
}

export interface YearCreatedPage {
  quarters: [QuarterEntry, QuarterEntry, QuarterEntry, QuarterEntry];
}

// ─── Page 3: Seven-Dimension Profile ───────────────────────────────────────

export type DimensionType =
  | "long_term_thinking"
  | "capital_allocation"
  | "leadership"
  | "strategic_thinking"
  | "risk_management"
  | "systems_thinking"
  | "adaptability";

export interface DimensionScore {
  dimension: DimensionType;
  dimension_label: string;
  score: number;
  evidence_summary: string;
}

export interface ProfilePage {
  dimensions: [
    DimensionScore,
    DimensionScore,
    DimensionScore,
    DimensionScore,
    DimensionScore,
    DimensionScore,
    DimensionScore,
  ];
}

// ─── Page 4: Biggest Strength Deep-Dive ────────────────────────────────────

export interface StrengthPage {
  strength_dimension: string;
  strength_score: number;
  headline: string;
  evidence_bullets: string[];
  narrative: string;
}

// ─── Page 5: Biggest Decision Risk ─────────────────────────────────────────

export interface RiskPage {
  risk_dimension: string;
  risk_score: number;
  headline: string;
  evidence_bullets: string[];
  narrative: string;
}

// ─── Page 6: Decision That Mattered Most ───────────────────────────────────

export interface DecisionThatMatteredPage {
  quarter: number;
  what_you_knew: string;
  what_you_decided: string;
  what_you_risked: string;
  what_happened: string;
  why_it_mattered: string;
  data_inconsistency_note?: string | null;
}

// ─── Page 7: What You Missed ───────────────────────────────────────────────

export interface MissedOpportunity {
  label: string;
  value: string;
  explanation: string;
}

export interface MissedOpportunitiesPage {
  headline: string;
  opportunities: MissedOpportunity[];
}

// ─── Page 8: Adaptability Table ────────────────────────────────────────────

export interface AdaptabilityRow {
  quarter: number;
  allocation_focus: string;
  changed_from_prior: boolean;
  adaptability_score: number;
}

export interface AdaptabilityPage {
  rows: [AdaptabilityRow, AdaptabilityRow, AdaptabilityRow, AdaptabilityRow];
  summary: string;
}

// ─── Page 9: Decision Signature ────────────────────────────────────────────

export interface DecisionSignaturePage {
  signature_headline: string;
  signature_bullets: string[];
  overall_narrative: string;
}

// ─── Page 10: Final Score Explained ────────────────────────────────────────

export interface ScoreModifier {
  label: string;
  value: number;
  is_positive: boolean;
}

export interface ScoreExplanationPage {
  base_score: number;
  positive_modifiers: ScoreModifier[];
  negative_modifiers: ScoreModifier[];
  final_score: number;
  explanation: string;
}

// ─── Page 11: What Happened to the Company ─────────────────────────────────

export interface CompanyMetric {
  label: string;
  value: string;
  context?: string | null;
}

export interface CompanyOutcomePage {
  outcome_headline: string;
  metrics: CompanyMetric[];
}

// ─── Page 12: Your Next Move ───────────────────────────────────────────────

export interface Recommendation {
  title: string;
  body: string;
}

export interface NextMovePage {
  recommendations: Recommendation[];
}

// ─── Top-Level Report Schema ───────────────────────────────────────────────

export interface DecisionIntelligenceReport {
  metadata: ReportMetadata;
  page_01_cover: CoverPage;
  page_02_year_created: YearCreatedPage;
  page_03_profile: ProfilePage;
  page_04_strength: StrengthPage;
  page_05_risk: RiskPage;
  page_06_decision_that_mattered: DecisionThatMatteredPage;
  page_07_missed_opportunities: MissedOpportunitiesPage;
  page_08_adaptability: AdaptabilityPage;
  page_09_decision_signature: DecisionSignaturePage;
  page_10_score_explained: ScoreExplanationPage;
  page_11_company_outcome: CompanyOutcomePage;
  page_12_next_move: NextMovePage;
}
