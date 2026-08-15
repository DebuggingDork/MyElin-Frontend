/**
 * Every fixed table the Nadi Wear simulation runs on, ported verbatim from the shipped
 * `NadiWear.html` bundle: departments and their salary/ramp costs, the two products, the
 * innovation board, supplier terms, competitors, the six market-event archetypes, the
 * response strategies, the priorities, the teaching notes and the two allocation surfaces
 * (grouped "decisions" and the underlying detailed lines with their published formulas).
 *
 * Nothing here is invented. Where a number looks odd it is the number the original ran on.
 */

import { clamp, cr, inr, lakh, n0, n1, n2, num, pct, pw } from "@/lib/nadi/format";
import type {
  ArchetypeId,
  CompanyState,
  DeptId,
  DiagnosisId,
  PayTermsId,
  PreviewCtx,
  PriorityId,
  ProductId,
  StrategyId,
  Tone,
  WarrantyId,
} from "@/lib/nadi/types";

/* ── scale constants ──────────────────────────────────────────────── */

/** The working-capital buffer the board set. Closing below it is a breach. */
export const BUFFER = 1e6;
/** Total addressable customers in the category. */
export const MARKET_CUSTOMERS = 250000;
/** Fixed "other liabilities" line. */
export const OTHER_LIABILITIES = 1.2e6;
/** Share capital -- the seed round. */
export const SHARE_CAPITAL = 4e7;
/** Opening overhead per quarter. */
export const OPENING_OVERHEAD = 250000;
export const DEPRECIATION_RATE = 0.05;
export const AMORTISATION_RATE = 0.08;
export const INTEREST_RATE = 0.035;
export const MIN_AR = 8e5;
/** Price elasticity exponent. */
export const PRICE_ELASTICITY = 1.2;
/** Category growth per quarter. */
export const CATEGORY_GROWTH = 0.05;
export const OPENING_CASH = 1.5e7;

const MARKET_SHARE_BY_QUARTER = [0.048, 0.054, 0.061, 0.068];

/** Units the whole category buys in quarter `q`. */
export const marketDemand = (q: number): number =>
  MARKET_CUSTOMERS * MARKET_SHARE_BY_QUARTER[clamp(Math.round(q), 1, 4) - 1];

/* ── competitors ──────────────────────────────────────────────────── */

export const COMPETITORS = [
  { id: "kalpa", name: "Kalpa Labs", pos: "Value", strength: 52, note: "Shenzhen-backed, undercuts everyone on price." },
  { id: "vega", name: "Vega Health", pos: "Mass market", strength: 46, note: "Outspends the category on media and celebrity." },
  { id: "zenith", name: "Zenith", pos: "Premium", strength: 58, note: "Ships the feature everyone else copies next year." },
  { id: "tail", name: "The long tail", pos: "Unbranded", strength: 84, note: "Dozens of white-label brands on the marketplaces." },
] as const;

/* ── departments ──────────────────────────────────────────────────── */

export type Department = {
  id: DeptId;
  name: string;
  salary: number;
  hire: number;
  sever: number;
  base: number;
  drives: string;
  ifShort: string;
  ifCut: string;
};

export const DEPARTMENTS: Department[] = [
  {
    id: "marketing",
    name: "Marketing",
    salary: 130000,
    hire: 200000,
    sever: 240000,
    base: 2,
    drives: "Campaign execution",
    ifShort: "Campaigns run late and untuned. Every lead you paid for is discounted by the shortfall.",
    ifCut: "Leads fall immediately, in the same quarter, across every channel you funded.",
  },
  {
    id: "sales",
    name: "Sales & field",
    salary: 120000,
    hire: 180000,
    sever: 220000,
    base: 4,
    drives: "Selling capacity",
    ifShort: "Leads arrive and sit unworked. Capacity is throttled to the staffing you actually have.",
    ifCut: "Selling capacity drops the same quarter and leads spill unconverted.",
  },
  {
    id: "engineering",
    name: "Engineering & product",
    salary: 175000,
    hire: 300000,
    sever: 320000,
    base: 3,
    drives: "R&D output and the conversion ceiling",
    ifShort: "Quality, innovation and new product work all deliver less than you paid for.",
    ifCut: "The product stops improving. The conversion ceiling stalls while sales keeps pushing against it.",
  },
  {
    id: "operations",
    name: "Operations & production",
    salary: 115000,
    hire: 160000,
    sever: 200000,
    base: 3,
    drives: "Production throughput",
    ifShort: "The line runs below the capacity you own. You build fewer units than the plant allows.",
    ifCut: "Production falls even though the plant is unchanged. Unmet demand appears immediately.",
  },
  {
    id: "support",
    name: "Support & success",
    salary: 95000,
    hire: 130000,
    sever: 165000,
    base: 1,
    drives: "Satisfaction and repeat purchase",
    ifShort: "Satisfaction and onboarding spend under-deliver, and repeat buying slows.",
    ifCut: "Customer satisfaction falls, taking conversion and repeat purchases with it.",
  },
  {
    id: "admin",
    name: "Finance & admin",
    salary: 140000,
    hire: 200000,
    sever: 250000,
    base: 1,
    drives: "Compliance, audit and financial control",
    ifShort: "Governance spend under-delivers and penalty risk stays high.",
    ifCut: "Compliance and audit readiness stop improving. Penalty exposure rises.",
  },
];

export const DEPT_IDS = DEPARTMENTS.map((d) => d.id);
export const BASE_STAFF = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d.base]),
) as Record<DeptId, number>;

/**
 * How much spend each function can absorb per head. `keys` are the lines that draw on it;
 * `per` is the rupees of spend one person can carry in a quarter.
 */
export const DEPT_LOAD: Record<DeptId, { keys: string[]; per: number }> = {
  marketing: {
    keys: ["google", "meta", "social", "content", "events", "email", "direct", "referral", "prelaunch"],
    per: 1595000,
  },
  sales: { keys: ["reps", "crm", "onboarding", "salesTraining", "channel"], per: 1377500 },
  engineering: { keys: ["quality", "npd", "design"], per: 1595000 },
  operations: { keys: ["production", "capex", "supplier", "logistics", "warehouse"], per: 1885000 },
  support: { keys: ["cx", "onboarding"], per: 1160000 },
  admin: { keys: ["compliance", "planning", "audit", "workingCapital", "treasury"], per: 1305000 },
};

/* ── products ─────────────────────────────────────────────────────── */

