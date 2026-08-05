"use client";

import { motion } from "framer-motion";
import { ArrowRight, Receipt } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Action, Eyebrow, Pill } from "@/components/ui/Kit";
import { EventCard } from "@/components/quarter/EventCard";
import { KpiStrip } from "@/components/quarter/Kpi";
import { useQuarter } from "@/components/quarter/QuarterProvider";
import {
  COMPANY,
  marketEvents,
  openingState,
  recurringCosts,
} from "@/lib/quarter/catalog";
import { formatLakhs } from "@/lib/quarter/types";

/* Screen 1 — CEO Briefing. Orients the student in company state
   before any decision is staged. Cash shown here is already net of
   recurring costs (the Recurring Cost Engine ran before this render). */

export default function BriefingPage() {
  const { quarter } = useQuarter();
  const recurringTotal = recurringCosts.reduce((a, c) => a + c.amount, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Eyebrow accent="violet">CEO Briefing · Quarter {quarter}</Eyebrow>
          {openingState.run_status && (
            <Pill
              accent={openingState.run_status === "COMPLETED" ? "emerald" : "amber"}
            >
              Last quarter: {openingState.run_status}
            </Pill>
          )}
        </div>
        <h1 className="display mt-4 text-[clamp(1.7rem,3.5vw,2.6rem)] leading-tight text-ink">
          {COMPANY.name} enters Q{quarter}.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dim">
          Read the state of the company, then work the six workspaces in
          sequence. Nothing executes until you approve and run the quarter —
          every decision below stages into a draft.
        </p>
      </motion.div>

      <div className="mt-8">
        <KpiStrip />
      </div>

      {/* recurring-cost ledger — already debited by the Recurring Cost Engine */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: easeOut }}
        className="mt-4 rounded-xl border border-line bg-raise/50 px-4 py-3.5"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-2 text-[12.5px] text-dim">
            <Receipt className="h-3.5 w-3.5 text-faint" />
            Recurring costs applied this quarter
          </span>
          {recurringCosts.map((cost) => (
            <span key={cost.label} className="num text-[12px] text-faint">
              {cost.label} {formatLakhs(cost.amount)}
            </span>
          ))}
          <span className="num ml-auto text-[12.5px] font-semibold text-rose">
            −{formatLakhs(recurringTotal)}
          </span>
        </div>
      </motion.div>

      {/* market events — students are expected to react to these across workspaces */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-medium text-ink">
            Market events this quarter
          </h2>
          <span className="eyebrow text-faint">react to these — it&apos;s scored</span>
        </div>
        <div className="mt-4 space-y-3">
          {marketEvents.map((event, i) => (
            <EventCard key={event.id} event={event} delay={0.12 + i * 0.08} />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35, ease: easeOut }}
        className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl border border-violet/25 bg-violet/[0.06] p-5"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-medium text-ink">
            Start with Finance.
          </p>
          <p className="mt-1 text-[13px] text-dim">
            FIN-001 sets the department budget every other workspace draws
            from — the sequence is deliberate, not a menu.
          </p>
        </div>
        <Action href={`/quarter/${quarter}/workspace/finance`}>
          Enter Finance Workspace
          <ArrowRight className="h-4 w-4" />
        </Action>
      </motion.div>
    </div>
  );
}
