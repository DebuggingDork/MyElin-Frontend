"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container, Action } from "@/components/ui/Kit";
import { easeOut, duration } from "@/lib/media";

const scenario = {
  context: "Turn 6 of 24 · you are the CEO",
  cashWarning: "11 weeks of cash",
  body: "Your lead engineer just resigned. Your biggest customer is renewing in nine days and asked for her by name. Your co-founder wants to counter-offer at any price.",
  options: [
    { key: "a", label: "Counter-offer. Protect the renewal." },
    { key: "b", label: "Let her go. Tell the customer today." },
    { key: "c", label: "Say nothing until the renewal closes." },
  ],
  footer: "No correct answer. The world responds either way.",
};

export function DecisionUrgency() {
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleChoose = (key: string) => {
    if (chosen) return;
    setChosen(key);
    setTimeout(() => setRevealed(true), 600);
  };

  return (
    <section id="decision-urgency" className="relative border-b border-line pb-20 pt-16 lg:py-28">
      {/* subtle aurora wash matching hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute left-[30%] top-0 h-[480px] w-[760px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--ember) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Using 'narrow' container if available, or just capping width manually so it matches the HTML skeleton's left-aligned reading column flow */}
      <Container className="relative z-10 mx-auto max-w-3xl">
        <div className="flex flex-col">
          {/* Headline */}
          <h2 className="display mb-[20px] text-[clamp(2.1rem,4vw,3rem)] leading-[1.24] text-ink max-w-[19ch]">
            Your first real decision shouldn't be your first decision.
          </h2>

          {/* Subhead */}
          <p className="mb-[36px] text-[17px] leading-[1.55] text-dim max-w-[48ch]">
            Pilots get simulators. Surgeons get cadavers. Everyone else learns
            judgment on live consequences — their team's, their customers',
            their patients'. Myelin gives you the reps first.
          </p>

          {/* Scenario Card */}
          <div className="mb-[28px] glass-card overflow-hidden shadow-[0_24px_48px_-28px_rgba(232,132,95,0.12)] border border-line rounded-xl">
            {/* card header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.07em] text-faint">
                {scenario.context}
              </span>
              <span
                className="rounded text-[12px] font-medium px-2.5 py-1"
                style={{
                  background: "rgba(232,132,95,0.12)",
                  color: "var(--ember-soft)",
                }}
              >
                {scenario.cashWarning}
              </span>
            </div>

            {/* scenario body */}
            <div className="px-5 pt-5 pb-4">
              <p className="text-[15px] leading-[1.6] text-ink">
                {scenario.body}
              </p>
            </div>

            {/* choices */}
            <div className="flex flex-col gap-2 px-5 pb-5">
              {scenario.options.map((opt) => {
                const isChosen = chosen === opt.key;
                const isOther = chosen && chosen !== opt.key;
                return (
                  <motion.button
                    key={opt.key}
                    type="button"
                    onClick={() => handleChoose(opt.key)}
                    disabled={!!chosen}
                    initial={false}
                    animate={{
                      opacity: isOther ? 0.35 : 1,
                      scale: isChosen ? 1.01 : 1,
                    }}
                    transition={{ duration: duration.hover, ease: easeOut }}
                    className="group relative flex items-center rounded border px-3.5 py-2.5 text-left transition-all duration-200"
                    style={{
                      borderColor: isChosen
                        ? "var(--ember) !important"
                        : "var(--line)",
                      background: isChosen
                        ? "rgba(232,132,95,0.08)"
                        : "transparent",
                      cursor: chosen ? "default" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!chosen) {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "var(--line-2)";
                        (e.currentTarget as HTMLElement).style.background =
                          "var(--panel)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!chosen) {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "var(--line)";
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                      }
                    }}
                  >
                    <span
                      className="text-[14px] leading-snug"
                      style={{
                        color: isChosen ? "var(--text)" : "var(--dim)",
                        fontWeight: isChosen ? 500 : 400,
                      }}
                    >
                      {opt.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* footer / reveal */}
            <AnimatePresence mode="wait">
              {!chosen ? (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-5 pb-4 pt-0"
                >
                  <p className="text-[12px] text-faint">{scenario.footer}</p>
                </motion.div>
              ) : revealed ? (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.panel, ease: easeOut }}
                  className="border-t border-line bg-panel px-5 py-4"
                >
                  <p className="text-[12px] font-medium text-ember-soft">
                    The world responds.
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-dim">
                    The customer calls Monday. Your board asks why they weren't
                    told sooner. Your remaining engineers watch to see what
                    happens next.
                  </p>
                  <button
                    type="button"
                    className="mt-3 text-[12px] text-teal underline underline-offset-2"
                    onClick={() => {
                      setChosen(null);
                      setRevealed(false);
                    }}
                  >
                    Reset and try another path
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-5 pb-4 pt-0"
                >
                  <p className="text-[12px] text-faint">
                    The quarter is running…
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA Row exactly as in skeleton */}
          <div className="flex flex-wrap items-center gap-4">
            <Action href="/play/startup-survival" size="lg">
              Take the decision
            </Action>
            <span className="text-[13px] text-faint">
              Startup Survival · 25 minutes · no signup
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
