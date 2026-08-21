"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { duration, easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import { useSimulationHref } from "@/components/play/entry";
import { Figures, Masthead } from "@/components/layout/PageChrome";
import { LedgerHead } from "@/components/home/LedgerHead";
import { Action, Container } from "@/components/ui/Kit";

type FaqItem = {
  q: string;
  a: string;
  /** The one-word filing label. Doubles as the index down the left rule. */
  topic: string;
};

const faqs: FaqItem[] = [
  {
    q: "Is this an LMS?",
    a: "No. There are no videos, no quizzes and no chapters. You make decisions; the system runs the consequences and grades how you got there.",
    topic: "Product",
  },
  {
    q: "How is my decision graded?",
    a: "Every decision moves real KPIs and a hidden skill telemetry across seven cognitive dimensions. The final report aggregates patterns across the run, not single outcomes — one lucky quarter does not carry it.",
    topic: "Scoring",
  },
  {
    q: "Can I retake a simulation?",
    a: "Yes. The market event and its timing re-roll each run, so the second attempt is a different quarter with the same economics. Your best of three is what gets submitted.",
    topic: "Runs",
  },
  {
    q: "Is the AI generating the scenarios?",
    a: "The engine is deterministic and formula-based: same decisions in, same numbers out, every time. Narrative flavour and stakeholder voice are AI-written; the mathematics is not.",
    topic: "Engine",
  },
  {
    q: "Will recruiters actually use the DI Report?",
    a: "We are piloting with universities and accelerators first. The report is built to be read by a person in ninety seconds and parsed by a system in one call.",
    topic: "Reports",
  },
  {
    q: "Is there a free tier?",
    a: "Yes — one full simulation a month with a basic report. Pro and Institutional unlock the rest of the catalogue and the cohort analytics.",
    topic: "Plans",
  },
  {
    q: "Who is behind Myelin?",
    a: "A founding team across product, learning science, simulation design and engineering. Investor news when there is news.",
    topic: "Company",
  },
];

const figures = [
  { value: "7", label: "Questions answered" },
  { value: "0", label: "Videos required" },
  { value: "1", label: "Free run a month" },
  { value: "4Q", label: "Compressed per case" },
];

export function Faq() {
  const simulationHref = useSimulationHref();
  const [open, setOpen] = useState(0);

  return (
    <>
      {/* ── the opening band ──────────────────────────────────────── */}
      <section className="relative border-b border-line pt-[68px]">
        <div className="grid-lines absolute inset-0" />
        <Masthead section="FAQ" />

        <Container
          wide
          className="relative z-10 grid gap-x-16 gap-y-8 py-[clamp(3rem,7vh,5.5rem)] lg:grid-cols-[1.15fr_1fr] lg:items-end"
        >
          <h1 className="ledger-display rise text-balance text-[clamp(2.5rem,5.4vw,4.5rem)] text-ink">
            Questions you <span className="italic text-teal">might have.</span>
          </h1>

          <div className="rise rise-1 max-w-[46ch] border-t border-line pt-6">
            <p className="text-pretty text-[16.5px] leading-[1.7] text-dim">
              Short answers about the product, the grading model and who Myelin
              is for. Still stuck after these — the institutions block on the
              home page reaches a person.
            </p>
          </div>
        </Container>

        <Figures items={figures} stagger />
      </section>

      {/* ── the questions ─────────────────────────────────────────── */}
      <section className="relative border-b border-line">
        <Container wide className="ledger-section relative z-10">
          <LedgerHead
            title={
              <>
                Seven answers, <span className="text-teal">no hedging.</span>
              </>
            }
            deck={
              <p>
                Open one. Every answer is the same one we would give a dean, a
                recruiter or a student who has already run a case.
              </p>
            }
          />

          {/* A ruled index, not a stack of rounded cards: topic on the left rule, question in
              the middle, the state marker on the right. The open row tints rather than lifts,
              so nothing on this page casts a shadow it has not earned. */}
          <div className="mt-14 border-t border-line">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={item.q}
                  className={cn(
                    "border-b border-line transition-colors duration-300",
                    isOpen && "bg-[var(--panel)]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="grid w-full grid-cols-[3.25rem_1fr_1.75rem] items-baseline gap-x-4 py-6 text-left sm:grid-cols-[7rem_1fr_1.75rem] sm:gap-x-8"
                  >
                    <span
                      className={cn(
                        "tick-label transition-colors duration-300",
                        isOpen && "text-teal",
                      )}
                    >
                      <span className="sm:hidden">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="hidden sm:inline">{item.topic}</span>
                    </span>

                    <span
                      className={cn(
                        "ledger-display text-[clamp(1.15rem,2vw,1.5rem)] transition-colors duration-300",
                        isOpen ? "text-ink" : "text-dim",
                      )}
                    >
                      {item.q}
                    </span>

                    <span className="flex justify-end self-center">
                      {isOpen ? (
                        <Minus className="h-4 w-4 text-teal" />
                      ) : (
                        <Plus className="h-4 w-4 text-faint" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: duration.reveal, ease: easeOut }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-[3.25rem_1fr] gap-x-4 pb-7 sm:grid-cols-[7rem_1fr] sm:gap-x-8">
                          <span aria-hidden />
                          <p className="max-w-[62ch] border-t border-line pt-5 text-[15.5px] leading-[1.75] text-dim">
                            {item.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── the close ─────────────────────────────────────────────── */}
      <section className="relative">
        <Container wide className="ledger-section relative z-10">
          <div className="flex flex-col items-start justify-between gap-8 border border-line bg-[var(--panel)] px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center">
            <div>
              <p className="tick-label">Still curious</p>
              <p className="ledger-display mt-4 max-w-[24ch] text-[clamp(1.5rem,2.8vw,2.2rem)] text-ink">
                Talk to the team — or just{" "}
                <span className="italic text-teal">run a case.</span>
              </p>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-[1.7] text-dim">
                Thirty minutes answers more of these than this page does.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Action href={simulationHref} size="lg">
                Play Startup Survival
              </Action>
              <Action href="/#institutions" variant="outline" size="lg">
                Request access
              </Action>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
