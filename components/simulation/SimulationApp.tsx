"use client";

/**
 * Nadi Wear — four quarters, computed by the backend.
 *
 * The simulation engine lives in `MyElin-Backend/app/engines/simulation/`. This component holds the
 * plan the CEO is building and nothing else: every number on every screen comes from the
 * server.
 *
 *   `preview`  runs the draft plan and returns the whole chain -- readiness, the binding gate,
 *              the directors' evidence, the budget -- without persisting anything. Debounced,
 *              so typing into a spend box stays responsive while the figures stay the API's.
 *   `lock`     commits and scores the quarter.
 *
 * That split is the point: the screens can show pressure while the CEO decides without ever
 * leaking the revenue, and what they were shown before committing is computed by the same
 * engine that grades them afterwards, so the two can never disagree.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import { useRun } from "@/components/run/RunProvider";
import {
  ARCHETYPES,
  DECISION_GROUPS,
  INITIAL_STATE,
  PRIORITY_BY_ID,
  SCREEN_META,
  emptyAlloc,
  numericAlloc,
} from "@/lib/simulation/constants";
import { inr } from "@/lib/simulation/format";
import {
  bindingConstraint,
  boardAsks,
  changesSince,
  companyHealth,
  inbox as buildInbox,
  readiness,
  tickerItems,
} from "@/lib/simulation/insights";
import { simulationApi } from "@/lib/simulation/remote";
import type {
  Budget as RemoteBudget,
  CrisisBriefing,
  QuarterPlan,
  QuarterScore,
} from "@/lib/simulation/remote";
import { Ticker, TeachingContext } from "@/components/simulation/Kit";
import { DepartmentScreen } from "@/components/simulation/Decisions";
import {
  FinancePanel,
  InnovationBoard,
  PeoplePanel,
  ProductFocus,
  ProductPortfolio,
  WarrantyPanel,
} from "@/components/simulation/Panels";
import { IntroScreen } from "@/components/simulation/screens/Intro";
import { BriefingScreen } from "@/components/simulation/screens/Briefing";
import { DashboardScreen } from "@/components/simulation/screens/Dashboard";
import { CrisisScreen } from "@/components/simulation/screens/Crisis";
import { ReviewScreen } from "@/components/simulation/screens/Review";
import { ClosedScreen } from "@/components/simulation/screens/Closed";
import { TermSheetScreen } from "@/components/simulation/screens/TermSheet";
import { FinalScreen } from "@/components/simulation/screens/Final";
import { PrinciplesScreen } from "@/components/simulation/screens/Principles";
import type {
  Alloc,
  ArchetypeId,
  CompanyState,
  CrisisInput,
  PayTermsId,
  PriorityId,
  ProductId,
  ProductState,
  QuarterResultShape,
  Reflection,
  TermSheet,
  WarrantyId,
} from "@/lib/simulation/types";

type Phase = "intro" | "briefing" | "play" | "closed" | "termsheet" | "final";

/** Screen ids the sidebar can deep-link to. Anything else falls back to the dashboard. */
export const SIMULATION_TABS = [
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

const emptyCrisis = (): CrisisInput => ({ diagnosis: null, reasoning: "", strategy: null, commit: "" });

const EMPTY_BUDGET: RemoteBudget = {
  opex: 0, capex: 0, inno: 0, people: 0, repay: 0, drawn: 0, committed: 0, ceiling: 0,
};

export function SimulationApp() {
  const { companyId, company } = useRun();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ── what the server says ─────────────────────────────────────── */

  const [state, setState] = useState<CompanyState>(INITIAL_STATE);
  const [history, setHistory] = useState<QuarterResultShape[]>([]);
  const [scores, setScores] = useState<QuarterScore[]>([]);
  const [briefing, setBriefing] = useState<CrisisBriefing | null>(null);
  const [runStatus, setRunStatus] = useState<"active" | "completed">("active");

  /* ── the plan being built ─────────────────────────────────────── */

  const [alloc, setAlloc] = useState<Alloc>(emptyAlloc);
  const [warranty, setWarranty] = useState<WarrantyId>("6mo");
  const [payTerms, setPayTerms] = useState<PayTermsId>("net30");
  const [startInno, setStartInno] = useState<string[]>([]);
  const [products, setProducts] = useState<Record<ProductId, ProductState>>(INITIAL_STATE.products);
  const [priority, setPriority] = useState<PriorityId | null>(null);
  const [reflection, setReflection] = useState<Reflection>({ sacrifice: [] });
  const [crisis, setCrisis] = useState<CrisisInput>(emptyCrisis);
  const [priorities, setPriorities] = useState<(PriorityId | null)[]>([]);

  /* ── what the preview returned for it ─────────────────────────── */

  const [projection, setProjection] = useState<QuarterResultShape | null>(null);
  const [budget, setBudget] = useState<RemoteBudget>(EMPTY_BUDGET);
  const [commitReading, setCommitReading] = useState<{ band: string; strain: string; line: string; trade: string } | null>(null);

  /* ── chrome and lifecycle ─────────────────────────────────────── */

  const [phase, setPhase] = useState<Phase>("intro");
  const [advanced, setAdvanced] = useState(false);
  const [notesOn, setNotesOn] = useState(true);
  const [ts, setTs] = useState<TermSheet | null>(null);
  const [endgameOutcome, setEndgameOutcome] = useState<Record<string, unknown> | null>(null);
  const [closed, setClosed] = useState<{ result: QuarterResultShape; score: QuarterScore } | null>(null);

  const [booting, setBooting] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlTab = searchParams.get("tab");
  const tab = urlTab && SIMULATION_TABS.some((t) => t.id === urlTab) ? urlTab : "dashboard";

  const setTab = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const resetPlan = useCallback((next: CompanyState) => {
    setAlloc(emptyAlloc());
    setWarranty("6mo");
    setStartInno([]);
    setProducts(next.products);
    setPayTerms(next.payTerms);
    setPriority(null);
    setReflection({ sacrifice: [] });
    setCrisis(emptyCrisis());
    setAdvanced(false);
    setProjection(null);
  }, []);

  /* ── load the run ─────────────────────────────────────────────── */

  const loadRun = useCallback(async () => {
    const run = await simulationApi.run(companyId);
    setState(run.state);
    setHistory(run.history);
    setScores(run.scores);
    setBriefing(run.crisis);
    setRunStatus(run.runStatus);
    setPriorities(
      run.history.map((h) => ((h as Record<string, unknown>).priority as PriorityId | null) ?? null),
    );
    return run;
  }, [companyId]);

  /**
   * No `didRun` ref guards this. Under StrictMode the effect is deliberately invoked twice, and
   * a ref guard would let the first (already-cancelled) pass claim the slot while the second
   * returned early -- leaving the page on its loading state forever.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const run = await loadRun();
        if (cancelled) return;
        resetPlan(run.state);
        setPhase(
          run.runStatus === "completed" ? "final" : run.quartersLocked === 0 ? "intro" : "briefing",
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load this run.");
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRun, resetPlan]);

  /* ── the live projection, from the server ─────────────────────── */

  const plan: QuarterPlan = useMemo(
    () => ({ lines: alloc, warranty, payTerms, startInno, products, priority, reflection, crisis }),
    [alloc, warranty, payTerms, startInno, products, priority, reflection, crisis],
  );

  /**
   * Debounced so a spend box stays responsive: the CEO types, and 350ms after they stop the
   * server re-runs the whole quarter. Every in-flight preview is superseded by the next, so a
   * slow response can never overwrite a newer one.
   */
  useEffect(() => {
    if (phase !== "play" && phase !== "briefing") return;
    if (runStatus === "completed") return;

    let cancelled = false;
    const timer = setTimeout(() => {
      simulationApi
        .preview(companyId, plan)
        .then((pv) => {
          if (cancelled) return;
          setProjection(pv.projection);
          setBudget(pv.budget);
          setCommitReading(pv.commitReading);
          if (pv.crisis) setBriefing(pv.crisis);
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not run the plan.");
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [companyId, plan, phase, runStatus]);

  /* ── derived readings (pure functions of the server's result) ─── */

  const last = history[history.length - 1];
  const prior = history[history.length - 2];
  const archId = (briefing?.archetype as ArchetypeId) ?? null;
  const crisisLive = Boolean(briefing);

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

  const A = useMemo(() => numericAlloc(alloc), [alloc]);
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

  /* ── lifecycle actions ────────────────────────────────────────── */

  const startQuarter = useCallback(() => {
    setPhase("play");
    setTab("dashboard");
  }, [setTab]);

  const closeQuarter = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const locked = await simulationApi.lock(companyId, plan);
      setClosed({ result: locked.result, score: locked.score });
      setHistory((h) => [...h, locked.result]);
      setScores((s) => [...s, locked.score]);
      setPriorities((p) => [...p, priority]);
      setState(locked.nextState);
      if (locked.settlement) setEndgameOutcome(locked.settlement as unknown as Record<string, unknown>);
      if (locked.quarter >= 4) setRunStatus("completed");
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
  }, [companyId, plan, priority]);

  const afterClosed = useCallback(async () => {
    const justClosed = closed?.result.q as number;
    if (justClosed === 4) {
      setPhase("final");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const run = await loadRun();
      resetPlan(run.state);

      if (justClosed === 3) {
        // Q3 has closed: the term sheet is now real and has to be signed before Q4 locks.
        const eg = await simulationApi.endgame(companyId);
        setTs({
          tier: eg.tier,
          V: eg.q3ValuationInr,
          M: eg.momentum,
          trueContinuation: eg.trueContinuationValueInr,
          offers: eg.offers as unknown as TermSheet["offers"],
          q1: history[0],
          q2: history[1],
          q3: history[2],
        });
        setPhase("termsheet");
      } else {
        setPhase("briefing");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open the next quarter.");
    } finally {
      setBusy(false);
    }
  }, [closed, companyId, history, loadRun, resetPlan]);

  const acceptDeal = useCallback(
    async (path: "A" | "B" | "C", termSheetName: string, reasoning: string) => {
      setBusy(true);
      setError(null);
      try {
        await simulationApi.signTermSheet(companyId, path, termSheetName, reasoning);
        setPhase("briefing");
        setTab("dashboard");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not record that decision.");
      } finally {
        setBusy(false);
      }
    },
    [companyId, setTab],
  );

  const restart = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await api.createCompany({ name: (company?.name ?? "Nadi Wear") + " (rerun)" });
      window.location.href = `/run/${created.id}/simulation`;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start a new run.");
      setBusy(false);
    }
  }, [company]);

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
      <div className="simulation min-h-full bg-stone-100 text-stone-900">
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
                    {t.badge > 0 && <span className="px-1.5 bg-rose-700 text-white text-xs font-mono">{t.badge}</span>}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {showNav && <Ticker items={ticker} />}
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">{body}</main>

        <footer className="max-w-6xl mx-auto px-4 pb-10 pt-2 text-xs text-stone-400 font-mono">
          Teaching simulation. All figures fictional. Every number is computed by the MyElin engine.
        </footer>
      </div>
    </TeachingContext.Provider>
  );

  const errorBanner = error && (
    <div className="border-l-4 border-rose-700 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>
  );

  /* ── render ───────────────────────────────────────────────────── */

  if (booting) {
    return (
      <div className="simulation flex min-h-[60vh] items-center justify-center bg-stone-100 text-stone-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading your company…
      </div>
    );
  }

  if (phase === "intro") {
    return chrome(
      <div className="space-y-5">
        {errorBanner}
        <IntroScreen onStart={() => setPhase("briefing")} busy={busy} />
      </div>,
      false,
    );
  }

  if (phase === "briefing") {
    return chrome(
      <div className="space-y-5">
        {errorBanner}
        <BriefingScreen
          s={state}
          history={history}
          health={health}
          changes={changes}
          constraint={openingConstraint}
          board={board}
          priority={priority}
          setPriority={setPriority}
          onStart={startQuarter}
          busy={busy}
        />
      </div>,
      false,
    );
  }

  if (phase === "closed" && closed) {
    return chrome(
      <ClosedScreen
        r={closed.result}
        prior={history[history.length - 2]}
        score={closed.score}
        constraint={bindingConstraint(closed.result, closed.result.entering)}
        priority={priorities[priorities.length - 1] ?? null}
        reflection={reflection}
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
        eg={endgameOutcome}
        scores={scores}
        history={history}
        priorities={priorities}
        s={state}
        onRestart={restart}
        busy={busy}
      />,
      false,
    );
  }

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

        archId={archId}
        crisis={crisis}
        setCrisis={setCrisis}
        locked={false}
        budget={budget}
        briefing={briefing}
        commitReading={commitReading}
      />
    );
  } else if (tab === "crisis") {
    body = (
      <div className="border-l-4 border-stone-400 bg-white px-4 py-3 text-sm text-stone-700">
        No market event is live this quarter.
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
      {errorBanner}
      {!projection && (
        <div className="border-l-4 border-stone-400 bg-white px-4 py-3 text-sm text-stone-600">
          Running the plan…
        </div>
      )}
      {body}
    </div>,
    true,
  );
}

export { ARCHETYPES };
