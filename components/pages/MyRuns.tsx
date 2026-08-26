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
import { Masthead } from "@/components/layout/PageChrome";
import { Action, Container } from "@/components/ui/Kit";
import { cn } from "@/lib/utils";
import { useSimulationHref } from "@/components/play/entry";
import { InlineLoading } from "@/components/ui/Loading";

const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  active: "Active",
  distressed: "Distressed",
  failed: "Failed",
  completed: "Completed",
};

/** Teal is the live system, vermilion is what it costs you -- the site's own rule. */
const RUN_STATUS_TONE: Record<RunStatus, string> = {
  active: "text-teal",
  distressed: "text-ember-soft",
  failed: "text-ember",
  completed: "text-dim",
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
  const [totalRuns, setTotalRuns] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const LIMIT = 18;

  const requested = searchParams.get("filter");
  const filter: FilterId = isFilterId(requested) ? requested : "all";

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    void (async () => {
      try {
        const { entries, total } = await api.listCompanies({ limit: LIMIT, offset: 0 });
        if (!cancelled) {
          setRuns(entries);
          setTotalRuns(total);
        }
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

  const loadMore = async () => {
    if (!runs) return;
    setLoadingMore(true);
    try {
      const { entries, total } = await api.listCompanies({ limit: LIMIT, offset: runs.length });
      setRuns((prev) => [...(prev || []), ...entries]);
      setTotalRuns(total);
    } catch (err) {
      console.error("Failed to load more runs:", err);
    } finally {
      setLoadingMore(false);
    }
  };

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
      <section className="relative border-b border-line pt-[68px]">
        <div className="grid-lines absolute inset-0" />
        <Masthead section="Your record" />
        <Container wide className="relative z-10 py-[clamp(2.5rem,6vh,4.5rem)]">
          <h1 className="ledger-display rise max-w-3xl text-balance text-[clamp(2.2rem,4.8vw,3.6rem)] text-ink">
            My <span className="italic text-teal">simulations.</span>
          </h1>
          <p className="rise rise-1 mt-7 max-w-[52ch] border-t border-line pt-6 text-[16px] leading-[1.7] text-dim">
            Every company you have run, newest first. Pick one up where you left it, or start a
            new one.
          </p>
          <div className="rise rise-2 mt-8">
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
            <div className="border border-line px-6 py-12 text-center">
              <p className="text-[15px] text-dim">Log in to see your simulations.</p>
              <div className="mt-6 flex justify-center">
                <Action href="/login?next=/runs">Log in</Action>
              </div>
            </div>
          )}

          {user && (
            <>
              {/* The same squared segmented control the catalogue uses: a filled block on the
                  rule, not a pill floating in a pill. */}
              <div role="tablist" aria-label="Filter simulations" className="flex flex-wrap border border-line">
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
                        "border-r border-line px-4 py-2.5 text-[13px] transition-colors duration-200 last:border-r-0",
                        active
                          ? "bg-teal/[0.12] text-teal"
                          : "text-dim hover:bg-[var(--panel)] hover:text-ink",
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
                <p className="mt-8 border border-ember/40 bg-ember/[0.08] px-4 py-3 text-[13px] text-ember">
                  {error}
                </p>
              )}

              {!error && runs === null && (
                <InlineLoading className="mt-8" label="Loading your simulations…" />
              )}

              {!error && runs !== null && visible.length === 0 && (
                <div className="mt-8 border border-line px-6 py-14 text-center">
                  <p className="text-[15px] text-dim">
                    {runs.length === 0
                      ? "You have not started a simulation yet."
                      : "Nothing in this state yet."}
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Action href={simulationHref} variant="outline">
                      <Play className="h-3.5 w-3.5" />
                      Start one
                    </Action>
                  </div>
                </div>
              )}

              {!error && visible.length > 0 && (
                <div className="mt-8 grid border-l border-t border-line md:grid-cols-2 xl:grid-cols-3">
                  {visible.map((run, i) => (
                    <RunCard key={run.id} run={run} delay={i * 0.05} />
                  ))}
                </div>
              )}

              {runs && runs.length < totalRuns && (
                <div className="mt-12 flex justify-center">
                  <Action onClick={loadMore} disabled={loadingMore} variant="outline" className="w-full sm:w-auto">
                    {loadingMore ? "Loading…" : `Load more (${runs.length} of ${totalRuns})`}
                  </Action>
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
  const done = run.total_quarters > 0 ? run.quarters_locked / run.total_quarters : 0;
  const live = run.run_status === "active" || run.run_status === "distressed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: easeOut }}
      className="h-full border-b border-r border-line"
    >
      <Link
        href={runHref(run.seq, "/simulation")}
        className="flex h-full flex-col transition-colors duration-200 hover:bg-[var(--panel)]"
      >
        <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-3">
          {/* The run number is the same one the URL carries, so a student can match a card to
              the address bar without ever being shown an id. */}
          <span className="num text-[11px] text-faint">Run {run.seq}</span>
          <span className={cn("tick-label flex items-center gap-2", RUN_STATUS_TONE[run.run_status])}>
            {live && <span className="live-dot h-1.5 w-1.5 rounded-full bg-teal" />}
            {RUN_STATUS_LABEL[run.run_status]}
          </span>
        </div>

        <div className="flex-1 px-5 pt-5">
          <p className="ledger-display truncate text-[19px] text-ink">{run.name}</p>
          <p className="tick-label mt-2.5">
            {humanizeId(run.scenario_id)} · {new Date(run.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Progress as four ticks, one per quarter -- a four-quarter run does not need a
            percentage bar to say where it stands. */}
        <div className="mt-6 flex items-center justify-between gap-4 px-5">
          <span className="tick-label">Quarters closed</span>
          <span className="flex items-center gap-3">
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
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-line px-5 py-4">
          <span className="text-[12.5px] text-faint">
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
          <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] text-teal">
            {done >= 1 ? "Read" : "Open"} <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
