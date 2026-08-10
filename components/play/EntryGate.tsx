"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Action, Container, Pill } from "@/components/ui/Kit";
import { TimerDial } from "@/components/play/TimerDial";
import type { Scenario } from "@/lib/play/types";

const RULES = [
  (s: Scenario) => `You take over ${s.company.name}, a ${s.company.stage}-stage ${s.company.sector} company, mid-flight.`,
  (s: Scenario) => `Each quarter you allocate spend across ${s.departments.length} departments before the quarter locks.`,
  () => "Decisions lock the moment you submit them. There is no undo once a quarter is locked.",
  () => "At the end you get a Decision Intelligence Report scored across seven cognitive dimensions.",
];

const ACCEPTS = [
  {
    id: "time",
    label: "I have 30 uninterrupted minutes.",
    hint: "Pausing mid-quarter resets the run. Treat it like a meeting.",
  },
  {
    id: "consequence",
    label: "I understand decisions have irreversible consequences.",
    hint: "Cash, morale, and stakeholders move the moment you commit.",
  },
  {
    id: "hidden",
    label: "I accept that hidden variables stay sealed until resolution.",
    hint: "You will not see every variable while you decide. That is the point.",
  },
  {
    id: "report",
    label: "I want a Decision Intelligence Report at the end.",
    hint: "Your score is a composite across seven cognitive dimensions.",
  },
];

/** Phase 1 of /play/[slug]: rules and consent only -- no narrative framing here on purpose,
 *  that's reserved for NewspaperStory once this gate is cleared. */
export function EntryGate({
  scenario,
  onEnter,
}: {
  scenario: Scenario;
  onEnter: () => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const ready = ACCEPTS.every((item) => checked[item.id]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <Container className="relative z-10 flex min-h-screen flex-col justify-center py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="flex flex-col items-center"
          >
            <TimerDial minutes={scenario.minutes} />
            <p className="mt-8 max-w-xs text-center text-[14.5px] leading-relaxed text-dim">
              One sitting. No pause. The quarter runs once you enter the workspace.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
            className="ring-grad panel rounded-[1.75rem] p-7 sm:p-9"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill accent="emerald" solid>
                Live
              </Pill>
              <Pill accent="teal">{scenario.company.stage}</Pill>
              <Pill accent="teal">{scenario.quarterLabel}</Pill>
            </div>

            <h1 className="display mt-5 text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-ink">
              {scenario.name}
            </h1>

            <ul className="mt-6 space-y-2.5">
              {RULES.map((rule, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: easeOut }}
                  className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-dim"
                >
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal" />
                  {rule(scenario)}
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 space-y-3 border-t border-line pt-7">
              <p className="eyebrow text-faint">Before you start</p>
              {ACCEPTS.map((item, i) => {
                const on = !!checked[item.id];
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                    onClick={() =>
                      setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className="flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-300"
                    style={{
                      borderColor: on
                        ? "color-mix(in srgb, var(--violet) 50%, transparent)"
                        : "var(--line)",
                      background: on
                        ? "color-mix(in srgb, var(--violet) 10%, transparent)"
                        : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all"
                      style={{
                        borderColor: on ? "transparent" : "var(--line-2)",
                        background: on ? "var(--grad-primary)" : "transparent",
                        color: on ? "#fff" : "transparent",
                      }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <span className="block text-[15px] font-medium text-ink">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-faint">
                        {item.hint}
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Action onClick={onEnter} disabled={!ready} size="lg">
                Start
                <ArrowRight className="h-4 w-4" />
              </Action>
              <p className="text-[13px] text-faint">
                {ready
                  ? "The front page opens next."
                  : "Accept all four to proceed."}
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
