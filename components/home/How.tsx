"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  FileBarChart,
  Layers,
  MessagesSquare,
  Target,
} from "lucide-react";
import { duration, easeOut } from "@/lib/media";
import { Container, Panel, SectionHead, accentVar, type Accent } from "@/components/ui/Kit";

type Step = {
  id: string;
  title: string;
  copy: string;
  icon: typeof Target;
  accent: Accent;
  readout: { label: string; value: string }[];
};

const steps: Step[] = [
  {
    id: "01",
    title: "Pick a scenario.",
    copy: "Startup Survival, M&A, Crisis Comms, Turnaround. New ones every month.",
    icon: Layers,
    accent: "violet",
    readout: [
      { label: "Live scenarios", value: "1" },
      { label: "In beta", value: "1" },
      { label: "Shipping soon", value: "4" },
    ],
  },
  {
    id: "02",
    title: "Face the decision wall.",
    copy: "Each round: a market context, hidden variables, three to five options. Pick one. Tick the clock.",
    icon: Target,
    accent: "indigo",
    readout: [
      { label: "Options per round", value: "3–5" },
      { label: "Hidden variables", value: "sealed" },
      { label: "Clock", value: "running" },
    ],
  },
  {
    id: "03",
    title: "Stakeholders react.",
    copy: "Investors, employees, customers, your co-founder. Their happiness moves your moves.",
    icon: MessagesSquare,
    accent: "cyan",
    readout: [
      { label: "Investors", value: "watching" },
      { label: "Employees", value: "morale 78" },
      { label: "Customers", value: "4,200" },
    ],
  },
  {
    id: "04",
    title: "Crises break the plan.",
    copy: "Data leaks, viral moments, key engineers quit. Your reflexes are measured.",
    icon: AlertTriangle,
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
    copy: "Radar across 7 skills, percentile rank, the decisions that mattered most. Shareable.",
    icon: FileBarChart,
    accent: "emerald",
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
  const Icon = current.icon;

  return (
    <section id="how" className="relative overflow-hidden border-b border-line bg-base">
      <div className="grid-lines absolute inset-0" />
      <Container wide className="relative z-10 section-pad">
        <SectionHead
          title={
            <>
              Pressure. Choice.{" "}
              <span className="text-ember">Consequence.</span>
            </>
          }
          copy={
            <p>
              The simulation engine runs a deterministic formula model layered with an
              AI narrative engine powered by Claude. Stakeholders speak in voice.
              Choices hit when you&apos;re least ready. Delayed consequences mature
              1–6 months out.
            </p>
          }
        />

        {/* Stepper rail — click a node to open its detail. The rail carries the step name
            only; the sentence explaining it lives in the panel below, which used to print
            the very same sentence a second time a few hundred pixels lower. */}
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-line lg:block" />
          <motion.div
            className="absolute left-0 top-[26px] hidden h-px w-full origin-left lg:block"
            style={{ background: "var(--grad-primary)" }}
            initial={false}
            animate={{ scaleX: (active + 1) / steps.length }}
            transition={{ duration: duration.panel, ease: easeOut }}
          />

          <div className="grid gap-4 lg:grid-cols-5">
            {steps.map((step, i) => {
              const isActive = i === active;
              const passed = i <= active;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className="group relative text-left"
                >
                  <span
                    className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full border transition-all duration-300"
                    style={{
                      borderColor: passed
                        ? `color-mix(in srgb, ${accentVar[step.accent]} 55%, transparent)`
                        : "var(--line)",
                      background: isActive
                        ? `color-mix(in srgb, ${accentVar[step.accent]} 20%, var(--base))`
                        : "var(--base)",
                      color: passed ? accentVar[step.accent] : "var(--faint)",
                    }}
                  >
                    <span className="num text-[13px] font-semibold">{step.id}</span>
                  </span>
                  <p
                    className="mt-4 text-[15.5px] font-medium transition-colors duration-200 ease-out"
                    style={{ color: isActive ? "var(--text)" : "var(--dim)" }}
                  >
                    {step.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <Panel gradientRing className="mt-10 overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
            {/* Keyed on the step so the whole block crossfades rather than snapping. The
                slight blur on the way in and out is what stops it reading as two pieces of
                text stacked on each other mid-fade. */}
            <motion.div
              key={current.id}
              initial={{ opacity: 0, filter: "blur(3px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: duration.hover, ease: easeOut }}
              className="p-7 sm:p-9"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl border"
                  style={{
                    borderColor: `color-mix(in srgb, ${accentVar[current.accent]} 40%, transparent)`,
                    background: `color-mix(in srgb, ${accentVar[current.accent]} 14%, transparent)`,
                    color: accentVar[current.accent],
                  }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="eyebrow" style={{ color: accentVar[current.accent] }}>
                    Step {current.id}
                  </p>
                  <p className="display mt-1.5 text-[21px] text-ink">
                    {current.title}
                  </p>
                </div>
              </div>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.72] text-dim">
                {current.copy}
              </p>
            </motion.div>

            <div
              className="grid divide-y divide-line border-line md:border-l"
              style={{
                background: `linear-gradient(160deg, color-mix(in srgb, ${accentVar[current.accent]} 10%, transparent), transparent 70%)`,
              }}
            >
              {current.readout.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 px-7 py-5"
                >
                  <span className="eyebrow text-faint">{row.label}</span>
                  <span
                    className="num text-[15px]"
                    style={{ color: accentVar[current.accent] }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </Container>
    </section>
  );
}
