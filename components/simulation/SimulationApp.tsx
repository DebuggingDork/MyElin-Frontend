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

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import { useRun } from "@/components/run/RunProvider";
import { forgetRunIndex, runHref } from "@/lib/run/ref";
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
import { InlineLoading, PageLoading, ProcessingOverlay } from "@/components/ui/Loading";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
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

/**
 * A named, multi-second wait the CEO is shown by name.
 *
 * `dismiss` is the label on the way out of the *failed* version of this wait -- it says where
 * the reader lands if the engine refuses, which is always the screen they submitted from.
 */
type Working = { title: string; message: string; dismiss: string };

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

/**
 * Where an in-progress quarter's draft is kept.
 *
 * Only the *unlocked* quarter is ever stored, keyed by company and quarter number, so opening
 * the next quarter starts clean without anything to clear. A locked quarter's decisions live on
 * the server, which is the record that matters; this is purely so a reload, a sidebar
 * deep-link or a closed laptop does not throw away numbers the CEO has already typed in.
 */
const draftKey = (companyId: string, quarter: number) => `simulation.draft.${companyId}.q${quarter}`;

type Draft = {
  lines: Alloc;
  warranty: WarrantyId;
  payTerms: PayTermsId;
  startInno: string[];
  products: Record<ProductId, ProductState> | null;
  priority: PriorityId | null;
  reflection: Reflection;
  crisis: CrisisInput;
};

function readDraft(companyId: string, quarter: number): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftKey(companyId, quarter));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

/**
 * The simulation's own content column. It runs inside `RunShell`'s `main`, to the right of the
 * 268px rail, so it carries the same gutter and the same 1440px ceiling as the shell's other
 * screens -- otherwise the review and year-end screens sit in a narrower column than the report
 * they are read next to, with the header's rules running past them on both sides.
 */
/* The shell's one horizontal grid.

   SHELL caps the rail and the document together rather than capping the
   document alone. Capping the document meant its width was measured against a
   container that changes size with the rail, so on a wide screen collapsing the
   rail pushed the column back into `mx-auto` centring and pulled its right edge
   *inward* -- the opposite of what collapsing is for. Capping the pair pins the
   right edge, so toggling only ever moves the left one, by exactly the rail's
   width.

   COLUMN is therefore gutter only: no max-width and no centring of its own, or
   it would reintroduce the same drift one level down. Every band inside the
   document (header, main, footer) uses it, so they share one left rule. */
const RAIL_W = 220;
const SHELL = "mx-auto w-full max-w-[1660px]"; // 1440 document + 220 rail
const COLUMN = "w-full px-4 sm:px-6 lg:px-8";

/* Whether the department rail is open, kept in localStorage so it survives a reload.
   Read through `useSyncExternalStore` rather than an effect: the server has no storage to
   read, and this is exactly the "external value that must not desync from hydration" case
   the hook exists for. */
const NAV_STORAGE_KEY = "myelin_sim_nav_open";

const navListeners = new Set<() => void>();

const subscribeNav = (fn: () => void) => {
  navListeners.add(fn);
  return () => {
    navListeners.delete(fn);
  };
};

function readNavOpen() {
  try {
    return window.localStorage.getItem(NAV_STORAGE_KEY) !== "0";
  } catch {
    /* private browsing -- the toggle still works, it just won't be remembered. */
    return true;
  }
}

