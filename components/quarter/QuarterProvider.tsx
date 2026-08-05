"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { catalogs } from "@/lib/quarter/catalog";
import { runQuarter, withNetWorth } from "@/lib/quarter/engine";
import {
  workspaceStatus,
  type DecisionValue,
  type QuarterDraft,
  type QuarterResult,
  type WorkspaceId,
  type WorkspaceStatus,
} from "@/lib/quarter/types";

/* ────────────────────────────────────────────────────────────────
   Draft store for one quarter. Mirrors the backend contract:
   decisions are staged locally (a stand-in for PATCHing the draft),
   and run() is the single mutating action — idempotent, returning
   the same result_hash if called again.
   ──────────────────────────────────────────────────────────────── */

type StoreState = {
  draft: QuarterDraft;
  result: QuarterResult | null;
};

class QuarterStore {
  private state: StoreState;
  private listeners = new Set<() => void>();
  private readonly storageKey: string;

  constructor(quarter: number) {
    this.storageKey = `myelin-quarter-${quarter}`;
    this.state = this.load() ?? {
      draft: { quarter_number: quarter, decisions: {} },
      result: null,
    };
  }

  private load(): StoreState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as StoreState) : null;
    } catch {
      return null;
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      /* storage full / private mode — draft simply won't survive refresh */
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  snapshot = (): StoreState => this.state;

  private emit(next: StoreState) {
    this.state = next;
    this.persist();
    this.listeners.forEach((l) => l());
  }

  setDecision(ws: WorkspaceId, id: string, value: DecisionValue) {
    const draft = this.state.draft;
    this.emit({
      ...this.state,
      draft: {
        ...draft,
        decisions: {
          ...draft.decisions,
          [ws]: { ...(draft.decisions[ws] ?? {}), [id]: value },
        },
      },
    });
  }

  /** Idempotent — a second call returns the existing result untouched. */
  run(): QuarterResult {
    if (this.state.result) return this.state.result;
    const result = withNetWorth(runQuarter(this.state.draft));
    this.emit({ ...this.state, result });
    return result;
  }

  reset() {
    this.emit({
      draft: { quarter_number: this.state.draft.quarter_number, decisions: {} },
      result: null,
    });
  }
}

const stores = new Map<number, QuarterStore>();
function getStore(quarter: number): QuarterStore {
  let store = stores.get(quarter);
  if (!store) {
    store = new QuarterStore(quarter);
    stores.set(quarter, store);
  }
  return store;
}

const EMPTY: StoreState = {
  draft: { quarter_number: 1, decisions: {} },
  result: null,
};

/* ── context ────────────────────────────────────────────────────── */

type QuarterContextValue = {
  quarter: number;
  draft: QuarterDraft;
  result: QuarterResult | null;
  statuses: Record<WorkspaceId, WorkspaceStatus>;
  setDecision: (ws: WorkspaceId, id: string, value: DecisionValue) => void;
  run: () => QuarterResult;
  reset: () => void;
};

const QuarterContext = createContext<QuarterContextValue | null>(null);

export function QuarterProvider({
  quarter,
  children,
}: {
  quarter: number;
  children: React.ReactNode;
}) {
  const store = getStore(quarter);
  const state = useSyncExternalStore(
    store.subscribe,
    store.snapshot,
    () => EMPTY,
  );

  const setDecision = useCallback(
    (ws: WorkspaceId, id: string, value: DecisionValue) =>
      store.setDecision(ws, id, value),
    [store],
  );
  const run = useCallback(() => store.run(), [store]);
  const reset = useCallback(() => store.reset(), [store]);

  const statuses = useMemo(() => {
    const out = {} as Record<WorkspaceId, WorkspaceStatus>;
    for (const ws of Object.keys(catalogs) as WorkspaceId[]) {
      out[ws] = workspaceStatus(catalogs[ws], state.draft.decisions[ws]);
    }
    return out;
  }, [state.draft]);

  const value = useMemo(
    () => ({
      quarter,
      draft: state.draft,
      result: state.result,
      statuses,
      setDecision,
      run,
      reset,
    }),
    [quarter, state, statuses, setDecision, run, reset],
  );

  return (
    <QuarterContext.Provider value={value}>{children}</QuarterContext.Provider>
  );
}

export function useQuarter(): QuarterContextValue {
  const ctx = useContext(QuarterContext);
  if (!ctx) throw new Error("useQuarter must be used inside QuarterProvider");
  return ctx;
}
