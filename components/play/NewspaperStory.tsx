"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Newspaper } from "lucide-react";
import { easeOut } from "@/lib/media";
import { newsreader, typewriter } from "@/lib/play/newsprint-fonts";
import { storyCopy } from "@/lib/play/newsprint-copy";
import { ChunkReveal } from "@/components/play/ChunkReveal";
import type { Scenario } from "@/lib/play/types";
import { useDateline } from "@/lib/play/use-dateline";

/** Phase 2 of /play/[slug]: the front page itself. Phase 1 (EntryGate) already handled consent
 *  and the timer -- this screen is narrative only, and hands off to NewspaperKpi on continue. */
export function NewspaperStory({
  scenario,
  onContinue,
}: {
  scenario: Scenario;
  onContinue: () => void;
}) {
  const copy = storyCopy(scenario);
  const today = useDateline();
  const [storyDone, setStoryDone] = useState(false);

  return (
    <div className={`newsprint relative min-h-screen ${newsreader.variable} ${typewriter.variable}`} style={{ fontFamily: "var(--font-newsreader)" }}>
      <div className="newsprint-texture absolute inset-0" aria-hidden />
      <div className="newsprint-fold hidden lg:block" aria-hidden />

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <div
          className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.16em]"
          style={{ color: "var(--ink-soft)", fontFamily: "var(--font-typewriter)" }}
        >
          <span>{today}</span>
          <span>{scenario.quarterLabel} edition</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 sm:mt-6">
          <Newspaper className="h-7 w-7 shrink-0" style={{ color: "var(--press)" }} />
          <h2 className="text-center text-[clamp(1.9rem,6vw,3.4rem)] font-semibold leading-none" style={{ letterSpacing: "-0.01em" }}>
            The Boardroom Ledger
          </h2>
        </div>

        <div className="mt-5 space-y-1">
          <div className="border-t-[3px]" style={{ borderColor: "var(--ink)" }} />
          <div className="border-t" style={{ borderColor: "var(--ink)" }} />
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

          <p className="mt-4 text-[16px] italic leading-relaxed [text-wrap:pretty]" style={{ color: "var(--ink-soft)" }}>
            {copy.deck}
          </p>

          <div
            className="mt-5 flex flex-wrap items-center gap-3 border-y py-2 text-[11px] uppercase tracking-[0.14em]"
            style={{ borderColor: "var(--rule)", color: "var(--ink-soft)", fontFamily: "var(--font-typewriter)" }}
          >
            <span>Business desk</span>
            <span aria-hidden>·</span>
            <span>{scenario.minutes}-minute edition</span>
            <span aria-hidden>·</span>
            <span>{scenario.departments.length} workspaces</span>
          </div>

          <ChunkReveal
            text={copy.lead}
            onDone={() => setStoryDone(true)}
            className="newsprint-lead mt-6 max-w-[62ch] text-[17px] leading-[1.75]"
          />

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <motion.button
              type="button"
              onClick={onContinue}
              initial={false}
              animate={storyDone ? { opacity: 1, y: 0, pointerEvents: "auto" } : { opacity: 0, y: 6, pointerEvents: "none" }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="group flex items-center gap-2 border-[2px] px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 ease-out active:scale-[0.98]"
              style={{ borderColor: "var(--ink)", background: "var(--ink)", color: "var(--paper)" }}
            >
              Read this quarter&apos;s numbers
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </motion.button>
            <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
              Tap the paragraph above to skip ahead.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
