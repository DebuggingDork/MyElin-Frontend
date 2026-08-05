"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronRight,
  FileCheck2,
  FileText,
  Landmark,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { KpiStrip } from "@/components/quarter/Kpi";
import { useQuarter } from "@/components/quarter/QuarterProvider";
import { catalogs, COMPANY } from "@/lib/quarter/catalog";
import {
  decisionsSetCount,
  WORKSPACE_ORDER,
  type WorkspaceStatus,
} from "@/lib/quarter/types";

/* Persistent quarter chrome: top bar with the KPI strip, and the
   step-sequence rail (briefing → six workspaces → approval → report).
   Finance is deliberately step #1 — it owns the budget every other
   workspace draws from. */

function StatusDot({ status }: { status: WorkspaceStatus }) {
  if (status === "complete") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald/20">
        <Check className="h-2.5 w-2.5 text-emerald" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        status === "in_progress" ? "bg-amber" : "bg-white/15",
      )}
    />
  );
}

export function QuarterShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { quarter, draft, result, statuses } = useQuarter();
  const base = `/quarter/${quarter}`;

  const workspacesComplete = WORKSPACE_ORDER.every(
    (ws) => statuses[ws] === "complete",
  );

  const steps = [
    {
      href: `${base}/briefing`,
      label: "CEO Briefing",
      icon: FileText,
      meta: "Quarter state",
      enabled: true,
      done: false,
    },
    ...WORKSPACE_ORDER.map((ws) => {
      const catalog = catalogs[ws];
      const { done, total } = decisionsSetCount(catalog, draft.decisions[ws]);
      return {
        href: `${base}/workspace/${ws}`,
        label: catalog.name,
        icon: undefined,
        meta: total > 0 ? `${done}/${total} decisions` : "Spec pending",
        status: statuses[ws],
        enabled: true,
        done: statuses[ws] === "complete",
      };
    }),
    {
      href: `${base}/approval`,
      label: "Quarter Approval",
      icon: Landmark,
      meta: "FIN-015 · final gate",
      enabled: workspacesComplete || Boolean(result),
      done: Boolean(result),
    },
    ...(result
      ? [
          {
            href: `${base}/report`,
            label: "Quarter Report",
            icon: FileCheck2,
            meta: `${result.scoring.final_score}/100 · ${result.scoring.band}`,
            enabled: true,
            done: false,
          },
        ]
      : []),
    ...(quarter >= 3
      ? [
          {
            href: `${base}/endgame`,
            label: "Term Sheets",
            icon: TrendingUp,
            meta: "Momentum · tier",
            enabled: Boolean(result),
            done: false,
          },
        ]
      : []),
  ];

  const rail = (
    <nav className="flex flex-col gap-1">
      {steps.map((step) => {
        const active = pathname === step.href;
        const Icon = step.icon;
        const inner = (
          <>
            {Icon ? (
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: active ? "var(--violet-2)" : "var(--faint)" }}
              />
            ) : (
              <StatusDot status={(step as { status?: WorkspaceStatus }).status ?? "not_started"} />
            )}
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block truncate text-[13.5px]",
                  active ? "font-medium text-ink" : "text-dim",
                )}
              >
                {step.label}
              </span>
              <span className="num block text-[10.5px] text-faint">
                {step.meta}
              </span>
            </span>
            {active && <ChevronRight className="h-3.5 w-3.5 text-faint" />}
          </>
        );

        if (!step.enabled) {
          return (
            <div
              key={step.href}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 opacity-40"
              title="Complete every workspace first"
            >
              {inner}
            </div>
          );
        }
        return (
          <Link
            key={step.href}
            href={step.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              active
                ? "border border-violet/30 bg-violet/[0.08]"
                : "border border-transparent hover:bg-white/[0.04]",
            )}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-void text-ink">
      {/* rail */}
      <aside className="hidden h-full w-[248px] shrink-0 flex-col border-r border-line bg-base lg:flex">
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <Link href="/" aria-label="Myelin home">
            <Logo variant="glyph" />
          </Link>
          <span className="eyebrow text-faint">Q{quarter} · 2026</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{rail}</div>
        <div className="border-t border-line p-3">
          <Link
            href="/simulations"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-dim transition-colors hover:bg-white/[0.04] hover:text-ink"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit simulation
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex h-[58px] shrink-0 items-center justify-between gap-4 border-b border-line bg-base/90 px-4 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-ink">
              {COMPANY.name}
              <span className="ml-2 hidden text-[12.5px] text-faint sm:inline">
                {COMPANY.descriptor}
              </span>
            </p>
          </div>
          <KpiStrip compact />
        </header>

        {/* mobile step strip */}
        <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-line bg-base px-3 py-2 lg:hidden">
          {steps
            .filter((s) => s.enabled)
            .map((step) => {
              const active = pathname === step.href;
              return (
                <Link
                  key={step.href}
                  href={step.href}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-[12px]",
                    active
                      ? "border-violet/40 bg-violet/10 text-ink"
                      : "border-line text-dim",
                  )}
                >
                  {step.label}
                </Link>
              );
            })}
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
