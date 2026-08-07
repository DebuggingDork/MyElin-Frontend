"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import { EntryGate } from "@/components/play/EntryGate";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, setActiveCompanyId } from "@/lib/api/client";
import { asNumber } from "@/lib/api/catalog";
import { ApiError, type CompanyListItem } from "@/lib/api/types";
import type { Scenario } from "@/lib/play/types";
import { Action, Pill } from "@/components/ui/Kit";

/**
 * Entry: consent gate → auth check → resume an existing run or create one → /run/{companyId}.
 *
 * Which runs exist comes from `GET /companies`, not from localStorage. The previous version
 * trusted a single stored `myelin_active_company` id, so clearing site data (or opening the app
 * on another machine) hid every run the user still owned, with no way to reach them again.
 */
export function PlayExperience({ scenario }: { scenario: Scenario }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [runs, setRuns] = useState<CompanyListItem[] | null>(null);

  useEffect(() => {
    if (!entered || !ready) return;
    if (!user) {
      router.replace(
        `/login?next=${encodeURIComponent(`/play/${scenario.id}`)}`,
      );
    }
  }, [entered, ready, user, router, scenario.id]);

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
    if (!entered || !ready || !user) return;
    queueMicrotask(() => void loadRuns());
  }, [entered, ready, user, loadRuns]);

  async function startRun() {
    setStarting(true);
    setError(null);
    try {
      const company = await api.createCompany({
        name: `${scenario.company.name} · ${user?.email?.split("@")[0] ?? "run"}`,
      });
      setActiveCompanyId(company.id);
      router.replace(`/run/${company.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start a company run. Is the backend up?",
      );
      setStarting(false);
    }
  }

  function resume(companyId: string) {
    setActiveCompanyId(companyId);
    router.replace(`/run/${companyId}`);
  }

  if (!entered) {
    return <EntryGate scenario={scenario} onEnter={() => setEntered(true)} />;
  }

  if (!ready || !user || runs === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void text-dim">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {!ready || !user ? "Checking session…" : "Loading your runs…"}
      </div>
    );
  }

  const resumable = runs.filter(
    (r) => r.run_status === "active" || r.run_status === "distressed",
  );
  const finished = runs.filter(
    (r) => r.run_status === "completed" || r.run_status === "failed",
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-void px-5 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="eyebrow text-cyan">{scenario.name}</p>
        <h1 className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] text-ink">
          {resumable.length > 0 ? "Pick up where you left off" : "Start your run"}
        </h1>
        <p className="mt-3 text-[14px] text-dim">
          Each run is a company you own, played over{" "}
          {scenario.minutes ? "four quarters" : "four quarters"}. Your runs live on
          the server, not in this browser.
        </p>
      </div>

      {error && (
        <p className="max-w-md rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-center text-[13px] text-rose">
          {error}
        </p>
      )}

      {runs.length > 0 && (
        <div className="w-full max-w-xl space-y-3">
          {[...resumable, ...finished].map((run) => (
            <RunCard key={run.id} run={run} onResume={() => resume(run.id)} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <Action onClick={startRun} disabled={starting} size="lg">
          <Plus className="h-4 w-4" />
          {starting ? "Creating company…" : "Start a new run"}
        </Action>
        <p className="text-[12px] text-faint">
          Creates a company you own via <code>POST /companies</code>.
        </p>
      </div>
    </div>
  );
}

function RunCard({
  run,
  onResume,
}: {
  run: CompanyListItem;
  onResume: () => void;
}) {
  const terminal = run.run_status === "completed" || run.run_status === "failed";
  const accent =
    run.run_status === "failed"
      ? "rose"
      : run.run_status === "distressed"
        ? "amber"
        : run.run_status === "completed"
          ? "emerald"
          : "cyan";

  return (
    <button
      type="button"
      onClick={onResume}
      className="group flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-raise/50 px-5 py-4 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="min-w-0">
        <p className="truncate text-[14.5px] font-medium text-ink">{run.name}</p>
        <p className="num mt-1 text-[12px] text-faint">
          Q{run.current_quarter_number ?? 0}/{run.total_quarters} ·{" "}
          {run.quarters_locked} locked
          {run.latest_ceo_score != null && (
            <>
              {" "}
              · last score {asNumber(run.latest_ceo_score).toFixed(1)}
              {run.latest_band ? ` (${run.latest_band})` : ""}
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Pill accent={accent}>{run.run_status}</Pill>
        <span className="text-[13px] text-dim">
          {terminal ? "Review" : "Resume"}
          <ArrowRight className="ml-1 inline h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
