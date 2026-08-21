"use client";

/**
 * The desks this account already owns.
 *
 * Its own file rather than a branch inside `PlayExperience`: the picker is a whole screen with
 * its own layout, and keeping it here means it can be rendered from sample rows -- which a
 * screen that only ever appears behind a session and a populated API otherwise cannot be.
 *
 * Same ledger vocabulary as the entry gate in front of it: masthead, one serif line, and the
 * runs as a ruled index with one tick per closed quarter. A four-quarter run does not need a
 * percentage bar to say where it stands.
 */

import { ArrowRight, Plus } from "lucide-react";
import { asNumber } from "@/lib/api/catalog";
import type { CompanyListItem } from "@/lib/api/types";
import type { Scenario } from "@/lib/play/types";
import { Action, Container } from "@/components/ui/Kit";
import { cn } from "@/lib/utils";

/** Teal is the live system; vermilion is what it cost. */
const RUN_TONE: Record<string, string> = {
  active: "text-teal",
  distressed: "text-ember-soft",
  failed: "text-ember",
  completed: "text-dim",
};

/** Company · quarters · score · state. Fractions, so every column keeps a share of whatever
 *  width the viewport has and the row reads as one line of a statement. */
const COLUMNS = "grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]";
const COLUMNS_SM = "sm:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]";

const isLive = (run: CompanyListItem) =>
  run.run_status === "active" || run.run_status === "distressed";

export function RunPicker({
  scenario,
  runs,
  error,
  onResume,
  onStart,
}: {
  scenario: Scenario;
  runs: CompanyListItem[];
  error?: string | null;
  onResume: (run: CompanyListItem) => void;
  onStart: () => void;
}) {
  // Open runs first: someone with a quarter still on the table came back for that one.
  const open = runs.filter(isLive);
  const closed = runs.filter((run) => !isLive(run));

  return (
    <div className="ledger relative flex min-h-dvh flex-col bg-void">
      <div className="grid-lines absolute inset-0" />

      <header className="relative z-10 border-b border-line">
        <Container wide className="flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="tick-label">Myelin · {scenario.name}</p>
          <p className="tick-label">
            {open.length} open · {closed.length} closed
          </p>
        </Container>
      </header>

      <Container
        wide
        className="relative z-10 flex flex-1 flex-col py-[clamp(2rem,5vh,3.5rem)]"
      >
        <div className="grid items-end gap-x-16 gap-y-6 lg:grid-cols-[1.3fr_auto]">
          <div>
            <p className="tick-label rise">Your desks</p>
            <h1 className="ledger-display rise rise-1 mt-4 text-balance text-[clamp(2.2rem,4.6vw,3.4rem)] text-ink">
              Pick up where you <span className="italic text-teal">left off.</span>
            </h1>
            <p className="rise rise-2 mt-5 max-w-[52ch] border-t border-line pt-5 text-[15.5px] leading-[1.65] text-dim">
              Each run is a company you own, played over four quarters. They live on the server,
              not in this browser — so they are here on any machine you sign in from.
            </p>
          </div>

          <div className="rise rise-2 lg:justify-self-end">
            <Action onClick={onStart} size="lg">
              <Plus className="h-4 w-4" />
              Start a new run
            </Action>
            <p className="tick-label mt-3 lg:text-right">Opens the front page first</p>
          </div>
        </div>

        {error && (
          <p className="mt-6 border border-ember/40 bg-ember/[0.08] px-4 py-3 text-[13px] text-ember">
            {error}
          </p>
        )}

        {/* The index. Column heads, because four figures per row without them is a table
            asking to be decoded -- and fractional columns rather than fixed ones, so the
            figures sit under their own heading instead of stranding a dead band of grid
            between a short company name and the numbers. */}
        <div className="mt-[clamp(2rem,5vh,3rem)]">
          <div className={cn("hidden gap-x-6 border-b border-line pb-3 sm:grid", COLUMNS)}>
            <p className="tick-label">Company</p>
            <p className="tick-label">Quarters closed</p>
            <p className="tick-label">Last score</p>
            <p className="tick-label text-right">State</p>
          </div>

          {[...open, ...closed].map((run) => (
            <RunRow key={run.id} run={run} onResume={() => onResume(run)} />
          ))}
        </div>
      </Container>
    </div>
  );
}

function RunRow({ run, onResume }: { run: CompanyListItem; onResume: () => void }) {
  const live = isLive(run);
  const quarters = run.total_quarters || 4;

  return (
    <button
      type="button"
      onClick={onResume}
      className={cn(
        "group grid w-full grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 border-b border-line",
        "py-3.5 text-left transition-colors duration-200 hover:bg-[var(--panel)]",
        COLUMNS_SM,
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-[15.5px] text-ink">{run.name}</span>
        <span className="num mt-1.5 block text-[11.5px] text-faint">Run {run.seq}</span>
      </span>

      {/* One tick per quarter. Four of them do not need a percentage. */}
      <span className="hidden items-center gap-3 sm:flex">
        <span aria-hidden className="flex gap-[3px]">
          {Array.from({ length: quarters }).map((_, i) => (
            <span
              key={i}
              className={cn("h-2 w-4", i < run.quarters_locked ? "bg-teal" : "bg-line-2")}
            />
          ))}
        </span>
        <span className="num text-[11.5px] text-dim">
          {run.quarters_locked}/{quarters}
        </span>
      </span>

      <span className="num hidden text-[11.5px] text-dim sm:block">
        {run.latest_ceo_score != null
          ? `${asNumber(run.latest_ceo_score).toFixed(1)}${run.latest_band ? ` · ${run.latest_band}` : ""}`
          : "—"}
      </span>

      {/* State and action share the last column and never wrap: two words on two lines with a
          stray arrow under them was the alignment that made this row look broken. */}
      <span className="flex items-center justify-end gap-4 whitespace-nowrap">
        <span
          className={cn(
            "tick-label inline-flex items-center gap-2",
            RUN_TONE[run.run_status] ?? "text-dim",
          )}
        >
          {live && <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />}
          {run.run_status}
        </span>
        <span className="hidden shrink-0 items-center gap-1 text-[13px] text-teal sm:inline-flex">
          {live ? "Resume" : "Review"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </button>
  );
}
