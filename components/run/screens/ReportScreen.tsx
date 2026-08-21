"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Action } from "@/components/ui/Kit";
import { ReportView } from "@/components/run/ReportView";
import { useRun } from "@/components/run/RunProvider";
import { ApiError } from "@/lib/api/types";

export function ReportScreen({ quarterId }: { quarterId: string }) {
  const { href, report, loadReport, can, run } = useRun();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!report);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await loadReport(quarterId);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Report not available — lock the quarter first.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quarterId, loadReport]);

  if (loading) {
    return <p className="text-[14px] text-dim">Loading report…</p>;
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-amber/30 bg-amber/[0.07] px-4 py-3 text-[13px] text-amber">
          {error ??
            "No report yet. Lock the quarter to generate one (POST …/lock)."}
        </p>
        {can("lock_quarter") && (
          <Action href={href(`/quarter/${quarterId}/lock`)}>
            Go to lock <ArrowRight className="h-4 w-4" />
          </Action>
        )}
      </div>
    );
  }

  const terminal =
    run?.run_status === "completed" || run?.run_status === "failed";
  const canOpenNext = can("open_next_quarter");

  return (
    <div className="space-y-8">
      <ReportView report={report} />
      {/* `items-center` so every pill shares one baseline as the row wraps -- a failed run shows
          the most buttons here (hub, endgame, run complete, leaderboard) and is the case that
          wraps first. */}
      <footer className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Action href={href()}>Back to hub</Action>
        {canOpenNext && (
          <Action href={href()}>
            Open next quarter from hub
            <ArrowRight className="h-4 w-4" />
          </Action>
        )}
        {can("submit_endgame_decision") && (
          <Action
            variant="outline"
            href={href(`/quarter/${quarterId}/endgame`)}
          >
            Endgame
          </Action>
        )}
        {terminal && (
          <Action variant="outline" href={href("/complete")}>
            Run complete
          </Action>
        )}
        <Action variant="outline" href="/leaderboard">
          Leaderboard
        </Action>
      </footer>
    </div>
  );
}
