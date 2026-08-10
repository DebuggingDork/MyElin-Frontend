"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileCheck2,
  Play,
  Shield,
  Trophy,
} from "lucide-react";
import { Action } from "@/components/ui/Kit";
import { asNumber } from "@/lib/api/catalog";
import { useRun } from "@/components/run/RunProvider";
import { DashboardCharts } from "@/components/run/charts/DashboardCharts";

/** Screen: GET /companies/{id}/run — hub driven by legal_moves. */
export function HubScreen() {
  const router = useRouter();
  const { companyId, company, run, report, can, openQuarter, refresh } =
    useRun();
  const [busy, setBusy] = useState(false);

  async function onOpen() {
    setBusy(true);
    try {
      const q = await openQuarter();
      router.push(`/run/${companyId}/quarter/${q.id}/briefing`);
    } finally {
      setBusy(false);
    }
  }

  const qid = run?.current_quarter_id;
  const terminal =
    run?.run_status === "completed" || run?.run_status === "failed";

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow text-cyan">
          GET /companies/&#123;id&#125;/run · legal_moves drive the UI
        </p>
        <h1 className="display mt-3 text-[clamp(1.7rem,3.4vw,2.5rem)] text-ink">
          {company?.name}
        </h1>
        <p className="mt-2 text-[14px] text-dim">
          Seed {company?.seed_name} · profile {company?.profile_name} · scenario{" "}
          {company?.scenario_id}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Status" value={run?.run_status ?? "—"} />
        <Stat
          label="Current quarter"
          value={
            run?.current_quarter_number
              ? `Q${run.current_quarter_number} · ${run.current_quarter_status}`
              : "None open"
          }
        />
        <Stat
          label="Score trajectory"
          value={
            run?.score_trajectory?.length
              ? run.score_trajectory
                  .map(
                    (s) =>
                      `Q${s.quarter_number}:${asNumber(s.ceo_score).toFixed(0)}`,
                  )
                  .join(" · ")
              : "—"
          }
        />
      </div>

      <DashboardCharts />

      {run?.binding_constraint_hint &&
        run.binding_constraint_hint.length > 0 && (
          <div className="rounded-xl border border-amber/25 bg-amber/[0.05] p-4">
            <p className="eyebrow text-amber">
              Last quarter&apos;s binding constraints
            </p>
            <ul className="mt-2 space-y-1">
              {run.binding_constraint_hint.map((g) => (
                <li key={g.gate} className="text-[12.5px] text-dim">
                  <span className="text-ink">{g.gate}</span> — {g.detail}
                </li>
              ))}
            </ul>
          </div>
        )}

      <div className="flex flex-wrap gap-3">
        {can("open_next_quarter") && (
          <Action onClick={onOpen} disabled={busy}>
            <Play className="h-4 w-4" />
            {busy ? "Opening…" : "Open next quarter"}
          </Action>
        )}
        {qid && can("submit_allocation") && (
          <Action
            variant="outline"
            href={`/run/${companyId}/quarter/${qid}/briefing`}
          >
            Continue this quarter
            <ArrowRight className="h-4 w-4" />
          </Action>
        )}
        {qid && can("lock_quarter") && (
          <Action
            variant="outline"
            href={`/run/${companyId}/quarter/${qid}/lock`}
          >
            <Shield className="h-4 w-4" />
            Lock quarter
          </Action>
        )}
        {qid && (can("read_quarter_report") || report) && (
          <Action
            variant="outline"
            href={`/run/${companyId}/quarter/${qid}/report`}
          >
            <FileCheck2 className="h-4 w-4" />
            View report
          </Action>
        )}
        {qid &&
          (can("read_endgame_preview") || can("submit_endgame_decision")) && (
            <Action
              variant="outline"
              href={`/run/${companyId}/quarter/${qid}/endgame`}
            >
              Endgame
            </Action>
          )}
        {terminal && (
          <Action variant="outline" href={`/run/${companyId}/complete`}>
            <Trophy className="h-4 w-4" />
            Run complete
          </Action>
        )}
        <Action variant="ghost" onClick={() => void refresh()}>
          Refresh run state
        </Action>
      </div>

      <div className="rounded-xl border border-line bg-raise/40 p-4">
        <p className="eyebrow text-faint">legal_moves right now</p>
        <p className="num mt-2 text-[12.5px] text-dim">
          {run?.legal_moves.join(" · ") || "none"}
        </p>
      </div>

      {company?.quarters && company.quarters.length > 0 && (
        <div>
          <p className="eyebrow text-faint">Quarters on this company</p>
          <ul className="mt-3 space-y-2">
            {company.quarters.map((q) => (
              <li key={q.id}>
                <Action
                  variant="outline"
                  href={
                    q.status === "closed"
                      ? `/run/${companyId}/quarter/${q.id}/report`
                      : `/run/${companyId}/quarter/${q.id}/briefing`
                  }
                  className="w-full !justify-between"
                >
                  <span>
                    Q{q.number} · {q.status}
                  </span>
                  <span className="num text-[12px] text-faint">
                    cash {String(q.cash_balance)}
                  </span>
                </Action>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-raise/50 p-4">
      <p className="eyebrow text-faint">{label}</p>
      <p className="mt-2 text-[14px] font-medium text-ink">{value}</p>
    </div>
  );
}