export const PRODUCTS = [
  {
    id: "pulse" as ProductId,
    name: "Nadi Pulse",
    refPrice: 9999,
    cogs: 3250,
    capacityCost: 1,
    blurb: "The original. Volume product, thin margin, carries the brand.",
  },
  {
    id: "pro" as ProductId,
    name: "Nadi Pulse Pro",
    refPrice: 14999,
    cogs: 5200,
    capacityCost: 1.4,
    blurb: "Higher price, higher margin, and it eats 1.4 units of line capacity for every one built.",
  },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<
  ProductId,
  (typeof PRODUCTS)[number]
>;

/* ── the innovation board ─────────────────────────────────────────── */

export type InnovationEffect = {
  ceiling?: number;
  innovation?: number;
  quality?: number;
  brand?: number;
  satisfaction?: number;
  repeat?: number;
  cogs?: number;
};

export type Innovation = {
  id: string;
  cat: string;
  name: string;
  cost: number;
  lead: number;
  effect: InnovationEffect;
  blurb: string;
};

export const INNOVATIONS: Innovation[] = [
  {
    id: "app",
    cat: "Software",
    name: "Redesigned companion app",
    cost: 900000,
    lead: 0,
    effect: { innovation: 6, satisfaction: 5, repeat: 2 },
    blurb: "The complaint in every review. Cheap to fix, and it moves satisfaction and repeat buying.",
  },
  {
    id: "sleep",
    cat: "Software",
    name: "Sleep and recovery scoring",
    cost: 1100000,
    lead: 0,
    effect: { ceiling: 3, innovation: 7, repeat: 2 },
    blurb: "The feature buyers compare on. Pure software, no bill of materials.",
  },
  {
    id: "coach",
    cat: "Software",
    name: "On-device AI health coach",
    cost: 2600000,
    lead: 1,
    effect: { ceiling: 5, innovation: 10, repeat: 3, brand: 4 },
    blurb: "A quarter to ship. The one feature reviewers would lead with.",
  },
  {
    id: "ecg",
    cat: "Sensors",
    name: "ECG & SpO₂ sensor suite",
    cost: 1800000,
    lead: 1,
    effect: { ceiling: 4, innovation: 8, quality: 3, cogs: 220 },
    blurb: "Medical-grade credibility. Adds ₹220 to every unit you build, forever.",
  },
  {
    id: "gnss",
    cat: "Sensors",
    name: "Multi-band GNSS positioning",
    cost: 1500000,
    lead: 0,
    effect: { ceiling: 3, innovation: 5, cogs: 300 },
    blurb: "Opens the running and cycling segment. The most expensive component on this board.",
  },
  {
    id: "temp",
    cat: "Sensors",
    name: "Skin temperature sensing",
    cost: 800000,
    lead: 0,
    effect: { ceiling: 2, innovation: 4, cogs: 120 },
    blurb: "Small, cheap, and it fills a line on the comparison table.",
  },
  {
    id: "amoled",
    cat: "Hardware",
    name: "AMOLED always-on display",
    cost: 1200000,
    lead: 0,
    effect: { ceiling: 2, brand: 5, satisfaction: 3, cogs: 250 },
    blurb: "The first thing anyone notices in a shop. Costs ₹250 a unit to keep.",
  },
  {
    id: "battery",
    cat: "Hardware",
    name: "14-day battery platform",
    cost: 2000000,
    lead: 1,
    effect: { ceiling: 4, quality: 5, satisfaction: 4 },
    blurb: "A platform change, not a part swap. A quarter of engineering, no unit cost.",
  },
  {
    id: "titanium",
    cat: "Hardware",
    name: "Titanium & sapphire build",
    cost: 1600000,
    lead: 0,
    effect: { brand: 8, quality: 6, cogs: 450 },
    blurb: "Buys permission to charge more. Adds ₹450 a unit whether you raise price or not.",
  },
  {
    id: "dfm",
    cat: "Manufacturing",
    name: "Design for manufacture programme",
    cost: 1400000,
    lead: 1,
    effect: { cogs: -400, quality: 4 },
    blurb: "Takes ₹400 off every unit you ever build again. Nothing a customer will ever see.",
  },
  {
    id: "modular",
    cat: "Manufacturing",
    name: "Modular strap and case platform",
    cost: 1000000,
    lead: 0,
    effect: { cogs: -150, brand: 3, repeat: 2 },
    blurb: "Shared parts across both products, and an accessory habit that brings people back.",
  },
];

export const INNOVATION_BY_ID = Object.fromEntries(
  INNOVATIONS.map((c) => [c.id, c]),
) as Record<string, Innovation>;

export const INNOVATION_CATEGORIES = ["Software", "Sensors", "Hardware", "Manufacturing"];

/** Total of one effect key across a set of shipped cards. */
export const innoSum = (ids: string[], key: keyof InnovationEffect): number =>
  ids.reduce((sum, id) => sum + num(INNOVATION_BY_ID[id] && INNOVATION_BY_ID[id].effect[key]), 0);

/* ── supplier payment terms ───────────────────────────────────────── */

export const PAY_TERMS: Record<
  PayTermsId,
  { id: PayTermsId; name: string; days: number; cogsMult: number; rel: number; note: string }
> = {
  advance: {
    id: "advance",
    name: "Pay on despatch",
    days: 0,
    cogsMult: 0.97,
    rel: 3,
    note: "3% off every unit and +3 supplier reliability. Your cash leaves first.",
  },
  net30: {
    id: "net30",
    name: "Net 30",
    days: 30,
    cogsMult: 1,
    rel: 0,
    note: "Standard terms. A third of production financed by your supplier.",
  },
  net60: {
    id: "net60",
    name: "Net 60",
    days: 60,
    cogsMult: 1.02,
    rel: -2,
    note: "2% more a unit and −2 reliability, but two thirds of production sits in payables.",
  },
};

/* ── the line catalog ─────────────────────────────────────────────── */

/** Which cash statement each line lands on. `count` lines are headcount, not rupees. */
export const LINE_KIND: Record<string, "opex" | "capex" | "finIn" | "finOut" | "count"> = {
  google: "opex",
  meta: "opex",
  social: "opex",
  content: "opex",
  events: "opex",
  email: "opex",
  direct: "opex",
  referral: "opex",
  prelaunch: "opex",
  reps: "opex",
  crm: "opex",
  onboarding: "opex",
  salesTraining: "opex",
  channel: "opex",
  quality: "opex",
  npd: "opex",
  design: "opex",
  capex: "capex",
  production: "opex",
  supplier: "opex",
  logistics: "opex",
  warehouse: "opex",
  culture: "opex",
  hrTraining: "opex",
  cx: "opex",
  compliance: "opex",
  planning: "opex",
  audit: "opex",
  workingCapital: "opex",
  treasury: "opex",
  draw: "finIn",
  repay: "finOut",
  priceMatch: "opex",
  comparisonAds: "opex",
  retention: "opex",
  supplyFund: "opex",
};

DEPT_IDS.forEach((id) => {
  LINE_KIND["hire_" + id] = "count";
  LINE_KIND["fire_" + id] = "count";
});

export const LINE_KEYS = Object.keys(LINE_KIND);

/** A blank allocation -- every line an empty string, so inputs render as placeholders. */
export const emptyAlloc = (): Record<string, string> =>
  Object.fromEntries(LINE_KEYS.map((k) => [k, ""]));

/** Coerce an allocation to numbers, flooring at zero. */
export const numericAlloc = (a: Record<string, string>): Record<string, number> =>
  Object.fromEntries(LINE_KEYS.map((k) => [k, Math.max(0, num(a[k]))]));

const sumKind = (a: Record<string, number>, kind: string): number =>
  LINE_KEYS.reduce((sum, k) => sum + (LINE_KIND[k] === kind ? num(a[k]) : 0), 0);

/** Operating spend, in lakhs. */
export const opexLakh = (a: Record<string, number>): number => sumKind(a, "opex");
/** Capital spend, in lakhs. */
export const capexLakh = (a: Record<string, number>): number => sumKind(a, "capex");

export const headcount = (staff: Record<string, number>): number =>
  DEPT_IDS.reduce((sum, id) => sum + num(staff[id]), 0);

export const salaryBill = (staff: Record<string, number>): number =>
  DEPARTMENTS.reduce((sum, d) => sum + num(staff[d.id]) * d.salary, 0);

/* ── the opening balance sheet ────────────────────────────────────── */

const OPENING_ASSETS = OPENING_CASH + 8e5 + 600 * 3250 + 2.5e6 + 1e6;

export const INITIAL_STATE: CompanyState = {
  quarter: 1,
  cash: OPENING_CASH,
  ar: 8e5,
  ap: 0,
  debt: 0,
  equipment: 2.5e6,
  ip: 1e6,
  retainedEarnings: OPENING_ASSETS - OTHER_LIABILITIES - SHARE_CAPITAL,
  installedCapacity: 2500,
  staff: { ...BASE_STAFF },
  products: {
    pulse: { live: true, status: "active", price: 9999, share: 100, inv: 600, invCost: 3250 },
    pro: { live: false, status: "active", price: 14999, share: 0, inv: 0, invCost: 5200 },
  },
  innovations: [],
  pipeline: {},
  launchHype: 0,
  launchBoostLeft: 0,
  customers: 4000,
  priorUnits: 0,
  brand: 0,
  seo: 0,
  quality: 0,
  innovation: 0,
  npd: 0,
  supplierRel: 70,
  logisticsEff: 60,
  empSat: 65,
  empEng: 60,
  compliance: 50,
  forecast: 55,
  audit: 50,
  satisfaction: 50,
  repeatRate: 10,
  attrition: 0,
  arDays: 30,
  payTerms: "net30",
  overhead: OPENING_OVERHEAD,
  marketShare: 0,
  fillRate: 1,
  priorDemand: 0,
  lastGM: 0.66,
  lastNetCF: 0,
  revHistory: [],
  lastMix: {},
  aftermath: {},
  crisisLog: [],
  wcBreached: false,
  everInsolvent: false,
};

/* ── market events ────────────────────────────────────────────────── */

export type Archetype = {
  id: ArchetypeId;
  name: string;
  rival: string | null;
  weights: Record<string, number>;
  signal: string;
  body: string;
  diagnoses: DiagnosisId[];
};

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  price_war: {
    id: "price_war",
    name: "Price War",
    rival: "kalpa",
    weights: { brand: 0.22, retention: 0.2, margin: 0.2, innovation: 0.16, satisfaction: 0.12, cash: 0.1 },
    signal: "Sales conversion has fallen for three consecutive weeks.",
    body: "Nothing in the product has changed and satisfaction is stable, but deals are dying later in the cycle than they used to. Your head of sales says the objection has changed shape — people are not saying no, they are saying not at this price.",
    diagnoses: ["price", "differentiation", "demand", "retention"],
  },
  blitz: {
    id: "blitz",
    name: "Marketing Blitz",
    rival: "vega",
    weights: { brand: 0.26, channels: 0.22, retention: 0.16, cash: 0.16, satisfaction: 0.1, margin: 0.1 },
    signal: "Acquisition cost has risen sharply across every paid channel at once.",
    body: "Lead volume is holding but the leads are colder and each one costs materially more than last quarter. Nothing you changed explains it. Someone else is buying the same attention you are.",
    diagnoses: ["demand", "price", "segment", "differentiation"],
  },
  leapfrog: {
    id: "leapfrog",
    name: "Feature Leapfrog",
    rival: "zenith",
    weights: { innovation: 0.3, quality: 0.22, brand: 0.18, retention: 0.16, satisfaction: 0.14 },
    signal: "Win rates against one competitor have collapsed while everything else holds.",
    body: "Reviews have started opening with a comparison rather than a description. Your own ratings have not moved. The frame of reference has.",
    diagnoses: ["differentiation", "price", "retention", "segment"],
  },
  supply: {
    id: "supply",
    name: "Supply Shock",
    rival: null,
    weights: { supplier: 0.34, capacity: 0.22, cash: 0.18, margin: 0.14, people: 0.12 },
    signal: "Two component vendors have missed confirmations in the same week.",
    body: "Your contract manufacturer wants a commitment for the quarter and cannot promise the slot beyond Friday. Nobody will yet say how long this lasts.",
    diagnoses: ["supply", "capacity", "cash", "demand"],
  },
  demand_shift: {
    id: "demand_shift",
    name: "Demand Shift",
    rival: "tail",
    weights: { retention: 0.24, brand: 0.2, satisfaction: 0.18, channels: 0.16, cash: 0.12, margin: 0.1 },
    signal: "Category demand has come in below forecast for the second month running.",
    body: "This is not a share problem — your competitors' numbers look soft too. Buyers appear to be deferring rather than choosing somebody else.",
    diagnoses: ["demand", "segment", "price", "retention"],
  },
  trust: {
    id: "trust",
    name: "Trust Event",
    rival: null,
    weights: { quality: 0.28, satisfaction: 0.24, retention: 0.2, brand: 0.16, people: 0.12 },
    signal: "Return rates and negative reviews have both spiked in the same fortnight.",
    body: "A batch appears to be failing in the field in a way QA did not catch. It is being discussed publicly. You do not yet know how many units are affected.",
    diagnoses: ["quality", "retention", "supply", "differentiation"],
  },
};

