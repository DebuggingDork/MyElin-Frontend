"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Calendar,
  FileCheck2,
  Play,
  Shield,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { Action, Pill, type Accent } from "@/components/ui/Kit";
import { formatInr } from "@/lib/api/catalog";
import { formatDecimal, formatDisplayText, humanizeId } from "@/lib/format/display";
import { useRun } from "@/components/run/RunProvider";
import { DashboardCharts } from "@/components/run/charts/DashboardCharts";
import type { RunStatus } from "@/lib/api/types";

const STATUS_ACCENT: Record<RunStatus, Accent> = {
  active: "teal",
  distressed: "amber",
  failed: "rose",
  completed: "emerald",
};

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

  const statusAccent = run ? STATUS_ACCENT[run.run_status] : "teal";
  const latestScore = run?.score_trajectory?.at(-1);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-faint">Company dashboard</p>
          <h1 className="display mt-2 text-[clamp(1.7rem,3.4vw,2.5rem)] text-ink">
            {company?.name}
          </h1>
          <p className="mt-2 text-[13.5px] text-dim">
            {humanizeId(company?.seed_name)} · {humanizeId(company?.profile_name)}{" "}
            profile · {humanizeId(company?.scenario_id)}
          </p>
        </div>
        {run && (
          <Pill accent={statusAccent} solid>
            {humanizeId(run.run_status)}
          </Pill>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          icon={Activity}
          label="Status"
          value={run ? humanizeId(run.run_status) : "—"}
          accent={statusAccent}
        />
        <Stat
          icon={Calendar}
          label="Current quarter"
          value={
            run?.current_quarter_number
              ? `Q${run.current_quarter_number} / ${run.total_quarters}`
              : "None open"
          }
          hint={run?.current_quarter_status ? humanizeId(run.current_quarter_status) : null}
        />
        <Stat
          icon={TrendingUp}
          label="Latest CEO score"
          value={latestScore ? formatDecimal(latestScore.ceo_score, 0) : "—"}
          hint={
            latestScore
              ? `Q${latestScore.quarter_number} · ${humanizeId(latestScore.band)}`
              : "No quarters scored yet"
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
                  <span className="text-ink">{humanizeId(g.gate)}</span> —{" "}
                  {formatDisplayText(g.detail)}
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
                    Q{q.number} · {humanizeId(q.status)}
                  </span>
                  <span className="num text-[12px] text-faint">
                    cash {formatInr(q.cash_balance)}
                  </span>
                </Action>
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="glass-card-flat p-4 text-[12px]">
        <summary className="eyebrow cursor-pointer select-none text-faint">
          Legal moves right now (debug)
        </summary>
        <p className="num mt-2 text-[12px] text-dim">
          {run?.legal_moves.map(humanizeId).join(" · ") || "none"}
        </p>
      </details>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  accent = "teal",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string | null;
  accent?: Accent;
}) {
  return (
    <div className="glass-card flex items-start gap-3 p-4">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: `color-mix(in srgb, var(--${accent}) 16%, transparent)`,
          color: `var(--${accent})`,
        }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="eyebrow text-faint">{label}</p>
        <p className="num mt-1 truncate text-[18px] font-semibold text-ink">
          {value}
        </p>
        {hint && <p className="mt-0.5 truncate text-[11.5px] text-faint">{hint}</p>}
      </div>
    </div>
  );
}
