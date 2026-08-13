"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Plus } from "lucide-react";
import { duration, easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Container, accentVar, type Accent } from "@/components/ui/Kit";
import { LedgerHead } from "@/components/home/LedgerHead";

/* Three professions that already have a practice surface, then the one that does not.
   The first three are deliberately unaccented: the argument of the block is "them, then
   us", and giving each row its own colour flattened that into a legend. */
const practice = [
  { who: "Engineers", where: "LeetCode" },
  { who: "Doctors", where: "Rounds" },
  { who: "Pilots", where: "Simulators" },
  { who: "Operators", where: "Myelin" },
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

/* Vermilion for what a choice costs you, teal for how the system answers back. The ramp
   is the point: the first three links are money and people, the last two are the market
   and the board, and the colour change is what makes that legible without a legend. */
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
    <section id="why" className="relative border-b border-line">
      <Container wide className="ledger-section relative z-10">
        <LedgerHead
          title={
            <>
              <span className="text-teal">LeetCode</span> for judgment.
            </>
          }
          deck={
            <>
              <p>
                Every serious profession has somewhere to practise badly before
                it matters. Judgment under uncertainty, the skill every one of
                those professions is actually hiring for, is still taught with
                case studies and slide decks.
              </p>
              <p className="text-ink">Myelin is the room where you get to be wrong first.</p>
            </>
          }
        />

        <div className="mt-16 grid gap-x-16 gap-y-14 lg:grid-cols-[1fr_1.25fr]">
          <div>
            {/* A ruled index, not four cards. Profession on the left, its practice
                surface on the right, leaders between them: the oldest way to set a
                two-column list of facts and still the clearest. */}
            <p className="tick-label border-b border-line pb-3">
              Where the practice happens
            </p>
            <ul>
              {practice.map((item, i) => {
                const isMyelin = item.where === "Myelin";
                return (
                  <motion.li
                    key={item.who}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: duration.reveal,
                      delay: i * 0.07,
                      ease: easeOut,
                    }}
                    className={cn(
                      "flex items-baseline gap-4 border-b border-line py-4",
                      isMyelin && "bg-teal/[0.07]",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[15px]",
                        isMyelin ? "text-ink" : "text-dim",
                      )}
                    >
                      {item.who}
                    </span>
                    <span
                      aria-hidden
                      className="h-px flex-1 translate-y-[-3px] bg-line"
                    />
                    <span
                      className={cn(
                        "ledger-display text-[19px]",
                        isMyelin ? "text-teal" : "text-dim",
                      )}
                    >
                      {item.where}
                    </span>
                  </motion.li>
                );
              })}
            </ul>

            {/* This slot held "Simulations run: 0" and "Reports issued: 0". Two animated
                zeroes read as a product nobody has used; the claim underneath them was
                doing the persuading anyway. */}
            <p className="ledger-display mt-10 text-[clamp(1.4rem,2.4vw,2rem)] text-ink">
              Judgment is the last professional skill still taught by anecdote.
            </p>
          </div>

          <ConsequenceChain />
        </div>
      </Container>
    </section>
  );
}

/**
 * One choice, then its consequences: revealed link by link as the section scrolls, and
 * expandable on click. The vertical rule doubles as a scroll-progress meter, running
 * vermilion at the near end and teal at the far one.
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
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
        <p className="tick-label">One choice, six months of weather</p>
        <p className="num text-[11px] text-faint">
          {reached}/{chain.length} matured
        </p>
      </div>

      <div className="flex items-center gap-4 border-b border-line bg-teal/[0.07] px-1 py-4">
        <span className="num shrink-0 text-[11px] text-teal">M+0</span>
        <span className="text-[14.5px] font-medium text-ink">
          You fund growth over runway
        </span>
      </div>

      <div className="relative">
        <span
          aria-hidden
          className="absolute bottom-0 left-[46px] top-0 w-px bg-line"
        />
        <motion.span
          aria-hidden
          className="absolute bottom-0 left-[46px] top-0 w-px origin-top"
          style={{
            scaleY: scrollYProgress,
            background: "linear-gradient(180deg, var(--ember), var(--teal))",
          }}
        />

        {chain.map((link, i) => {
          const lit = i < reached;
          const isOpen = open === link.id;
          const color = accentVar[link.accent];

          return (
            <div key={link.id} className="grid grid-cols-[38px_17px_1fr] items-start">
              <span
                className="num pt-[19px] text-[11px] transition-colors duration-500"
                style={{ color: lit ? color : "var(--faint)" }}
              >
                {link.at}
              </span>

              <span className="flex justify-center pt-[21px]">
                <motion.span
                  className="h-[7px] w-[7px]"
                  initial={false}
                  animate={{
                    scale: lit ? 1 : 0.6,
                    backgroundColor: lit ? color : "var(--faint)",
                  }}
                  transition={{ duration: duration.reveal, ease: easeOut }}
                />
              </span>

              <motion.button
                type="button"
                onClick={() => setOpen(isOpen ? null : link.id)}
                aria-expanded={isOpen}
                initial={false}
                animate={{ opacity: lit ? 1 : 0.34 }}
                transition={{ duration: duration.panel, ease: easeOut }}
                className={cn(
                  "w-full overflow-hidden border-b border-line py-3 pl-4 pr-1 text-left",
                  "transition-colors duration-300 ease-out",
                  isOpen ? "bg-[var(--panel-2)]" : "bg-transparent",
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-ink">
                      {link.label}
                    </span>
                    <span className="tick-label mt-1.5 block">{link.who}</span>
                  </span>

                  {/* Severity as a bar chart of seven ticks, so the five links can be
                      compared at a glance rather than each asserting its own weight. */}
                  <span aria-hidden className="flex shrink-0 items-end gap-[3px]">
                    {Array.from({ length: 7 }).map((_, j) => {
                      const on = lit && j < Math.round((link.weight / 100) * 7);
                      return (
                        <motion.span
                          key={j}
                          className="w-[3px]"
                          initial={false}
                          animate={{
                            height: on ? 5 + j * 2.4 : 3,
                            opacity: on ? 1 : 0.25,
                          }}
                          transition={{
                            duration: duration.reveal,
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
                    transition={{ duration: duration.hover, ease: easeOut }}
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
                      transition={{ duration: duration.hover, ease: easeOut }}
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

      <p className="tick-label mt-4">
        {reached < chain.length
          ? "Keep scrolling · consequences mature on their own clock"
          : "Open any link to see what it costs you"}
      </p>
    </div>
  );
}
