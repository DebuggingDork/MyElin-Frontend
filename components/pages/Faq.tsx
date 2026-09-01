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
  a: string[];
  /** The one-word filing label. Doubles as the index down the left rule. */
  topic: string;
};

const faqs: FaqItem[] = [
  {
    q: "Is this an LMS?",
    a: [
      "No. Myelin is not an LMS. An LMS is primarily designed to deliver and organize learning content—courses, lectures, videos, assignments, quizzes, and assessments. Myelin is designed around decision practice.",
      "There are no chapters to complete before you can act. The learner enters a situation, receives information, makes decisions, allocates resources, and sees the simulated environment respond.",
      "The important difference is the learning loop: Situation → Decision → Consequence → New Information → Adaptation → Reflection. A student does not simply answer: \"What is the correct management decision?\" They have to make the decision and then deal with what that decision creates.",
      "Myelin can therefore complement an LMS rather than replace it. A university can use its existing LMS for curriculum, content, assignments, and administration, while using Myelin for experiential decision practice and simulation-based assessment.",
    ],
    topic: "Product",
  },
  {
    q: "How is my decision graded?",
    a: [
      "Myelin does not grade you simply on whether you \"won.\" The simulation records the decisions you make throughout the experience and evaluates them against the situation, information available at the time, constraints, trade-offs, and consequences.",
      "The current Myelin framework evaluates seven dimensions: Strategic Thinking, Capital Allocation, Risk Management, Systems Thinking, Leadership & People Management, Adaptability, and Long-Term Value Creation.",
      "A strong outcome alone does not automatically mean a strong decision. A student can make a sensible decision and still experience a poor external outcome. Conversely, a poor decision can occasionally produce a good outcome. That distinction matters because Myelin is designed to evaluate judgment, not luck.",
      "The final report therefore combines the student's overall performance with their decision history, quarter-by-quarter outcomes, strengths, mistakes, missed opportunities, and recurring patterns.",
    ],
    topic: "Scoring",
  },
  {
    q: "Can I retake a simulation?",
    a: [
      "Yes. Retakes are designed for learning, not for simply replacing a bad result. A second attempt gives the learner an opportunity to apply what they learned from the first experience.",
      "The purpose is to answer a more meaningful question: Did you actually improve your decision-making after experiencing the consequences? A retake can therefore reveal whether the student: recognized what went wrong, changed their assumptions, adapted their strategy, made better trade-offs, and avoided repeating the same mistakes.",
      "For institutional assessment, Myelin should clearly distinguish between first-run performance, subsequent attempts, and demonstrated improvement rather than presenting the highest score without context.",
    ],
    topic: "Runs",
  },
  {
    q: "Is the AI generating the scenarios?",
    a: [
      "AI can support scenario creation and adaptation, but AI is not the simulation itself. Myelin's core experience is built around a structured decision environment containing: objectives, constraints, information, resources, stakeholders, decisions, consequences, and changing conditions.",
      "The underlying simulation engine determines how decisions affect the state of the environment. AI can make the experience more dynamic—for example, by supporting realistic interactions, communications, scenario variations, or adaptive content—but the business logic and consequence system remain structured and measurable.",
      "That distinction is important. AI generates or assists with parts of the experience. The simulation engine determines whether the student's decisions actually matter.",
    ],
    topic: "Engine",
  },
  {
    q: "Will recruiters actually use the DI Report?",
    a: [
      "The Decision Intelligence Report is not intended to replace a résumé, interview, degree, or professional experience. Its purpose is to provide an additional source of evidence about how a person approaches decisions in simulated situations.",
      "A conventional résumé tells an employer what someone has done. A simulation can provide evidence about how that person behaves when they have to: make trade-offs, operate with incomplete information, manage risk, allocate limited resources, respond to changing conditions, and adapt when their assumptions prove wrong.",
      "The report can summarize these patterns across the simulation and present the evidence in a structured format. For universities, the same report can be used for learning feedback and development, rather than recruitment alone.",
      "The important boundary is that Myelin should not claim: \"This report proves how you will perform at work.\" Instead: \"This report provides structured evidence of how you made decisions in the simulation.\" That distinction keeps the report credible.",
    ],
    topic: "Reports",
  },
  {
    q: "Is there a free tier?",
    a: [
      "Yes. Myelin can provide an accessible entry point through selected free simulation experiences. Paid plans can provide access to a broader set of simulations and deeper capabilities, while institutional plans can support cohort-level use, instructor visibility, reporting, and deployment across an educational program.",
      "The exact commercial structure should be presented according to the current pricing model rather than making claims that are not yet finalized.",
      "The underlying model is simple: Experience Myelin first. Expand access when deeper learning, analytics, and institutional use require it.",
    ],
    topic: "Plans",
  },
  {
    q: "Who is behind Myelin?",
    a: [
      "Myelin is built around a simple belief: Judgment is not something you should have to wait years to develop. Education gives people knowledge. Experience gives people consequences. Myelin is designed to create a place between the two where learners can practice making consequential decisions before the stakes are real.",
      "The platform brings together simulation design, decision modeling, learning science, software engineering, and assessment to create experiences where the learner—not the instructor—is responsible for what happens next.",
      "Rather than teaching one narrow subject, Myelin is being designed as a reusable decision-intelligence platform that can support different environments, from business and leadership to crisis, operations, and other organizational decision contexts.",
      "The goal is simple: give people a place to practice judgment before the real world demands it.",
    ],
    topic: "Company",
  },
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

        <Container wide className="relative z-10 border-t border-line py-16">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-2 flex flex-col items-start">
              <span className="tick-label text-teal mb-4">Institutional Trust</span>
              <h2 className="ledger-display text-[clamp(2rem,4vw,3.25rem)] text-ink max-w-[15ch] leading-none mb-6">
                Request a Pilot
              </h2>
              <p className="text-dim text-[16px] leading-[1.6] max-w-[36ch] mb-8">
                See Myelin in your classroom before committing institution-wide.
              </p>
              <Action href="/#contact" size="lg">
                Request a Pilot <span className="ml-2">→</span>
              </Action>
            </div>

            <div className="lg:col-span-3 grid gap-10 sm:grid-cols-2">
              <div className="relative">
                <div className="text-teal font-mono text-sm mb-3">01</div>
                <h3 className="font-serif text-xl text-ink mb-2">Tell us about your cohort</h3>
                <p className="text-sm text-dim leading-relaxed">
                  Share your institution, programme, approximate student count, and intended use.
                </p>
              </div>
              
              <div className="relative">
                <div className="text-teal font-mono text-sm mb-3">02</div>
                <h3 className="font-serif text-xl text-ink mb-2">We configure the pilot</h3>
                <p className="text-sm text-dim leading-relaxed">
                  We recommend the appropriate simulation(s), cohort size, and delivery format.
                </p>
              </div>

              <div className="relative">
                <div className="text-teal font-mono text-sm mb-3">03</div>
                <h3 className="font-serif text-xl text-ink mb-2">Students run the simulation</h3>
                <p className="text-sm text-dim leading-relaxed">
                  Students make decisions, experience consequences, and receive their individual results.
                </p>
              </div>

              <div className="relative border border-teal/20 bg-teal/5 p-6 rounded-sm shadow-[0_0_15px_rgba(20,184,166,0.05)]">
                <p className="text-xs font-mono uppercase tracking-widest text-teal mb-4">
                  What you receive
                </p>
                <h3 className="font-serif text-lg text-ink mb-3">Your Pilot Includes:</h3>
                <ul className="text-sm text-dim space-y-2 mb-0">
                  <li className="flex items-start gap-2"><span className="text-teal mt-0.5">•</span> Student access to the selected simulation</li>
                  <li className="flex items-start gap-2"><span className="text-teal mt-0.5">•</span> Individual performance results</li>
                  <li className="flex items-start gap-2"><span className="text-teal mt-0.5">•</span> Decision-making insights generated from the simulation</li>
                  <li className="flex items-start gap-2"><span className="text-teal mt-0.5">•</span> Faculty debrief material</li>
                  <li className="flex items-start gap-2"><span className="text-teal mt-0.5">•</span> Pilot support / onboarding</li>
                  <li className="flex items-start gap-2"><span className="text-teal mt-0.5">•</span> Post-pilot discussion on outcomes and next steps</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
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
                          <div className="max-w-[62ch] border-t border-line pt-5 space-y-4">
                            {item.a.map((paragraph, idx) => (
                              <p
                                key={idx}
                                className="text-[15.5px] leading-[1.75] text-dim"
                              >
                                {paragraph}
                              </p>
                            ))}
                          </div>
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
      <section className="relative border-t border-line">
        <Container wide className="ledger-section relative z-10 py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="ledger-display text-[clamp(2rem,3.5vw,3rem)] text-ink leading-tight mb-4">
                Bring Myelin into your classroom.
              </h2>
              <p className="text-[16.5px] leading-relaxed text-dim max-w-xl">
                Give students a decision environment they can experience before you teach it. Tell us about your cohort. We'll recommend a pilot format and walk you through what students and faculty receive.
              </p>
            </div>
            
            <div className="flex flex-col items-start lg:items-end gap-6">
              <Action href="/#contact" size="lg" className="shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:shadow-[0_0_30px_rgba(20,184,166,0.25)] transition-shadow">
                Request a Pilot <span className="ml-2">→</span>
              </Action>
              <div className="text-xs font-mono uppercase tracking-[0.15em] text-dim/70 flex items-center gap-3">
                <span>MBA programmes</span>
                <span className="w-1 h-1 rounded-full bg-line-2"></span>
                <span>Business schools</span>
                <span className="w-1 h-1 rounded-full bg-line-2"></span>
                <span>Universities</span>
                <span className="w-1 h-1 rounded-full bg-line-2"></span>
                <span>L&D teams</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
