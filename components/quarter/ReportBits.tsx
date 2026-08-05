"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Minus, ShieldAlert, X } from "lucide-react";
import { easeOut } from "@/lib/media";
import {
  formatLakhs,
  type BalanceSheet,
  type GateTriggered,
  type Modifier,
  type SubCriterion,
  type TraitScore,
} from "@/lib/quarter/types";

/* Reusable results-screen pieces: gate callouts, trait cards,
   modifier list, balance sheet (spec §4). */

/* ── what limited your results this quarter ─────────────────────── */

export function GatePanel({ gates }: { gates: GateTriggered[] }) {
  if (gates.length === 0) {
    return (
      <div className="rounded-xl border border-emerald/25 bg-emerald/[0.06] p-4">
        <p className="text-[13.5px] font-medium text-emerald">
          No hard gates bound this quarter.
        </p>
        <p className="mt-1 text-[12.5px] text-dim">
          Sales Capacity, the R&D Conversion Ceiling and Available-to-Sell all
          had headroom — your results were limited by demand, not by your own
          structure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {gates.map((gate, i) => (
        <motion.div
          key={gate.gate_name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: easeOut }}
          className="rounded-xl border border-rose/30 bg-rose/[0.06] p-4"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose" />
            <p className="text-[13.5px] font-medium text-rose">
              {gate.gate_name}
            </p>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink">
            {gate.description}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">
            {gate.impact_note}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ── trait score card (used 7×) ─────────────────────────────────── */

const CRITERION_META: Record<
  SubCriterion["status"],
  { icon: typeof Check; color: string; label: string }
> = {
  met: { icon: Check, color: "var(--emerald)", label: "Clearly met" },
  partial: { icon: Minus, color: "var(--amber)", label: "Partially met" },
  missed: { icon: X, color: "var(--rose)", label: "Not met" },
};

export function TraitCard({ trait, delay = 0 }: { trait: TraitScore; delay?: number }) {
  const [open, setOpen] = useState(false);
  const pct = (trait.points_earned / trait.weight) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: easeOut }}
      className="overflow-hidden rounded-xl border border-line bg-raise/50"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-medium text-ink">
            {trait.name}
          </span>
          <span className="mt-2 block h-[5px] max-w-[240px] overflow-hidden rounded-full bg-white/[0.07]">
            <motion.span
              className="block h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, delay: delay + 0.2, ease: easeOut }}
              style={{
                background:
                  pct >= 70 ? "var(--emerald)" : pct >= 45 ? "var(--amber)" : "var(--rose)",
              }}
            />
          </span>
        </span>
        <span className="num shrink-0 text-[14px] font-semibold text-ink">
          {trait.points_earned}
          <span className="text-faint"> / {trait.weight}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="h-4 w-4 text-faint" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05] px-4 py-3.5">
              {trait.narrative ? (
                // Leadership: narrative justification, not a checklist.
                <p className="text-[12.5px] leading-relaxed text-dim">
                  <span className="eyebrow mr-2 text-violet-2">judgment pass</span>
                  {trait.narrative}
                </p>
              ) : (
                <ul className="space-y-2">
                  {trait.sub_criteria.map((c) => {
                    const meta = CRITERION_META[c.status];
                    const Icon = meta.icon;
                    return (
                      <li key={c.text} className="flex items-start gap-2.5">
                        <Icon
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          style={{ color: meta.color }}
                        />
                        <span className="text-[12.5px] leading-relaxed text-dim">
                          {c.text}
                          <span className="ml-2 text-[11px]" style={{ color: meta.color }}>
                            {meta.label}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── signed modifier list ───────────────────────────────────────── */

export function ModifierList({ modifiers }: { modifiers: Modifier[] }) {
  const net = modifiers.reduce((a, m) => a + m.points, 0);

  return (
    <div className="rounded-xl border border-line bg-raise/50 p-4">
      <p className="eyebrow text-faint">Modifiers · separate from trait scores</p>
      {modifiers.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-dim">No modifiers this quarter.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {modifiers.map((mod) => (
            <li key={mod.reason} className="flex items-start gap-3">
              <span
                className="num w-8 shrink-0 text-right text-[13px] font-semibold"
                style={{ color: mod.points >= 0 ? "var(--emerald)" : "var(--rose)" }}
              >
                {mod.points >= 0 ? `+${mod.points}` : `−${Math.abs(mod.points)}`}
              </span>
              <span className="text-[12.5px] leading-relaxed text-dim">
                {mod.reason}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
        <span className="text-[12px] text-faint">Net modifier</span>
        <span
          className="num text-[13.5px] font-semibold"
          style={{ color: net >= 0 ? "var(--emerald)" : "var(--rose)" }}
        >
          {net >= 0 ? `+${net}` : `−${Math.abs(net)}`}
        </span>
      </div>
    </div>
  );
}

/* ── balance sheet ──────────────────────────────────────────────── */

export function BalanceSheetPanel({ sheet }: { sheet: BalanceSheet }) {
  return (
    <div className="rounded-xl border border-line bg-raise/50 p-4">
      <p className="eyebrow text-faint">Balance sheet · end of quarter</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[12px] font-medium text-ink">Assets</p>
          <ul className="mt-2 space-y-1.5">
            {sheet.assets.map((row) => (
              <li key={row.label} className="flex justify-between text-[12.5px]">
                <span className="text-dim">{row.label}</span>
                <span className="num text-ink">{formatLakhs(row.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-medium text-ink">Liabilities</p>
          <ul className="mt-2 space-y-1.5">
            {sheet.liabilities.map((row) => (
              <li key={row.label} className="flex justify-between text-[12.5px]">
                <span className="text-dim">{row.label}</span>
                <span className="num text-ink">{formatLakhs(row.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
        <span className="text-[12.5px] text-dim">Net worth</span>
        <span className="num text-[14px] font-semibold text-ink">
          {formatLakhs(sheet.net_worth)}
        </span>
      </div>
    </div>
  );
}
