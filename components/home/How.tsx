"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { duration, easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Container, accentVar, type Accent } from "@/components/ui/Kit";
import { LedgerHead } from "@/components/home/LedgerHead";

type Step = {
  id: string;
  title: string;
  copy: string;
  accent: Accent;
  readout: { label: string; value: string }[];
};

const steps: Step[] = [
  {
    id: "01",
    title: "Pick a scenario.",
    copy: "Startup Survival, M&A, Crisis Comms, Turnaround. New ones every month.",
    accent: "teal",
    readout: [
      { label: "Live scenarios", value: "1" },
      { label: "In beta", value: "1" },
      { label: "Shipping soon", value: "4" },
    ],
  },
  {
    id: "02",
    title: "Face the decision wall.",
    copy: "Each round gives you a market context, hidden variables and three to five options. Pick one. The clock does not stop while you think.",
    accent: "teal",
    readout: [
      { label: "Options per round", value: "3–5" },
      { label: "Hidden variables", value: "sealed" },
      { label: "Clock", value: "running" },
    ],
  },
  {
    id: "03",
    title: "Stakeholders react.",
    copy: "Investors, employees, customers and your co-founder all hold a position on what you just did, and their patience is a resource you spend.",
    accent: "teal",
    readout: [
      { label: "Investors", value: "watching" },
      { label: "Employees", value: "morale 78" },
      { label: "Customers", value: "4,200" },
    ],
  },
  {
    id: "04",
    title: "Crises break the plan.",
    copy: "Data leaks, viral moments, a key engineer resigning. These land when you are least ready, and how fast you re-plan is itself scored.",
    accent: "ember",
    readout: [
      { label: "Trigger window", value: "any round" },
      { label: "Delayed impact", value: "1–6 mo" },
      { label: "Reflex scored", value: "yes" },
    ],
  },
  {
    id: "05",
    title: "Your DI Report ships.",
    copy: "Seven scored dimensions, a cohort percentile, and the specific decisions that moved them most. Shareable as a link or a PDF.",
    accent: "teal",
    readout: [
      { label: "Skills charted", value: "7" },
      { label: "Percentile", value: "cohort" },
      { label: "Shareable", value: "link + PDF" },
    ],
  },
];

export function How() {
  const [active, setActive] = useState(0);
  const current = steps[active];

  return (
    <section id="how" className="relative border-b border-line">
      <Container wide className="ledger-section relative z-10">
        <LedgerHead
          title={
            <>
              Pressure. Choice.{" "}
              <span className="text-ember">Consequence.</span>
            </>
          }
          deck={
            <p>
              A deterministic model decides what your numbers do. A narrative
              engine decides how it feels when they do it. Delayed consequences
              mature one to six months out, long after you have moved on.
            </p>
          }
        />

        {/* Five columns divided by vertical hairlines. This section genuinely is a
            sequence, so numbered markers here are structure rather than decoration --
            unlike the 001/002 counters that used to label the four page sections. */}
        <div className="mt-16 grid border-y border-line sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => {
            const isActive = i === active;
            const color = accentVar[step.accent];
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={cn(
                  "relative border-line px-5 py-6 text-left lg:border-l lg:first:border-l-0",
                  "border-b sm:border-b-0",
                  "transition-colors duration-200 ease-out",
                  isActive ? "bg-teal/[0.07]" : "bg-transparent hover:bg-[var(--panel)]",
                )}
              >
                {/* The active marker is a rule across the top of its own column, which
                    reads as a tab without needing a tab component. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] origin-left transition-transform duration-200 ease-out"
                  style={{
                    background: color,
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
                <span
                  className="num text-[12px]"
                  style={{ color: isActive ? color : "var(--faint)" }}
                >
                  {step.id}
                </span>
                <p
                  className={cn(
                    "mt-3 text-[15.5px] transition-colors duration-200 ease-out",
                    isActive ? "text-ink" : "text-dim",
                  )}
                >
                  {step.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Keyed on the step so the block crossfades rather than snapping. The slight
            blur stops it reading as two pieces of text stacked on each other mid-fade. */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0, filter: "blur(3px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: duration.hover, ease: easeOut }}
          className="grid border-b border-line md:grid-cols-[1.5fr_1fr]"
        >
          <div className="px-1 py-10 md:pr-16">
            <p
              className="tick-label"
              style={{ color: accentVar[current.accent] }}
            >
              Step {current.id}
            </p>
            <p className="ledger-display mt-4 text-[clamp(1.6rem,3vw,2.3rem)] text-ink">
              {current.title}
            </p>
            <p className="mt-5 max-w-[52ch] text-pretty text-[16px] leading-[1.7] text-dim">
              {current.copy}
            </p>
          </div>

          <dl className="border-line py-4 md:border-l md:pl-10">
            {current.readout.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 border-b border-line py-5 last:border-b-0"
              >
                <dt className="tick-label">{row.label}</dt>
                <dd
                  className="num text-[15px]"
                  style={{ color: accentVar[current.accent] }}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </Container>
    </section>
  );
}
