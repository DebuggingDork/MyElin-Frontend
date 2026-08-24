"use client";

import { Container } from "@/components/ui/Kit";
import { Action } from "@/components/ui/Kit";

/**
 * The axon-gaps metaphor section: a branded animated SVG showing a nerve signal
 * leaping between myelin segments, with supporting copy about the product name's meaning.
 * Based on the myelin_hero_section_gaps_concept.html design sketch.
 */
export function AxonGaps() {
  return (
    <section
      id="how-it-works"
      className="relative border-b border-line overflow-hidden"
    >
      {/* Background dot grid */}
      <div className="dot-grid absolute inset-0 pointer-events-none" />

      {/* Subtle teal aurora */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 60%, rgba(36,177,177,0.07) 0%, transparent 70%)",
        }}
      />

      <Container className="relative z-10 py-[clamp(4rem,9vw,7rem)]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:items-center">

          {/* ── Left column: copy ─────────────────────────────────── */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 border border-line rounded-full bg-panel">
              <span className="h-1.5 w-1.5 rounded-full bg-teal live-dot" />
              <span className="text-[10.5px] uppercase tracking-[0.22em] text-dim font-semibold">
                You&apos;ve filled every gap
              </span>
            </div>

            <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] text-ink leading-[1.1] text-balance max-w-[16ch] font-semibold" style={{ letterSpacing: '-0.011em' }}>
              Your brain hasn&apos;t stopped being{" "}
              <span className="italic text-teal">brilliant.</span>
            </h2>

            <p className="mt-5 text-[17px] leading-[1.6] text-dim max-w-[38ch]">
              It&apos;s just never been given the chance to be.
            </p>

            <p className="mt-4 text-[15px] leading-[1.7] text-dim max-w-[48ch]">
              Myelin makes a nerve fire faster by leaving parts of it bare. The signal
              doesn&apos;t travel the line — it leaps the gaps. Take away the gaps
              and it slows down. That&apos;s what we build for.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Action href="/play/startup-survival" size="lg">
                Leave a gap today
              </Action>
              <span className="text-sm text-faint font-mono">
                No app. No notifications. 14 minutes.
              </span>
            </div>
          </div>

          {/* ── Right column: animated axon ─────────────────────── */}
          <div className="relative">
            {/* Card frame */}
            <div className="glass-card p-8 sm:p-10">
              {/* Label above */}
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-dim font-semibold mb-6">
                Ranvier&apos;s nodes — action potential propagation
              </p>

              {/* The SVG axon */}
              <svg
                viewBox="0 0 560 72"
                className="w-full h-auto block"
                role="img"
                aria-labelledby="axon-title"
              >
                <title id="axon-title">
                  An axon with five myelin segments separated by four gaps. A pulse
                  leaps from gap to gap in 3.4 seconds.
                </title>

                {/* Baseline nerve fibre */}
                <line
                  x1="0" y1="36" x2="560" y2="36"
                  stroke="rgba(159,179,172,0.3)"
                  strokeWidth="1.5"
                />

                {/* Myelin segments — teal capsules */}
                {[10, 120, 230, 340, 450].map((x) => (
                  <rect
                    key={x}
                    x={x}
                    y={22}
                    width={96}
                    height={28}
                    rx={14}
                    fill="var(--teal-deep)"
                    opacity="0.85"
                  />
                ))}

                {/* Glowing inner fill */}
                {[10, 120, 230, 340, 450].map((x) => (
                  <rect
                    key={"g" + x}
                    x={x + 8}
                    y={26}
                    width={80}
                    height={20}
                    rx={10}
                    fill="var(--teal)"
                    opacity="0.18"
                  />
                ))}

                {/* Gap labels */}
                {[109, 219, 329, 439].map((x) => (
                  <text
                    key={"l" + x}
                    x={x}
                    y={66}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--faint)"
                    letterSpacing="0.1em"
                    fontFamily="monospace"
                    textDecoration="none"
                  >
                    GAP
                  </text>
                ))}

                {/* Leaping dot — the action potential */}
                <circle r="6.5" fill="var(--ember)">
                  <animate
                    attributeName="cx"
                    values="10;106;106;216;216;326;326;436;436;556"
                    dur="3.4s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.4 0 0.6 1;0 0 1 0;0.4 0 0.6 1;0 0 1 0;0.4 0 0.6 1;0 0 1 0;0.4 0 0.6 1;0 0 1 0;0.4 0 0.6 1"
                    keyTimes="0;0.09;0.19;0.28;0.38;0.47;0.57;0.66;0.76;1"
                  />
                  <animate
                    attributeName="cy"
                    values="36;36;36;36;36;36;36;36;36;36"
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;1;0.5;1;0.5;1;0.5;1;0.5;1"
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Glow behind the dot */}
                <circle fill="var(--ember-soft)" opacity="0.25" r="12">
                  <animate
                    attributeName="cx"
                    values="10;106;106;216;216;326;326;436;436;556"
                    dur="3.4s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.4 0 0.6 1;0 0 1 0;0.4 0 0.6 1;0 0 1 0;0.4 0 0.6 1;0 0 1 0;0.4 0 0.6 1;0 0 1 0;0.4 0 0.6 1"
                    keyTimes="0;0.09;0.19;0.28;0.38;0.47;0.57;0.66;0.76;1"
                  />
                  <animate
                    attributeName="cy"
                    values="36;36;36;36;36;36;36;36;36;36"
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>

              {/* Stats row beneath the SVG */}
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
                {[
                  { label: "Conduction velocity", value: "70×", note: "faster with myelin" },
                  { label: "Gaps (Nodes)", value: "4–6", note: "per segment" },
                  { label: "Your signal today", value: "—", note: "build it here" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-mono text-lg text-teal-bright font-bold">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-dim mt-0.5">{s.label}</div>
                    <div className="text-[11px] text-faint mt-0.5 font-mono">{s.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