function writeNavOpen(next: boolean) {
  try {
    window.localStorage.setItem(NAV_STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* see above */
  }
  navListeners.forEach((fn) => fn());
}

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

  /**
   * The named wait, when there is one.
   *
   * `busy` says a request is open, which is enough to disable a button. It is not enough for
   * closing a quarter: that is a multi-second scoring run whose result is a whole new screen,
   * so it gets an overlay that says which quarter is being processed and stays put -- switching
   * to its own error state -- if the engine refuses. Nothing else on the surface changes while
   * it is up, so a failure returns the CEO to exactly the review they submitted.
   */
  const [working, setWorking] = useState<Working | null>(null);

  /* `busy` is state, so two clicks landing in the same tick would both read `false`. The
     buttons are disabled on `busy` and that is what normally prevents it, but a lock is the one
     request that must never be sent twice -- a duplicate would score the quarter again -- so it
     is also guarded by a ref, which updates synchronously. */
  const inFlight = useRef(false);

  /* Nav visibility. Desktop and mobile are tracked separately on purpose: the rail is
     open by default on a wide screen and its state is worth remembering, while the
     mobile drawer must start closed or it would cover the screen on every load. */
  const navOpen = useSyncExternalStore(subscribeNav, readNavOpen, () => true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleNav = useCallback(() => writeNavOpen(!readNavOpen()), []);
  const closeNav = useCallback(() => writeNavOpen(false), []);

  /**
   * Every section opens at the top.
   *
   * The document column is its own scroll container (`overflow-y-auto` below), not the window,
   * so neither the browser nor Next's router ever touched it -- switching department left the
   * new section scrolled to wherever the CEO had been reading in the old one, which on the
   * longer screens meant landing halfway down a form they had not seen the start of.
   *
   * Keyed on the section and the lifecycle phase and nothing else: it must not fire while a
   * section is being filled in, or every keystroke that re-renders would yank the page up.
   */
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Escape closes the mobile drawer, the same as tapping the backdrop.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  const urlTab = searchParams.get("tab");
  const tab = urlTab && SIMULATION_TABS.some((t) => t.id === urlTab) ? urlTab : "dashboard";

  const setTab = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      // `scroll: false` because the router's own scroll handling targets the *window*, which
      // is not what scrolls here. The column below is reset directly instead.
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // See `scrollerRef` above. Runs on every way into a new section -- the rail, the mobile
  // drawer, "Close the quarter", the deep-linked `?tab=`, and each lifecycle phase -- because
  // it keys off where the CEO has ended up, not off the control that took them there.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [tab, phase]);

  /**
   * Set the plan up for `next`, restoring any draft already saved for that quarter.
   *
   * Restoring rather than always clearing is the point: this runs on every load and after
   * every close, so without it a reload halfway through a quarter silently discarded every
   * number the CEO had entered.
   */
  const resetPlan = useCallback(
    (next: CompanyState) => {
      const draft = readDraft(companyId, next.quarter);
      setAlloc(draft?.lines ?? emptyAlloc());
      setWarranty(draft?.warranty ?? "6mo");
      setStartInno(draft?.startInno ?? []);
      setProducts(draft?.products ?? next.products);
      setPayTerms(draft?.payTerms ?? next.payTerms);
      setPriority(draft?.priority ?? null);
      setReflection(draft?.reflection ?? { sacrifice: [] });
      setCrisis(draft?.crisis ?? emptyCrisis());
      setAdvanced(false);
      setProjection(null);
    },
    [companyId],
  );

  /* ── load the run ─────────────────────────────────────────────── */

  /**
   * Load the run, and the term sheet whenever one is outstanding.
   *
   * The term sheet is fetched here rather than only in the moment Q3 closes, because the run
   * state is the single source of truth for where the CEO actually is: three quarters locked
   * with no `endgamePath` means the decision is still owed, whether they got there by closing
   * Q3 a second ago or by reloading the page a day later.
   */
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

    if (run.quartersLocked >= 3 && run.history.length >= 3) {
      try {
        const eg = await simulationApi.endgame(companyId);
        setTs({
          tier: eg.tier,
          V: eg.q3ValuationInr,
          M: eg.momentum,
          trueContinuation: eg.trueContinuationValueInr,
          offers: eg.offers as unknown as TermSheet["offers"],
          q1: run.history[0],
          q2: run.history[1],
          q3: run.history[2],
        });
      } catch {
        /* Not readable yet. The rest of the run still works without it. */
      }
    }
    return run;
  }, [companyId]);

  /**
   * Derive the phase from the run itself, never from wherever the user happened to be.
   *
   * This is what makes the term sheet impossible to lose: a reload, a sidebar deep-link and the
   * browser back button all recompute the same answer from `quartersLocked` and `endgamePath`.
   * The previous version fell back to the briefing whenever any quarter was locked, which
   * silently skipped the Q4 term sheet -- and because the screen was only ever reachable from
   * the moment Q3 closed, the endgame decision could then never be recorded at all.
   *
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
        // A saved draft that already names a priority means this quarter was started, so
        // resume on the decision screens rather than sending the CEO back through the
        // briefing to re-declare something they have already committed to.
        const started = Boolean(readDraft(companyId, run.state.quarter)?.priority);

        setPhase(
          run.runStatus === "completed"
            ? "final"
            : run.quartersLocked === 0 && !started
              ? "intro"
              : // Q3 closed and nothing signed: the term sheet is owed before Q4 can be run.
                run.quartersLocked === 3 && !run.endgamePath
                ? "termsheet"
                : started
                  ? "play"
                  : "briefing",
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
  }, [companyId, loadRun, resetPlan]);

  /* ── the live projection, from the server ─────────────────────── */

  const plan: QuarterPlan = useMemo(
    () => ({ lines: alloc, warranty, payTerms, startInno, products, priority, reflection, crisis }),
    [alloc, warranty, payTerms, startInno, products, priority, reflection, crisis],
  );

  /**
   * Save the draft on every change, so nothing typed is ever only in memory.
   *
   * There is no "save" button by design: an allocation the CEO can lose by reloading is worse
   * than one they have to remember to save, and the quarter is only *committed* when they close
   * it. Skipped while booting so the freshly-restored draft is not immediately written back.
   */
  useEffect(() => {
    if (booting || typeof window === "undefined") return;
    if (phase !== "play" && phase !== "briefing") return;
    try {
      window.localStorage.setItem(draftKey(companyId, state.quarter), JSON.stringify(plan));
    } catch {
      /* A full or blocked localStorage must never break the run. */
    }
  }, [booting, companyId, phase, plan, state.quarter]);

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
  /* The report's readiness is read from the *closed* result, never from `dirs` above: that one
     belongs to the preview of a plan which stopped existing the moment the quarter locked.
     Both call the same `readiness()`, so the report and the decision screens are one scale. */
  const closedDirs = useMemo(
    () => (closed ? readiness(closed.result, state) : []),
    [closed, state],
  );
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
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    setWorking({
      title: "Processing quarter " + state.quarter,
      message: "Evaluating decisions and generating your quarter report…",
      dismiss: "Back to the review",
    });
    try {
      const locked = await simulationApi.lock(companyId, plan);
      // Committed to the server, so the local draft has done its job.
      try {
        window.localStorage.removeItem(draftKey(companyId, locked.quarter));
      } catch {
        /* nothing to recover from */
      }
      setClosed({ result: locked.result, score: locked.score });
      setHistory((h) => [...h, locked.result]);
      setScores((s) => [...s, locked.score]);
      setPriorities((p) => [...p, priority]);
      setState(locked.nextState);
      if (locked.settlement) setEndgameOutcome(locked.settlement as unknown as Record<string, unknown>);
      if (locked.quarter >= 4) setRunStatus("completed");
      setPhase("closed");
      setWorking(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message + (err.body.reason ? " — " + err.body.reason : "")
          : "Could not close the quarter.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }, [companyId, plan, priority, state.quarter]);

  const afterClosed = useCallback(async () => {
    const justClosed = closed?.result.q as number;
    if (justClosed === 4) {
      setPhase("final");
      return;
    }

    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    setWorking({
      title: "Opening quarter " + (justClosed + 1),
      message: "Carrying the closing balance sheet into the next briefing…",
      dismiss: "Back to the report",
    });
    try {
      // `loadRun` fetches the term sheet whenever one is outstanding, so Q3 needs no special
      // case here beyond sending the CEO to it.
      const run = await loadRun();
      resetPlan(run.state);
      setPhase(justClosed === 3 && !run.endgamePath ? "termsheet" : "briefing");
      setWorking(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open the next quarter.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }, [closed, loadRun, resetPlan]);

  const acceptDeal = useCallback(
    async (path: "A" | "B" | "C", termSheetName: string, reasoning: string) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setBusy(true);
      setError(null);
      setWorking({
        title: "Recording the board's decision",
        message: "Signing the term sheet and reopening the company for quarter 4…",
        dismiss: "Back to the term sheet",
      });
      try {
        await simulationApi.signTermSheet(companyId, path, termSheetName, reasoning);
        setPhase("briefing");
        setTab("dashboard");
        setWorking(null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not record that decision.");
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    [companyId, setTab],
  );

  const restart = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    setWorking({
      title: "Starting a new run",
      message: "Creating a fresh company and opening quarter 1…",
      dismiss: "Back to the year end",
    });
    try {
      const created = await api.createCompany({ name: (company?.name ?? "Nadi Wear") + " (rerun)" });
      // The cached run list is what `/run/<n>` resolves against; the new run is not in it yet.
      forgetRunIndex();
      window.location.href = runHref(created.seq, "/simulation");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start a new run.");
      inFlight.current = false;
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

  /** The department list. Rendered twice -- as the desktop rail and as the mobile drawer -- so
   *  the two can never drift apart. `onClose` is the one thing that differs: the rail and the
   *  drawer are two separate pieces of state, and each panel closes only itself. */
  const navBody = (onClose: () => void) => (
    <>
      {/* Each panel carries its own close control. It is no longer `lg:hidden`: the rail
          needs it just as much as the drawer does, and it is the same gesture in both. */}
      {/* pl-3 against the rail's px-5 puts this label on the same 32px left rule as the
          nav labels below it. */}
      <div className="flex items-center justify-between gap-2 pb-2 pl-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-sim-faint">
          Nadi Wear · 4 quarters
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close departments"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sim-faint transition-colors hover:bg-sim-surface-hover hover:text-sim-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setMobileNavOpen(false);
            }}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "flex w-full items-center justify-between gap-1.5 rounded-xl border px-3 py-2.5 text-left text-[13.5px] transition-colors duration-150 ease-out",
              tab === t.id
                ? "border-teal-deep bg-teal-deep text-white font-medium"
                : t.hot
                  ? "border-sim-line bg-sim-surface-raised text-tone-bad hover:border-danger/40"
                  : "border-sim-line bg-sim-surface-raised text-sim-ink hover:border-teal/40 hover:bg-sim-surface-hover",
            )}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="rounded-full bg-danger px-1.5 text-xs font-mono text-white">{t.badge}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-3 shrink-0 border-t border-sim-line pt-3">
        <Link
          href="/simulations"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-sim-faint transition-colors hover:bg-sim-surface-hover hover:text-sim-ink"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Exit run
        </Link>
      </div>
    </>
  );

  const chrome = (body: React.ReactNode, showNav: boolean) => (
    <TeachingContext.Provider value={notesOn}>
      {/* One viewport-height frame: the toolbar and the rail stay put and only the document
          column scrolls, so switching department never means scrolling back up to the nav. */}
      <div className="flex h-full flex-col overflow-hidden">
        {/* App-themed toolbar -- sits outside `.simulation` so ThemeToggle/ProfileMenu keep
            reading the app's own light/dark tokens (text-ink etc.) instead of clashing with
            the simulation's fixed cream surface below. */}
        <div className="shrink-0 border-b border-line bg-base">
          <div className={SHELL + " flex items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8"}>
          {/* Account chrome only. The department toggle used to sit here, which put the
              control for a panel inside the simulation on the bar that carries "log out" --
              two different scopes on one rule. It now lives in the simulation's own header
              below, beside the quarter it belongs to. */}
          <Link href="/" aria-label="Myelin home" className="flex shrink-0 items-center">
            <Logo variant="glyph" />
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <div className="h-5 w-px bg-line" aria-hidden />
            <ProfileMenu />
          </div>
          </div>
        </div>

        <div className="simulation relative min-h-0 flex-1 overflow-hidden bg-base text-ink">
          {/* Anchored to the simulation surface rather than the viewport: the account bar
              above stays live and legible, so a quarter being scored reads as this workspace
              being busy rather than the whole app having locked up. */}
          {working && (
            <ProcessingOverlay
              title={working.title}
              message={working.message}
              error={error}
              onRetry={() => setWorking(null)}
              retryLabel={working.dismiss}
            />
          )}
          <div className={SHELL + " flex h-full"}>
          {/* Always mounted while there is a rail to show, and collapsed by animating its
              width to zero rather than by unmounting.

              Mounting and unmounting could not be transitioned -- the panel and the document
              both jumped by 220px -- and it also threw away the rail's scroll position every
              time it was closed. The outer element is the only thing that changes size; the
              inner one keeps the full rail width throughout, so the nav labels slide out of
              view intact instead of reflowing to nothing on the way. */}
          {showNav && (
            <aside
              inert={!navOpen ? true : undefined}
              className={cn(
                "hidden shrink-0 overflow-hidden bg-sim-surface transition-[width] duration-300 ease-out motion-reduce:transition-none lg:block",
                navOpen ? "border-r border-sim-line" : "border-r-0",
              )}
              style={{ width: navOpen ? RAIL_W : 0 }}
            >
              <div
                className={cn(
                  "flex h-full flex-col px-5 py-4 transition-opacity duration-200 ease-out motion-reduce:transition-none",
                  navOpen ? "opacity-100" : "opacity-0",
                )}
                style={{ width: RAIL_W }}
              >
                {navBody(closeNav)}
              </div>
            </aside>
          )}

          {showNav && mobileNavOpen && (
            <>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation"
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              />
              <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-sim-line bg-sim-surface px-3 py-4 shadow-xl lg:hidden">
                {navBody(() => setMobileNavOpen(false))}
              </aside>
            </>
          )}

          <div ref={scrollerRef} className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Sticky: quarter, cash and what is left to commit are the figures you are deciding
              against, so they stay on screen while the document scrolls under them. */}
          <header className="sticky top-0 z-20 shrink-0 bg-chrome text-white">
            {/* `min-w-0` on both halves and `flex-wrap` on the row: the status cluster is the
                widest thing in the simulation and it has to be allowed to drop to its own line
                rather than push the title off the left edge. Nothing here is `nowrap`. */}
            <div className={COLUMN + " py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2"}>
              <div className="flex min-w-0 items-center gap-3">
                {/* The department toggle, in the workspace it belongs to.

                    Two controls rather than one because they do different things: below `lg`
                    the departments are a drawer over the document, at `lg` and up they are a
                    rail beside it. Splitting them on a breakpoint class keeps both correct
                    without reading the viewport width during render, which the server cannot
                    do. */}
                {showNav && (
                  <>
                    <button
                      type="button"
                      onClick={toggleNav}
                      aria-expanded={navOpen}
                      aria-label={navOpen ? "Collapse departments" : "Expand departments"}
                      className={
                        "hidden shrink-0 items-center gap-1.5 border px-2 py-1 text-xs uppercase tracking-widest transition-colors lg:inline-flex " +
                        (navOpen
                          ? "border-teal text-teal-bright hover:bg-white/5"
                          : "border-line-2 text-dim hover:text-white")
                      }
                    >
                      {navOpen ? (
                        <PanelLeftClose className="h-3.5 w-3.5" />
                      ) : (
                        <PanelLeftOpen className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">Departments</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileNavOpen(true)}
                      aria-label="Open departments"
                      className="inline-flex shrink-0 items-center gap-1.5 border border-line-2 px-2 py-1 text-xs uppercase tracking-widest text-dim transition-colors hover:text-white lg:hidden"
                    >
                      <PanelLeftOpen className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Departments</span>
                    </button>
                  </>
                )}
                <span className="truncate font-serif text-xl">Nadi Wear</span>
                <span className="hidden text-xs uppercase tracking-widest text-dim md:inline">
                  Chief Executive
                </span>
              </div>

              {showNav && (
                <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1 font-mono text-sm">
                  <span>
                    <span className="text-dim text-xs uppercase tracking-widest mr-2">Quarter</span>
                    {state.quarter}/4
                  </span>
                  <span>
                    <span className="text-dim text-xs uppercase tracking-widest mr-2">Cash</span>
                    {inr(state.cash)}
                    {state.pendingInvestment > 0 && (
                      <span className="text-teal-bright ml-1">+{inr(state.pendingInvestment)} pending</span>
                    )}
                  </span>
                  {priority && (
                    <span className="text-teal-bright">
                      <span className="text-dim text-xs uppercase tracking-widest mr-2">Priority</span>
                      {PRIORITY_BY_ID[priority].name}
                    </span>
                  )}
                  <span className={budget.committed > budget.ceiling ? "text-danger-soft" : "text-faint"}>
                    <span className="text-dim text-xs uppercase tracking-widest mr-2">Left</span>
                    {inr(budget.ceiling - budget.committed)}
                  </span>
                  <button
                    onClick={() => setNotesOn(!notesOn)}
                    className={
                      "px-2 py-1 text-xs uppercase tracking-widest border transition-colors " +
                      (notesOn ? "border-teal text-teal-bright" : "border-line-2 text-dim")
                    }
                  >
                    Notes {notesOn ? "on" : "off"}
                  </button>
                </div>
              )}
            </div>

            {showNav && <Ticker items={ticker} />}
          </header>

          <main className={COLUMN + " py-6"}>{body}</main>

          <footer className={COLUMN + " pb-10 pt-2 text-xs text-faint font-mono"}>
            Teaching simulation. All figures fictional. Every number is computed by the MyElin engine.
          </footer>
          </div>
          </div>
        </div>
      </div>
    </TeachingContext.Provider>
  );

  const errorBanner = error && (
    <div className="border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-tone-bad">{error}</div>
  );

  /* ── render ───────────────────────────────────────────────────── */

  if (booting) {
    return (
      <div className="simulation flex min-h-full items-center justify-center bg-base text-ink">
        <PageLoading label="Loading your company…" sub="Reading the run's closed quarters." />
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
        history={history}
        score={closed.score}
        constraint={bindingConstraint(closed.result, closed.result.entering)}
        dirs={closedDirs}
        priority={priorities[priorities.length - 1] ?? null}
        reflection={reflection}
        onNext={afterClosed}
        busy={busy}
      />,
      false,
    );
  }

  if (phase === "termsheet") {
    // `ts` should always be loaded by the time the phase is set, but say so plainly rather
    // than falling through to the play surface -- a silent fall-through is exactly what made
    // the term sheet look like a dead end before.
    return chrome(
      ts ? (
        <TermSheetScreen ts={ts} onAccept={acceptDeal} busy={busy} error={error} />
      ) : (
        <div className="space-y-4">
          {errorBanner}
          <div className="border-l-4 border-ember bg-ember/10 px-4 py-3 text-sm text-ink">
            The board&apos;s term sheet could not be loaded. Reload the page to try again — your three
            closed quarters are safe, and nothing is lost.
          </div>
        </div>
      ),
      false,
    );
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
      <div className="border-l-4 border-line-2 bg-raise px-4 py-3 text-sm text-ink">
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
    body = <div className="text-sm text-dim">Pick a screen above.</div>;
  }

  return chrome(
    <div className="space-y-5">
      {errorBanner}
      {/* The preview is debounced and re-runs on every edit, so this is the one wait the CEO
          sees repeatedly -- it stays a single quiet line rather than anything that redraws the
          screen under the form they are filling in. */}
      {!projection && (
        <InlineLoading
          label="Running the plan…"
          sub="The engine is costing what you have entered so far."
          className="border-l-4 border-line-2 bg-raise px-4 py-3"
        />
      )}
      {body}
    </div>,
    true,
  );
}

export { ARCHETYPES };
