"use client";

/**
 * Nadi Wear — four quarters, wired to the MyElin API.
 *
 * The screens, the decision surface and the projections are the shipped simulation. The
 * lifecycle is the backend's: a quarter is opened with `POST .../quarters`, the six
 * department allocations (plus the crisis line in Q3 and the endgame decision in Q4) are
 * submitted against it, and `POST .../lock` produces the report every closed-quarter figure
 * and the whole management assessment are then read from.
 *
 * The local engine still runs every quarter, because the API models none of the state these
 * screens need — headcount, morale, stock, supplier reliability, the innovation board, the
 * product portfolio. `reconcileState` folds the API's cash, units, revenue and valuation
 * back into that state after each lock so the two cannot drift over four quarters.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type {
  CrisisBriefingResponse,
  EndgamePreviewResponse,
  QuarterReportResponse,
} from "@/lib/api/types";
import { useRun } from "@/components/run/RunProvider";
import {
  ARCHETYPES,
  BUFFER,
  DECISION_GROUPS,
  INITIAL_STATE,
  INNOVATION_BY_ID,
  PRIORITY_BY_ID,
  SCREEN_META,
  capexLakh,
  emptyAlloc,
  numericAlloc,
  opexLakh,
  salaryBill,
} from "@/lib/nadi/constants";
import { inr, num } from "@/lib/nadi/format";
import { runQuarter } from "@/lib/nadi/engine";
import {
  bindingConstraint,
  boardAsks,
  changesSince,
  companyHealth,
  inbox as buildInbox,
  readiness,
  tickerItems,
} from "@/lib/nadi/insights";
import { buildTermSheet, settleEndgame } from "@/lib/nadi/scoring";
import {
  ARCHETYPE_FOR_SCENARIO,
  outcomeFromReport,
  reconcileResult,
  reconcileState,
  toAllocations,
  toCrisisAllocation,
} from "@/lib/nadi/backend";
import { Ticker, TeachingContext } from "@/components/nadi/Kit";
import { DepartmentScreen } from "@/components/nadi/Decisions";
import {
  FinancePanel,
  InnovationBoard,
  PeoplePanel,
  ProductFocus,
  ProductPortfolio,
  WarrantyPanel,
} from "@/components/nadi/Panels";
import { IntroScreen } from "@/components/nadi/screens/Intro";
import { BriefingScreen } from "@/components/nadi/screens/Briefing";
import { DashboardScreen } from "@/components/nadi/screens/Dashboard";
import { CrisisScreen } from "@/components/nadi/screens/Crisis";
import { ReviewScreen } from "@/components/nadi/screens/Review";
import { ClosedScreen } from "@/components/nadi/screens/Closed";
import { TermSheetScreen } from "@/components/nadi/screens/TermSheet";
import { FinalScreen } from "@/components/nadi/screens/Final";
import { PrinciplesScreen } from "@/components/nadi/screens/Principles";
import type {
  Alloc,
  ArchetypeId,
  CompanyState,
  CrisisInput,
  EndgameOutcome,
  PayTermsId,
  PriorityId,
  ProductId,
  ProductState,
  QuarterLogEntry,
  QuarterResultShape,
  Reflection,
  TermSheet,
  WarrantyId,
} from "@/lib/nadi/types";

type Phase = "intro" | "briefing" | "play" | "closed" | "termsheet" | "final";

const SAVE_VERSION = 1;
const saveKey = (companyId: string) => `nadi.run.${companyId}`;

type SavedRun = {
  v: number;
  log: QuarterLogEntry[];
  archId: ArchetypeId | null;
  deal: "A" | "B" | "C" | null;
  dealName: string | null;
};

const emptyCrisis = (): CrisisInput => ({ diagnosis: null, reasoning: "", strategy: null, commit: "" });

/** Screen ids the sidebar can deep-link to. Anything else falls back to the dashboard. */
export const NADI_TABS = [
  { id: "dashboard", label: "Company" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "rnd", label: "Product" },
  { id: "ops", label: "Operations" },
  { id: "hr", label: "People" },
  { id: "finance", label: "Finance" },
  { id: "crisis", label: "Market event" },
  { id: "learning", label: "Principles" },
  { id: "review", label: "Close the quarter" },
] as const;

