"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";

const lines = [
  { tone: "sys", text: "myelin — judgment session" },
  { tone: "dim", text: "Brief: identify the company most likely to define its category." },
  { tone: "dim", text: "Visible: market leaders, press cycles, late-stage funding." },
  { tone: "mid", text: "Hidden: silent failures, survivor gaps, unasked questions." },
  { tone: "ok", text: "Signal unlocked — reasoning earned access to buried evidence." },
];

export function JudgmentTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    setN(1);
  }, [inView]);

  useEffect(() => {
    if (!inView || n === 0 || n >= lines.length) return;
    const id = window.setTimeout(() => setN((v) => v + 1), 900);
    return () => window.clearTimeout(id);
  }, [inView, n]);

  return (
    <section className="relative overflow-hidden bg-bg-soft py-28 sm:py-36">
      <InkWash />
      <Container className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <MaskReveal>
              <SectionLabel>Interface</SectionLabel>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl">
                <WordReveal text="A terminal for judgment." as="span" />
              </h2>
            </MaskReveal>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Evidence reveals itself only as reasoning earns it — the way an
              analyst actually works.
            </p>
            <button
              type="button"
              onClick={() => setN(1)}
              className="mt-6 text-sm font-medium text-brand-deep hover:text-brand"
            >
              Replay sequence
            </button>
          </div>

          <div
            ref={ref}
            className="overflow-hidden rounded-[1.75rem] border border-border bg-brand-deep shadow-[0_40px_100px_-55px_rgba(27,61,58,0.5)]"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-white/25" />
              <span className="h-2 w-2 rounded-full bg-white/25" />
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="ml-2 text-[11px] text-white/45">evidence stream</span>
            </div>
            <div className="min-h-[260px] space-y-3 p-5 font-mono text-[13px] sm:p-7">
              {lines.slice(0, n).map((line) => (
                <motion.p
                  key={line.text}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={
                    line.tone === "ok"
                      ? "text-brand-bright"
                      : line.tone === "sys"
                        ? "text-white"
                        : "text-white/55"
                  }
                >
                  {line.tone === "sys" ? "› " : "  "}
                  {line.text}
                </motion.p>
              ))}
              {n > 0 && n < lines.length && (
                <span className="inline-block h-4 w-[2px] animate-pulse bg-brand" />
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
