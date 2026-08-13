"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import {
  ArrowRight,
  Code2,
  Plane,
  Plus,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import {
  Container,
  Panel,
  SectionHead,
  accentVar,
  type Accent,
} from "@/components/ui/Kit";

/* Three professions that already have a practice surface, then the one that does not.
   The first three are deliberately unaccented: the whole argument of the block is
   "them, then us", and giving each row its own colour flattened that into a legend. */
const practice = [
  { who: "Engineers", where: "LeetCode", icon: Code2 },
  { who: "Doctors", where: "Rounds", icon: Stethoscope },
  { who: "Pilots", where: "Simulators", icon: Plane },
  { who: "Operators", where: "Myelin", icon: Sparkles },
];

type Link = {
  id: string;
  at: string;
  label: string;
  who: string;
  detail: string;
  weight: number;
  accent: Accent;
};

/* Ember for what a choice costs you, teal for how the system answers back. The ramp is
   the point: the first three links are money and people, the last two are the market and
   the board, and the colour change is what makes that legible without a legend. */
const chain: Link[] = [
  {
    id: "cash",
    at: "M+1",
    label: "Cash burns",
    who: "Finance",
    detail:
      "Runway shortens from 5.8 months to 4.7. The next raise just moved closer than the proof you needed.",
    weight: 82,
    accent: "ember",
  },
  {
    id: "morale",
    at: "M+1",
    label: "Morale shifts",
    who: "The team",
    detail:
      "They read the plan before you explain it. Two engineers quietly start answering recruiter mail.",
    weight: 64,
    accent: "ember-soft",
  },
  {
    id: "churn",
    at: "M+2",
    label: "A customer churns",
    who: "Revenue",
    detail:
      "The renewal you postponed comes due, and support never got the tooling you traded away.",
    weight: 71,
    accent: "ember",
  },
  {
    id: "competitor",
    at: "M+4",
    label: "A competitor pounces",
    who: "The market",
    detail:
      "The lane you left open is the lane they take, priced 40% under list and aimed at your softest accounts.",
    weight: 58,
    accent: "teal",
  },
  {
    id: "board",
    at: "M+6",
    label: "A board member calls",
    who: "Governance",
    detail:
      "Now you defend a month-one trade-off with month-six evidence. This is the conversation being scored.",
    weight: 90,
    accent: "cyan",
  },
];

