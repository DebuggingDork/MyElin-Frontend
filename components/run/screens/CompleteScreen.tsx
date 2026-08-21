"use client";

import { ArrowRight, Skull, Trophy } from "lucide-react";
import { Action, Eyebrow, Pill } from "@/components/ui/Kit";
import { formatInr } from "@/lib/api/catalog";
import { formatDecimal, formatDisplayText, humanizeId } from "@/lib/format/display";
import { useRun } from "@/components/run/RunProvider";

/** Terminal screen when run_status is completed or failed. */
export function CompleteScreen() {
  const { href, company, run, report } = useRun();
  const failed = run?.run_status === "failed";
  const completed = run?.run_status === "completed";
  const last = run?.score_trajectory?.[run.score_trajectory.length - 1];
  const summary = report?.run_summary;

  if (!failed && !completed && run?.run_status === "active") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-[15px] text-dim">
          This run is still active — finish all quarters first.
        </p>
        <Action href={href()}>Back to hub</Action>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <Eyebrow accent={failed ? "rose" : "emerald"}>Run complete</Eyebrow>
          <Pill accent={failed ? "rose" : "emerald"}>
            {humanizeId(run?.run_status)}
          </Pill>
        </div>
        <h1 className="display mt-4 flex items-center gap-3 text-[clamp(1.7rem,3.4vw,2.5rem)] text-ink">
          {failed ? (
            <>
              <Skull className="h-7 w-7 text-rose" /> The company failed.
            </>
          ) : (
            <>
              <Trophy className="h-7 w-7 text-amber" /> The run is in the books.
            </>
          )}
        </h1>
        <p className="mt-3 text-[14px] text-dim">{company?.name}</p>
        {company?.survival_detail && (
          <p className="mt-2 text-[13px] text-dim">
            {formatDisplayText(company.survival_detail)}
          </p>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-raise/50 p-4">
          <p className="eyebrow text-faint">Final CEO score</p>
          <p className="display mt-2 text-[28px] text-ink">
            {last ? formatDecimal(last.ceo_score, 1) : "—"}
          </p>
          <p className="eyebrow mt-1 text-faint">
            {last?.band ? humanizeId(last.band) : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-raise/50 p-4">
          <p className="eyebrow text-faint">Quarters scored</p>
          <p className="num mt-2 text-[28px] font-semibold text-ink">
            {run?.score_trajectory?.length ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-raise/50 p-4">
          <p className="eyebrow text-faint">Final valuation</p>
          <p className="num mt-2 text-[18px] font-semibold text-ink">
            {summary?.final_valuation_inr != null
              ? formatInr(summary.final_valuation_inr)
              : "—"}
          </p>
        </div>
      </div>

      {run?.score_trajectory && run.score_trajectory.length > 0 && (
        <div className="rounded-xl border border-line bg-raise/50 p-5">
          <p className="eyebrow text-faint">Score trajectory</p>
          <ul className="mt-3 space-y-2">
            {run.score_trajectory.map((s) => (
              <li
                key={s.quarter_number}
                className="flex items-center justify-between text-[13px]"
              >
                <span className="text-dim">Q{s.quarter_number}</span>
                <span className="num text-ink">
                  {formatDecimal(s.ceo_score, 1)} · {humanizeId(s.band)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {run?.endgame_preview && (
        <div className="rounded-xl border border-line bg-raise/50 p-5">
          <p className="eyebrow text-faint">Endgame tier</p>
          <p className="mt-2 text-[18px] font-medium text-ink">
            {humanizeId(run.endgame_preview.tier)}
          </p>
          <p className="mt-1 text-[12.5px] text-dim">
            {formatDisplayText(run.endgame_preview.tier_detail)}
          </p>
        </div>
      )}

      {/* `items-center`, and "Back to hub" is an Action like its neighbours rather than a bare
          link. As raw text in a stretch-aligned flex row it sat at the top of the row while the
          two pills beside it were centred, so it read as misaligned and out of place -- most
          visible on a failed run, where this footer is the last thing on the page. `ghost` keeps
          it visually quieter than the other two without breaking the row's rhythm. */}
      <div className="flex flex-wrap items-center gap-3">
        <Action href="/leaderboard">
          Leaderboard <ArrowRight className="h-4 w-4" />
        </Action>
        <Action href="/simulations" variant="outline">
          New simulation
        </Action>
        <Action href={href()} variant="ghost">
          Back to hub
        </Action>
      </div>
    </div>
  );
}
