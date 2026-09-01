/**
 * The client for the backend-hosted Nadi Wear engine.
 *
 * The simulation is computed server-side (`app/engines/simulation/` in MyElin-Backend). This module
 * is the whole of the boundary: it calls the four endpoints and adapts the API's snake_case
 * payload into the camelCase shape the screens already read, so nothing downstream had to
 * change when the engine moved off the client.
 *
 *   POST .../simulation/preview  -- run a draft plan, see the pressure, persist nothing
 *   POST .../simulation/lock     -- commit and score the quarter
 *   GET  .../simulation/run      -- the whole run at any lifecycle point
 *   GET/POST .../simulation/endgame -- the Q4 term sheet, and signing one
 *
 * `preview` is what lets the in-quarter screens stay honest: it is the same engine that will
 * grade the quarter, so what the CEO is shown before committing and what happens after can
 * never disagree -- which was the one real risk in computing projections locally.
 */

import { authorizedFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type { ApiErrorBody } from "@/lib/api/types";
import { DEPARTMENTS } from "@/lib/simulation/constants";
import type {
  Alloc,
  Budget,
  CompanyState,
  CrisisInput,
  PayTermsId,
  PriorityId,
  ProductId,
  ProductState,
  QuarterResultShape,
  Reflection,
  WarrantyId,
} from "@/lib/simulation/types";

/** The budget is the screens' own shape -- re-exported so the API surface stays one import. */
export type { Budget };

/* ── transport ────────────────────────────────────────────────────── */

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");

  // `authorizedFetch`, not a bare `fetch`: these are the calls a CEO makes for an hour at a
  // stretch, so they are exactly the ones that outlive a Supabase access token. Going through
  // the shared client means a token nearing expiry is renewed before the call and a 401 is
  // retried once, instead of surfacing as "could not run the plan" halfway through the run.
  const res = await authorizedFetch(path, { ...init, headers });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { detail: text };
    }
  }
  if (!res.ok) {
    // FastAPI wraps a dict detail; unwrap it so `illegal_move` reads the same as elsewhere.
    const raw = (body ?? {}) as { detail?: unknown };
    const inner = raw.detail && typeof raw.detail === "object" ? raw.detail : raw;
    throw new ApiError(res.status, inner as ApiErrorBody);
  }
  return body as T;
}

/* ── key adaptation ───────────────────────────────────────────────── */

const snakeToCamel = (k: string) => k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/**
 * The handful of fields whose frontend name is not just the camelCase of the backend's.
 * Kept explicit rather than renamed on either side: the backend name is the one that reads
 * correctly in Python, and the frontend name is the one ~40 screen call sites already use.
 */
const KEY_OVERRIDES: Record<string, string> = {
  revenue_total: "revenueT",
  net_cf: "netCF",
  operating_cf: "operatingCF",
  investing_cf: "investingCF",
  financing_cf: "financingCF",
  next_state: "next",
  products_in: "P",
  crisis_variant: "crisisVariant",
  crisis_strategy: "crisisStrategy",
  channel_leads: "mk",
  ip_asset: "ipAsset",
  ar_close: "arClose",
  ap_close: "apClose",
};

/** Numbers arrive as Decimal strings; anything numeric-looking becomes a number. */
function adaptValue(value: unknown): unknown {
  if (typeof value === "string") {
    // Only convert strings that are wholly numeric -- labels and notes must survive intact.
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
    return value;
  }
  if (Array.isArray(value)) return value.map(adaptValue);
  if (value && typeof value === "object") return adaptKeys(value as Record<string, unknown>);
  return value;
}

function adaptKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = KEY_OVERRIDES[k] ?? snakeToCamel(k);
    out[key] = adaptValue(v);
  }
  return out;
}

/** Product ids and line keys are data, not field names -- they must not be camelised. */
const LEAF_MAPS = new Set(["lines", "staff", "products", "pipeline", "lastMix", "staffing", "need",
  "effHeads", "avail", "sold", "invOut", "revenue", "unitCost", "wac", "built", "effPrice",
  "priceInfo", "demandWeight", "mk", "aftermath"]);

/** Backend line id -> the id the screens and `DETAIL_SCREENS` use. Inverse of `LINE_NAME_OUT`. */
const LINE_NAME_IN: Record<string, string> = {
  sales_training: "salesTraining",
  hr_training: "hrTraining",
  working_capital: "workingCapital",
};

