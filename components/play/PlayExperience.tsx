"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EntryGate } from "@/components/play/EntryGate";
import { RunPicker } from "@/components/play/RunPicker";
import { NewspaperStory } from "@/components/play/NewspaperStory";
import { NewspaperKpi } from "@/components/play/NewspaperKpi";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, setActiveCompanyId } from "@/lib/api/client";
import { forgetRunIndex, runHref } from "@/lib/run/ref";
import { ApiError, type CompanyListItem } from "@/lib/api/types";
import type { Scenario } from "@/lib/play/types";
import { PageLoading } from "@/components/ui/Loading";

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
  const [customName, setCustomName] = useState(scenario.company.name);

  // Wrap the active scenario so that children like NewspaperStory and NewspaperKpi feature the customized name
  const activeScenario = useMemo(
    () => ({
      ...scenario,
      company: { ...scenario.company, name: customName },
    }),
    [scenario, customName]
  );

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
        name: `${customName} · ${user?.email?.split("@")[0] ?? "run"}`,
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
    return (
      <EntryGate 
        scenario={activeScenario} 
        onEnter={(name) => {
          setCustomName(name);
          setPhase("picker");
        }} 
      />
    );
  }

  if (runs === null) {
    return (
      <Shade>
        <PageLoading label="Loading your runs…" sub="Checking what you already own." />
      </Shade>
    );
  }

  if (phase === "story") {
    return <NewspaperStory scenario={activeScenario} onContinue={() => setPhase("kpi")} />;
  }

  if (phase === "kpi") {
    return (
      <NewspaperKpi
        scenario={activeScenario}
        starting={starting}
        error={error}
        onEnter={startRun}
      />
    );
  }

  return (
    <RunPicker
      scenario={activeScenario}
      runs={[...resumable, ...finished]}
      error={error}
      onResume={resume}
      onStart={() => setPhase("story")}
    />
  );
}

/** The dark ground every pre-run screen sits on. */
function Shade({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void text-ink">{children}</div>
  );
}
