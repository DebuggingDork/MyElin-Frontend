"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { duration, easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Kit";
import { LedgerHead } from "@/components/home/LedgerHead";

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

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 124;

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
    <section id="measure" className="relative border-b border-line">
      <Container wide className="ledger-section relative z-10">
        <LedgerHead
          title={
            <>
              Seven <span className="text-teal">cognitive dimensions.</span>
            </>
          }
          deck={
            <p>
              One run produces one profile. The shape is what a recruiter or a
              dean reads: not whether you won, but which kinds of decision you
              are reliably good at and which ones cost you.
            </p>
          }
          action={
            <a
              href="#how"
              className="group inline-flex items-center gap-2 border-b border-line pb-1 text-[14px] text-ink transition-colors hover:border-teal hover:text-teal"
            >
              How scoring works
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          }
        />

        <div className="mt-16 grid items-start gap-x-16 gap-y-12 lg:grid-cols-[auto_1fr]">
          {/* The plot, unframed. A radar is already a bounded shape; putting it inside a
              bordered card draws a second boundary around the first. */}
          <div className="lg:w-[22rem]">
            <p className="tick-label border-b border-line pb-3">
              Sample profile · S-25
            </p>
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="mt-6 w-full max-w-[22rem]"
              role="img"
              aria-label={`A sample profile across seven dimensions, highlighting ${current.name} at ${current.score}`}
            >
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
                  stroke="var(--line)"
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
                    stroke="var(--line)"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Highlight only as far as the score, never past the shape. */}
              <motion.line
                x1={CENTER}
                y1={CENTER}
                stroke="var(--teal)"
                strokeWidth={1.5}
                initial={false}
                animate={{ x2: activePoint.x, y2: activePoint.y }}
                transition={{ duration: duration.hover, ease: easeOut }}
              />

              <motion.polygon
                points={polygon}
                fill="var(--teal)"
                fillOpacity={0.16}
                stroke="var(--teal)"
                strokeWidth={1.5}
                initial={{ opacity: 0, scale: 0.84 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: duration.explain, ease: easeOut }}
                style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
              />

              {dimensions.map((d, i) => {
                const p = pointAt(i, d.score);
                const isActive = i === active;
                return (
                  <rect
                    key={`node-${d.name}`}
                    x={p.x - (isActive ? 4.5 : 2.5)}
                    y={p.y - (isActive ? 4.5 : 2.5)}
                    width={isActive ? 9 : 5}
                    height={isActive ? 9 : 5}
                    fill={isActive ? "var(--ember)" : "var(--teal)"}
                    className="cursor-pointer"
                    onMouseEnter={() => setActive(i)}
                  />
                );
              })}
            </svg>

            <div className="mt-6 border-t border-line pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="ledger-display text-[19px] text-ink">
                  {current.name}
                </p>
                <span className="num text-[24px] text-ember">
                  {current.score}
                </span>
              </div>
              <p className="mt-2 text-[13.5px] text-dim">{current.blurb}</p>
            </div>
          </div>

          {/* A scored table, not seven cards. The cards were identical boxes whose only
              differing element was a decorative 01-07 counter; every row now carries its
              own bar, so the column reads as a profile instead of a menu. */}
          <div>
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <p className="tick-label">Dimension</p>
              <p className="tick-label">Percentile</p>
            </div>

            <ul>
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
                        "w-full border-b border-line px-1 py-4 text-left",
                        "transition-colors duration-200 ease-out",
                        isActive ? "bg-teal/[0.07]" : "bg-transparent",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-5">
                        <p
                          className={cn(
                            "text-[15.5px] transition-colors duration-200 ease-out",
                            isActive ? "text-ink" : "text-dim",
                          )}
                        >
                          {d.name}
                        </p>
                        <span
                          className={cn(
                            "num shrink-0 text-[14px] tabular-nums transition-colors duration-200 ease-out",
                            isActive ? "text-ember" : "text-faint",
                          )}
                        >
                          {d.score}
                        </span>
                      </div>

                      <span
                        aria-hidden
                        className="mt-3 block h-[3px] w-full bg-[var(--panel-2)]"
                      >
                        <motion.span
                          className="block h-[3px] origin-left"
                          style={{
                            background: isActive
                              ? "var(--ember)"
                              : "var(--teal)",
                            opacity: isActive ? 1 : 0.55,
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

            <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t-2 border-line pt-5">
              <div className="max-w-sm">
                <p className="ledger-display text-[22px] text-ink">DI Score™</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-dim">
                  One composite percentile across all seven, comparable between
                  cohorts and readable in ten seconds.
                </p>
              </div>
              <div className="text-right">
                <p className="num text-[clamp(2.6rem,5vw,3.6rem)] leading-none text-teal">
                  78
                </p>
                <p className="tick-label mt-3">Composite percentile</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
