"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Action, Container, Pill } from "@/components/ui/Kit";
import { TimerDial } from "@/components/play/TimerDial";
import { DEPARTMENTS } from "@/lib/api/catalog";
import type { Scenario } from "@/lib/play/types";

const RULES = [
  (s: Scenario) => `You take over ${s.company.name} — ${s.company.stage}-stage, ${s.company.sector} — mid-flight.`,
  () => `Each quarter you allocate spend across ${DEPARTMENTS.length} departments before it locks.`,
  () => "Decisions lock the moment you submit. No undo once a quarter locks.",
  () => "At the end: a Decision Intelligence Report, scored on seven dimensions.",
];

const ACCEPTS = [
  {
    id: "time",
    label: "I have 30 uninterrupted minutes.",
    hint: "Pausing mid-quarter resets the run.",
  },
  {
    id: "consequence",
    label: "Decisions here are irreversible.",
    hint: "Cash and morale move the moment you commit.",
  },
  {
    id: "hidden",
    label: "Hidden variables stay sealed until resolution.",
    hint: "You won't see every variable while deciding.",
  },
  {
    id: "report",
    label: "I want a Decision Intelligence Report.",
    hint: "Scored across seven cognitive dimensions.",
  },
];

/** Phase 1 of /play/[slug]: rules and consent only -- no narrative framing here on purpose,
 *  that's reserved for NewspaperStory once this gate is cleared.
 *
 *  Fits one viewport by construction (h-dvh, no page scroll): the panel is the tall element, so
 *  it -- not the page -- carries `overflow-y-auto` as a safety valve for unusually short windows.
 *  Everything is sized to not need that valve on a normal desktop. */
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
    <div className="relative h-dvh overflow-hidden bg-void">
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <Container className="relative z-10 flex h-full flex-col justify-center">
        <div className="grid items-center gap-6 lg:grid-cols-[0.8fr_1.1fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="hidden flex-col items-center lg:flex"
          >
            <TimerDial minutes={scenario.minutes} size={128} />
            <p className="mt-3 max-w-[13rem] text-center text-[13px] leading-snug text-dim">
              One sitting. No pause. The quarter runs once you enter.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
            className="ring-grad panel max-h-[92dvh] overflow-y-auto rounded-[1.5rem] p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Pill accent="emerald" solid>
                Live
              </Pill>
              <Pill accent="teal">{scenario.company.stage}</Pill>
              <Pill accent="teal">{scenario.quarterLabel}</Pill>
              <div className="ml-auto flex items-center gap-2 lg:hidden">
                <TimerDial minutes={scenario.minutes} size={40} />
              </div>
            </div>

            <h1 className="display mt-3 text-[clamp(1.4rem,2.6vw,1.9rem)] leading-[1.08] text-ink">
              {scenario.name}
            </h1>

            <ul className="mt-3 space-y-1">
              {RULES.map((rule, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 + i * 0.04, ease: easeOut }}
                  className="flex items-start gap-2 text-[12.5px] leading-snug text-dim"
                >
                  <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-teal" />
                  {rule(scenario)}
                </motion.li>
              ))}
            </ul>

            <div className="mt-3 space-y-1.5 border-t border-line pt-3">
              <p className="eyebrow text-faint">Before you start</p>
              {ACCEPTS.map((item, i) => {
                const on = !!checked[item.id];
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.24 + i * 0.05 }}
                    onClick={() =>
                      setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className="flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-300"
                    style={{
                      borderColor: on
                        ? "color-mix(in srgb, var(--violet) 50%, transparent)"
                        : "var(--line)",
                      background: on
                        ? "color-mix(in srgb, var(--violet) 10%, transparent)"
                        : "var(--panel)",
                    }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all"
                      style={{
                        borderColor: on ? "transparent" : "var(--line-2)",
                        background: on ? "var(--grad-primary)" : "transparent",
                        color: on ? "#fff" : "transparent",
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
                      <span className="text-[13px] font-medium text-ink">
                        {item.label}
                      </span>
                      <span className="text-[11px] leading-snug text-faint">
                        {item.hint}
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Action onClick={onEnter} disabled={!ready}>
                Start
                <ArrowRight className="h-4 w-4" />
              </Action>
              <p className="text-[12px] text-faint">
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
