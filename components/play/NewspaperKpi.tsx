"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { easeOut } from "@/lib/media";
import { typewriter } from "@/lib/play/newsprint-fonts";
import { kpiCopy } from "@/lib/play/newsprint-copy";
import { ChunkReveal } from "@/components/play/ChunkReveal";
import type { Scenario } from "@/lib/play/types";

/** Phase 3 of /play/[slug]: "page 2" of the same paper -- the numbers behind the story, then the
 *  handoff into the real dashboard. Company creation happens on the final button here, not
 *  earlier, so nothing is created until the CEO actually commits to taking the desk. */
export function NewspaperKpi({
  scenario,
  starting,
  error,
  onEnter,
}: {
  scenario: Scenario;
  starting: boolean;
  error: string | null;
  onEnter: () => void;
}) {
  const copy = kpiCopy(scenario);
  const [evalDone, setEvalDone] = useState(false);

  return (
    <div className={`newsprint relative min-h-screen ${typewriter.variable}`} style={{ fontFamily: "var(--font-newsreader)" }}>
      <div className="newsprint-texture absolute inset-0" aria-hidden />
      <div className="newsprint-fold hidden lg:block" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="newsprint-page relative z-10 mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14"
      >
        <div
          className="flex items-center justify-center gap-3 border-b pb-3 text-[11px] uppercase tracking-[0.18em]"
          style={{ borderColor: "var(--ink)", color: "var(--ink-soft)", fontFamily: "var(--font-typewriter)" }}
        >
          <span>The Boardroom Ledger</span>
          <span aria-hidden>·</span>
          <span>Continued from page one</span>
        </div>

        <main className="mt-8">
          <p
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--press)", fontFamily: "var(--font-typewriter)" }}
          >
            {copy.kicker}
          </p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="mt-3 text-[clamp(1.75rem,4.4vw,3rem)] font-semibold capitalize leading-[1.06] [text-wrap:balance]"
          >
            {copy.headline}
          </motion.h1>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden border sm:grid-cols-3" style={{ borderColor: "var(--ink)", background: "var(--ink)" }}>
            {scenario.metrics.map((m, i) => (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: easeOut }}
                className="p-4"
                style={{ background: "var(--paper)" }}
              >
                <p className="text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "var(--ink-soft)" }}>
                  {m.label}
                </p>
                <p className="mt-1.5 text-[20px] font-semibold leading-none">{m.value}</p>
              </motion.div>
            ))}
          </div>

          <p
            className="mt-5 text-[11px] uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-soft)", fontFamily: "var(--font-typewriter)" }}
          >
            The editors&apos; assessment
          </p>
          <ChunkReveal
            text={copy.evaluation}
            onDone={() => setEvalDone(true)}
            className="newsprint-lead mt-3 max-w-[62ch] text-[16px] leading-[1.75]"
          />

          {error && (
            <p
              className="mt-6 border-[1.5px] px-4 py-3 text-[13px]"
              style={{ borderColor: "var(--press)", color: "var(--press)" }}
            >
              {error}
            </p>
          )}

          <div className="mt-8">
            <motion.button
              type="button"
              onClick={onEnter}
              disabled={starting}
              initial={false}
              animate={evalDone ? { opacity: 1, y: 0, pointerEvents: "auto" } : { opacity: 0, y: 6, pointerEvents: "none" }}
              whileHover={starting ? undefined : { y: -2 }}
              whileTap={starting ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="newsprint-cta group flex items-center gap-2 border-[2px] px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ borderColor: "var(--ink)", background: "var(--ink)", color: "var(--paper)" }}
            >
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening the office…
                </>
              ) : (
                <>
                  Take charge of {scenario.company.name}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </div>
        </main>

        <div className="mt-12 border-t pt-4" style={{ borderColor: "var(--rule)" }}>
          <p
            className="text-center text-[11px] uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-soft)", fontFamily: "var(--font-typewriter)" }}
          >
            No refunds. No do-overs. — The Editors
          </p>
        </div>
      </motion.div>
    </div>
  );
}
