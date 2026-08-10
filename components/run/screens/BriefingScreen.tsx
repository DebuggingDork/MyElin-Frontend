"use client";

import Link from "next/link";
import {
  ArrowRight,
  Factory,
  FlaskConical,
  Landmark,
  Lock,
  Megaphone,
  TrendingUp,
  Users,
} from "lucide-react";
import { Action, Eyebrow, Pill, accentVar } from "@/components/ui/Kit";
import { DEPARTMENTS, formatLakhs, asNumber, type DeptIcon } from "@/lib/api/catalog";
import { useRun } from "@/components/run/RunProvider";
import { cn } from "@/lib/utils";

const DEPT_ICON: Record<DeptIcon, React.ComponentType<{ className?: string }>> = {
  landmark: Landmark,
  megaphone: Megaphone,
  "trending-up": TrendingUp,
  "flask-conical": FlaskConical,
  factory: Factory,
  users: Users,
};

/**
 * Screen after POST /companies/{id}/quarters — orients from
 * GET company + GET quarter + GET run before any allocation is staged.
 */
export function BriefingScreen({ quarterId }: { quarterId: string }) {
  const { companyId, company, run, quarter, financeUnlocked } = useRun();
  const q = quarter?.id === quarterId ? quarter : quarter;
  const financeDept = DEPARTMENTS[0];

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow accent="teal">
          Quarter {q?.number ?? run?.current_quarter_number ?? "—"} briefing
        </Eyebrow>
        <h1 className="display mt-3 text-[clamp(1.6rem,3.2vw,2.4rem)] text-ink">
          {company?.name} · Q{q?.number ?? "—"} is open.
        </h1>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-dim">
          Decisions are staged as department allocations (upserts). Nothing
          executes until you lock the quarter. Unsubmitted lines default to ₹0.
        </p>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-dim">
          {financeUnlocked
            ? "Finance & Admin is set for this quarter — the other five departments are open, in any order."
            : "Set Finance & Admin first. The other five departments unlock the moment it's saved."}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        <Kpi label="Cash balance" value={formatMoney(q?.cash_balance)} />
        <Kpi label="Revenue (YTD)" value={formatMoney(q?.revenue)} />
        <Kpi label="Run status" value={run?.run_status ?? "—"} />
        <Kpi
          label="Quarter status"
          value={q?.status ?? run?.current_quarter_status ?? "—"}
        />
      </div>

      {q?.modifiers && Object.keys(q.modifiers).length > 0 && (
        <div className="rounded-xl border border-line bg-raise/50 p-5">
          <p className="eyebrow text-faint">Opening modifiers</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {Object.entries(q.modifiers).map(([key, val]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-line bg-white/[0.02] px-3 py-2"
              >
                <span className="text-[12.5px] text-dim">{key}</span>
                <span className="num text-[13px] text-ink">
                  {Number(val).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {run &&
        run.crisis_quarter === (q?.number ?? run.current_quarter_number) && (
        <div className="rounded-xl border border-rose/30 bg-rose/[0.06] p-4">
          <p className="text-[13.5px] font-medium text-rose">
            This is the crisis quarter (Q{run.crisis_quarter}).
          </p>
          <p className="mt-1 text-[12.5px] text-dim">
            After the six department allocations, submit a crisis response.
            The scenario letter is not exposed before lock — diagnose from
            your own results.
          </p>
        </div>
      )}

      {(q?.number ?? 0) === (run?.total_quarters ?? 0) && (
        <div className="rounded-xl border border-amber/30 bg-amber/[0.06] p-4">
          <p className="text-[13.5px] font-medium text-amber">
            Final quarter — endgame is available.
          </p>
          <p className="mt-1 text-[12.5px] text-dim">
            Review the term-sheet menu before or after allocations; submit
            your path before lock.
          </p>
        </div>
      )}

      <div>
        <p className="eyebrow text-faint">
          Finance & Admin first, then five departments · any order
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {DEPARTMENTS.map((d) => {
            const locked = !financeUnlocked && d.id !== "finance_admin";
            const startHere = d.id === "finance_admin" && !financeUnlocked;
            const Icon = DEPT_ICON[d.icon];
            const color = accentVar[d.accent];

            const card = (
              <div
                className={cn(
                  "glass-card flex h-full flex-col gap-3 p-4",
                  locked && "opacity-55",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `color-mix(in srgb, ${color} 16%, transparent)`,
                      color,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {locked && (
                    <Pill accent="amber">
                      <Lock className="h-3 w-3" />
                      Locked
                    </Pill>
                  )}
                  {startHere && (
                    <Pill accent="teal" solid>
                      Start here
                    </Pill>
                  )}
                </div>

                <div>
                  <p className="text-[14px] font-medium text-ink">{d.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-faint">
                    {locked ? "Unlocks after Finance & Admin" : d.tagline}
                  </p>
                </div>

                <p className="mt-auto rounded-lg bg-[var(--panel-2)] px-3 py-2 text-[12px] italic leading-snug text-dim">
                  &ldquo;{d.quote}&rdquo;
                </p>
              </div>
            );

            return locked ? (
              <div key={d.id} className="cursor-not-allowed">
                {card}
              </div>
            ) : (
              <Link
                key={d.id}
                href={`/run/${companyId}/quarter/${quarterId}/allocate/${d.id}`}
                className="hover-lift block"
              >
                {card}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <Action
          href={`/run/${companyId}/quarter/${quarterId}/allocate/${financeDept.id}`}
        >
          Start with {financeDept.name}
          <ArrowRight className="h-4 w-4" />
        </Action>
        <Action
          variant="outline"
          href={`/run/${companyId}/quarter/${quarterId}/lock`}
        >
          Skip to lock
        </Action>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-raise px-4 py-3.5">
      <p className="eyebrow text-faint">{label}</p>
      <p className="num mt-1.5 text-[16px] font-semibold text-ink">{value}</p>
    </div>
  );
}

function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = asNumber(value);
  // Quarter cash/revenue on the detail payload are typically full INR.
  if (Math.abs(n) >= 1000) {
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  }
  return formatLakhs(n);
}
