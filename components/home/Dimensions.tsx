"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { duration, easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Container, Panel, SectionHead } from "@/components/ui/Kit";

type Dimension = {
  name: string;
  blurb: string;
  score: number;
};

/* Seven axes, matching the seven CEO-score traits the engine returns and the "seven
   dimensions" claim the rest of the product makes (layout metadata, Simulations, the
   play entry gate). This list shipped with six, so the heading above it was wrong.
   Resource Allocation is the missing one: it is what the 22 spend lines a quarter test. */
const dimensions: Dimension[] = [
  { name: "Strategic Thinking", blurb: "See three moves ahead in fog.", score: 78 },
  { name: "Business Judgment", blurb: "Trade-offs you can defend in a board meeting.", score: 84 },
  { name: "Risk Management", blurb: "Spot the downside before it spots you.", score: 69 },
  { name: "Resource Allocation", blurb: "Put the money where the quarter is won.", score: 81 },
  { name: "Adaptability", blurb: "Re-plan in the time it took to plan.", score: 88 },
  { name: "Leadership", blurb: "Decide when there is no good option.", score: 74 },
  { name: "Decision Under Uncertainty", blurb: "Bet right when nobody knows.", score: 72 },
];

const SIZE = 340;
const CENTER = SIZE / 2;
const RADIUS = 126;

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
              How scoring works
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          }
        />

        <div className="mt-14 grid items-start gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Panel gradientRing className="flex flex-col items-center p-7 sm:p-9">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="w-full max-w-[360px]"
              role="img"
              aria-label={`A sample profile across seven dimensions, highlighting ${current.name} at ${current.score}`}
            >
              <defs>
                <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.4" />
                  <stop
                    offset="100%"
                    stopColor="var(--teal-bright)"
                    stopOpacity="0.14"
                  />
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
                stroke="var(--teal-bright)"
                strokeWidth={1.5}
                initial={false}
                animate={{ x2: activePoint.x, y2: activePoint.y }}
                transition={{ duration: duration.hover, ease: easeOut }}
              />

              <motion.polygon
                points={polygon}
                fill="url(#radar-fill)"
                stroke="var(--teal)"
                strokeWidth={1.6}
                initial={{ opacity: 0, scale: 0.82 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: duration.explain, ease: easeOut }}
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
                        fill="var(--teal-bright)"
                        opacity={0.22}
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 5.5 : 3.5}
                      fill={isActive ? "var(--teal-bright)" : "var(--teal)"}
                      className="cursor-pointer"
                      onMouseEnter={() => setActive(i)}
                    />
                  </g>
                );
              })}
            </svg>

            <div className="mt-5 w-full border-t border-line pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="display text-[17px] text-ink">{current.name}</p>
                <span className="num text-[22px] font-semibold text-teal-bright">
                  {current.score}
                </span>
              </div>
              <p className="mt-1.5 text-[13.5px] text-dim">{current.blurb}</p>
            </div>
          </Panel>

          {/* A ruled list, not seven bordered cards. The cards were identical boxes whose
              only differing element was a decorative 01–07 counter; every row now carries
              its own score bar, so the column reads as a profile instead of a menu. */}
          <div>
            <ul className="divide-y divide-line border-y border-line">
              {dimensions.map((d, i) => {
                const isActive = i === active;
                return (
                  <li key={d.name}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-pressed={isActive}
                      className={cn(
                        "w-full px-4 py-4 text-left transition-colors duration-200 ease-out",
                        isActive ? "bg-teal/[0.07]" : "bg-transparent",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-5">
                        <p
                          className={cn(
                            "text-[15.5px] font-medium transition-colors duration-200 ease-out",
                            isActive ? "text-ink" : "text-dim",
                          )}
                        >
                          {d.name}
                        </p>
                        <span
                          className={cn(
                            "num shrink-0 text-[13px] tabular-nums transition-colors duration-200 ease-out",
                            isActive ? "text-teal-bright" : "text-faint",
                          )}
                        >
                          {d.score}
                        </span>
                      </div>
                      <p className="mt-1 text-[13.5px] text-faint">{d.blurb}</p>
                      <span
                        aria-hidden
                        className="mt-3 block h-px w-full bg-[var(--line)]"
                      >
                        <motion.span
                          className="block h-px origin-left"
                          style={{
                            background: isActive
                              ? "var(--teal-bright)"
                              : "var(--teal)",
                            opacity: isActive ? 1 : 0.45,
                          }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: d.score / 100 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{
                            duration: duration.panel,
                            delay: i * 0.05,
                            ease: easeOut,
                          }}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-6 rounded-2xl border border-line bg-[var(--panel)] px-6 py-5">
              <div className="max-w-xs">
                <p className="display text-[18px] text-ink">DI Score™</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-dim">
                  One composite percentile across all seven, comparable between
                  cohorts and readable by a recruiter in ten seconds.
                </p>
              </div>
              <div>
                <p className="num text-[42px] leading-none text-teal-bright">78</p>
                <p className="eyebrow mt-2 text-faint">Composite percentile</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