export const ARCHETYPE_IDS = Object.keys(ARCHETYPES) as ArchetypeId[];

export const DIAGNOSIS_LABELS: Record<DiagnosisId, string> = {
  price: "Competitive pricing pressure",
  differentiation: "Product differentiation problem",
  demand: "Demand generation problem",
  capacity: "Capacity constraint",
  supply: "Supply disruption",
  retention: "Customer retention problem",
  cash: "Cash flow problem",
  segment: "Market segment mismatch",
  quality: "Product quality problem",
};

/** What each archetype actually is, for grading the student's reading. */
export const TRUE_DIAGNOSIS: Record<ArchetypeId, DiagnosisId> = {
  price_war: "price",
  blitz: "demand",
  leapfrog: "differentiation",
  supply: "supply",
  demand_shift: "demand",
  trust: "quality",
};

export type Strategy = {
  id: StrategyId;
  name: string;
  thesis: string;
  gain: string;
  risk: string;
};

export const STRATEGIES: Strategy[] = [
  {
    id: "fight",
    name: "Fight",
    thesis: "Meet it head on and defend volume and share.",
    gain: "Protects share and conversion while the pressure lasts.",
    risk: "Margin, cash burn, and the possibility that the other side escalates.",
  },
  {
    id: "differentiate",
    name: "Differentiate",
    thesis: "Refuse the comparison. Compete on what you are better at.",
    gain: "Protects price and margin, and compounds into brand and product position.",
    risk: "You will lose volume in the meantime, and it is slow.",
  },
  {
    id: "focus",
    name: "Focus",
    thesis: "Retreat to the customers you serve best and defend them properly.",
    gain: "Better conversion and retention on a narrower base, at lower cost.",
    risk: "A deliberately smaller market. Share falls even if the business improves.",
  },
  {
    id: "learn",
    name: "Hold and learn",
    thesis: "Commit little, watch closely, keep the options open.",
    gain: "Preserves cash and buys information for the following quarter.",
    risk: "The situation may be worse by the time you understand it.",
  },
  {
    id: "exploit",
    name: "Press the advantage",
    thesis: "Treat this as an opening rather than a threat.",
    gain: "Share taken while competitors are distracted, and it does not come back easily.",
    risk: "Needs capacity and cash you may not have. Exposed if the read is wrong.",
  },
];

export const STRATEGY_BY_ID = Object.fromEntries(STRATEGIES.map((s) => [s.id, s])) as Record<
  StrategyId,
  Strategy
>;

/* ── priorities declared before the quarter starts ────────────────── */

export type Priority = { id: PriorityId; name: string; desc: string; keys: string[] };

export const PRIORITIES: Priority[] = [
  {
    id: "grow",
    name: "Grow faster",
    desc: "Take share now and worry about economics later.",
    keys: ["google", "meta", "social", "direct", "events", "reps", "channel"],
  },
  { id: "cash", name: "Protect cash", desc: "Extend runway. Accept a slower quarter to stay alive.", keys: [] },
  {
    id: "product",
    name: "Improve the product",
    desc: "Raise what the product can convert and keep.",
    keys: ["quality", "npd", "design"],
  },
  {
    id: "ops",
    name: "Fix operations",
    desc: "Build and deliver what has already been sold.",
    keys: ["production", "capex", "supplier", "logistics", "warehouse"],
  },
  {
    id: "retain",
    name: "Keep the customers we have",
    desc: "Satisfaction and repeat buying over new acquisition.",
    keys: ["cx", "onboarding", "email", "referral"],
  },
  {
    id: "risk",
    name: "Prepare for risk",
    desc: "Buy cover before you need it.",
    keys: ["supplier", "compliance", "audit", "planning", "workingCapital"],
  },
  {
    id: "longterm",
    name: "Build long-term value",
    desc: "Assets that pay out after this year is over.",
    keys: ["content", "prelaunch", "npd", "capex", "design"],
  },
];

export const PRIORITY_BY_ID = Object.fromEntries(PRIORITIES.map((p) => [p.id, p])) as Record<
  PriorityId,
  Priority
