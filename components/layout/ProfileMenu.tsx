"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api/client";
import type { CompanyListItem, RunStatus } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Meter, Pill, type Accent } from "@/components/ui/Kit";
import { cn } from "@/lib/utils";

const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  active: "Active",
  distressed: "Distressed",
  failed: "Failed",
  completed: "Completed",
};

const RUN_STATUS_ACCENT: Record<RunStatus, Accent> = {
  active: "teal",
  distressed: "amber",
  failed: "rose",
  completed: "emerald",
};

function initials(email: string) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  const chars =
    parts.length >= 2 ? [parts[0]?.[0], parts[1]?.[0]] : [local[0], local[1]];
  return chars.filter(Boolean).join("").toUpperCase() || "?";
}

function Avatar({ email, size = 28 }: { email: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-[#071a16]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: "linear-gradient(135deg, var(--teal), var(--teal-bright))",
      }}
    >
      {initials(email)}
    </span>
  );
}

/** Reads the same `/companies` list the leaderboard and play flow use, so "usage" here is the
 *  user's actual simulation runs -- there's no separate quota/billing concept in the backend. */
export function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [runs, setRuns] = useState<CompanyListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !user || runs !== null) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const { entries } = await api.listCompanies();
        if (!cancelled) setRuns(entries);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load usage");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user, runs]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const active = runs?.find((r) => r.run_status === "active") ?? runs?.[0] ?? null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-[13px] text-ink transition-colors hover:border-white/30 hover:bg-white/[0.06]"
      >
        <Avatar email={user.email} />
        <span className="hidden max-w-[140px] truncate sm:inline">{user.email}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-dim transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-80 overflow-hidden rounded-2xl border border-line bg-void/97 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-line px-4 py-4">
            <Avatar email={user.email} size={40} />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium text-ink">{user.email}</p>
              <p className="truncate text-[11.5px] text-faint">
                ID {user.user_id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="px-4 py-4">
            <p className="mb-3 text-[11px] uppercase tracking-wide text-faint">
              Usage
            </p>

            {loading && <p className="text-[13px] text-dim">Loading usage…</p>}

            {!loading && error && <p className="text-[13px] text-dim">{error}</p>}

            {!loading && !error && runs && runs.length === 0 && (
              <p className="text-[13px] text-dim">
                No simulations started yet.{" "}
                <Link
                  href="/simulations"
                  onClick={() => setOpen(false)}
                  className="text-[var(--teal)] hover:underline"
                >
                  Start one
                </Link>
              </p>
            )}

            {!loading && !error && runs && runs.length > 0 && active && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] text-ink">{active.name}</span>
                  <Pill accent={RUN_STATUS_ACCENT[active.run_status]}>
                    {RUN_STATUS_LABEL[active.run_status]}
                  </Pill>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11.5px] text-faint">
                    <span>Quarters locked</span>
                    <span>
                      {active.quarters_locked} / {active.total_quarters}
                    </span>
                  </div>
                  <Meter
                    value={
                      active.total_quarters > 0
                        ? (active.quarters_locked / active.total_quarters) * 100
                        : 0
                    }
                    accent={RUN_STATUS_ACCENT[active.run_status]}
                  />
                </div>
                {active.latest_ceo_score != null && (
                  <p className="text-[11.5px] text-faint">
                    Latest CEO score {String(active.latest_ceo_score)}
                    {active.latest_band ? ` · ${active.latest_band}` : ""}
                  </p>
                )}
                <p className="text-[11.5px] text-faint">
                  {runs.length} run{runs.length === 1 ? "" : "s"} total
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-line p-2">
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] text-dim transition-colors hover:bg-white/5 hover:text-ink"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
