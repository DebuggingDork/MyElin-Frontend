"use client";

/**
 * Cross-user leaderboard for one simulation scenario.
 *
 * Shows the top-3 entries on a podium (1st in the centre, 2nd left, 3rd right —
 * classic medal layout), then the requesting user's own row below if they are not
 * already in the top 3.  Every field the backend now returns is displayed:
 *   • user name   • company name   • CEO score   • composite score
 *   • band        • valuation      • net P&L
 *
 * Intended to be rendered inside a modal (see SimulationLeaderboardModal) or
 * embedded directly in a page.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Star, TrendingDown, TrendingUp, X } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type { LeaderboardEntry, LeaderboardResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

function n(v: string | number | null | undefined, decimals = 1): string {
  if (v == null) return "—";
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(num)) return "—";
  return num.toFixed(decimals);
}

/** Format a rupee figure in crores/lakhs shorthand. */
function inrShort(v: string | number | null | undefined): string {
  if (v == null) return "—";
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(num)) return "—";
  const abs = Math.abs(num);
  const sign = num < 0 ? "−" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(1)} L`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

const BAND_COLOR: Record<string, string> = {
  Exceptional: "text-teal",
  Strong: "text-emerald-500",
  Competent: "text-amber-500",
  Weak: "text-orange-500",
  Poor: "text-rose-500",
};

function bandColor(band: string) {
  return BAND_COLOR[band] ?? "text-dim";
}

// ── rank medal decorations ────────────────────────────────────────────────────

const RANK_META = [
  {
    icon: Crown,
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/30",
    size: "h-6 w-6",
  },
  {
    icon: Medal,
    color: "text-zinc-400",
    bg: "bg-zinc-400/10  border-zinc-400/30",
    size: "h-5 w-5",
  },
  {
    icon: Star,
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/30",
    size: "h-5 w-5",
  },
] as const;

// ── sub-components ────────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9.5px] uppercase tracking-widest text-faint">
        {label}
      </span>
      <span className={cn("num text-[13px] font-semibold text-ink", className)}>
        {value}
      </span>
    </div>
  );
}

/** The centre (1st) podium card is taller and more prominent. */
function PodiumCard({
  entry,
  position,
}: {
  entry: LeaderboardEntry;
  position: 0 | 1 | 2;
}) {
  const meta = RANK_META[position];
  const Icon = meta.icon;
  const isFirst = position === 0;
  const netPositive =
    entry.net_profit_inr != null &&
    parseFloat(String(entry.net_profit_inr)) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: position * 0.07 }}
      className={cn(
        "relative flex flex-col items-center rounded-xl border px-4 py-5 text-center",
        entry.is_current_user
          ? "border-teal/50 bg-teal/5"
          : "border-line bg-[var(--panel)]",
        isFirst ? "min-h-[220px]" : "min-h-[190px]",
      )}
    >
      {entry.is_current_user && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-teal px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
          You
        </span>
      )}

      {/* rank icon */}
      <span
        className={cn(
          "mb-2 flex h-9 w-9 items-center justify-center rounded-full border",
          meta.bg,
        )}
      >
        <Icon className={cn(meta.size, meta.color)} />
      </span>

      {/* rank number */}
      <span className="num text-[11px] font-bold uppercase tracking-widest text-faint">
        #{entry.rank}
      </span>

      {/* user + company */}
      <p className="mt-1 max-w-[130px] truncate text-[14px] font-semibold text-ink">
        {entry.user_name ?? "—"}
      </p>
      <p className="max-w-[130px] truncate text-[11px] text-faint">
        {entry.company_name}
      </p>

      {/* divider */}
      <div className="my-3 w-full border-t border-line" />

      {/* scores */}
      <div className="grid w-full grid-cols-2 gap-x-3 gap-y-2 text-left">
        <StatCell label="Composite score" value={n(entry.ceo_score)} />
        <StatCell
          label="Band"
          value={entry.band}
          className={bandColor(entry.band)}
        />
        <StatCell label="Valuation" value={inrShort(entry.valuation_inr)} />
        <div className="flex flex-col gap-0.5">
          <span className="text-[9.5px] uppercase tracking-widest text-faint">
            Net P&amp;L
          </span>
          <span
            className={cn(
              "num flex items-center gap-1 text-[13px] font-semibold",
              netPositive ? "text-emerald-500" : "text-rose-500",
            )}
          >
            {netPositive ? (
              <TrendingUp className="h-3 w-3 shrink-0" />
            ) : (
              <TrendingDown className="h-3 w-3 shrink-0" />
            )}
            {inrShort(entry.net_profit_inr)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/** Compact row used for rank ≥ 4 and the "your position" callout. */
function LeaderRow({ entry }: { entry: LeaderboardEntry }) {
  const netPositive =
    entry.net_profit_inr != null &&
    parseFloat(String(entry.net_profit_inr)) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "grid items-center gap-x-4 gap-y-1 rounded-lg border px-4 py-3",
        "grid-cols-[28px_1fr_repeat(4,auto)]",
        entry.is_current_user
          ? "border-teal/40 bg-teal/5"
          : "border-line bg-[var(--panel)]",
      )}
    >
      {/* rank */}
      <span className="num text-center text-[12px] font-bold text-faint">
        #{entry.rank}
      </span>

      {/* identity */}
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink">
          {entry.user_name ?? "—"}
          {entry.is_current_user && (
            <span className="ml-1.5 rounded bg-teal/15 px-1 py-px text-[9px] font-bold uppercase tracking-widest text-teal">
              you
            </span>
          )}
        </p>
        <p className="truncate text-[11px] text-faint">{entry.company_name}</p>
      </div>

      {/* ceo score */}
      <div className="hidden text-right sm:block">
        <span className="text-[9px] uppercase tracking-widest text-faint block">
          COMP
        </span>
        <span className="num text-[13px] font-semibold text-ink">
          {n(entry.ceo_score)}
        </span>
      </div>

      {/* band */}
      <div className="hidden text-right sm:block">
        <span className="text-[9px] uppercase tracking-widest text-faint block">
          Band
        </span>
        <span
          className={cn("num text-[12px] font-semibold", bandColor(entry.band))}
        >
          {entry.band}
        </span>
      </div>

      {/* valuation */}
      <div className="hidden text-right md:block">
        <span className="text-[9px] uppercase tracking-widest text-faint block">
          Val.
        </span>
        <span className="num text-[12px] text-ink">
          {inrShort(entry.valuation_inr)}
        </span>
      </div>

      {/* net P&L */}
      <div className="text-right">
        <span className="text-[9px] uppercase tracking-widest text-faint block">
          P&amp;L
        </span>
        <span
          className={cn(
            "num flex items-center justify-end gap-0.5 text-[12px] font-semibold",
            netPositive ? "text-emerald-500" : "text-rose-500",
          )}
        >
          {netPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {inrShort(entry.net_profit_inr)}
        </span>
      </div>
    </motion.div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function SimulationLeaderboard({
  scenarioId = "nadi_wear_standard",
  scenarioTitle = "Startup Survival",
}: {
  scenarioId?: string;
  scenarioTitle?: string;
}) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getLeaderboard(scenarioId)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load leaderboard",
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-[13px] text-faint">
        Loading leaderboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose/30 bg-rose/5 px-4 py-3 text-[13px] text-rose">
        {error}
      </div>
    );
  }

  if (!data || data.total_entries === 0) {
    return (
      <div className="py-12 text-center text-[14px] text-faint">
        No completed runs yet — be the first on the board.
      </div>
    );
  }

  const top = data.top_entries;
  // Podium order: 2nd (index 1) · 1st (index 0) · 3rd (index 2)
  const podiumOrder: Array<{ entry: LeaderboardEntry; position: 0 | 1 | 2 }> =
    [];
  if (top[1]) podiumOrder.push({ entry: top[1], position: 1 });
  if (top[0]) podiumOrder.push({ entry: top[0], position: 0 });
  if (top[2]) podiumOrder.push({ entry: top[2], position: 2 });

  // Current user row shown below podium only when they're not already in top 3
  const userInTop3 = top.some((e) => e.is_current_user);
  const userEntry = !userInTop3 ? data.current_user_entry : null;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10.5px] uppercase tracking-widest text-faint">
            Simulation
          </p>
          <h3 className="text-[18px] font-semibold text-ink drop-shadow-[0_0_12px_rgba(36,177,177,0.4)]">
            {scenarioTitle} · Leaderboard
          </h3>
        </div>
        <span className="num text-[13px] font-medium text-dim">
          {data.total_entries} player{data.total_entries !== 1 ? "s" : ""}
        </span>
      </div>

      {/* column headers for the table below the podium */}
      {top.length >= 1 && (
        <>
          {/* ── podium ── */}
          <div
            className={cn(
              "grid items-end gap-3",
              top.length === 1
                ? "grid-cols-1 justify-items-center"
                : top.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3",
            )}
          >
            {podiumOrder.map(({ entry, position }) => (
              <PodiumCard
                key={entry.user_id}
                entry={entry}
                position={position}
              />
            ))}
          </div>
        </>
      )}

      {/* ── current user row (outside top 3) ── */}
      {userEntry && (
        <div className="space-y-1.5">
          <p className="text-[10.5px] uppercase tracking-widest text-faint">
            Your position
          </p>
          <LeaderRow entry={userEntry} />
        </div>
      )}

      {/* ── no-score callout for the requesting user ── */}
      {!userEntry && !userInTop3 && (
        <p className="rounded-lg border border-line bg-[var(--panel)] px-4 py-3 text-center text-[13px] text-faint">
          Complete a run to appear on this leaderboard.
        </p>
      )}
    </div>
  );
}

// ── modal wrapper ─────────────────────────────────────────────────────────────

export function SimulationLeaderboardModal({
  open,
  onClose,
  scenarioId,
  scenarioTitle,
}: {
  open: boolean;
  onClose: () => void;
  scenarioId?: string;
  scenarioTitle?: string;
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm dark:bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-base shadow-2xl"
        style={{ maxHeight: "90dvh" }}
      >
        {/* close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close leaderboard"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-dim transition-all hover:border-line hover:bg-[var(--panel)] hover:text-ink focus:border-teal focus:text-teal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-8 pt-6">
          <SimulationLeaderboard
            scenarioId={scenarioId}
            scenarioTitle={scenarioTitle}
          />
        </div>
      </motion.div>
    </div>
  );
}
