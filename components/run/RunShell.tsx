"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SIMULATION_TABS } from "@/components/simulation/SimulationApp";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { Pill } from "@/components/ui/Kit";
import { DEPARTMENTS } from "@/lib/api/catalog";
import { humanizeId } from "@/lib/format/display";
import { useRun } from "@/components/run/RunProvider";
import { RunKpiBar } from "@/components/run/RunKpiBar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "myelin_run_sidebar_open";

function readSidebarOpen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return raw === null ? true : raw === "1";
  } catch {
    return true;
  }
}

/**
 * Persistent chrome for every run screen. Nav items are enabled from
 * legal_moves — never hardcoded by quarter number alone.
 */
export function RunShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSimulationTab = searchParams.get("tab");
  const { user, ready } = useAuth();
  const { companyId, company, run, report, loading, error, can, financeUnlocked } =
    useRun();

  const [sidebarOpen, setSidebarOpen] = useState(readSidebarOpen);
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => {
      const next = !open;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* private browsing / storage disabled -- the toggle still works, it just won't stick */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, router, pathname]);

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void text-dim">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading run state…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void text-dim">
        Redirecting to login…
      </div>
    );
  }

  const qid = run?.current_quarter_id;
  const qBase = qid ? `/run/${companyId}/quarter/${qid}` : null;
  const terminal =
    run?.run_status === "completed" || run?.run_status === "failed";

  // The Nadi Wear simulation ships its own full-width chrome (header, tab bar, ticker) and a
  // light surface, so it renders flush inside `main` rather than in the shared max-w column.
  const simulationBase = `/run/${companyId}/simulation`;
  const onSimulation = pathname === simulationBase || pathname.startsWith(simulationBase + "/");

  const links: {
    href: string;
    label: string;
    enabled: boolean;
    match?: (path: string) => boolean;
  }[] = [
    {
      href: `/run/${companyId}`,
      label: "1 · Run hub",
      enabled: true,
      match: (p) => p === `/run/${companyId}`,
    },
    {
      href: qBase ? `${qBase}/briefing` : "#",
      label: "2 · Quarter briefing",
      enabled: Boolean(qid),
    },
    ...DEPARTMENTS.map((d, i) => ({
      href: qBase ? `${qBase}/allocate/${d.id}` : "#",
      label: `${i + 3} · ${d.name}`,
      // Finance & Admin (index 0) is always the first legal stop in a fresh quarter -- the other
      // five stay locked in the nav until `financeUnlocked`, mirroring the gate in
      // `AllocationWorkspace` and `BriefingScreen` so a direct nav click can't skip it either.
      enabled:
        Boolean(qid) &&
        (can("submit_allocation") || Boolean(report)) &&
        (financeUnlocked || d.id === "finance_admin" || Boolean(report)),
    })),
    {
      href: qBase ? `${qBase}/crisis` : "#",
      label: "9 · Crisis",
      enabled: can("submit_crisis_allocation") || Boolean(qid && run?.crisis_quarter === run?.current_quarter_number && report),
    },
    {
      href: qBase ? `${qBase}/endgame` : "#",
      label: "10 · Endgame",
      enabled:
        can("read_endgame_preview") ||
        can("submit_endgame_decision") ||
        Boolean(run?.endgame_preview),
    },
    {
      href: qBase ? `${qBase}/lock` : "#",
      label: "11 · Lock quarter",
      enabled: can("lock_quarter"),
    },
    {
      href: qBase ? `${qBase}/report` : "#",
      label: "12 · Quarter report",
      enabled: can("read_quarter_report") || Boolean(report),
    },
    {
      href: `/run/${companyId}/complete`,
      label: "13 · Run complete",
      enabled: terminal,
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      enabled: true,
    },
  ];

  /**
   * Nadi Wear's own screens. One page holds all four quarters -- the quarter you are in is
   * the run's, and these are the surfaces within it -- so each entry deep-links to a tab
   * rather than to a separate route.
   */
  const simulationLinks = SIMULATION_TABS.map((t) => ({
    href: `${simulationBase}?tab=${t.id}`,
    label: t.label,
    id: t.id,
  }));

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-void text-ink">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-line bg-gradient-to-b from-raise/60 via-base to-base lg:flex",
          "motion-safe:transition-[width] motion-safe:duration-200 motion-safe:ease-out",
          sidebarOpen ? "w-[268px]" : "w-16",
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-line px-4 py-4",
            sidebarOpen ? "justify-between" : "justify-center px-0",
          )}
        >
          {sidebarOpen && (
            <Link href="/" aria-label="Myelin home">
              <Logo variant="glyph" />
            </Link>
          )}
          <div className={cn("flex items-center", sidebarOpen && "gap-2")}>
            {sidebarOpen && (
              <Pill
                accent={
                  run?.run_status === "failed"
                    ? "rose"
                    : run?.run_status === "distressed"
                      ? "amber"
                      : run?.run_status === "completed"
                        ? "emerald"
                        : "cyan"
                }
              >
                {run?.run_status ?? "—"}
              </Pill>
            )}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={sidebarOpen}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:bg-[var(--panel-2)] hover:text-ink"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {!sidebarOpen && <div className="h-1.5" />}

        <nav
          className={cn(
            "flex-1 space-y-1 overflow-y-auto p-3",
            !sidebarOpen && "hidden",
          )}
        >
          {links.map((link) => {
            const active = link.match
              ? link.match(pathname)
              : pathname === link.href || pathname.startsWith(link.href + "/");
            if (!link.enabled) {
              return (
                <div
                  key={link.label}
                  className="rounded-lg px-3 py-2.5 text-[13px] text-faint opacity-40"
                >
                  {link.label}
                </div>
              );
            }
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-[13.5px] transition-all duration-200",
                  active
                    ? "border border-teal/30 bg-teal/[0.1] font-medium text-ink shadow-[0_0_0_1px_rgba(20,184,166,0.06),0_4px_16px_-8px_rgba(20,184,166,0.35)]"
                    : "border border-transparent text-dim hover:bg-[var(--panel-2)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-4 border-t border-line pt-3">
            <p className="px-3 pb-1.5 text-[10.5px] uppercase tracking-[0.18em] text-faint">
              Nadi Wear · 4 quarters
            </p>
            {simulationLinks.map((link) => {
              const active = onSimulation && (activeSimulationTab ?? "dashboard") === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-[13.5px] transition-all duration-200",
                    active
                      ? "border border-teal/30 bg-teal/[0.1] font-medium text-ink shadow-[0_0_0_1px_rgba(20,184,166,0.06),0_4px_16px_-8px_rgba(20,184,166,0.35)]"
                      : "border border-transparent text-dim hover:bg-[var(--panel-2)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-line p-3">
          <Link
            href="/simulations"
            aria-label="Exit run"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-dim hover:bg-[var(--panel-2)] hover:text-ink",
              !sidebarOpen && "justify-center px-0",
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {sidebarOpen && "Exit run"}
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header, KPI strip and body share one gutter (px-4 / sm:px-6 / lg:px-8) so every
            rule on the screen starts and ends on the same vertical line. */}
        <header className="flex h-[58px] shrink-0 items-center justify-between gap-4 border-b border-line bg-base/90 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-ink">
              {company?.name ?? "Company"}
            </p>
            <p className="num truncate text-[11px] text-faint">
              {company?.scenario.display_name ?? company?.scenario_id} · Q
              {run?.current_quarter_number ?? "—"}/{run?.total_quarters ?? "—"}
              {run?.crisis_quarter ? ` · crisis Q${run.crisis_quarter}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
              {run?.legal_moves.map((m) => (
                <span
                  key={m}
                  className="num rounded-full border border-line px-2 py-1 text-[10px] text-faint"
                >
                  {humanizeId(m)}
                </span>
              ))}
            </div>
            <ThemeToggle />
            <div className="h-6 w-px bg-line" aria-hidden />
            <ProfileMenu />
          </div>
        </header>

        <RunKpiBar />

        <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-line px-4 py-2 sm:px-6 lg:hidden">
          {links
            .filter((l) => l.enabled)
            .map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-[12px]",
                    active
                      ? "border-teal/40 bg-teal/10 text-ink"
                      : "border-line text-dim",
                  )}
                >
                  {link.label.replace(/^\d+ · /, "")}
                </Link>
              );
            })}
          <Link
            href={simulationBase}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[12px]",
              onSimulation ? "border-teal/40 bg-teal/10 text-ink" : "border-line text-dim",
            )}
          >
            Nadi Wear
          </Link>
        </div>

        {onSimulation ? (
          <main className="flex-1 overflow-y-auto">{children}</main>
        ) : (
          <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
            {/*
              The gutter matches the header and the KPI strip above (px-4 / sm:px-6 / lg:px-8),
              so the body starts on the same left rule as the chrome instead of sitting in a
              narrow centred column with the strip running full-bleed past it. `max-w-[1440px]`
              is the readability ceiling, not the layout: below it -- every laptop, and every
              desktop once the 268px rail is subtracted -- the column simply fills the width.
            */}
            <div className="mx-auto w-full max-w-[1440px]">
              {error && (
                <p className="mb-6 rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
                  {error}
                </p>
              )}
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
