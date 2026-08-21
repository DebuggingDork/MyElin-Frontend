"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setActiveCompanyId } from "@/lib/api/client";
import { UnknownRunError, resolveRunRef, runHref } from "@/lib/run/ref";
import { asNumber } from "@/lib/api/catalog";
import type {
  CompanyDetailResponse,
  Move,
  QuarterAllocationResponse,
  QuarterDetailResponse,
  QuarterReportResponse,
  RunStateResponse,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { playQuarterClosed } from "@/lib/sound";

type RunContextValue = {
  /** The uuid. Every API call takes this; it is never put in a URL. */
  companyId: string;
  /** What the URL says -- the owner's run number. Every `/run/...` href is built from this. */
  runRef: string;
  /** `/run/<ref><path>`, so no screen has to remember which of the two identifiers a link takes. */
  href: (path?: string) => string;
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
  /** True once `quarter.allocations` exists -- the backend only creates that row on the first
   *  department POST, and Finance & Admin is the only department enabled before it exists, so
   *  this doubles as "the CEO has set finance for this quarter" without a dedicated flag. */
  financeUnlocked: boolean;
  /** Sum of all 22 saved spend lines (Rs lakhs) for the open quarter, straight off
   *  `quarter.allocations` -- the KPI bar's "allocated so far" and each department's
   *  remaining-cash reference both read this. */
  allocatedLakhs: number;
};

const RunContext = createContext<RunContextValue | null>(null);

export function RunProvider({
  runRef,
  children,
}: {
  runRef: string;
  children: React.ReactNode;
}) {
  /**
   * The uuid behind `runRef`, once it has been looked up, tagged with the reference it was
   * looked up *for*.
   *
   * Stored as a pair rather than a bare id so `companyId` can be derived below: navigating from
   * `/run/1` to `/run/2` must not leave run 1's uuid readable for the render between the new
   * `runRef` arriving and its lookup landing, and deriving it makes that impossible rather than
   * relying on an effect to clear it first.
   */
  const router = useRouter();
  const [resolved, setResolved] = useState<{ ref: string; companyId: string } | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const companyId = resolved?.ref === runRef ? resolved.companyId : null;
  const [company, setCompany] = useState<CompanyDetailResponse | null>(null);
  const [run, setRun] = useState<RunStateResponse | null>(null);
  const [quarter, setQuarter] = useState<QuarterDetailResponse | null>(null);
  const [allocations, setAllocations] =
    useState<QuarterAllocationResponse | null>(null);
  const [report, setReport] = useState<QuarterReportResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  /**
   * URL -> uuid, once per run reference.
   *
   * This is the only place the two ever meet. A uuid in the URL is accepted and then swapped
   * for its number, so links that predate the numbered URLs keep working and stop being
   * propagated at the same time.
   */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const match = await resolveRunRef(runRef);
        if (cancelled) return;
        setResolveError(null);
        setResolved({ ref: runRef, companyId: match.companyId });
        if (!match.canonical && typeof window !== "undefined") {
          // A uuid link resolved to a run this account owns: put the readable number in the
          // address bar. `replace`, not `push`, so back still goes where the CEO came from,
          // and the query string is carried across because `?tab=` is what the simulation
          // screen reads its section from. The second pass resolves off the cached list and
          // reports `canonical`, so this cannot loop.
          const rest = window.location.pathname.slice(runHref(runRef).length);
          router.replace(runHref(match.ref, rest) + window.location.search, { scroll: false });
        }
      } catch (err) {
        if (cancelled) return;
        setResolveError(
          err instanceof UnknownRunError
            ? err.message
            : err instanceof ApiError
              ? err.message
              : "Could not work out which run this is.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [runRef, router]);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setDataError(null);
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
      setDataError(
        err instanceof ApiError
          ? err.message
          : "Failed to load run state from the API.",
      );
    } finally {
      setDataLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const openQuarter = useCallback(async (): Promise<QuarterDetailResponse> => {
    if (!companyId) throw new Error("The run is still being resolved.");
    setDataError(null);
    try {
      const q = await api.openQuarter(companyId);
      setQuarter(q);
      await refresh();
      return q;
    } catch (err) {
      setDataError(err instanceof ApiError ? err.message : "Could not open quarter");
      throw err;
    }
  }, [companyId, refresh]);

  const lockQuarter = useCallback(async () => {
    const quarterId = run?.current_quarter_id;
    if (!quarterId || !companyId) return null;
    setDataError(null);
    try {
      const rep = await api.lockQuarter(companyId, quarterId);
      setReport(rep);
      // Same cue the four-quarter run uses when a report lands, fired here rather than on the
      // report screen: the browser only allows playback while the click that locked the
      // quarter is still the active gesture, and that is gone by the time the page changes.
      playQuarterClosed();
      await refresh();
      return rep;
    } catch (err) {
      setDataError(err instanceof ApiError ? err.message : "Could not lock quarter");
      throw err;
    }
  }, [companyId, run, refresh]);

  const loadReport = useCallback(
    async (quarterId?: string) => {
      const qid = quarterId ?? run?.current_quarter_id;
      if (!qid || !companyId) return null;
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

  const financeUnlocked = quarter?.allocations != null;
  const allocatedLakhs = useMemo(() => {
    const alloc = quarter?.allocations;
    if (!alloc) return 0;
    return Object.values(alloc).reduce<number>((sum, v) => sum + asNumber(v), 0);
  }, [quarter]);

  const href = useCallback((path = "") => runHref(runRef, path), [runRef]);

  /* A run that could not be resolved is not "still loading" -- `RunShell` needs to stop and
     show the reason rather than spin forever. */
  const loading = resolveError === null && (companyId === null || dataLoading);
  const error = resolveError ?? dataError;

  const value = useMemo(
    () => ({
      companyId: companyId ?? "",
      runRef,
      href,
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
      financeUnlocked,
      allocatedLakhs,
    }),
    [
      companyId,
      runRef,
      href,
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
      financeUnlocked,
      allocatedLakhs,
    ],
  );

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun() {
  const ctx = useContext(RunContext);
  if (!ctx) throw new Error("useRun must be used inside RunProvider");
  return ctx;
}
