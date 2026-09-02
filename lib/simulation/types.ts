/**
 * Shapes for the Nadi Wear simulation. These mirror the objects the shipped
 * `NadiWear.html` bundle passed around; names are spelled out, structure is unchanged.
 */

export type DeptId =
  | "marketing"
  | "sales"
  | "engineering"
  | "operations"
  | "support"
  | "admin";

export type ProductId = "pulse" | "pro";

export type ProductStatus = "active" | "paused" | "discontinued";

export type WarrantyId = "6mo" | "1yr" | "2yr";

export type PayTermsId = "advance" | "net30" | "net60";

export type ArchetypeId =
  | "price_war"
  | "blitz"
  | "leapfrog"
  | "supply"
  | "demand_shift"
  | "trust";

export type StrategyId = "fight" | "differentiate" | "focus" | "learn" | "exploit";

export type DiagnosisId =
  | "price"
  | "differentiation"
  | "demand"
  | "capacity"
  | "supply"
  | "retention"
  | "cash"
  | "segment"
  | "quality";

export type PriorityId =
  | "grow"
  | "cash"
  | "product"
  | "ops"
  | "retain"
  | "risk"
  | "longterm";

/**
 * Quarter-start checkpoint: captures timer, cash, and budget ceiling when a quarter begins.
 * Stored in opening_state JSONB for rewind restoration.
 */
export type QuarterCheckpoint = {
  timerRemaining: number;    // Seconds remaining when quarter began
  cashBalance: number;        // Cash at quarter start (for verification)
  budgetCeiling: number;      // Available spend at quarter start
  createdAt: string;          // ISO timestamp (for debugging)
};

export type Tone = "good" | "watch" | "bad" | "flat";

export type LineKind = "opex" | "capex" | "finIn" | "finOut" | "count";

/** Every spend/count line, keyed by line id. Values are strings because they come from inputs. */
export type Alloc = Record<string, string>;

/** The same lines coerced to numbers (lakhs for spend, headcount for hire_/fire_). */
export type NumericAlloc = Record<string, number>;

export type ProductState = {
  live: boolean;
  status: ProductStatus;
  price: number;
  /** Requested share of the production line, 0-100. */
  share: number;
  /** Units in stock. */
  inv: number;
  /** Weighted-average cost of that stock. */
  invCost: number;
};

export type Aftermath = {
  note?: string;
  priceCut?: number;
  cogsDrag?: number;
  brandBonus?: number;
  reachMult?: number;
  repeatBonus?: number;
  vulnRelief?: number;
  shareCarry?: number;
  refShift?: number;
};

export type CrisisLogEntry = {
  q: number;
  archetype: ArchetypeId;
  name: string;
  level: number;
  vuln: number;
  diagnosis: DiagnosisId | null;
  trueDiagnosis: DiagnosisId;
  strategy: StrategyId | null;
  commit: number;
  protectedBy: string[];
  exposedBy: string[];
  shareBefore: number;
  shareAfter: number;
  gm: number;
  custLost: number;
  unitsSold: number;
  note: string;
};

/** The company between quarters. Everything the engine needs to run the next one. */
export type CompanyState = {
  quarter: number;
  cash: number;
  /** A signed Q4 "Path A" rescue cheque, raised but not yet swept into cash. Zero outside
   * that one case. */
  pendingInvestment: number;
  ar: number;
  ap: number;
  debt: number;
  equipment: number;
  ip: number;
  retainedEarnings: number;
  installedCapacity: number;
  staff: Record<DeptId, number>;
  products: Record<ProductId, ProductState>;
  innovations: string[];
  pipeline: Record<string, number>;
  // Quarter number -> that quarter's Pre-Launch Buzz gain. Only the two most recent entries
  // are ever live -- see `buzzFree`/`buzzConvBonus` on `QuarterResultShape`.
  buzzHist: Record<number, number>;
  customers: number;
  priorUnits: number;
  brand: number;
  seo: number;
  quality: number;
  innovation: number;
  npd: number;
  supplierRel: number;
  logisticsEff: number;
  empSat: number;
  empEng: number;
  compliance: number;
  forecast: number;
  audit: number;
  satisfaction: number;
  repeatRate: number;
  attrition: number;
  arDays: number;
  payTerms: PayTermsId;
  overhead: number;
  marketShare: number;
  fillRate: number;
  priorDemand: number;
  lastGM: number;
  lastNetCF: number;
  revHistory: number[];
  lastMix: Record<string, number>;
  aftermath: Aftermath;
  crisisLog: CrisisLogEntry[];
  wcBreached: boolean;
  everInsolvent: boolean;
  /** Quarter-start checkpoint for rewind restoration (optional, only present when captured) */
  checkpoint?: QuarterCheckpoint;
};

export type CrisisInput = {
  variant?: ArchetypeId;
  diagnosis: DiagnosisId | null;
  reasoning: string;
  strategy: StrategyId | null;
  /** Lakhs, as typed. */
  commit: string;
};

export type CrisisSituation = {
  arch: { id: ArchetypeId; name: string };
  factors: Record<string, number>;
  vuln: number;
  level: number;
  shield: number;
  protectedBy: string[];
  exposedBy: string[];
};

/**
 * The full result of running one quarter. The engine returns ~180 fields; every screen
 * reads from this object, so it is deliberately wide rather than nested.
 */
export type QuarterResult = Record<string, never> extends never
  ? QuarterResultShape
  : never;

