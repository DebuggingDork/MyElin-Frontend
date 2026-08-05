/** Core simulation model — mock data today, API-backed later. */

export type MetricKey =
  | "cash"
  | "revenue"
  | "customers"
  | "employees"
  | "morale"
  | "share"
  | "trust"
  | "burn";

/** All money values are in ₹ lakh. */
export type Metrics = Record<MetricKey, number>;

export type DimensionKey =
  | "strategy"
  | "judgment"
  | "risk"
  | "adaptability"
  | "leadership"
  | "uncertainty";

export type Dimensions = Record<DimensionKey, number>;

export type MetricEffects = Partial<Metrics>;
export type DimensionEffects = Partial<Dimensions>;

export type Severity = "critical" | "high" | "medium";

export type SelectOption = {
  id: string;
  label: string;
  hint: string;
  effects: MetricEffects;
  scores: DimensionEffects;
  /** Shown during consequence resolution. */
  consequence: string;
  /** Surfaces 1–2 quarters later. */
  delayed?: string;
};

export type AllocationChannel = {
  id: string;
  label: string;
  hint: string;
  /** Metric effect per ₹10 lakh allocated. */
  perUnit: MetricEffects;
  /** Dimension effect per ₹10 lakh allocated. */
  perUnitScores: DimensionEffects;
  /** Diminishing returns kick in above this allocation (₹ lakh). */
  saturates: number;
};

export type DecisionBlock =
  | {
      kind: "select";
      id: string;
      title: string;
      prompt: string;
      severity: Severity;
      owner: string;
      options: SelectOption[];
    }
  | {
      kind: "allocate";
      id: string;
      title: string;
      prompt: string;
      severity: Severity;
      owner: string;
      /** Total spend available this quarter (₹ lakh). */
      budget: number;
      step: number;
      channels: AllocationChannel[];
    }
  | {
      kind: "confidence";
      id: string;
      title: string;
      prompt: string;
      severity: Severity;
      owner: string;
      /** Hidden truth 0–100; calibration is scored against it. */
      truth: number;
      reveal: string;
    };

export type Signal = {
  label: string;
  value: string;
  tone: "up" | "down" | "flat";
};

export type Quarter = {
  id: string;
  index: number;
  label: string;
  headline: string;
  /** Console lines typed out during the brief. */
  brief: string[];
  situation: string;
  /** Visible board of context readings. */
  signals: Signal[];
  /** Not shown until resolution. */
  hidden: string[];
  blocks: DecisionBlock[];
};

export type Level = {
  id: "foundation" | "pressure";
  name: string;
  tier: string;
  blurb: string;
  difficulty: "Easy" | "Hard";
  company: {
    name: string;
    stage: string;
    sector: string;
    founded: string;
    location: string;
    mandate: string;
    dossier: string[];
  };
  start: Metrics;
  quarters: Quarter[];
};

export type BlockAnswer =
  | { kind: "select"; optionId: string }
  | { kind: "allocate"; split: Record<string, number> }
  | { kind: "confidence"; value: number };

export type QuarterAnswers = Record<string, BlockAnswer>;

export type ResolvedLine = {
  text: string;
  tone: "ok" | "warn" | "bad" | "info";
};

export type QuarterResult = {
  quarterId: string;
  before: Metrics;
  after: Metrics;
  delta: MetricEffects;
  scores: Dimensions;
  lines: ResolvedLine[];
  delayed: string[];
  grade: string;
};
