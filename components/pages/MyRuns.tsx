"use client";

/**
 * Every run this account owns, in one place.
 *
 * The profile menu needs somewhere real to send "My simulations" and "Completed", and
 * `/simulations` is the public catalogue -- a different question ("what can I play?" rather than
 * "what have I played?"). This reads the same owner-scoped `GET /companies` the menu, the
 * leaderboard and the profile page already read; there is no second source of run history to
 * keep in sync.
 *
 * The filter lives in `?filter=` rather than component state so `/runs?filter=completed` is a
 * link the menu can point at and a student can bookmark.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Play, Plus } from "lucide-react";
import { easeOut } from "@/lib/media";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api/client";
import { runHref } from "@/lib/run/ref";
import type { CompanyListItem, RunStatus } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { formatDecimal, humanizeId } from "@/lib/format/display";
import { Action, Container, Eyebrow, Meter, Panel, Pill, type Accent } from "@/components/ui/Kit";
import { cn } from "@/lib/utils";
import { useSimulationHref } from "@/components/play/entry";

const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  active: "Active",
  distressed: "Distressed",
  failed: "Failed",
  completed: "Completed",
};

const RUN_STATUS_ACCENT: Record<RunStatus, Accent> = {
  active: "teal",
  distressed: "amber",
  failed: "rose",
  completed: "emerald",
};

/** Each tab is a predicate over the list the API already returned -- no per-filter request. */
const FILTERS = [
  { id: "all", label: "All", match: () => true },
  {
    id: "active",
    label: "In progress",
    match: (r: CompanyListItem) => r.run_status === "active" || r.run_status === "distressed",
  },
  {
    id: "completed",
    label: "Completed",
    match: (r: CompanyListItem) => r.run_status === "completed" || r.run_status === "failed",
  },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function isFilterId(value: string | null): value is FilterId {
  return FILTERS.some((f) => f.id === value);
}

export function MyRuns() {
  const simulationHref = useSimulationHref();

  const { user, ready } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [runs, setRuns] = useState<CompanyListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requested = searchParams.get("filter");
  const filter: FilterId = isFilterId(requested) ? requested : "all";

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    void (async () => {
      try {
        const { entries } = await api.listCompanies();
        if (!cancelled) setRuns(entries);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load your simulations.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  const visible = useMemo(() => {
    const predicate = FILTERS.find((f) => f.id === filter)!.match;
    return (runs ?? []).filter(predicate);
  }, [runs, filter]);

  const counts = useMemo(
    () =>
      Object.fromEntries(FILTERS.map((f) => [f.id, (runs ?? []).filter(f.match).length])) as Record<
        FilterId,
        number
      >,
    [runs],
  );

  function select(id: FilterId) {
    router.replace(id === "all" ? "/runs" : `/runs?filter=${id}`, { scroll: false });
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-14 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />
        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <Eyebrow accent="teal">Your record</Eyebrow>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] text-ink">
            My simulations.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-dim">
            Every company you have run, newest first. Pick one up where you left it, or start a
            new one.
          </p>
          <div className="mt-8">
            <Action href={simulationHref}>
              <Plus className="h-4 w-4" />
              New simulation
            </Action>
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-base py-14">
        <Container wide>
          {!user && ready && (
            <Panel className="p-8 text-center">
              <p className="text-[15px] text-dim">Log in to see your simulations.</p>
              <div className="mt-5 flex justify-center">
                <Action href="/login?next=/runs">Log in</Action>
              </div>
            </Panel>
          )}

          {user && (
            <>
              <div
                role="tablist"
                aria-label="Filter simulations"
                className="flex flex-wrap items-center gap-1.5 rounded-full border border-line bg-[var(--panel-2)] p-1.5"
              >
                {FILTERS.map((option) => {
                  const active = option.id === filter;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => select(option.id)}
                      className={cn(
                        "rounded-full px-4 py-2 text-[13px] transition-colors",
                        active
                          ? "border border-line bg-[var(--panel)] text-ink"
                          : "border border-transparent text-dim hover:text-ink",
                      )}
                    >
                      {option.label}
                      {runs && (
                        <span className="num ml-2 text-[11.5px] text-faint">
                          {counts[option.id]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {error && (
                <p className="mt-8 rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
                  {error}
                </p>
              )}

              {!error && runs === null && (
                <p className="mt-8 text-[14px] text-dim">Loading your simulations…</p>
              )}

              {!error && runs !== null && visible.length === 0 && (
                <Panel className="mt-8 p-10 text-center">
                  <p className="text-[15px] text-dim">
                    {runs.length === 0
                      ? "You have not started a simulation yet."
                      : "Nothing in this state yet."}
                  </p>
                  <div className="mt-5 flex justify-center">
                    <Action href={simulationHref} variant="outline">
                      <Play className="h-3.5 w-3.5" />
                      Start one
                    </Action>
                  </div>
                </Panel>
              )}

              {!error && visible.length > 0 && (
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visible.map((run, i) => (
                    <RunCard key={run.id} run={run} delay={i * 0.05} />
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}

function RunCard({ run, delay }: { run: CompanyListItem; delay: number }) {
  const accent = RUN_STATUS_ACCENT[run.run_status];
  const progress = run.total_quarters > 0 ? (run.quarters_locked / run.total_quarters) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: easeOut }}
      className="h-full"
    >
      <Link
        href={runHref(run.seq, "/simulation")}
        className="flex h-full flex-col rounded-2xl border border-line bg-[var(--panel)] p-5 transition-colors hover:border-line-2 hover:bg-[var(--panel-2)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* The run number is the same one the URL carries, so a student can match a card to
                the address bar without ever being shown an id. */}
            <span className="num text-[11.5px] text-faint">Run {run.seq}</span>
            <p className="truncate text-[15px] font-medium text-ink">{run.name}</p>
          </div>
          <Pill accent={accent}>{RUN_STATUS_LABEL[run.run_status]}</Pill>
        </div>

        <p className="mt-1 text-[12px] text-faint">
          {humanizeId(run.scenario_id)} · started {new Date(run.created_at).toLocaleDateString()}
        </p>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[11.5px] text-faint">
            <span>Quarters closed</span>
            <span className="num">
              {run.quarters_locked} / {run.total_quarters}
            </span>
          </div>
          <Meter value={progress} accent={accent} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-[12px] text-faint">
            {run.latest_ceo_score != null ? (
              <>
                CEO score{" "}
                <span className="num text-dim">{formatDecimal(run.latest_ceo_score, 1)}</span>
                {run.latest_band ? ` · ${humanizeId(run.latest_band)}` : ""}
              </>
            ) : (
              "No quarter closed yet"
            )}
          </span>
          <span className="inline-flex items-center gap-1 text-[12.5px] text-teal">
            Open <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
