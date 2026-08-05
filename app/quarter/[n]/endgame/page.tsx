"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, TrendingUp } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Action, Eyebrow, Pill, type Accent } from "@/components/ui/Kit";
import { useQuarter } from "@/components/quarter/QuarterProvider";
import { momentumScore, tierFor } from "@/lib/quarter/engine";
import type { TermSheet, Tier } from "@/lib/quarter/types";

/* Screen 11 — Momentum / Tier / Term Sheets. Q3+ endgame only; a
   distinct decision-and-consequence shape, not a quarter report. */

const TIER_ACCENT: Record<Tier, Accent> = {
  Thriving: "emerald",
  Stable: "cyan",
  Distressed: "rose",
};

const TERM_SHEETS: Record<Tier, TermSheet[]> = {
  Thriving: [
    {
      id: "growth",
      name: "Growth Investor",
      pitch: "₹12 Cr at a step-up valuation, board seat, growth covenant.",
      fine_print: "Path A covenant applies — miss the units number and control shifts.",
    },
    {
      id: "trap",
      name: "Acquisition Trap",
      pitch: "A rich exit headline. Earn-outs hide most of it.",
      fine_print: "70% of consideration is deferred against retention targets.",
    },
    {
      id: "independent",
      name: "Independent",
      pitch: "Take no money. Compound what you built.",
      fine_print: "Path B — your continuation value is what you believe it is.",
    },
  ],
  Stable: [
    {
      id: "bridge",
      name: "Bridge Financing",
      pitch: "₹4 Cr convertible to reach the next proof point.",
      fine_print: "Discount + cap; converts at your next priced round.",
    },
    {
      id: "fair",
      name: "Fair-Value Acquisition",
      pitch: "A clean exit at today's number.",
      fine_print: "No earn-out games, but no upside either.",
    },
    {
      id: "prove",
      name: "Prove Stability",
      pitch: "No deal. Two more quarters to earn a better table.",
      fine_print: "Path B continuation value — priced by your momentum.",
    },
  ],
  Distressed: [
    {
      id: "rescue",
      name: "Rescue Financing",
      pitch: "₹3 Cr at a punishing valuation. The company lives.",
      fine_print: "2× liquidation preference, full ratchet.",
    },
    {
      id: "firesale",
      name: "Fire-Sale",
      pitch: "Sell now for parts. Team keeps their jobs.",
      fine_print: "Investors are made roughly whole. Founders are not.",
    },
    {
      id: "highrisk",
      name: "High-Risk Independent",
      pitch: "Refuse both. Survive on revenue or die trying.",
      fine_print: "Buffer breach next quarter ends the run.",
    },
  ],
};

export default function EndgamePage() {
  const { quarter, result } = useQuarter();
  const [choice, setChoice] = useState<string | null>(null);

  if (quarter < 3) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <Lock className="mx-auto h-6 w-6 text-faint" />
        <p className="mt-4 text-[15px] text-dim">
          Term sheets arrive from Q3 onward — investors need two quarters of
          history before they price you.
        </p>
      </div>
    );
  }

  const momentum = momentumScore(result);
  const tier = tierFor(result);
  const sheets = TERM_SHEETS[tier];
  const priorUnits = 430;
  const covenant = Math.round(priorUnits * (1 + 1.3 * momentum));
  const valuation = result?.business_impact.valuation ?? 1800;
  const continuation = valuation * (1 + momentum);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Eyebrow accent={TIER_ACCENT[tier]}>Endgame · Quarter {quarter}</Eyebrow>
          <Pill accent={TIER_ACCENT[tier]}>{tier}</Pill>
        </div>
        <h1 className="display mt-4 text-[clamp(1.7rem,3.4vw,2.5rem)] text-ink">
          The market has priced your run.
        </h1>
      </motion.header>

      {/* momentum — confirmed 2-input, units-based version */}
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-raise/50 p-4">
          <p className="eyebrow text-faint">Momentum score</p>
          <p className="num mt-2 flex items-center gap-2 text-[24px] font-semibold text-ink">
            <TrendingUp className="h-4 w-4 text-cyan" />
            {momentum >= 0 ? "+" : ""}
            {(momentum * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-[11.5px] text-faint">
            2-input, units-based · (units − prior) / prior
          </p>
        </div>
        <div className="rounded-xl border border-line bg-raise/50 p-4">
          <p className="eyebrow text-faint">Tier assignment</p>
          <p
            className="display mt-2 text-[22px]"
            style={{ color: `var(--${TIER_ACCENT[tier]})` }}
          >
            {tier}
          </p>
          <p className="mt-1 text-[11.5px] text-faint">
            From NCF sign + valuation trend + buffer history
          </p>
        </div>
        <div className="rounded-xl border border-line bg-raise/50 p-4">
          <p className="eyebrow text-faint">Units this quarter</p>
          <p className="num mt-2 text-[24px] font-semibold text-ink">
            {(result?.business_impact.units_sold ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11.5px] text-faint">vs. {priorUnits} prior quarter</p>
        </div>
      </div>

      {/* term sheets */}
      <h2 className="mt-10 text-[16px] font-medium text-ink">
        Three term sheets on the table — pick one.
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {sheets.map((sheet, i) => {
          const active = choice === sheet.id;
          return (
            <motion.button
              key={sheet.id}
              type="button"
              onClick={() => setChoice(sheet.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: easeOut }}
              className="rounded-xl border p-5 text-left transition-colors"
              style={{
                borderColor: active
                  ? `color-mix(in srgb, var(--${TIER_ACCENT[tier]}) 55%, transparent)`
                  : "var(--line)",
                background: active
                  ? `color-mix(in srgb, var(--${TIER_ACCENT[tier]}) 10%, transparent)`
                  : "rgba(255,255,255,0.02)",
              }}
            >
              <p className="text-[14.5px] font-medium text-ink">{sheet.name}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-dim">
                {sheet.pitch}
              </p>
              <p className="mt-3 border-t border-white/[0.06] pt-2.5 text-[11.5px] leading-relaxed text-faint">
                {sheet.fine_print}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* path formulas — shown post-choice */}
      {choice && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="mt-6 rounded-xl border border-line bg-raise/60 p-5"
        >
          <p className="eyebrow text-faint">What this path binds you to</p>
          <div className="num mt-3 space-y-2 text-[13px] text-dim">
            <p>
              Path A covenant = {priorUnits} × (1 + 1.3 × {momentum.toFixed(2)}) ={" "}
              <span className="font-semibold text-ink">{covenant} units</span>
            </p>
            <p>
              Path B continuation value = ₹{(valuation / 100).toFixed(1)} Cr × (1 +{" "}
              {momentum.toFixed(2)}) ={" "}
              <span className="font-semibold text-ink">
                ₹{(continuation / 100).toFixed(1)} Cr
              </span>
            </p>
          </div>
          <div className="mt-5">
            <Action href="/leaderboard">
              Sign and see where you rank
              <ArrowRight className="h-4 w-4" />
            </Action>
          </div>
        </motion.div>
      )}
    </div>
  );
}
