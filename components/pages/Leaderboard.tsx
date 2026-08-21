"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Medal, Trophy } from "lucide-react";
import { easeOut } from "@/lib/media";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api/client";
import { asNumber } from "@/lib/api/catalog";
import type { CompanyListItem, LeaderboardEntry } from "@/lib/api/types";
import { runHref } from "@/lib/run/ref";
import { ApiError } from "@/lib/api/types";
import { Action, Container, Eyebrow, Panel, Pill, type Accent } from "@/components/ui/Kit";
import { cn } from "@/lib/utils";
import { useSimulationHref } from "@/components/play/entry";
import { InlineLoading } from "@/components/ui/Loading";

const STATUS_ACCENT: Record<string, Accent> = {
  active: "teal",
  distressed: "amber",
  failed: "rose",
  completed: "emerald",
};

/** `GET /companies` gives a scenario_id but no display name (only the per-company detail route
 *  carries one), so ids are prettified for display rather than left as raw snake_case. */
function storylineName(scenarioId: string): string {
  return scenarioId
    .split(/[_-]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type Storyline = { scenarioId: string; runs: CompanyListItem[] };

/**
 * A board per storyline, not one global table. Scores only compare meaningfully against the same
 * scenario -- the same CEO score off a different seed, profile and crisis quarter is a different
 * achievement -- so runs are grouped by scenario_id and ranked within each group.
 *
 * Scope note: this ranks *your own* runs. The backend has no cross-user ranking to read --
 * `GET /companies/{id}/leaderboard` returns one company's per-quarter rollups and is gated to
 * owner-or-instructor by `require_read_access` -- so presenting this as a global board (which the
 * previous version did, headed "Top operators") stated something the API cannot support.
 */
export function Leaderboard() {
  const simulationHref = useSimulationHref();

  const { user, ready } = useAuth();
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        const { entries: runs } = await api.listCompanies();
        if (cancelled) return;

        const grouped = new Map<string, CompanyListItem[]>();
        for (const run of runs) {
          const key = run.scenario_id ?? "unknown";
          grouped.set(key, [...(grouped.get(key) ?? []), run]);
        }
        setStorylines(
          [...grouped.entries()]
            .map(([scenarioId, group]) => ({
              scenarioId,
              runs: [...group].sort(
                (a, b) => asNumber(b.latest_ceo_score) - asNumber(a.latest_ceo_score),
              ),
            }))
            .sort((a, b) => a.scenarioId.localeCompare(b.scenarioId)),
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  const totalRuns = storylines.reduce((n, s) => n + s.runs.length, 0);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-14 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />
        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <Eyebrow accent="amber">Standings</Eyebrow>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] text-ink">
            Your runs, by storyline.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-dim">
            Each storyline keeps its own board. A score only means something against the same
            seed, profile and crisis quarter, so runs are ranked inside their storyline and never
            across them.
          </p>
        </Container>
      </section>

      <section className="border-b border-line bg-base py-16">
        <Container wide>
          {!user && (
            <Panel className="p-8 text-center">
              <p className="text-[15px] text-dim">
                Log in and start a simulation to see your standings.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Action href="/login?next=/leaderboard">Log in</Action>
                <Action href="/simulations" variant="outline">
                  Simulations
                </Action>
              </div>
            </Panel>
          )}

          {user && loading && <InlineLoading label="Loading standings…" sub="Reading every run on the board." />}

          {user && error && (
            <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
              {error}
            </p>
          )}

          {user && !loading && !error && totalRuns === 0 && (
            <Panel className="p-8 text-center">
              <p className="text-[15px] text-dim">
                No runs yet. Finish a quarter and it lands here.
              </p>
              <div className="mt-5 flex justify-center">
                <Action href={simulationHref}>
                  Start a run <ArrowRight className="h-4 w-4" />
                </Action>
              </div>
            </Panel>
          )}

          <div className="space-y-10">
            {storylines.map((storyline, i) => (
              <StorylineBoard key={storyline.scenarioId} storyline={storyline} index={i} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function StorylineBoard({ storyline, index }: { storyline: Storyline; index: number }) {
  const best = storyline.runs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: easeOut }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="display text-[22px] text-ink">{storylineName(storyline.scenarioId)}</h2>
        <p className="num text-[12px] text-faint">
          {storyline.runs.length} run{storyline.runs.length === 1 ? "" : "s"}
          {best?.latest_ceo_score != null && (
            <> · best {asNumber(best.latest_ceo_score).toFixed(1)}</>
          )}
        </p>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-line">
        <div className="grid grid-cols-[48px_1fr_92px_88px] gap-3 border-b border-line bg-raise/60 px-4 py-2.5 text-[10.5px] uppercase tracking-wider text-faint sm:grid-cols-[56px_1fr_120px_110px_96px] sm:px-5">
          <span>#</span>
          <span>Run</span>
          <span className="hidden sm:block">Progress</span>
          <span>Status</span>
          <span className="text-right">Score</span>
        </div>
        {storyline.runs.map((run, i) => (
          <RunRow key={run.id} run={run} rank={i} />
        ))}
      </div>
    </motion.div>
  );
}

function RunRow({ run, rank }: { run: CompanyListItem; rank: number }) {
  const [open, setOpen] = useState(false);
  const [quarters, setQuarters] = useState<LeaderboardEntry[] | null>(null);
  const [qError, setQError] = useState<string | null>(null);

  const loadQuarters = useCallback(async () => {
    try {
      const res = await api.getLeaderboard(run.id);
      setQuarters(res.entries);
    } catch (err) {
      setQError(err instanceof ApiError ? err.message : "Could not load quarters");
    }
  }, [run.id]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && quarters === null && qError === null) void loadQuarters();
  }

  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="grid w-full grid-cols-[48px_1fr_92px_88px] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--panel-2)] sm:grid-cols-[56px_1fr_120px_110px_96px] sm:px-5"
      >
        <span className="num flex items-center gap-1.5 text-[13px] text-ink">
          {rank === 0 ? (
            <Trophy className="h-3.5 w-3.5 shrink-0 text-amber" />
          ) : rank === 1 ? (
            <Medal className="h-3.5 w-3.5 shrink-0 text-dim" />
          ) : null}
          {String(rank + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13.5px] text-ink">{run.name}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-faint transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </span>
          <span className="num block truncate text-[11px] text-faint sm:hidden">
            {run.quarters_locked}/{run.total_quarters} locked
          </span>
        </span>

        <span className="num hidden text-[12px] text-dim sm:block">
          {run.quarters_locked}/{run.total_quarters} locked
        </span>

        <span>
          <Pill accent={STATUS_ACCENT[run.run_status] ?? "teal"}>{run.run_status}</Pill>
        </span>

        <span className="num text-right text-[15px] font-semibold text-ink">
          {run.latest_ceo_score != null ? asNumber(run.latest_ceo_score).toFixed(1) : "—"}
        </span>
      </button>

      {open && (
        <div className="border-t border-line bg-[var(--panel)] px-4 py-3 sm:px-5">
          {qError && <p className="text-[12px] text-rose">{qError}</p>}
          {!qError && quarters === null && (
            <p className="text-[12px] text-faint">Loading quarters…</p>
          )}
          {quarters?.length === 0 && (
            <p className="text-[12px] text-faint">No quarters locked on this run yet.</p>
          )}
          {quarters && quarters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quarters.map((q) => (
                <span
                  key={q.quarter_id}
                  className="glass-card-flat px-3 py-1.5 text-[12px] text-dim"
                >
                  <span className="text-faint">Q{q.quarter_number}</span>{" "}
                  <span className="num font-semibold text-ink">
                    {q.ceo_score != null ? asNumber(q.ceo_score).toFixed(1) : "—"}
                  </span>
                  {q.band && <span className="text-faint"> · {q.band}</span>}
                </span>
              ))}
            </div>
          )}
          <Link
            href={runHref(run.seq)}
            className="mt-3 inline-flex items-center gap-1 text-[12px] text-teal hover:underline"
          >
            Open this run <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
