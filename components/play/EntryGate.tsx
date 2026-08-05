"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock3 } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Action, Container, Pill } from "@/components/ui/Kit";
import type { Scenario } from "@/lib/play/types";

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

export function EntryGate({
  scenario,
  onEnter,
}: {
  scenario: Scenario;
  onEnter: () => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ready = ACCEPTS.every((item) => checked[item.id]);
  const minutes = scenario.minutes;
  const sweep = (seconds % 60) / 60;
  const circumference = 2 * Math.PI * 54;

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
            <div className="relative">
              <svg width="240" height="240" viewBox="0 0 140 140" className="spin-slow">
                <circle
                  cx="70"
                  cy="70"
                  r="62"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                />
              </svg>

              <svg
                width="240"
                height="240"
                viewBox="0 0 140 140"
                className="absolute inset-0"
              >
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke="url(#clock-grad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="dial"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - sweep)}
                />
                <defs>
                  <linearGradient id="clock-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7c5cff" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Clock3 className="mb-2 h-5 w-5 text-cyan" />
                <p className="display text-grad text-[52px] leading-none">
                  {minutes}
                </p>
                <p className="eyebrow mt-2 text-faint">minutes</p>
              </div>
            </div>

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
              <Pill accent="violet">{scenario.company.stage}</Pill>
              <Pill accent="cyan">{scenario.quarterLabel}</Pill>
            </div>

            <h1 className="display mt-5 text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-ink">
              {scenario.name}
            </h1>
            <p className="mt-3 text-[15.5px] leading-relaxed text-dim">
              {scenario.company.name} · {scenario.company.sector}. You will run{" "}
              {scenario.departments.length} workspaces and commit every discretionary
              rupee before the quarter resolves.
            </p>

            <div className="mt-8 space-y-3">
              {ACCEPTS.map((item, i) => {
                const on = !!checked[item.id];
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
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
                Enter the workspace
                <ArrowRight className="h-4 w-4" />
              </Action>
              <p className="text-[13px] text-faint">
                {ready
                  ? "Clock starts when you enter."
                  : "Accept all four to proceed."}
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
