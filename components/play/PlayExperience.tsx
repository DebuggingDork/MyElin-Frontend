"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { EntryGate } from "@/components/play/EntryGate";
import { NewspaperStory } from "@/components/play/NewspaperStory";
import { NewspaperKpi } from "@/components/play/NewspaperKpi";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, setActiveCompanyId } from "@/lib/api/client";
import { forgetRunIndex, runHref } from "@/lib/run/ref";
import { asNumber } from "@/lib/api/catalog";
import { ApiError, type CompanyListItem } from "@/lib/api/types";
import type { Scenario } from "@/lib/play/types";
import { Action, Container } from "@/components/ui/Kit";
import { PageLoading } from "@/components/ui/Loading";
import { cn } from "@/lib/utils";

type Phase = "rules" | "picker" | "story" | "kpi";

/**
 * Entry sequence: rules + timer (EntryGate) -> pick up an existing run or start fresh -> for a
 * fresh start, the newspaper story -> the newspaper KPI page -> /run/{runNumber}.
 *
 * Which runs exist comes from `GET /companies`, not from localStorage. The previous version
 * trusted a single stored `myelin_active_company` id, so clearing site data (or opening the app
 * on another machine) hid every run the user still owned, with no way to reach them again.
 *
 * Company creation happens on the KPI page's final button, not on "start a new run" -- nothing is
 * created until the CEO actually finishes the ceremony and commits to taking the desk.
 */
export function PlayExperience({ scenario }: { scenario: Scenario }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [phase, setPhase] = useState<Phase>("rules");
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [runs, setRuns] = useState<CompanyListItem[] | null>(null);

  /**
   * Authentication gates the whole sequence, not just the part that talks to the API.
   *
   * This used to skip the `rules` phase, so a signed-out visitor accepted all four terms,
   * reached the picker, and only then got bounced to login -- and came back to the same four
   * terms, because the gate is where the sequence starts. Nothing below the gate can be
   * committed without an account anyway, so the redirect belongs before it: the cost of
   * answering is only ever paid once, and no run is created against a session that does not
   * exist yet.
   */
  useEffect(() => {
    if (!ready || user) return;
    router.replace(`/login?next=${encodeURIComponent(`/play/${scenario.id}`)}`);
  }, [ready, user, router, scenario.id]);

  const loadRuns = useCallback(async () => {
    try {
      const { entries } = await api.listCompanies();
      setRuns(entries);
    } catch {
      // A failed list shouldn't block starting a new run -- fall back to the create-only view.
      setRuns([]);
    }
  }, []);

  useEffect(() => {
    if (phase === "rules" || !ready || !user) return;
    queueMicrotask(() => void loadRuns());
  }, [phase, ready, user, loadRuns]);

  const resumable = useMemo(
    () =>
      (runs ?? []).filter(
        (r) => r.run_status === "active" || r.run_status === "distressed",
      ),
    [runs],
  );
  const finished = useMemo(
    () =>
      (runs ?? []).filter(
        (r) => r.run_status === "completed" || r.run_status === "failed",
      ),
    [runs],
  );

  // Nothing to resume -- the picker would just be an empty list and one button, so a brand-new
  // player goes straight into the newspaper ceremony instead of clicking through an empty screen.
  useEffect(() => {
    if (
      phase !== "picker" ||
      runs === null ||
      resumable.length > 0 ||
      finished.length > 0
    ) {
      return;
    }
    queueMicrotask(() => setPhase("story"));
  }, [phase, runs, resumable.length, finished.length]);

  async function startRun() {
    setStarting(true);
    setError(null);
    try {
      const company = await api.createCompany({
        name: `${scenario.company.name} · ${user?.email?.split("@")[0] ?? "run"}`,
      });
      setActiveCompanyId(company.id);
      // The new run changes this owner's run list, and the cached copy is what the numbered
      // URL resolves against -- drop it so `/run/<n>` finds the run that was just created.
      forgetRunIndex();
      router.replace(runHref(company.seq));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start a company run. Is the backend up?",
      );
      setStarting(false);
    }
  }

  function resume(run: CompanyListItem) {
    setActiveCompanyId(run.id);
    router.replace(runHref(run.seq));
  }

  /* Session first, and the gate is never rendered without one -- see the redirect above. The
     signed-out branch is a hand-off, not a wait, so it says where the reader is going. */
  if (!ready) {
    return (
      <Shade>
        <PageLoading label="Checking your session…" />
      </Shade>
    );
  }

  if (!user) {
    return (
      <Shade>
        <PageLoading
          label="Taking you to sign in…"
          sub="The simulation opens straight after."
        />
      </Shade>
    );
  }

  if (phase === "rules") {
    return <EntryGate scenario={scenario} onEnter={() => setPhase("picker")} />;
  }

  if (runs === null) {
    return (
      <Shade>
        <PageLoading label="Loading your runs…" sub="Checking what you already own." />
      </Shade>
    );
  }

  if (phase === "story") {
    return <NewspaperStory scenario={scenario} onContinue={() => setPhase("kpi")} />;
  }

  if (phase === "kpi") {
    return (
      <NewspaperKpi
        scenario={scenario}
        starting={starting}
        error={error}
        onEnter={startRun}
      />
    );
  }

  return (
    <div className="ledger relative flex min-h-dvh flex-col bg-void">
      <div className="grid-lines absolute inset-0" />

      <header className="relative z-10 border-b border-line">
        <Container wide className="flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="tick-label">Myelin · {scenario.name}</p>
          <p className="tick-label">
            {resumable.length} open · {finished.length} closed
          </p>
        </Container>
      </header>

      <Container wide className="relative z-10 flex flex-1 flex-col justify-center py-[clamp(2rem,6vh,4rem)]">
        <div className="grid items-end gap-x-16 gap-y-6 lg:grid-cols-[1.3fr_auto]">
          <div>
            <p className="tick-label rise">Your desks</p>
            <h1 className="ledger-display rise rise-1 mt-4 text-balance text-[clamp(2.2rem,4.6vw,3.6rem)] text-ink">
              Pick up where you <span className="italic text-teal">left off.</span>
            </h1>
            <p className="rise rise-2 mt-5 max-w-[52ch] border-t border-line pt-5 text-[15.5px] leading-[1.7] text-dim">
              Each run is a company you own, played over four quarters. They live on the
              server, not in this browser — so they are here on any machine you sign in from.
            </p>
          </div>

          <div className="rise rise-2 lg:justify-self-end">
            <Action onClick={() => setPhase("story")} size="lg">
              <Plus className="h-4 w-4" />
              Start a new run
            </Action>
            <p className="tick-label mt-3 lg:text-right">
              Opens the front page first
            </p>
          </div>
        </div>

        {/* A ruled index, newest first: the run, where it stands, and what it last scored. */}
        <div className="mt-[clamp(1.5rem,4vh,2.5rem)] border-t border-line">
          {[...resumable, ...finished].map((run) => (
            <RunRow key={run.id} run={run} onResume={() => resume(run)} />
          ))}
        </div>

        {error && (
          <p className="mt-6 border border-ember/40 bg-ember/[0.08] px-4 py-3 text-[13px] text-ember">
            {error}
          </p>
        )}
      </Container>
    </div>
  );
}

