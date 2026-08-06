"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setActiveCompanyId } from "@/lib/api/client";
import type {
  CompanyDetailResponse,
  Move,
  QuarterAllocationResponse,
  QuarterDetailResponse,
  QuarterReportResponse,
  RunStateResponse,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

type RunContextValue = {
  companyId: string;
  company: CompanyDetailResponse | null;
  run: RunStateResponse | null;
  quarter: QuarterDetailResponse | null;
  allocations: QuarterAllocationResponse | null;
  report: QuarterReportResponse | null;
  loading: boolean;
  error: string | null;
  can: (move: Move) => boolean;
  refresh: () => Promise<void>;
  openQuarter: () => Promise<QuarterDetailResponse>;
  lockQuarter: () => Promise<QuarterReportResponse | null>;
  loadReport: (quarterId?: string) => Promise<QuarterReportResponse | null>;
  setAllocations: (a: QuarterAllocationResponse) => void;
};

const RunContext = createContext<RunContextValue | null>(null);

export function RunProvider({
  companyId,
  children,
}: {
  companyId: string;
  children: React.ReactNode;
}) {
  const [company, setCompany] = useState<CompanyDetailResponse | null>(null);
  const [run, setRun] = useState<RunStateResponse | null>(null);
  const [quarter, setQuarter] = useState<QuarterDetailResponse | null>(null);
  const [allocations, setAllocations] =
    useState<QuarterAllocationResponse | null>(null);
  const [report, setReport] = useState<QuarterReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [c, r] = await Promise.all([
        api.getCompany(companyId),
        api.getRun(companyId),
      ]);
      setCompany(c);
      setRun(r);
      setActiveCompanyId(companyId);

      if (r.current_quarter_id) {
        const q = await api.getQuarter(companyId, r.current_quarter_id);
        setQuarter(q);
        if (r.legal_moves.includes("read_quarter_report") && r.current_quarter_status === "closed") {
          try {
            const rep = await api.getReport(companyId, r.current_quarter_id);
            setReport(rep);
          } catch {
            /* report may not exist yet */
          }
        }
      } else {
        setQuarter(null);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load run state from the API.",
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const openQuarter = useCallback(async (): Promise<QuarterDetailResponse> => {
    setError(null);
    try {
      const q = await api.openQuarter(companyId);
      setQuarter(q);
      await refresh();
      return q;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open quarter");
      throw err;
    }
  }, [companyId, refresh]);

  const lockQuarter = useCallback(async () => {
    const quarterId = run?.current_quarter_id;
    if (!quarterId) return null;
    setError(null);
    try {
      const rep = await api.lockQuarter(companyId, quarterId);
      setReport(rep);
      await refresh();
      return rep;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not lock quarter");
      throw err;
    }
  }, [companyId, run, refresh]);

  const loadReport = useCallback(
    async (quarterId?: string) => {
      const qid = quarterId ?? run?.current_quarter_id;
      if (!qid) return null;
      const rep = await api.getReport(companyId, qid);
      setReport(rep);
      return rep;
    },
    [companyId, run],
  );

  const can = useCallback(
    (move: Move) => Boolean(run?.legal_moves.includes(move)),
    [run],
  );

  const value = useMemo(
    () => ({
      companyId,
      company,
      run,
      quarter,
      allocations,
      report,
      loading,
      error,
      can,
      refresh,
      openQuarter,
      lockQuarter,
      loadReport,
      setAllocations,
    }),
    [
      companyId,
      company,
      run,
      quarter,
      allocations,
      report,
      loading,
      error,
      can,
      refresh,
      openQuarter,
      lockQuarter,
      loadReport,
    ],
  );

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun() {
  const ctx = useContext(RunContext);
  if (!ctx) throw new Error("useRun must be used inside RunProvider");
  return ctx;
}