>;

/* ── the four quarters ────────────────────────────────────────────── */

export const QUARTER_BRIEFS = [
  {
    n: 1,
    title: "Prove the machine",
    brief:
      "You have a product, four thousand customers and twelve months of cash. Nobody knows yet whether this business works. Find out what actually sells before you scale anything.",
  },
  {
    n: 2,
    title: "Scale",
    brief:
      "You know a little more than you did. Now the question is whether the machine holds together when you push on it — and which part gives way first.",
  },
  {
    n: 3,
    title: "Survive competition",
    brief:
      "The category has noticed you. Somebody with more money is about to make this quarter difficult, and what you built in the first half decides how much it costs you.",
  },
  {
    n: 4,
    title: "Create value",
    brief:
      "One quarter left. Whatever the company is going to be worth, it will be worth it because of what happens now and what you already put in place.",
  },
];

/* ── directors who write to you ───────────────────────────────────── */

export const DIRECTORS: Record<string, { name: string; role: string }> = {
  cfo: { name: "Meera Rajagopal", role: "Chief Financial Officer" },
  sales: { name: "Arjun Nair", role: "Head of Sales" },
  product: { name: "Ishaan Verma", role: "Head of Product" },
  ops: { name: "Fatima Sheikh", role: "Head of Operations" },
  cs: { name: "Divya Menon", role: "Customer Success" },
  people: { name: "Rohit Bansal", role: "People & Talent" },
  market: { name: "Market intelligence", role: "Weekly briefing" },
};

/* ── warranty ─────────────────────────────────────────────────────── */

export const WARRANTY_OPTIONS: { id: WarrantyId; name: string; conv: string; cost: string; mult: number }[] = [
  { id: "6mo", name: "6 months", conv: "+0 conversion points", cost: "No provision", mult: 0 },
  { id: "1yr", name: "1 year", conv: "+1.5 conversion points", cost: "units × defect rate × ₹1,500", mult: 1 },
  {
    id: "2yr",
    name: "2 years",
    conv: "+3.0 conversion points",
    cost: "units × defect rate × ₹1,500 × 1.8",
    mult: 1.8,
  },
];

export const PRODUCT_STATUS_COPY: Record<string, string> = {
  active: "Built and sold. Takes its share of the line.",
  paused: "Not built. Existing stock still sells, and the line goes to the other product.",
  discontinued:
    "Not built. All remaining stock is cleared this quarter at 40% off, and it leaves the range for good.",
};

/* ── teaching notes ("why this works this way") ───────────────────── */

export const TEACHING_NOTES: Record<string, { cat: string; title: string; body: string }> = {
  constraint: {
    cat: "Systems thinking",
    title: "Why one constraint decides the quarter",
    body: "A business is a chain of stages: interest, selling capacity, conversion, supply, cash. Output is set by the narrowest stage, not the average. Money spent on any other stage produces nothing until the narrow one moves. This is why improving something that is already comfortable can leave results completely unchanged.",
  },
  health: {
    cat: "Orientation",
    title: "Health bars are orientation, not a score",
    body: "These are readings of the underlying variables, scaled to make them comparable at a glance. A low bar is not automatically a problem to fix — a young company should have some low bars. They exist so you notice what you have stopped looking at.",
  },
  priority: {
    cat: "Judgment",
    title: "Declared strategy versus revealed strategy",
    body: "What a company is actually doing is visible in where its money goes, not in what its leadership says. Declaring a priority before you see the levers creates a record you can be held to. At the close, your stated priority, your actual spending and the company's real constraint are compared.",
  },
  board: {
    cat: "Leadership",
    title: "Competing stakeholders",
    body: "The board wants growth, the CFO wants runway, customers want a better product, the team wants a sustainable workload. These cannot all be satisfied at once and none of them is automatically right. Management is the allocation of disappointment.",
  },
  diminishing: {
    cat: "Marketing",
    title: "Diminishing returns are built into every channel",
    body: "Each channel follows a curve with an exponent below one — doubling spend produces well under double the leads. The first rupee in a channel is always worth more than the last. This is why spreading across channels usually beats concentrating in one, up to the point where each becomes too small to matter.",
  },
  cac: {
    cat: "Marketing",
    title: "Cost per lead is not cost per customer",
    body: "A lead becomes a customer only if sales can work it and the product can close it. Divide acquisition spend by units actually sold, not by leads generated, and compare that with contribution per unit. If it exceeds contribution, growth is destroying value.",
  },
  compounding: {
    cat: "Marketing",
    title: "Rented demand versus owned demand",
    body: "Paid acquisition stops the moment payment stops. Content, search and brand accumulate into an asset that generates leads in later quarters at no cost. Nearly everyone under-funds the second kind, because it shows no return in the quarter it is bought and the person who buys it may not be there to collect.",
  },
  voice: {
    cat: "Marketing",
    title: "Share of voice",
    body: "Your standing in a category depends partly on being visible relative to competitors, not on absolute spend. Marketing raises position, but it cannot raise it on its own — price, product and availability all sit in the same calculation.",
  },
  capacity: {
    cat: "Sales",
    title: "Selling capacity is a hard gate",
    body: "Leads beyond what the team can work are not stored, delayed or discounted. They are lost. This is the most common expensive mistake in the simulation: demand generation and selling capacity funded by different logic, in the same quarter, by the same person.",
  },
  channel: {
    cat: "Sales",
    title: "Channel is capacity you rent",
    body: "Distributors add reach without hiring, and take a permanent margin on everything they touch. You also do not own the customer relationship, which shows up later in repeat purchase. Volume through a channel is worth less per unit than volume you sell yourself.",
  },
  ceiling: {
    cat: "Product",
    title: "The conversion ceiling",
    body: "Sales effort, tools and training raise how well you can sell. The product decides how much of that can land. When raw selling capability exceeds the ceiling, the excess buys nothing at all — the money is spent and the units do not appear. Watch the gap between the two numbers, not either one alone.",
  },
  capitalised: {
    cat: "Product",
    title: "Capitalised versus expensed",
    body: "Continuous R&D is an expense: it hits this quarter's profit and is gone. Innovation cards are capitalised: they become an asset on the balance sheet and are written down over time. The same rupee therefore affects profit, cash and net worth quite differently depending on which one you spend it on.",
  },
  leadtime: {
    cat: "Product",
    title: "Lead times mean you are deciding for a later quarter",
    body: "Anything with a lead time is paid for now and arrives later. In a four-quarter year, a card started in the final quarter never ships and the money is simply gone. Product decisions are the ones with the longest gap between cause and effect.",
  },
  npd: {
    cat: "Product",
    title: "Partial progress is worth nothing",
    body: "A new product either reaches the market or it does not. Development progress that stops at ninety is worth exactly as much as progress that stopped at ten. Committing to a second product is a multi-quarter commitment or it is waste.",
  },
  pricing: {
    cat: "Product",
    title: "Price moves volume and margin in opposite directions",
    body: "Lower price lifts demand and lowers contribution per unit; higher price does the reverse. Neither is right. What matters is contribution per unit multiplied by units, against a cost base that does not move when you discount. A company can grow share and destroy value at the same time.",
  },
  installed: {
    cat: "Operations",
    title: "Owning capacity is not running it",
    body: "Installed capacity is a permanent asset you paid for. The production run decides how much of it you switch on this quarter. Plant that is not run still depreciates and still sits on the balance sheet. Capacity investment without a matching run is the most expensive way to buy nothing.",
  },
  inventory: {
    cat: "Operations",
    title: "Inventory is cash you have already spent",
    body: "Units built and not sold are money converted into a form you cannot use, which then costs more money to hold. Building to capacity rather than to demand is comfortable, invisible in profit for a while, and one of the fastest ways to run out of cash while appearing to grow.",
  },
  yield: {
    cat: "Operations",
    title: "Losses compound before anything is sold",
    body: "What you build is reduced by supplier reliability, by staffing, by attrition and by any supply shock, multiplicatively. Four separate factors at ninety per cent leave you with sixty-six. Reliability is invisible until you look at the gap between what you funded and what appeared.",
  },
  contract: {
    cat: "Operations",
    title: "Flexibility has a price",
    body: "Contract manufacturing needs no capital and can be turned on and off, which is exactly why it costs more per unit. It is the right answer for a spike and the wrong answer for a trend.",
  },
  ramp: {
    cat: "People",
    title: "New hires do not arrive at full speed",
    body: "Someone hired this quarter contributes about sixty per cent of a full person, then full effect afterwards. The cost, however, starts immediately and continues every quarter thereafter. Hiring into a problem you have this quarter solves it next quarter.",
  },
  staffing: {
    cat: "People",
    title: "Functions fail in different ways",
    body: "Being short in marketing throttles leads. Being short in operations throttles production. Being short in engineering means R&D delivers less than you paid for. The headcount total tells you nothing — only the split does.",
  },
  attrition: {
    cat: "People",
    title: "People decisions are paid for later",
    body: "Cutting roles saves salary at once, and costs morale, engagement and higher attrition in the quarters that follow. You lose people you did not choose to lose. This is the clearest delayed consequence in the model.",
  },
  workingcap: {
    cat: "Finance",
    title: "Profit is not cash",
    body: "Revenue is recognised when the sale happens; cash arrives when the customer pays. Between them sit receivable days. A company can be profitable and insolvent in the same quarter, and this is how it usually happens.",
  },
  payables: {
    cat: "Finance",
    title: "Supplier terms are financing",
    body: "Paying later means your supplier funds part of your production, which shows as payables rather than as cash leaving. Paying earlier buys a discount and better reliability. Either can be right; the question is whether you need the cash more than the margin.",
  },
  gearing: {
    cat: "Finance",
    title: "Borrow when you can, not when you must",
    body: "The facility is capped at a proportion of net worth, so it shrinks exactly as your position weakens. Credit is cheapest to arrange when you do not need it. The alternative is raising from a position of distress, which is priced accordingly.",
  },
  compliance: {
    cat: "Finance",
    title: "Governance buys the absence of a problem",
    body: "Compliance and audit make no sale and appear only as a cost. Underfunding them raises a penalty risk that is charged against revenue every quarter. It is the clearest example of a cost whose value is only visible in what does not occur.",
  },
  share: {
    cat: "Market",
    title: "Share is a result, not a goal",
    body: "Market share is your units sold as a proportion of what the whole category buys. It can be bought with price at the cost of margin, which is why share and profitability must always be read together. High share with weak economics is a worse position than the reverse.",
  },
  position: {
    cat: "Market",
    title: "Position versus execution",
    body: "Your competitive position sets how much of the category's demand you could reach. What you actually sell is limited by capacity, supply and cash. The gap between the two is execution, and closing it is usually cheaper than improving position.",
  },
  rivals: {
    cat: "Market",
    title: "Competitors do not stand still",
    body: "Rival strength grows every quarter whether you act or not. Holding share constant therefore requires continuous investment. A flat share line means you are running to stay in the same place, which is not the same as stagnation.",
  },
  crisis: {
    cat: "Events",
    title: "A shock is a test of what you built earlier",
    body: "How much a market event costs depends on the state of the company when it arrives — innovation already shipped, supplier reliability already bought, cash already held. The response budget helps at the margin. The preparation, bought quarters earlier for no visible reason, matters more.",
  },
  covenant: {
    cat: "Endgame",
    title: "Read the covenant, not the headline",
    body: "Investment terms attach conditions. A larger cheque with a harder target can be worth less than a smaller one you will meet. A ratchet on a miss transfers ownership at the worst possible moment. The number on the front page is the least informative part of a term sheet.",
  },
  continuation: {
    cat: "Endgame",
    title: "Acquisition price versus continuation value",
    body: "An offer is worth taking only if it exceeds what the business would be worth if you kept running it. That comparison requires a view on your own momentum, which is the hardest number in the transaction to be honest about — and the one the buyer has already estimated.",
  },
  reflection: {
    cat: "Judgment",
    title: "Naming the sacrifice",
    body: "Every allocation is a decision not to fund something else. A trade-off you can name is a decision; one you cannot is an oversight. Recording it before the outcome is known is the only way to tell the difference afterwards.",
  },
  statements: {
    cat: "Finance",
    title: "Why three statements and not one",
    body: "The profit and loss shows performance, the cash flow shows solvency, and the balance sheet shows position. They are reconciled but not interchangeable, and the balance sheet must balance: assets always equal liabilities plus equity.",
  },
};

