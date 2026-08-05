"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Landmark, Lock } from "lucide-react";
import { easeOut } from "@/lib/media";
import { accentVar, Eyebrow } from "@/components/ui/Kit";
import { useQuarter } from "@/components/quarter/QuarterProvider";
import { catalogs } from "@/lib/quarter/catalog";
import {
  decisionsSetCount,
  isDecisionSet,
  WORKSPACE_ORDER,
} from "@/lib/quarter/types";

/* Screen 2 — Workspace Hub. Six tiles with completion state, plus the
   FIN-015 approval tile which only unlocks once every workspace is
   complete. Finance is #1 because FIN-001 gates everyone's budget. */

const STATUS_LABEL = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
} as const;

export default function WorkspaceHubPage() {
  const { quarter, draft, statuses, result } = useQuarter();
  const financeSet = isDecisionSet(draft.decisions.finance?.["FIN-001"]);
  const allComplete = WORKSPACE_ORDER.every((ws) => statuses[ws] === "complete");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <Eyebrow accent="cyan">Quarter {quarter} · Workspaces</Eyebrow>
      <h1 className="display mt-4 text-[clamp(1.6rem,3.2vw,2.4rem)] text-ink">
        Work the six desks, then approve the quarter.
      </h1>
      <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-dim">
        Decisions stage into a draft as you go — nothing executes until the
        final approval. Finance first: it allocates the budget the other five
        draw from.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {WORKSPACE_ORDER.map((ws, i) => {
          const catalog = catalogs[ws];
          const status = statuses[ws];
          const { done, total } = decisionsSetCount(catalog, draft.decisions[ws]);
          const color = accentVar[catalog.accent];
          const gated = ws !== "finance" && !financeSet;

          return (
            <motion.div
              key={ws}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: easeOut }}
            >
              <Link
                href={`/quarter/${quarter}/workspace/${ws}`}
                className="group block h-full rounded-xl border border-line bg-raise/50 p-5 transition-colors hover:border-white/[0.18]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="num text-[11px] text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="eyebrow"
                    style={{
                      color:
                        status === "complete"
                          ? "var(--emerald)"
                          : status === "in_progress"
                            ? "var(--amber)"
                            : "var(--faint)",
                    }}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <h2
                  className="mt-3 text-[16.5px] font-medium text-ink"
                  style={{ color: undefined }}
                >
                  {catalog.name}
                </h2>
                <p className="mt-1 text-[12.5px] leading-relaxed text-dim">
                  {catalog.tagline}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="num text-[11.5px] text-faint">
                    {total > 0 ? `${done}/${total} decisions set` : "Spec pending"}
                  </span>
                  {gated && (
                    <span className="flex items-center gap-1 text-[11px] text-amber">
                      <Lock className="h-3 w-3" /> Finance budget not set
                    </span>
                  )}
                </div>
                {total > 0 && (
                  <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.span
                      className="block h-full rounded-full"
                      initial={false}
                      animate={{ width: `${(done / total) * 100}%` }}
                      transition={{ duration: 0.4, ease: easeOut }}
                      style={{ background: color }}
                    />
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}

        {/* FIN-015 — always last, unlocks when the six are complete */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32, ease: easeOut }}
          className="sm:col-span-2"
        >
          {allComplete || result ? (
            <Link
              href={`/quarter/${quarter}/approval`}
              className="flex items-center gap-4 rounded-xl border border-violet/35 bg-violet/[0.08] p-5 transition-colors hover:bg-violet/[0.12]"
            >
              <Landmark className="h-5 w-5 text-violet-2" />
              <div className="flex-1">
                <p className="text-[15px] font-medium text-ink">
                  Quarter Financial Approval
                </p>
                <p className="mt-0.5 text-[12.5px] text-dim">
                  FIN-015 — pre-flight checks, then the one irreversible action.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-violet-2" />
            </Link>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-line bg-raise/40 p-5 opacity-60">
              <Lock className="h-5 w-5 text-faint" />
              <div className="flex-1">
                <p className="text-[15px] font-medium text-dim">
                  Quarter Financial Approval
                </p>
                <p className="mt-0.5 text-[12.5px] text-faint">
                  Unlocks once all six workspaces show Complete.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