/** The dark ground every pre-run screen sits on. */
function Shade({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void text-ink">{children}</div>
  );
}

/** Teal is the live system; vermilion is what it cost. */
const RUN_TONE: Record<string, string> = {
  active: "text-teal",
  distressed: "text-ember-soft",
  failed: "text-ember",
  completed: "text-dim",
};

function RunRow({ run, onResume }: { run: CompanyListItem; onResume: () => void }) {
  const terminal = run.run_status === "completed" || run.run_status === "failed";
  const live = !terminal;

  return (
    <button
      type="button"
      onClick={onResume}
      className="group grid w-full grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-2 border-b border-line py-4 text-left transition-colors duration-200 hover:bg-[var(--panel)] sm:grid-cols-[1fr_10rem_7rem_6rem]"
    >
      <span className="min-w-0">
        <span className="block truncate text-[15.5px] text-ink">{run.name}</span>
        <span className="num mt-1.5 block text-[11.5px] text-faint">Run {run.seq}</span>
      </span>

      {/* Progress as one tick per quarter -- four of them do not need a percentage. */}
      <span className="hidden items-center gap-3 sm:flex">
        <span aria-hidden className="flex gap-[3px]">
          {Array.from({ length: run.total_quarters || 4 }).map((_, i) => (
            <span
              key={i}
              className={cn("h-2 w-4", i < run.quarters_locked ? "bg-teal" : "bg-line-2")}
            />
          ))}
        </span>
        <span className="num text-[11.5px] text-dim">
          {run.quarters_locked}/{run.total_quarters}
        </span>
      </span>

      <span className="num hidden text-[11.5px] text-dim sm:block">
        {run.latest_ceo_score != null
          ? `${asNumber(run.latest_ceo_score).toFixed(1)}${run.latest_band ? ` · ${run.latest_band}` : ""}`
          : "—"}
      </span>

      <span className="flex items-baseline justify-end gap-3 justify-self-end">
        <span className={cn("tick-label", RUN_TONE[run.run_status] ?? "text-dim")}>
          {live && <span className="live-dot mr-2 inline-block h-1.5 w-1.5 rounded-full bg-teal align-middle" />}
          {run.run_status}
        </span>
        <span className="hidden text-[13px] text-teal sm:inline">
          {terminal ? "Review" : "Resume"}
          <ArrowRight className="ml-1 inline h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </button>
  );
}