/* ── the grouped decision surface (what each screen asks first) ───── */

export type DecisionItem = {
  id: string;
  name: string;
  /** line id -> share of the amount typed here. */
  keys: Record<string, number>;
  learn?: string;
  gain: string;
  cost: string;
};

export type DecisionGroup = {
  question: string;
  scope: string;
  items: DecisionItem[];
};

export const DECISION_GROUPS: Record<string, DecisionGroup> = {
  marketing: {
    question: "What demand are we trying to create?",
    scope: "marketing",
    items: [
      {
        id: "paid",
        name: "Paid acquisition",
        keys: { google: 0.45, meta: 0.3, direct: 0.25 },
        learn: "diminishing",
        gain: "Leads this quarter, measurable and fast",
        cost: "Stops the moment you stop paying. Buys nothing you keep.",
      },
      {
        id: "brand",
        name: "Brand building",
        keys: { social: 0.55, events: 0.45 },
        learn: "compounding",
        gain: "Brand score, which multiplies every other channel from now on",
        cost: "Slow. Almost none of it converts in the quarter you spend it.",
      },
      {
        id: "organic",
        name: "Organic and search",
        keys: { content: 1 },
        learn: "compounding",
        gain: "An asset that generates free leads next quarter and the one after",
        cost: "Close to nothing this quarter. Pure deferred return.",
      },
      {
        id: "launch",
        name: "Pre-launch marketing",
        keys: { prelaunch: 1 },
        learn: "compounding",
        gain: "Anticipation for a product that is not on sale yet, so it launches into a market that already wants it",
        cost: "Buys nothing at all until the product actually ships. Fund it too early and you pay to excite people about vapour.",
      },
      {
        id: "retention",
        name: "Retention and referral",
        keys: { email: 0.5, referral: 0.5 },
        learn: "cac",
        gain: "The cheapest demand available, plus repeat purchase",
        cost: "Hard-capped by how many customers you already have.",
      },
    ],
  },
  sales: {
    question: "Can our team convert the demand we create?",
    scope: "sales",
    items: [
      {
        id: "capacity",
        name: "Selling capacity",
        keys: { reps: 1 },
        learn: "capacity",
        gain: "Leads your team can actually work, and conversion",
        cost: "Commission and headcount that persists whether demand arrives or not.",
      },
      {
        id: "process",
        name: "Process and enablement",
        keys: { crm: 0.5, salesTraining: 0.5 },
        learn: "ceiling",
        gain: "Conversion on the leads you already have, and lower attrition",
        cost: "Adds no capacity at all. Multiplies, never creates.",
      },
      {
        id: "channel",
        name: "Channel and distribution",
        keys: { channel: 1 },
        learn: "channel",
        gain: "Capacity without hiring, and reach you do not have",
        cost: "18% of the revenue on those units, permanently, and a customer you do not own.",
      },
      {
        id: "success",
        name: "Onboarding and success",
        keys: { onboarding: 1 },
        learn: "attrition",
        gain: "Satisfaction and repeat purchase",
        cost: "No new demand. Everything here pays out later.",
      },
    ],
  },
  rnd: {
    question: "What should the product become?",
    scope: "rnd",
    items: [
      {
        id: "quality",
        name: "Quality and reliability",
        keys: { quality: 1 },
        learn: "ceiling",
        gain: "Conversion ceiling, and a lower defect rate on the warranty bill",
        cost: "Customers never see quality work directly. It shows in what does not happen.",
      },
      {
        id: "newproduct",
        name: "New product development",
        keys: { npd: 1 },
        learn: "npd",
        gain: "A second product at a higher price and margin",
        cost: "Nothing at all until it reaches 100. Stop halfway and the whole spend is wasted.",
      },
      {
        id: "dfc",
        name: "Design for cost",
        keys: { design: 1 },
        learn: "pricing",
        gain: "Permanently lower cost on every unit you ever build",
        cost: "Invisible to customers, and it competes with features for the same engineers.",
      },
    ],
  },
  ops: {
    question: "Can we deliver what customers want?",
    scope: "ops",
    items: [
      {
        id: "run",
        name: "Production run",
        keys: { production: 1 },
        learn: "installed",
        gain: "Units, this quarter, from plant you already own",
        cost: "Every unit built and not sold becomes stock you paid for and must hold.",
      },
      {
        id: "capex",
        name: "Capacity investment",
        keys: { capex: 1 },
        learn: "installed",
        gain: "Permanent installed capacity, on the balance sheet rather than the P&L",
        cost: "Buys nothing on its own. Capacity you do not run is capacity you wasted.",
      },
      {
        id: "supplier",
        name: "Supplier resilience",
        keys: { supplier: 1 },
        learn: "yield",
        gain: "Reliability, which multiplies everything you build — and cover if the chain breaks",
        cost: "Adds no capacity. Pure insurance until the day it is not.",
      },
      {
        id: "inventory",
        name: "Logistics and inventory",
        keys: { logistics: 0.5, warehouse: 0.5 },
        learn: "inventory",
        gain: "Cheaper holding, faster delivery, higher satisfaction",
        cost: "Makes carrying stock survivable, which makes overbuilding easier to ignore.",
      },
    ],
  },
  hr: {
    question: "Do we have the capability to execute the plan?",
    scope: "hr",
    items: [
      {
        id: "culture",
        name: "Culture and pay",
        keys: { culture: 1 },
        learn: "staffing",
        gain: "Morale, which multiplies every lead the company generates",
        cost: "Recurring, and invisible until it is gone.",
      },
      {
        id: "develop",
        name: "Training and development",
        keys: { hrTraining: 1 },
        learn: "attrition",
        gain: "Engagement, which sets next quarter's attrition",
        cost: "Pays out entirely in future quarters.",
      },
      {
        id: "cx",
        name: "Customer experience",
        keys: { cx: 1 },
        learn: "attrition",
        gain: "Satisfaction and repeat purchase",
        cost: "The first line every CEO cuts, and the one that costs most two quarters later.",
      },
    ],
  },
  finance: {
    question: "Can we afford the plan, and what does it cost to be wrong?",
    scope: "finance",
    items: [
      {
        id: "governance",
        name: "Governance and compliance",
        keys: { compliance: 0.4, audit: 0.3, planning: 0.3 },
        learn: "compliance",
        gain: "Lower penalty exposure and permanently lower overhead",
        cost: "Makes no sale. Buys the absence of a problem.",
      },
      {
        id: "workcap",
        name: "Working capital",
        keys: { workingCapital: 1 },
        learn: "workingcap",
        gain: "Cash released from receivables, faster",
        cost: "Administrative effort against money you have already earned.",
      },
      {
        id: "treasury",
        name: "Treasury",
        keys: { treasury: 1 },
        learn: "gearing",
        gain: "A return on cash that is otherwise doing nothing",
        cost: "Only worth anything if you are actually holding cash.",
      },
    ],
  },
};