function adaptResult(raw: Record<string, unknown>): QuarterResultShape {
  const out = adaptKeys(raw) as Record<string, unknown>;
  // Re-key the maps that were camelised by mistake: their keys are ids like `sales_training`.
  for (const name of LEAF_MAPS) {
    const original = Object.keys(raw).find((k) => (KEY_OVERRIDES[k] ?? snakeToCamel(k)) === name);
    if (original && raw[original] && typeof raw[original] === "object" && !Array.isArray(raw[original])) {
      out[name] = Object.fromEntries(
        Object.entries(raw[original] as Record<string, unknown>).map(([k, v]) => [
          LINE_NAME_IN[k] ?? k,
          adaptValue(v),
        ]),
      );
    }
  }

  // `A` is what every screen calls the numeric allocation; the API calls it `lines`.
  out.A = out.lines;

  // The API returns short-staffed functions as ids; the screens render their names and the
  // "if you are short here" copy, which only the frontend catalog carries.
  const shortIds = (raw.short_roles as string[]) ?? [];
  out.shortRoles = shortIds
    .map((id) => DEPARTMENTS.find((d) => d.id === id))
    .filter(Boolean);

  return out as unknown as QuarterResultShape;
}

function adaptState(raw: Record<string, unknown>): CompanyState {
  const out = adaptKeys(raw) as Record<string, unknown>;
  for (const name of ["staff", "products", "pipeline", "lastMix", "aftermath"]) {
    const original = Object.keys(raw).find((k) => snakeToCamel(k) === name);
    if (original && raw[original] && typeof raw[original] === "object") {
      out[name] = Object.fromEntries(
        Object.entries(raw[original] as Record<string, unknown>).map(([k, v]) => [k, adaptValue(v)]),
      );
    }
  }
  // ProductState's own fields do need camelising (`inv_cost` -> `invCost`).
  if (out.products) {
    out.products = Object.fromEntries(
      Object.entries(out.products as Record<string, unknown>).map(([id, p]) => [
        id,
        adaptKeys(p as Record<string, unknown>),
      ]),
    );
  }
  return out as unknown as CompanyState;
}

/* ── the payload the API expects ──────────────────────────────────── */

export type QuarterPlan = {
  lines: Alloc;
  warranty: WarrantyId;
  payTerms: PayTermsId;
  startInno: string[];
  products: Record<ProductId, ProductState> | null;
  priority: PriorityId | null;
  reflection: Reflection;
  crisis: CrisisInput;
};

/** The simulation's line ids in the backend's spelling. Only two differ. */
const LINE_NAME_OUT: Record<string, string> = {
  salesTraining: "sales_training",
  hrTraining: "hr_training",
  workingCapital: "working_capital",
};

const outLines = (lines: Alloc) =>
  Object.fromEntries(Object.entries(lines).map(([k, v]) => [LINE_NAME_OUT[k] ?? k, v === "" ? 0 : Number(v)]));

const outProducts = (products: Record<ProductId, ProductState> | null) =>
  products
    ? Object.fromEntries(
      Object.entries(products).map(([id, p]) => [
        id,
        { live: p.live, status: p.status, price: p.price, share: p.share, inv: p.inv, inv_cost: p.invCost },
      ]),
    )
    : null;

function toPayload(plan: QuarterPlan) {
  return {
    lines: outLines(plan.lines),
    warranty: plan.warranty,
    pay_terms: plan.payTerms,
    start_inno: plan.startInno,
    products: outProducts(plan.products),
    priority: plan.priority,
    reflection: plan.reflection,
    crisis: {
      // `variant` is deliberately omitted: the server assigns the archetype and overrides
      // whatever a client sends, so a crisis cannot be chosen or dodged from here.
      diagnosis: plan.crisis.diagnosis,
      reasoning: plan.crisis.reasoning,
      strategy: plan.crisis.strategy,
      commit: plan.crisis.commit === "" ? 0 : Number(plan.crisis.commit),
    },
  };
}

/* ── responses ────────────────────────────────────────────────────── */

export type CrisisBriefing = {
  archetype: string;
  scenarioCode: string | null;
  name: string;
  signal: string;
  body: string;
  diagnoses: { id: string; label: string }[];
  strategies: { id: string; name: string; thesis: string; gain: string; risk: string }[];
  /** What each function is seeing. Symptoms only -- the exposure number never leaves the server. */
  evidence: { fn: string; line: string; detail: string; tone: string }[];
  level: number;
  ignoringIsLegal: boolean;
};

export type PreviewResponse = {
  quarter: number;
  openingState: CompanyState;
  projection: QuarterResultShape;
  budget: Budget;
  crisis: CrisisBriefing | null;
  commitReading: { band: string; strain: string; line: string; trade: string } | null;
  legalMoves: string[];
};

export type TraitScore = {
  name: string;
  weight: number;
  subs: { label: string; level: "full" | "part" | "none"; detail: string; points: number }[];
  points: number;
};

