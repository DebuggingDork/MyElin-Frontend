"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Play } from "lucide-react";
import { easeOut } from "@/lib/media";
import { Masthead } from "@/components/layout/PageChrome";
import { Action, Container, Panel, Pill } from "@/components/ui/Kit";
import { useSimulationHref } from "@/components/play/entry";

/** Placeholder for `/pricing`. The plan tables were pulled before launch — the route stays
 *  alive so the footer, the simulations CTA and any shared links land somewhere honest
 *  instead of a 404. Restore the tiered version from git history when pricing is set. */
export function PricingComingSoon() {
  const simulationHref = useSimulationHref();

  return (
    <section className="relative flex min-h-[calc(100svh-68px)] flex-col pt-[68px]">
      <div className="grid-lines absolute inset-0" />
      <Masthead section="Pricing" status="Plans in progress" />

      <Container wide className="relative z-10 flex flex-1 flex-col justify-center py-[clamp(3rem,8vh,6rem)]">
        <h1 className="ledger-display rise max-w-3xl text-balance text-[clamp(2.4rem,5.4vw,4.2rem)] text-ink">
          Pricing is <span className="italic text-teal">coming soon.</span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
          className="mt-7 max-w-xl text-[16.5px] leading-[1.72] text-dim"
        >
          We&apos;re still shaping the plans for students, institutions, and
          employers. While we do, the live case is open to everyone — create an
          account and run it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Action href="/signup" size="lg">
            Create your account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Action>
          <Action href={simulationHref} variant="outline" size="lg">
            <Play className="h-4 w-4" />
            Run the live case
          </Action>
        </motion.div>

        <Panel className="mt-14 max-w-2xl p-7 sm:p-8" accent="teal" glow>
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow flex items-center gap-2 text-dim">
              <Clock className="h-3.5 w-3.5 text-teal" />
              Institutions
            </span>
            <Pill accent="indigo">In progress</Pill>
          </div>
          <p className="mt-5 text-[15.5px] leading-[1.7] text-dim">
            Running a cohort, a course, or a hiring funnel on Myelin? Seat
            pricing and cohort analytics are being finalised — tell us what you
            need and we&apos;ll come back with numbers.
          </p>
          <Action href="/#institutions" variant="outline" className="mt-7">
            Talk to us
            <ArrowRight className="h-4 w-4" />
          </Action>
        </Panel>
      </Container>
    </section>
  );
}