/** Total committed to a grouped decision, in lakhs. */
export const groupTotal = (a: Record<string, number>, item: DecisionItem): number =>
  Object.keys(item.keys).reduce((sum, k) => sum + num(a[k]), 0);

/** Spread an amount typed against a grouped decision back across its underlying lines. */
export const spreadGroup = (
  alloc: Record<string, string>,
  item: DecisionItem,
  value: string,
): Record<string, string> => {
  const next = { ...alloc };
  const total = Math.max(0, num(value));
  Object.keys(item.keys).forEach((k) => {
    next[k] = total === 0 ? "" : String(Math.round(total * item.keys[k] * 100) / 100);
  });
  return next;
};

/** True when the underlying lines no longer match the group's default split. */
export const groupOverridden = (a: Record<string, number>, item: DecisionItem): boolean => {
  const total = groupTotal(a, item);
  if (total <= 0) return false;
  return Object.keys(item.keys).some((k) => Math.abs(num(a[k]) - total * item.keys[k]) > 0.05);
};

/* ── the detailed line surface (every published formula) ──────────── */

export type DetailLine = {
  key: string;
  name: string;
  formula: string;
  cap?: (ctx: PreviewCtx) => number;
  preview?: (v: number, ctx: PreviewCtx) => (string | null)[];
};

export type DetailScreen = {
  id: string;
  label: string;
  eyebrow: string;
  scope: string;
  blurb: string;
  lines: DetailLine[];
};