export type QuarterResultShape = {
  q: number;
  A: NumericAlloc;
  warranty: WarrantyId;
  notes: string[];
  neutralised: boolean;
  /** Optional because the engine does not send it: the terms in force are read off
   *  `next.payTerms` through `PAY_TERMS`. Kept in the shape for the ported screens that still
   *  reach for it, but every read has to cope with it being absent. */
  terms?: { id: PayTermsId; name: string; days: number; cogsMult: number; rel: number; note: string };
  entering: CompanyState;
  next: CompanyState;
  P: Record<ProductId, ProductState>;
  /** Also not sent: the engine reports `crisisVariant`/`crisisStrategy` as flat fields. */
  crisis?: { variant: ArchetypeId; choice: StrategyId | null } | null;
  situation: CrisisSituation | null;
  staffing: Record<DeptId, number>;
  need: Record<DeptId, number>;
  effHeads: Record<DeptId, number>;
  shortRoles: { id: DeptId; name: string; ifShort: string; ifCut: string }[];
  priceInfo: Record<ProductId, { ref: number; price: number; listPrice: number; cut: number; mult: number; premium: number }>;
  effPrice: Record<ProductId, number>;
  demand: Record<ProductId, number>;
  avail: Record<ProductId, number>;
  sold: Record<ProductId, number>;
  invOut: Record<ProductId, number>;
  revenue: Record<ProductId, number>;
  unitCost: Record<ProductId, number>;
  wac: Record<ProductId, number>;
  built: Record<ProductId, number>;
  rivalState: { id: string; name: string; pos: string; strength: number; note: string }[];
  started: string[];
  landed: string[];
  pipeline: Record<string, number>;
  ownedInno: string[];
  // Everything else is a plain number/boolean; typed loosely so the port stays readable.
  [key: string]: unknown;
};

export type Reflection = {
  constraint?: string;
  sacrifice?: string[];
  risk?: string;
  expect?: string;
  note?: string;
};

export type ConstraintEntry = {
  id: string;
  label: string;
  rank?: number;
  why?: string;
  impact?: string;
  next?: string;
};

export type Constraint = {
  primary: ConstraintEntry;
  all: ConstraintEntry[];
};

export type ScoreSub = {
  label: string;
  level: "full" | "part" | "none";
  detail: string;
  points: number;
};

export type ScoreTrait = {
  name: string;
  weight: number;
  subs: ScoreSub[];
  points: number;
};

export type Modifier = { d: number; why: string };

export type QuarterScore = {
  traits: ScoreTrait[];
  traitTotal: number;
  mods: Modifier[];
  modTotal: number;
  final: number;
  band: string;
};

export type TermSheetOffer = {
  id: "A" | "B" | "C";
  kind: "invest" | "acquire" | "solo";
  title: string;
  who: string;
  pitch: string;
  terms: [string, string][];
  price?: number;
  investment?: number;
  equity?: number;
  covenant?: number;
  hitMult?: number;
  missHaircut?: number;
  ratchet?: number;
};

export type TermSheet = {
  tier: "THRIVING" | "STABLE" | "DISTRESSED";
  V: number;
  M: number;
  trueContinuation: number;
  offers: TermSheetOffer[];
  q1: QuarterResultShape;
  q2: QuarterResultShape;
  q3: QuarterResultShape;
};

export type EndgameOutcome = {
  deal: "A" | "B" | "C";
  offer: TermSheetOffer | undefined;
  mods: Modifier[];
  ended?: boolean;
  price?: number;
  trueContinuation?: number;
  gap?: number;
  finalValuation?: number;
  covenantHit?: boolean;
  covenant?: number;
  equity?: number;
  gameOver?: boolean;
};

export type CEOBand = "Exceptional" | "Strong" | "Competent" | "Weak" | "Poor";

export type FinalReport = {
  tier: "THRIVING" | "STABLE" | "DISTRESSED";
  tierReason: string;
  ceoBand: CEOBand;
  finalScore: number;
  traitTotal: number;
  modTotal: number;
  traits: ScoreTrait[];
  mods: Modifier[];
  finalValuation: number;
  totalUnitsSold: number;
  totalRevenue: number;
  totalProfit: number;
  finalCash: number;
  finalMarketShare: number;
  quarterScores: QuarterScore[];
  endgameOutcome?: EndgameOutcome;
  termSheet?: TermSheet;
  gameOver: boolean;
};

/** One quarter's committed decisions, replayable end-to-end. */
export type QuarterLogEntry = {
  q: number;
  alloc: Alloc;
  warranty: WarrantyId;
  payTerms: PayTermsId;
  startInno: string[];
  products: Record<ProductId, ProductState>;
  priority: PriorityId | null;
  reflection: Reflection;
  crisis: CrisisInput | null;
};

export type InboxMessage = {
  from: string;
  name: string;
  role: string;
  tone: "critical" | "warning" | "info";
  subject: string;
  body: string;
  action: boolean;
};

export type Readiness = {
  id: string;
  label: string;
  level: string;
  note: string;
};

export type HealthBar = {
  key: string;
  label: string;
  value: number;
  note: string;
  tone: Tone;
};

export type Budget = {
  opex: number;
  capex: number;
  inno: number;
  people: number;
  repay: number;
  drawn: number;
  /** A term sheet signed but not yet banked: it raises the ceiling before the cash arrives. */
  investment: number;
  committed: number;
  ceiling: number;
};

/** Context handed to every spend line's live preview. */
export type PreviewCtx = {
  s: CompanyState;
  A: NumericAlloc;
  alloc: Alloc;
  mk: number;
  sl: number;
  en: number;
  op: number;
  sp: number;
  ad: number;
};
