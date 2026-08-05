"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { easeOut } from "@/lib/media";
import { Action, Eyebrow, Pill } from "@/components/ui/Kit";
import { useQuarter } from "@/components/quarter/QuarterProvider";
import { preflight, totalDiscretionarySpend } from "@/lib/quarter/engine";
import { formatLakhs, WORKSPACE_ORDER } from "@/lib/quarter/types";

/* Screen 8 — Quarter Financial Approval (FIN-015). A pre-flight
   summary over the COMBINED draft, then the single irreversible
   action of the whole flow. Treated like a payment confirmation:
   explicit confirm step, no double-submit, idempotent result. */

const LEVEL_META = {
  green: { icon: CheckCircle2, color: "var(--emerald)" },
  yellow: { icon: AlertTriangle, color: "var(--amber)" },
  red: { icon: AlertOctagon, color: "var(--rose)" },
} as const;

export default function ApprovalPage() {
  const router = useRouter();
  const { quarter, draft, statuses, result } = useQuarter();
  const [arming, setArming] = useState(false);

  const flags = useMemo(() => preflight(draft), [draft]);
  const spend = totalDiscretionarySpend(draft);
  const incomplete = WORKSPACE_ORDER.filter((ws) => statuses[ws] !== "complete");
  const hasRed = flags.some((f) => f.level === "red");

  // Already run — idempotency guard, show the hash instead of re-arming.
  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <Eyebrow accent="emerald">FIN-015 · Quarter {quarter}</Eyebrow>
        <h1 className="display mt-4 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ink">
          This quarter has already run.
        </h1>
        <div className="mt-6 rounded-xl border border-line bg-raise/60 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Pill accent="emerald">{result.run_status}</Pill>
            <span className="num text-[12.5px] text-faint">
              run {result.run_id} · {result.result_hash}
            </span>
          </div>
          <p className="mt-3 text-[13.5px] text-dim">
            run_quarter() is idempotent — re-submitting returns the same
            result hash rather than executing twice.
          </p>
        </div>
        <div className="mt-6">
          <Action href={`/quarter/${quarter}/report`}>
            View quarter report <ArrowRight className="h-4 w-4" />
          </Action>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <Eyebrow accent="violet">FIN-015 · Quarter {quarter}</Eyebrow>
        <h1 className="display mt-4 flex items-center gap-3 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ink">
          <Landmark className="h-6 w-6 text-violet-2" />
          Quarter Financial Approval
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-dim">
          The pre-flight below reads the combined draft across all six
          workspaces. Confirming runs the quarter — the only mutating,
          irreversible action in the flow.
        </p>
      </motion.header>

      {incomplete.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber/30 bg-amber/[0.07] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p className="text-[13px] text-dim">
            Incomplete workspaces:{" "}
            {incomplete.map((ws, i) => (
              <span key={ws}>
                {i > 0 && " · "}
                <Link
                  href={`/quarter/${quarter}/workspace/${ws}`}
                  className="text-amber underline-offset-2 hover:underline"
                >
                  {ws}
                </Link>
              </span>
            ))}
          </p>
        </div>
      )}

      {/* pre-flight flags */}
      <div className="mt-7 space-y-2.5">
        {flags.map((flag, i) => {
          const meta = LEVEL_META[flag.level];
          const Icon = meta.icon;
          return (
            <motion.div
              key={flag.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06, ease: easeOut }}
              className="flex items-start gap-3 rounded-xl border border-line bg-raise/50 p-4"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: meta.color }} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium" style={{ color: meta.color }}>
                  {flag.label}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-dim">
                  {flag.detail}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* confirm — two-step arm/confirm to prevent an accidental run */}
      <div className="mt-8 rounded-2xl border border-line bg-raise/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-medium text-ink">
              Total discretionary commitment: {formatLakhs(spend)}
            </p>
            <p className="mt-1 text-[12.5px] text-dim">
              {hasRed
                ? "Red flags above — you can still run, and the consequences are yours."
                : "Pre-flight is clean. The engine takes it from here."}
            </p>
          </div>

          {!arming ? (
            <Action
              onClick={() => setArming(true)}
              disabled={incomplete.length > 0}
            >
              <ShieldCheck className="h-4 w-4" />
              Confirm Quarter
            </Action>
          ) : (
            <div className="flex items-center gap-2">
              <Action variant="outline" onClick={() => setArming(false)}>
                Back
              </Action>
              <Action
                onClick={() => router.push(`/quarter/${quarter}/processing`)}
                className="!bg-none"
              >
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--grad-warm)" }}
                  aria-hidden
                />
                <span className="relative z-10 flex items-center gap-2">
                  Run the quarter — irreversible
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Action>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