export const DETAIL_SCREENS: DetailScreen[] = [
  {
    id: "marketing",
    label: "Marketing",
    eyebrow: "Demand generation",
    scope: "marketing",
    blurb:
      "Nine channels. Seven make leads now, two build assets that pay out later. None of it matters if operations cannot build what it sells.",
    lines: [
      {
        key: "google",
        name: "Google Ads",
        formula: "Leads = 375 × x^0.68",
        preview: (v, c) => [
          n0(375 * pw(v, 0.68) * c.mk) + " leads",
          v > 0 ? inr((v * 1e5) / Math.max(1, 375 * pw(v, 0.68) * c.mk)) + " a lead" : null,
        ],
      },
      {
        key: "meta",
        name: "Meta Ads",
        formula: "Leads = 200 × x^0.65 · Brand +1.2x",
        preview: (v, c) => [
          n0(200 * pw(v, 0.65) * c.mk) + " leads",
          "+" + n1(1.2 * v) + " brand",
          n0(40000 * v) + " impressions",
        ],
      },
      {
        key: "social",
        name: "Social & Influencer",
        formula: "Leads = 225 × x^0.72 · Brand +2.5x",
        preview: (v, c) => [n0(225 * pw(v, 0.72) * c.mk) + " leads", "+" + n1(2.5 * v) + " brand"],
      },
      {
        key: "content",
        name: "Content & SEO",
        formula: "Leads = 75 × x^0.62 · SEO asset +3.5x",
        preview: (v, c) => [
          n0(75 * pw(v, 0.62) * c.mk) + " leads now",
          "+" + n1(3.5 * v) + " SEO asset",
          n0(3.5 * v * 25) + " free leads in Q" + (c.s.quarter + 1),
        ],
      },
      {
        key: "events",
        name: "Events & PR",
        formula: "Leads = 90 × x^0.62 · Brand +1.5x",
        preview: (v, c) => [n0(90 * pw(v, 0.62) * c.mk) + " leads", "+" + n1(1.5 * v) + " brand"],
      },
      {
        key: "email",
        name: "Email Marketing",
        formula: "Leads = 80 × x^0.55 · Repeat +3√x",
        preview: (v, c) => [
          n0(80 * pw(v, 0.55) * c.mk) + " leads",
          "+" + n1(3 * pw(v, 0.5)) + "pts repeat rate",
        ],
      },
      {
        key: "direct",
        name: "Direct Marketing",
        formula: "Leads = 160 × x^0.60 · Conversion +0.8 × x^0.4",
        preview: (v, c) => [
          n0(160 * pw(v, 0.6) * c.mk) + " high-intent leads",
          "+" + n1(0.8 * pw(v, 0.4)) + "pts conversion",
          v > 8
            ? "−" + n1(0.25 * (v - 8)) + " satisfaction from over-contact"
            : "no contact fatigue below ₹8L",
        ],
      },
      {
        key: "referral",
        name: "Referral Programme",
        formula: "₹300 a lead, capped at 20% of customers",
        cap: (c) => (0.2 * c.s.customers * 300) / 1e5,
        preview: (v, c) => {
          const capSpend = (0.2 * c.s.customers * 300) / 1e5;
          return [
            n0(Math.min((v * 1e5) / 300, 0.2 * c.s.customers)) + " leads",
            "cap " + lakh(capSpend),
            v > capSpend ? lakh(v - capSpend) + " past the cap buys nothing" : null,
          ];
        },
      },
      {
        key: "prelaunch",
        name: "Pre-launch marketing",
        formula: "Anticipation +5√x · no leads until the new product is on sale",
        preview: (v, c) => {
          const hype = c.s.launchHype + 5 * pw(v, 0.5);
          return [
            "anticipation " + n1(hype),
            c.s.products.pro.live ? "the Pro is already on sale" : "lands with the Pro when it launches",
            "launch demand ×" + n2(Math.min(1.9, 1 + hype / 60)) + " for two quarters",
          ];
        },
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    eyebrow: "Route to market",
    scope: "sales",
    blurb: "Own reps, a distributor channel, and corporate accounts that bypass the funnel entirely.",
    lines: [
      {
        key: "reps",
        name: "Reps & Commissions",
        formula: "Capacity = 500x × (1 − attrition) × sales staffing",
        preview: (v, c) => [
          n0(500 * v * (1 - c.s.attrition / 100) * c.sl) + " leads of capacity",
          "+" + n1(2 * pw(v, 0.5)) + "pts conversion",
          c.sl < 0.999 ? "throttled to " + pct(c.sl * 100) + " by sales staffing" : "fully staffed",
        ],
      },
      {
        key: "crm",
        name: "CRM & Tools",
        formula: "Conversion +1.5 × x^0.4",
        preview: (v) => ["+" + n1(1.5 * pw(v, 0.4)) + "pts conversion"],
      },
      {
        key: "salesTraining",
        name: "Sales Training & Enablement",
        formula: "Conversion +2.2 × x^0.45 · Attrition −0.4√x",
        preview: (v) => [
          "+" + n1(2.2 * pw(v, 0.45)) + "pts conversion",
          "−" + n1(0.4 * pw(v, 0.5)) + "pts attrition next quarter",
        ],
      },
      {
        key: "channel",
        name: "Channel Partners & Distribution",
        formula: "Capacity += 420 × x^0.75 · 18% of their revenue",
        preview: (v, c) => {
          const chan = 420 * pw(v, 0.75);
          const own = 500 * c.A.reps * (1 - c.s.attrition / 100) * c.sl;
          return [
            n0(chan) + " leads of distributor capacity",
            pct(chan + own > 0 ? (chan / (chan + own)) * 100 : 0) + " of funnel sales via channel",
            "18% margin given away on those",
          ];
        },
      },
      {
        key: "onboarding",
        name: "Onboarding & Success",
        formula: "Satisfaction +3√x · Repeat +3 × x^0.4 · support staffing",
        preview: (v, c) => [
          "+" + n1(3 * pw(v, 0.5) * c.sp) + " satisfaction",
          "+" + n1(3 * pw(v, 0.4) * c.sp) + "pts repeat rate",
        ],
      },
    ],
  },
  {
    id: "rnd",
    label: "Product & Innovation",
    eyebrow: "What you sell and what it costs",
    scope: "rnd",
    blurb:
      "The price of every product, the board of things it could become, and the ceiling on what any of it can convert.",
    lines: [
      {
        key: "quality",
        name: "Quality & QA",
        formula: "Quality +6√x × engineering staffing · Defect = max(2, 8 − 1.2√x)",
        preview: (v, c) => [
          "+" + n1(6 * pw(v, 0.5) * c.en) + " quality",
          "defect rate " + pct(Math.max(2, 8 - 1.2 * pw(v, 0.5) * c.en)),
        ],
      },
      {
        key: "npd",
        name: "New Product Development",
        formula: "Progress +12√x · the Pro goes on sale at 100",
        preview: (v, c) => {
          if (c.s.products.pro.live) return ["The Pro is already on sale"];
          const p = c.s.npd + 12 * pw(v, 0.5) * c.en;
          return [
            "progress " + n1(Math.min(p, 100)) + "/100",
            p >= 100 ? "The Pro can be built and priced from next quarter" : "needs " + n1(100 - p) + " more",
          ];
        },
      },
      {
        key: "design",
        name: "Design & Industrial Engineering",
        formula: "Brand +1.8√x · cost per unit −₹40√x",
        preview: (v, c) => [
          "+" + n1(1.8 * pw(v, 0.5) * c.en) + " brand",
          "−" + inr(40 * pw(v, 0.5) * c.en) + " off every unit built",
        ],
      },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    eyebrow: "Capacity and supply",
    scope: "ops",
    blurb:
      "Installed capacity is what you own. The production run is how much of it you switch on. Marketing spends against whatever this department can deliver.",
    lines: [
      {
        key: "capex",
        name: "Plant Capex",
        formula: "Installed capacity += 240 × x^0.75, permanent · capitalised",
        preview: (v, c) => [
          "+" + n0(240 * pw(v, 0.75)) + " units a quarter, permanently",
          "installed becomes " + n0(c.s.installedCapacity + 240 * pw(v, 0.75)),
          "balance sheet, not P&L",
        ],
      },
      {
        key: "production",
        name: "Production Run",
        formula: "Runs min(installed, 420 × x^0.7) × ops staffing × reliability",
        preview: (v, c) => {
          const installed = c.s.installedCapacity + 240 * pw(c.A.capex, 0.75);
          const capability = 420 * pw(v, 0.7);
          const run = Math.min(installed, capability);
          return [
            n0(run) + " units run of " + n0(installed) + " installed",
            capability < installed
              ? "under-running the plant by " + n0(installed - capability)
              : "plant fully loaded",
            n0(run * c.op * (c.s.supplierRel / 100) * (1 - c.s.attrition / 100)) +
              " actually built after losses",
          ];
        },
      },
      {
        key: "supplier",
        name: "Supplier & QC",
        formula: "Supplier reliability +4√x (cap 100)",
        preview: (v, c) => [
          "+" + n1(4 * pw(v, 0.5) * c.op) + " reliability",
          "to " +
            n1(Math.min(100, c.s.supplierRel + 4 * pw(v, 0.5) * c.op)) +
            " — multiplies everything built",
        ],
      },
      {
        key: "logistics",
        name: "Logistics & Distribution",
        formula: "Efficiency +5√x · Satisfaction +0.05 × efficiency",
        preview: (v, c) => {
          const eff = Math.min(100, c.s.logisticsEff + 5 * pw(v, 0.5) * c.op);
          return ["efficiency " + n1(eff), "+" + n1(0.05 * eff) + " satisfaction"];
        },
      },
      {
        key: "warehouse",
        name: "Warehousing & Fulfilment",
        formula: "Holding = max(40, 150 − 22√x) a unit · Satisfaction +2√x",
        preview: (v) => [
          inr(Math.max(40, 150 - 22 * pw(v, 0.5))) + " a unit to hold stock",
          "+" + n1(2 * pw(v, 0.5)) + " satisfaction",
        ],
      },
    ],
  },
  {
    id: "hr",
    label: "People",
    eyebrow: "Headcount by function",
    scope: "hr",
    blurb:
      "Six functions, each doing a different job. Salaries are your largest fixed cost, and every function you starve breaks in its own specific way.",
    lines: [
      {
        key: "culture",
        name: "Culture & Benefits",
        formula: "Satisfaction +5√x · Productivity = 1 + (sat − 50) × 0.004",
        preview: (v, c) => {
          const sat = c.s.empSat + 5 * pw(v, 0.5);
          return ["employee satisfaction " + n1(sat), n2(1 + (sat - 50) * 0.004) + "× on every lead"];
        },
      },
      {
        key: "hrTraining",
        name: "Training & Development",
        formula: "Engagement +6√x · Attrition = max(3, 15 − 0.12 × engagement)",
        preview: (v, c) => {
          const eng = c.s.empEng + 6 * pw(v, 0.5);
          return [
            "engagement " + n1(eng),
            "attrition next quarter " + pct(Math.max(3, 15 - 0.12 * eng)),
          ];
        },
      },
      {
        key: "cx",
        name: "Customer Experience",
        formula: "Satisfaction +4√x · Repeat +2 × x^0.4 · support staffing",
        preview: (v, c) => [
          "+" + n1(4 * pw(v, 0.5) * c.sp) + " satisfaction",
          "+" + n1(2 * pw(v, 0.4) * c.sp) + "pts repeat rate",
        ],
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    eyebrow: "Capital and governance",
    scope: "finance",
    blurb: "The only department that changes what every other department can afford.",
    lines: [
      {
        key: "workingCapital",
        name: "Working Capital Management",
        formula: "Receivable days = max(10, 30 − 8√x)",
        preview: (v, c) => {
          const days = Math.max(10, 30 - 8 * pw(v, 0.5));
          return [
            n0(days) + " days to collect, from " + n0(c.s.arDays),
            "releases cash trapped in receivables",
          ];
        },
      },
      {
        key: "treasury",
        name: "Treasury & Cash Management",
        formula: "Yield = min(2.5%, 0.8% + 0.55√x) on opening cash",
        preview: (v, c) => {
          const rate = Math.min(2.5, 0.8 + 0.55 * pw(v, 0.5));
          return [
            pct(rate) + " a quarter on idle cash",
            inr((Math.max(0, c.s.cash) * rate) / 100) + " of interest income",
          ];
        },
      },
      {
        key: "compliance",
        name: "Compliance & Legal",
        formula: "Compliance +5√x × admin staffing",
        preview: (v, c) => ["compliance " + n1(c.s.compliance + 5 * pw(v, 0.5) * c.ad)],
      },
      {
        key: "planning",
        name: "Financial Planning",
        formula: "Forecast +6√x · overhead falls by (accuracy − 55) × 0.1%",
        preview: (v, c) => {
          const acc = c.s.forecast + 6 * pw(v, 0.5) * c.ad;
          const saving = Math.max(0, acc - 55) * 0.1;
          return [
            "forecast accuracy " + n1(acc),
            "overhead " + inr(c.s.overhead * (1 - saving / 100)) + " next quarter",
            saving > 0
              ? "saves " + inr((c.s.overhead * saving) / 100) + " every quarter"
              : "no saving until accuracy passes 55",
          ];
        },
      },
      {
        key: "audit",
        name: "Audit Preparation",
        formula: "Audit readiness +5√x × admin staffing",
        preview: (v, c) => {
          const readiness = c.s.audit + 5 * pw(v, 0.5) * c.ad;
          return [
            "audit readiness " + n1(readiness),
            "penalty risk " + pct(Math.max(5, 40 - 0.25 * c.s.compliance - 0.1 * readiness)),
          ];
        },
      },
    ],
  },
];

export const DETAIL_LINES_BY_SCREEN = Object.fromEntries(
  DETAIL_SCREENS.map((s) => [s.id, s.lines]),
) as Record<string, DetailLine[]>;

/** Screen chrome for each department tab, and which readiness gauges it owns. */
export const SCREEN_META: Record<string, { label: string; question: string; dirs: string[] }> = {
  marketing: { label: "Marketing", question: DECISION_GROUPS.marketing.question, dirs: ["demand", "position"] },
  sales: { label: "Sales", question: DECISION_GROUPS.sales.question, dirs: ["sales", "demand"] },
  rnd: { label: "Product", question: DECISION_GROUPS.rnd.question, dirs: ["ceiling", "position"] },
  ops: { label: "Operations", question: DECISION_GROUPS.ops.question, dirs: ["production", "stock", "sales"] },
  hr: { label: "People", question: DECISION_GROUPS.hr.question, dirs: ["people"] },
  finance: { label: "Finance", question: DECISION_GROUPS.finance.question, dirs: ["cash", "stock"] },
};

/** Which director's messages surface on which department screen. */
export const SCREEN_INBOX_SOURCES: Record<string, string[]> = {
  marketing: ["market"],
  sales: ["sales"],
  rnd: ["product"],
  ops: ["ops"],
  hr: ["people"],
  finance: ["cfo"],
};

export const SCREEN_TEACHING_NOTE: Record<string, string> = {
  marketing: "voice",
  sales: "capacity",
  rnd: "ceiling",
  ops: "installed",
  hr: "staffing",
  finance: "workingcap",
};

/* ── the closing reflection ───────────────────────────────────────── */

export const RISK_OPTIONS = [
  { id: "cash", label: "Running the cash balance down" },
  { id: "stock", label: "Building stock we may not sell" },
  { id: "quality", label: "Shipping with the product behind the market" },
  { id: "people", label: "Asking the team to carry more than it can" },
  { id: "share", label: "Losing ground to competitors while we fix something else" },
  { id: "debt", label: "Taking on debt and the interest that comes with it" },
  { id: "none", label: "Nothing material — this was a low-risk quarter" },
];

export const EXPECT_OPTIONS = [
  { id: "growfast", label: "Grow strongly" },
  { id: "growslow", label: "Grow modestly" },
  { id: "hold", label: "Hold roughly flat" },
  { id: "shrink", label: "Go backwards, deliberately" },
];

export const CRISIS_STEPS = ["Signal", "Evidence", "Your reading", "Direction", "Commitment"];

export const PIPELINE_STAGES = [
  { id: "idea", n: 1, label: "On the board", sub: "available, not started" },
  { id: "development", n: 2, label: "In development", sub: "funded, not yet shipped" },
  { id: "ready", n: 3, label: "Ships this quarter", sub: "lands at quarter end" },
  { id: "live", n: 4, label: "Shipped and selling", sub: "in the product now" },
];

export const PIPELINE_STAGE_BG: Record<string, string> = {
  idea: "bg-stone-700",
  development: "bg-amber-700",
  ready: "bg-teal-800",
  live: "bg-stone-900",
};

/* ── shared tone palettes ─────────────────────────────────────────── */

export const TONE_TEXT: Record<Tone, string> = {
  good: "text-teal-800",
  watch: "text-amber-700",
  bad: "text-rose-800",
  flat: "text-stone-900",
};

export const TONE_BAR: Record<Tone, string> = {
  good: "bg-teal-700",
  watch: "bg-amber-600",
  bad: "bg-rose-700",
  flat: "bg-stone-400",
};

export const TONE_CARD: Record<Tone, string> = {
  good: "bg-teal-50 border-teal-700",
  watch: "bg-amber-50 border-amber-600",
  bad: "bg-rose-50 border-rose-700",
  flat: "bg-white border-stone-300",
};

export const TICKER_TONE: Record<Tone, string> = {
  good: "text-teal-300",
  watch: "text-amber-300",
  bad: "text-rose-300",
  flat: "text-stone-200",
};

export const MESSAGE_TONE: Record<string, { border: string; tag: string; label: string }> = {
  critical: { border: "border-rose-700", tag: "bg-rose-800 text-white", label: "Urgent" },
  warning: { border: "border-amber-600", tag: "bg-amber-600 text-white", label: "Needs a view" },
  info: { border: "border-stone-400", tag: "bg-stone-700 text-white", label: "For information" },
};

/** Readiness level -> tone. Levels are the strings `readiness()` emits. */
export const LEVEL_TONE: Record<string, Tone> = {
  STRONG: "good",
  ADEQUATE: "good",
  TIGHT: "watch",
  EXCESS: "watch",
  OVERBUILT: "bad",
  CONSTRAINED: "watch",
  CRITICAL: "bad",
  NONE: "flat",
};

export { cr, inr, lakh, n0, n1, n2, pct };