export function Why() {
  return (
    <section id="why" className="relative overflow-hidden border-b border-line bg-base">
      <div className="dot-grid absolute inset-0" />
      <Container wide className="relative z-10 section-pad">
        <SectionHead
          title={
            <>
              <span className="text-grad-iris">LeetCode</span> for judgment.
            </>
          }
          copy={
            <p>
              Every serious profession has somewhere to practise badly before it
              matters. Judgment under uncertainty, the skill every one of those
              professions is actually hiring for, is still taught with case
              studies and slide decks. Myelin is the room where you get to be
              wrong first.
            </p>
          }
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <div className="space-y-3">
            {practice.map((item, i) => {
              const Icon = item.icon;
              const isMyelin = item.where === "Myelin";
              return (
                <motion.div
                  key={item.who}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.09, ease: easeOut }}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border px-5 py-4",
                    isMyelin
                      ? "border-teal/45 bg-teal/[0.12]"
                      : "border-line bg-[var(--panel)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                      isMyelin
                        ? "border-teal/40 bg-teal/[0.14] text-teal-bright"
                        : "border-line text-faint",
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <span className="text-[15px] text-dim">{item.who}</span>
                    <span className="flex items-center gap-2">
                      <span className="h-px w-8 bg-line-2 sm:w-14" />
                      <span
                        className={cn(
                          "display text-[16px]",
                          isMyelin ? "text-teal-bright" : "text-dim",
                        )}
                      >
                        {item.where}
                      </span>
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* This slot held "Simulations run: 0" and "Reports issued: 0". Two animated
                zeroes are worse than no counter at all -- they read as a product nobody
                has used yet. The claim underneath them is the thing that was doing the
                persuading anyway. */}
            <p className="display pt-6 text-[clamp(1.15rem,2vw,1.5rem)] leading-[1.35] text-ink">
              Judgment is the last professional skill still taught by anecdote.
            </p>
          </div>

          <Panel gradientRing className="p-6 sm:p-8" delay={0.12}>
            <ConsequenceChain />
          </Panel>
        </div>
      </Container>
    </section>
  );
}

/**
 * One choice, then its consequences — revealed link by link as the section
 * scrolls, and expandable on click. Replaces the old ripple diagram, whose
 * labels collided with each other.
 */
function ConsequenceChain() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "end 0.55"],
  });
  const [reached, setReached] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.max(
      0,
      Math.min(chain.length, Math.ceil(v * (chain.length + 0.35))),
    );
    setReached((prev) => (prev === next ? prev : next));
  });

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="eyebrow text-faint">One choice, six months of weather</p>
        <p className="num text-[11px] text-faint">
          {reached}/{chain.length} matured
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-teal/25 bg-teal/[0.08] px-4 py-3.5">
        <span className="num text-[11px] text-faint">M+0</span>
        <span className="h-px flex-1 bg-teal/40" />
        <span className="text-[13.5px] font-medium text-ink">
          You fund growth over runway
        </span>
      </div>

      <div className="relative mt-2">
        <span
          aria-hidden
          className="absolute bottom-6 left-[57px] top-0 w-px bg-[var(--line-2)]"
        />
        <motion.span
          aria-hidden
          className="absolute bottom-6 left-[57px] top-0 w-px origin-top"
          style={{
            scaleY: scrollYProgress,
            background:
              "linear-gradient(180deg, var(--ember), var(--teal-bright))",
            boxShadow: "0 0 12px var(--teal)",
          }}
        />

        {chain.map((link, i) => {
          const lit = i < reached;
          const isOpen = open === link.id;
          const color = accentVar[link.accent];

          return (
            <div
              key={link.id}
              className="grid grid-cols-[44px_26px_1fr] items-start"
            >
              <span
                className="num pt-[22px] text-[11px] transition-colors duration-500"
                style={{ color: lit ? color : "var(--faint)" }}
              >
                {link.at}
              </span>

              <span className="flex justify-center pt-[22px]">
                <motion.span
                  className="h-2.5 w-2.5 rounded-full"
                  initial={false}
                  animate={{
                    scale: lit ? 1 : 0.55,
                    backgroundColor: lit ? color : "var(--faint)",
                    boxShadow: lit ? `0 0 12px ${color}` : "0 0 0 transparent",
                  }}
                  transition={{ duration: 0.45, ease: easeOut }}
                />
              </span>

              <motion.button
                type="button"
                onClick={() => setOpen(isOpen ? null : link.id)}
                aria-expanded={isOpen}
                initial={false}
                animate={{
                  opacity: lit ? 1 : 0.32,
                  x: lit ? 0 : -10,
                  filter: lit ? "blur(0px)" : "blur(2px)",
                }}
                transition={{ duration: 0.5, ease: easeOut }}
                className="mb-2 w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-colors duration-300"
                style={{
                  borderColor: isOpen
                    ? `color-mix(in srgb, ${color} 45%, transparent)`
                    : "var(--line)",
                  background: isOpen
                    ? `color-mix(in srgb, ${color} 10%, var(--panel))`
                    : "var(--panel)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-ink">
                      {link.label}
                    </span>
                    <span className="eyebrow mt-1 block text-faint">
                      {link.who}
                    </span>
                  </span>

                  <span aria-hidden className="flex shrink-0 items-end gap-[3px]">
                    {Array.from({ length: 7 }).map((_, j) => {
                      const on = lit && j < Math.round((link.weight / 100) * 7);
                      return (
                        <motion.span
                          key={j}
                          className="w-[3px] rounded-[1px]"
                          initial={false}
                          animate={{
                            height: on ? 6 + j * 2.2 : 4,
                            opacity: on ? 1 : 0.2,
                          }}
                          transition={{
                            duration: 0.4,
                            delay: on ? j * 0.03 : 0,
                            ease: easeOut,
                          }}
                          style={{ background: on ? color : "var(--faint)" }}
                        />
                      );
                    })}
                  </span>

                  <motion.span
                    className="flex shrink-0"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                  >
                    <Plus
                      className="h-3.5 w-3.5"
                      style={{ color: isOpen ? color : "var(--faint)" }}
                    />
                  </motion.span>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: easeOut }}
                      className="overflow-hidden text-[13px] leading-relaxed text-dim"
                    >
                      <span className="mt-3 block border-t border-line pt-3">
                        {link.detail}
                      </span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[13px] text-dim">
        <span>
          {reached < chain.length
            ? "Keep scrolling — consequences mature on their own clock"
            : "Open any link to see what it costs you"}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-cyan" />
      </div>
    </div>
  );
}
