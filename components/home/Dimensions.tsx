"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Container, Panel, SectionHead, accentVar, type Accent } from "@/components/ui/Kit";

type Dimension = {
  name: string;
  blurb: string;
  score: number;
  accent: Accent;
};

/* One cool family across the six axes — a rainbow reads as decoration, not data. */
const dimensions: Dimension[] = [
  { name: "Strategic Thinking", blurb: "See three moves ahead in fog.", score: 78, accent: "violet" },
  { name: "Business Judgment", blurb: "Trade-offs you can defend in a board meeting.", score: 84, accent: "indigo" },
  { name: "Risk Management", blurb: "Spot the downside before it spots you.", score: 69, accent: "cyan" },
  { name: "Adaptability", blurb: "Re-plan in the time it took to plan.", score: 88, accent: "violet" },
  { name: "Leadership", blurb: "Decide when there is no good option.", score: 74, accent: "indigo" },
  { name: "Decision Under Uncertainty", blurb: "Bet right when nobody knows.", score: 72, accent: "cyan" },
];

const SIZE = 340;
const CENTER = SIZE / 2;
const RADIUS = 122;

function pointAt(index: number, value: number) {
  const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
  const r = (value / 100) * RADIUS;
  return {
    x: CENTER + Math.cos(angle) * r,
    y: CENTER + Math.sin(angle) * r,
  };
}

export function Dimensions() {
  const [active, setActive] = useState(0);
  const current = dimensions[active];

  const polygon = dimensions
    .map((d, i) => {
      const p = pointAt(i, d.score);
      return `${p.x},${p.y}`;
    })
    .join(" ");
  const activePoint = pointAt(active, current.score);

  return (
    <section
      id="measure"
      className="relative overflow-hidden border-b border-line bg-void"
    >
      <div className="aurora opacity-60" />
      <Container wide className="relative z-10 section-pad">
        <SectionHead
          index="002"
          kicker="What we measure"
          accent="teal"
          title={
            <>
              Seven <span className="text-grad">cognitive dimensions.</span>
            </>
          }
          action={
            <a
              href="#how"
              className="group inline-flex items-center gap-2 text-[14px] text-dim transition-colors hover:text-ink"
            >
              The science
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          }
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          <Panel gradientRing className="flex flex-col items-center p-7 sm:p-9">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[380px]">
              <defs>
                <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.18" />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75, 1].map((ring) => (
                <polygon
                  key={ring}
                  points={dimensions
                    .map((_, i) => {
                      const p = pointAt(i, ring * 100);
                      return `${p.x},${p.y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="var(--line-2)"
                />
              ))}

              {dimensions.map((d, i) => {
                const outer = pointAt(i, 100);
                return (
                  <line
                    key={`axis-${d.name}`}
                    x1={CENTER}
                    y1={CENTER}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="var(--line-2)"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Highlight only as far as the score, never past the shape. */}
              <motion.line
                x1={CENTER}
                y1={CENTER}
                stroke={accentVar[current.accent]}
                strokeWidth={1.5}
                initial={false}
                animate={{ x2: activePoint.x, y2: activePoint.y }}
                transition={{ duration: 0.35, ease: easeOut }}
              />

              <motion.polygon
                points={polygon}
                fill="url(#radar-fill)"
                stroke="#14b8a6"
                strokeWidth={1.6}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: easeOut }}
                style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
              />

              {dimensions.map((d, i) => {
                const p = pointAt(i, d.score);
                const isActive = i === active;
                return (
                  <g key={`node-${d.name}`}>
                    {isActive && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={11}
                        fill={accentVar[d.accent]}
                        opacity={0.22}
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 5.5 : 3.5}
                      fill={accentVar[d.accent]}
                      className="cursor-pointer"
                      onMouseEnter={() => setActive(i)}
                    />
                  </g>
                );
              })}
            </svg>

            <div className="mt-4 w-full rounded-2xl border border-line bg-white/[0.03] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <p
                  className="display text-[16px]"
                  style={{ color: accentVar[current.accent] }}
                >
                  {current.name}
                </p>
                <span className="num text-[22px] font-semibold text-ink">
                  {current.score}
                </span>
              </div>
              <p className="mt-1.5 text-[13.5px] text-dim">{current.blurb}</p>
            </div>
          </Panel>

          <div className="space-y-2.5">
            {dimensions.map((d, i) => {
              const isActive = i === active;
              return (
                <motion.button
                  key={d.name}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: easeOut }}
                  className="group relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-all duration-300"
                  style={{
                    borderColor: isActive
                      ? `color-mix(in srgb, ${accentVar[d.accent]} 45%, transparent)`
                      : "var(--line)",
                    background: isActive
                      ? `color-mix(in srgb, ${accentVar[d.accent]} 9%, rgba(255,255,255,0.02))`
                      : "rgba(255,255,255,0.02)",
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px] transition-opacity duration-300"
                    style={{
                      background: accentVar[d.accent],
                      opacity: isActive ? 1 : 0,
                    }}
                  />
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[15.5px] font-medium text-ink">{d.name}</p>
                      <p className="mt-1 text-[13.5px] text-dim">{d.blurb}</p>
                    </div>
                    <span
                      className="num shrink-0 text-[15px]"
                      style={{ color: isActive ? accentVar[d.accent] : "var(--faint)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </motion.button>
              );
            })}

            <Panel
              gradientRing
              className="mt-3 overflow-hidden p-0"
              delay={0.12}
            >
              <div
                className="px-6 py-6"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(20,184,166,0.22), rgba(255,255,255,0.06))",
                }}
              >
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="display text-[19px] text-ink">DI Score™</p>
                    <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-dim">
                      A composite percentile across all dimensions. Comparable across
                      cohorts.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="display text-grad text-[46px] leading-none">78</p>
                    <p className="eyebrow mt-2 text-faint">composite</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </Container>
    </section>
  );
}
