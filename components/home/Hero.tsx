"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Action, Container, Eyebrow, accentVar, type Accent } from "@/components/ui/Kit";

/** Kept honest against the shipped engine: the scenario runs 4 quarters (config/scenarios,
 *  total_quarters: 4) over 22 spend lines per quarter (CLAUDE.md's 22-line model), not the
 *  "120+ decisions / 24 months" this previously claimed. */
const stats = [
  { value: "0", label: "Videos to watch" },
  { value: "22", label: "Spend lines a quarter" },
  { value: "7", label: "Cognitive dimensions" },
  { value: "4Q", label: "Compressed into 30 min" },
];

export function Hero() {
  return (
    <section
      id="home"
      className="noise relative overflow-hidden border-b border-line bg-void pt-[68px]"
    >
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />
      <DecisionConstellation />

      <Container
        wide
        className="relative z-10 flex min-h-[78svh] flex-col justify-center py-24 sm:py-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <Eyebrow accent="teal">
            The Decision Intelligence Platform — S-25 Cohort
          </Eyebrow>
        </motion.div>

        {/* The size lives on the h1, not the spans: `max-w-[…ch]` resolves against *this*
            element's font-size, and with it left at the browser default the headline
            collapsed to one word per line. */}
        <h1 className="display mt-8 max-w-[17ch] text-[clamp(2.2rem,4.8vw,4.2rem)] font-medium leading-[1.06] text-ink">
          <motion.span
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: easeOut }}
            className="block"
          >
            The world&apos;s most immersive way to learn
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
            className="text-grad block font-bold"
          >
            how to think.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: easeOut }}
          className="mt-8 max-w-2xl text-[16.5px] leading-[1.72] text-dim"
        >
          Myelin puts you inside real-world situations where there are no right
          answers, no instructions, and no room for passive learning. You make
          decisions, face consequences, and develop the judgment to navigate
          complexity.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: easeOut }}
          className="display mt-6 text-[clamp(1.05rem,2vw,1.35rem)] font-medium italic text-ink"
        >
          Learn by doing. Think by deciding.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.48, ease: easeOut }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Action href="/play/startup-survival" size="lg">
            <Play className="h-4 w-4" />
            Experience Myelin
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Action>
          <Action href="/manifesto" variant="outline" size="lg">
            Read the Blueprint
            <ArrowRight className="h-4 w-4" />
          </Action>
        </motion.div>
      </Container>

      <Container wide className="relative z-10 pb-10 sm:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.56, ease: easeOut }}
          className="flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10"
        >
          <p className="eyebrow max-w-md text-faint">
            No videos. No quizzes. Just judgment.
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-4 sm:justify-end">
            {stats.map((stat) => (
              <div key={stat.label} className="sm:text-right">
                <p className="display text-[19px] leading-none text-ink">
                  {stat.value}
                </p>
                <p className="eyebrow mt-2 text-faint">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

const root = { x: 60, y: 9 };

/** Same axes as the radar in Dimensions.tsx, arranged as branches off one root —
 *  "a decision, and what it touches" — instead of restating them as another panel.
 *  Coordinates are percentages of the hero box, shared by the SVG lines below and
 *  the HTML labels, so the two layers actually line up as one motif. */
const dimensionNodes: {
  name: string;
  accent: Accent;
  x: number;
  y: number;
  duration: number;
  delay: number;
}[] = [
  { name: "Strategic Thinking", accent: "violet", x: 71, y: 15, duration: 10, delay: 0 },
  { name: "Risk Management", accent: "cyan", x: 90, y: 37, duration: 12, delay: 0.8 },
  { name: "Adaptability", accent: "indigo", x: 77, y: 62, duration: 9, delay: 1.6 },
  { name: "Decision Under Uncertainty", accent: "violet", x: 59, y: 80, duration: 13, delay: 0.4 },
];

function branch(x2: number, y2: number) {
  const midX = (root.x + x2) / 2;
  return `M ${root.x} ${root.y} C ${midX} ${root.y}, ${midX} ${y2}, ${x2} ${y2}`;
}

/** Faint branching constellation behind the headline — a decision tree, not a
 *  chart: the same "one choice, many consequences" idea as the ConsequenceChain
 *  in Why.tsx, reduced to pure atmosphere. Lines flow slowly and labels drift to
 *  read as alive without competing with the type sitting above them.
 *
 *  Replaces the earlier pairing of independently-drifting labels and unrelated
 *  branching lines (Phase 2/3) — those two layers didn't share coordinates, so
 *  they read as disconnected noise rather than one motif. This version drives
 *  both the SVG paths and the HTML labels off the same `dimensionNodes` data so
 *  every line visibly terminates at its label. */
function DecisionConstellation() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-[0.55]"
      >
        {dimensionNodes.map((n, i) => (
          <motion.path
            key={n.name}
            d={branch(n.x, n.y)}
            fill="none"
            stroke={accentVar[n.accent]}
            strokeWidth={1}
            strokeDasharray="1 3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -16] }}
            transition={{
              duration: 10 + i * 2,
              repeat: reduceMotion ? 0 : Infinity,
              ease: "linear",
            }}
          />
        ))}
        <circle cx={root.x} cy={root.y} r={0.7} fill="var(--teal)" />
      </svg>

      {dimensionNodes.map((n) => (
        <motion.span
          key={n.name}
          className="eyebrow absolute flex -translate-y-1/2 items-center gap-2 whitespace-nowrap text-dim"
          style={{ top: `${n.y}%`, left: `${n.x}%` }}
          initial={{ opacity: 0, y: 0 }}
          animate={
            reduceMotion
              ? { opacity: 0.55 }
              : { opacity: [0.4, 0.65, 0.4], y: [0, -14, 0] }
          }
          transition={{
            duration: n.duration,
            delay: n.delay,
            repeat: reduceMotion ? 0 : Infinity,
            ease: "easeInOut",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: accentVar[n.accent] }}
          />
          {n.name}
        </motion.span>
      ))}
    </div>
  );
}