export function NadiApp() {
  const { companyId, company, run, refresh } = useRun();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ── the simulation's own state ───────────────────────────────── */

  const [phase, setPhase] = useState<Phase>("intro");
  const [state, setState] = useState<CompanyState>(INITIAL_STATE);
  const [history, setHistory] = useState<QuarterResultShape[]>([]);
  const [reports, setReports] = useState<QuarterReportResponse[]>([]);
  const [priorities, setPriorities] = useState<(PriorityId | null)[]>([]);
  const [log, setLog] = useState<QuarterLogEntry[]>([]);

  const [alloc, setAlloc] = useState<Alloc>(emptyAlloc);
  const [warranty, setWarranty] = useState<WarrantyId>("6mo");
  const [payTerms, setPayTerms] = useState<PayTermsId>("net30");
  const [startInno, setStartInno] = useState<string[]>([]);
  const [products, setProducts] = useState<Record<ProductId, ProductState>>(INITIAL_STATE.products);
  const [priority, setPriority] = useState<PriorityId | null>(null);
  const [reflection, setReflection] = useState<Reflection>({ sacrifice: [] });
  const [crisis, setCrisis] = useState<CrisisInput>(emptyCrisis);

  const [advanced, setAdvanced] = useState(false);
  const [notesOn, setNotesOn] = useState(true);

  /**
   * The active screen lives in the URL and nowhere else, so the run sidebar can link
   * straight to one and there is no second copy to keep in step. `replace`, not `push`:
   * moving between screens inside a quarter is not a navigation worth unwinding one step at
   * a time.
   */
  const urlTab = searchParams.get("tab");
  const tab = urlTab && NADI_TABS.some((t) => t.id === urlTab) ? urlTab : "dashboard";

  const setTab = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const [archId, setArchId] = useState<ArchetypeId | null>(null);
  const [briefing, setBriefing] = useState<CrisisBriefingResponse | null>(null);
  const [preview, setPreview] = useState<EndgamePreviewResponse | null>(null);
  const [ts, setTs] = useState<TermSheet | null>(null);
  const [deal, setDeal] = useState<"A" | "B" | "C" | null>(null);
  const [dealName, setDealName] = useState<string | null>(null);
  const [eg, setEg] = useState<EndgameOutcome | null>(null);

  const [closedResult, setClosedResult] = useState<QuarterResultShape | null>(null);
  const [closedReport, setClosedReport] = useState<QuarterReportResponse | null>(null);

  const [booting, setBooting] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── persistence ──────────────────────────────────────────────── */

  const persist = useCallback(
    (nextLog: QuarterLogEntry[], nextArch: ArchetypeId | null, nextDeal: "A" | "B" | "C" | null, name: string | null) => {
      if (typeof window === "undefined") return;
      try {
        const payload: SavedRun = { v: SAVE_VERSION, log: nextLog, archId: nextArch, deal: nextDeal, dealName: name };
        window.localStorage.setItem(saveKey(companyId), JSON.stringify(payload));
      } catch {
        /* a full or blocked localStorage must not break the run */
      }
    },
    [companyId],
  );

  const readSave = useCallback((): SavedRun | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(saveKey(companyId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SavedRun;
      return parsed && parsed.v === SAVE_VERSION && Array.isArray(parsed.log) ? parsed : null;
    } catch {
      return null;
    }
  }, [companyId]);

  /* ── resume: replay the local log against the locked reports ──── */

  const resetForQuarter = useCallback((next: CompanyState) => {
    setAlloc(emptyAlloc());
    setWarranty("6mo");
    setStartInno([]);
    setProducts(next.products);
    setPayTerms(next.payTerms);
    setPriority(null);
    setReflection({ sacrifice: [] });
    setAdvanced(false);
    // The screen is not reset here: every path out of a closed quarter lands on the briefing
    // or the term sheet, and the briefing's own "start the quarter" sets the screen.
  }, []);

  /**
   * Rebuild the run from the two records that survive a reload: the API's locked reports and
   * the local decision log. Replaying the log through the engine reproduces the state and
   * history the screens read; the reports supply the authoritative figures for each quarter.
   *
   * No `didRun` ref guards this. Under StrictMode the effect is deliberately invoked twice,
   * and a ref guard would let the first (already-cancelled) pass claim the slot while the
   * second returned early -- leaving the page on its loading state forever. Cancellation
   * alone is the correct guard: the second pass does the work and the first discards itself.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const detail = await api.getCompany(companyId);
        const closed = detail.quarters.filter((q) => q.status === "closed").sort((a, b) => a.number - b.number);

        const loadedReports: QuarterReportResponse[] = [];
        for (const q of closed) {
          try {
            loadedReports.push(await api.getReport(companyId, q.id));
          } catch {
            /* a quarter can be closed with its report unreadable; stop replaying there */
            break;
          }
        }

        const saved = readSave();
        const savedLog = saved ? saved.log : [];
        const arch = saved?.archId ?? null;

        let s = INITIAL_STATE;
        const replayHistory: QuarterResultShape[] = [];
        const replayPriorities: (PriorityId | null)[] = [];

        // Only replay as far as both a local decision record and a locked report exist.
        const replayable = Math.min(savedLog.length, loadedReports.length);
        for (let i = 0; i < replayable; i++) {
          const entry = savedLog[i];
          const result = runQuarter(
            s,
            entry.alloc,
            entry.warranty,
            entry.crisis && entry.crisis.strategy ? { ...entry.crisis, variant: arch ?? undefined } : null,
            entry.startInno || [],
            entry.payTerms,
            entry.products,
          );
          const outcome = outcomeFromReport(loadedReports[i]);
          replayHistory.push(reconcileResult(result, outcome));
          replayPriorities.push(entry.priority);
          s = reconcileState(result.next, result, outcome);
        }

        if (cancelled) return;

        setState(s);
        setHistory(replayHistory);
        setReports(loadedReports.slice(0, replayable));
        setPriorities(replayPriorities);
        setLog(savedLog.slice(0, replayable));
        setDeal(saved?.deal ?? null);
        setDealName(saved?.dealName ?? null);
        setArchId(arch);
        resetForQuarter(s);

        const terminal = detail.run_status === "completed" || detail.run_status === "failed";
        if (terminal && replayHistory.length >= 1) {
          setPhase("final");
        } else if (replayHistory.length === 0 && closed.length === 0) {
          setPhase("intro");
        } else {
          setPhase("briefing");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load this run from the API.");
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [companyId, readSave, resetForQuarter]);

  /* ── which market event is live ───────────────────────────────── */

  const crisisQuarter = run?.crisis_quarter ?? 3;
  const crisisLive = state.quarter >= crisisQuarter;

  useEffect(() => {
    const quarterId = run?.current_quarter_id;
    if (!quarterId || run?.current_quarter_number !== crisisQuarter) return;
    let cancelled = false;

    (async () => {
      try {
        const b = await api.getCrisisBriefing(companyId, quarterId);
        if (cancelled) return;
        setBriefing(b);
        // Which event fires is the API's call, not a local coin flip.
        const mapped = ARCHETYPE_FOR_SCENARIO[b.scenario_code];
        if (mapped) {
          setArchId(mapped);
          persist(log, mapped, deal, dealName);
        }
      } catch {
        /* 404 simply means this quarter carries no crisis */
      }
    })();

    return () => {
      cancelled = true;
    };
    // `log`/`deal`/`dealName` are only read to re-persist alongside the archetype.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, run?.current_quarter_id, run?.current_quarter_number, crisisQuarter]);

  /* ── the live projection every screen reads from ──────────────── */

  const A = useMemo(() => numericAlloc(alloc), [alloc]);

  const projection = useMemo(() => {
    try {
      return runQuarter(
        state,
        alloc,
        warranty,
        crisisLive && crisis.strategy && archId ? { ...crisis, variant: archId } : null,
        startInno,
        payTerms,
        products,
      );
    } catch {
      return null;
    }
  }, [state, alloc, warranty, crisisLive, crisis, archId, startInno, payTerms, products]);

  const last = history[history.length - 1];
  const prior = history[history.length - 2];

  const health = useMemo(() => companyHealth(state, last), [state, last]);
  const changes = useMemo(() => changesSince(prior, last), [prior, last]);
  const openingConstraint = useMemo(() => bindingConstraint(last ?? null, state), [last, state]);
  const liveConstraint = useMemo(() => bindingConstraint(projection, state), [projection, state]);
  const board = useMemo(() => boardAsks(state, last, history), [state, last, history]);
  const dirs = useMemo(() => readiness(projection, state), [projection, state]);
  const messages = useMemo(() => buildInbox(projection, state, history), [projection, state, history]);
  const ticker = useMemo(
    () => tickerItems(state, projection, history, liveConstraint),
    [state, projection, history, liveConstraint],
  );

  const budget = useMemo(() => {
    const opex = opexLakh(A) * 1e5;
    const capex = capexLakh(A) * 1e5;
    const inno = startInno.reduce((sum, id) => sum + INNOVATION_BY_ID[id].cost, 0);
    const people = projection ? (projection.peopleCost as number) : 0;
    const repay = A.repay * 1e5;
    const drawn = projection ? (projection.drawn as number) : 0;
    const fixed = projection
      ? (projection.salaries as number) + (projection.overhead as number)
      : salaryBill(state.staff) + state.overhead;

    return {
      opex,
      capex,
      inno,
      people,
      repay,
      drawn,
      committed: opex + capex + inno + people + repay,
      ceiling: Math.max(0, state.cash + drawn - fixed - BUFFER),
    };
  }, [A, projection, startInno, state]);

  const ctx = useMemo(
    () => ({
      s: state,
      A,
      alloc,
      mk: projection ? (projection.staffing as Record<string, number>).marketing : 1,
      sl: projection ? (projection.staffing as Record<string, number>).sales : 1,
      en: projection ? (projection.staffing as Record<string, number>).engineering : 1,
      op: projection ? (projection.staffing as Record<string, number>).operations : 1,
      sp: projection ? (projection.staffing as Record<string, number>).support : 1,
      ad: projection ? (projection.staffing as Record<string, number>).admin : 1,
    }),
    [state, A, alloc, projection],
  );

  /* ── the lifecycle ────────────────────────────────────────────── */

  const ensureQuarterOpen = useCallback(async (): Promise<string> => {
    const current = await api.getRun(companyId);
    if (current.current_quarter_id && current.current_quarter_status === "in_progress") {
      return current.current_quarter_id;
    }
    if (current.legal_moves.includes("open_next_quarter")) {
      const opened = await api.openQuarter(companyId);
      await refresh();
      return opened.id;
    }
    throw new ApiError(409, {
      error: "illegal_move",
      reason: "no quarter is open and this run cannot open another",
      allowed_moves: current.legal_moves,
    });
  }, [companyId, refresh]);

  const startQuarter = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await ensureQuarterOpen();
      setPhase(phase === "intro" ? "briefing" : "play");
      setTab("dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open the quarter.");
    } finally {
      setBusy(false);
    }
  }, [ensureQuarterOpen, phase, setTab]);

  const closeQuarter = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const quarterId = await ensureQuarterOpen();
      const payloads = toAllocations(alloc, warranty, startInno);

      await api.submitMarketing(companyId, quarterId, payloads.marketing);
      await api.submitSales(companyId, quarterId, payloads.sales);
      await api.submitRnd(companyId, quarterId, payloads.rnd);
      await api.submitOperations(companyId, quarterId, payloads.operations);
      await api.submitHr(companyId, quarterId, payloads.hr);
      await api.submitFinanceAdmin(companyId, quarterId, payloads.finance_admin);

      if (crisisLive && briefing) {
        await api.submitCrisis(companyId, quarterId, toCrisisAllocation(crisis.strategy, num(crisis.commit), briefing));
      }

      const report = await api.lockQuarter(companyId, quarterId);
      const outcome = outcomeFromReport(report);

      const result = runQuarter(
        state,
        alloc,
        warranty,
        crisisLive && crisis.strategy && archId ? { ...crisis, variant: archId } : null,
        startInno,
        payTerms,
        products,
      );
      const reconciled = reconcileResult(result, outcome);
      const nextState = reconcileState(result.next, result, outcome);

      const entry: QuarterLogEntry = {
        q: state.quarter,
        alloc,
        warranty,
        payTerms,
        startInno,
        products,
        priority,
        reflection,
        crisis: crisisLive ? { ...crisis } : null,
      };
      const nextLog = [...log, entry];

      setHistory((h) => [...h, reconciled]);
      setReports((r) => [...r, report]);
      setPriorities((p) => [...p, priority]);
      setLog(nextLog);
      setState(nextState);
      setClosedResult(reconciled);
      setClosedReport(report);
      persist(nextLog, archId, deal, dealName);

      // Path A's cheque and the covenant only settle once Q4 is on the record.
      if (state.quarter === 4 && ts && deal) {
        setEg(
          settleEndgame(ts, deal, {
            unitsSold: outcome.unitsSold,
            cash: outcome.closingCash,
            valuation: outcome.valuation ?? (result.valuation as number),
          }),
        );
      }

      await refresh();
      setPhase("closed");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message + (err.body.reason ? " — " + err.body.reason : "")
          : "Could not close the quarter.",
      );
    } finally {
      setBusy(false);
    }
  }, [
    alloc,
    archId,
    briefing,
    companyId,
    crisis,
    crisisLive,
    deal,
    dealName,
    ensureQuarterOpen,
    log,
    payTerms,
    persist,
    priority,
    products,
    reflection,
    refresh,
    startInno,
    state,
    ts,
    warranty,
  ]);

  const afterClosed = useCallback(async () => {
    const justClosed = closedResult ? (closedResult.q as number) : state.quarter - 1;

    if (justClosed === 4) {
      setPhase("final");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const quarterId = await ensureQuarterOpen();
      resetForQuarter(state);
      setCrisis((c) => (justClosed === 3 ? { ...c, commit: "" } : c));

      if (justClosed === 3) {
        // Q4 is now open, so the endgame preview is readable and the term sheet is real.
        let egPreview: EndgamePreviewResponse | null = null;
        try {
          egPreview = await api.getEndgame(companyId, quarterId);
        } catch {
          /* fall back to the locally derived tier below */
        }
        setPreview(egPreview);

        const tierMap: Record<string, "THRIVING" | "STABLE" | "DISTRESSED"> = {
          thriving: "THRIVING",
          stable: "STABLE",
          distressed: "DISTRESSED",
        };
        setTs(
          buildTermSheet(
            history,
            state,
            egPreview ? tierMap[egPreview.tier] : null,
            egPreview ? egPreview.term_sheet_menu : null,
          ),
        );
        setPhase("termsheet");
      } else {
        setPhase("briefing");
      }
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open the next quarter.");
    } finally {
      setBusy(false);
    }
  }, [closedResult, companyId, ensureQuarterOpen, history, refresh, resetForQuarter, state]);

  const acceptDeal = useCallback(
    async (path: "A" | "B" | "C", termSheetName: string, reasoning: string) => {
      setBusy(true);
      setError(null);
      try {
        const quarterId = await ensureQuarterOpen();
        await api.submitEndgame(companyId, quarterId, {
          path,
          term_sheet_name: termSheetName,
          reasoning: reasoning || null,
        });

        setDeal(path);
        setDealName(termSheetName);
        persist(log, archId, path, termSheetName);

        if (path === "B") {
          // The company is sold: Q4 does not happen. Lock it empty so the run completes on
          // the API too, rather than leaving an open quarter nobody will ever fill in.
          const report = await api.lockQuarter(companyId, quarterId);
          const outcome = outcomeFromReport(report);
          const result = runQuarter(state, emptyAlloc(), "6mo", null, [], payTerms, products);
          const reconciled = reconcileResult(result, outcome);

          setHistory((h) => [...h, reconciled]);
          setReports((r) => [...r, report]);
          setPriorities((p) => [...p, null]);
          setState(reconcileState(result.next, result, outcome));
          if (ts) {
            setEg(
              settleEndgame(ts, "B", {
                unitsSold: outcome.unitsSold,
                cash: outcome.closingCash,
                valuation: outcome.valuation ?? (result.valuation as number),
              }),
            );
          }
          await refresh();
          setPhase("final");
          return;
        }

        if (path === "A" && ts) {
          const offer = ts.offers.find((o) => o.id === "A");
          if (offer && offer.investment) {
            setState((s) => ({ ...s, cash: s.cash + (offer.investment as number) }));
          }
        }

        await refresh();
        setPhase("briefing");
        setTab("dashboard");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not record that decision.");
      } finally {
        setBusy(false);
      }
    },
    [archId, companyId, ensureQuarterOpen, log, payTerms, persist, products, refresh, setTab, state, ts],
  );

  const restart = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await api.createCompany({ name: (company?.name ?? "Nadi Wear") + " (rerun)" });
      if (typeof window !== "undefined") window.localStorage.removeItem(saveKey(companyId));
      window.location.href = `/run/${created.id}/nadi`;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start a new run.");
      setBusy(false);
    }
  }, [company, companyId]);

  /* ── chrome ───────────────────────────────────────────────────── */

  const tabs = [
    { id: "dashboard", label: "Company", badge: messages.filter((m) => m.tone === "critical").length, hot: false },
    ...Object.keys(SCREEN_META).map((id) => ({ id, label: SCREEN_META[id].label, badge: 0, hot: false })),
    ...(crisisLive ? [{ id: "crisis", label: "Market event", badge: 0, hot: true }] : []),
    { id: "learning", label: "Principles", badge: 0, hot: false },
    { id: "review", label: "Close the quarter", badge: 0, hot: false },
  ];

  const chrome = (body: React.ReactNode, showNav: boolean) => (
    <TeachingContext.Provider value={notesOn}>
      <div className="nadi min-h-full bg-stone-100 text-stone-900">
        <header className="bg-stone-900 text-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-xl">Nadi Wear</span>
              <span className="text-xs uppercase tracking-widest text-stone-500">Chief Executive</span>
            </div>

            {showNav && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-sm">
                <span>
                  <span className="text-stone-500 text-xs uppercase tracking-widest mr-2">Quarter</span>
                  {state.quarter}/4
                </span>
                <span>
                  <span className="text-stone-500 text-xs uppercase tracking-widest mr-2">Cash</span>
                  {inr(state.cash)}
                </span>
                {priority && (
                  <span className="text-teal-300">
                    <span className="text-stone-500 text-xs uppercase tracking-widest mr-2">Priority</span>
                    {PRIORITY_BY_ID[priority].name}
                  </span>
                )}
                <span className={budget.committed > budget.ceiling ? "text-rose-400" : "text-stone-300"}>
                  <span className="text-stone-500 text-xs uppercase tracking-widest mr-2">Left</span>
                  {inr(budget.ceiling - budget.committed)}
                </span>
                <button
                  onClick={() => setNotesOn(!notesOn)}
                  className={
                    "px-2 py-0.5 text-xs uppercase tracking-widest border " +
                    (notesOn ? "border-teal-500 text-teal-300" : "border-stone-600 text-stone-500")
                  }
                >
                  Notes {notesOn ? "on" : "off"}
                </button>
              </div>
            )}
          </div>

          {showNav && (
            <nav className="border-t border-stone-700">
              <div className="max-w-6xl mx-auto px-2 flex overflow-x-auto">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={
                      "px-3 py-2 text-sm whitespace-nowrap border-b-2 flex items-center gap-1.5 " +
                      (tab === t.id
                        ? "border-rose-500 text-white"
                        : t.hot
                          ? "border-transparent text-rose-400 hover:text-rose-200"
                          : "border-transparent text-stone-400 hover:text-white")
                    }
                  >
                    {t.label}
                    {t.badge > 0 && (
                      <span className="px-1.5 bg-rose-700 text-white text-xs font-mono">{t.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {showNav && <Ticker items={ticker} />}
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">{body}</main>

        <footer className="max-w-6xl mx-auto px-4 pb-10 pt-2 text-xs text-stone-400 font-mono">
          Teaching simulation. All figures fictional. Outcomes and scores are the MyElin engine&apos;s.
        </footer>
      </div>
    </TeachingContext.Provider>
  );

  /* ── render ───────────────────────────────────────────────────── */

  if (booting) {
    return (
      <div className="nadi flex min-h-[60vh] items-center justify-center bg-stone-100 text-stone-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading your company…
      </div>
    );
  }

  if (phase === "intro") {
    return chrome(
      <div className="space-y-5">
        {error && <div className="border-l-4 border-rose-700 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}
        <IntroScreen onStart={startQuarter} busy={busy} />
      </div>,
      false,
    );
  }

  if (phase === "briefing") {
    return chrome(
      <div className="space-y-5">
        {error && <div className="border-l-4 border-rose-700 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}
        <BriefingScreen
          s={state}
          history={history}
          health={health}
          changes={changes}
          constraint={openingConstraint}
          board={board}
          priority={priority}
          setPriority={setPriority}
          onStart={() => {
            setPhase("play");
            setTab("dashboard");
          }}
          busy={busy}
        />
      </div>,
      false,
    );
  }

  if (phase === "closed" && closedResult && closedReport) {
    return chrome(
      <ClosedScreen
        r={closedResult}
        prior={history[history.length - 2]}
        report={closedReport}
        constraint={bindingConstraint(closedResult, closedResult.entering)}
        priority={priorities[priorities.length - 1] ?? null}
        reflection={log[log.length - 1]?.reflection ?? {}}
        onNext={afterClosed}
        busy={busy}
      />,
      false,
    );
  }

  if (phase === "termsheet" && ts) {
    return chrome(<TermSheetScreen ts={ts} onAccept={acceptDeal} busy={busy} error={error} />, false);
  }

  if (phase === "final") {
    return chrome(
      <FinalScreen
        ts={ts}
        eg={eg}
        reports={reports}
        history={history}
        priorities={priorities}
        s={state}
        onRestart={restart}
        busy={busy}
      />,
      false,
    );
  }

  /* the play surface */

  let body: React.ReactNode;

  if (tab === "learning") {
    body = <PrinciplesScreen />;
  } else if (tab === "dashboard") {
    body = (
      <DashboardScreen
        s={state}
        history={history}
        health={health}
        constraint={liveConstraint}
        dirs={dirs}
        inbox={messages}
        priority={priority}
        budget={budget}
        onGo={() => setTab("review")}
      />
    );
  } else if (tab === "crisis" && archId) {
    body = (
      <CrisisScreen
        s={state}
        history={history}
        archId={archId}
        crisis={crisis}
        setCrisis={setCrisis}
        locked={state.quarter === 4}
        budget={budget}
        briefing={briefing}
      />
    );
  } else if (tab === "crisis") {
    body = (
      <div className="border-l-4 border-amber-600 bg-amber-50 px-4 py-3 text-sm text-stone-800">
        The market event for this quarter has not been read from the API yet. Reload the page if this persists.
      </div>
    );
  } else if (tab === "review") {
    body = (
      <ReviewScreen
        quarter={state.quarter}
        dirs={dirs}
        inbox={messages}
        constraint={liveConstraint}
        reflection={reflection}
        setReflection={setReflection}
        priority={priority}
        alloc={alloc}
        warranty={warranty}
        startInno={startInno}
        budget={budget}
        crisisLive={crisisLive}
        crisis={crisis}
        onClose={closeQuarter}
        busy={busy}
        error={error}
      />
    );
  } else if (DECISION_GROUPS[tab]) {
    body = (
      <DepartmentScreen
        id={tab}
        s={state}
        alloc={alloc}
        setAlloc={setAlloc}
        ctx={ctx}
        budget={budget}
        dirs={dirs}
        inbox={messages}
        advanced={advanced}
        setAdvanced={setAdvanced}
        extraTop={
          tab === "rnd" ? (
            <>
              <ProductFocus s={state} p={projection} last={last} startInno={startInno} alloc={alloc} />
              <ProductPortfolio s={state} products={products} setProducts={setProducts} p={projection} />
            </>
          ) : tab === "hr" ? (
            <PeoplePanel s={state} alloc={alloc} setAlloc={setAlloc} p={projection} />
          ) : null
        }
        extra={
          tab === "rnd" ? (
            <>
              <InnovationBoard s={state} startInno={startInno} setStartInno={setStartInno} p={projection} />
              <WarrantyPanel warranty={warranty} setWarranty={setWarranty} p={projection} />
            </>
          ) : tab === "finance" ? (
            <FinancePanel
              s={state}
              alloc={alloc}
              setAlloc={setAlloc}
              payTerms={payTerms}
              setPayTerms={setPayTerms}
              p={projection}
            />
          ) : null
        }
      />
    );
  } else {
    body = <div className="text-sm text-stone-600">Pick a screen above.</div>;
  }

  return chrome(
    <div className="space-y-5">
      {error && <div className="border-l-4 border-rose-700 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}
      {preview && state.quarter === 4 && (
        <div className="border-l-4 border-stone-800 bg-white px-4 py-3 text-sm text-stone-800">
          <span className="uppercase tracking-widest text-xs font-semibold text-stone-500 mr-2">Endgame</span>
          Classified {preview.tier}. {preview.tier_detail}
        </div>
      )}
      {body}
    </div>,
    true,
  );
}

export { ARCHETYPES };
