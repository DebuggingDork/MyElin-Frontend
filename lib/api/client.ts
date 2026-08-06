import type {
  ApiErrorBody,
  AuthResponse,
  CompanyCreate,
  CompanyDetailResponse,
  CrisisAllocationSubmit,
  EndgameDecisionResponse,
  EndgameDecisionSubmit,
  EndgamePreviewResponse,
  FinanceAdminAllocationSubmit,
  HrAllocationSubmit,
  LeaderboardResponse,
  LoginRequest,
  MarketingAllocationSubmit,
  OperationsAllocationSubmit,
  QuarterAllocationResponse,
  QuarterDetailResponse,
  QuarterReportResponse,
  RegisterRequest,
  RndAllocationSubmit,
  RunStateResponse,
  SalesAllocationSubmit,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

const TOKEN_KEY = "myelin_access_token";
const REFRESH_KEY = "myelin_refresh_token";
const USER_KEY = "myelin_user";
const COMPANY_KEY = "myelin_active_company";

export function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000"
  );
}

export type StoredUser = { user_id: string; email: string };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function getActiveCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(COMPANY_KEY);
}

export function setActiveCompanyId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(COMPANY_KEY, id);
  else window.localStorage.removeItem(COMPANY_KEY);
}

export function persistSession(auth: AuthResponse) {
  window.localStorage.setItem(TOKEN_KEY, auth.access_token);
  if (auth.refresh_token) {
    window.localStorage.setItem(REFRESH_KEY, auth.refresh_token);
  }
  window.localStorage.setItem(
    USER_KEY,
    JSON.stringify({ user_id: auth.user_id, email: auth.email }),
  );
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(COMPANY_KEY);
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${getApiBase()}${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;

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
    throw new ApiError(res.status, (body ?? {}) as ApiErrorBody);
  }
  return body as T;
}

function moneyPayload<T extends Record<string, unknown>>(data: T): T {
  // Backend Decimals accept number or string; send numbers for simplicity.
  return data;
}

/* ── Auth ─────────────────────────────────────────────────────── */

export const api = {
  health: () => request<{ status: string }>("/health", {}, false),

  register: (body: RegisterRequest) =>
    request<AuthResponse>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(body) },
      false,
    ),

  login: (body: LoginRequest) =>
    request<AuthResponse>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(body) },
      false,
    ),

  /* ── Company / run ─────────────────────────────────────────── */

  createCompany: (body: CompanyCreate) =>
    request<CompanyDetailResponse>("/companies", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getCompany: (companyId: string) =>
    request<CompanyDetailResponse>(`/companies/${companyId}`),

  getRun: (companyId: string) =>
    request<RunStateResponse>(`/companies/${companyId}/run`),

  openQuarter: (companyId: string) =>
    request<QuarterDetailResponse>(`/companies/${companyId}/quarters`, {
      method: "POST",
    }),

  getQuarter: (companyId: string, quarterId: string) =>
    request<QuarterDetailResponse>(
      `/companies/${companyId}/quarters/${quarterId}`,
    ),

  /* ── Allocations (22-line model) ───────────────────────────── */

  submitMarketing: (
    companyId: string,
    quarterId: string,
    body: MarketingAllocationSubmit,
  ) =>
    request<QuarterAllocationResponse>(
      `/companies/${companyId}/quarters/${quarterId}/allocations/marketing`,
      { method: "POST", body: JSON.stringify(moneyPayload(body)) },
    ),

  submitSales: (
    companyId: string,
    quarterId: string,
    body: SalesAllocationSubmit,
  ) =>
    request<QuarterAllocationResponse>(
      `/companies/${companyId}/quarters/${quarterId}/allocations/sales`,
      { method: "POST", body: JSON.stringify(moneyPayload(body)) },
    ),

  submitRnd: (
    companyId: string,
    quarterId: string,
    body: RndAllocationSubmit,
  ) =>
    request<QuarterAllocationResponse>(
      `/companies/${companyId}/quarters/${quarterId}/allocations/rnd`,
      { method: "POST", body: JSON.stringify(moneyPayload(body)) },
    ),

  submitOperations: (
    companyId: string,
    quarterId: string,
    body: OperationsAllocationSubmit,
  ) =>
    request<QuarterAllocationResponse>(
      `/companies/${companyId}/quarters/${quarterId}/allocations/operations`,
      { method: "POST", body: JSON.stringify(moneyPayload(body)) },
    ),

  submitHr: (companyId: string, quarterId: string, body: HrAllocationSubmit) =>
    request<QuarterAllocationResponse>(
      `/companies/${companyId}/quarters/${quarterId}/allocations/hr`,
      { method: "POST", body: JSON.stringify(moneyPayload(body)) },
    ),

  submitFinanceAdmin: (
    companyId: string,
    quarterId: string,
    body: FinanceAdminAllocationSubmit,
  ) =>
    request<QuarterAllocationResponse>(
      `/companies/${companyId}/quarters/${quarterId}/allocations/finance_admin`,
      { method: "POST", body: JSON.stringify(moneyPayload(body)) },
    ),

  submitCrisis: (
    companyId: string,
    quarterId: string,
    body: CrisisAllocationSubmit,
  ) =>
    request<QuarterAllocationResponse>(
      `/companies/${companyId}/quarters/${quarterId}/allocations/crisis`,
      { method: "POST", body: JSON.stringify(moneyPayload(body)) },
    ),

  /* ── Lock / report / leaderboard / endgame ─────────────────── */

  lockQuarter: (companyId: string, quarterId: string) =>
    request<QuarterReportResponse>(
      `/companies/${companyId}/quarters/${quarterId}/lock`,
      { method: "POST" },
    ),

  getReport: (companyId: string, quarterId: string) =>
    request<QuarterReportResponse>(
      `/companies/${companyId}/quarters/${quarterId}/report`,
    ),

  getLeaderboard: (companyId: string) =>
    request<LeaderboardResponse>(`/companies/${companyId}/leaderboard`),

  getEndgame: (companyId: string, quarterId: string) =>
    request<EndgamePreviewResponse>(
      `/companies/${companyId}/quarters/${quarterId}/endgame`,
    ),

  submitEndgame: (
    companyId: string,
    quarterId: string,
    body: EndgameDecisionSubmit,
  ) =>
    request<EndgameDecisionResponse>(
      `/companies/${companyId}/quarters/${quarterId}/endgame`,
      { method: "POST", body: JSON.stringify(body) },
    ),
};