export type QuarterScore = {
  traits: TraitScore[];
  traitTotal: number;
  modifiers: { points: number; why: string }[];
  modifierTotal: number;
  final: number;
  band: string;
};

export type LockResponse = {
  quarter: number;
  result: QuarterResultShape;
  score: QuarterScore;
  settlement: {
    path: string;
    modifiers: { points: number; why: string }[];
    finalValuation: number;
    endedEarly: boolean;
    price: number | null;
    gap: number | null;
    covenantHit: boolean | null;
    covenant: number | null;
    equity: number | null;
    gameOver: boolean;
  } | null;
  nextState: CompanyState;
  legalMoves: string[];
};

export type RunResponse = {
  companyId: string;
  totalQuarters: number;
  crisisQuarter: number;
  currentQuarter: number | null;
  quartersLocked: number;
  runStatus: "active" | "completed";
  state: CompanyState;
  legalMoves: string[];
  crisis: CrisisBriefing | null;
  scoreTrajectory: { quarterNumber: number; ceoScore: number; band: string }[];
  history: QuarterResultShape[];
  scores: QuarterScore[];
  endgamePath: string | null;
  rewindsUsed: number;
  /** The frozen Q4 term-sheet outcome, present only once a completed run is reopened. */
  settlement?: Record<string, unknown> | null;
};

export type RewindResponse = {
  targetQuarter: number;
  deletedQuarters: number[];
  rewindsUsed: number;
  rewindsRemaining: number;
};

export type EndgameResponse = {
  tier: "THRIVING" | "STABLE" | "DISTRESSED";
  q3ValuationInr: number;
  momentum: number;
  trueContinuationValueInr: number;
  termSheetMenu: { pathAName: string; pathBName: string; pathCName: string };
  offers: {
    id: "A" | "B" | "C";
    kind: string;
    title: string;
    who: string;
    pitch: string;
    terms: [string, string][];
    price: number | null;
    investment: number | null;
    equity: number | null;
    covenant: number | null;
  }[];
  chosenPath: string | null;
  chosenTermSheet: string | null;
};

/* ── the API ──────────────────────────────────────────────────────── */

export const simulationApi = {
  async run(companyId: string): Promise<RunResponse> {
    const raw = await request<Record<string, unknown>>(`/companies/${companyId}/simulation/run`);
    const out = adaptKeys(raw) as unknown as RunResponse;
    out.state = adaptState(raw.state as Record<string, unknown>);
    out.history = (raw.history as Record<string, unknown>[]).map(adaptResult);
    return out;
  },

  async preview(companyId: string, plan: QuarterPlan): Promise<PreviewResponse> {
    const raw = await request<Record<string, unknown>>(`/companies/${companyId}/simulation/preview`, {
      method: "POST",
      body: JSON.stringify(toPayload(plan)),
    });
    const out = adaptKeys(raw) as unknown as PreviewResponse;
    out.openingState = adaptState(raw.opening_state as Record<string, unknown>);
    out.projection = adaptResult(raw.projection as Record<string, unknown>);
    return out;
  },

  async lock(companyId: string, plan: QuarterPlan): Promise<LockResponse> {
    const raw = await request<Record<string, unknown>>(`/companies/${companyId}/simulation/lock`, {
      method: "POST",
      body: JSON.stringify(toPayload(plan)),
    });
    const out = adaptKeys(raw) as unknown as LockResponse;
    out.result = adaptResult(raw.result as Record<string, unknown>);
    out.nextState = adaptState(raw.next_state as Record<string, unknown>);
    return out;
  },

  endgame: (companyId: string) =>
    request<Record<string, unknown>>(`/companies/${companyId}/simulation/endgame`).then(
      (raw) => adaptKeys(raw) as unknown as EndgameResponse,
    ),

  signTermSheet: (companyId: string, path: "A" | "B" | "C", termSheetName: string, reasoning: string) =>
    request<{ path: string; term_sheet_name: string; tier: string; ends_early: boolean }>(
      `/companies/${companyId}/simulation/endgame`,
      { method: "POST", body: JSON.stringify({ path, term_sheet_name: termSheetName, reasoning }) },
    ).then((raw) => adaptKeys(raw) as unknown as { path: string; termSheetName: string; tier: string; endsEarly: boolean }),

  rewind: (companyId: string, targetQuarter: number): Promise<RewindResponse> =>
    request<Record<string, unknown>>(
      `/companies/${companyId}/simulation/rewind`,
      { method: "POST", body: JSON.stringify({ target_quarter: targetQuarter }) },
    ).then((raw) => adaptKeys(raw) as unknown as RewindResponse),
};
