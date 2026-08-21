"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { duration, easeOut } from "@/lib/media";
import { useSimulationHref } from "@/components/play/entry";
import { Masthead } from "@/components/layout/PageChrome";
import { LedgerHead } from "@/components/home/LedgerHead";
import { Action, Container } from "@/components/ui/Kit";

type Principle = {
  id: string;
  title: string;
  copy: string;
  /** What the principle refuses to do. A constraint is only real if it costs something. */
  constraint: string;
};

const principles: Principle[] = [
  {
    id: "01",
    title: "Judgment is a skill.",
    copy: "It improves with deliberate practice, retrieval, and calibrated feedback. We treat it like one.",
    constraint: "No scenario ends without telling you what your call cost.",
  },
  {
    id: "02",
    title: "Compress time.",
    copy: "A real decision matures over months. We compress the consequence loop so you can practise 100× more often.",
    constraint: "Four quarters in thirty minutes, or the loop is too slow to learn from.",
  },
  {
    id: "03",
    title: "Measure what matters.",
    copy: "Outcome alone is luck. We grade the process: the trade-offs, the read of risk, the choice under uncertainty.",
    constraint: "A lucky quarter cannot outscore a well-argued one.",
  },
  {
    id: "04",
    title: "Reveal the hidden.",
    copy: "Markets, stakeholders and co-founders all have hidden variables. We expose them only when you have earned the read.",
    constraint: "The engine never shows you a number you were meant to infer.",
  },
  {
    id: "05",
    title: "Make it portable.",
    copy: "A DI Report should travel — to recruiters, deans, scholarships, and to yourself five years from now.",
    constraint: "Every score on it has to be explainable in one line.",
  },
];

const positions = [
  { school: "Schools test", myelin: "Myelin tests" },
  { school: "Recall", myelin: "Judgment" },
  { school: "The answer", myelin: "The trade-off" },
  { school: "One outcome", myelin: "The pattern across four" },
  { school: "A grade", myelin: "A report you can argue with" },
];

export function Manifesto() {
  const simulationHref = useSimulationHref();

  return (
    <>
      {/* ── the opening band ──────────────────────────────────────────
          Same shape as the homepage: masthead strip directly under the fixed nav, then the
          headline. No blurred wash and no gradient-filled type — the argument is the page. */}
      <section className="relative border-b border-line pt-[68px]">
        <div className="grid-lines absolute inset-0" />
        <Masthead section="Manifesto" />

        <Container
          wide
          className="relative z-10 grid gap-x-16 gap-y-10 py-[clamp(3rem,7vh,5.5rem)] lg:grid-cols-[1.15fr_1fr] lg:items-end"
        >
          <div>
            <h1 className="ledger-display rise text-balance text-[clamp(2.5rem,5.4vw,4.5rem)] text-ink">
              The world rewards <span className="italic text-teal">judgment.</span>
              <br />
              <span className="text-dim">Schools test recall.</span>
            </h1>

            <div className="rise rise-1 mt-[clamp(1.75rem,4vh,2.25rem)] max-w-[52ch] border-t border-line pt-6">
              <p className="text-pretty text-[16.5px] leading-[1.7] text-dim">
                Myelin exists to close that gap. The most consequential skill of
                the century — making good decisions under uncertainty — should
                not be left to chance, to mentorship, or to being born to the
                right parents.
              </p>
            </div>
          </div>

          {/* The thesis, set as an instrument readout rather than a tinted quote card.
              Corner ticks imply the frame; the rule under it carries the attribution. */}
          <blockquote className="ticked rise rise-2 border border-line bg-[var(--panel)] px-6 py-7 sm:px-8">
            <p className="ledger-display text-[clamp(1.35rem,2.6vw,1.85rem)] text-ink">
              It should be practised, measured, and rewarded.
            </p>
            <p className="tick-label mt-5 border-t border-line pt-4">
              The Myelin thesis
            </p>
          </blockquote>
        </Container>
      </section>

      {/* ── the five principles ───────────────────────────────────── */}
      <section className="relative border-b border-line">
        <Container wide className="ledger-section relative z-10">
          <LedgerHead
            title={
              <>
                Five constraints, <span className="text-teal">not five slogans.</span>
              </>
            }
            deck={
              <>
                <p>
                  These are product constraints: every scenario, every score and
                  every report has to survive them.
                </p>
                <p className="text-ink">
                  Each one names what it refuses to do, because a principle that
                  costs nothing is decoration.
                </p>
              </>
            }
          />

          <ol className="mt-14 border-t border-line">
            {principles.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: duration.reveal, delay: i * 0.05, ease: easeOut }}
                className="grid gap-x-10 gap-y-4 border-b border-line py-8 transition-colors duration-300 hover:bg-[var(--panel)] lg:grid-cols-[5rem_1.1fr_1fr]"
              >
                <span className="num text-[13px] leading-none text-teal lg:pt-2">
                  {p.id}
                </span>

                <div>
                  <h3 className="ledger-display text-[clamp(1.35rem,2.2vw,1.75rem)] text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-3 max-w-[46ch] text-[15.5px] leading-[1.7] text-dim">
                    {p.copy}
                  </p>
                </div>

                <div className="border-t border-line pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1">
                  <p className="tick-label">What it costs us</p>
                  <p className="mt-3 text-[14.5px] leading-[1.65] text-ink">
                    {p.constraint}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ── the position, as a two-column ledger ──────────────────── */}
      <section className="relative border-b border-line">
        <Container wide className="ledger-section relative z-10">
          <LedgerHead
            title={
              <>
                What we grade, <span className="text-teal">and what we do not.</span>
              </>
            }
            deck={
              <p>
                The left column is what an exam can measure. The right is what a
                room full of consequences measures instead.
              </p>
            }
          />

          <div className="mt-14 grid grid-cols-2 border-t border-line">
            {positions.map((row, i) => (
              <div key={row.school} className="contents">
                <div className="border-b border-r border-line px-5 py-5 sm:px-7">
                  {i === 0 ? (
                    <p className="tick-label">{row.school}</p>
                  ) : (
                    <p className="text-[15.5px] text-dim">{row.school}</p>
                  )}
                </div>
                <div className="border-b border-line bg-teal/[0.07] px-5 py-5 sm:px-7">
                  {i === 0 ? (
                    <p className="tick-label text-teal">{row.myelin}</p>
                  ) : (
                    <p className="ledger-display text-[17px] text-ink">{row.myelin}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── the close ─────────────────────────────────────────────── */}
      <section className="relative">
        <Container wide className="ledger-section relative z-10">
          <div className="flex flex-col items-start justify-between gap-8 border border-line bg-[var(--panel)] px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center">
            <div>
              <p className="tick-label">Start practising</p>
              <p className="ledger-display mt-4 max-w-[26ch] text-[clamp(1.5rem,2.8vw,2.2rem)] text-ink">
                Theory is cheap. <span className="italic text-teal">Judgment is not.</span>
              </p>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-[1.7] text-dim">
                Run Startup Survival — a year of a company compressed into
                thirty minutes — and read your first DI Report.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Action href={simulationHref} size="lg">
                Run a simulation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Action>
              <Action href="/simulations" variant="outline" size="lg">
                Browse cases
              </Action>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
